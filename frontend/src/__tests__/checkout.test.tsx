/**
 * Multi-Step Checkout Wizard — integration test.
 *
 * Walks the full checkout flow: Shipping form validation → simulated Payment
 * gateway → final Order Confirmation, asserting each step transition and that
 * the client-side cart is flushed automatically once the order is confirmed.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';
import { renderWithProviders, seedGuestCart } from './test-utils';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { MOCK_PRODUCTS } from '@/data/catalog';
import type { CartItem } from '@/types';

vi.mock('framer-motion', () => import('./mocks/framer-motion'));

const cartItem: CartItem = {
  id: MOCK_PRODUCTS[0].id,
  product: MOCK_PRODUCTS[0],
  quantity: 1,
};

function fillShipping() {
  fireEvent.change(screen.getByLabelText('Full name'), {
    target: { value: 'Aria Lumen' },
  });
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'aria@aura.com' },
  });
  fireEvent.change(screen.getByLabelText('Phone'), {
    target: { value: '5551234567' },
  });
  fireEvent.change(screen.getByLabelText('Address'), {
    target: { value: '1 Atelier Way' },
  });
  fireEvent.change(screen.getByLabelText('City'), {
    target: { value: 'Lisbon' },
  });
  fireEvent.change(screen.getByLabelText('State / Region'), {
    target: { value: 'Lisboa' },
  });
  fireEvent.change(screen.getByLabelText('Postal code'), {
    target: { value: '1000-001' },
  });
  fireEvent.change(screen.getByLabelText('Country'), {
    target: { value: 'Portugal' },
  });
}

function fillCard() {
  fireEvent.change(screen.getByLabelText('Card number'), {
    target: { value: '4242424242424242' },
  });
  fireEvent.change(screen.getByLabelText('Name on card'), {
    target: { value: 'Aria Lumen' },
  });
  fireEvent.change(screen.getByLabelText('Expiry'), {
    target: { value: '12 / 25' },
  });
  fireEvent.change(screen.getByLabelText('CVC'), {
    target: { value: '123' },
  });
}

describe('Multi-step checkout wizard', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('blocks progression past shipping until required fields are valid', () => {
    seedGuestCart([cartItem]);
    renderWithProviders(<CheckoutPage />, { route: '/checkout' });

    // Submitting the empty shipping form surfaces validation and stays on step 1.
    fireEvent.click(screen.getByRole('button', { name: /continue to payment/i }));

    expect(screen.getByText('Full name is required.')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Shipping details' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Payment' }),
    ).not.toBeInTheDocument();
  });

  it('advances Shipping → Payment → Confirmation and flushes the cart', async () => {
    seedGuestCart([cartItem]);
    renderWithProviders(<CheckoutPage />, { route: '/checkout' });

    // Step 1 — Shipping
    expect(
      screen.getByRole('heading', { name: 'Shipping details' }),
    ).toBeInTheDocument();
    fillShipping();
    fireEvent.click(screen.getByRole('button', { name: /continue to payment/i }));

    // Step 2 — Payment simulator
    expect(screen.getByRole('heading', { name: 'Payment' })).toBeInTheDocument();
    fillCard();
    fireEvent.click(screen.getByRole('button', { name: /^Pay/i }));

    // Simulated gateway latency (1400ms) resolves into the confirmation step.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
    });

    // Step 3 — Confirmation
    expect(
      screen.getByRole('heading', { name: 'Order confirmed' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/order number/i)).toBeInTheDocument();

    // The client-side cart must flush automatically on success.
    expect(localStorage.getItem('aura.cart')).toBe('[]');
  });
});
