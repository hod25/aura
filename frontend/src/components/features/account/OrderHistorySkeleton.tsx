import { Skeleton } from '@/components/ui/Skeleton';

const ROWS = 4;

/** Shimmering placeholder that mirrors the order-history table while loading. */
export function OrderHistorySkeleton() {
  return (
    <div className="mt-4 overflow-hidden rounded-3xl border border-ink-200/60 bg-white">
      {/* Desktop table skeleton */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-[1.2fr_1fr_0.8fr_0.9fr_0.8fr] border-b border-ink-200/70 px-6 py-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-16 rounded-md" />
          ))}
        </div>
        {Array.from({ length: ROWS }).map((_, row) => (
          <div
            key={row}
            className="grid grid-cols-[1.2fr_1fr_0.8fr_0.9fr_0.8fr] items-center border-b border-ink-100 px-6 py-5 last:border-0"
          >
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-4 w-14 rounded-md" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="ml-auto h-4 w-16 rounded-md" />
          </div>
        ))}
      </div>

      {/* Mobile card skeletons */}
      <div className="divide-y divide-ink-100 sm:hidden">
        {Array.from({ length: ROWS }).map((_, row) => (
          <div key={row} className="space-y-3 p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
