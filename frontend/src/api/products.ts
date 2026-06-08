import { api } from './client';
import type { Product } from '@/types';
import { MOCK_PRODUCTS } from '../data/catalog';

interface RawProduct {
  id: string | number;
  name: string;
  description?: string;
  price: number | string;
  category?: string;
  image?: string;
  image_url?: string;
  images?: string[];
  rating?: number | string;
  reviews?: number;
  stock?: number | string;
  featured?: boolean;
  specs?: Record<string, string>;
}

/** Maps a backend product DTO onto the frontend Product domain type. */
function mapProduct(raw: RawProduct): Product {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? '',
    price: Number(raw.price),
    category: raw.category ?? 'General',
    image: raw.image_url ?? raw.image ?? '',
    image_url: raw.image_url,
    images: raw.images,
    rating: raw.rating != null ? Number(raw.rating) : undefined,
    reviews: raw.reviews,
    stock: raw.stock != null ? Number(raw.stock) : undefined,
    featured: raw.featured,
    specs: raw.specs,
  };
}

function unwrapList(payload: unknown): RawProduct[] {
  const root = payload as
    | { data?: RawProduct[]; products?: RawProduct[]; items?: RawProduct[] }
    | RawProduct[];
  if (Array.isArray(root)) return root;
  return root.data ?? root.products ?? root.items ?? [];
}

function unwrapOne(payload: unknown): RawProduct | undefined {
  const root = payload as {
    data?: RawProduct | { product?: RawProduct };
    product?: RawProduct;
  };
  const data = root.data;
  if (data && typeof data === 'object' && 'product' in data && data.product) {
    return data.product;
  }
  return (data as RawProduct | undefined) ?? root.product;
}

export const productsApi = {
  /** Fetches all products, falling back to the local catalog when offline. */
  async list(): Promise<Product[]> {
    try {
      const { data } = await api.get('/products');
      const products = unwrapList(data).map(mapProduct);
      return products.length ? products : MOCK_PRODUCTS;
    } catch {
      return MOCK_PRODUCTS;
    }
  },

  async get(id: string | number): Promise<Product | undefined> {
    try {
      const { data } = await api.get(`/products/${id}`);
      const raw = unwrapOne(data);
      if (raw && raw.id != null) return mapProduct(raw);
      throw new Error('empty');
    } catch {
      return MOCK_PRODUCTS.find((p: Product) => String(p.id) === String(id));
    }
  },
};
