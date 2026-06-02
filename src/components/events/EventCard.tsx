import { Calendar, Clock, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { CecaeEvent } from '@/services';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

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
      className="focus-ring group grid overflow-hidden rounded-lg border border-line bg-white shadow-sm transition hover:-translate-y-1 hover:border-orange hover:shadow-glow"
    >
      {event.imageUrl ? (
        <img src={event.imageUrl} alt="" className="aspect-[16/9] w-full object-cover" loading="lazy" />
      ) : null}
      <div className="grid gap-4 p-5">
        <div className="flex flex-wrap gap-2">
          <span className={cn('rounded-full px-3 py-1 text-xs font-bold', typeClasses[event.type])}>
            {t(`events.filters.${event.type}`)}
          </span>
          <span className="rounded-full bg-skySurface px-3 py-1 text-xs font-bold text-navy">
            {t(`events.filters.${event.modality}`)}
          </span>
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-navy group-hover:text-orange">
            {event.title[language]}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-midGray">
            {event.description[language]}
          </p>
        </div>
        <div className="grid gap-2 text-sm text-charcoal">
          <span className="inline-flex items-center gap-2">
            <Calendar className="h-4 w-4 text-orange" aria-hidden="true" />
            {new Intl.DateTimeFormat(language === 'es' ? 'es-MX' : 'en-US', {
              dateStyle: 'medium',
            }).format(new Date(event.date))}
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange" aria-hidden="true" />
            {event.time}
            {event.duration ? ` · ${event.duration}` : ''}
          </span>
          {event.location ? (
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-orange" aria-hidden="true" />
              {event.location}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
