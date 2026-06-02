import type { CecaeEvent, EventFilters, EventsService } from './events.types';

const events: CecaeEvent[] = [];

function applyFilters(items: CecaeEvent[], filters?: EventFilters) {
  if (!filters) return items;

  return items.filter((event) => {
    const matchesType = filters.type ? event.type === filters.type : true;
    const matchesModality = filters.modality ? event.modality === filters.modality : true;
    const query = filters.search?.trim().toLowerCase();
    const matchesSearch = query
      ? [event.title.es, event.title.en, event.description.es, event.description.en]
          .join(' ')
          .toLowerCase()
          .includes(query)
      : true;

    return matchesType && matchesModality && matchesSearch;
  });
}

export const eventsService: EventsService = {
  getEvents: async (filters) => applyFilters(events, filters),
  getEventById: async (id) => events.find((event) => event.id === id) ?? null,
  getFeaturedEvents: async (limit = 3) =>
    events.filter((event) => event.isFeatured).slice(0, limit),
};
