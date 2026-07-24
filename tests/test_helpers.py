import render_wallpaper


def test_normalize_list_becomes_tuple():
    assert render_wallpaper.normalize_uniform_value([0.85, 0.2, 0.2, 1.0]) == (
        0.85,
        0.2,
        0.2,
        1.0,
    )


def test_normalize_int_passthrough():
    assert render_wallpaper.normalize_uniform_value(3) == 3


def test_normalize_float_passthrough():
    assert render_wallpaper.normalize_uniform_value(2.5) == 2.5
