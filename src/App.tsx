import { lazy, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { FloatingWhatsApp } from '@/components/layout/FloatingWhatsApp';
import { PageShell } from '@/components/layout/PageShell';

const HomePage = lazy(() => import('@/pages/HomePage').then((module) => ({ default: module.HomePage })));
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

export default function App() {
  return (
    <>
      <ScrollToHash />
      <Routes>
        <Route element={<PageShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/eventos" element={<EventsPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/eventos/:id" element={<EventDetailPage />} />
          <Route path="/aviso-de-privacidad" element={<PrivacyPage />} />
        </Route>
      </Routes>
      <FloatingWhatsApp />
    </>
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
