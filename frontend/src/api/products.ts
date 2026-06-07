import { api } from './client';
import type { Product } from '@/types';
import { MOCK_PRODUCTS } from '@/data/catalog';

function unwrapList<T>(payload: unknown): T[] {
  const root = payload as { data?: T[]; products?: T[]; items?: T[] } | T[];
  if (Array.isArray(root)) return root;
  return root.data ?? root.products ?? root.items ?? [];
}

function unwrapOne<T>(payload: unknown): T {
  const root = payload as { data?: T; product?: T } | T;
  return (
    (root as { data?: T }).data ??
    (root as { product?: T }).product ??
    (root as T)
  );
}

export const productsApi = {
  /** Fetches all products, falling back to the local catalog when offline. */
  async list(): Promise<Product[]> {
    try {
      const { data } = await api.get('/products');
      const products = unwrapList<Product>(data);
      return products.length ? products : MOCK_PRODUCTS;
    } catch {
      return MOCK_PRODUCTS;
    }
  },

  async get(id: string | number): Promise<Product | undefined> {
    try {
      const { data } = await api.get(`/products/${id}`);
      const product = unwrapOne<Product>(data);
      if (product && (product as Product).id != null) return product;
      throw new Error('empty');
    } catch {
      return MOCK_PRODUCTS.find((p) => String(p.id) === String(id));
    }
  },
};
