import { type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Lock } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import type { CardDetails } from './types';

export interface PaymentStepProps {
  card: CardDetails;
  errors: Record<string, string>;
  total: number;
  placing: boolean;
  onCardChange: (patch: Partial<CardDetails>) => void;
  onBack: () => void;
  onSubmit: (e: FormEvent) => void;
}

function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

/** Step 2 — simulated payment with a live card preview. No real charge. */
export function PaymentStep({
  card,
  errors,
  total,
  placing,
  onCardChange,
  onBack,
  onSubmit,
}: PaymentStepProps) {
  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onSubmit={onSubmit}
      noValidate
      className="rounded-3xl border border-ink-200/60 bg-white p-6 sm:p-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink-900">
            Payment
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            This is a secure simulated payment — no real charge.
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
          <Lock className="h-3.5 w-3.5" />
          Encrypted
        </span>
      </div>

      {/* Card preview */}
      <div className="mt-6 overflow-hidden rounded-2xl bg-gradient-to-br from-ink-900 to-ink-700 p-6 text-white shadow-soft">
        <div className="flex items-center justify-between">
          <div className="h-8 w-11 rounded-md bg-gold-400/90" />
          <CreditCard className="h-7 w-7 text-white/70" />
        </div>
        <p className="mt-6 font-mono text-lg tracking-widest">
          {card.number || '•••• •••• •••• ••••'}
        </p>
        <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-wide text-white/70">
          <span>{card.name || 'Cardholder name'}</span>
          <span>{card.expiry || 'MM / YY'}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input
            label="Card number"
            inputMode="numeric"
            placeholder="4242 4242 4242 4242"
            value={card.number}
            onChange={(e) =>
              onCardChange({ number: formatCardNumber(e.target.value) })
            }
            error={errors.number}
          />
        </div>
        <div className="sm:col-span-2">
          <Input
            label="Name on card"
            value={card.name}
            onChange={(e) => onCardChange({ name: e.target.value })}
            error={errors.name}
          />
        </div>
        <Input
          label="Expiry"
          placeholder="MM / YY"
          value={card.expiry}
          onChange={(e) => onCardChange({ expiry: e.target.value })}
          error={errors.expiry}
        />
        <Input
          label="CVC"
          inputMode="numeric"
          placeholder="123"
          value={card.cvc}
          onChange={(e) =>
            onCardChange({ cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })
          }
          error={errors.cvc}
        />
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button type="button" variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" size="lg" variant="secondary" isLoading={placing}>
          {placing ? 'Processing…' : `Pay ${formatCurrency(total)}`}
        </Button>
      </div>
    </motion.form>
  );
}
