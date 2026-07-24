import os

import moderngl
import numpy as np

import render_wallpaper as rw

SHADERS = os.path.join(os.path.dirname(os.path.dirname(__file__)), "shaders")
XMB = os.path.join(SHADERS, "ps", "xmb_psp_new.frag")


def _render_frame(shader_path, uniforms, w=32, h=48):
    try:
        ctx = moderngl.create_context(standalone=True, backend="egl")
    except Exception:
        ctx = moderngl.create_context(standalone=True)
    try:
        prog = ctx.program(
            vertex_shader=rw.VERTEX,
            fragment_shader=rw.build_fragment(shader_path),
        )
        quad = ctx.buffer(np.array([-1, -1, 3, -1, -1, 3], dtype="f4").tobytes())
        vao = ctx.simple_vertex_array(prog, quad, "in_vert")
        fbo = ctx.simple_framebuffer((w, h), components=4)
        fbo.use()
        for k, v in uniforms.items():
            rw.setu(prog, k, rw.normalize_uniform_value(v))
        rw.setu(prog, "iResolution", (float(w), float(h), 1.0))
        rw.setu(prog, "iTime", 0.0)
        ctx.clear(0.0, 0.0, 0.0, 1.0)
        vao.render(moderngl.TRIANGLES)
        return fbo.read(components=4)
    finally:
        ctx.release()


def test_xmb_compiles_and_utheme_changes_output():
    # theme 1 has a blue background, theme 7 a black one -> pixels must differ
    blue = _render_frame(XMB, {"uTheme": 1})
    dark = _render_frame(XMB, {"uTheme": 7})
    assert blue != dark
