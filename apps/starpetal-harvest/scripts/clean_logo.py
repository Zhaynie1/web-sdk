"""Remove outer dark galaxy/nebula from starpetal_forest_logo.png."""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "sprites" / "ui" / "starpetal_forest_logo.png"
STATIC = ROOT / "static" / "assets" / "sprites" / "ui" / "starpetal_forest_logo.png"
JPG_FALLBACK = ROOT / "assets" / "sprites" / "ui" / "starpetal_forest_logo.jpg"

GROWTH_PX = 4
PEEL_ITERATIONS = 40


def dilate(mask: np.ndarray, iterations: int = 1) -> np.ndarray:
    out = mask.astype(bool)
    for _ in range(iterations):
        padded = np.pad(out, 1, mode="constant", constant_values=False)
        out = (
            padded[:-2, :-2]
            | padded[:-2, 1:-1]
            | padded[:-2, 2:]
            | padded[1:-1, :-2]
            | padded[1:-1, 1:-1]
            | padded[1:-1, 2:]
            | padded[2:, :-2]
            | padded[2:, 1:-1]
            | padded[2:, 2:]
        )
    return out


def erode(mask: np.ndarray) -> np.ndarray:
    padded = np.pad(mask, 1, mode="constant", constant_values=True)
    return (
        padded[1:-1, 1:-1]
        & padded[:-2, 1:-1]
        & padded[2:, 1:-1]
        & padded[1:-1, :-2]
        & padded[1:-1, 2:]
    )


def load_source_rgba() -> np.ndarray:
    jpg = np.array(Image.open(JPG_FALLBACK).convert("RGB"))
    dark = jpg.sum(axis=2) < 24
    alpha = np.where(dark, 0, 255).astype(np.uint8)
    return np.dstack([jpg, alpha])


def clean_logo(arr: np.ndarray) -> np.ndarray:
    result = arr.copy()
    rgb = arr[:, :, :3].astype(np.float32)
    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    sat = (mx - mn) / (mx + 1e-6)

    visible = arr[:, :, 3] > 10

    # Bright letter faces and lotus petals
    faces = visible & ((lum > 115) | ((sat > 0.38) & (lum > 70)))

    keep = faces.copy()
    for _ in range(GROWTH_PX):
        glow = (
            (lum > 45)
            | (sat > 0.12)
            | (
                (r > g * 1.02)
                & (b > g * 0.88)
                & (lum > 22)
                & (lum < 90)
                & (sat > 0.08)
            )
        )
        keep = keep | (dilate(keep, 1) & visible & ~keep & glow)

    # Keep sparkles only when they sit on the logo, not in the outer halo
    sparkles = visible & (lum > 160) & (sat < 0.4) & dilate(faces, 6)
    keep = keep | (sparkles & dilate(keep, 1))

    protected = faces | sparkles | (visible & (lum > 108) & (sat > 0.24))

    for _ in range(PEEL_ITERATIONS):
        boundary = keep & ~erode(keep)
        peel = boundary & ~protected & (lum < 95) & (sat < 0.28)
        if not peel.any():
            break
        keep &= ~peel

    # Drop leftover dark haze flecks away from the lettering
    near_art = dilate(faces, 3)
    haze = keep & ~near_art & (lum < 108) & (sat < 0.28)
    keep &= ~haze

    alpha = np.where(keep, arr[:, :, 3], 0).astype(np.float32)
    result[:, :, 3] = np.clip(alpha, 0, 255).astype(np.uint8)
    return result


def main() -> None:
    source = load_source_rgba()
    cleaned = clean_logo(source)

    Image.fromarray(cleaned).save(SRC)
    Image.fromarray(cleaned).save(STATIC)
    kept = int((cleaned[:, :, 3] > 10).sum())
    print(f"Cleaned logo saved to:\n  {SRC}\n  {STATIC}\nKept pixels: {kept}")


if __name__ == "__main__":
    main()