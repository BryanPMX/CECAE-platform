export type LocalizedText = {
  es: string;
  en: string;
};

export type EventType = 'training' | 'webinar' | 'talk';
export type EventModality = 'presencial' | 'virtual' | 'hibrida';

export interface CecaeEvent {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  type: EventType;
  modality: EventModality;
  date: string;
  time: string;
  duration?: string;
  location?: string;
  capacity?: number;
  registrationUrl?: string;
  imageUrl?: string;
  tags?: string[];
  isFeatured?: boolean;
}

export type EventStatus = 'draft' | 'published' | 'archived';

export interface AdminEvent extends CecaeEvent {
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export type EventPayload = Omit<CecaeEvent, 'id'> & {
  status: EventStatus;
};

export interface EventFilters {
  type?: CecaeEvent['type'];
  modality?: CecaeEvent['modality'];
  search?: string;
  from?: Date;
  to?: Date;
}

export interface EventsService {
  getEvents(filters?: EventFilters): Promise<CecaeEvent[]>;
  getEventById(id: string): Promise<CecaeEvent | null>;
  getFeaturedEvents(limit?: number): Promise<CecaeEvent[]>;
}
