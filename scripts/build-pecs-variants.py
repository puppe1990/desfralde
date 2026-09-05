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
HAIR_TYPES = ("short", "wavy", "curly", "long", "puff", "bun")

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

BATHROOM_SLUGS = {
    "descarga",
    "sentar",
    "lavar-maos",
    "ir-banheiro",
}

PREVIEWS = (
    ("menino", "golden", "wavy", "brown"),
    ("menina", "espresso", "puff", "black"),
    ("menina", "ivory", "wavy", "blonde"),
    ("outro", "bronze", "puff", "gray"),
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


def hsv_channels(rgb: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    hsv = rgb_to_hsv(rgb / 255.0)
    return hsv[..., 0], hsv[..., 1], hsv[..., 2]


def detect_background(s: np.ndarray, v: np.ndarray) -> np.ndarray:
    cream = (s < 0.22) & (v > 0.82)
    return border_connected(cream) | cream


def region_box(
    mask: np.ndarray, pad_y: float = 0.06, pad_x: float = 0.08
) -> np.ndarray:
    if not mask.any():
        return np.ones_like(mask, dtype=bool)
    height, width = mask.shape
    ys, xs = np.where(mask)
    box = np.zeros_like(mask, dtype=bool)
    y0 = max(0, int(ys.min() - height * pad_y))
    y1 = min(height, int(ys.max() + height * pad_y))
    x0 = max(0, int(xs.min() - width * pad_x))
    x1 = min(width, int(xs.max() + width * pad_x))
    box[y0:y1, x0:x1] = True
    return box


def detect_floor(
    figure: np.ndarray, h: np.ndarray, s: np.ndarray, v: np.ndarray, slug: str
) -> np.ndarray:
    if slug == "papel":
        return np.zeros_like(figure)
    height, width = figure.shape
    y = np.arange(height)[:, None] / height
    tiles = (
        figure
        & (y > 0.58)
        & (h > 0.07)
        & (h < 0.18)
        & (s > 0.20)
        & (v > 0.35)
        & (v < 0.90)
    )
    seeds = (
        row_seeds(tiles, int(height * 0.86))
        + row_seeds(tiles, int(height * 0.90))
        + row_seeds(tiles, int(height * 0.78))
        + row_seeds(tiles, int(height * 0.94))
        + edge_seeds(tiles, "bottom")
    )
    candidate = flood(tiles, seeds)
    cols = np.where(candidate.any(axis=0))[0]
    span = (int(cols[-1]) - int(cols[0])) / width if len(cols) > 1 else 0.0
    if span >= 0.28 and candidate.mean() >= 0.015:
        return candidate
    shadow = figure & (y > 0.84) & (v < 0.58) & (s < 0.45)
    return tiles | shadow if slug in BATHROOM_SLUGS else shadow


def detect_shorts(
    figure: np.ndarray, h: np.ndarray, s: np.ndarray, v: np.ndarray
) -> np.ndarray:
    shorts = figure & (h > 0.52) & (h < 0.76) & (s > 0.22) & (v > 0.22) & (v < 0.72)
    return largest_component(shorts) if shorts.any() else shorts


def torso_from_shorts(shorts: np.ndarray, figure: np.ndarray) -> np.ndarray:
    if not shorts.any():
        return figure
    height, width = figure.shape
    ys, xs = np.where(shorts)
    top, bottom = int(ys.min()), int(ys.max())
    left, right = int(xs.min()), int(xs.max())
    pad_y = int(height * 0.38)
    pad_x = int(width * 0.18)
    box = np.zeros_like(figure)
    box[
        max(0, top - pad_y) : min(height, bottom + int(height * 0.06)),
        max(0, left - pad_x) : min(width, right + pad_x),
    ] = True
    return figure & box


def yellow_core(h: np.ndarray, s: np.ndarray, v: np.ndarray) -> np.ndarray:
    return (h > 0.085) & (h < 0.17) & (s > 0.40) & (v > 0.45)


def yellow_fill(h: np.ndarray, s: np.ndarray, v: np.ndarray) -> np.ndarray:
    return (h > 0.07) & (h < 0.18) & (s > 0.28) & (v > 0.38)


def fill_garment(
    candidate: np.ndarray,
    figure: np.ndarray,
    hue: np.ndarray,
    shorts: np.ndarray,
    floor: np.ndarray,
    radius: int,
) -> np.ndarray:
    core = largest_component(candidate)
    if not core.any():
        return np.zeros_like(figure)
    return dilate(core, radius) & figure & hue & ~shorts & ~floor


def shirt_band(hair: np.ndarray, shorts: np.ndarray, shape: tuple[int, int]) -> np.ndarray:
    height = shape[0]
    y = np.arange(height)[:, None] / height
    if shorts.any():
        top_of_shorts = int(np.where(shorts.any(axis=1))[0].min()) / height
        top = max(0.22, top_of_shorts - 0.30)
        bottom = top_of_shorts + 0.05
        return (y > top) & (y < bottom)
    if hair.any():
        rows = np.where(hair.any(axis=1))[0]
        top = min(0.42, max(0.28, float(np.percentile(rows, 55)) / height))
        return (y > top) & (y < 0.72)
    return (y > 0.32) & (y < 0.70)


def detect_shirt(
    figure: np.ndarray,
    h: np.ndarray,
    s: np.ndarray,
    v: np.ndarray,
    shorts: np.ndarray,
    floor: np.ndarray,
    hair: np.ndarray,
    slug: str,
) -> np.ndarray:
    band = shirt_band(hair, shorts, figure.shape)
    torso = (torso_from_shorts(shorts, figure) if shorts.any() else figure) & ~floor & band
    yellow_c = torso & yellow_core(h, s, v) & ~shorts
    if int(yellow_c.sum()) <= 500:
        return np.zeros_like(figure)
    shirt = fill_garment(yellow_c, figure, yellow_fill(h, s, v), shorts, floor, 5)
    shirt = shirt | (
        dilate(shirt, 3) & figure & yellow_fill(h, s, v) & band & ~shorts & ~floor
    )
    return shirt & band & ~dilate(hair, 6)


def detect_socks_shoes(
    figure: np.ndarray,
    h: np.ndarray,
    s: np.ndarray,
    v: np.ndarray,
    y: np.ndarray,
    shorts: np.ndarray,
    shirt: np.ndarray,
) -> tuple[np.ndarray, np.ndarray]:
    shoes = figure & (y > 0.68) & (h < 0.08) & (s > 0.28) & (v > 0.28) & (v < 0.85) & ~shirt
    socks = figure & (y > 0.62) & (s < 0.22) & (v > 0.75) & ~shoes
    if shorts.any():
        socks = socks & ~dilate(shorts, 8)
    return socks, shoes


def detect_adult(
    figure: np.ndarray,
    h: np.ndarray,
    s: np.ndarray,
    v: np.ndarray,
    y: np.ndarray,
    shirt: np.ndarray,
    shorts: np.ndarray,
) -> np.ndarray:
    band = figure & (h < 0.12) & (s > 0.16) & (v > 0.30) & (v < 0.92) & (y < 0.38)
    adult = flood(band, edge_seeds(figure & (h < 0.12) & (s > 0.16) & (v > 0.30), "top"))
    return adult & ~shirt & ~shorts


def detect_hair(
    figure: np.ndarray,
    h: np.ndarray,
    s: np.ndarray,
    v: np.ndarray,
    y: np.ndarray,
    clothes: np.ndarray,
    adult: np.ndarray,
    floor: np.ndarray,
) -> np.ndarray:
    dark = (
        figure
        & ~clothes
        & ~adult
        & ~floor
        & (v < 0.48)
        & (s > 0.12)
        & ((h < 0.14) | (h > 0.90))
        & (y < 0.64)
    )
    edge = (
        figure
        & ~clothes
        & ~adult
        & ~floor
        & (v < 0.60)
        & (s > 0.10)
        & ((h < 0.14) | (h > 0.90))
        & (y < 0.68)
    )
    return dark | (dilate(dark, 3) & edge)


def detect_eyes(
    figure: np.ndarray,
    hair: np.ndarray,
    s: np.ndarray,
    v: np.ndarray,
    shirt: np.ndarray,
) -> np.ndarray:
    near_hair = dilate(hair, 6)
    sclera = figure & near_hair & (v > 0.86) & (s < 0.18)
    return dilate(sclera, 1) & figure & near_hair & ~shirt


def detect_skin(
    figure: np.ndarray,
    h: np.ndarray,
    s: np.ndarray,
    v: np.ndarray,
    hair: np.ndarray,
    eyes: np.ndarray,
    clothes: np.ndarray,
    adult: np.ndarray,
    floor: np.ndarray,
    sage: np.ndarray,
    shirt: np.ndarray,
    shorts: np.ndarray,
    socks: np.ndarray,
    slug: str,
) -> np.ndarray:
    body = hair | shirt | shorts | socks
    child = region_box(body, 0.05, 0.07) | dilate(body, 18)
    if slug in BATHROOM_SLUGS and shorts.any():
        width = figure.shape[1]
        xs = np.where(shorts.any(axis=0))[0]
        center = int(xs.mean())
        near = np.abs(np.arange(width) - center)[None, :] < int(width * 0.30)
        child = child & near & dilate(body, 16)
    hue = ((h < 0.14) | (h > 0.90)) & (s > 0.08) & (s < 0.85) & (v > 0.22) & (v < 0.96)
    keep = figure & child & ~hair & ~eyes & ~clothes & ~adult & ~floor & ~sage
    skin = keep & hue
    return dilate(skin, 8) & keep


def papel_masks(
    figure: np.ndarray,
    h: np.ndarray,
    s: np.ndarray,
    v: np.ndarray,
    x: np.ndarray,
    bg: np.ndarray,
) -> dict[str, np.ndarray]:
    peach = figure & (x > 0.50) & (h < 0.14) & (s > 0.12) & (v > 0.28) & (v < 0.95)
    paper = (s < 0.16) & (v > 0.78)
    hand = largest_component(peach & ~paper)
    skin = dilate(hand, 4) & figure & (x > 0.48) & ~paper
    skin = dilate(erode(dilate(skin, 5), 3), 2) & figure & (x > 0.48) & ~paper
    empty = np.zeros_like(figure)
    return {"skin": skin, "hair": empty, "shirt": empty, "eyes": empty, "bg": bg}


def masks(rgb: np.ndarray, slug: str) -> dict[str, np.ndarray]:
    h, s, v = hsv_channels(rgb)
    height, width = rgb.shape[:2]
    y = np.arange(height)[:, None] / height
    x = np.arange(width)[None, :] / width
    bg = detect_background(s, v)
    figure = ~bg
    if slug == "papel":
        return papel_masks(figure, h, s, v, x, bg)
    sage = figure & (h > 0.22) & (h < 0.48) & (s > 0.12) & (v > 0.35) & (v < 0.82)
    floor = detect_floor(figure, h, s, v, slug)
    shorts = detect_shorts(figure, h, s, v)
    empty = np.zeros_like(figure)
    hair_guess = detect_hair(figure, h, s, v, y, shorts, empty, floor)
    shirt = detect_shirt(figure, h, s, v, shorts, floor, hair_guess, slug)
    socks, shoes = detect_socks_shoes(figure, h, s, v, y, shorts, shirt)
    adult = detect_adult(figure, h, s, v, y, shirt, shorts)
    clothes = shorts | socks | shoes | shirt
    hair = detect_hair(figure, h, s, v, y, clothes, adult, floor)
    eyes = detect_eyes(figure, hair, s, v, shirt)
    skin = detect_skin(
        figure,
        h,
        s,
        v,
        hair,
        eyes,
        clothes,
        adult,
        floor,
        sage,
        shirt,
        shorts,
        socks,
        slug,
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


def source_for(slug: str, gender: str, hair_type: str = "wavy") -> Path:
    source_gender = "menino" if gender == "outro" else gender
    named = BASES / f"{source_gender}-{hair_type}-{slug}.jpg"
    if named.exists():
        return named
    if hair_type == "puff":
        puff = BASES / f"{source_gender}-puff-{slug}.jpg"
        if puff.exists():
            return puff
    if hair_type == "wavy" and source_gender == "menina":
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
        dest_dir = OUT / slug
        dest_dir.mkdir(parents=True, exist_ok=True)
        for gender in GENDERS:
            for hair_type in HAIR_TYPES:
                rgb = load_rgb(source_for(slug, gender, hair_type))
                parts = masks(rgb, slug)
                for skin in SKIN:
                    for hair in HAIR:
                        dest = dest_dir / f"{gender}-{skin}-{hair_type}-{hair}.jpg"
                        image = apply_variant(rgb, parts, skin, hair, gender)
                        image.save(dest, quality=84, optimize=True)
                        count += 1
    return count


def build_preview(selected: str | None = None) -> int:
    count = 0
    for slug in slugs_from_args(selected):
        dest_dir = OUT / slug
        dest_dir.mkdir(parents=True, exist_ok=True)
        cache: dict[tuple[str, str, str], tuple[np.ndarray, dict[str, np.ndarray]]] = {}
        for gender, skin, hair_type, hair in PREVIEWS:
            key = (slug, gender, hair_type)
            if key not in cache:
                rgb = load_rgb(source_for(slug, gender, hair_type))
                cache[key] = (rgb, masks(rgb, slug))
            rgb, parts = cache[key]
            dest = dest_dir / f"{gender}-{skin}-{hair_type}-{hair}.jpg"
            apply_variant(rgb, parts, skin, hair, gender).save(
                dest, quality=84, optimize=True
            )
            count += 1
    return count


def build_debug(selected: str | None = None) -> None:
    DEBUG.mkdir(parents=True, exist_ok=True)
    for slug in slugs_from_args(selected):
        for gender in ("menino", "menina"):
            rgb = load_rgb(source_for(slug, gender, "wavy"))
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
