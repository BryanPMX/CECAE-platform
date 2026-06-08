import { Calendar, Clock, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { CecaeEvent } from '@/services';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { EventImage } from './EventImage';

const typeClasses = {
  training: 'bg-steel text-white',
  webinar: 'bg-teal-600 text-white',
  talk: 'bg-orange text-white',
};

export function EventCard({ event }: { event: CecaeEvent }) {
  const { i18n, t } = useTranslation();
  const language = i18n.language.startsWith('en') ? 'en' : 'es';

  return (
    <Link
      to={`/eventos/${event.id}`}
      onClick={() => trackEvent('event_card_click', { event_id: event.id })}
      className="focus-ring group grid h-full overflow-hidden rounded-lg border border-line bg-white shadow-sm transition hover:-translate-y-1 hover:border-orange hover:shadow-glow"
    >
      <EventImage
        src={event.imageUrl}
        title={event.title[language]}
        className="aspect-[4/3]"
      />
      <div className="grid gap-4 p-5">
        <div className="flex flex-wrap justify-center gap-2">
          <span className={cn('rounded-full px-3 py-1 text-xs font-bold', typeClasses[event.type])}>
            {t(`events.filters.${event.type}`)}
          </span>
          <span className="rounded-full bg-skySurface px-3 py-1 text-xs font-bold text-navy">
            {t(`events.filters.${event.modality}`)}
          </span>
        </div>
        <div>
          <h3 className="text-balance text-center font-display text-xl font-bold leading-snug text-navy group-hover:text-orange">
            {event.title[language]}
          </h3>
          <p className="text-pretty mt-2 line-clamp-3 whitespace-pre-wrap break-words text-left text-sm leading-6 text-midGray">
            {event.description[language]}
          </p>
        </div>
        <div className="grid justify-items-start gap-2 text-left text-sm text-charcoal">
          <span className="inline-flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-orange" aria-hidden="true" />
            {new Intl.DateTimeFormat(language === 'es' ? 'es-MX' : 'en-US', {
              dateStyle: 'medium',
            }).format(new Date(event.date))}
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-orange" aria-hidden="true" />
            {event.time}
            {event.duration ? ` · ${event.duration}` : ''}
          </span>
          {event.location ? (
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-orange" aria-hidden="true" />
              {event.location}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
