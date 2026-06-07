import { type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/components/ui/Toast';
import type { CartItem } from '@/types';

interface ProviderOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Initial router entries; first entry is the active route. */
  route?: string;
}

/** Mirrors the production provider tree used in main.tsx. */
export function AppProviders({
  children,
  route = '/',
}: {
  children: ReactNode;
  route?: string;
}) {
  return (
    <MemoryRouter
      initialEntries={[route]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <AuthProvider>
        <CartProvider>
          <ToastProvider>{children}</ToastProvider>
        </CartProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

/** Renders a UI tree wrapped in the full Aura provider stack. */
export function renderWithProviders(
  ui: ReactElement,
  { route, ...options }: ProviderOptions = {},
) {
  return render(ui, {
    wrapper: ({ children }) => <AppProviders route={route}>{children}</AppProviders>,
    ...options,
  });
}

/** Seeds the guest cart in localStorage before a provider mounts. */
export function seedGuestCart(items: CartItem[]): void {
  localStorage.setItem('aura.cart', JSON.stringify(items));
}

export * from '@testing-library/react';
