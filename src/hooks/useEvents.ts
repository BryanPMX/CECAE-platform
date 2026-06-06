import { useEffect, useState } from 'react';
import { eventsService, type CecaeEvent, type EventFilters } from '@/services';

export function useEvents(filters?: EventFilters) {
  const [events, setEvents] = useState<CecaeEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    eventsService
      .getEvents(filters)
      .then((items) => {
        if (isMounted) setEvents(items);
      })
      .catch(() => {
        if (isMounted) {
          setEvents([]);
          setError('No fue posible cargar los eventos. Intenta de nuevo más tarde.');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [filters]);

  return { events, isLoading, error };
}

export function useFeaturedEvents(limit = 3) {
  const [events, setEvents] = useState<CecaeEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    eventsService
      .getFeaturedEvents(limit)
      .then((items) => {
        if (isMounted) setEvents(items);
      })
      .catch(() => {
        if (isMounted) {
          setEvents([]);
          setError('No fue posible cargar los eventos destacados.');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [limit]);

  return { events, isLoading, error };
}
