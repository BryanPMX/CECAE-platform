import { useCallback } from 'react';
import { ApiError } from '@/services/apiClient';
import { useAdminSession } from './useAdminSession';

export function useAdminApi() {
  const { accessToken, refreshSession } = useAdminSession();

  return useCallback(
    async <T,>(request: (token: string) => Promise<T>) => {
      if (!accessToken) {
        throw new ApiError('Sesión no iniciada.', 401);
      }

      try {
        return await request(accessToken);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          const refreshedToken = await refreshSession();
          if (refreshedToken) {
            return request(refreshedToken);
          }
        }
        throw error;
      }
    },
    [accessToken, refreshSession],
  );
}
