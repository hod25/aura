// Domain types shared across the Aura frontend.
// These mirror the contract exposed by the Aura backend (Agent 1) at /api.

export interface User {
  id: string | number;
  name: string;
  email: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Product {
  id: string | number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  images?: string[];
  rating?: number;
  reviews?: number;
  stock?: number;
  featured?: boolean;
  specs?: Record<string, string>;
}

export interface CartItem {
  id: string | number;
  product: Product;
  quantity: number;
}

export interface ShippingDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string | number;
  createdAt: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  shipping?: ShippingDetails;
}

export interface ApiError {
  message: string;
  status?: number;
}
