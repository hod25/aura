import { api } from './client';
import type { CartItem, Product } from '@/types';

interface RawCartItem {
  id: string | number;
  product_id: string | number;
  name: string;
  price: number | string;
  image_url?: string;
  quantity: number | string;
  line_total?: number | string;
}

/** Maps a backend cart line onto the frontend CartItem domain type. */
function mapCartItem(raw: RawCartItem): CartItem {
  const product: Product = {
    id: raw.product_id,
    name: raw.name,
    description: '',
    price: Number(raw.price),
    category: 'General',
    image: raw.image_url ?? '',
  };
  return { id: raw.id, product, quantity: Number(raw.quantity) };
}

/** Unwraps `{ success, data: { items } }` | `{ items }` | array shapes. */
function unwrapCart(payload: unknown): RawCartItem[] {
  const root = payload as
    | { data?: { items?: RawCartItem[] } | RawCartItem[]; items?: RawCartItem[] }
    | RawCartItem[];
  if (Array.isArray(root)) return root;
  if (Array.isArray(root.data)) return root.data;
  return root.data?.items ?? root.items ?? [];
}

async function fetchRaw(): Promise<RawCartItem[]> {
  const { data } = await api.get('/cart');
  return unwrapCart(data);
}

/**
 * Server-backed cart operations. The context drives these by product id;
 * the backend keys mutations by cart-item id, so we resolve the id here.
 */
export const cartApi = {
  async get(): Promise<CartItem[]> {
    return (await fetchRaw()).map(mapCartItem);
  },

  async add(productId: string | number, quantity: number): Promise<CartItem[]> {
    const { data } = await api.post('/cart/items', {
      product_id: productId,
      quantity,
    });
    return unwrapCart(data).map(mapCartItem);
  },

  async update(
    productId: string | number,
    quantity: number,
  ): Promise<CartItem[]> {
    const raw = await fetchRaw();
    const target = raw.find((i) => String(i.product_id) === String(productId));
    if (!target) return this.add(productId, quantity);
    const { data } = await api.put(`/cart/items/${target.id}`, { quantity });
    return unwrapCart(data).map(mapCartItem);
  },

  async remove(productId: string | number): Promise<CartItem[]> {
    const raw = await fetchRaw();
    const target = raw.find((i) => String(i.product_id) === String(productId));
    if (!target) return raw.map(mapCartItem);
    const { data } = await api.delete(`/cart/items/${target.id}`);
    return unwrapCart(data).map(mapCartItem);
  },

  async clear(): Promise<void> {
    const raw = await fetchRaw();
    await Promise.all(
      raw.map((i) => api.delete(`/cart/items/${i.id}`).catch(() => undefined)),
    );
  },

  /** Reconciles the server cart to exactly match the supplied items. */
  async replace(
    desired: { productId: string | number; quantity: number }[],
  ): Promise<void> {
    await this.clear();
    for (const item of desired) {
      // eslint-disable-next-line no-await-in-loop
      await this.add(item.productId, item.quantity).catch(() => undefined);
    }
  },
};
