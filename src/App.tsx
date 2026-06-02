import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { FloatingWhatsApp } from '@/components/layout/FloatingWhatsApp';

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

export default function App() {
  return (
    <>
      <ScrollToHash />
      <Suspense fallback={<div className="min-h-screen bg-white" />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/eventos" element={<EventsPage />} />
          <Route path="/eventos/:id" element={<EventDetailPage />} />
          <Route path="/aviso-de-privacidad" element={<PrivacyPage />} />
        </Routes>
      </Suspense>
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
