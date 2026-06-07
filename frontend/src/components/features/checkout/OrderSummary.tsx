import { ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { CartItem } from '@/types';

export interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
}

/** Sticky order summary shown alongside the shipping and payment steps. */
export function OrderSummary({ items, subtotal, tax, total }: OrderSummaryProps) {
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-3xl border border-ink-200/60 bg-white p-6">
        <h3 className="font-display text-lg font-semibold text-ink-900">
          Order summary
        </h3>
        <ul className="mt-4 space-y-4">
          {items.map((item) => (
            <li key={item.product.id} className="flex gap-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-ink-100">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="h-full w-full object-cover"
                />
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink-900 px-1 text-[11px] font-semibold text-white">
                  {item.quantity}
                </span>
              </div>
              <div className="flex flex-1 flex-col justify-center">
                <p className="text-sm font-medium leading-snug text-ink-900">
                  {item.product.name}
                </p>
                <p className="text-xs text-ink-400">{item.product.category}</p>
              </div>
              <span className="self-center text-sm font-semibold text-ink-900">
                {formatCurrency(item.product.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6 space-y-2 border-t border-ink-200/70 pt-4 text-sm">
          <div className="flex justify-between text-ink-500">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-ink-500">
            <span>Shipping</span>
            <span className="text-emerald-600">Free</span>
          </div>
          <div className="flex justify-between text-ink-500">
            <span>Tax (8%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between border-t border-ink-200/70 pt-3 text-base font-semibold text-ink-900">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-xl bg-ink-50 px-4 py-3 text-xs text-ink-500">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Secure checkout · 30-day returns
        </div>
      </div>
    </aside>
  );
}
