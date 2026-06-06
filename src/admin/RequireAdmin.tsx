import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminSession } from './useAdminSession';

export function RequireAdmin() {
  const location = useLocation();
  const { isAuthenticated, isRestoring } = useAdminSession();

  if (isRestoring) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface px-5">
        <div className="w-full max-w-sm rounded-lg border border-line bg-white p-6 shadow-soft">
          <div className="h-3 w-28 animate-pulse rounded-full bg-skySurface" />
          <div className="mt-5 h-8 w-4/5 animate-pulse rounded-md bg-skySurface" />
          <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-skySurface" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
