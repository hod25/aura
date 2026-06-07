import { useCallback, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { ordersApi, buildOrderPayload } from '@/api/orders';
import {
  CheckoutStepper,
  ShippingStep,
  PaymentStep,
  ConfirmationStep,
  OrderSummary,
  emptyCard,
  SHIPPING_FLAT,
  TAX_RATE,
  type CardDetails,
} from '@/components/features/checkout';
import { validateEmail, validateRequired } from '@/lib/validation';
import type { ShippingDetails } from '@/types';

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

  const [step, setStep] = useState(1);
  const [shipping, setShipping] = useState<ShippingDetails>(() => ({
    ...emptyShipping,
    fullName: user?.name ?? '',
    email: user?.email ?? '',
  }));
  const [shippingErrors, setShippingErrors] = useState<
    Partial<Record<keyof ShippingDetails, string>>
  >({});

  const [card, setCard] = useState<CardDetails>(emptyCard);
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState<string | number | null>(null);

  const tax = useMemo(() => subtotal * TAX_RATE, [subtotal]);
  const total = useMemo(() => subtotal + tax + SHIPPING_FLAT, [subtotal, tax]);

  const setShippingField = useCallback(
    (field: keyof ShippingDetails) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setShipping((prev) => ({ ...prev, [field]: e.target.value }));
      },
    [],
  );

  const handleCardChange = useCallback((patch: Partial<CardDetails>) => {
    setCard((prev) => ({ ...prev, ...patch }));
  }, []);

  const validateShipping = useCallback((): boolean => {
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
  }, [shipping]);

  const validateCard = useCallback((): boolean => {
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
  }, [card]);

  const handleShippingSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (validateShipping()) setStep(2);
    },
    [validateShipping],
  );

  const handlePaymentSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!validateCard()) return;

      setPlacing(true);
      // Simulate gateway latency for a realistic premium feel.
      await new Promise((resolve) => setTimeout(resolve, 1400));

      try {
        let createdId: string | number = `AURA-${Date.now()
          .toString()
          .slice(-8)}`;
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
    },
    [validateCard, isAuthenticated, items, shipping, total, clearCart, notify],
  );

  const goBackToShipping = useCallback(() => setStep(1), []);

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

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <CheckoutStepper currentStep={step} />

        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          {/* Step content */}
          <div>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <ShippingStep
                  key="shipping"
                  shipping={shipping}
                  errors={shippingErrors}
                  onFieldChange={setShippingField}
                  onSubmit={handleShippingSubmit}
                />
              )}

              {step === 2 && (
                <PaymentStep
                  key="payment"
                  card={card}
                  errors={cardErrors}
                  total={total}
                  placing={placing}
                  onCardChange={handleCardChange}
                  onBack={goBackToShipping}
                  onSubmit={handlePaymentSubmit}
                />
              )}

              {step === 3 && (
                <ConfirmationStep
                  key="confirmation"
                  fullName={shipping.fullName}
                  email={shipping.email}
                  orderId={orderId}
                  isAuthenticated={isAuthenticated}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Order summary */}
          {step < 3 && (
            <OrderSummary
              items={items}
              subtotal={subtotal}
              tax={tax}
              total={total}
            />
          )}
        </div>
      </div>
    </PageTransition>
  );
}
