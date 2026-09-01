#!/usr/bin/env python3
"""Recolor PECS cards so the child matches the selected avatar's skin, hair and shirt."""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
PECS = ROOT / "public" / "pecs"
BASES = PECS / "bases"
OUT = PECS / "tinted"
DEBUG = PECS / "debug"

WORKING_SIZE = 640

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

CHARACTER_CARDS = {
    "xixi": "xixi-pedido.jpg",
    "coco": "coco-pedido.jpg",
    "ajuda": "ajuda.jpg",
    "ir-banheiro": "ir-banheiro.jpg",
    "sentar": "sentar.jpg",
    "lavar-maos": "lavar-maos.jpg",
    "secar-maos": "secar-maos.jpg",
    "subir-calca": "subir-calca.jpg",
    "pronto": "pronto.jpg",
    "descarga": "descarga.jpg",
    "papel": "papel.jpg",
}

PREVIEWS = (
    ("menino", "golden", "brown"),
    ("menina", "espresso", "black"),
    ("menina", "ivory", "blonde"),
    ("outro", "bronze", "gray"),
)


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


def flood(mask: np.ndarray, seeds: list[tuple[int, int]]) -> np.ndarray:
    if not seeds:
        return np.zeros_like(mask, dtype=bool)
    canvas = Image.fromarray(mask.astype(np.uint8) * 255)
    marked = np.zeros(mask.shape, dtype=bool)
    for x, y in seeds:
        if y < 0 or x < 0 or y >= mask.shape[0] or x >= mask.shape[1]:
            continue
        if marked[y, x] or not mask[y, x]:
            continue
        filled = canvas.copy()
        ImageDraw.floodfill(filled, (int(x), int(y)), 128)
        marked |= np.asarray(filled) == 128
    return marked


def largest_component(mask: np.ndarray) -> np.ndarray:
    ys, xs = np.where(mask)
    if len(xs) == 0:
        return np.zeros_like(mask, dtype=bool)
    remaining = mask.copy()
    best = np.zeros_like(mask, dtype=bool)
    best_n = 0
    for i in range(0, len(xs), 32):
        x, y = int(xs[i]), int(ys[i])
        if not remaining[y, x]:
            continue
        region = flood(remaining, [(x, y)])
        remaining &= ~region
        n = int(region.sum())
        if n > best_n:
            best = region
            best_n = n
    return best


def row_seeds(mask: np.ndarray, row: int, step: int = 6) -> list[tuple[int, int]]:
    height, width = mask.shape
    y = min(max(row, 0), height - 1)
    return [(x, y) for x in range(0, width, step) if mask[y, x]]


def edge_seeds(mask: np.ndarray, edge: str, step: int = 4) -> list[tuple[int, int]]:
    height, width = mask.shape
    if edge == "top":
        return [(x, 0) for x in range(0, width, step) if mask[0, x]]
    if edge == "bottom":
        return [(x, height - 1) for x in range(0, width, step) if mask[height - 1, x]]
    return []


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


def torso_from_shorts(shorts: np.ndarray, figure: np.ndarray) -> np.ndarray:
    if not shorts.any():
        return np.zeros_like(figure)
    height, width = figure.shape
    ys, xs = np.where(shorts)
    top, bottom = int(ys.min()), int(ys.max())
    left, right = int(xs.min()), int(xs.max())
    pad_y = int(height * 0.34)
    pad_x = int(width * 0.14)
    box = np.zeros_like(figure)
    box[
        max(0, top - pad_y) : min(height, bottom + int(height * 0.04)),
        max(0, left - pad_x) : min(width, right + pad_x),
    ] = True
    return figure & box


def masks(rgb: np.ndarray, slug: str) -> dict[str, np.ndarray]:
    hsv = rgb_to_hsv(rgb / 255.0)
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    height, width = rgb.shape[:2]
    y = np.arange(height)[:, None] / height
    x = np.arange(width)[None, :] / width

    cream = (s < 0.22) & (v > 0.82)
    bg = border_connected(cream) | cream
    figure = ~bg

    sage_wall = figure & (h > 0.22) & (h < 0.48) & (s > 0.12) & (v > 0.35) & (v < 0.82)
    shorts = figure & (h > 0.52) & (h < 0.76) & (s > 0.22) & (v > 0.22) & (v < 0.72)
    shorts = largest_component(shorts) if shorts.any() else shorts

    yellow = (h > 0.085) & (h < 0.17) & (s > 0.40) & (v > 0.45)
    yellow_fill = (h > 0.08) & (h < 0.175) & (s > 0.36) & (v > 0.42)

    floor = np.zeros_like(figure)
    if slug != "papel":
        tiles = (
            figure
            & (y > 0.62)
            & (h > 0.09)
            & (h < 0.17)
            & (s > 0.28)
            & (v > 0.42)
            & (v < 0.86)
        )
        floor_seeds = (
            row_seeds(tiles, int(height * 0.86))
            + row_seeds(tiles, int(height * 0.90))
            + row_seeds(tiles, int(height * 0.78))
        )
        candidate = flood(tiles, floor_seeds)
        cols = np.where(candidate.any(axis=0))[0]
        span = (int(cols[-1]) - int(cols[0])) / width if len(cols) > 1 else 0.0
        if span >= 0.35 and candidate.mean() >= 0.02:
            floor = candidate

    if slug == "papel":
        peach = (
            figure
            & (x > 0.50)
            & (h < 0.14)
            & (s > 0.12)
            & (v > 0.28)
            & (v < 0.95)
        )
        paper = (s < 0.16) & (v > 0.78)
        hand = largest_component(peach & ~paper)
        skin = dilate(hand, 3) & figure & (x > 0.48) & ~paper & (h < 0.15)
        empty = np.zeros_like(figure)
        return {"skin": skin, "hair": empty, "shirt": empty, "eyes": empty, "bg": bg}

    torso = torso_from_shorts(shorts, figure) & ~floor
    yellow_core = torso & yellow & ~floor
    if int(yellow_core.sum()) > 800:
        shirt = dilate(yellow_core, 5) & figure & yellow_fill & ~shorts & ~floor
    else:
        shirt = np.zeros_like(figure)

    if not shirt.any():
        coral = torso & (h < 0.075) & (s > 0.48) & (v > 0.38) & (v < 0.88) & ~shorts
        garment = dilate(coral, 6) & torso & (h < 0.085) & (s > 0.42) & ~shorts
    else:
        garment = shirt

    socks = figure & (s < 0.26) & (v > 0.70) & (y > 0.52)
    if shorts.any():
        socks = socks & dilate(shorts, 22)
    shoes = (
        figure
        & ~socks
        & ~shirt
        & (h < 0.085)
        & (s > 0.30)
        & (v > 0.28)
        & (v < 0.82)
        & dilate(socks, 16)
    )

    adult = flood(
        figure & (h < 0.12) & (s > 0.16) & (v > 0.30) & (v < 0.92) & (y < 0.38),
        edge_seeds(figure & (h < 0.12) & (s > 0.16) & (v > 0.30), "top"),
    )
    adult = adult & ~shirt & ~shorts

    clothes = shorts | socks | shoes | garment | shirt
    dark_hair = (
        figure
        & ~clothes
        & ~adult
        & ~floor
        & (v < 0.48)
        & (s > 0.12)
        & ((h < 0.14) | (h > 0.90))
        & (y < 0.64)
    )
    hair_edge = (
        figure
        & ~clothes
        & ~adult
        & ~floor
        & (v < 0.60)
        & (s > 0.10)
        & ((h < 0.14) | (h > 0.90))
        & (y < 0.68)
    )
    hair = dark_hair | (dilate(dark_hair, 3) & hair_edge)

    near_hair = dilate(hair, 10)
    sclera = figure & near_hair & (v > 0.78) & (s < 0.32)
    eyes = dilate(sclera, 2) & figure & near_hair & ~shirt

    child = dilate(shorts | shirt | hair | socks, 26)
    skin = (
        figure
        & child
        & ~hair
        & ~eyes
        & ~clothes
        & ~adult
        & ~floor
        & ~sage_wall
        & (h < 0.12)
        & (s > 0.20)
        & (s < 0.72)
        & (v > 0.30)
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
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))


def source_for(slug: str, gender: str) -> Path:
    if gender == "menina":
        girl = BASES / f"menina-{slug}.jpg"
        if girl.exists():
            return girl
    return PECS / CHARACTER_CARDS[slug]


def load_rgb(path: Path) -> np.ndarray:
    image = Image.open(path).convert("RGB")
    if image.size != (WORKING_SIZE, WORKING_SIZE):
        image = image.resize((WORKING_SIZE, WORKING_SIZE), Image.Resampling.LANCZOS)
    return np.asarray(image, dtype=np.float32)


def write_overlay(rgb: np.ndarray, parts: dict[str, np.ndarray], dest: Path) -> None:
    out = rgb.copy()
    for key, color in (
        ("skin", np.array([220, 70, 70], dtype=np.float32)),
        ("hair", np.array([50, 90, 230], dtype=np.float32)),
        ("shirt", np.array([50, 200, 90], dtype=np.float32)),
    ):
        mask = parts[key]
        out[mask] = out[mask] * 0.35 + color * 0.65
    dest.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(dest, quality=86)


def slugs_from_args(selected: str | None) -> list[str]:
    if not selected:
        return list(CHARACTER_CARDS)
    if selected not in CHARACTER_CARDS:
        raise SystemExit(f"unknown slug {selected}")
    return [selected]


def build_all(selected: str | None = None) -> int:
    count = 0
    for slug in slugs_from_args(selected):
        for gender in GENDERS:
            rgb = load_rgb(source_for(slug, gender))
            parts = masks(rgb, slug)
            dest_dir = OUT / slug
            dest_dir.mkdir(parents=True, exist_ok=True)
            for skin in SKIN:
                for hair in HAIR:
                    dest = dest_dir / f"{gender}-{skin}-{hair}.jpg"
                    image = apply_variant(rgb, parts, skin, hair, gender)
                    image.save(dest, quality=84, optimize=True)
                    count += 1
    return count


def build_preview(selected: str | None = None) -> int:
    count = 0
    for slug in slugs_from_args(selected):
        dest_dir = OUT / slug
        dest_dir.mkdir(parents=True, exist_ok=True)
        cache: dict[tuple[str, str], tuple[np.ndarray, dict[str, np.ndarray]]] = {}
        for gender, skin, hair in PREVIEWS:
            key = (slug, gender)
            if key not in cache:
                rgb = load_rgb(source_for(slug, gender))
                cache[key] = (rgb, masks(rgb, slug))
            rgb, parts = cache[key]
            dest = dest_dir / f"{gender}-{skin}-{hair}.jpg"
            apply_variant(rgb, parts, skin, hair, gender).save(
                dest, quality=84, optimize=True
            )
            count += 1
    return count


def build_debug(selected: str | None = None) -> None:
    DEBUG.mkdir(parents=True, exist_ok=True)
    for slug in slugs_from_args(selected):
        for gender in ("menino", "menina"):
            rgb = load_rgb(source_for(slug, gender))
            parts = masks(rgb, slug)
            write_overlay(rgb, parts, DEBUG / f"mask-{gender}-{slug}.jpg")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--debug", action="store_true")
    parser.add_argument("--preview", action="store_true")
    parser.add_argument("--slug")
    args = parser.parse_args()
    if args.debug:
        build_debug(args.slug)
        print(f"wrote mask overlays into {DEBUG}")
        return
    if args.preview:
        count = build_preview(args.slug)
        print(f"wrote {count} preview PECS variants into {OUT}")
        return
    count = build_all(args.slug)
    print(f"wrote {count} PECS variants into {OUT}")


if __name__ == "__main__":
    main()
