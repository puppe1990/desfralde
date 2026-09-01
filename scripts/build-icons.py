"""Gera favicon e ícones PWA a partir do mesmo desenho de cartão PECS."""

import io
import struct
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
ICONS = PUBLIC / 'icons'

GOLD = (224, 160, 58, 255)
CREAM = (255, 248, 236, 255)
HONEY = (184, 122, 28, 255)
INK = (42, 33, 24, 255)
SEAT = (186, 214, 208, 255)
MASTER = 1024


def _width(size: int, fraction: float, minimum: int = 2) -> int:
    return max(minimum, round(size * fraction))


def draw_toilet(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int]) -> None:
    x0, y0, x1, y1 = box
    width = x1 - x0
    height = y1 - y0
    stroke = _width(width, 0.045, 3)
    inner_stroke = max(2, stroke - 1)

    tank_w = width * 0.5
    tank_h = height * 0.22
    tank_x = x0 + (width - tank_w) / 2
    tank_y = y0 + height * 0.06
    draw.rounded_rectangle(
        [tank_x, tank_y, tank_x + tank_w, tank_y + tank_h],
        radius=width * 0.045,
        fill=CREAM,
        outline=INK,
        width=stroke,
    )
    button_r = width * 0.038
    button_x = tank_x + tank_w * 0.78
    button_y = tank_y + tank_h * 0.48
    draw.ellipse(
        [
            button_x - button_r,
            button_y - button_r,
            button_x + button_r,
            button_y + button_r,
        ],
        fill=GOLD,
        outline=INK,
        width=max(2, stroke // 2),
    )

    neck_w = tank_w * 0.3
    neck_x = x0 + (width - neck_w) / 2
    neck_top = tank_y + tank_h - stroke
    neck_bot = tank_y + tank_h + height * 0.07
    draw.rectangle(
        [neck_x, neck_top, neck_x + neck_w, neck_bot],
        fill=CREAM,
        outline=INK,
        width=stroke,
    )
    draw.line(
        [(neck_x + stroke, neck_top + 1), (neck_x + neck_w - stroke, neck_top + 1)],
        fill=CREAM,
        width=stroke + 2,
    )

    bowl_w = width * 0.66
    bowl_h = height * 0.46
    bowl_x = x0 + (width - bowl_w) / 2
    bowl_y = neck_bot - height * 0.02
    draw.ellipse(
        [bowl_x, bowl_y, bowl_x + bowl_w, bowl_y + bowl_h],
        fill=SEAT,
        outline=INK,
        width=stroke,
    )
    hole_w = bowl_w * 0.42
    hole_h = bowl_h * 0.38
    hole_x = x0 + (width - hole_w) / 2
    hole_y = bowl_y + bowl_h * 0.32
    draw.ellipse(
        [hole_x, hole_y, hole_x + hole_w, hole_y + hole_h],
        fill=CREAM,
        outline=INK,
        width=inner_stroke,
    )

    foot_w = bowl_w * 0.34
    foot_h = height * 0.09
    foot_x = x0 + (width - foot_w) / 2
    foot_y = bowl_y + bowl_h - foot_h * 0.35
    draw.rounded_rectangle(
        [foot_x, foot_y, foot_x + foot_w, foot_y + foot_h],
        radius=width * 0.025,
        fill=CREAM,
        outline=INK,
        width=stroke,
    )


def draw_icon(size: int, padding_ratio: float) -> Image.Image:
    image = Image.new('RGBA', (size, size), GOLD)
    draw = ImageDraw.Draw(image)
    pad = round(size * padding_ratio)
    ink = _width(size, 0.028, 3)
    honey = _width(size, 0.036, 4)
    radius = size * 0.16
    card = [pad, pad, size - pad - 1, size - pad - 1]
    draw.rounded_rectangle(card, radius=radius, fill=CREAM, outline=INK, width=ink)
    inset = ink + honey // 2
    draw.rounded_rectangle(
        [card[0] + inset, card[1] + inset, card[2] - inset, card[3] - inset],
        radius=max(8, radius - inset),
        outline=HONEY,
        width=honey,
    )
    toilet_pad = pad + size * 0.14
    draw_toilet(
        draw,
        (
            round(toilet_pad),
            round(toilet_pad),
            round(size - toilet_pad),
            round(size - toilet_pad),
        ),
    )
    return image


def downscale(image: Image.Image, size: int) -> Image.Image:
    return image.resize((size, size), Image.Resampling.LANCZOS).convert('RGB')


def draw_favicon(size: int) -> Image.Image:
    image = Image.new('RGB', (size, size), GOLD[:3])
    draw = ImageDraw.Draw(image)
    pad = 1 if size <= 16 else 2
    stroke = 1 if size <= 16 else 2
    draw.rounded_rectangle(
        [pad, pad, size - pad - 1, size - pad - 1],
        radius=size * 0.22,
        fill=CREAM[:3],
        outline=INK[:3],
        width=stroke,
    )
    if size >= 24:
        inset = pad + stroke + 1
        draw.rounded_rectangle(
            [inset, inset, size - inset - 1, size - inset - 1],
            radius=size * 0.16,
            outline=HONEY[:3],
            width=1,
        )
    bowl = size * 0.26
    draw.ellipse(
        [bowl, bowl * 1.05, size - bowl, size - bowl * 0.72],
        fill=SEAT[:3],
        outline=INK[:3],
        width=stroke,
    )
    hole = size * 0.4
    draw.ellipse(
        [hole, hole * 1.12, size - hole, size - hole * 0.78],
        fill=CREAM[:3],
        outline=INK[:3],
        width=1,
    )
    return image


def write_ico(path: Path, images: list[Image.Image]) -> None:
    pngs: list[bytes] = []
    for image in images:
        buffer = io.BytesIO()
        image.save(buffer, format='PNG')
        pngs.append(buffer.getvalue())
    offset = 6 + 16 * len(images)
    entries = b''
    payload = b''
    for image, png in zip(images, pngs, strict=True):
        width, height = image.size
        entries += struct.pack(
            '<BBBBHHII',
            0 if width >= 256 else width,
            0 if height >= 256 else height,
            0,
            0,
            1,
            32,
            len(png),
            offset + len(payload),
        )
        payload += png
    path.write_bytes(struct.pack('<HHH', 0, 1, len(images)) + entries + payload)


def main() -> None:
    ICONS.mkdir(parents=True, exist_ok=True)
    any_master = draw_icon(MASTER, 0.09)
    maskable_master = draw_icon(MASTER, 0.18)

    downscale(any_master, 512).save(ICONS / 'icon-512.png', optimize=True)
    downscale(any_master, 192).save(ICONS / 'icon-192.png', optimize=True)
    downscale(maskable_master, 512).save(
        ICONS / 'icon-512-maskable.png',
        optimize=True,
    )
    downscale(any_master, 180).save(PUBLIC / 'apple-touch-icon.png', optimize=True)
    draw_favicon(32).save(PUBLIC / 'favicon-32.png', optimize=True)
    draw_favicon(16).save(PUBLIC / 'favicon-16.png', optimize=True)

    write_ico(
        PUBLIC / 'favicon.ico',
        [draw_favicon(16), draw_favicon(32), downscale(any_master, 48)],
    )
    print('ícones gerados em', ICONS)


if __name__ == '__main__':
    main()
