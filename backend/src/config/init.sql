-- =============================================================================
-- Aura eCommerce Platform — Database schema & seed data
-- This script is idempotent and safe to run on every container start.
-- =============================================================================

CREATE DATABASE IF NOT EXISTS aura
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE aura;

-- -----------------------------------------------------------------------------
-- users
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(120)    NOT NULL,
  email         VARCHAR(255)    NOT NULL,
  password_hash VARCHAR(255)    NOT NULL,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- products
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(200)    NOT NULL,
  description TEXT            NOT NULL,
  category    VARCHAR(80)     NOT NULL,
  price       DECIMAL(10, 2)  NOT NULL,
  image_url   VARCHAR(512)    NOT NULL DEFAULT '',
  stock       INT             NOT NULL DEFAULT 0,
  rating      DECIMAL(2, 1)   NOT NULL DEFAULT 0.0,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_products_category (category),
  KEY idx_products_price (price),
  FULLTEXT KEY ft_products_search (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- cart_items (one logical cart per user, expressed as the user's item rows)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cart_items (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  quantity   INT             NOT NULL DEFAULT 1,
  created_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cart_user_product (user_id, product_id),
  KEY idx_cart_user (user_id),
  CONSTRAINT fk_cart_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_product
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- orders
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id      BIGINT UNSIGNED NOT NULL,
  total_amount DECIMAL(12, 2)  NOT NULL,
  status       ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled')
                               NOT NULL DEFAULT 'paid',
  created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_orders_user (user_id),
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- order_items (snapshot of product name & price at purchase time)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id     BIGINT UNSIGNED NOT NULL,
  product_id   BIGINT UNSIGNED NOT NULL,
  product_name VARCHAR(200)    NOT NULL,
  unit_price   DECIMAL(10, 2)  NOT NULL,
  quantity     INT             NOT NULL,
  created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_order_items_order (order_id),
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Data integrity restore: purge any legacy placeholder Electronics catalog that
-- was injected in error, returning the storefront to its premium Furniture &
-- Living theme. Dependent order_item snapshots are cleared first so the
-- ON DELETE RESTRICT foreign key cannot block the cleanup. Idempotent.
-- -----------------------------------------------------------------------------
DELETE oi FROM order_items oi
  JOIN products p ON p.id = oi.product_id
  WHERE p.category IN ('Audio', 'Wearables', 'Computers', 'Cameras',
                       'Accessories', 'Lifestyle', 'Home');

DELETE FROM products
  WHERE category IN ('Audio', 'Wearables', 'Computers', 'Cameras',
                     'Accessories', 'Lifestyle', 'Home');

-- -----------------------------------------------------------------------------
-- Seed: premium Furniture & Living collection (only when the table is empty).
-- Image URLs reconcile 1:1 with locally hosted assets served by express.static
-- from /assets/products/<file>.png (see backend/src/assets/products).
-- -----------------------------------------------------------------------------
INSERT INTO products (name, description, category, price, image_url, stock, rating)
SELECT * FROM (
  SELECT
    'Strata Oak Side Table' AS name,
    'Stacked solid-oak rings form a softly tactile column, crowned by a single seamless disc of hand-oiled timber. A quiet sculptural anchor for the sofa-side.' AS description,
    'Furniture' AS category,
    460.00 AS price,
    'http://localhost:5001/assets/products/strata-oak-side-table.png' AS image_url,
    14 AS stock,
    4.6 AS rating
  UNION ALL SELECT 'Contour Bouclé Lounge Chair', 'A sculptural lounge chair wrapped in ivory bouclé over a hand-finished solid-oak frame, contoured to cradle the body in unhurried comfort.', 'Seating', 890.00, 'http://localhost:5001/assets/products/contour-boucle-lounge-chair.png', 12, 4.9
  UNION ALL SELECT 'Linear Marble Console', 'A slender console pairing a honed Carrara marble top with a fine blackened-steel base — architectural restraint for an entryway or hall.', 'Furniture', 1250.00, 'http://localhost:5001/assets/products/linear-marble-console.png', 9, 4.8
  UNION ALL SELECT 'Prism Travertine Floor Lamp', 'A faceted travertine plinth grounds a slim brass stem and opal-glass diffuser, casting a warm, sculptural glow across the floor.', 'Lighting', 320.00, 'http://localhost:5001/assets/products/prism-travertine-floor-lamp.png', 22, 4.7
  UNION ALL SELECT 'Meridian Walnut Dining Table', 'A solid American black-walnut dining table with tapered legs and a hand-oiled top that seats six in quiet, grounded warmth.', 'Furniture', 1680.00, 'http://localhost:5001/assets/products/meridian-walnut-dining-table.png', 10, 4.8
  UNION ALL SELECT 'Halo Alabaster Pendant', 'A hand-carved alabaster disc suspended from a brushed-brass canopy, glowing with the soft, veined translucence of natural stone.', 'Lighting', 540.00, 'http://localhost:5001/assets/products/halo-alabaster-pendant.png', 18, 4.8
  UNION ALL SELECT 'Drift Linen Sofa', 'A low, generous three-seat sofa in stonewashed Belgian linen over a kiln-dried hardwood frame with feather-down cushions.', 'Seating', 2150.00, 'http://localhost:5001/assets/products/drift-linen-sofa.png', 8, 4.9
  UNION ALL SELECT 'Celadon Stoneware Vase', 'Wheel-thrown stoneware finished in a matte celadon glaze, each vessel carrying the subtle irregularities of the maker''s hand.', 'Decor', 220.00, 'http://localhost:5001/assets/products/celadon-stoneware-vase.png', 40, 4.7
  UNION ALL SELECT 'Nimbus Bouclé Ottoman', 'A rounded upholstered ottoman in soft ivory bouclé on a recessed oak plinth — equal parts footrest, seat and sculpture.', 'Seating', 480.00, 'http://localhost:5001/assets/products/nimbus-boucle-ottoman.png', 24, 4.6
  UNION ALL SELECT 'Linea Oak Bookshelf', 'An open ladder bookshelf in solid white oak with cantilevered shelves that appear to float weightlessly against the wall.', 'Furniture', 760.00, 'http://localhost:5001/assets/products/linea-oak-bookshelf.png', 16, 4.6
  UNION ALL SELECT 'Ember Travertine Coffee Table', 'A rounded coffee table carved from a single block of Roman travertine, its honed surface tracing the stone''s natural striations.', 'Furniture', 620.00, 'http://localhost:5001/assets/products/ember-travertine-coffee-table.png', 20, 4.7
  UNION ALL SELECT 'Verde Potted Olive Tree', 'A mature potted olive in a hand-thrown terracotta vessel — a living sculpture that softens architectural lines with silver-green foliage.', 'Decor', 320.00, 'http://localhost:5001/assets/products/verde-olive-tree.png', 9, 4.8
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);
