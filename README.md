# shader2thor

Converts shaders into a two-screen wallpaper videos for Ayn Thor. Render and screen-splitting happen in one step, no manual work in between.

## Requirements

```bash
pip install moderngl numpy Pillow
```

`ffmpeg` must be available on `PATH`.

## Usage

Single shader:

```bash
python render_wallpaper.py shaders/main.frag output --duration 25 --fps 30
```

Whole folder of shaders (batch):

```bash
python render_wallpaper.py shaders output --duration 25 --fps 30
```

The input type (a `.frag` file or a directory) is auto-detected. Flags:

| Flag | Default | Meaning |
|---|---|---|
| `--duration` | see below | Clip length, seconds |
| `--fps` | `60` | Frames per second |
| `--crf` | `16` | Encoding quality (lower = better) |
| `--start` | `0.0` | `iTime` offset at frame 0 |
| `--nvenc` | off | Encode on the GPU (`h264_nvenc`) instead of `libx264` |

Canvas resolution isn't a flag — it's always derived from the device geometry (see below).

Shaders can be organized in subfolders under `shaders/` (e.g. `shaders/balatro/arcana.frag`); batch mode picks them up recursively, and single-file mode preserves the subfolder in the output path (`output/balatro/arcana/`).

## Loop durations

`shaders/loops.json` maps a shader name to its exact loop period in seconds:

```json
{ "aurora": 40.0, "pew": 6.283185307179586 }
```

When `--duration` isn't passed, a shader listed there renders for exactly that long (so the clip loops seamlessly); anything not listed falls back to 20 seconds. Passing `--duration` explicitly overrides this for every shader in the run.

## Output

Each shader gets its own subfolder with three files:

```
output/
  main/
    main_preview.png   # full-frame still (top + gap + bot), first frame at t = --start
    main_top.mp4        # crop video for the top screen
    main_bottom.mp4      # crop video for the bottom screen
```

Same layout for single-file and batch mode. The preview PNG isn't a throwaway — it's part of the output.

Re-running a batch always re-renders everything — there's no caching or skipping of already-rendered shaders.

## Device geometry

Hardcoded at the top of `render_wallpaper.py`:

```python
TOP_W, TOP_H = 1920, 1080
BOT_W, BOT_H = 1240, 1080
GAP = 82
```

To target a different device, edit these constants directly — there's no flag for it.

## Error handling

- No `ffmpeg` on `PATH` → clean error message and exit, no traceback.
- Directory with no `.frag` files → error message and exit.
- A shader that fails to compile is skipped in batch mode (with a stderr message) while the rest still render; the run ends with an `N succeeded, M failed` summary and a non-zero exit code if anything failed. In single-file mode, a failure exits immediately.

## Shader format

Paste the code from Shadertoy's **Image** tab as-is into a `.frag` file — just the body of `mainImage`, no `#version` line, no redefining `iResolution`/`iTime`/etc. yourself. The wrapper is added automatically.
