import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Truck, ShieldCheck, Leaf } from 'lucide-react';
import { PageTransition } from '@/components/layout/PageTransition';
import { ProductGrid } from '@/components/features/product';
import { Button } from '@/components/ui/Button';
import { MotionImage } from '@/components/ui/MotionImage';
import { useProducts } from '@/hooks/useProducts';
import heroAtelier from '@/assets/hero-atelier.svg';

const perks = [
  { icon: Truck, title: 'White-glove delivery', desc: 'Carbon-neutral, fully insured.' },
  { icon: ShieldCheck, title: 'Lifetime guarantee', desc: 'We stand behind every piece.' },
  { icon: Leaf, title: 'Responsibly made', desc: 'Honest materials, fair makers.' },
];

export function HomePage() {
  const { products, isLoading } = useProducts();
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const showcase = featured.length ? featured : products.slice(0, 4);

  return (
    <PageTransition>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          {/* Local asset served from Nginx /assets (port 3000) — never the API. */}
          <MotionImage src={heroAtelier} alt="" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-50 via-ink-50/85 to-ink-50/30" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-36">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl rounded-[2rem] border border-white/30 bg-white/10 p-8 shadow-glass backdrop-blur-md sm:p-10"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white/70 px-4 py-1.5 text-xs font-medium text-ink-600 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-gold-500" />
              New · The Atelier Collection
            </span>
            <h1 className="mt-6 font-display text-5xl font-medium leading-[1.05] text-ink-900 sm:text-6xl lg:text-7xl">
              Objects of{' '}
              <span className="gradient-gold-text">quiet beauty</span> for
              considered living.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-600">
              A curated marketplace of furniture, lighting and decor — each
              piece chosen for its craft, material honesty, and the way it ages
              with grace.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link to="/catalog">
                <Button size="lg" variant="primary">
                  Explore the collection
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" variant="outline">
                  Create an account
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Perks */}
      <section className="border-y border-ink-200/70 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6 lg:px-8">
          {perks.map((perk) => (
            <div key={perk.title} className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <perk.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium text-ink-900">{perk.title}</p>
                <p className="text-sm text-ink-500">{perk.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <span className="eyebrow">Hand-selected</span>
            <h2 className="mt-2 font-display text-4xl font-semibold text-ink-900">
              Featured pieces
            </h2>
          </div>
          <Link
            to="/catalog"
            className="hidden items-center gap-1.5 text-sm font-medium text-ink-700 transition-colors hover:text-emerald-700 sm:flex"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <ProductGrid
          products={showcase}
          isLoading={isLoading}
          skeletonCount={4}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4"
        />
      </section>

      {/* CTA band */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink-900 px-8 py-16 text-center sm:px-16">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-600/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gold-500/20 blur-3xl" />
          <div className="relative">
            <h2 className="font-display text-4xl font-medium text-white sm:text-5xl">
              Live with intention.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-white/60">
              Discover pieces that bring calm, warmth and lasting beauty to your
              space.
            </p>
            <Link to="/catalog" className="mt-8 inline-block">
              <Button size="lg" variant="gold">
                Start shopping
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
