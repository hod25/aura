/**
 * Authentication Flow — integration test.
 *
 * Verifies that submitting valid credentials drives the AuthContext into an
 * authenticated state and persists a JWT-shaped token to localStorage. The
 * backend is mocked as offline so the app's built-in Demo Mode synthesises the
 * auth envelope (the same code path a live API would satisfy).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import { LoginPage } from '@/pages/LoginPage';
import { TOKEN_STORAGE_KEY } from '@/api/client';

vi.mock('framer-motion', () => import('./mocks/framer-motion'));

// Simulate the backend being unreachable so Demo Mode handles the request.
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

function AuthProbe() {
  const { isAuthenticated, user } = useAuth();
  return (
    <div data-testid="auth-probe">
      {isAuthenticated ? `in:${user?.email ?? ''}` : 'out'}
    </div>
  );
}

function renderLogin() {
  return render(
    <MemoryRouter
      initialEntries={['/login']}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <AuthProvider>
        <ToastProvider>
          <AuthProbe />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/catalog" element={<div>Catalog Landing</div>} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('Authentication flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('signs the user in and stores a JWT when valid credentials are submitted', async () => {
    renderLogin();

    expect(screen.getByTestId('auth-probe')).toHaveTextContent('out');

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'aria@aura.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'Password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // AuthContext should flip to authenticated for the submitted identity.
    await waitFor(() =>
      expect(screen.getByTestId('auth-probe')).toHaveTextContent(
        'in:aria@aura.com',
      ),
    );

    // A JWT-shaped token (header.payload.signature) must be persisted.
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    expect(token).toBeTruthy();
    expect(token!.split('.')).toHaveLength(3);

    // And the app should navigate the shopper into the catalog.
    expect(await screen.findByText('Catalog Landing')).toBeInTheDocument();
  });

  it('blocks sign-in and keeps the user signed out when the email is invalid', async () => {
    renderLogin();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'not-an-email' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'Password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(
      await screen.findByText('Enter a valid email address.'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('auth-probe')).toHaveTextContent('out');
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
  });
});
