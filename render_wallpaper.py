#!/usr/bin/env python3
"""
Render a Shadertoy 'Image' shader directly to a two-screen wallpaper:
a full-canvas preview PNG plus top/bottom crop videos for the target device.
"""

import argparse
import json
import os
import subprocess
import sys
import threading
from shutil import which

import moderngl
import numpy as np
from PIL import Image

DEFAULT_DURATION = 20.0
DEFAULT_FPS = 30
DEFAULT_CRF = 5
DEFAULT_START = 0.0
DEFAULT_TOP = "1920x1080"
DEFAULT_BOTTOM = "1240x1080"
DEFAULT_GAP = 82


def parse_size(s):
    """Parse a 'WxH' string (e.g. '1920x1080') into an (int, int) tuple."""
    try:
        w, h = s.lower().split("x")
        return int(w), int(h)
    except ValueError:
        raise argparse.ArgumentTypeError(
            f"invalid size {s!r}, expected WxH (e.g. 1920x1080)"
        )


LOOPS_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "shaders", "loops.json"
)


def load_loops():
    """Map of shader name -> exact loop period in seconds, from shaders/loops.json."""
    try:
        with open(LOOPS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


VERTEX = """
#version 330
in vec2 in_vert;
void main() { gl_Position = vec4(in_vert, 0.0, 1.0); }
"""

PREAMBLE = """
#version 330
uniform vec3  iResolution;
uniform float iTime;
uniform float iTimeDelta;
uniform int   iFrame;
uniform vec4  iMouse;
uniform vec4  iDate;
#define iGlobalTime iTime
out vec4 _fragColorOut;
"""

EPILOGUE = """
void main() {
    vec4 c = vec4(0.0, 0.0, 0.0, 1.0);
    mainImage(c, gl_FragCoord.xy);
    _fragColorOut = c;
}
"""


def build_fragment(path):
    with open(path, "r", encoding="utf-8") as f:
        body = f.read()
    lines = [ln for ln in body.splitlines() if not ln.strip().startswith("#version")]
    return PREAMBLE + "\n".join(lines) + EPILOGUE


def render_shader(
    shader_path,
    out_dir,
    duration,
    fps,
    crf,
    start,
    nvenc,
    top_w,
    top_h,
    bot_w,
    bot_h,
    gap,
):
    """Render one shader to <out_dir>/<name>_preview.png, <name>_top.mp4, <name>_bottom.mp4.

    The preview is a single still frame (t = start); the crops are full-length videos.
    Raises RuntimeError on shader compile failure or ffmpeg failure.
    Returns (preview_path, top_path, bot_path) on success.
    """
    canvas_w, canvas_h = top_w, top_h + gap + bot_h
    os.makedirs(out_dir, exist_ok=True)
    name = os.path.splitext(os.path.basename(shader_path))[0]
    preview_path = os.path.join(out_dir, f"{name}_preview.png")
    top_path = os.path.join(out_dir, f"{name}_top.mp4")
    bot_path = os.path.join(out_dir, f"{name}_bottom.mp4")

    total_frames = int(round(duration * fps))

    try:
        ctx = moderngl.create_context(standalone=True, backend="egl")  # type: ignore[arg-type]
    except Exception:
        ctx = moderngl.create_context(standalone=True)

    try:
        try:
            prog = ctx.program(
                vertex_shader=VERTEX, fragment_shader=build_fragment(shader_path)
            )
        except Exception as e:
            raise RuntimeError(f"shader failed to compile: {e}") from e

        quad = ctx.buffer(np.array([-1, -1, 3, -1, -1, 3], dtype="f4").tobytes())
        vao = ctx.simple_vertex_array(prog, quad, "in_vert")
        fbo = ctx.simple_framebuffer((canvas_w, canvas_h), components=4)
        fbo.use()

        def setu(uname, value):
            member = prog.get(uname, None)
            if isinstance(member, moderngl.Uniform):
                member.value = value

        codec = (
            ["-c:v", "h264_nvenc", "-preset", "p7", "-cq", str(crf)]
            if nvenc
            else ["-c:v", "libx264", "-preset", "slow", "-crf", str(crf)]
        )

        filter_complex = (
            f"[0:v]vflip,split=2[s1][s2];"
            f"[s1]crop={top_w}:{top_h}:0:0[top];"
            f"[s2]crop={bot_w}:{bot_h}:(iw-{bot_w})/2:{top_h + gap}[bot]"
        )

        cmd = [
            "ffmpeg",
            "-y",
            "-f",
            "rawvideo",
            "-pix_fmt",
            "rgba",
            "-s",
            f"{canvas_w}x{canvas_h}",
            "-r",
            str(fps),
            "-i",
            "-",
            "-filter_complex",
            filter_complex,
            "-map",
            "[top]",
            *codec,
            "-pix_fmt",
            "yuv420p",
            "-movflags",
            "+faststart",
            top_path,
            "-map",
            "[bot]",
            *codec,
            "-pix_fmt",
            "yuv420p",
            "-movflags",
            "+faststart",
            bot_path,
        ]
        ff = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
        assert ff.stdin is not None and ff.stderr is not None
        ff_stdin = ff.stdin
        ff_stderr = ff.stderr

        stderr_chunks = []

        def _drain_stderr():
            for line in ff_stderr:
                stderr_chunks.append(line)

        stderr_thread = threading.Thread(target=_drain_stderr, daemon=True)
        stderr_thread.start()

        dt = 1.0 / fps
        try:
            for frame in range(total_frames):
                t = start + frame * dt
                setu("iResolution", (float(canvas_w), float(canvas_h), 1.0))
                setu("iTime", t)
                setu("iTimeDelta", dt)
                setu("iFrame", frame)
                setu("iMouse", (0.0, 0.0, 0.0, 0.0))
                setu("iDate", (2026.0, 7.0, 19.0, t))

                ctx.clear(0.0, 0.0, 0.0, 1.0)
                vao.render(moderngl.TRIANGLES)
                raw = fbo.read(components=4)

                if frame == 0:
                    img = Image.frombytes("RGBA", (canvas_w, canvas_h), raw)
                    img.transpose(Image.Transpose.FLIP_TOP_BOTTOM).convert("RGB").save(
                        preview_path
                    )

                try:
                    ff_stdin.write(raw)
                except BrokenPipeError:
                    break

                if frame % fps == 0:
                    pct = 100.0 * frame / total_frames
                    print(
                        f"\r  {name}: {frame}/{total_frames} ({pct:.0f}%)",
                        end="",
                        flush=True,
                    )
        finally:
            try:
                ff_stdin.close()
            except BrokenPipeError:
                pass
            ff.wait()
            stderr_thread.join()

        print()
        if ff.returncode != 0:
            raise RuntimeError(
                f"ffmpeg failed for {name}:\n{b''.join(stderr_chunks).decode(errors='ignore')}"
            )

        return preview_path, top_path, bot_path
    finally:
        ctx.release()


def find_frag_files(input_dir):
    paths = []
    for root, _, files in os.walk(input_dir):
        for f in files:
            if f.endswith(".frag"):
                paths.append(os.path.join(root, f))
    return sorted(paths)


def infer_single_file_name(shader_path):
    """Name used for output when a single .frag file (not a directory) is given.

    Preserves subfolders below a 'shaders' root (e.g. shaders/balatro/arcana.frag
    -> balatro/arcana) so single-file and directory runs produce the same layout.
    Falls back to the bare filename when there's no 'shaders' component.
    """
    parts = os.path.normpath(shader_path).split(os.sep)
    if "shaders" in parts:
        rel_parts = parts[parts.index("shaders") + 1 :]
    else:
        rel_parts = [parts[-1]]
    return os.path.splitext(os.path.join(*rel_parts))[0]


def main():
    p = argparse.ArgumentParser()
    p.add_argument("input", help=".frag file or directory of .frag files")
    p.add_argument("output_dir", help="root output directory")
    p.add_argument(
        "--duration",
        type=float,
        default=None,
        help="seconds (default: exact loop length from shaders/loops.json, else "
        f"{DEFAULT_DURATION:g})",
    )
    p.add_argument("--fps", type=int, default=DEFAULT_FPS)
    p.add_argument(
        "--crf", type=int, default=DEFAULT_CRF, help="lower = better quality"
    )
    p.add_argument(
        "--start", type=float, default=DEFAULT_START, help="iTime offset at frame 0"
    )
    p.add_argument(
        "--nvenc", action="store_true", help="encode on the GPU instead of x264"
    )
    p.add_argument(
        "--top",
        type=parse_size,
        default=DEFAULT_TOP,
        help=f"top screen size as WxH (default: {DEFAULT_TOP})",
    )
    p.add_argument(
        "--bottom",
        type=parse_size,
        default=DEFAULT_BOTTOM,
        help=f"bottom screen size as WxH (default: {DEFAULT_BOTTOM})",
    )
    p.add_argument(
        "--gap",
        type=int,
        default=DEFAULT_GAP,
        help=f"vertical gap between screens in px (default: {DEFAULT_GAP})",
    )
    args = p.parse_args()

    top_w, top_h = args.top
    bot_w, bot_h = args.bottom

    if which("ffmpeg") is None:
        sys.exit("ffmpeg not found on PATH")

    if os.path.isdir(args.input):
        shader_paths = find_frag_files(args.input)
        if not shader_paths:
            sys.exit(f"no .frag files found in {args.input}")
        names = [
            os.path.splitext(os.path.relpath(p, args.input))[0] for p in shader_paths
        ]
    else:
        shader_paths = [args.input]
        names = [infer_single_file_name(args.input)]

    loops = load_loops()

    succeeded = []
    failed = []
    for shader_path, name in zip(shader_paths, names):
        out_dir = os.path.join(args.output_dir, name)
        if args.duration is not None:
            duration = args.duration
        else:
            duration = loops.get(name, DEFAULT_DURATION)
        print(f"Rendering {name}... (duration={duration:g}s)")
        try:
            render_shader(
                shader_path,
                out_dir,
                duration,
                args.fps,
                args.crf,
                args.start,
                args.nvenc,
                top_w,
                top_h,
                bot_w,
                bot_h,
                args.gap,
            )
            succeeded.append(name)
        except Exception as e:
            print(f"  FAILED: {e}", file=sys.stderr)
            failed.append(name)

    print(f"\n{len(succeeded)} succeeded, {len(failed)} failed")
    if failed:
        print("Failed: " + ", ".join(failed), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
