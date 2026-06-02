import { useEffect, useState } from 'react';
import { eventsService, type CecaeEvent, type EventFilters } from '@/services';

export function useEvents(filters?: EventFilters) {
  const [events, setEvents] = useState<CecaeEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    eventsService
      .getEvents(filters)
      .then((items) => {
        if (isMounted) setEvents(items);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [filters]);

  return { events, isLoading };
}
