import os

import render_wallpaper as rw

SHADERS = os.path.join(os.path.dirname(os.path.dirname(__file__)), "shaders")
XMB = os.path.join(SHADERS, "ps", "xmb_psp_new.frag")


def test_render_shader_produces_per_variation_folders(tmp_path):
    jobs = [
        (os.path.join("ps/xmb_psp_new", v), v, {"uTheme": n}, 0.1)
        for v, n in [("blue", 1), ("dark", 7)]
    ]
    rw.render_shader(
        XMB,
        str(tmp_path),
        jobs,
        fps=10,
        crf=30,
        start=0.0,
        nvenc=False,
        top_w=16,
        top_h=16,
        bot_w=16,
        bot_h=16,
        gap=2,
    )
    for v in ("blue", "dark"):
        d = tmp_path / "ps" / "xmb_psp_new" / v
        assert (d / f"{v}_preview.png").exists()
        assert (d / f"{v}_top.mp4").exists()
        assert (d / f"{v}_bottom.mp4").exists()
