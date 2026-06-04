import { AnimatePresence, motion } from 'framer-motion';
import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { useShouldReduceMotion } from '@/hooks/useShouldReduceMotion';
import { useTranslation } from 'react-i18next';

const routeMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export function PageShell() {
  const { t } = useTranslation();
  const location = useLocation();
  const shouldReduceMotion = useShouldReduceMotion();

  const motionProps = shouldReduceMotion
    ? {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
        transition: { duration: 0 },
      }
    : {
        ...routeMotion,
        transition: {
          duration: 0.38,
          ease: [0.22, 1, 0.36, 1],
        },
      };

  return (
    <div className="min-h-screen bg-white">
      <a href="#contenido" className="skip-link">
        {t('nav.skip')}
      </a>
      <Navbar />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main key={location.pathname} id="contenido" {...motionProps}>
          <Suspense fallback={<RouteTransitionFallback />}>
            <Outlet />
          </Suspense>
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  );
}

function RouteTransitionFallback() {
  return (
    <div className="bg-surface py-16 sm:py-20 lg:py-24">
      <div className="section-shell">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-line bg-white/95 p-6 shadow-soft sm:p-8">
          <div className="h-3 w-28 animate-pulse rounded-full bg-skySurface" />
          <div className="mt-5 h-10 w-4/5 animate-pulse rounded-2xl bg-skySurface" />
          <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-skySurface" />
          <div className="mt-3 h-4 w-11/12 animate-pulse rounded-full bg-skySurface" />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="h-40 animate-pulse rounded-xl bg-skySurface" />
            <div className="h-40 animate-pulse rounded-xl bg-skySurface" />
          </div>
        </div>
      </div>
    </div>
  );
}
