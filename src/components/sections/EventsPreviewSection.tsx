import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { EventCard } from '@/components/events/EventCard';
import { EmptyEventsState } from '@/components/ui/EmptyEventsState';
import { LinkButton } from '@/components/ui/LinkButton';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useEvents } from '@/hooks/useEvents';

export function EventsPreviewSection() {
  const { t } = useTranslation();
  const { events, isLoading } = useEvents();
  const featured = events.slice(0, 3);

  return (
    <section id="eventos" className="bg-surface py-24 sm:py-28">
      <div className="section-shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading eyebrow={t('events.eyebrow')} title={t('events.title')}>
            <p>{t('events.intro')}</p>
          </SectionHeading>
          <LinkButton to="/eventos" variant="outline" className="md:mb-1">
            {t('events.viewAll')}
          </LinkButton>
        </div>

        <div className="mt-10">
          {isLoading ? (
            <div className="h-64 animate-pulse rounded-3xl bg-skySurface" />
          ) : featured.length > 0 ? (
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.08 } },
              }}
              className="grid gap-5 md:grid-cols-3"
            >
              {featured.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-120px' }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
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
