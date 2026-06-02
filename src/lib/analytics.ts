import { track } from '@vercel/analytics';

type EventName =
  | 'cta_click'
  | 'whatsapp_click'
  | 'phone_click'
  | 'email_click'
  | 'form_submit'
  | 'events_page_view'
  | 'event_card_click';

export function trackEvent(name: EventName, properties?: Record<string, string | number | boolean>) {
  track(name, properties);

  if (typeof window !== 'undefined' && 'gtag' in window) {
    const gtag = window.gtag as (
      command: 'event',
      name: string,
      properties?: Record<string, string | number | boolean>,
    ) => void;
    gtag('event', name, properties);
  }
}
