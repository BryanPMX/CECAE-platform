import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Building2, MapPinned, UsersRound } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';

const stats = [
  { value: '3', icon: UsersRound, label: 'about.stats.modalities' },
  { value: '5', icon: Building2, label: 'about.stats.areas' },
  { value: '2', icon: MapPinned, label: 'about.stats.cities' },
];

export function AboutSection() {
  const { t } = useTranslation();
  const paragraphs = t('about.body').split('\n\n');

  return (
    <section id="nosotros" className="py-20 sm:py-24">
      <div className="section-shell grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <SectionHeading eyebrow={t('about.eyebrow')} title={t('about.title')} />
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="rounded-lg border border-line bg-skySurface p-6 sm:p-8"
        >
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="mb-5 text-lg leading-8 text-charcoal last:mb-0">
              {paragraph}
            </p>
          ))}
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="rounded-lg border border-line bg-white p-5 shadow-sm"
              >
                <Icon className="h-7 w-7 text-orange" aria-hidden="true" />
                <p className="mt-4 font-display text-3xl font-bold text-navy">{stat.value}</p>
                <p className="mt-1 text-sm font-semibold text-midGray">{t(stat.label)}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
