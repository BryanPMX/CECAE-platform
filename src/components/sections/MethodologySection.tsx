import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { SectionHeading } from '@/components/ui/SectionHeading';

type StepCopy = {
  title: string;
  description: string;
};

export function MethodologySection() {
  const { t } = useTranslation();
  const steps = t('method.steps', { returnObjects: true }) as StepCopy[];

  return (
    <section id="metodologia" className="relative overflow-hidden bg-navy py-24 text-white sm:py-28">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(217,114,24,0.14),transparent_28%)]" />
      <div className="section-shell relative">
        <SectionHeading
          eyebrow={t('method.eyebrow')}
          title={t('method.title')}
          align="center"
          inverse
        />
        <div className="mt-14 grid gap-5 lg:grid-cols-5">
          {steps.map((step, index) => (
            <motion.article
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              className="relative rounded-[1.75rem] border border-white/14 bg-white/10 p-6 shadow-soft backdrop-blur-xl"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange font-display text-lg font-bold text-white">
                {index + 1}
              </span>
              <h3 className="mt-5 font-display text-xl font-bold">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/72">{step.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
