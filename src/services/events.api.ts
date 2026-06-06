import { apiRequest } from './apiClient';
import type { CecaeEvent, EventFilters, EventsService } from './events.types';

function applyFilters(items: CecaeEvent[], filters?: EventFilters) {
  if (!filters) return items;

  return items.filter((event) => {
    const matchesType = filters.type ? event.type === filters.type : true;
    const matchesModality = filters.modality ? event.modality === filters.modality : true;
    const query = filters.search?.trim().toLowerCase();
    const matchesSearch = query
      ? [event.title.es, event.title.en, event.description.es, event.description.en, event.location, event.tags?.join(' ')]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(query)
      : true;
    const eventDate = new Date(`${event.date}T00:00:00`);
    const matchesFrom = filters.from ? eventDate >= filters.from : true;
    const matchesTo = filters.to ? eventDate <= filters.to : true;

    return matchesType && matchesModality && matchesSearch && matchesFrom && matchesTo;
  });
}

export const eventsService: EventsService = {
  getEvents: async (filters) => applyFilters(await apiRequest<CecaeEvent[]>('/api/events'), filters),
  getEventById: async (id) => {
    try {
      return await apiRequest<CecaeEvent>(`/api/events/${id}`);
    } catch (error) {
      if (error instanceof Error && 'status' in error && (error as { status: number }).status === 404) {
        return null;
      }
      throw error;
    }
  },
  getFeaturedEvents: async (limit = 3) =>
    (await apiRequest<CecaeEvent[]>('/api/events/featured')).slice(0, limit),
};
