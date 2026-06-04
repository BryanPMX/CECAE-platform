import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useIsMobileViewport } from '@/hooks/useIsMobileViewport';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useShouldReduceMotion } from '@/hooks/useShouldReduceMotion';

type StepCopy = {
  title: string;
  description: string;
};

export function MethodologySection() {
  const { t } = useTranslation();
  const shouldReduceMotion = useShouldReduceMotion();
  const isMobileViewport = useIsMobileViewport();
  const steps = t('method.steps', { returnObjects: true }) as StepCopy[];

  return (
    <section id="metodologia" className="flow-section flow-section-dark overflow-hidden py-20 text-white sm:py-24 lg:py-28">
      <div className="absolute inset-0 -z-[1] opacity-30 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(217,114,24,0.14),transparent_28%)]" />
      <div className="section-shell relative">
        <SectionHeading
          eyebrow={t('method.eyebrow')}
          title={t('method.title')}
          align="center"
          inverse
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {steps.map((step, index) => (
            <motion.article
              key={step.title}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={
                shouldReduceMotion
                  ? undefined
                  : isMobileViewport
                    ? { once: true, amount: 0.6 }
                    : { once: true, margin: '-80px' }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.65, delay: isMobileViewport ? 0 : index * 0.1 }
              }
              className="relative flex flex-col items-center rounded-lg border border-white/14 bg-white/10 p-6 text-center shadow-soft md:backdrop-blur-xl"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-md bg-orange font-display text-lg font-bold text-white">
                {index + 1}
              </span>
              <h3 className="text-balance mt-5 font-display text-xl font-bold">{step.title}</h3>
              <p className="text-pretty mt-3 text-left text-sm leading-6 text-white/76">{step.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
