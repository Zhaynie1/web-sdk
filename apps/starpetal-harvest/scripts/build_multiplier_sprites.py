"""Build multiplier sprites from the purple-gold 2X reference — swap numbers only."""
from __future__ import annotations

import shutil
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ASSETS_OUT = ROOT / "assets" / "sprites" / "starpetal"
STATIC_OUT = ROOT / "static" / "assets" / "sprites" / "starpetal"
SOURCE = ASSETS_OUT / "m_symbol_reference.jpg"

SESSION_SOURCE = Path(
    r"C:\Users\zackh\.grok\sessions\C%3A%5CUsers%5Czackh\019ef683-eb5e-7803-bce9-93887ef27a13\assets\image-17d0f4b3-e105-40d3-a8ee-9354551e6ee6.jpg"
)

MULTIPLIERS = [2, 4, 8, 16, 32, 64, 128, 256, 512, 250]

TEXT_CX, TEXT_CY = 516, 503
TEXT_RX, TEXT_RY = 228, 222
SAMPLE_R_IN, SAMPLE_R_OUT = 232, 270

FONT_SIZES = {
    2: 290,
    4: 290,
    8: 260,
    16: 240,
    32: 210,
    64: 185,
    128: 155,
    256: 130,
    512: 108,
    250: 140,
}


def resolve_source() -> Path:
    if not SOURCE.exists():
        ASSETS_OUT.mkdir(parents=True, exist_ok=True)
        shutil.copy2(SESSION_SOURCE, SOURCE)
    return SOURCE


def remove_black_background(img: Image.Image, threshold: int = 18) -> Image.Image:
    arr = np.array(img.convert("RGBA"), dtype=np.uint8)
    dark = (arr[:, :, 0] <= threshold) & (arr[:, :, 1] <= threshold) & (arr[:, :, 2] <= threshold)
    arr[dark, 3] = 0
    return Image.fromarray(arr)


def ellipse_mask(shape: tuple[int, int], cx: int, cy: int, rx: int, ry: int) -> np.ndarray:
    h, w = shape
    yy, xx = np.mgrid[0:h, 0:w]
    return ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 <= 1.0


def clear_text_field(img: Image.Image) -> Image.Image:
    """Paint over the baked 2X area with purple texture sampled from the emblem ring."""
    arr = np.array(img.convert("RGBA"), dtype=np.uint8)
    h, w = arr.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    dist = np.sqrt((xx - TEXT_CX) ** 2 + (yy - TEXT_CY) ** 2)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    text_mask = ellipse_mask((h, w), TEXT_CX, TEXT_CY, TEXT_RX, TEXT_RY)
    gold_letter = (r.astype(int) > 130) & (g.astype(int) > 95) & (b.astype(int) < 165) & (dist < 250)
    text_mask = text_mask | gold_letter
    purple = (b.astype(int) > r.astype(int) + 8) & (r > 35) & (g < 175) & (b > 70)
    sample_ring = (dist >= SAMPLE_R_IN) & (dist <= SAMPLE_R_OUT) & purple & (arr[:, :, 3] > 20)
    samples = arr[sample_ring]
    if len(samples) < 32:
        samples = arr[purple & (arr[:, :, 3] > 20)]
    median = np.median(samples, axis=0).astype(np.uint8)

    rng = np.random.default_rng(42)
    noise = rng.integers(-18, 19, size=(h, w, 3), dtype=np.int16)
    fill = np.clip(median[:3].astype(np.int16) + noise, 0, 255).astype(np.uint8)

    for c in range(3):
        arr[:, :, c] = np.where(text_mask, fill[:, :, c], arr[:, :, c])

    patch = Image.fromarray(arr).filter(ImageFilter.GaussianBlur(1.2))
    patch_arr = np.array(patch)
    for c in range(3):
        arr[:, :, c] = np.where(text_mask, patch_arr[:, :, c], arr[:, :, c])

    return Image.fromarray(arr)


def draw_gold_label(img: Image.Image, multiplier: int) -> Image.Image:
    layer = img.copy()
    draw = ImageDraw.Draw(layer)
    size = FONT_SIZES[multiplier]
    font = ImageFont.truetype("arialbd.ttf", size)
    x_font = ImageFont.truetype("arialbd.ttf", max(72, size - 70))
    num = str(multiplier)
    num_bbox = draw.textbbox((0, 0), num, font=font)
    x_bbox = draw.textbbox((0, 0), "X", x_font)
    num_w = num_bbox[2] - num_bbox[0]
    x_w = x_bbox[2] - x_bbox[0]
    gap = 10 if multiplier < 100 else 6
    total_w = num_w + x_w + gap
    tx = TEXT_CX - total_w // 2
    ty = TEXT_CY - (num_bbox[3] - num_bbox[1]) // 2 - 8
    x_pos = tx + num_w + gap
    y_pos = ty + max(12, size // 18)

    outline = (36, 8, 52, 255)
    shadow = (92, 38, 10, 220)
    gold_hi = (255, 244, 168, 255)
    gold_mid = (255, 210, 72, 255)
    gold_lo = (196, 128, 24, 255)

    for dx, dy in ((-4, -4), (4, -4), (-4, 4), (4, 4), (0, -4), (0, 4), (-4, 0), (4, 0)):
        draw.text((tx + dx, ty + dy), num, font=font, fill=outline)
        draw.text((x_pos + dx, y_pos + dy), "X", font=x_font, fill=outline)
    draw.text((tx + 3, ty + 5), num, font=font, fill=shadow)
    draw.text((x_pos + 3, y_pos + 5), "X", font=x_font, fill=shadow)
    draw.text((tx + 1, ty + 3), num, font=font, fill=gold_lo)
    draw.text((x_pos + 1, y_pos + 3), "X", font=x_font, fill=gold_lo)
    draw.text((tx, ty + 1), num, font=font, fill=gold_mid)
    draw.text((x_pos, y_pos + 1), "X", font=x_font, fill=gold_mid)
    draw.text((tx, ty), num, font=font, fill=gold_hi)
    draw.text((x_pos, y_pos), "X", font=x_font, fill=gold_hi)
    return layer


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


def build_sprite(base: Image.Image, multiplier: int) -> Image.Image:
    if multiplier == 2:
        return trim_and_resize(base)
    cleared = clear_text_field(base)
    labeled = draw_gold_label(cleared, multiplier)
    return trim_and_resize(labeled)


def main() -> None:
    ASSETS_OUT.mkdir(parents=True, exist_ok=True)
    STATIC_OUT.mkdir(parents=True, exist_ok=True)

    source = resolve_source()
    base = remove_black_background(Image.open(source))

    for multiplier in MULTIPLIERS:
        sprite = build_sprite(base, multiplier)
        filename = f"m_{multiplier}x.png"
        for out_dir in (ASSETS_OUT, STATIC_OUT):
            sprite.save(out_dir / filename, optimize=True)
        print(f"Wrote {filename}")


if __name__ == "__main__":
    main()