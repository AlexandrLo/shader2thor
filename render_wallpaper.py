#!/usr/bin/env python3
"""
Render a Shadertoy 'Image' shader directly to a two-screen wallpaper:
one full-canvas mp4 plus top/bot crops for the target device.
"""

import os
import subprocess
import sys

import moderngl
import numpy as np

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
    """Render one shader to <out_dir>/<name>.mp4, <name>_top.mp4, <name>_bot.mp4.

    Raises RuntimeError on shader compile failure or ffmpeg failure.
    Returns (full_path, top_path, bot_path) on success.
    """
    os.makedirs(out_dir, exist_ok=True)
    name = os.path.splitext(os.path.basename(shader_path))[0]
    full_path = os.path.join(out_dir, f"{name}.mp4")
    top_path = os.path.join(out_dir, f"{name}_top.mp4")
    bot_path = os.path.join(out_dir, f"{name}_bot.mp4")

    total_frames = int(round(duration * fps))

    try:
        ctx = moderngl.create_context(standalone=True, backend="egl")
    except Exception:
        ctx = moderngl.create_context(standalone=True)

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
        f"[0:v]vflip,split=3[full][s1][s2];"
        f"[s1]crop={TOP_W}:{TOP_H}:0:0[top];"
        f"[s2]crop={BOT_W}:{BOT_H}:(iw-{BOT_W})/2:{TOP_H + GAP}[bot]"
    )

    cmd = [
        "ffmpeg", "-y",
        "-f", "rawvideo", "-pix_fmt", "rgba",
        "-s", f"{CANVAS_W}x{CANVAS_H}", "-r", str(fps),
        "-i", "-",
        "-filter_complex", filter_complex,
        "-map", "[full]", *codec, "-pix_fmt", "yuv420p", "-movflags", "+faststart", full_path,
        "-map", "[top]", *codec, "-pix_fmt", "yuv420p", "-movflags", "+faststart", top_path,
        "-map", "[bot]", *codec, "-pix_fmt", "yuv420p", "-movflags", "+faststart", bot_path,
    ]
    ff = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)

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
            ff.stdin.write(fbo.read(components=4))

            if frame % fps == 0:
                pct = 100.0 * frame / total_frames
                print(f"\r  {name}: {frame}/{total_frames} ({pct:.0f}%)", end="", flush=True)
    finally:
        ff.stdin.close()
        stderr_output = ff.stderr.read()
        ff.wait()

    print()
    if ff.returncode != 0:
        raise RuntimeError(f"ffmpeg failed for {name}:\n{stderr_output.decode(errors='ignore')}")

    return full_path, top_path, bot_path


if __name__ == "__main__":
    # Temporary smoke-test entry point; replaced with the full argparse CLI in Task 2.
    render_shader(sys.argv[1], sys.argv[2], duration=3.0, fps=10, crf=16, start=0.0, nvenc=False)
