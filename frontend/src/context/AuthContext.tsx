import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi, type LoginPayload, type RegisterPayload } from '@/api/auth';
import { getApiErrorMessage, getStoredToken, setStoredToken } from '@/api/client';
import type { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Rehydrate the session from a stored token on first load.
  useEffect(() => {
    let active = true;
    const stored = getStoredToken();

    if (!stored) {
      setIsInitializing(false);
      return;
    }

    authApi
      .me()
      .then((profile) => {
        if (active) setUser(profile);
      })
      .catch(() => {
        // Invalid/expired token — clear it silently.
        if (active) {
          setStoredToken(null);
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (active) setIsInitializing(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    try {
      const { token: nextToken, user: nextUser } = await authApi.login(payload);
      setToken(nextToken);
      setUser(nextUser);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to sign in.'));
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    try {
      const { token: nextToken, user: nextUser } =
        await authApi.register(payload);
      setToken(nextToken);
      setUser(nextUser);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to create account.'));
    }
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isInitializing,
      login,
      register,
      logout,
    }),
    [user, token, isInitializing, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
