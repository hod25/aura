import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, Menu, ShoppingBag, User as UserIcon, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { cn, initials } from '@/lib/utils';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/catalog', label: 'Shop' },
];

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount, openDrawer } = useCart();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'glass border-b border-white/40 py-3'
          : 'bg-transparent py-5',
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-900 text-gold-400 shadow-soft transition-transform group-hover:scale-105">
            <span className="font-display text-xl font-semibold">A</span>
          </span>
          <span className="font-display text-2xl font-semibold tracking-tight text-ink-900">
            Aura
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'relative rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-ink-900'
                    : 'text-ink-500 hover:text-ink-900',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gold-500"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={openDrawer}
            aria-label="Open cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-ink-100"
          >
            <ShoppingBag className="h-5 w-5" />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1 text-[11px] font-semibold text-white"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {isAuthenticated ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-900 text-sm font-semibold text-white transition-transform hover:scale-105"
                aria-label="Account menu"
              >
                {user ? initials(user.name) : <UserIcon className="h-4 w-4" />}
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      className="glass absolute right-0 z-20 mt-3 w-56 overflow-hidden rounded-2xl p-2"
                    >
                      <div className="px-3 py-2.5">
                        <p className="truncate text-sm font-semibold text-ink-900">
                          {user?.name}
                        </p>
                        <p className="truncate text-xs text-ink-400">
                          {user?.email}
                        </p>
                      </div>
                      <div className="my-1 h-px bg-ink-200/60" />
                      <Link
                        to="/account"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100"
                      >
                        <UserIcon className="h-4 w-4" />
                        My Account
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden rounded-full bg-ink-900 px-5 py-2.5 text-sm font-medium text-white shadow-soft transition-all hover:bg-ink-800 md:inline-flex"
            >
              Sign in
            </Link>
          )}

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-ink-100 md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden md:hidden"
          >
            <nav className="mx-4 mt-3 flex flex-col gap-1 rounded-2xl border border-white/40 bg-white/80 p-3 backdrop-blur-xl">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-ink-900 text-white'
                        : 'text-ink-700 hover:bg-ink-100',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              {isAuthenticated ? (
                <>
                  <NavLink
                    to="/account"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100"
                  >
                    My Account
                  </NavLink>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="rounded-xl px-4 py-3 text-left text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <NavLink
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl bg-ink-900 px-4 py-3 text-center text-sm font-medium text-white"
                >
                  Sign in
                </NavLink>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
