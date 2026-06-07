/**
 * Application domain & transport entities.
 *
 * These represent the shapes the application reasons about and exposes over
 * the API — distinct from the raw persistence rows in `db.ts`. Composite
 * read models (e.g. a cart with product details, an order with its items)
 * also live here.
 */

import { OrderRow, OrderItemRow } from './db';

/** User shape that is safe to expose over the API (never the password hash). */
export interface PublicUser {
  id: number;
  name: string;
  email: string;
  created_at: Date;
}

/** Normalized, validated query parameters for the product catalog. */
export interface ProductQuery {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
  page: number;
  limit: number;
}

/** A cart line enriched with product details for API responses. */
export interface CartItemDetailed {
  id: number;
  product_id: number;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  line_total: number;
}

/** Aggregated cart read model returned to the client. */
export interface Cart {
  items: CartItemDetailed[];
  total: number;
  item_count: number;
}

/** An order together with its line items (read model). */
export interface OrderWithItems extends OrderRow {
  items: OrderItemRow[];
}

/** Authenticated identity attached to the request by the auth middleware. */
export interface AuthPayload {
  sub: number;
  email: string;
}
