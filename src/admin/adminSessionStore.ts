import { createContext } from 'react';

export const refreshTokenStorageKey = 'cecae.admin.refreshToken';

export type AdminSessionContextValue = {
  accessToken: string | null;
  isAuthenticated: boolean;
  isRestoring: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<string | null>;
};

export const AdminSessionContext = createContext<AdminSessionContextValue | null>(null);
