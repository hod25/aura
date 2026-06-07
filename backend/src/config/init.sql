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
-- Seed: premium sample products (only when the table is empty)
-- -----------------------------------------------------------------------------
INSERT INTO products (name, description, category, price, image_url, stock, rating)
SELECT * FROM (
  SELECT
    'Aura Apex Wireless Headphones' AS name,
    'Reference-grade over-ear headphones with adaptive hybrid ANC, 40h battery life and lossless LDAC audio.' AS description,
    'Audio' AS category,
    349.00 AS price,
    'https://images.aura.shop/products/apex-headphones.jpg' AS image_url,
    120 AS stock,
    4.8 AS rating
  UNION ALL SELECT 'Aura Pulse Smartwatch Series 7', 'Titanium-bezel smartwatch with AMOLED always-on display, ECG, SpO2 and 7-day battery.', 'Wearables', 429.00, 'https://images.aura.shop/products/pulse-watch.jpg', 80, 4.7
  UNION ALL SELECT 'Aura Vista 4K Mirrorless Camera', '33MP full-frame mirrorless body with in-body stabilization and 8K video capture.', 'Cameras', 1899.00, 'https://images.aura.shop/products/vista-camera.jpg', 35, 4.9
  UNION ALL SELECT 'Aura Glide Pro Laptop 14"', 'Ultralight 1.1kg magnesium laptop with 3K OLED, 32GB RAM and 18-hour battery.', 'Computers', 1599.00, 'https://images.aura.shop/products/glide-laptop.jpg', 50, 4.8
  UNION ALL SELECT 'Aura Echo Smart Speaker', 'Room-filling 360° sound with spatial audio and built-in smart-home hub.', 'Audio', 199.00, 'https://images.aura.shop/products/echo-speaker.jpg', 200, 4.5
  UNION ALL SELECT 'Aura Forge Mechanical Keyboard', 'Hot-swappable 75% mechanical keyboard with gasket mount and PBT keycaps.', 'Accessories', 159.00, 'https://images.aura.shop/products/forge-keyboard.jpg', 150, 4.6
  UNION ALL SELECT 'Aura Drift Ergonomic Mouse', 'Wireless ergonomic mouse with 26K DPI sensor and 90-day battery life.', 'Accessories', 89.00, 'https://images.aura.shop/products/drift-mouse.jpg', 220, 4.4
  UNION ALL SELECT 'Aura Lumen 27" 5K Monitor', 'Color-accurate 5K Retina monitor with 99% DCI-P3 and Thunderbolt 4 hub.', 'Computers', 1099.00, 'https://images.aura.shop/products/lumen-monitor.jpg', 40, 4.7
  UNION ALL SELECT 'Aura Nomad Travel Backpack', 'Weatherproof 30L carry-on backpack with dedicated laptop bay and luggage pass-through.', 'Lifestyle', 179.00, 'https://images.aura.shop/products/nomad-backpack.jpg', 300, 4.6
  UNION ALL SELECT 'Aura Volt 100W GaN Charger', 'Compact 4-port 100W GaN charger that powers a laptop and three devices at once.', 'Accessories', 79.00, 'https://images.aura.shop/products/volt-charger.jpg', 400, 4.5
  UNION ALL SELECT 'Aura Bloom Robot Vacuum', 'LiDAR-navigation robot vacuum with self-emptying base and mopping.', 'Home', 599.00, 'https://images.aura.shop/products/bloom-vacuum.jpg', 60, 4.6
  UNION ALL SELECT 'Aura Aero Drone 4K', 'Foldable 4K cinematic drone with obstacle avoidance and 34-minute flight time.', 'Cameras', 999.00, 'https://images.aura.shop/products/aero-drone.jpg', 45, 4.7
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);
