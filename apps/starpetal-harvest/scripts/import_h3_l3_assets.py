"""Import new H3 (lunar fox) and L3 (grove bloom) symbol art."""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS_OUT = ROOT / "assets" / "sprites" / "starpetal"
STATIC_OUT = ROOT / "static" / "assets" / "sprites" / "starpetal"
SESSION_ASSETS = Path(
    r"C:\Users\zackh\.grok\sessions\C%3A%5CUsers%5Czackh\019ef683-eb5e-7803-bce9-93887ef27a13\assets"
)

SOURCES = {
    "h3_lunar_fox.png": SESSION_ASSETS / "image-b3f5667d-efeb-4bf4-9f5c-53dfc75aca55.jpg",
    "l3_grove_bloom.png": SESSION_ASSETS / "image-3935cd8e-36a8-495c-b84e-4b25c6708b03.jpg",
}


def remove_black_background(img: Image.Image, threshold: int = 32) -> Image.Image:
    arr = np.array(img.convert("RGBA"), dtype=np.uint8)
    dark = (arr[:, :, 0] <= threshold) & (arr[:, :, 1] <= threshold) & (arr[:, :, 2] <= threshold)
    arr[dark, 3] = 0
    return Image.fromarray(arr)


def trim_and_resize(img: Image.Image, out_size: int = 256, pad: int = 12) -> Image.Image:
    alpha = np.array(img.getchannel("A"))
    ys, xs = np.where(alpha > 12)
    if len(xs) == 0:
        return img.resize((out_size, out_size), Image.Resampling.LANCZOS)
    x1 = max(0, int(xs.min()) - pad)
    y1 = max(0, int(ys.min()) - pad)
    x2 = min(img.width, int(xs.max()) + pad + 1)
    y2 = min(img.height, int(ys.max()) + pad + 1)
    cropped = img.crop((x1, y1, x2, y2))
    side = max(cropped.width, cropped.height)
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    ox = (side - cropped.width) // 2
    oy = (side - cropped.height) // 2
    square.paste(cropped, (ox, oy), cropped)
    return square.resize((out_size, out_size), Image.Resampling.LANCZOS)


def main() -> None:
    ASSETS_OUT.mkdir(parents=True, exist_ok=True)
    STATIC_OUT.mkdir(parents=True, exist_ok=True)

    for out_name, source in SOURCES.items():
        if not source.exists():
            raise FileNotFoundError(f"Missing source image: {source}")
        sprite = trim_and_resize(remove_black_background(Image.open(source)))
        for out_dir in (ASSETS_OUT, STATIC_OUT):
            sprite.save(out_dir / out_name, optimize=True)
            print(f"Wrote {out_dir / out_name}")


if __name__ == "__main__":
    main()