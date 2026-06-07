import { motion } from 'framer-motion';
import { Check, CreditCard, PackageCheck, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  { id: 1, label: 'Shipping', icon: Truck },
  { id: 2, label: 'Payment', icon: CreditCard },
  { id: 3, label: 'Confirmation', icon: PackageCheck },
] as const;

/** Presentational progress indicator for the 3-step checkout wizard. */
export function CheckoutStepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="mx-auto mb-12 max-w-2xl">
      <div className="flex items-center justify-between">
        {steps.map((s, i) => {
          const isComplete = currentStep > s.id;
          const isActive = currentStep === s.id;
          return (
            <div key={s.id} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all duration-300',
                    isComplete && 'border-emerald-600 bg-emerald-600 text-white',
                    isActive && 'border-ink-900 bg-ink-900 text-white shadow-soft',
                    !isComplete &&
                      !isActive &&
                      'border-ink-200 bg-white text-ink-400',
                  )}
                >
                  {isComplete ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <s.icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium',
                    isActive || isComplete ? 'text-ink-900' : 'text-ink-400',
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="mx-2 h-0.5 flex-1 rounded-full bg-ink-200">
                  <motion.div
                    className="h-full rounded-full bg-emerald-600"
                    initial={false}
                    animate={{ width: currentStep > s.id ? '100%' : '0%' }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
