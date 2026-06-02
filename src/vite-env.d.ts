/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_SITE_URL?: string;
  readonly VITE_TURNSTILE_SITE_KEY?: string;
  readonly VITE_GOOGLE_MAPS_EMBED_URL?: string;
  readonly VITE_GA_MEASUREMENT_ID?: string;
  readonly VITE_CECAE_PHONE?: string;
  readonly VITE_CECAE_WHATSAPP?: string;
  readonly VITE_CECAE_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
