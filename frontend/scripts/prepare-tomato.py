"""
Cuts the whole tomato (red skin, water drops, green stem and leaves) out of the supplied
tomato artwork and saves it as a transparent WebP: public/decor/tomato-whole.webp.

    python scripts/prepare-tomato.py

Source: src/assets/images/ingredients/tomato-whole-source.png (only read). In that image the
black background is already transparent, but an opaque orange ribbon runs behind the tomato.
The tomato is separated by colour, which is reliable here:
    skin   deep red          red/green > 2.3   (the ribbon is orange/peach: red/green < 1.8)
    calyx  green, incl. the dark stem (green >= red, almost no blue)
Holes from bright droplet highlights are filled, the edge gets a ~1 px soft fall-off, and the
colour of edge pixels is replaced by the tomato's own nearby colour so no peach or black halo
is left. The tomato touches the image's left and bottom edges (it is cropped there in the
source), so it is meant for corner placements, partly off-screen.
"""

import os

import cv2
import numpy as np

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SOURCE = os.path.join(ROOT, "src", "assets", "images", "ingredients", "tomato-whole-source.png")
OUT = os.path.join(ROOT, "public", "decor", "tomato-whole.webp")
MAX_WIDTH = 900


def fill_holes(mask):
    """Fills regions fully enclosed by the mask (droplet highlights inside the skin)."""
    h, w = mask.shape
    flood = np.pad(mask, 1).astype(np.uint8) * 255
    cv2.floodFill(flood, np.zeros((h + 4, w + 4), np.uint8), (0, 0), 128)
    return (mask > 0) | (flood[1:-1, 1:-1] == 0)


def main():
    image = cv2.imread(SOURCE, cv2.IMREAD_UNCHANGED)
    bgr = image[..., :3].astype(np.float32)
    alpha_src = image[..., 3].astype(np.float32) / 255 if image.shape[2] == 4 else np.ones(image.shape[:2], np.float32)
    b, g, r = bgr[..., 0], bgr[..., 1], bgr[..., 2]
    visible = alpha_src > 0.5

    skin = (visible & (r > 110) & (r > g * 2.3)).astype(np.uint8)
    calyx = (visible & (g >= r * 0.95) & (g > b * 1.6) & (g > 18)).astype(np.uint8)

    # The skin outline is ragged where the tomato met the ribbon: open away slivers, then
    # smooth the silhouette (blur + re-threshold) so the tomato keeps its natural round edge.
    # Padded by edge replication so the left/bottom image cut stays straight.
    pad = 40
    skin = cv2.copyMakeBorder(fill_holes(skin).astype(np.uint8), pad, pad, pad, pad, cv2.BORDER_REPLICATE)
    skin = cv2.morphologyEx(skin, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (23, 23)))
    skin = (cv2.GaussianBlur(skin.astype(np.float32), (0, 0), 7) > 0.5).astype(np.uint8)[pad:-pad, pad:-pad]
    # Leaves: drop dark specks that are not part of the stem/leaf structure.
    calyx = cv2.morphologyEx(calyx, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    solid = (skin | calyx).astype(np.uint8)

    # The tomato = the largest piece (skin and calyx touch); drop specks of stray colour.
    count, labels, stats, _ = cv2.connectedComponentsWithStats(solid, 8)
    biggest = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    keep = [i for i in range(1, count) if i == biggest or stats[i, cv2.CC_STAT_AREA] > 0.02 * stats[biggest, cv2.CC_STAT_AREA]]
    solid = np.isin(labels, keep).astype(np.uint8)
    solid = cv2.morphologyEx(solid, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    solid = fill_holes(solid).astype(np.uint8)

    # Soft ~1 px edge, never wider than the source's own alpha.
    alpha = cv2.GaussianBlur(solid.astype(np.float32), (0, 0), 0.9)
    alpha = np.clip((alpha - 0.15) / 0.7, 0, 1) * alpha_src

    # Edge colour clean-up: pixels near the boundary take the tomato's own nearby colour.
    core = cv2.erode(solid, np.ones((5, 5), np.uint8)).astype(np.float32)
    weight = cv2.GaussianBlur(core, (0, 0), 3)
    spread = cv2.GaussianBlur(bgr * core[..., None], (0, 0), 3) / np.maximum(weight, 1e-4)[..., None]
    inside = cv2.GaussianBlur(core, (0, 0), 0.8)[..., None]
    cleaned = bgr * inside + spread * (1 - inside)
    # Thin parts (leaf tips, narrower than the core erosion) have no interior to borrow from:
    # they keep their own colour instead of fading to black.
    own = np.clip(weight / 0.15, 0, 1)[..., None]
    colour = bgr * (1 - own) + cleaned * own
    colour[alpha < 0.01] = 0

    rgba = np.dstack([np.clip(colour, 0, 255), alpha * 255]).astype(np.uint8)
    ys, xs = np.nonzero(alpha > 0.01)
    pad = 6
    rgba = rgba[max(ys.min() - pad, 0):ys.max() + 1, 0:min(xs.max() + pad, rgba.shape[1])]  # keep the left/bottom cut
    if rgba.shape[1] > MAX_WIDTH:
        scale = MAX_WIDTH / rgba.shape[1]
        rgba = cv2.resize(rgba, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    cv2.imwrite(OUT, rgba, [cv2.IMWRITE_WEBP_QUALITY, 90])
    print(f"tomato-whole.webp {rgba.shape[1]}x{rgba.shape[0]}  {os.path.getsize(OUT) // 1024} KB "
          f"(aspect {rgba.shape[1] / rgba.shape[0]:.3f}, source bbox aspect {(xs.max() + pad) / (ys.max() - ys.min() + 1 + pad):.3f})")


if __name__ == "__main__":
    main()
