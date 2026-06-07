import { clsx, type ClassValue } from 'clsx';

/** Conditional className helper. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

export function formatDate(value: string | number | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return dateFormatter.format(date);
}

/**
 * Resolves a product's image source across every payload shape we may receive:
 * the canonical mapped `image`, the raw MySQL `image_url`, or a camelCase
 * `imageUrl` from adapted mock objects. Returns an empty string when none exist
 * so the <img> degrades to its placeholder box rather than throwing.
 */
export function productImage(
  product: { image?: string; image_url?: string; imageUrl?: string } | null | undefined,
): string {
  if (!product) return '';
  return product.image_url ?? product.image ?? product.imageUrl ?? '';
}

/** Returns initials from a full name, e.g. "Ada Lovelace" -> "AL". */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
