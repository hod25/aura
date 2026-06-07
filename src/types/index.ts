/**
 * Shared domain & transport types for the Aura backend.
 */

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

/** User shape that is safe to expose over the API (no password hash). */
export interface PublicUser {
  id: number;
  name: string;
  email: string;
  created_at: Date;
}

export interface Product {
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

export interface ProductQuery {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
  page: number;
  limit: number;
}

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  created_at: Date;
  updated_at: Date;
}

/** Cart item enriched with product details for API responses. */
export interface CartItemDetailed {
  id: number;
  product_id: number;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  line_total: number;
}

export interface Cart {
  items: CartItemDetailed[];
  total: number;
  item_count: number;
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  status: OrderStatus;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

/** Authenticated identity attached to the request by the auth middleware. */
export interface AuthPayload {
  sub: number;
  email: string;
}
