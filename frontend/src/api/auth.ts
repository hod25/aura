import { api, setStoredToken } from './client';
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

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post('/auth/login', payload);
    const auth = unwrapAuth(data);
    setStoredToken(auth.token);
    return auth;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post('/auth/signup', payload);
    const auth = unwrapAuth(data);
    setStoredToken(auth.token);
    return auth;
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
