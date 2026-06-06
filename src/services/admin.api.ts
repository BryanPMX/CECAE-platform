import { apiRequest } from './apiClient';
import type { AdminEvent, EventPayload } from './events.types';

export type LoginResponse = {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
};

export const adminAuthApi = {
  login: (email: string, password: string) =>
    apiRequest<LoginResponse>('/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  refresh: (refreshToken: string) =>
    apiRequest<LoginResponse>('/api/admin/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
  logout: (refreshToken: string) =>
    apiRequest<void>('/api/admin/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
};

export const adminEventsApi = {
  list: (accessToken: string) =>
    apiRequest<AdminEvent[]>('/api/admin/events', {
      accessToken,
    }),
  get: (accessToken: string, id: string) =>
    apiRequest<AdminEvent>(`/api/admin/events/${id}`, {
      accessToken,
    }),
  create: (accessToken: string, payload: EventPayload) =>
    apiRequest<AdminEvent>('/api/admin/events', {
      method: 'POST',
      accessToken,
      body: JSON.stringify(payload),
    }),
  update: (accessToken: string, id: string, payload: EventPayload) =>
    apiRequest<AdminEvent>(`/api/admin/events/${id}`, {
      method: 'PUT',
      accessToken,
      body: JSON.stringify(payload),
    }),
  remove: (accessToken: string, id: string) =>
    apiRequest<void>(`/api/admin/events/${id}`, {
      method: 'DELETE',
      accessToken,
    }),
};
