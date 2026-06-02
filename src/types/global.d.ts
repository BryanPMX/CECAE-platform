interface Window {
  dataLayer?: unknown[][];
  gtag?: (
    command: 'event' | 'js' | 'config',
    name: string,
    properties?: Record<string, string | number | boolean>,
  ) => void;
}
