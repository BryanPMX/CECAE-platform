import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EventCard } from '@/components/events/EventCard';
import { PageShell } from '@/components/layout/PageShell';
import { Seo } from '@/components/layout/Seo';
import { EmptyEventsState } from '@/components/ui/EmptyEventsState';
import { useEvents } from '@/hooks/useEvents';
import { trackEvent } from '@/lib/analytics';
import type { EventFilters, EventModality, EventType } from '@/services';

export function EventsPage() {
  const { t } = useTranslation();
  const [type, setType] = useState<EventType | ''>('');
  const [modality, setModality] = useState<EventModality | ''>('');
  const [search, setSearch] = useState('');
  const filters = useMemo<EventFilters>(
    () => ({
      type: type || undefined,
      modality: modality || undefined,
      search: search || undefined,
    }),
    [modality, search, type],
  );
  const { events, isLoading } = useEvents(filters);
  const hasEvents = events.length > 0;

  useEffect(() => {
    trackEvent('events_page_view');
  }, []);

  return (
    <PageShell>
      <Seo
        title="Eventos CECAE | Capacitaciones y webinars"
        description="Próximos eventos, capacitaciones, webinars y pláticas de CECAE para empresas e instituciones."
        path="/eventos"
      />
      <section className="bg-navy py-16 text-white">
        <div className="section-shell">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-orange">
            {t('events.eyebrow')}
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold">{t('events.title')}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-white/72">{t('events.intro')}</p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="section-shell">
          <div className="grid gap-4 rounded-lg border border-line bg-skySurface p-4 md:grid-cols-[1fr_220px_220px]">
            <label className="relative grid gap-2 text-sm font-semibold text-navy">
              {t('events.filters.search')}
              <Search className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 text-midGray" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                disabled={!hasEvents}
                className="focus-ring min-h-11 rounded-md border border-line bg-white px-9 py-2 disabled:opacity-60"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-navy">
              {t('events.filters.type')}
              <select
                value={type}
                onChange={(event) => setType(event.target.value as EventType | '')}
                disabled={!hasEvents}
                className="focus-ring min-h-11 rounded-md border border-line bg-white px-3 py-2 disabled:opacity-60"
              >
                <option value="">{t('events.filters.all')}</option>
                <option value="training">{t('events.filters.training')}</option>
                <option value="webinar">{t('events.filters.webinar')}</option>
                <option value="talk">{t('events.filters.talk')}</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-navy">
              {t('events.filters.modality')}
              <select
                value={modality}
                onChange={(event) => setModality(event.target.value as EventModality | '')}
                disabled={!hasEvents}
                className="focus-ring min-h-11 rounded-md border border-line bg-white px-3 py-2 disabled:opacity-60"
              >
                <option value="">{t('events.filters.all')}</option>
                <option value="presencial">{t('events.filters.presencial')}</option>
                <option value="virtual">{t('events.filters.virtual')}</option>
                <option value="hibrida">{t('events.filters.hibrida')}</option>
              </select>
            </label>
          </div>

          <div className="mt-10">
            {isLoading ? (
              <div className="h-64 animate-pulse rounded-lg bg-skySurface" />
            ) : hasEvents ? (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <EmptyEventsState />
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
