import { api, isOfflineError, setStoredToken } from './client';
import type { AuthResponse, User } from '@/types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface RawUser {
  id: string | number;
  name: string;
  email: string;
  created_at?: string;
  createdAt?: string;
}

/** Maps a backend user DTO onto the frontend User domain type. */
function mapUser(raw: RawUser): User {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    createdAt: raw.created_at ?? raw.createdAt,
  };
}

/**
 * Unwraps the backend envelope `{ success, data: { user, token } }` as well
 * as a flat `{ user, token }` shape.
 */
function unwrapAuth(payload: unknown): AuthResponse {
  const root = payload as {
    data?: { user: RawUser; token: string };
    user?: RawUser;
    token?: string;
  };
  const result = root.data ?? (root as { user?: RawUser; token?: string });
  return {
    token: result.token as string,
    user: mapUser(result.user as RawUser),
  };
}

/* --------------------------------------------------------------------------
 * Demo Mode — graceful offline fallback
 * When the backend on port 5001 is unreachable, these helpers synthesise a
 * realistic auth envelope so a stakeholder can click through the full flow
 * without a live database. The token is a dummy, non-cryptographic JWT-shaped
 * string and carries no real authority.
 * ------------------------------------------------------------------------ */

/** URL-safe base64 encoder that tolerates unicode input. */
function base64Url(input: string): string {
  const b64 =
    typeof btoa === 'function'
      ? btoa(unescape(encodeURIComponent(input)))
      : input;
  return b64.replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/** Builds a dummy JWT-shaped bearer token (header.payload.signature). */
function createMockToken(user: User): string {
  const header = base64Url(JSON.stringify({ alg: 'demo', typ: 'JWT' }));
  const payload = base64Url(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      role: 'customer',
      iat: Math.floor(Date.now() / 1000),
    }),
  );
  const signature = base64Url(`aura-demo-${Math.random().toString(36).slice(2)}`);
  return `${header}.${payload}.${signature}`;
}

/** Derives a presentable display name from an email local-part. */
function nameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? '';
  const pretty = local
    .replace(/[._-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return pretty || 'Aura Guest';
}

/** Synthesises a complete, type-safe auth envelope for offline Demo Mode. */
function createMockAuth(name: string, email: string): AuthResponse {
  const user: User = {
    id: `demo-${Math.random().toString(36).slice(2, 10)}`,
    name: name || 'Aura Guest',
    email,
    role: 'customer',
    createdAt: new Date().toISOString(),
  };
  return { token: createMockToken(user), user };
}

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const { data } = await api.post('/auth/login', payload);
      const auth = unwrapAuth(data);
      setStoredToken(auth.token);
      return auth;
    } catch (error) {
      if (!isOfflineError(error)) throw error;
      // Backend offline — seamlessly sign the shopper in under Demo Mode.
      const auth = createMockAuth(nameFromEmail(payload.email), payload.email);
      setStoredToken(auth.token);
      return auth;
    }
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const { data } = await api.post('/auth/signup', payload);
      const auth = unwrapAuth(data);
      setStoredToken(auth.token);
      return auth;
    } catch (error) {
      if (!isOfflineError(error)) throw error;
      // Backend offline — create the account locally under Demo Mode.
      const auth = createMockAuth(payload.name, payload.email);
      setStoredToken(auth.token);
      return auth;
    }
  },

  async me(): Promise<User> {
    const { data } = await api.get('/auth/me');
    const root = data as {
      data?: { user?: RawUser } | RawUser;
      user?: RawUser;
    };
    const nested =
      (root.data as { user?: RawUser })?.user ??
      (root.data as RawUser) ??
      root.user ??
      (data as RawUser);
    return mapUser(nested as RawUser);
  },

  logout(): void {
    setStoredToken(null);
  },
};
