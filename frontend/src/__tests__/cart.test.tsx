/**
 * Persistent Cart State — integration test.
 *
 * Confirms that adding a product through the catalog card increments the
 * navbar cart badge and that the cart is durably mirrored into localStorage
 * (the guest-cart persistence layer the CartContext relies on).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import { Navbar } from '@/components/layout/Navbar';
import { ProductCard } from '@/components/features/product';
import { MOCK_PRODUCTS } from '../data/catalog';
import type { CartItem } from '@/types';

vi.mock('framer-motion', () => import('./mocks/framer-motion'));

const product = MOCK_PRODUCTS[0];

function readStoredCart(): CartItem[] {
  return JSON.parse(localStorage.getItem('aura.cart') ?? '[]') as CartItem[];
}

describe('Persistent cart state', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('increments the navbar badge and persists items to localStorage', () => {
    renderWithProviders(
      <>
        <Navbar />
        <ProductCard product={product} />
      </>,
      { route: '/' },
    );

    const cartButton = screen.getByRole('button', { name: /open cart/i });
    // No badge while the cart is empty.
    expect(cartButton).not.toHaveTextContent('1');

    const addButton = screen.getByRole('button', {
      name: `Add ${product.name} to cart`,
    });

    fireEvent.click(addButton);
    expect(cartButton).toHaveTextContent('1');

    let stored = readStoredCart();
    expect(stored).toHaveLength(1);
    expect(stored[0].product.id).toBe(product.id);
    expect(stored[0].quantity).toBe(1);

    // Adding the same product again bumps the quantity, not a new line item.
    fireEvent.click(addButton);
    expect(cartButton).toHaveTextContent('2');

    stored = readStoredCart();
    expect(stored).toHaveLength(1);
    expect(stored[0].quantity).toBe(2);
  });

  it('rehydrates a previously stored cart on mount', () => {
    const seeded: CartItem[] = [{ id: product.id, product, quantity: 3 }];
    localStorage.setItem('aura.cart', JSON.stringify(seeded));

    renderWithProviders(<Navbar />, { route: '/' });

    expect(screen.getByRole('button', { name: /open cart/i })).toHaveTextContent(
      '3',
    );
  });
});
