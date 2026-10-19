/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
  readonly VITE_ENQUIRY_ENDPOINT?: string;
  readonly VITE_ANALYTICS_ENDPOINT?: string;
  readonly VITE_CONTACT_EMAIL?: string;
  readonly VITE_CONTACT_PHONE?: string;
  readonly VITE_CONTACT_ADDRESS?: string;
  readonly VITE_LEGAL_ENTITY?: string;
  readonly VITE_PRIVACY_URL?: string;
  readonly VITE_COOKIE_URL?: string;
  readonly VITE_TERMS_URL?: string;
  readonly VITE_SOCIAL_PROFILES?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
