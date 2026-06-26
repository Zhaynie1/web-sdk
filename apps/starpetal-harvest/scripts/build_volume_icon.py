"""Build volume footer icon from the paytable template."""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
PAYTABLE = ROOT / "assets" / "sprites" / "ui" / "icon_paytable.png"
MENU = ROOT / "assets" / "sprites" / "ui" / "icon_menu.png"
OUT = ROOT / "assets" / "sprites" / "ui" / "starpetal_volume_btn.png"
STATIC_OUT = ROOT / "static" / "assets" / "sprites" / "ui" / "starpetal_volume_btn.png"
LEGACY_OUT = ROOT / "assets" / "sprites" / "ui" / "icon_volume.png"

CENTER = (343, 509)
BOOK_REPLACE_BOX = (205, 368, 481, 650)

ICON_FILL = (255, 254, 171, 255)
ICON_OUTLINE = (180, 120, 50, 255)


def emblem_bbox(img: Image.Image) -> tuple[int, int, int, int]:
    arr = np.array(img.convert("RGBA"))
    vis = arr[:, :, 3] > 20
    ys, xs = np.where(vis)
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def book_pixel_mask(img: Image.Image) -> Image.Image:
    """Mask every non-cosmic pixel in the center emblem, removing the full book."""
    arr = np.array(img.convert("RGBA"))
    x1, y1, x2, y2 = BOOK_REPLACE_BOX
    region = arr[y1:y2, x1:x2]
    r, g, b, a = region[:, :, 0], region[:, :, 1], region[:, :, 2], region[:, :, 3]
    cosmic = (b.astype(int) > r.astype(int) + 12) & (b.astype(int) > 125) & (a > 128)
    replace = (a > 128) & ~cosmic

    mask = np.zeros(arr.shape[:2], dtype=np.uint8)
    mask[y1:y2, x1:x2] = (replace * 255).astype(np.uint8)
    return Image.fromarray(mask)


def radial_inpaint(img: Image.Image, mask: Image.Image) -> Image.Image:
    """Fill masked pixels by sampling outward along radial lines."""
    arr = np.array(img.convert("RGBA"), dtype=np.uint8)
    mask_arr = np.array(mask) > 0
    cx, cy = CENTER
    ys, xs = np.where(mask_arr)
    for y, x in zip(ys, xs):
        dx, dy = float(x - cx), float(y - cy)
        length = max((dx * dx + dy * dy) ** 0.5, 1.0)
        dx /= length
        dy /= length
        for step in range(1, 280):
            sx = int(round(cx + dx * step))
            sy = int(round(cy + dy * step))
            if sx < 0 or sy < 0 or sx >= arr.shape[1] or sy >= arr.shape[0]:
                break
            if not mask_arr[sy, sx]:
                arr[y, x] = arr[sy, sx]
                break
    return Image.fromarray(arr)


def remove_book(paytable: Image.Image) -> Image.Image:
    """Erase the paytable book while preserving existing cosmic rays."""
    mask = book_pixel_mask(paytable)
    return radial_inpaint(paytable, mask)


def draw_standard_volume(size: tuple[int, int]) -> Image.Image:
    """Standard speaker + sound-wave icon in the same gold style as the menu bars."""
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    cx, cy = CENTER

    body = (cx - 64, cy - 72, cx - 18, cy + 72)
    cone = [(cx - 18, cy - 54), (cx + 58, cy - 84), (cx + 58, cy + 84), (cx - 18, cy + 54)]
    waves = (
        (cx + 66, 34, 8),
        (cx + 82, 48, 8),
        (cx + 100, 62, 8),
    )

    draw.rounded_rectangle(body, radius=10, fill=ICON_FILL, outline=ICON_OUTLINE, width=5)
    draw.polygon(cone, fill=ICON_FILL, outline=ICON_OUTLINE)
    for wave_x, radius, width in waves:
        draw.arc(
            (wave_x - radius, cy - radius, wave_x + radius, cy + radius),
            -70,
            70,
            fill=ICON_FILL,
            width=width,
        )

    return layer


def main() -> None:
    paytable = Image.open(PAYTABLE).convert("RGBA")
    menu = Image.open(MENU).convert("RGBA")

    base = remove_book(paytable)
    symbol = draw_standard_volume(base.size)
    result = Image.alpha_composite(base, symbol)

    result.save(OUT)
    result.save(STATIC_OUT)
    result.save(LEGACY_OUT)

    print(f"Menu bbox: {emblem_bbox(menu)}")
    print(f"Paytable bbox: {emblem_bbox(paytable)}")
    print(f"Volume bbox: {emblem_bbox(result)}")


if __name__ == "__main__":
    main()