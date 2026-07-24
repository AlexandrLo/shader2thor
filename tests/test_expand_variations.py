import render_wallpaper as rw


def test_number_entry_single_job():
    jobs = rw.expand_variations("aurora", 40.0, 20.0)
    assert jobs == [("aurora", "aurora", {}, 40.0)]


def test_missing_entry_uses_default_duration():
    jobs = rw.expand_variations("foo/bar", None, 20.0)
    assert jobs == [("foo/bar", "bar", {}, 20.0)]


def test_object_entry_expands_per_variation():
    entry = {
        "duration": 30.0,
        "variations": {"blue": {"uTheme": 1}, "red": {"uTheme": 2}},
    }
    jobs = rw.expand_variations("ps/xmb", entry, 20.0)
    assert len(jobs) == 2
    assert ("ps/xmb/blue", "blue", {"uTheme": 1}, 30.0) in jobs
    assert ("ps/xmb/red", "red", {"uTheme": 2}, 30.0) in jobs


def test_object_entry_without_duration_uses_default():
    entry = {"variations": {"only": {"uTheme": 1}}}
    jobs = rw.expand_variations("x", entry, 12.5)
    assert jobs == [("x/only", "only", {"uTheme": 1}, 12.5)]
