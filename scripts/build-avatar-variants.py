#!/usr/bin/env python3
"""Recolor 12 gouache bases into all gender × skin × hair-type × hair-color portraits."""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
BASES = ROOT / "public" / "avatars" / "bases"
OUT = ROOT / "public" / "avatars" / "full"
PREVIEW = ROOT / "public" / "avatars" / "preview"

SKIN = {
    "ivory": np.array([243, 212, 184], dtype=np.float32),
    "peach": np.array([232, 184, 148], dtype=np.float32),
    "golden": None,
    "amber": np.array([168, 106, 60], dtype=np.float32),
    "bronze": np.array([122, 68, 40], dtype=np.float32),
    "espresso": np.array([74, 42, 24], dtype=np.float32),
}

HAIR = {
    "black": np.array([28, 20, 16], dtype=np.float32),
    "brown": None,
    "blonde": np.array([212, 164, 74], dtype=np.float32),
    "auburn": np.array([122, 58, 22], dtype=np.float32),
    "red": np.array([196, 92, 62], dtype=np.float32),
    "gray": np.array([138, 128, 120], dtype=np.float32),
}

SHIRT = {
    "menina": np.array([196, 108, 78], dtype=np.float32),
    "outro": np.array([79, 122, 102], dtype=np.float32),
}

GENDERS = ("menino", "menina", "outro")
HAIR_TYPES = ("short", "wavy", "curly", "long", "puff", "bun")
OUTPUT_SIZE = 512


def rgb_to_hsv(rgb: np.ndarray) -> np.ndarray:
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    maxc = np.max(rgb, axis=-1)
    minc = np.min(rgb, axis=-1)
    v = maxc
    s = np.where(maxc == 0, 0, (maxc - minc) / np.maximum(maxc, 1e-6))
    rc = (maxc - r) / np.maximum(maxc - minc, 1e-6)
    gc = (maxc - g) / np.maximum(maxc - minc, 1e-6)
    bc = (maxc - b) / np.maximum(maxc - minc, 1e-6)
    h = np.zeros_like(maxc)
    h = np.where((r == maxc) & (maxc != minc), bc - gc, h)
    h = np.where((g == maxc) & (maxc != minc), 2.0 + rc - bc, h)
    h = np.where((b == maxc) & (maxc != minc), 4.0 + gc - rc, h)
    h = (h / 6.0) % 1.0
    return np.stack([h, s, v], axis=-1)


def morph(mask: np.ndarray, radius: int, maximum: bool) -> np.ndarray:
    if radius <= 0:
        return mask
    image = Image.fromarray(mask.astype(np.uint8) * 255)
    remaining = radius
    op = ImageFilter.MaxFilter if maximum else ImageFilter.MinFilter
    while remaining > 0:
        step = min(remaining, 6)
        image = image.filter(op(step * 2 + 1))
        remaining -= step
    return np.asarray(image) > 127


def dilate(mask: np.ndarray, radius: int) -> np.ndarray:
    return morph(mask, radius, True)


def erode(mask: np.ndarray, radius: int) -> np.ndarray:
    return morph(mask, radius, False)


def border_connected(mask: np.ndarray) -> np.ndarray:
    height, width = mask.shape
    canvas = Image.fromarray(mask.astype(np.uint8) * 255)
    marked = np.zeros(mask.shape, dtype=bool)
    for xy in ((0, 0), (width - 1, 0), (0, height - 1), (width - 1, height - 1)):
        if canvas.getpixel(xy) == 0:
            continue
        filled = canvas.copy()
        ImageDraw.floodfill(filled, xy, 128)
        marked |= np.asarray(filled) == 128
    return marked


def scale_recolor(src: np.ndarray, mask: np.ndarray, target: np.ndarray) -> np.ndarray:
    pixels = src[mask]
    if pixels.size == 0:
        return src
    median = np.maximum(np.median(pixels, axis=0), 12.0)
    out = src.copy()
    out[mask] = np.clip(pixels * (target / median), 0, 255)
    return out


def tint_recolor(src: np.ndarray, mask: np.ndarray, target: np.ndarray) -> np.ndarray:
    pixels = src[mask]
    if pixels.size == 0:
        return src
    value = pixels.max(axis=1)
    low, high = np.percentile(value, [8, 92])
    t = np.clip((value - low) / max(high - low, 1.0), 0, 1)
    shading = 0.58 + t * 0.62
    out = src.copy()
    out[mask] = np.clip(target * shading[:, None], 0, 255)
    return out


def masks(rgb: np.ndarray) -> dict[str, np.ndarray]:
    hsv = rgb_to_hsv(rgb / 255.0)
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    height, width = rgb.shape[:2]
    y = np.arange(height)[:, None] / height
    x = np.arange(width)[None, :] / width

    cream = (s < 0.22) & (v > 0.82)
    bg = border_connected(cream)
    figure = ~bg
    blue = figure & (h > 0.50) & (h < 0.78) & (s > 0.18) & (y > 0.55)
    socks = figure & (s < 0.28) & (v > 0.70) & (y > 0.78) & (y < 0.90)
    shoes = figure & (y > 0.85) & (h < 0.08) & (s > 0.28) & (v > 0.28) & (v < 0.85)
    yellow = (h > 0.07) & (h < 0.17) & (s > 0.35) & (v > 0.42)
    shirt = figure & (y > 0.36) & (y < 0.68) & yellow & ~blue
    shirt = dilate(shirt, 4) & figure & yellow & (y > 0.35) & (y < 0.70) & ~blue
    clothes = blue | socks | shoes | shirt

    face = (
        figure
        & (x > 0.38)
        & (x < 0.62)
        & (y > 0.16)
        & (y < 0.42)
        & (h < 0.12)
        & (s > 0.18)
        & (v > 0.40)
    )
    away_from_bg = ~dilate(bg, 5)
    face_region = dilate(face, 5) & figure & away_from_bg
    sclera = face_region & (v > 0.78) & (s < 0.35)
    eyes = dilate(sclera, 4) & face_region & away_from_bg

    hair_zone = (y < 0.52) | ((y < 0.64) & ((x < 0.43) | (x > 0.57)))
    dark_hair = (
        figure
        & ~clothes
        & ~eyes
        & hair_zone
        & (v < 0.46)
        & (s > 0.12)
        & ((h < 0.14) | (h > 0.92))
    )
    hair_edge = (
        figure
        & ~clothes
        & ~eyes
        & hair_zone
        & (v < 0.58)
        & (s > 0.10)
        & ((h < 0.14) | (h > 0.92))
    )
    hair = dark_hair | (dilate(dark_hair, 4) & hair_edge)

    skin = (
        figure
        & ~hair
        & ~eyes
        & ~clothes
        & (h < 0.13)
        & (s > 0.14)
        & (s < 0.78)
        & (v > 0.28)
        & (v < 0.92)
    )
    return {"skin": skin, "hair": hair, "shirt": shirt, "eyes": eyes, "bg": bg}


def apply_variant(
    rgb: np.ndarray,
    parts: dict[str, np.ndarray],
    skin_key: str,
    hair_key: str,
    gender: str,
) -> Image.Image:
    out = rgb.copy()
    if SKIN[skin_key] is not None:
        out = scale_recolor(out, parts["skin"], SKIN[skin_key])
    if HAIR[hair_key] is not None:
        out = tint_recolor(out, parts["hair"], HAIR[hair_key])
    shirt_target = SHIRT.get(gender)
    if shirt_target is not None:
        out = scale_recolor(out, parts["shirt"], shirt_target)
    image = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))
    return image.resize((OUTPUT_SIZE, OUTPUT_SIZE), Image.Resampling.LANCZOS)


def variant(path: Path, skin_key: str, hair_key: str, gender: str) -> Image.Image:
    rgb = np.asarray(Image.open(path).convert("RGB"), dtype=np.float32)
    return apply_variant(rgb, masks(rgb), skin_key, hair_key, gender)


def overlay_debug(path: Path, dest: Path) -> None:
    rgb = np.asarray(Image.open(path).convert("RGB"), dtype=np.float32)
    parts = masks(rgb)
    out = rgb.copy()
    for key, color in (
        ("skin", np.array([220, 70, 70], dtype=np.float32)),
        ("hair", np.array([50, 90, 230], dtype=np.float32)),
        ("shirt", np.array([50, 200, 90], dtype=np.float32)),
        ("eyes", np.array([250, 230, 40], dtype=np.float32)),
    ):
        mask = parts[key]
        out[mask] = out[mask] * 0.35 + color * 0.65
    Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(dest, quality=86)


def build_all() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    count = 0
    for gender in GENDERS:
        source_gender = "menino" if gender == "outro" else gender
        for hair_type in HAIR_TYPES:
            base = BASES / f"{source_gender}-{hair_type}.jpg"
            if not base.exists():
                raise SystemExit(f"missing base {base}")
            rgb = np.asarray(Image.open(base).convert("RGB"), dtype=np.float32)
            parts = masks(rgb)
            for skin in SKIN:
                for hair in HAIR:
                    dest = OUT / f"{gender}-{skin}-{hair_type}-{hair}.jpg"
                    image = apply_variant(rgb, parts, skin, hair, gender)
                    image.save(dest, quality=84, optimize=True)
                    count += 1
    return count


PREVIEWS = (
    ("menino", "golden", "wavy", "brown"),
    ("menino", "ivory", "short", "blonde"),
    ("menino", "espresso", "puff", "black"),
    ("menino", "amber", "long", "red"),
    ("menino", "bronze", "bun", "gray"),
    ("menino", "peach", "curly", "auburn"),
    ("menina", "peach", "wavy", "black"),
    ("menina", "espresso", "curly", "auburn"),
    ("menina", "ivory", "puff", "blonde"),
    ("menina", "golden", "long", "brown"),
    ("menina", "bronze", "bun", "red"),
    ("outro", "golden", "wavy", "brown"),
    ("outro", "bronze", "puff", "blonde"),
    ("outro", "ivory", "short", "gray"),
)


def build_previews() -> None:
    PREVIEW.mkdir(parents=True, exist_ok=True)
    for gender, skin, hair_type, hair in PREVIEWS:
        source_gender = "menino" if gender == "outro" else gender
        base = BASES / f"{source_gender}-{hair_type}.jpg"
        image = variant(base, skin, hair, gender)
        image.save(
            PREVIEW / f"{gender}-{skin}-{hair_type}-{hair}.jpg",
            quality=86,
        )


def build_debug() -> None:
    PREVIEW.mkdir(parents=True, exist_ok=True)
    for gender in ("menino", "menina"):
        for hair_type in HAIR_TYPES:
            base = BASES / f"{gender}-{hair_type}.jpg"
            overlay_debug(base, PREVIEW / f"mask-{gender}-{hair_type}.jpg")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--debug", action="store_true")
    parser.add_argument("--preview", action="store_true")
    args = parser.parse_args()
    if args.debug:
        build_debug()
        print(f"wrote mask overlays into {PREVIEW}")
        return
    if args.preview:
        build_previews()
        print(f"wrote previews into {PREVIEW}")
        return
    count = build_all()
    print(f"wrote {count} portraits into {OUT}")


if __name__ == "__main__":
    main()
