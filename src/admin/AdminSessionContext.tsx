import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { adminAuthApi, type LoginResponse } from '@/services/admin.api';
import { AdminSessionContext, refreshTokenStorageKey } from './adminSessionStore';

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  const storeTokens = useCallback((tokens: LoginResponse) => {
    setAccessToken(tokens.accessToken);
    writeRefreshToken(tokens.refreshToken);
  }, []);

  const refreshSession = useCallback(async () => {
    const refreshToken = readRefreshToken();
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
      clearRefreshToken();
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
    const refreshToken = readRefreshToken();
    setAccessToken(null);
    clearRefreshToken();

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

function readRefreshToken() {
  try {
    return window.localStorage.getItem(refreshTokenStorageKey);
  } catch {
    return null;
  }
}

function writeRefreshToken(refreshToken: string) {
  try {
    window.localStorage.setItem(refreshTokenStorageKey, refreshToken);
  } catch {
    // Access tokens remain in memory, so login can still complete if storage is blocked.
  }
}

function clearRefreshToken() {
  try {
    window.localStorage.removeItem(refreshTokenStorageKey);
  } catch {
    // Storage may be unavailable in hardened browser modes.
  }
}
