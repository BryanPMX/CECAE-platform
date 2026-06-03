import { ArrowDown, Building2, MessageCircle } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { trackEvent } from '@/lib/analytics';

export function HeroSection() {
  const { t, i18n } = useTranslation();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 700], [0, 70]);
  const message =
    i18n.language === 'en'
      ? 'Hello CECAE, I would like to schedule professional training for my organization.'
      : 'Hola CECAE, me gustaría agendar una capacitación profesional para mi organización.';

  return (
    <section className="relative isolate min-h-[calc(100svh-5rem)] overflow-hidden bg-navy text-white">
      <motion.div style={{ y }} className="absolute inset-0 -z-10 bg-hero-gradient" />
      <div className="grid-overlay absolute inset-0 -z-10 opacity-80" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-surface to-transparent" />
      <div className="section-shell grid min-h-[calc(100svh-5rem)] content-start justify-items-center gap-12 pb-14 pt-8 text-center sm:pb-16 sm:pt-12 lg:pb-10 lg:pt-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          className="mx-auto max-w-[46rem] lg:max-w-[43rem]"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/86 backdrop-blur-sm">
            <Building2 className="h-4 w-4 text-orange" aria-hidden="true" />
            {t('hero.eyebrow')}
          </p>
          <p className="mt-7 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-orange sm:text-sm lg:mt-5">
            {t('hero.tagline')}
          </p>
          <h1 className="text-balance mx-auto mt-4 max-w-[15ch] font-display text-[2.65rem] font-extrabold leading-[1.06] sm:text-6xl lg:mt-3 lg:text-[clamp(3.1rem,4.1vw,4.65rem)]">
            {t('hero.title')}
          </h1>
          <p className="text-pretty mx-auto mt-6 max-w-2xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8 lg:mt-4 lg:text-[1.0625rem]">
            {t('hero.subtitle')}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:mt-5">
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
