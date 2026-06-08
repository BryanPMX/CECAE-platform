import { createContext } from 'react';

export const refreshTokenStorageKey = 'cecae.admin.refreshToken';
export const adminLastActivityStorageKey = 'cecae.admin.lastActivityAt';
export const adminIdleTimeoutMs = 15 * 60 * 1000;

export type AdminSessionContextValue = {
  accessToken: string | null;
  isAuthenticated: boolean;
  isRestoring: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<string | null>;
};

export const AdminSessionContext = createContext<AdminSessionContextValue | null>(null);
