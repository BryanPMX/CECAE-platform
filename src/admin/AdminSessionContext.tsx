import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { adminAuthApi, type LoginResponse } from '@/services/admin.api';
import {
  AdminSessionContext,
  adminIdleTimeoutMs,
  adminLastActivityStorageKey,
  refreshTokenStorageKey,
} from './adminSessionStore';

const adminActivityEvents = ['click', 'keydown', 'pointerdown', 'touchstart', 'scroll'] as const;

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const lastActivityAtRef = useRef<number | null>(null);

  const storeTokens = useCallback((tokens: LoginResponse) => {
    const now = Date.now();
    setAccessToken(tokens.accessToken);
    writeRefreshToken(tokens.refreshToken);
    writeLastActivityAt(now);
    lastActivityAtRef.current = now;
  }, []);

  const refreshSession = useCallback(async () => {
    const refreshToken = readRefreshToken();
    if (!refreshToken) {
      setAccessToken(null);
      return null;
    }

    if (adminSessionIdleExpired()) {
      setAccessToken(null);
      lastActivityAtRef.current = null;
      clearStoredSession();
      return null;
    }

    try {
      const tokens = await adminAuthApi.refresh(refreshToken);
      storeTokens(tokens);
      return tokens.accessToken;
    } catch {
      setAccessToken(null);
      lastActivityAtRef.current = null;
      clearStoredSession();
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
    lastActivityAtRef.current = null;
    clearStoredSession();

    if (refreshToken) {
      try {
        await adminAuthApi.logout(refreshToken);
      } catch {
        // A local logout should still complete if the token was already expired.
      }
    }
  }, []);

  const logoutRef = useRef(logout);

  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  useEffect(() => {
    if (!accessToken || isRestoring) return undefined;

    let idleTimer: ReturnType<typeof window.setTimeout> | undefined;

    const clearIdleTimer = () => {
      if (idleTimer) window.clearTimeout(idleTimer);
      idleTimer = undefined;
    };

    const currentLastActivityAt = () => readLastActivityAt() ?? lastActivityAtRef.current;

    const expireIfIdle = () => {
      const lastActivityAt = currentLastActivityAt();
      const remainingTime = lastActivityAt ? adminIdleTimeoutMs - (Date.now() - lastActivityAt) : adminIdleTimeoutMs;

      if (remainingTime <= 0) {
        clearIdleTimer();
        void logoutRef.current();
        return;
      }

      clearIdleTimer();
      idleTimer = window.setTimeout(expireIfIdle, remainingTime);
    };

    const registerActivity = () => {
      const lastActivityAt = currentLastActivityAt();
      if (lastActivityAt && Date.now() - lastActivityAt >= adminIdleTimeoutMs) {
        void logoutRef.current();
        return;
      }

      const now = Date.now();
      lastActivityAtRef.current = now;
      writeLastActivityAt(now);
      expireIfIdle();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') expireIfIdle();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === refreshTokenStorageKey && !event.newValue) {
        setAccessToken(null);
        return;
      }

      if (event.key === adminLastActivityStorageKey) {
        expireIfIdle();
      }
    };

    if (!currentLastActivityAt()) {
      const now = Date.now();
      lastActivityAtRef.current = now;
      writeLastActivityAt(now);
    }
    expireIfIdle();

    adminActivityEvents.forEach((eventName) => {
      window.addEventListener(eventName, registerActivity, { passive: true });
    });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      clearIdleTimer();
      adminActivityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, registerActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, [accessToken, isRestoring]);

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

function readLastActivityAt() {
  try {
    const value = window.localStorage.getItem(adminLastActivityStorageKey);
    if (!value) return null;

    const timestamp = Number(value);
    return Number.isFinite(timestamp) ? timestamp : null;
  } catch {
    return null;
  }
}

function writeLastActivityAt(timestamp: number) {
  try {
    window.localStorage.setItem(adminLastActivityStorageKey, String(timestamp));
  } catch {
    // If storage is unavailable, the active tab still enforces its in-memory timer.
  }
}

function adminSessionIdleExpired() {
  const lastActivityAt = readLastActivityAt();
  return Boolean(lastActivityAt && Date.now() - lastActivityAt >= adminIdleTimeoutMs);
}

function clearStoredSession() {
  try {
    window.localStorage.removeItem(refreshTokenStorageKey);
    window.localStorage.removeItem(adminLastActivityStorageKey);
  } catch {
    // Storage may be unavailable in hardened browser modes.
  }
}
