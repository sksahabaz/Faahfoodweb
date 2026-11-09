"""
Cuts the three illustrations of the order-confirmation page out of the approved design and
saves them as transparent WebP files in public/confirmation/:

    bag.webp        delivery bag with the receipt (hero, left)
    scooter.webp    delivery rider on a scooter (lower-left corner)
    store.webp      restaurant storefront (lower-right corner)

    python scripts/prepare-confirmation-art.py [--debug DIR]

Source: src/assets/images/misc/confirmation-reference-source.png (only read).

The mock-up prints its own rendering of the FAah!! FOOD wordmark on the bag and on the
scooter's box. That lettering is painted out with the surrounding orange: the page puts the
real logo on the bag (as text, see ConfirmationHero) and leaves the box plain.

Each object sits on a smooth peach background, so it is separated with OpenCV GrabCut seeded
with a rough outline (sure foreground well inside it, sure background along the crop border),
plus a per-pixel background estimate (inpainted from the area around the outline) so peach
showing through gaps is treated as background. The edge gets a soft fall-off and edge colours
are pulled from the object's own interior, so no peach halo is left.
"""

import os
import sys

import cv2
import numpy as np

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SOURCE = os.path.join(ROOT, "src", "assets", "images", "misc", "confirmation-reference-source.png")
OUT_DIR = os.path.join(ROOT, "public", "confirmation")

# All coordinates are in source pixels (1672 x 941).
ART = {
    "bag": {
        "crop": (255, 108, 520, 362),
        "shapes": [
            [(334, 136), (442, 118), (470, 192), (342, 204)],                       # receipt
            [(268, 182), (502, 178), (508, 322), (470, 350), (280, 336)],           # bag
        ],
        "exclude": [[(476, 108), (520, 108), (520, 180), (476, 180)]],              # spark lines
        "solid": [[(340, 140), (438, 124), (462, 186), (348, 196)]],                # white receipt
        "lettering": (362, 244, 482, 316),
    },
    "scooter": {
        "crop": (34, 680, 276, 900),
        "shapes": [[(40, 734), (124, 734), (128, 692), (176, 686), (190, 720), (204, 762),
                    (226, 772), (236, 792), (254, 802), (270, 842), (270, 886), (240, 896),
                    (200, 884), (150, 884), (110, 896), (78, 890), (66, 860), (52, 820), (40, 806)]],
        "exclude": [[(34, 893), (276, 893), (276, 900), (34, 900)]],               # ground
        "solid": [],
        "keep_light": [(106, 868, 23), (238, 868, 23)],                              # wheel rims
        "lettering": (50, 756, 100, 792),
    },
    "store": {
        "crop": (1440, 582, 1672, 900),
        "shapes": [[(1442, 788), (1468, 760), (1466, 700), (1544, 690), (1546, 616), (1600, 606),
                    (1622, 588), (1672, 584), (1672, 892), (1442, 892)]],
        "exclude": [[(1440, 880), (1672, 880), (1672, 900), (1440, 900)]],         # orange ground
        "solid": [],
        "lettering": None,
    },
}


def poly(points, x0, y0):
    return np.array([(x - x0, y - y0) for x, y in points], np.int32)


def paint_out_lettering(image, box):
    """Replaces the light lettering inside `box` with the surrounding orange."""
    x0, y0, x1, y1 = box
    region = image[y0:y1, x0:x1]
    hsv = cv2.cvtColor(region, cv2.COLOR_BGR2HSV)
    light = ((hsv[..., 1] < 120) & (hsv[..., 2] > 170)).astype(np.uint8) * 255
    light = cv2.dilate(light, np.ones((5, 5), np.uint8))
    image[y0:y1, x0:x1] = cv2.inpaint(region, light, 7, cv2.INPAINT_TELEA)


def cut(image, spec):
    x0, y0, x1, y1 = spec["crop"]
    crop = image[y0:y1, x0:x1].copy()
    h, w = crop.shape[:2]

    outline = np.zeros((h, w), np.uint8)
    for shape in spec["shapes"]:  # one at a time: fillPoly XORs overlapping polygons
        cv2.fillPoly(outline, [poly(shape, x0, y0)], 255)
    excluded = np.zeros((h, w), np.uint8)
    for shape in spec["exclude"]:
        cv2.fillPoly(excluded, [poly(shape, x0, y0)], 255)

    around = cv2.dilate(outline, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (21, 21)))
    background = cv2.inpaint(crop, around, 12, cv2.INPAINT_TELEA)
    lab = cv2.cvtColor(crop, cv2.COLOR_BGR2LAB).astype(np.float32)
    distance = np.linalg.norm(lab - cv2.cvtColor(background, cv2.COLOR_BGR2LAB).astype(np.float32), axis=2)

    mask = np.full((h, w), cv2.GC_PR_BGD, np.uint8)
    mask[outline > 0] = cv2.GC_PR_FGD
    mask[(outline > 0) & (distance < 9)] = cv2.GC_PR_BGD
    mask[(outline > 0) & (distance < 5)] = cv2.GC_BGD
    core = cv2.erode(outline, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25)))
    mask[(core > 0) & (distance > 12)] = cv2.GC_FGD
    edges = np.zeros((h, w), bool)
    edges[:3, :] = edges[-3:, :] = edges[:, :3] = True
    if x1 < image.shape[1]:
        edges[:, -3:] = True
    else:
        edges[:, -3:] = False  # the storefront runs off the right edge of the design
    # Very light, unsaturated peach inside the outline is background (gaps under the scooter),
    # except where light parts belong to the object (wheel rims).
    hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
    keep = np.zeros((h, w), np.uint8)
    for cx, cy, r in spec.get("keep_light", []):
        cv2.circle(keep, (cx - x0, cy - y0), r, 255, -1)
    light = (hsv[..., 1] < 60) & (hsv[..., 2] > 225) & (keep == 0)
    mask[(outline > 0) & light & (core == 0)] = cv2.GC_BGD
    solid_parts = np.zeros((h, w), np.uint8)
    for shape in spec.get("solid", []):
        cv2.fillPoly(solid_parts, [poly(shape, x0, y0)], 255)
    mask[solid_parts > 0] = cv2.GC_FGD
    mask[edges] = cv2.GC_BGD
    mask[excluded > 0] = cv2.GC_BGD

    bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    cv2.grabCut(crop, mask, None, bgd, fgd, 8, cv2.GC_INIT_WITH_MASK)
    solid = np.isin(mask, (cv2.GC_FGD, cv2.GC_PR_FGD)).astype(np.uint8)

    count, labels, stats, _ = cv2.connectedComponentsWithStats(solid, 8)
    if count > 1:
        keep = [i for i in range(1, count) if stats[i, cv2.CC_STAT_AREA] > 0.02 * stats[1:, cv2.CC_STAT_AREA].max()]
        solid = np.isin(labels, keep).astype(np.uint8)
    solid = cv2.morphologyEx(solid, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
    count, labels, stats, _ = cv2.connectedComponentsWithStats(1 - solid, 4)
    for label in range(1, count):  # small enclosed pin-holes
        hole = labels == label
        if stats[label, cv2.CC_STAT_AREA] < 150 and not (hole[0].any() or hole[-1].any() or hole[:, 0].any()):
            solid[hole] = 1
    solid[solid_parts > 0] = 1
    solid = solid.astype(np.float32)
    solid[excluded > 0] = 0

    alpha = np.clip((cv2.GaussianBlur(solid, (0, 0), 1.2) - 0.5) * 1.7 + 0.5, 0, 1)
    inner = cv2.erode((solid * 255).astype(np.uint8), np.ones((5, 5), np.uint8))
    filled = cv2.inpaint(crop, 255 - inner, 4, cv2.INPAINT_TELEA)
    rgb = np.where(((alpha > 0) & (inner == 0))[..., None], filled, crop)

    ys, xs = np.where(alpha > 0.02)
    t, b, l, r = max(ys.min() - 2, 0), min(ys.max() + 3, h), max(xs.min() - 2, 0), min(xs.max() + 3, w)
    return np.dstack([rgb, (alpha * 255).astype(np.uint8)])[t:b, l:r], (x0 + l, y0 + t)


def main():
    debug = sys.argv[sys.argv.index("--debug") + 1] if "--debug" in sys.argv else None
    source = cv2.imread(SOURCE, cv2.IMREAD_COLOR)
    os.makedirs(OUT_DIR, exist_ok=True)

    for name, spec in ART.items():
        image = source.copy()
        if spec["lettering"]:
            paint_out_lettering(image, spec["lettering"])
        rgba, origin = cut(image, spec)
        out = os.path.join(OUT_DIR, f"{name}.webp")
        cv2.imwrite(out, rgba, [cv2.IMWRITE_WEBP_QUALITY, 90])
        print(f"{name}: {rgba.shape[1]}x{rgba.shape[0]} at {origin}, {os.path.getsize(out) // 1024} KB")

        if debug:
            os.makedirs(debug, exist_ok=True)
            a = rgba[..., 3:4].astype(np.float32) / 255
            for tag, colour in (("dark", (40, 30, 30)), ("peach", (205, 225, 250))):
                composite = rgba[..., :3] * a + np.full(rgba[..., :3].shape, colour, np.float32) * (1 - a)
                cv2.imwrite(os.path.join(debug, f"{name}-on-{tag}.png"), cv2.resize(composite.astype(np.uint8), None, fx=1.6, fy=1.6))


if __name__ == "__main__":
    main()
