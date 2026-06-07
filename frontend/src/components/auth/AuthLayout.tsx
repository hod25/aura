import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

const highlights = [
  'Curated objects of quiet beauty',
  'Carbon-neutral white-glove delivery',
  'A lifetime craftsmanship guarantee',
];

/** Split-screen premium auth shell with an editorial brand panel. */
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-ink-950 lg:block">
        <img
          src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=80"
          alt="A serene, light-filled interior"
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-ink-950/20" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-gold-400 backdrop-blur">
              <span className="font-display text-2xl font-semibold">A</span>
            </span>
            <span className="font-display text-3xl font-semibold text-white">
              Aura
            </span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="max-w-md font-display text-4xl font-medium leading-tight text-white">
              Refined objects for a life lived beautifully.
            </h2>
            <ul className="mt-8 space-y-3">
              {highlights.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-sm text-white/80"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Aura. Crafted with intention.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-ink-50 px-6 py-12 sm:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <Link
            to="/"
            className="mb-10 flex items-center gap-2.5 lg:hidden"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-900 text-gold-400">
              <span className="font-display text-xl font-semibold">A</span>
            </span>
            <span className="font-display text-2xl font-semibold text-ink-900">
              Aura
            </span>
          </Link>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-semibold text-ink-900">
              {title}
            </h1>
            <p className="mt-2 text-sm text-ink-500">{subtitle}</p>
          </div>

          {children}

          <div className="mt-8 text-center text-sm text-ink-500">{footer}</div>
        </motion.div>
      </div>
    </div>
  );
}
