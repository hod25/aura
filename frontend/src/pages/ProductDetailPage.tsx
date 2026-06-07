import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  Loader2,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/Button';
import { productsApi } from '@/api/products';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/Toast';
import { cn, formatCurrency, productImage } from '@/lib/utils';
import type { Product } from '@/types';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, openDrawer } = useCart();
  const { notify } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setIsLoading(true);
    setNotFound(false);
    productsApi
      .get(id)
      .then((data) => {
        if (!active) return;
        if (data) {
          setProduct(data);
          setActiveImage(0);
          setQuantity(1);
        } else {
          setNotFound(true);
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const handleAdd = () => {
    if (!product) return;
    addItem(product, quantity);
    notify(`${product.name} added to cart`);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink-400" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <p className="font-display text-3xl font-medium text-ink-900">
          Piece not found
        </p>
        <p className="mt-2 text-ink-500">
          The item you&apos;re looking for may have sold out or moved.
        </p>
        <Button className="mt-6" onClick={() => navigate('/catalog')}>
          Back to shop
        </Button>
      </div>
    );
  }

  const gallery =
    product.images && product.images.length > 0
      ? product.images
      : [productImage(product)];

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          to="/catalog"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition-colors hover:text-ink-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to shop
        </Link>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Gallery */}
          <div>
            <div className="overflow-hidden rounded-3xl bg-ink-100">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={gallery[activeImage]}
                  alt={product.name}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="aspect-square w-full object-cover"
                />
              </AnimatePresence>
            </div>
            {gallery.length > 1 && (
              <div className="mt-4 flex gap-3">
                {gallery.map((img, i) => (
                  <button
                    key={img}
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      'h-20 w-20 overflow-hidden rounded-xl border-2 transition-colors',
                      i === activeImage
                        ? 'border-ink-900'
                        : 'border-transparent opacity-70 hover:opacity-100',
                    )}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="lg:py-4">
            <div className="flex items-center justify-between">
              <span className="eyebrow">{product.category}</span>
              {product.rating != null && (
                <span className="flex items-center gap-1.5 text-sm text-ink-500">
                  <Star className="h-4 w-4 fill-gold-400 text-gold-400" />
                  <span className="font-medium text-ink-900">
                    {product.rating.toFixed(1)}
                  </span>
                  {product.reviews != null && (
                    <span className="text-ink-400">
                      ({product.reviews} reviews)
                    </span>
                  )}
                </span>
              )}
            </div>

            <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-ink-900 sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-4 text-3xl font-semibold text-ink-900">
              {formatCurrency(product.price)}
            </p>

            <p className="mt-6 leading-relaxed text-ink-600">
              {product.description}
            </p>

            {/* Stock */}
            {product.stock != null && (
              <p className="mt-4 inline-flex items-center gap-2 text-sm">
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    product.stock > 0 ? 'bg-emerald-500' : 'bg-red-500',
                  )}
                />
                <span className="text-ink-500">
                  {product.stock > 0
                    ? `In stock · ${product.stock} available`
                    : 'Currently out of stock'}
                </span>
              </p>
            )}

            {/* Quantity + add */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center rounded-full border border-ink-200 bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="flex h-12 w-12 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-ink-100"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-base font-semibold text-ink-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="flex h-12 w-12 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-ink-100"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Button
                size="lg"
                variant={added ? 'secondary' : 'primary'}
                onClick={handleAdd}
                className="flex-1"
                disabled={product.stock === 0}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {added ? (
                    <motion.span
                      key="added"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="h-5 w-5" />
                      Added to cart
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex items-center gap-2"
                    >
                      <ShoppingBag className="h-5 w-5" />
                      Add to cart
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </div>

            <button
              onClick={openDrawer}
              className="mt-3 text-sm font-medium text-ink-500 transition-colors hover:text-ink-900"
            >
              View cart →
            </button>

            {/* Assurances */}
            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-ink-200/70 pt-8">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-emerald-600" />
                <span className="text-sm text-ink-600">
                  Free, insured delivery
                </span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <span className="text-sm text-ink-600">Lifetime guarantee</span>
              </div>
            </div>

            {/* Specs */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="mt-8">
                <h2 className="eyebrow mb-4">Specifications</h2>
                <dl className="overflow-hidden rounded-2xl border border-ink-200/70">
                  {Object.entries(product.specs).map(([key, value], i) => (
                    <div
                      key={key}
                      className={cn(
                        'flex items-center justify-between px-5 py-3.5 text-sm',
                        i % 2 === 0 ? 'bg-white' : 'bg-ink-50',
                      )}
                    >
                      <dt className="text-ink-500">{key}</dt>
                      <dd className="font-medium text-ink-900">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
