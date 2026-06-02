import { ArrowDown, Building2, MessageCircle } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { trackEvent } from '@/lib/analytics';

export function HeroSection() {
  const { t, i18n } = useTranslation();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 700], [0, 95]);
  const message =
    i18n.language === 'en'
      ? 'Hello CECAE, I would like to schedule professional training for my organization.'
      : 'Hola CECAE, me gustaría agendar una capacitación profesional para mi organización.';

  return (
    <section className="relative isolate min-h-[calc(100vh-5rem)] overflow-hidden bg-navy text-white">
      <motion.div
        style={{ y }}
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_20%,rgba(43,108,176,0.55),transparent_32%),radial-gradient(circle_at_80%_12%,rgba(217,114,24,0.23),transparent_30%),linear-gradient(135deg,#1A3A6B_0%,#17315B_54%,#0F2443_100%)]"
      />
      <div className="grid-overlay absolute inset-0 -z-10 opacity-80" />
      <div className="section-shell grid min-h-[calc(100vh-5rem)] items-center gap-12 py-16 lg:grid-cols-[1.08fr_0.92fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          className="max-w-3xl"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/86 backdrop-blur">
            <Building2 className="h-4 w-4 text-orange" aria-hidden="true" />
            {t('hero.eyebrow')}
          </p>
          <img
            src="/cecae-footer-logo-1600x400.png"
            alt="CECAE"
            className="mt-8 h-auto w-full max-w-md rounded-md bg-white px-4 py-3 shadow-glow"
          />
          <p className="mt-6 font-mono text-sm font-semibold uppercase tracking-[0.2em] text-orange">
            {t('hero.tagline')}
          </p>
          <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            {t('hero.title')}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8 text-white/78">
            {t('hero.subtitle')}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/contacto#contacto"
              onClick={() => trackEvent('cta_click', { location: 'hero_primary' })}
              className="focus-ring inline-flex min-h-12 items-center justify-center rounded-md bg-orange px-6 py-3 font-semibold text-white shadow-orange transition hover:-translate-y-0.5 hover:bg-[#C96513]"
            >
              {t('hero.primary')}
            </Link>
            <a
              href={buildWhatsAppUrl(message)}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent('whatsapp_click', { location: 'hero_secondary' })}
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-6 py-3 font-semibold text-navy transition hover:-translate-y-0.5 hover:text-orange"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              {t('hero.secondary')}
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.75, delay: 0.15, ease: 'easeOut' }}
          className="relative hidden min-h-[540px] lg:block"
          aria-hidden="true"
        >
          <div className="absolute right-0 top-8 h-72 w-72 rounded-full border border-white/15" />
          <div className="absolute bottom-12 left-4 h-56 w-56 rounded-full border border-orange/40" />
          <div className="absolute inset-x-8 top-28 rounded-lg border border-white/18 bg-white/10 p-6 shadow-glow backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                NOM-035
              </span>
              <span className="rounded-full bg-orange px-3 py-1 text-xs font-bold text-white">
                CECAE
              </span>
            </div>
            <div className="grid grid-cols-5 items-end gap-4">
              {[36, 58, 46, 72, 92].map((height, index) => (
                <motion.div
                  key={height}
                  initial={{ height: 30 }}
                  animate={{ height }}
                  transition={{ duration: 0.7, delay: 0.4 + index * 0.1 }}
                  className="rounded-t bg-orange"
                />
              ))}
            </div>
            <div className="mt-8 grid gap-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-4 rounded-full bg-white/20" />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      <a
        href="#nosotros"
        className="focus-ring absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur md:inline-flex"
      >
        {t('hero.scroll')}
        <ArrowDown className="h-4 w-4 animate-bounce" aria-hidden="true" />
      </a>
    </section>
  );
}
