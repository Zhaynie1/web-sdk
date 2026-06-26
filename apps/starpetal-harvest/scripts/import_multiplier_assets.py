"""Import user-provided 4x-512x multiplier art (transparent PNG) — keep 2x unchanged."""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS_OUT = ROOT / "assets" / "sprites" / "starpetal"
STATIC_OUT = ROOT / "static" / "assets" / "sprites" / "starpetal"
SESSION = Path(
    r"C:\Users\zackh\.grok\sessions\C%3A%5CUsers%5Czackh\019ef683-eb5e-7803-bce9-93887ef27a13\assets"
)

IMPORTS = [
    ("image-e63a6c19-bacf-404d-94b0-0cbb769abe29.jpg", 4),
    ("image-a900dffd-e8f0-4661-a624-ef3f17d111e5.jpg", 8),
    ("image-256c12f8-7391-498c-aedd-6596b1319f7e.jpg", 16),
    ("image-cc5abc3c-c199-4bc3-a504-daacd9685c58.jpg", 32),
    ("image-68b578f2-1431-4b1a-b6a5-4811009cd430.jpg", 64),
    ("image-1395a93a-939a-48e6-ac0a-f36463aba51a.jpg", 128),
    ("image-e7766d1e-4e86-4218-b9c8-77549156d724.jpg", 256),
    ("image-fa7f471e-e2f0-4874-a2e0-c07b2a50c5f0.jpg", 512),
]


def remove_black_background(img: Image.Image, threshold: int = 28) -> Image.Image:
    arr = np.array(img.convert("RGBA"), dtype=np.uint8)
    dark = (arr[:, :, 0] <= threshold) & (arr[:, :, 1] <= threshold) & (arr[:, :, 2] <= threshold)
    arr[dark, 3] = 0
    return Image.fromarray(arr)


def trim_and_resize(img: Image.Image, out_size: int = 256, pad: int = 10) -> Image.Image:
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

    for filename, multiplier in IMPORTS:
        src = SESSION / filename
        if not src.exists():
            raise FileNotFoundError(f"Missing source image: {src}")
        sprite = trim_and_resize(remove_black_background(Image.open(src)))
        out_name = f"m_{multiplier}x.png"
        for out_dir in (ASSETS_OUT, STATIC_OUT):
            sprite.save(out_dir / out_name, optimize=True)
        print(f"Wrote {out_name}")


if __name__ == "__main__":
    main()