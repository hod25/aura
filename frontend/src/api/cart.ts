import { api } from './client';
import type { CartItem } from '@/types';

interface ServerCart {
  items?: CartItem[];
  data?: { items?: CartItem[] } | CartItem[];
}

function unwrapCart(payload: ServerCart | CartItem[]): CartItem[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  return payload.items ?? (payload.data as { items?: CartItem[] })?.items ?? [];
}

/**
 * Server-backed cart operations. Used only when a user is authenticated;
 * guests keep their cart entirely client-side (see CartContext).
 */
export const cartApi = {
  async get(): Promise<CartItem[]> {
    const { data } = await api.get('/cart');
    return unwrapCart(data);
  },

  async add(productId: string | number, quantity: number): Promise<CartItem[]> {
    const { data } = await api.post('/cart', { productId, quantity });
    return unwrapCart(data);
  },

  async update(
    productId: string | number,
    quantity: number,
  ): Promise<CartItem[]> {
    const { data } = await api.put(`/cart/${productId}`, { quantity });
    return unwrapCart(data);
  },

  async remove(productId: string | number): Promise<CartItem[]> {
    const { data } = await api.delete(`/cart/${productId}`);
    return unwrapCart(data);
  },

  async clear(): Promise<void> {
    await api.delete('/cart');
  },
};
