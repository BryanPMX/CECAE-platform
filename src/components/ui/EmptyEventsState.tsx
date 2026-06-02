import { CalendarClock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LinkButton } from '@/components/ui/LinkButton';

export function EmptyEventsState() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center rounded-lg border border-dashed border-line bg-white px-6 py-12 text-center">
      <div className="relative mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-skySurface">
        <div className="absolute h-20 w-20 rounded-full border border-steel/20" />
        <CalendarClock className="h-12 w-12 text-steel" aria-hidden="true" />
      </div>
      <h3 className="font-display text-2xl font-bold text-navy">{t('events.emptyTitle')}</h3>
      <p className="mt-2 text-midGray">{t('events.emptyText')}</p>
      <LinkButton to="/#contacto" variant="outline" className="mt-6">
        {t('events.emptyCta')}
      </LinkButton>
    </div>
  );
}
