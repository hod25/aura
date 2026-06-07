import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { ProductGrid } from '@/components/features/product';
import { Button } from '@/components/ui/Button';
import { useProducts } from '@/hooks/useProducts';
import { cn, formatCurrency } from '@/lib/utils';

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'name';

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'featured', label: 'Featured' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
  { key: 'name', label: 'Alphabetical' },
];

export function CatalogPage() {
  const { products, isLoading } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState('');
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [sort, setSort] = useState<SortKey>('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { categories, priceCeiling } = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category))).sort();
    const ceiling = products.reduce((max, p) => Math.max(max, p.price), 0);
    return { categories: cats, priceCeiling: Math.ceil(ceiling) };
  }, [products]);

  // Initialise price slider once the ceiling is known.
  useEffect(() => {
    if (priceCeiling > 0 && maxPrice === 0) setMaxPrice(priceCeiling);
  }, [priceCeiling, maxPrice]);

  // Seed category from ?category= query param (e.g. footer links).
  useEffect(() => {
    const fromUrl = searchParams.get('category');
    if (fromUrl) setActiveCategories([fromUrl]);
  }, [searchParams]);

  const toggleCategory = useCallback((category: string) => {
    setActiveCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  }, []);

  const clearFilters = useCallback(() => {
    setActiveCategories([]);
    setMaxPrice(priceCeiling);
    setQuery('');
    setSort('featured');
    if (searchParams.get('category')) setSearchParams({}, { replace: true });
  }, [priceCeiling, searchParams, setSearchParams]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = products.filter((p) => {
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      const matchesCategory =
        activeCategories.length === 0 ||
        activeCategories.includes(p.category);
      const matchesPrice = maxPrice === 0 || p.price <= maxPrice;
      return matchesQuery && matchesCategory && matchesPrice;
    });

    switch (sort) {
      case 'price-asc':
        return [...result].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...result].sort((a, b) => b.price - a.price);
      case 'name':
        return [...result].sort((a, b) => a.name.localeCompare(b.name));
      default:
        return [...result].sort(
          (a, b) => Number(b.featured ?? false) - Number(a.featured ?? false),
        );
    }
  }, [products, query, activeCategories, maxPrice, sort]);

  const hasActiveFilters =
    activeCategories.length > 0 ||
    query.length > 0 ||
    (priceCeiling > 0 && maxPrice < priceCeiling);

  const FiltersPanel = useMemo(
    () => (
    <div className="space-y-8">
      <div>
        <h3 className="eyebrow mb-4">Category</h3>
        <div className="space-y-1">
          {categories.map((category) => {
            const active = activeCategories.includes(category);
            return (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={cn(
                  'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors',
                  active
                    ? 'bg-ink-900 font-medium text-white'
                    : 'text-ink-600 hover:bg-ink-100',
                )}
              >
                {category}
                <span
                  className={cn(
                    'text-xs',
                    active ? 'text-white/60' : 'text-ink-400',
                  )}
                >
                  {products.filter((p) => p.category === category).length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="eyebrow mb-4">Max price</h3>
        <input
          type="range"
          min={0}
          max={priceCeiling || 100}
          step={10}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-emerald-600"
        />
        <div className="mt-2 flex items-center justify-between text-sm text-ink-500">
          <span>{formatCurrency(0)}</span>
          <span className="font-semibold text-ink-900">
            {formatCurrency(maxPrice)}
          </span>
        </div>
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" fullWidth onClick={clearFilters}>
          <X className="h-4 w-4" />
          Clear filters
        </Button>
      )}
    </div>
    ),
    [
      categories,
      activeCategories,
      products,
      priceCeiling,
      maxPrice,
      hasActiveFilters,
      toggleCategory,
      clearFilters,
    ],
  );

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <span className="eyebrow">The Collection</span>
          <h1 className="mt-2 font-display text-4xl font-semibold text-ink-900 sm:text-5xl">
            Shop everything
          </h1>
          <p className="mt-3 max-w-xl text-ink-500">
            {isLoading
              ? 'Loading curated pieces…'
              : `${filtered.length} ${filtered.length === 1 ? 'piece' : 'pieces'} ready for your space.`}
          </p>
        </div>

        {/* Search + sort */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, category…"
              className="w-full rounded-full border border-ink-200 bg-white py-3 pl-11 pr-4 text-sm text-ink-900 placeholder:text-ink-400 transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-full border border-ink-200 bg-white px-4 py-3 text-sm font-medium text-ink-700 transition-colors focus:border-emerald-500 focus:outline-none"
          >
            {sortOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            className="lg:hidden"
            onClick={() => setMobileFiltersOpen((v) => !v)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          {/* Sidebar (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-3xl border border-ink-200/60 bg-white p-6">
              {FiltersPanel}
            </div>
          </aside>

          {/* Mobile filters */}
          {mobileFiltersOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="overflow-hidden rounded-3xl border border-ink-200/60 bg-white p-6 lg:hidden"
            >
              {FiltersPanel}
            </motion.div>
          )}

          {/* Grid */}
          <div>
            {!isLoading && filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-ink-200 py-24 text-center">
                <p className="font-display text-2xl font-medium text-ink-900">
                  No pieces found
                </p>
                <p className="mt-2 max-w-sm text-sm text-ink-500">
                  Try adjusting your search or clearing the filters to see more
                  of the collection.
                </p>
                <Button variant="outline" className="mt-6" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <ProductGrid
                products={filtered}
                isLoading={isLoading}
                animationKey={`${sort}-${activeCategories.join()}-${query}`}
              />
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
