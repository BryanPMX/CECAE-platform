import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { adminAuthApi, type LoginResponse } from '@/services/admin.api';
import { AdminSessionContext, refreshTokenStorageKey } from './adminSessionStore';

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  const storeTokens = useCallback((tokens: LoginResponse) => {
    setAccessToken(tokens.accessToken);
    window.localStorage.setItem(refreshTokenStorageKey, tokens.refreshToken);
  }, []);

  const refreshSession = useCallback(async () => {
    const refreshToken = window.localStorage.getItem(refreshTokenStorageKey);
    if (!refreshToken) {
      setAccessToken(null);
      return null;
    }

    try {
      const tokens = await adminAuthApi.refresh(refreshToken);
      storeTokens(tokens);
      return tokens.accessToken;
    } catch {
      setAccessToken(null);
      window.localStorage.removeItem(refreshTokenStorageKey);
      return null;
    }
  }, [storeTokens]);

  useEffect(() => {
    refreshSession().finally(() => setIsRestoring(false));
  }, [refreshSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const tokens = await adminAuthApi.login(email, password);
      storeTokens(tokens);
    },
    [storeTokens],
  );

  const logout = useCallback(async () => {
    const refreshToken = window.localStorage.getItem(refreshTokenStorageKey);
    setAccessToken(null);
    window.localStorage.removeItem(refreshTokenStorageKey);

    if (refreshToken) {
      try {
        await adminAuthApi.logout(refreshToken);
      } catch {
        // A local logout should still complete if the token was already expired.
      }
    }
  }, []);

  const value = useMemo(
    () => ({
      accessToken,
      isAuthenticated: Boolean(accessToken),
      isRestoring,
      login,
      logout,
      refreshSession,
    }),
    [accessToken, isRestoring, login, logout, refreshSession],
  );

  return <AdminSessionContext.Provider value={value}>{children}</AdminSessionContext.Provider>;
}
