import { api } from './client';
import type { CartItem, Order, ShippingDetails } from '@/types';

export interface CreateOrderPayload {
  items: { productId: string | number; quantity: number }[];
  shipping: ShippingDetails;
  total: number;
}

function unwrapList(payload: unknown): Order[] {
  const root = payload as { data?: Order[]; orders?: Order[] } | Order[];
  if (Array.isArray(root)) return root;
  return root.data ?? root.orders ?? [];
}

function unwrapOne(payload: unknown): Order {
  const root = payload as { data?: Order; order?: Order } | Order;
  return (
    (root as { data?: Order }).data ??
    (root as { order?: Order }).order ??
    (root as Order)
  );
}

export const ordersApi = {
  async list(): Promise<Order[]> {
    const { data } = await api.get('/orders');
    return unwrapList(data);
  },

  async create(payload: CreateOrderPayload): Promise<Order> {
    const { data } = await api.post('/orders', payload);
    return unwrapOne(data);
  },
};

/** Builds the order payload from current cart items + shipping details. */
export function buildOrderPayload(
  items: CartItem[],
  shipping: ShippingDetails,
  total: number,
): CreateOrderPayload {
  return {
    items: items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    })),
    shipping,
    total,
  };
}
