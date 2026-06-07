/**
 * Raw database row interfaces.
 *
 * Each interface mirrors, 1:1, the columns of a physical table as returned
 * by MySQL. These are the *persistence* shapes and intentionally use the
 * database's snake_case naming and nullability. Application/domain code
 * should depend on the entities in `domain.ts` rather than these rows.
 */

/** Lifecycle status of an order (mirrors the `orders.status` ENUM). */
export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

/** Row of the `users` table. */
export interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

/** Row of the `products` table. */
export interface ProductRow {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  image_url: string;
  stock: number;
  rating: number;
  created_at: Date;
  updated_at: Date;
}

/** Row of the `cart_items` table. */
export interface CartItemRow {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  created_at: Date;
  updated_at: Date;
}

/** Row of the `orders` table. */
export interface OrderRow {
  id: number;
  user_id: number;
  total_amount: number;
  status: OrderStatus;
  created_at: Date;
  updated_at: Date;
}

/** Row of the `order_items` table. */
export interface OrderItemRow {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
}
