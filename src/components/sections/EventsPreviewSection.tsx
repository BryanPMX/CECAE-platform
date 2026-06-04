import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { EventCard } from '@/components/events/EventCard';
import { EmptyEventsState } from '@/components/ui/EmptyEventsState';
import { LinkButton } from '@/components/ui/LinkButton';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useEvents } from '@/hooks/useEvents';
import { useShouldReduceMotion } from '@/hooks/useShouldReduceMotion';

export function EventsPreviewSection() {
  const { t } = useTranslation();
  const shouldReduceMotion = useShouldReduceMotion();
  const { events, isLoading } = useEvents();
  const featured = events.slice(0, 3);

  return (
    <section id="eventos" className="flow-section flow-section-light py-20 sm:py-24 lg:py-28">
      <div className="section-shell">
        <div className="flex flex-col items-center gap-6 text-center">
          <SectionHeading eyebrow={t('events.eyebrow')} title={t('events.title')}>
            <p>{t('events.intro')}</p>
          </SectionHeading>
          <LinkButton to="/eventos" variant="outline" className="w-full sm:w-fit">
            {t('events.viewAll')}
          </LinkButton>
        </div>

        <div className="mt-10">
          {isLoading ? (
            <div className="h-64 animate-pulse rounded-lg bg-skySurface" />
          ) : featured.length > 0 ? (
            <motion.div
              initial={shouldReduceMotion ? false : 'hidden'}
              whileInView={shouldReduceMotion ? undefined : 'show'}
              viewport={shouldReduceMotion ? undefined : { once: true }}
              variants={
                shouldReduceMotion
                  ? undefined
                  : {
                      hidden: {},
                      show: { transition: { staggerChildren: 0.06 } },
                    }
              }
              className="grid gap-5 md:grid-cols-3"
            >
              {featured.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={shouldReduceMotion ? undefined : { once: true, margin: '-120px' }}
                  transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.35, delay: index * 0.04 }}
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyEventsState />
          )}
        </div>
      </div>
    </section>
  );
}
