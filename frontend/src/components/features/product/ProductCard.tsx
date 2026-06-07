import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Star } from 'lucide-react';
import type { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/Toast';
import { fadeUpItem } from '@/lib/motion';
import { formatCurrency } from '@/lib/utils';

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { notify } = useToast();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    notify(`${product.name} added to cart`);
  };

  return (
    <motion.div variants={fadeUpItem}>
      <Link
        to={`/product/${product.id}`}
        className="group block overflow-hidden rounded-3xl border border-ink-200/60 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-glass"
      >
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden bg-ink-100">
          <motion.img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {product.featured && (
            <span className="absolute left-3 top-3 rounded-full bg-gold-500/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-950 shadow-glow-gold">
              Featured
            </span>
          )}

          {/* Quick add */}
          <motion.button
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute bottom-3 right-3 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-white/95 text-ink-900 opacity-0 shadow-soft backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
          >
            <Plus className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="mb-1 flex items-center justify-between">
            <span className="eyebrow">{product.category}</span>
            {product.rating != null && (
              <span className="flex items-center gap-1 text-xs font-medium text-ink-500">
                <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
                {product.rating.toFixed(1)}
              </span>
            )}
          </div>
          <h3 className="font-display text-lg font-semibold leading-snug text-ink-900 transition-colors group-hover:text-emerald-700">
            {product.name}
          </h3>
          <p className="mt-3 text-base font-semibold text-ink-900">
            {formatCurrency(product.price)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
