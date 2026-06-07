import { type ChangeEvent, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { ShippingDetails } from '@/types';

export interface ShippingStepProps {
  shipping: ShippingDetails;
  errors: Partial<Record<keyof ShippingDetails, string>>;
  onFieldChange: (
    field: keyof ShippingDetails,
  ) => (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent) => void;
}

/** Step 1 — collects the customer's shipping address. */
export function ShippingStep({
  shipping,
  errors,
  onFieldChange,
  onSubmit,
}: ShippingStepProps) {
  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onSubmit={onSubmit}
      noValidate
      className="rounded-3xl border border-ink-200/60 bg-white p-6 sm:p-8"
    >
      <h2 className="font-display text-2xl font-semibold text-ink-900">
        Shipping details
      </h2>
      <p className="mt-1 text-sm text-ink-500">
        Where should we send your order?
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input
            label="Full name"
            value={shipping.fullName}
            onChange={onFieldChange('fullName')}
            error={errors.fullName}
          />
        </div>
        <Input
          label="Email"
          type="email"
          value={shipping.email}
          onChange={onFieldChange('email')}
          error={errors.email}
        />
        <Input
          label="Phone"
          value={shipping.phone}
          onChange={onFieldChange('phone')}
          error={errors.phone}
        />
        <div className="sm:col-span-2">
          <Input
            label="Address"
            value={shipping.address}
            onChange={onFieldChange('address')}
            error={errors.address}
          />
        </div>
        <Input
          label="City"
          value={shipping.city}
          onChange={onFieldChange('city')}
          error={errors.city}
        />
        <Input
          label="State / Region"
          value={shipping.state}
          onChange={onFieldChange('state')}
          error={errors.state}
        />
        <Input
          label="Postal code"
          value={shipping.postalCode}
          onChange={onFieldChange('postalCode')}
          error={errors.postalCode}
        />
        <Input
          label="Country"
          value={shipping.country}
          onChange={onFieldChange('country')}
          error={errors.country}
        />
      </div>

      <div className="mt-8 flex justify-end">
        <Button type="submit" size="lg">
          Continue to payment
        </Button>
      </div>
    </motion.form>
  );
}
