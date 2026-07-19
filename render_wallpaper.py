#!/usr/bin/env python3
"""
Render a Shadertoy 'Image' shader directly to a two-screen wallpaper:
a full-canvas preview PNG plus top/bottom crop videos for the target device.
"""

import argparse
import os
import subprocess
import sys
import threading
from shutil import which

import moderngl
import numpy as np
from PIL import Image

# Device geometry (AYN Thor). Edit these constants to target a different device.
TOP_W, TOP_H = 1920, 1080
BOT_W, BOT_H = 1240, 1080
GAP = 82
CANVAS_W, CANVAS_H = TOP_W, TOP_H + GAP + BOT_H  # 1920 x 2242

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
    lines = [l for l in body.splitlines() if not l.strip().startswith("#version")]
    return PREAMBLE + "\n".join(lines) + EPILOGUE


def render_shader(shader_path, out_dir, duration, fps, crf, start, nvenc):
    """Render one shader to <out_dir>/<name>_preview.png, <name>_top.mp4, <name>_bottom.mp4.

    The preview is a single still frame (t = start); the crops are full-length videos.
    Raises RuntimeError on shader compile failure or ffmpeg failure.
    Returns (preview_path, top_path, bot_path) on success.
    """
    os.makedirs(out_dir, exist_ok=True)
    name = os.path.splitext(os.path.basename(shader_path))[0]
    preview_path = os.path.join(out_dir, f"{name}_preview.png")
    top_path = os.path.join(out_dir, f"{name}_top.mp4")
    bot_path = os.path.join(out_dir, f"{name}_bottom.mp4")

    total_frames = int(round(duration * fps))

    try:
        ctx = moderngl.create_context(standalone=True, backend="egl")
    except Exception:
        ctx = moderngl.create_context(standalone=True)

    try:
        try:
            prog = ctx.program(vertex_shader=VERTEX, fragment_shader=build_fragment(shader_path))
        except Exception as e:
            raise RuntimeError(f"shader failed to compile: {e}") from e

        quad = ctx.buffer(np.array([-1, -1, 3, -1, -1, 3], dtype="f4").tobytes())
        vao = ctx.simple_vertex_array(prog, quad, "in_vert")
        fbo = ctx.simple_framebuffer((CANVAS_W, CANVAS_H), components=4)
        fbo.use()

        def setu(uname, value):
            if uname in prog:
                prog[uname].value = value

        codec = ["-c:v", "h264_nvenc", "-preset", "p7", "-cq", str(crf)] if nvenc \
            else ["-c:v", "libx264", "-preset", "slow", "-crf", str(crf)]

        filter_complex = (
            f"[0:v]vflip,split=2[s1][s2];"
            f"[s1]crop={TOP_W}:{TOP_H}:0:0[top];"
            f"[s2]crop={BOT_W}:{BOT_H}:(iw-{BOT_W})/2:{TOP_H + GAP}[bot]"
        )

        cmd = [
            "ffmpeg", "-y",
            "-f", "rawvideo", "-pix_fmt", "rgba",
            "-s", f"{CANVAS_W}x{CANVAS_H}", "-r", str(fps),
            "-i", "-",
            "-filter_complex", filter_complex,
            "-map", "[top]", *codec, "-pix_fmt", "yuv420p", "-movflags", "+faststart", top_path,
            "-map", "[bot]", *codec, "-pix_fmt", "yuv420p", "-movflags", "+faststart", bot_path,
        ]
        ff = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)

        stderr_chunks = []

        def _drain_stderr():
            for line in ff.stderr:
                stderr_chunks.append(line)

        stderr_thread = threading.Thread(target=_drain_stderr, daemon=True)
        stderr_thread.start()

        dt = 1.0 / fps
        try:
            for frame in range(total_frames):
                t = start + frame * dt
                setu("iResolution", (float(CANVAS_W), float(CANVAS_H), 1.0))
                setu("iTime", t)
                setu("iTimeDelta", dt)
                setu("iFrame", frame)
                setu("iMouse", (0.0, 0.0, 0.0, 0.0))
                setu("iDate", (2026.0, 7.0, 19.0, t))

                ctx.clear(0.0, 0.0, 0.0, 1.0)
                vao.render(moderngl.TRIANGLES)
                raw = fbo.read(components=4)

                if frame == 0:
                    img = Image.frombytes("RGBA", (CANVAS_W, CANVAS_H), raw)
                    img.transpose(Image.FLIP_TOP_BOTTOM).convert("RGB").save(preview_path)

                try:
                    ff.stdin.write(raw)
                except BrokenPipeError:
                    break

                if frame % fps == 0:
                    pct = 100.0 * frame / total_frames
                    print(f"\r  {name}: {frame}/{total_frames} ({pct:.0f}%)", end="", flush=True)
        finally:
            try:
                ff.stdin.close()
            except BrokenPipeError:
                pass
            ff.wait()
            stderr_thread.join()

        print()
        if ff.returncode != 0:
            raise RuntimeError(f"ffmpeg failed for {name}:\n{b''.join(stderr_chunks).decode(errors='ignore')}")

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
        rel_parts = parts[parts.index("shaders") + 1:]
    else:
        rel_parts = [parts[-1]]
    return os.path.splitext(os.path.join(*rel_parts))[0]


def main():
    p = argparse.ArgumentParser()
    p.add_argument("input", help=".frag file or directory of .frag files")
    p.add_argument("output_dir", help="root output directory")
    p.add_argument("--duration", type=float, default=20.0, help="seconds")
    p.add_argument("--fps", type=int, default=60)
    p.add_argument("--crf", type=int, default=16, help="lower = better quality")
    p.add_argument("--start", type=float, default=0.0, help="iTime offset at frame 0")
    p.add_argument("--nvenc", action="store_true", help="encode on the GPU instead of x264")
    args = p.parse_args()

    if which("ffmpeg") is None:
        sys.exit("ffmpeg not found on PATH")

    if os.path.isdir(args.input):
        shader_paths = find_frag_files(args.input)
        if not shader_paths:
            sys.exit(f"no .frag files found in {args.input}")
        names = [os.path.splitext(os.path.relpath(p, args.input))[0] for p in shader_paths]
    else:
        shader_paths = [args.input]
        names = [infer_single_file_name(args.input)]

    succeeded = []
    failed = []
    for shader_path, name in zip(shader_paths, names):
        out_dir = os.path.join(args.output_dir, name)
        print(f"Rendering {name}...")
        try:
            render_shader(shader_path, out_dir, args.duration, args.fps,
                          args.crf, args.start, args.nvenc)
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
