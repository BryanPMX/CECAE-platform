import { ArrowDown, Building2, ClipboardCheck, GraduationCap, ShieldCheck, TrendingUp } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const benefitIcons = [GraduationCap, ShieldCheck, TrendingUp, ClipboardCheck];

export function HeroSection() {
  const { t, i18n } = useTranslation();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 700], [0, 70]);
  const benefits = t('hero.benefits', { returnObjects: true }) as Array<{
    title: string;
    description: string;
  }>;
  const heroIllustrationAlt =
    i18n.language === 'en'
      ? 'Training illustration with attendees facing a presentation screen'
      : 'Ilustracion de capacitacion con asistentes frente a una pantalla de presentacion';
  const renderBenefit = (
    benefit: { title: string; description: string },
    index: number,
    className = '',
  ) => {
    const Icon = benefitIcons[index] ?? GraduationCap;

    return (
      <motion.article
        key={benefit.title}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.15 + index * 0.08, ease: 'easeOut' }}
        className={`rounded-2xl bg-white/10 p-3 text-left shadow-soft backdrop-blur-xl ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange/16 text-orange">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
          <h2 className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-white/92">
            {benefit.title}
          </h2>
        </div>
        <p className="mt-2 text-xs leading-5 text-white/72">{benefit.description}</p>
      </motion.article>
    );
  };

  return (
    <section className="relative isolate min-h-[calc(100svh-5rem)] overflow-hidden bg-navy text-white">
      <motion.div style={{ y }} className="absolute inset-0 -z-10 bg-hero-gradient" />
      <div className="grid-overlay absolute inset-0 -z-10 opacity-80" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-surface to-transparent" />
      <div className="section-shell grid min-h-[calc(100svh-5rem)] content-start justify-items-center gap-8 pb-16 pt-8 text-center sm:pt-12 lg:gap-6 lg:pb-14 lg:pt-5">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          className="mx-auto w-full max-w-6xl"
        >
          <div className="mx-auto max-w-[60rem]">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/86 backdrop-blur-sm">
              <Building2 className="h-4 w-4 text-orange" aria-hidden="true" />
              {t('hero.eyebrow')}
            </p>
            <p className="mt-7 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-orange sm:text-sm lg:mt-5">
              {t('hero.tagline')}
            </p>
            <h1 className="text-balance mx-auto mt-4 max-w-[18ch] font-display text-[2.2rem] font-extrabold leading-[1.08] sm:max-w-[17ch] sm:text-5xl lg:mt-3 lg:max-w-[20ch] lg:text-[clamp(3.1rem,4.1vw,4.65rem)] lg:leading-[1.06]">
              {t('hero.title')}
            </h1>
            <p className="text-pretty mx-auto mt-6 max-w-2xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8 lg:mt-4 lg:text-[1.0625rem]">
              {t('hero.subtitle')}
            </p>
          </div>

          <div className="mx-auto mt-6 grid w-full items-start gap-5 lg:mt-5 lg:grid-cols-[minmax(12rem,1fr)_minmax(26rem,34rem)_minmax(12rem,1fr)] lg:gap-6">
            <div className="hidden gap-4 lg:grid">
              {[0, 3].map((benefitIndex) => renderBenefit(benefits[benefitIndex], benefitIndex))}
            </div>

            <motion.figure
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
              className="mx-auto w-full max-w-[24rem] sm:max-w-[28rem] lg:max-w-none"
            >
              <img
                src={encodeURI('/"Inicio" Icon.png')}
                alt={heroIllustrationAlt}
                className="h-auto w-full rounded-[1.4rem] drop-shadow-[0_28px_55px_rgba(2,12,32,0.38)]"
                loading="eager"
              />
            </motion.figure>

            <div className="hidden gap-4 lg:grid">
              {[1, 2].map((benefitIndex) => renderBenefit(benefits[benefitIndex], benefitIndex))}
            </div>
          </div>

          <div className="mx-auto mt-5 grid w-full max-w-3xl gap-3 sm:grid-cols-2 lg:hidden">
            {benefits.map((benefit, index) =>
              renderBenefit(benefit, index, 'p-3.5 sm:[&>p]:text-xs sm:[&>p]:leading-5'),
            )}
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
