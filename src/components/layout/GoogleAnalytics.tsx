import { useEffect } from 'react';
import { config } from '@/lib/config';

export function GoogleAnalytics() {
  useEffect(() => {
    if (!config.gaMeasurementId || window.gtag) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${config.gaMeasurementId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer ?? [];
    window.gtag = function gtag(...args) {
      window.dataLayer?.push(args);
    };
    window.gtag('js', new Date().toISOString());
    window.gtag('config', config.gaMeasurementId);
  }, []);

  return null;
}
