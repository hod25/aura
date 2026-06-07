import { motion } from 'framer-motion';
import type { Product } from '@/types';
import { staggerContainer } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';

export interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  skeletonCount?: number;
  className?: string;
  /** Optional key that re-triggers the stagger animation (e.g. active filters). */
  animationKey?: string;
}

const defaultGrid =
  'grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3';

/**
 * Animated, responsive product grid with built-in shimmering skeleton state.
 * Keeps the catalog/home pages declarative — they pass data, the grid renders.
 */
export function ProductGrid({
  products,
  isLoading = false,
  skeletonCount = 6,
  className,
  animationKey,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className={cn(defaultGrid, className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      key={animationKey}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={cn(defaultGrid, className)}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </motion.div>
  );
}
