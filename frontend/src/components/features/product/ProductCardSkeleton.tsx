import { Skeleton } from '@/components/ui/Skeleton';

/** Shimmering placeholder that mirrors the ProductCard layout. */
export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-ink-200/60 bg-white">
      <Skeleton className="aspect-[4/5] rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-3 w-1/3 rounded-full" />
        <Skeleton className="h-5 w-3/4 rounded-full" />
        <Skeleton className="h-4 w-1/4 rounded-full" />
      </div>
    </div>
  );
}
