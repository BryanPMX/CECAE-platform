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
    <section id="metodologia" className="bg-navy py-20 text-white sm:py-24">
      <div className="section-shell">
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
              className="relative rounded-lg border border-white/14 bg-white/8 p-5 backdrop-blur"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-md bg-orange font-display text-lg font-bold text-white">
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
