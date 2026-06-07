import { useEffect, useState } from 'react';
import { productsApi } from '@/api/products';
import type { Product } from '@/types';

interface UseProductsState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
}

/** Loads the full catalog once and caches it in component state. */
export function useProducts(): UseProductsState {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    productsApi
      .list()
      .then((data) => {
        if (active) setProducts(data);
      })
      .catch(() => {
        if (active) setError('Unable to load products.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { products, isLoading, error };
}
