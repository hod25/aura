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

/**
 * The backend contract may return the auth payload either at the root
 * ({ token, user }) or nested under `data`. This unwraps either shape.
 */
function unwrapAuth(payload: unknown): AuthResponse {
  const root = payload as Partial<AuthResponse> & { data?: AuthResponse };
  const result = root.data ?? (root as AuthResponse);
  return { token: result.token, user: result.user };
}

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post('/auth/login', payload);
    const auth = unwrapAuth(data);
    setStoredToken(auth.token);
    return auth;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post('/auth/register', payload);
    const auth = unwrapAuth(data);
    setStoredToken(auth.token);
    return auth;
  },

  async me(): Promise<User> {
    const { data } = await api.get('/auth/me');
    return (data?.data ?? data?.user ?? data) as User;
  },

  logout(): void {
    setStoredToken(null);
  },
};
