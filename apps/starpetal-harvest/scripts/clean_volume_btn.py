"""Crop volume button to gold ring + interior; remove outer lotus outline."""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "sprites" / "ui" / "starpetal_volume_btn_source.jpg"
OUT = ROOT / "assets" / "sprites" / "ui" / "starpetal_volume_btn.png"
STATIC_OUT = ROOT / "static" / "assets" / "sprites" / "ui" / "starpetal_volume_btn.png"

CENTER_X = 340.0
CENTER_Y = 465.0
INNER_RADIUS = 235.0
OUTER_RADIUS = 372.0
FEATHER = 5.0


def process_volume_button(arr: np.ndarray) -> np.ndarray:
    h, w = arr.shape[:2]
    rgb = arr[:, :, :3].astype(np.float32)
    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    sat = (mx - mn) / (mx + 1e-6)

    yy, xx = np.ogrid[:h, :w]
    dist = np.sqrt((xx - CENTER_X) ** 2 + (yy - CENTER_Y) ** 2)

    visible = lum > 12
    interior = dist < INNER_RADIUS
    ring_band = (dist >= INNER_RADIUS) & (dist <= OUTER_RADIUS)

    gold = (
        (r > 120)
        & (g > 80)
        & (b < 165)
        & (lum > 82)
        & (r > g * 0.88)
        & (r > b * 0.88)
        & (sat > 0.04)
    )
    warm_glow = ring_band & (lum > 70) & (r > g) & (r > b * 0.98) & (sat > 0.05) & (sat < 0.48)
    ring_flare = ring_band & (lum > 125) & (sat < 0.55)
    flower = ring_band & (
        ((r > 70) & (b > r * 0.95) & (g < b * 0.88) & (sat > 0.1))
        | ((b > 130) & (g > 90) & (b > r * 1.02) & (sat > 0.15))
        | ((r > 90) & (b > 120) & (g < r * 0.75) & (sat > 0.18))
    )

    keep = visible & (interior | (ring_band & (gold | warm_glow | ring_flare) & ~flower))

    outer_fade = np.clip(1.0 - (dist - OUTER_RADIUS) / FEATHER, 0, 1)

    result = arr.copy().astype(np.float32)
    result[:, :, 3] = np.where(keep, arr[:, :, 3], 0) * outer_fade
    result[lum < 12, 3] = 0
    return np.clip(result, 0, 255).astype(np.uint8)


def crop_square(arr: np.ndarray) -> np.ndarray:
    h, w = arr.shape[:2]
    size = min(w, h, int((OUTER_RADIUS + 14) * 2))
    left = max(0, int(CENTER_X - size / 2))
    top = max(0, int(CENTER_Y - size / 2))
    return arr[top : top + size, left : left + size]


def main() -> None:
    source = np.array(Image.open(SOURCE).convert("RGBA"))
    cleaned = crop_square(process_volume_button(source))
    Image.fromarray(cleaned).save(OUT)
    Image.fromarray(cleaned).save(STATIC_OUT)
    print(f"Saved volume button ({cleaned.shape[1]}x{cleaned.shape[0]}) to:\n  {OUT}\n  {STATIC_OUT}")


if __name__ == "__main__":
    main()