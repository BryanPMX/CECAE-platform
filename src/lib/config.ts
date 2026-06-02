export const config = {
  siteUrl: import.meta.env.VITE_PUBLIC_SITE_URL ?? 'https://cecae.org',
  turnstileSiteKey: import.meta.env.VITE_TURNSTILE_SITE_KEY ?? '',
  googleMapsEmbedUrl:
    import.meta.env.VITE_GOOGLE_MAPS_EMBED_URL ??
    'https://www.google.com/maps?q=Ciudad%20Juarez%2C%20Chihuahua%2C%20Mexico&output=embed',
  gaMeasurementId: import.meta.env.VITE_GA_MEASUREMENT_ID ?? '',
  phone: import.meta.env.VITE_CECAE_PHONE ?? '+526568437143',
  whatsapp: import.meta.env.VITE_CECAE_WHATSAPP ?? '+526567741570',
  email: import.meta.env.VITE_CECAE_EMAIL ?? 'capacitacion@cecae.org',
};

export const displayContact = {
  phone: '(656) 843-7143',
  whatsapp: '(656) 774-1570',
  email: config.email,
};
