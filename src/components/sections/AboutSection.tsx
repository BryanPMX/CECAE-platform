import { animate, motion, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, MapPinned, UsersRound } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';

const stats = [
  { value: 3, icon: UsersRound, label: 'about.stats.modalities' },
  { value: 5, icon: Building2, label: 'about.stats.areas' },
  { value: 2, icon: MapPinned, label: 'about.stats.cities' },
];

export function AboutSection() {
  const { t } = useTranslation();
  const paragraphs = t('about.body').split('\n\n');
  const aboutIllustrationAlt = `${t('about.title')} ${t('about.eyebrow')}`;

  return (
    <section id="nosotros" className="flow-section flow-section-light py-20 sm:py-24 lg:py-28">
      <div className="section-shell grid justify-items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="flex w-full max-w-2xl flex-col items-center gap-8 lg:-mt-8"
        >
          <SectionHeading eyebrow={t('about.eyebrow')} title={t('about.title')} />
          <img
            src={encodeURI('/"Nosotros" illustration.png')}
            alt={aboutIllustrationAlt}
            className="h-auto w-full max-w-[22rem] object-contain opacity-72 saturate-95 contrast-105 sm:max-w-[24rem]"
            loading="lazy"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="section-spotlight border border-line bg-white/[0.88] p-6 text-left sm:p-8"
        >
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-pretty mb-5 text-base leading-8 text-charcoal last:mb-0 sm:text-[1.0625rem] sm:leading-8">
              {paragraph}
            </p>
          ))}
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2 lg:-mt-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="flex flex-col items-center rounded-lg border border-line bg-white/95 p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-orange/60 hover:shadow-soft"
              >
                <Icon className="h-7 w-7 text-orange" aria-hidden="true" />
                <RollingStat value={stat.value} delay={index * 0.08} />
                <p className="mt-1 text-sm font-semibold text-midGray">{t(stat.label)}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function RollingStat({ value, delay }: { value: number; delay: number }) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' });
  const reduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) {
      return;
    }

    if (reduceMotion) {
      setDisplayValue(value);
      return;
    }

    const controls = animate(0, value, {
      delay,
      duration: 0.85,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        setDisplayValue(Math.round(latest));
      },
    });

    return () => {
      controls.stop();
    };
  }, [delay, isInView, reduceMotion, value]);

  return (
    <p ref={ref} className="mt-4 font-display text-3xl font-bold tabular-nums text-navy" aria-label={`${value}`}>
      {displayValue}
    </p>
  );
}
