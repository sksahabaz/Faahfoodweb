"""
Cuts the drink, burger and fries group out of the approved login-page design and saves it as
a transparent WebP for the login page: public/auth/meal.webp.

    python scripts/prepare-login-art.py [--debug DIR]

Source: src/assets/images/misc/login-reference-source.png (only read). Only the meal group
is used; the page's background, waves, tomato, leaves and spark lines are rebuilt in CSS/SVG.

The group sits on a smooth peach background, so it is separated with OpenCV GrabCut, seeded
with rough outlines of the glass, the burger and the fries box (sure foreground inside, sure
background along the crop border). The tomato in the corner and the orange spark lines next to
the fries are excluded explicitly. Pixels close to the background estimated around them
(inpainted from the surrounding peach) are treated as background, so the gaps between the
fries stay transparent. The edge gets a ~1.5 px soft fall-off and edge colours are
pulled from the object's own interior, so no peach halo is left.
"""

import os
import sys

import cv2
import numpy as np

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SOURCE = os.path.join(ROOT, "src", "assets", "images", "misc", "login-reference-source.png")
OUT = os.path.join(ROOT, "public", "auth", "meal.webp")

# Crop of the source (x0, y0, x1, y1) that holds the whole group.
CROP = (214, 548, 770, 915)

# Rough outlines in source coordinates: probable foreground inside.
GLASS = [(226, 578), (426, 578), (414, 860), (238, 860)]
FRIES = [(478, 556), (733, 556), (729, 862), (622, 866), (600, 660), (478, 640)]
BURGER = [(330, 700), (370, 655), (430, 640), (520, 640), (590, 655), (628, 700), (640, 745),
          (647, 775), (640, 800), (635, 835), (632, 870), (610, 886), (480, 890), (340, 886),
          (316, 870), (313, 835), (306, 800), (300, 775), (310, 745), (318, 700)]

# Never part of the group: the tomato (bottom-left) and the spark lines (top-right).
EXCLUDE = [
    [(0, 862), (262, 862), (262, 941), (0, 941)],
    [(0, 0), (223, 0), (223, 941), (0, 941)],
    [(728, 0), (900, 0), (900, 640), (728, 640)],
]


def to_crop(points):
    x0, y0 = CROP[:2]
    return np.array([(x - x0, y - y0) for x, y in points], np.int32)


def main():
    debug = sys.argv[sys.argv.index("--debug") + 1] if "--debug" in sys.argv else None
    image = cv2.imread(SOURCE, cv2.IMREAD_COLOR)
    x0, y0, x1, y1 = CROP
    crop = image[y0:y1, x0:x1].copy()
    h, w = crop.shape[:2]

    outline = np.zeros((h, w), np.uint8)
    for shape in (GLASS, FRIES, BURGER):  # one at a time: fillPoly XORs overlapping polygons
        cv2.fillPoly(outline, [to_crop(shape)], 255)
    # The burger and the glass are solid: no background shows through them.
    solid_shapes = np.zeros((h, w), np.uint8)
    for shape in (GLASS, BURGER):
        cv2.fillPoly(solid_shapes, [to_crop(shape)], 255)

    # Background estimate under the objects, filled in from the peach around them.
    around = cv2.dilate(outline, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25)))
    background = cv2.inpaint(crop, around, 15, cv2.INPAINT_TELEA)
    lab = cv2.cvtColor(crop, cv2.COLOR_BGR2LAB).astype(np.float32)
    lab_bg = cv2.cvtColor(background, cv2.COLOR_BGR2LAB).astype(np.float32)
    distance = np.linalg.norm(lab - lab_bg, axis=2)
    glass = np.zeros((h, w), np.uint8)
    cv2.fillPoly(glass, [to_crop(GLASS)], 255)

    mask = np.full((h, w), cv2.GC_PR_BGD, np.uint8)
    mask[outline > 0] = cv2.GC_PR_FGD
    core = cv2.erode(outline, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (41, 41)))
    mask[(core > 0) & (distance > 14)] = cv2.GC_FGD
    # Peach showing between the fries or beside the glass: background. The glass rim and
    # ice are pale too, so the glass gets a stricter threshold.
    looks_like_bg = np.where(glass > 0, distance < 7, distance < 13)
    mask[(outline > 0) & looks_like_bg] = cv2.GC_PR_BGD
    mask[(outline > 0) & np.where(glass > 0, distance < 4, distance < 8)] = cv2.GC_BGD
    burger_core = cv2.erode(solid_shapes, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (31, 31)))
    mask[burger_core > 0] = cv2.GC_FGD
    mask[:4, :] = mask[-3:, :] = mask[:, :3] = mask[:, -3:] = cv2.GC_BGD
    excluded = np.zeros((h, w), np.uint8)
    for shape in EXCLUDE:
        cv2.fillPoly(excluded, [to_crop(shape)], 255)
    mask[excluded > 0] = cv2.GC_BGD

    bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    cv2.grabCut(crop, mask, None, bgd, fgd, 8, cv2.GC_INIT_WITH_MASK)
    solid = np.isin(mask, (cv2.GC_FGD, cv2.GC_PR_FGD)).astype(np.uint8)

    # Keep the main body only and smooth the outline.
    count, labels, stats, _ = cv2.connectedComponentsWithStats(solid, 8)
    if count > 1:
        biggest = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        solid = (labels == biggest).astype(np.uint8)
    solid = cv2.morphologyEx(solid, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
    # Fill enclosed holes: always inside the burger and glass (pale highlights), only small
    # ones elsewhere (larger gaps between the fries are real background).
    count, labels, stats, _ = cv2.connectedComponentsWithStats(1 - solid, 4)
    for label in range(1, count):
        hole = labels == label
        touches_border = hole[0].any() or hole[-1].any() or hole[:, 0].any() or hole[:, -1].any()
        if not touches_border and (stats[label, cv2.CC_STAT_AREA] < 120 or solid_shapes[hole].mean() > 200):
            solid[hole] = 1
    solid = solid.astype(np.float32)
    solid[excluded > 0] = 0
    alpha = cv2.GaussianBlur(solid, (0, 0), 1.4)
    alpha = np.clip((alpha - 0.5) * 1.6 + 0.5, 0, 1)

    # Edge colours: take them from slightly inside the object so no peach fringe remains.
    inner = cv2.erode((solid * 255).astype(np.uint8), np.ones((5, 5), np.uint8))
    filled = cv2.inpaint(crop, 255 - inner, 4, cv2.INPAINT_TELEA)
    edge = ((alpha > 0) & (inner == 0))[..., None]
    rgb = np.where(edge, filled, crop)

    # Trim to the visible pixels plus a small margin.
    ys, xs = np.where(alpha > 0.02)
    t, b, l, r = max(ys.min() - 2, 0), min(ys.max() + 3, h), max(xs.min() - 2, 0), min(xs.max() + 3, w)
    rgba = np.dstack([rgb, (alpha * 255).astype(np.uint8)])[t:b, l:r]

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    cv2.imwrite(OUT, rgba, [cv2.IMWRITE_WEBP_QUALITY, 92])
    print(f"{os.path.normpath(OUT)}  {rgba.shape[1]}x{rgba.shape[0]}  {os.path.getsize(OUT) // 1024} KB")

    if debug:
        os.makedirs(debug, exist_ok=True)
        a = rgba[..., 3:4].astype(np.float32) / 255
        for name, colour in (("dark", (40, 30, 30)), ("white", (255, 255, 255)), ("peach", (205, 225, 250))):
            bg = np.full(rgba[..., :3].shape, colour, np.float32)
            out = rgba[..., :3] * a + bg * (1 - a)
            cv2.imwrite(os.path.join(debug, f"meal-on-{name}.png"), cv2.resize(out.astype(np.uint8), None, fx=1.5, fy=1.5))


if __name__ == "__main__":
    main()
