import { cn } from '@/lib/utils';

export interface SkeletonProps {
  className?: string;
}

/**
 * Atomic shimmering placeholder block. Composes the `.skeleton` utility
 * (defined in index.css) for a premium, animated loading state.
 */
export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton rounded-xl', className)} aria-hidden />;
}
