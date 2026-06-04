import { MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { trackEvent } from '@/lib/analytics';

export function FloatingWhatsApp() {
  const { i18n } = useTranslation();
  const message =
    i18n.language === 'en'
      ? 'Hello, I would like to receive information about CECAE professional training programs.'
      : 'Hola, me gustaría recibir información sobre las capacitaciones profesionales de CECAE.';

  return (
    <a
      href={buildWhatsAppUrl(message)}
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp CECAE"
      onClick={() => trackEvent('whatsapp_click', { location: 'floating_button' })}
      className="focus-ring fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-orange text-white shadow-orange transition hover:-translate-y-1 hover:bg-[#C96513]"
    >
      <span className="animate-ping-slow absolute h-full w-full rounded-full bg-orange/35" />
      <MessageCircle className="relative h-7 w-7" aria-hidden="true" />
    </a>
  );
}
