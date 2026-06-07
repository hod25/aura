"""
Generate premium, minimalist product imagery for the Aura Furniture & Living catalog.

Design language: editorial / architectural — soft warm beige, muted sand, deep
charcoal (#1f2937), sage olive and soft ivory. No gradients, no neon, no busy
text blocks. Each placeholder is a calm, high-contrast composition with generous
padding, a fine architectural frame, a restrained geometric mark, the product
name set in a serif face, and a discreet category caption — a quiet Scandinavian
luxury feel.

Output: 1200x900 PNGs written to src/assets/products/<file>.png and served by
express.static at /assets/products/<file>.png. Any pre-existing PNGs in the
output directory are removed first so stale (e.g. electronics) art cannot linger.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT_DIR = Path(__file__).resolve().parent.parent / "src" / "assets" / "products"
WIDTH, HEIGHT = 1200, 900

# Editorial, architectural palette (RGB).
IVORY = (242, 238, 230)      # soft ivory
BEIGE = (212, 199, 183)      # soft warm beige
SAND = (199, 186, 167)       # muted sand
CHARCOAL = (31, 41, 55)      # deep charcoal #1f2937
OLIVE = (124, 130, 104)      # sage olive

# Per-category (background, ink) pairing. Every pairing is muted yet high
# contrast so the name reads as confidently as gallery signage.
CATEGORY_THEME = {
    "Furniture": (IVORY, CHARCOAL),
    "Seating": (SAND, CHARCOAL),
    "Lighting": (CHARCOAL, IVORY),
    "Decor": (OLIVE, IVORY),
}

# (filename, display_name, category) — reconciles 1:1 with init.sql image URLs.
PRODUCTS = [
    ("strata-oak-side-table.png", "Strata Oak Side Table", "Furniture"),
    ("contour-boucle-lounge-chair.png", "Contour Bouclé Lounge Chair", "Seating"),
    ("linear-marble-console.png", "Linear Marble Console", "Furniture"),
    ("prism-travertine-floor-lamp.png", "Prism Travertine Floor Lamp", "Lighting"),
    ("meridian-walnut-dining-table.png", "Meridian Walnut Dining Table", "Furniture"),
    ("halo-alabaster-pendant.png", "Halo Alabaster Pendant", "Lighting"),
    ("drift-linen-sofa.png", "Drift Linen Sofa", "Seating"),
    ("celadon-stoneware-vase.png", "Celadon Stoneware Vase", "Decor"),
    ("nimbus-boucle-ottoman.png", "Nimbus Bouclé Ottoman", "Seating"),
    ("linea-oak-bookshelf.png", "Linea Oak Bookshelf", "Furniture"),
    ("ember-travertine-coffee-table.png", "Ember Travertine Coffee Table", "Furniture"),
    ("verde-olive-tree.png", "Verde Potted Olive Tree", "Decor"),
]


def load_font(size: int, *, serif: bool = False, bold: bool = False) -> ImageFont.FreeTypeFont:
    if serif:
        candidates = ["georgia.ttf", "Georgia.ttf", "constan.ttf", "times.ttf",
                      "DejaVuSerif.ttf", "DejaVuSerif-Bold.ttf"]
    elif bold:
        candidates = ["arialbd.ttf", "Arial Bold.ttf", "DejaVuSans-Bold.ttf"]
    else:
        candidates = ["arial.ttf", "Arial.ttf", "DejaVuSans.ttf"]
    for name in candidates:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def blend(c1, c2, t: float):
    """Linear blend from c1 toward c2 by t in [0, 1]."""
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def text_width(draw, text, font, tracking=0) -> float:
    if not text:
        return 0.0
    total = 0.0
    for ch in text:
        box = draw.textbbox((0, 0), ch, font=font)
        total += (box[2] - box[0]) + tracking
    return total - tracking


def draw_tracked(draw, text, font, cx, y, fill, tracking=0):
    """Draw `text` centered on cx at top-y with manual letter tracking."""
    x = cx - text_width(draw, text, font, tracking) / 2
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        box = draw.textbbox((0, 0), ch, font=font)
        x += (box[2] - box[0]) + tracking


def wrap_name(draw, name, font, max_w):
    words, lines, cur = name.split(), [], ""
    for w in words:
        trial = f"{cur} {w}".strip()
        if draw.textbbox((0, 0), trial, font=font)[2] <= max_w or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def fit_name(draw, name, max_w, start=92, min_size=54):
    """Largest serif size that lays the name out in at most two lines."""
    size = start
    while size > min_size:
        font = load_font(size, serif=True)
        lines = wrap_name(draw, name, font, max_w)
        if len(lines) <= 2 and all(
            draw.textbbox((0, 0), ln, font=font)[2] <= max_w for ln in lines
        ):
            return font, lines
        size -= 3
    font = load_font(min_size, serif=True)
    return font, wrap_name(draw, name, font, max_w)


def render(filename: str, name: str, category: str) -> None:
    bg, ink = CATEGORY_THEME[category]
    img = Image.new("RGB", (WIDTH, HEIGHT), bg)
    draw = ImageDraw.Draw(img)
    cx = WIDTH / 2

    # Fine architectural frame with generous padding.
    margin = 70
    frame = blend(bg, ink, 0.30)
    draw.rectangle((margin, margin, WIDTH - margin, HEIGHT - margin),
                   outline=frame, width=2)

    # Brand wordmark, letter-tracked, near the top edge of the frame.
    draw_tracked(draw, "AURA", load_font(34, bold=True), cx, margin + 46, ink, tracking=14)

    # Restrained geometric mark: a thin open circle, a quiet focal point.
    r = 46
    mark_y = HEIGHT * 0.36
    draw.ellipse((cx - r, mark_y - r, cx + r, mark_y + r), outline=ink, width=2)
    draw.line((cx, mark_y - r - 22, cx, mark_y - r - 2), fill=ink, width=2)

    # Product name in serif, centered, up to two lines.
    name_font, lines = fit_name(draw, name, max_w=WIDTH - 2 * margin - 120)
    asc, desc = name_font.getmetrics()
    line_h = asc + desc
    block_h = line_h * len(lines)
    y = HEIGHT * 0.52 - block_h / 2
    for ln in lines:
        w = draw.textbbox((0, 0), ln, font=name_font)[2]
        draw.text((cx - w / 2, y), ln, font=name_font, fill=ink)
        y += line_h

    # Short centered rule beneath the name.
    rule_y = y + 26
    draw.line((cx - 48, rule_y, cx + 48, rule_y), fill=blend(bg, ink, 0.55), width=2)

    # Category caption, uppercase and tracked, near the bottom of the frame.
    caption = blend(bg, ink, 0.72)
    draw_tracked(draw, category.upper(), load_font(26), cx, HEIGHT - margin - 60,
                 caption, tracking=10)

    img.save(OUT_DIR / filename, "PNG")
    print(f"wrote {filename}")


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    # Purge any stale art (e.g. the old electronics PNGs) for a clean batch.
    removed = 0
    for png in OUT_DIR.glob("*.png"):
        png.unlink()
        removed += 1
    if removed:
        print(f"removed {removed} stale image(s)")
    for filename, name, category in PRODUCTS:
        render(filename, name, category)
    print(f"done — {len(PRODUCTS)} premium placeholders in {OUT_DIR}")


if __name__ == "__main__":
    main()
