import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AdminSessionProvider } from '@/admin/AdminSessionContext';
import { RequireAdmin } from '@/admin/RequireAdmin';
import { FloatingWhatsApp } from '@/components/layout/FloatingWhatsApp';
import { PageShell } from '@/components/layout/PageShell';
import { HomePage } from '@/pages/HomePage';

const EventsPage = lazy(() =>
  import('@/pages/EventsPage').then((module) => ({ default: module.EventsPage })),
);
const EventDetailPage = lazy(() =>
  import('@/pages/EventDetailPage').then((module) => ({ default: module.EventDetailPage })),
);
const PrivacyPage = lazy(() =>
  import('@/pages/PrivacyPage').then((module) => ({ default: module.PrivacyPage })),
);
const ContactPage = lazy(() =>
  import('@/pages/ContactPage').then((module) => ({ default: module.ContactPage })),
);
const AdminLoginPage = lazy(() =>
  import('@/admin/AdminLoginPage').then((module) => ({ default: module.AdminLoginPage })),
);
const AdminLayout = lazy(() =>
  import('@/admin/AdminLayout').then((module) => ({ default: module.AdminLayout })),
);
const AdminDashboardPage = lazy(() =>
  import('@/admin/AdminDashboardPage').then((module) => ({ default: module.AdminDashboardPage })),
);
const AdminEventsPage = lazy(() =>
  import('@/admin/AdminEventsPage').then((module) => ({ default: module.AdminEventsPage })),
);
const AdminEventFormPage = lazy(() =>
  import('@/admin/AdminEventFormPage').then((module) => ({ default: module.AdminEventFormPage })),
);

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <AdminSessionProvider>
      <ScrollToHash />
      <Suspense fallback={<AppRouteFallback />}>
        <Routes>
          <Route element={<PageShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/eventos" element={<EventsPage />} />
            <Route path="/contacto" element={<ContactPage />} />
            <Route path="/eventos/:id" element={<EventDetailPage />} />
            <Route path="/aviso-de-privacidad" element={<PrivacyPage />} />
          </Route>
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="eventos" element={<AdminEventsPage />} />
              <Route path="eventos/nuevo" element={<AdminEventFormPage />} />
              <Route path="eventos/:id/editar" element={<AdminEventFormPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
      {isAdminRoute ? null : <FloatingWhatsApp />}
    </AdminSessionProvider>
  );
}

function AppRouteFallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-surface px-5">
      <div className="h-20 w-full max-w-md animate-pulse rounded-lg bg-white shadow-soft" />
    </div>
  );
}

function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    const timeout = window.setTimeout(() => {
      document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    return () => window.clearTimeout(timeout);
  }, [location.hash, location.pathname]);

  return null;
}
