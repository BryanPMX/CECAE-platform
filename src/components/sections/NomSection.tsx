import { CheckCircle2, FileCheck2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { trackEvent } from '@/lib/analytics';

export function NomSection() {
  const { t } = useTranslation();
  const points = t('nom.points', { returnObjects: true }) as string[];

  return (
    <section id="nom035" className="py-20 sm:py-24">
      <div className="section-shell grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="rounded-lg bg-navy p-8 text-white shadow-glow"
        >
          <FileCheck2 className="h-12 w-12 text-orange" aria-hidden="true" />
          <p className="mt-8 font-mono text-sm font-semibold text-white/70">NOM-035-STPS-2018</p>
          <div className="mt-5 grid gap-3">
            {points.map((point) => (
              <span key={point} className="inline-flex items-center gap-3 text-lg font-semibold">
                <CheckCircle2 className="h-5 w-5 text-orange" aria-hidden="true" />
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
            className="focus-ring mt-7 inline-flex min-h-12 items-center rounded-md bg-orange px-6 py-3 text-base font-semibold text-white shadow-orange transition hover:-translate-y-0.5 hover:bg-[#C96513]"
          >
            {t('nom.cta')}
          </Link>
        </SectionHeading>
      </div>
    </section>
  );
}
