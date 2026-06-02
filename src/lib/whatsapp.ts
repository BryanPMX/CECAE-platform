import { config } from '@/lib/config';

export function buildWhatsAppUrl(message: string) {
  const phone = config.whatsapp.replace(/[^\d]/g, '');
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
