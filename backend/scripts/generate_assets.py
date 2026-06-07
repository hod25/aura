"""
Generate premium furniture placeholder product images for the Aura catalog.

Produces 800x600 PNGs with a diagonal gradient, the "AURA" wordmark, the
product display name and its category — matching the local image-hosting
architecture served by express.static at /assets/products/<file>.png.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT_DIR = Path(__file__).resolve().parent.parent / "src" / "assets" / "products"
WIDTH, HEIGHT = 800, 600

# Premium, furniture-appropriate gradients keyed by category.
CATEGORY_GRADIENTS = {
    "Furniture": ((107, 91, 79), (45, 38, 32)),    # warm espresso oak
    "Seating": ((120, 108, 94), (48, 42, 35)),     # warm oat bouclé
    "Lighting": ((122, 96, 51), (43, 33, 20)),     # warm amber glow
    "Decor": ((93, 107, 90), (35, 43, 34)),        # sage stone
}

# (filename, display_name, category) — must reconcile 1:1 with the image_url
# values seeded in backend/src/config/init.sql.
PRODUCTS = [
    ("strata-oak-side-table.png", "Strata Side Table", "Furniture"),
    ("contour-boucle-lounge-chair.png", "Contour Lounge Chair", "Seating"),
    ("linear-marble-console.png", "Linear Console", "Furniture"),
    ("prism-travertine-floor-lamp.png", "Prism Floor Lamp", "Lighting"),
    ("meridian-walnut-dining-table.png", "Meridian Dining Table", "Furniture"),
    ("halo-alabaster-pendant.png", "Halo Pendant", "Lighting"),
    ("drift-linen-sofa.png", "Drift Linen Sofa", "Seating"),
    ("celadon-stoneware-vase.png", "Celadon Vase", "Decor"),
    ("nimbus-boucle-ottoman.png", "Nimbus Ottoman", "Seating"),
    ("linea-oak-bookshelf.png", "Linea Bookshelf", "Furniture"),
    ("ember-travertine-coffee-table.png", "Ember Coffee Table", "Furniture"),
    ("verde-olive-tree.png", "Verde Olive Tree", "Decor"),
]


def load_font(bold: bool, size: int) -> ImageFont.FreeTypeFont:
    candidates = (
        ["arialbd.ttf", "DejaVuSans-Bold.ttf"]
        if bold
        else ["arial.ttf", "DejaVuSans.ttf"]
    )
    for name in candidates:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def gradient(c1, c2) -> Image.Image:
    base = Image.new("RGB", (WIDTH, HEIGHT))
    px = base.load()
    span = WIDTH + HEIGHT
    for y in range(HEIGHT):
        for x in range(WIDTH):
            t = (x + y) / span
            px[x, y] = (
                int(c1[0] + (c2[0] - c1[0]) * t),
                int(c1[1] + (c2[1] - c1[1]) * t),
                int(c1[2] + (c2[2] - c1[2]) * t),
            )
    return base


def centered(draw, text, font, y, fill):
    box = draw.textbbox((0, 0), text, font=font)
    w = box[2] - box[0]
    draw.text(((WIDTH - w) / 2, y), text, font=font, fill=fill)


def fit_name_font(draw, text, start=68, min_size=40):
    size = start
    while size > min_size:
        font = load_font(True, size)
        box = draw.textbbox((0, 0), text, font=font)
        if box[2] - box[0] <= WIDTH - 120:
            return font
        size -= 4
    return load_font(True, min_size)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    header_font = load_font(True, 30)
    cat_font = load_font(False, 30)
    for filename, name, category in PRODUCTS:
        c1, c2 = CATEGORY_GRADIENTS[category]
        img = gradient(c1, c2)
        draw = ImageDraw.Draw(img)
        centered(draw, "AURA", header_font, 56, (255, 255, 255))
        name_font = fit_name_font(draw, name)
        nb = draw.textbbox((0, 0), name, font=name_font)
        centered(draw, name, name_font, (HEIGHT - (nb[3] - nb[1])) / 2 - 20, (255, 255, 255))
        centered(draw, category.upper(), cat_font, 392, (215, 210, 205))
        img.save(OUT_DIR / filename, "PNG")
        print(f"wrote {filename}")


if __name__ == "__main__":
    main()
