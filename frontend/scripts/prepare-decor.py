"""
Cuts single floating ingredients out of the FAah!! FOOD ingredient photos
(transparent PNGs in src/assets/images) and saves them as small transparent WebP
sprites in public/decor/ for the page background (PageBackdrop).

    python scripts/prepare-decor.py

The source PNGs are only read. Each sprite = one connected piece of a photo, kept with
its soft edge (water drops, blur), cropped, scaled down and saved as WebP.
"""

import os

import cv2
import numpy as np

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SRC = os.path.join(ROOT, "src", "assets", "images")
OUT = os.path.join(ROOT, "public", "decor")

# name: (source photo, piece rank by area, max size px)
# (crumbs, seeds, lettuce, onion ring and tomato slices already exist in public/decor)
SPRITES = {
    "cheese-slice": ("burger/cheese-slice.png", 0, 760),
    "cheese-drop-1": ("burger/cheese-slice.png", 1, 140),
    "cheese-drop-2": ("burger/cheese-slice.png", 2, 140),
    "tomato-slice-soft": ("ingredients/tomato-slices.png", 1, 520),
    "basil-leaf-soft": ("ingredients/tomato-slices.png", 3, 260),
    "onion-petal-1": ("ingredients/onion-rings.png", 2, 240),
    "onion-petal-2": ("ingredients/onion-rings.png", 3, 240),
}


def pieces(image):
    """Connected pieces of the photo, largest first: (mask, x, y, w, h)."""
    solid = (image[:, :, 3] > 90).astype(np.uint8)
    count, labels, stats, _ = cv2.connectedComponentsWithStats(solid, 8)
    order = sorted(range(1, count), key=lambda i: -stats[i, cv2.CC_STAT_AREA])
    return [(labels == i, *stats[i][:4]) for i in order]


def cut(image, piece, max_size, pad=24):
    mask, x, y, w, h = piece
    grown = cv2.dilate(mask.astype(np.uint8), np.ones((15, 15), np.uint8)) > 0  # keep the soft edge
    sprite = image.copy()
    sprite[:, :, 3] = np.where(grown, sprite[:, :, 3], 0)
    sprite = sprite[max(y - pad, 0):min(y + h + pad, image.shape[0]), max(x - pad, 0):min(x + w + pad, image.shape[1])]
    scale = min(1.0, max_size / max(sprite.shape[:2]))
    if scale < 1:
        sprite = cv2.resize(sprite, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
    sprite[sprite[:, :, 3] == 0, :3] = 0  # no stray colour under fully transparent pixels
    return sprite


def main():
    os.makedirs(OUT, exist_ok=True)
    cache = {}
    for name, (source, rank, max_size) in SPRITES.items():
        if source not in cache:
            image = cv2.imread(os.path.join(SRC, source), cv2.IMREAD_UNCHANGED)
            cache[source] = (image, pieces(image))
        image, found = cache[source]
        sprite = cut(image, found[rank], max_size)
        path = os.path.join(OUT, f"{name}.webp")
        cv2.imwrite(path, sprite, [cv2.IMWRITE_WEBP_QUALITY, 86])
        print(f"{name:20s} {sprite.shape[1]}x{sprite.shape[0]}  {os.path.getsize(path) // 1024} KB")


if __name__ == "__main__":
    main()
