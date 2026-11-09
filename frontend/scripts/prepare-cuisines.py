"""
Cuts the nine cuisine illustrations out of the approved category sheet
(src/assets/images/cuisines/cuisine-sheet-source.png, only read) and saves each as a
transparent square WebP in public/cuisines/<id>.webp.

    python scripts/prepare-cuisines.py

Every tile on the sheet is: an orange disc with the food (radius ~100 px), a white ring,
a soft peach shadow, and a label underneath (the selected tile also has an orange outline
and an orange pill). Kept: the disc + any food that crosses the ring (chopsticks, straw,
pizza crust, leaves, orange slices). Dropped: ring, shadow, outline, labels, pill: the
component draws ring, selection and shadow in CSS so they can animate.

All outputs share one geometry (see DISC_SHARE): the disc centre is the image centre and the
disc diameter is DISC_SHARE of the image size, so the component can size them identically.
"""

import os

import cv2
import numpy as np

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SOURCE = os.path.join(ROOT, "src", "assets", "images", "cuisines", "cuisine-sheet-source.png")
OUT = os.path.join(ROOT, "public", "cuisines")

IDS = ["all", "biryani", "pizza", "burgers", "chinese", "south-indian", "desserts", "healthy", "beverages"]
APPROX_CENTRES = [153, 391, 625, 861, 1097, 1329, 1565, 1800, 2035]  # x; y ~ 325
DISC_R = 100.0   # orange disc radius (px on the sheet)
RING_OUT = 112   # outside the white ring (and the selected tile's orange outline: 112-117)
HALF = 140       # output covers centre ± HALF px (room for food crossing the ring)
SIZE = 2 * HALF  # 280 px, no upscaling
DISC_SHARE = 2 * DISC_R / SIZE


def refine_centre(sat, x0, y0):
    """Centre where a radius-DISC_R circle best separates the saturated disc from the pale ring."""
    best, best_xy = -1e9, (x0, y0)
    yy, xx = np.mgrid[-130:131, -130:131]
    for dy in range(-8, 9):
        for dx in range(-8, 9):
            cx, cy = x0 + dx, y0 + dy
            patch = sat[cy - 130:cy + 131, cx - 130:cx + 131]
            r = np.hypot(xx, yy)
            inside = patch[(r > DISC_R - 12) & (r < DISC_R - 2)].mean()
            ring = patch[(r > DISC_R + 3) & (r < DISC_R + 9)].mean()
            if inside - ring > best:
                best, best_xy = inside - ring, (cx, cy)
    return best_xy


def main():
    PAD = 180  # the last tile sits close to the sheet's right edge
    sheet = cv2.copyMakeBorder(cv2.imread(SOURCE, cv2.IMREAD_COLOR), PAD, PAD, PAD, PAD, cv2.BORDER_REPLICATE)
    hsv = cv2.cvtColor(sheet, cv2.COLOR_BGR2HSV).astype(np.float32)
    sat, val = hsv[..., 1], hsv[..., 2]
    os.makedirs(OUT, exist_ok=True)
    yy, xx = np.mgrid[-HALF:HALF, -HALF:HALF]
    r = np.hypot(xx + 0.5, yy + 0.5)

    for name, x0 in zip(IDS, APPROX_CENTRES):
        cx, cy = refine_centre(sat, x0 + PAD, 325 + PAD)
        crop = sheet[cy - HALF:cy + HALF, cx - HALF:cx + HALF].astype(np.float32)
        s, v = sat[cy - HALF:cy + HALF, cx - HALF:cx + HALF], val[cy - HALF:cy + HALF, cx - HALF:cx + HALF]

        disc = np.clip(DISC_R + 0.5 - r, 0, 1)  # anti-aliased disc edge
        # Food beyond the disc: clearly coloured or dark; the ring/background/shadow are pale.
        h = hsv[cy - HALF:cy + HALF, cx - HALF:cx + HALF, 0]
        # The peach shadow around each tile is pale orange (S <= ~140, V > 235); food that crosses
        # the ring is vivid (straw, orange slices, crust), dark (chopsticks) or green (leaves).
        food = ((s > 150) | (v < 205) | ((h > 25) & (h < 90) & (s > 60))) & (r > DISC_R - 2)
        if name == "all":
            food &= ~((r > RING_OUT - 2) & (r < RING_OUT + 7))  # the selected tile's orange outline
        food = cv2.morphologyEx(food.astype(np.uint8), cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
        # keep only pieces attached to the disc (food crossing the ring), drop shadow specks
        attached = food | (r <= DISC_R).astype(np.uint8)
        count, labels = cv2.connectedComponents(attached, connectivity=8)
        main_label = labels[HALF, HALF]
        food = (labels == main_label) & (r > DISC_R)
        food = cv2.GaussianBlur(food.astype(np.float32), (0, 0), 0.8)
        alpha = np.clip(np.maximum(disc, np.clip((food - 0.2) / 0.6, 0, 1)), 0, 1)

        rgba = np.dstack([crop, alpha * 255]).astype(np.uint8)
        rgba[alpha < 0.01, :3] = 0
        path = os.path.join(OUT, f"{name}.webp")
        cv2.imwrite(path, rgba, [cv2.IMWRITE_WEBP_QUALITY, 88])
        outside = int(((alpha > 0.5) & (r > DISC_R + 2)).sum())
        print(f"{name:13s} centre ({cx - PAD},{cy - PAD})  {SIZE}x{SIZE}  {os.path.getsize(path) // 1024} KB  food beyond disc: {outside} px")
    print(f"disc share of the image: {DISC_SHARE:.4f}")


if __name__ == "__main__":
    main()
