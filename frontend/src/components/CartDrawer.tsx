import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { drawerVariants, overlayVariants } from '@/lib/motion';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    subtotal,
    itemCount,
  } = useCart();
  const navigate = useNavigate();

  const goToCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[80]">
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeDrawer}
            className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.aside
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-ink-50 shadow-glass"
            role="dialog"
            aria-label="Shopping cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-ink-200/70 px-6 py-5">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="h-5 w-5 text-ink-700" />
                <h2 className="font-display text-xl font-semibold text-ink-900">
                  Your Cart
                </h2>
                <span className="rounded-full bg-ink-200 px-2 py-0.5 text-xs font-semibold text-ink-600">
                  {itemCount}
                </span>
              </div>
              <button
                onClick={closeDrawer}
                aria-label="Close cart"
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-ink-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items */}
            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink-100">
                  <ShoppingBag className="h-7 w-7 text-ink-300" />
                </div>
                <div>
                  <p className="font-medium text-ink-900">Your cart is empty</p>
                  <p className="mt-1 text-sm text-ink-400">
                    Beautiful things are waiting to be discovered.
                  </p>
                </div>
                <Button variant="outline" onClick={closeDrawer}>
                  Continue shopping
                </Button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <ul className="space-y-4">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.product.id}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, x: 40 }}
                        transition={{ duration: 0.25 }}
                        className="flex gap-4"
                      >
                        <Link
                          to={`/product/${item.product.id}`}
                          onClick={closeDrawer}
                          className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-ink-100"
                        >
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        </Link>
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              to={`/product/${item.product.id}`}
                              onClick={closeDrawer}
                              className="text-sm font-medium leading-snug text-ink-900 hover:text-emerald-700"
                            >
                              {item.product.name}
                            </Link>
                            <button
                              onClick={() => removeItem(item.product.id)}
                              aria-label={`Remove ${item.product.name}`}
                              className="text-ink-300 transition-colors hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="mt-0.5 text-xs text-ink-400">
                            {item.product.category}
                          </p>
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <div className="flex items-center rounded-full border border-ink-200">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.quantity - 1,
                                  )
                                }
                                aria-label="Decrease quantity"
                                className="flex h-7 w-7 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-ink-100"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-7 text-center text-sm font-medium text-ink-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.quantity + 1,
                                  )
                                }
                                aria-label="Increase quantity"
                                className="flex h-7 w-7 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-ink-100"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <span className="text-sm font-semibold text-ink-900">
                              {formatCurrency(item.product.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </div>
            )}

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-ink-200/70 bg-white px-6 py-5">
                <div className="mb-1 flex items-center justify-between text-sm text-ink-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="mb-4 flex items-center justify-between text-xs text-ink-400">
                  <span>Shipping & taxes</span>
                  <span>Calculated at checkout</span>
                </div>
                <Button fullWidth size="lg" variant="secondary" onClick={goToCheckout}>
                  Checkout · {formatCurrency(subtotal)}
                </Button>
                <button
                  onClick={closeDrawer}
                  className="mt-3 w-full text-center text-sm font-medium text-ink-500 transition-colors hover:text-ink-900"
                >
                  Continue shopping
                </button>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
