import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, MapPinned, UsersRound } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useShouldReduceMotion } from '@/hooks/useShouldReduceMotion';

const stats = [
  { value: 3, icon: UsersRound, label: 'about.stats.modalities' },
  { value: 5, icon: Building2, label: 'about.stats.areas' },
  { value: 2, icon: MapPinned, label: 'about.stats.cities' },
];

export function AboutSection() {
  const { t } = useTranslation();
  const shouldReduceMotion = useShouldReduceMotion();
  const paragraphs = t('about.body').split('\n\n');
  const aboutIllustrationAlt = `${t('about.title')} ${t('about.eyebrow')}`;
  const statsRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: statsRef,
    offset: ['start 96%', 'end 8%'],
  });

  return (
    <section id="nosotros" className="flow-section flow-section-light py-20 sm:py-24 lg:py-28">
      <div className="section-shell grid justify-items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={shouldReduceMotion ? undefined : { once: true }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.7 }}
          className="flex w-full max-w-2xl flex-col items-center gap-8 lg:-mt-8"
        >
          <SectionHeading eyebrow={t('about.eyebrow')} title={t('about.title')} />
          <picture>
            <source
              type="image/webp"
              srcSet="/about-illustration-640.webp 640w, /about-illustration-1080.webp 1080w"
              sizes="(max-width: 640px) 82vw, (max-width: 1024px) 44vw, 24rem"
            />
            <img
              src={encodeURI('/"Nosotros" illustration.png')}
              srcSet={`${encodeURI('/"Nosotros" illustration.png')} 1448w`}
              sizes="(max-width: 640px) 82vw, (max-width: 1024px) 44vw, 24rem"
              alt={aboutIllustrationAlt}
              width="1448"
              height="1086"
              className="h-auto w-full max-w-[22rem] object-contain opacity-72 saturate-95 contrast-105 sm:max-w-[24rem]"
              loading="lazy"
              decoding="async"
            />
          </picture>
        </motion.div>
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={shouldReduceMotion ? undefined : { once: true }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.7 }}
          className="section-spotlight border border-line bg-white/[0.88] p-6 text-left sm:p-8"
        >
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-pretty mb-5 text-base leading-8 text-charcoal last:mb-0 sm:text-[1.0625rem] sm:leading-8">
              {paragraph}
            </p>
          ))}
        </motion.div>
        <div ref={statsRef} className="grid gap-4 sm:grid-cols-3 lg:col-span-2 lg:-mt-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={shouldReduceMotion ? undefined : { once: true }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: index * 0.1 }}
                className="flex flex-col items-center rounded-lg border border-line bg-white/95 p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-orange/60 hover:shadow-soft"
              >
                <Icon className="h-7 w-7 text-orange" aria-hidden="true" />
                <RollingStat
                  value={stat.value}
                  progress={scrollYProgress}
                  shouldReduceMotion={shouldReduceMotion}
                  index={index}
                  total={stats.length}
                />
                <p className="mt-1 text-sm font-semibold text-midGray">{t(stat.label)}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function RollingStat({
  value,
  progress,
  shouldReduceMotion,
  index,
  total,
}: {
  value: number;
  progress: ReturnType<typeof useScroll>['scrollYProgress'];
  shouldReduceMotion: boolean | null;
  index: number;
  total: number;
}) {
  const stagger = total > 1 ? index / (total - 1) : 0;
  const start = stagger * 0.08;
  const end = Math.min(start + 0.26, 1);
  const scrolledValue = useTransform(progress, [start, end], [0, value], {
    clamp: true,
  });
  const smoothedValue = useSpring(scrolledValue, {
    stiffness: 520,
    damping: 36,
    mass: 0.35,
    restDelta: 0.001,
  });
  const [displayValue, setDisplayValue] = useState(shouldReduceMotion ? value : 0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
    }
  }, [shouldReduceMotion, value]);

  useMotionValueEvent(smoothedValue, 'change', (latest) => {
    if (shouldReduceMotion) {
      return;
    }

    setDisplayValue(Math.min(value, Math.max(0, Math.round(latest))));
  });

  return (
    <p className="mt-4 font-display text-3xl font-bold tabular-nums text-navy" aria-label={`${value}`}>
      {shouldReduceMotion ? value : displayValue}
    </p>
  );
}
