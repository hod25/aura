import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface ConfirmationStepProps {
  fullName: string;
  email: string;
  orderId: string | number | null;
  isAuthenticated: boolean;
}

/** Step 3 — success screen shown after the order is placed. */
export function ConfirmationStep({
  fullName,
  email,
  orderId,
  isAuthenticated,
}: ConfirmationStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-3xl border border-ink-200/60 bg-white p-8 text-center sm:p-12"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50"
      >
        <Check className="h-10 w-10 text-emerald-600" />
      </motion.div>
      <h2 className="mt-6 font-display text-3xl font-semibold text-ink-900">
        Order confirmed
      </h2>
      <p className="mt-2 text-ink-500">
        Thank you{fullName ? `, ${fullName.split(' ')[0]}` : ''}. A confirmation
        has been sent to{' '}
        <span className="font-medium text-ink-700">{email}</span>.
      </p>

      <div className="mx-auto mt-6 inline-flex flex-col items-center rounded-2xl bg-ink-50 px-8 py-4">
        <span className="text-xs uppercase tracking-wide text-ink-400">
          Order number
        </span>
        <span className="mt-1 font-mono text-lg font-semibold text-ink-900">
          {orderId}
        </span>
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link to="/catalog">
          <Button variant="outline">Continue shopping</Button>
        </Link>
        {isAuthenticated && (
          <Link to="/account">
            <Button variant="primary">View orders</Button>
          </Link>
        )}
      </div>
    </motion.div>
  );
}
