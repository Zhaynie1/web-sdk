"""Import new Star Petal Forrest title logo (transparent PNG)."""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS_OUT = ROOT / "assets" / "sprites" / "ui"
STATIC_OUT = ROOT / "static" / "assets" / "sprites" / "ui"
SOURCE = Path(
    r"C:\Users\zackh\.grok\sessions\C%3A%5CUsers%5Czackh\019ef683-eb5e-7803-bce9-93887ef27a13\assets\image-6072b833-d5fc-412e-ad30-be53e43b6535.jpg"
)
OUT_NAME = "starpetal_forest_logo.png"
JPG_NAME = "starpetal_forest_logo.jpg"


def remove_black_background(img: Image.Image, threshold: int = 28) -> Image.Image:
    arr = np.array(img.convert("RGBA"), dtype=np.uint8)
    dark = (arr[:, :, 0] <= threshold) & (arr[:, :, 1] <= threshold) & (arr[:, :, 2] <= threshold)
    arr[dark, 3] = 0
    return Image.fromarray(arr)


def trim_transparent(img: Image.Image, pad: int = 8) -> Image.Image:
    alpha = np.array(img.getchannel("A"))
    ys, xs = np.where(alpha > 12)
    if len(xs) == 0:
        return img
    x1 = max(0, int(xs.min()) - pad)
    y1 = max(0, int(ys.min()) - pad)
    x2 = min(img.width, int(xs.max()) + pad + 1)
    y2 = min(img.height, int(ys.max()) + pad + 1)
    return img.crop((x1, y1, x2, y2))


def main() -> None:
    if not SOURCE.exists():
        raise FileNotFoundError(f"Missing source image: {SOURCE}")

    ASSETS_OUT.mkdir(parents=True, exist_ok=True)
    STATIC_OUT.mkdir(parents=True, exist_ok=True)

    sprite = trim_transparent(remove_black_background(Image.open(SOURCE)))
    for out_dir in (ASSETS_OUT, STATIC_OUT):
        sprite.save(out_dir / OUT_NAME, optimize=True)
        sprite.convert("RGB").save(out_dir / JPG_NAME, quality=92)
        print(f"Wrote {out_dir / OUT_NAME} ({sprite.width}x{sprite.height})")


if __name__ == "__main__":
    main()