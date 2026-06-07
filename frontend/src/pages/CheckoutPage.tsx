import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  CreditCard,
  Lock,
  PackageCheck,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { ordersApi, buildOrderPayload } from '@/api/orders';
import { cn, formatCurrency } from '@/lib/utils';
import {
  validateEmail,
  validateRequired,
} from '@/lib/validation';
import type { ShippingDetails } from '@/types';

const steps = [
  { id: 1, label: 'Shipping', icon: Truck },
  { id: 2, label: 'Payment', icon: CreditCard },
  { id: 3, label: 'Confirmation', icon: PackageCheck },
] as const;

const SHIPPING_FLAT = 0;
const TAX_RATE = 0.08;

const emptyShipping: ShippingDetails = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
};

export function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [shipping, setShipping] = useState<ShippingDetails>(() => ({
    ...emptyShipping,
    fullName: user?.name ?? '',
    email: user?.email ?? '',
  }));
  const [shippingErrors, setShippingErrors] = useState<
    Partial<Record<keyof ShippingDetails, string>>
  >({});

  const [card, setCard] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: '',
  });
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState<string | number | null>(null);

  const tax = useMemo(() => subtotal * TAX_RATE, [subtotal]);
  const total = useMemo(() => subtotal + tax + SHIPPING_FLAT, [subtotal, tax]);

  // Empty-cart guard (but allow the confirmation screen after clearing).
  if (items.length === 0 && step < 3) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <p className="font-display text-3xl font-medium text-ink-900">
          Your cart is empty
        </p>
        <p className="mt-2 text-ink-500">
          Add a few beautiful things before checking out.
        </p>
        <Link to="/catalog" className="mt-6">
          <Button>Browse the collection</Button>
        </Link>
      </div>
    );
  }

  const setShippingField =
    (field: keyof ShippingDetails) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setShipping((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const validateShipping = (): boolean => {
    const next: Partial<Record<keyof ShippingDetails, string>> = {
      fullName: validateRequired(shipping.fullName, 'Full name'),
      email: validateEmail(shipping.email),
      phone: validateRequired(shipping.phone, 'Phone'),
      address: validateRequired(shipping.address, 'Address'),
      city: validateRequired(shipping.city, 'City'),
      state: validateRequired(shipping.state, 'State'),
      postalCode: validateRequired(shipping.postalCode, 'Postal code'),
      country: validateRequired(shipping.country, 'Country'),
    };
    setShippingErrors(next);
    return Object.values(next).every((v) => !v);
  };

  const validateCard = (): boolean => {
    const digits = card.number.replace(/\s/g, '');
    const next: Record<string, string> = {};
    if (digits.length < 15 || !/^\d+$/.test(digits))
      next.number = 'Enter a valid card number.';
    if (!card.name.trim()) next.name = 'Name on card is required.';
    if (!/^\d{2}\s*\/\s*\d{2}$/.test(card.expiry))
      next.expiry = 'Use MM / YY format.';
    if (!/^\d{3,4}$/.test(card.cvc)) next.cvc = 'Invalid CVC.';
    setCardErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleShippingSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validateShipping()) setStep(2);
  };

  const handlePaymentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateCard()) return;

    setPlacing(true);
    // Simulate gateway latency for a realistic premium feel.
    await new Promise((resolve) => setTimeout(resolve, 1400));

    try {
      let createdId: string | number = `AURA-${Date.now().toString().slice(-8)}`;
      if (isAuthenticated) {
        try {
          const order = await ordersApi.create(
            buildOrderPayload(items, shipping, total),
          );
          if (order?.id != null) createdId = order.id;
        } catch {
          /* offline / no backend — fall back to local confirmation */
        }
      }
      setOrderId(createdId);
      clearCart();
      setStep(3);
    } catch {
      notify('Payment could not be processed. Please try again.', 'error');
    } finally {
      setPlacing(false);
    }
  };

  const formatCardNumber = (value: string) =>
    value
      .replace(/\D/g, '')
      .slice(0, 16)
      .replace(/(.{4})/g, '$1 ')
      .trim();

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Stepper */}
        <div className="mx-auto mb-12 max-w-2xl">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => {
              const isComplete = step > s.id;
              const isActive = step === s.id;
              return (
                <div key={s.id} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        'flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all duration-300',
                        isComplete &&
                          'border-emerald-600 bg-emerald-600 text-white',
                        isActive &&
                          'border-ink-900 bg-ink-900 text-white shadow-soft',
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
                        isActive || isComplete
                          ? 'text-ink-900'
                          : 'text-ink-400',
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
                        animate={{ width: step > s.id ? '100%' : '0%' }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          {/* Step content */}
          <div>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.form
                  key="shipping"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleShippingSubmit}
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
                        onChange={setShippingField('fullName')}
                        error={shippingErrors.fullName}
                      />
                    </div>
                    <Input
                      label="Email"
                      type="email"
                      value={shipping.email}
                      onChange={setShippingField('email')}
                      error={shippingErrors.email}
                    />
                    <Input
                      label="Phone"
                      value={shipping.phone}
                      onChange={setShippingField('phone')}
                      error={shippingErrors.phone}
                    />
                    <div className="sm:col-span-2">
                      <Input
                        label="Address"
                        value={shipping.address}
                        onChange={setShippingField('address')}
                        error={shippingErrors.address}
                      />
                    </div>
                    <Input
                      label="City"
                      value={shipping.city}
                      onChange={setShippingField('city')}
                      error={shippingErrors.city}
                    />
                    <Input
                      label="State / Region"
                      value={shipping.state}
                      onChange={setShippingField('state')}
                      error={shippingErrors.state}
                    />
                    <Input
                      label="Postal code"
                      value={shipping.postalCode}
                      onChange={setShippingField('postalCode')}
                      error={shippingErrors.postalCode}
                    />
                    <Input
                      label="Country"
                      value={shipping.country}
                      onChange={setShippingField('country')}
                      error={shippingErrors.country}
                    />
                  </div>

                  <div className="mt-8 flex justify-end">
                    <Button type="submit" size="lg">
                      Continue to payment
                    </Button>
                  </div>
                </motion.form>
              )}

              {step === 2 && (
                <motion.form
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handlePaymentSubmit}
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
                          setCard((c) => ({
                            ...c,
                            number: formatCardNumber(e.target.value),
                          }))
                        }
                        error={cardErrors.number}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        label="Name on card"
                        value={card.name}
                        onChange={(e) =>
                          setCard((c) => ({ ...c, name: e.target.value }))
                        }
                        error={cardErrors.name}
                      />
                    </div>
                    <Input
                      label="Expiry"
                      placeholder="MM / YY"
                      value={card.expiry}
                      onChange={(e) =>
                        setCard((c) => ({ ...c, expiry: e.target.value }))
                      }
                      error={cardErrors.expiry}
                    />
                    <Input
                      label="CVC"
                      inputMode="numeric"
                      placeholder="123"
                      value={card.cvc}
                      onChange={(e) =>
                        setCard((c) => ({
                          ...c,
                          cvc: e.target.value.replace(/\D/g, '').slice(0, 4),
                        }))
                      }
                      error={cardErrors.cvc}
                    />
                  </div>

                  <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      variant="secondary"
                      isLoading={placing}
                    >
                      {placing
                        ? 'Processing…'
                        : `Pay ${formatCurrency(total)}`}
                    </Button>
                  </div>
                </motion.form>
              )}

              {step === 3 && (
                <motion.div
                  key="confirmation"
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
                    Thank you{shipping.fullName ? `, ${shipping.fullName.split(' ')[0]}` : ''}.
                    A confirmation has been sent to{' '}
                    <span className="font-medium text-ink-700">
                      {shipping.email}
                    </span>
                    .
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
              )}
            </AnimatePresence>
          </div>

          {/* Order summary */}
          {step < 3 && (
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
                        <p className="text-xs text-ink-400">
                          {item.product.category}
                        </p>
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
          )}
        </div>
      </div>
    </PageTransition>
  );
}
