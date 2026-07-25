#!/usr/bin/env python3
"""
Build the generated docs from a rendered output tree: the combined preview
mosaic and EXAMPLES.md.

Run directly to rebuild them without rendering anything; render_wallpaper.py
imports build_docs() to run the same step when a render finishes.
"""

import argparse
import math
import os
import sys
from urllib.parse import quote

from PIL import Image

MOSAIC_NAME = "all_previews_mosaic.jpg"
MOSAIC_TILE_W = 320
MOSAIC_PAD = 3
MOSAIC_BG = (17, 17, 17)
MOSAIC_TARGET_ASPECT = 16 / 9
MOSAIC_QUALITY = 90

EXAMPLES_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "EXAMPLES.md")

EXAMPLES_HEADER = """# Examples

The images are previews only (the first frame). Download links for the
wallpaper videos are under each image ([top mp4] · [bottom mp4]). Clicking a
preview opens the directory with all files for that variant.
"""


def find_preview_files(output_root):
    paths = []
    for root, _, files in os.walk(output_root):
        for f in files:
            if f.endswith("_preview.png"):
                paths.append(os.path.join(root, f))
    return sorted(paths)


def mosaic_grid(count, tile_w, tile_h):
    """Pick (cols, rows) for `count` tiles of tile_w x tile_h.

    Columns are chosen so the finished sheet lands near MOSAIC_TARGET_ASPECT;
    the last row may be short.
    """
    cols = round(math.sqrt(count * MOSAIC_TARGET_ASPECT * tile_h / tile_w))
    cols = max(1, min(cols, count))
    return cols, math.ceil(count / cols)


def build_mosaic(output_root):
    """Tile every *_preview.png under `output_root` into one contact sheet.

    Written to <output_root>/all_previews_mosaic.jpg — the overview image
    README.md embeds. Tiles are ordered by path, so variations of a shader stay
    grouped. Tile shape comes from the first preview found and every tile is
    scaled to it, so previews rendered at a different canvas aspect get squashed
    rather than breaking the grid.

    Returns the mosaic path, or None if there are no previews.
    """
    previews = find_preview_files(output_root)
    if not previews:
        return None

    with Image.open(previews[0]) as first:
        src_w, src_h = first.size
    tile_w = MOSAIC_TILE_W
    tile_h = max(1, round(tile_w * src_h / src_w))

    cols, rows = mosaic_grid(len(previews), tile_w, tile_h)
    cell_w, cell_h = tile_w + 2 * MOSAIC_PAD, tile_h + 2 * MOSAIC_PAD
    sheet = Image.new("RGB", (cols * cell_w, rows * cell_h), MOSAIC_BG)

    for i, path in enumerate(previews):
        with Image.open(path) as im:
            tile = im.convert("RGB").resize((tile_w, tile_h), Image.Resampling.LANCZOS)
        x = (i % cols) * cell_w + MOSAIC_PAD
        y = (i // cols) * cell_h + MOSAIC_PAD
        sheet.paste(tile, (x, y))

    mosaic_path = os.path.join(output_root, MOSAIC_NAME)
    sheet.save(mosaic_path, quality=MOSAIC_QUALITY)
    return mosaic_path


def md_url(path, base_dir):
    """`path` as a markdown link target relative to `base_dir`."""
    rel = os.path.relpath(path, base_dir).replace(os.sep, "/")
    return quote(rel)


def build_examples(output_root, examples_path=EXAMPLES_PATH):
    """Regenerate EXAMPLES.md: one section per rendered variant.

    Variants are discovered from the previews under `output_root` and ordered
    by path, so the sections line up with the mosaic's tiles. A section is
    titled by the variant's directory relative to `output_root`, and links are
    written relative to the directory holding `examples_path`. Video links are
    emitted only for the files that actually exist.

    Returns the written path, or None if there are no previews.
    """
    previews = find_preview_files(output_root)
    if not previews:
        return None

    base_dir = os.path.dirname(os.path.abspath(examples_path))
    blocks = [EXAMPLES_HEADER]

    for preview in previews:
        var_dir = os.path.dirname(preview)
        prefix = os.path.basename(preview)[: -len("_preview.png")]
        name = os.path.relpath(var_dir, output_root).replace(os.sep, "/")

        blocks.append(f"## {name}\n")
        blocks.append(
            f"[![{name}]({md_url(preview, base_dir)})]({md_url(var_dir, base_dir)}/)\n"
        )

        links = [
            f"[{label}]({md_url(video, base_dir)})"
            for label, video in (
                ("top mp4", os.path.join(var_dir, f"{prefix}_top.mp4")),
                ("bottom mp4", os.path.join(var_dir, f"{prefix}_bottom.mp4")),
            )
            if os.path.exists(video)
        ]
        if links:
            blocks.append(" · ".join(links) + "\n")

    with open(examples_path, "w", encoding="utf-8") as f:
        f.write("\n".join(blocks))
    return examples_path


def build_docs(output_root, examples_path=EXAMPLES_PATH, mosaic=True, examples=True):
    """Rebuild the generated docs from the previews already in `output_root`.

    Both artifacts are derived from the whole output tree rather than any one
    render run. A failure in one is reported but doesn't stop the other, or
    mask a render's own result when called at the end of a render.

    Returns True if everything requested was written.
    """
    if not mosaic and not examples:
        return True

    if not find_preview_files(output_root):
        print(f"no previews under {output_root}, nothing to build", file=sys.stderr)
        return False

    builders = []
    if mosaic:
        builders.append(("mosaic", lambda: build_mosaic(output_root)))
    if examples:
        builders.append(
            ("examples", lambda: build_examples(output_root, examples_path))
        )

    ok = True
    for label, build in builders:
        try:
            print(f"Wrote {build()}")
        except Exception as e:
            print(f"{label} failed: {e}", file=sys.stderr)
            ok = False
    return ok


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("output_dir", help="root output directory to scan for previews")
    p.add_argument(
        "--examples",
        default=EXAMPLES_PATH,
        help=f"path to write the examples list to (default: {EXAMPLES_PATH})",
    )
    p.add_argument(
        "--no-mosaic",
        action="store_true",
        help=f"skip <output_dir>/{MOSAIC_NAME}",
    )
    p.add_argument(
        "--no-examples",
        action="store_true",
        help=f"skip {os.path.basename(EXAMPLES_PATH)}",
    )
    args = p.parse_args()

    if not os.path.isdir(args.output_dir):
        sys.exit(f"not a directory: {args.output_dir}")

    ok = build_docs(
        args.output_dir,
        examples_path=args.examples,
        mosaic=not args.no_mosaic,
        examples=not args.no_examples,
    )
    if not ok:
        sys.exit(1)


if __name__ == "__main__":
    main()
