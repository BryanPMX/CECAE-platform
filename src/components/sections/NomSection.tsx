import { CheckCircle2, FileCheck2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { trackEvent } from '@/lib/analytics';
import { useShouldReduceMotion } from '@/hooks/useShouldReduceMotion';

export function NomSection() {
  const { t } = useTranslation();
  const shouldReduceMotion = useShouldReduceMotion();
  const points = t('nom.points', { returnObjects: true }) as string[];

  return (
    <section id="nom035" className="flow-section flow-section-light py-20 sm:py-24 lg:py-28">
      <div className="section-shell grid justify-items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, x: -16 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
          viewport={shouldReduceMotion ? undefined : { once: true }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4 }}
          className="flex flex-col items-center rounded-lg bg-navy p-7 text-center text-white shadow-glow sm:p-9 lg:p-10"
        >
          <FileCheck2 className="h-12 w-12 text-orange" aria-hidden="true" />
          <p className="mt-8 font-mono text-sm font-semibold text-white/70">NOM-035-STPS-2018</p>
          <div className="mt-6 grid w-full max-w-xl gap-3 text-left">
            {points.map((point) => (
              <span key={point} className="inline-flex items-start gap-3 text-base font-semibold leading-7 sm:text-lg">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-orange" aria-hidden="true" />
                {point}
              </span>
            ))}
          </div>
        </motion.div>
        <SectionHeading eyebrow={t('nom.eyebrow')} title={t('nom.title')}>
          <p>{t('nom.body')}</p>
          <Link
            to="/contacto#contacto"
            onClick={() => trackEvent('cta_click', { location: 'nom035' })}
            className="focus-ring mx-auto mt-7 inline-flex min-h-12 items-center justify-center rounded-md bg-orange px-6 py-3 text-base font-semibold text-white shadow-orange transition hover:-translate-y-0.5 hover:bg-[#C96513]"
          >
            {t('nom.cta')}
          </Link>
        </SectionHeading>
      </div>
    </section>
  );
}
