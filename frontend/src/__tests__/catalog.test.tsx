/**
 * Catalog Search & Filtering — integration test.
 *
 * Drives the live catalog UI and asserts that the search field, category
 * toggles and the max-price slider each narrow the rendered product grid to
 * the correct subset. The backend is mocked offline so the deterministic local
 * catalog (MOCK_PRODUCTS) backs the grid.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import { CatalogPage } from '@/pages/CatalogPage';

vi.mock('framer-motion', () => import('./mocks/framer-motion'));

vi.mock('@/api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/client')>();
  const offline = () =>
    Promise.reject(
      Object.assign(new Error('Network Error'), {
        isAxiosError: true,
        code: 'ERR_NETWORK',
      }),
    );
  return {
    ...actual,
    api: { get: offline, post: offline, put: offline, delete: offline },
  };
});

async function renderCatalog() {
  renderWithProviders(<CatalogPage />, { route: '/catalog' });
  // Wait until the local catalog has loaded into the grid.
  await screen.findByText('Meridian Lounge Chair');
}

describe('Catalog search & filtering', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('filters the grid live as the shopper types into the search bar', async () => {
    await renderCatalog();

    fireEvent.change(screen.getByPlaceholderText(/search by name/i), {
      target: { value: 'vase' },
    });

    expect(screen.getByText('Aperture Ceramic Vase')).toBeInTheDocument();
    expect(screen.queryByText('Meridian Lounge Chair')).not.toBeInTheDocument();
    expect(screen.queryByText('Noctis Pendant Light')).not.toBeInTheDocument();
  });

  it('isolates a single category when its filter button is toggled', async () => {
    await renderCatalog();

    const sidebar = screen.getByRole('complementary');
    fireEvent.click(within(sidebar).getByRole('button', { name: /^Furniture/ }));

    // Only the two Furniture pieces should remain in the grid.
    expect(screen.getByText('Meridian Lounge Chair')).toBeInTheDocument();
    expect(screen.getByText('Strata Oak Side Table')).toBeInTheDocument();
    expect(screen.queryByText('Aperture Ceramic Vase')).not.toBeInTheDocument();
  });

  it('restricts results to the chosen maximum price', async () => {
    await renderCatalog();

    fireEvent.change(screen.getByRole('slider'), { target: { value: '200' } });

    // Pieces at or under $200 stay; pricier pieces drop out.
    expect(screen.getByText('Solis Wool Throw')).toBeInTheDocument();
    expect(screen.getByText('C8 Pour-Over Set')).toBeInTheDocument();
    expect(screen.queryByText('Aperture Ceramic Vase')).not.toBeInTheDocument();
    expect(screen.queryByText('Meridian Lounge Chair')).not.toBeInTheDocument();
  });
});
