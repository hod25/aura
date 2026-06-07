import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';

/**
 * Centralised Axios client for the Aura backend.
 * Base URL resolves from VITE_API_URL, defaulting to the documented
 * connection contract at http://localhost:5001/api.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? 'http://localhost:5001/api';

export const TOKEN_STORAGE_KEY = 'aura.token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    /* storage unavailable (private mode) — ignore */
  }
}

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach the bearer token to every outgoing request.
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// Normalise errors and react to auth expiry.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    if (error.response?.status === 401) {
      // Token invalid/expired — clear it so the UI can prompt re-login.
      setStoredToken(null);
    }
    return Promise.reject(error);
  },
);

/**
 * Detects a network-level failure (server unreachable / connection refused /
 * timeout) as opposed to a genuine HTTP error response. Used by the API layer
 * to transparently switch into an offline "Demo Mode" when the backend on
 * port 5001 is not running.
 */
export function isOfflineError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  // A populated `response` means the server replied (4xx/5xx) — not offline.
  if (error.response) return false;
  // No response + not a deliberate client cancellation => treat as offline.
  return error.code !== 'ERR_CANCELED';
}

/** Extracts a human-friendly message from any thrown API error. */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; error?: string | { message?: string } }
      | undefined;
    const nested =
      typeof data?.error === 'object' ? data?.error?.message : data?.error;
    return data?.message ?? nested ?? error.message ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
