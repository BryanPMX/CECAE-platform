import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { cn } from '@/lib/utils';

type FaqItem = {
  question: string;
  answer: string;
};

export function FaqSection() {
  const { t } = useTranslation();
  const items = t('faq.items', { returnObjects: true }) as FaqItem[];
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="bg-skySurface py-16 sm:py-20 lg:py-24">
      <div className="section-shell">
        <SectionHeading eyebrow={t('faq.eyebrow')} title={t('faq.title')} align="center" />
        <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-lg border border-line bg-white shadow-soft">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.question} className="border-b border-line last:border-b-0">
                <button
                  type="button"
                  className="focus-ring flex w-full items-center justify-between gap-4 rounded-md px-5 py-5 text-left font-semibold leading-6 text-navy transition hover:bg-skySurface/70"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                >
                  {item.question}
                  <ChevronDown
                    className={cn('h-5 w-5 shrink-0 text-orange transition', isOpen && 'rotate-180')}
                    aria-hidden="true"
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-left leading-7 text-midGray">{item.answer}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
