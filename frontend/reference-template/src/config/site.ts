/**
 * Site-level configuration shared by the English Global and German templates.
 *
 * Values are read from Vite env variables (see `.env`) so owners can configure them without
 * editing templates. Contact, legal, Impressum, locale, and URL details must be verified by
 * FreightVanta before publishing — they are intentionally empty by default and hidden when empty.
 */
import type { SiteId } from '../lib/router';

const env = import.meta.env;
const clean = (value: string | undefined) => (value ?? '').trim();

const siteUrl = (clean(env.VITE_SITE_URL) || 'https://www.freightvanta.com').replace(/\/+$/, '');

export interface LocalizedHomepage {
  hreflang: string;
  label: string;
  path: string;
  /** Sites implemented in this bundle are routed internally; others open their production URL. */
  site?: SiteId;
}

/**
 * Localized homepages that share the section contract. Keep this list in sync with the
 * hreflang links in index.html. Owner to confirm the published locales and paths.
 */
export const LOCALIZED_HOMEPAGES: LocalizedHomepage[] = [
  { hreflang: 'en', label: 'English (Global)', path: '/', site: 'en' },
  { hreflang: 'de', label: 'Deutsch (Deutschland)', path: '/de/', site: 'de' },
  { hreflang: 'fr', label: 'Français (France)', path: '/fr/', site: 'fr' },
  { hreflang: 'es', label: 'Español (España)', path: '/es/', site: 'es' },
  { hreflang: 'it', label: 'Italiano (Italia)', path: '/it/', site: 'it' },
  { hreflang: 'nl', label: 'Nederlands (Nederland)', path: '/' },
  { hreflang: 'pt-BR', label: 'Português (Brasil)', path: '/pt-br/' },
  { hreflang: 'ja', label: '日本語', path: '/ja/' },
];

export interface SocialProfile {
  label: string;
  url: string;
}

function parseSocial(raw: string): SocialProfile[] {
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [label = '', url = ''] = entry.split('|').map((part) => part.trim());
      return { label, url };
    })
    .filter((profile) => profile.label !== '' && /^https:\/\//.test(profile.url));
}

const lines = (raw: string) => raw.split('|').map((line) => line.trim()).filter(Boolean);

export const siteConfig = {
  brand: 'FreightVanta',
  siteUrl,
  enquiryEndpoint: clean(env.VITE_ENQUIRY_ENDPOINT),
  analyticsEndpoint: clean(env.VITE_ANALYTICS_ENDPOINT),
  contact: {
    email: clean(env.VITE_CONTACT_EMAIL),
    phone: clean(env.VITE_CONTACT_PHONE),
    address: clean(env.VITE_CONTACT_ADDRESS),
  },
  legalEntity: clean(env.VITE_LEGAL_ENTITY),
  /** English legal-policy URLs are configurable; they fall back to the in-site summary pages. */
  legal: {
    privacy: clean(env.VITE_PRIVACY_URL) || '/privacy',
    cookies: clean(env.VITE_COOKIE_URL) || '/cookies',
    terms: clean(env.VITE_TERMS_URL) || '/terms',
  },
  /** German legal pages (Impressum + Datenschutzerklärung are mandatory on every German page). */
  legalDe: {
    impressum: clean(env.VITE_DE_IMPRINT_URL) || '/de/impressum',
    datenschutz: clean(env.VITE_DE_PRIVACY_URL) || '/de/datenschutz',
    agb: clean(env.VITE_DE_TERMS_URL) || '/de/agb',
    cookies: '/de/cookies',
  },
  /** French legal pages (mentions légales are mandatory under the LCEN, art. 6-III). */
  legalFr: {
    mentions: clean(env.VITE_FR_LEGAL_URL) || '/fr/mentions-legales',
    confidentialite: clean(env.VITE_FR_PRIVACY_URL) || '/fr/confidentialite',
    cgv: clean(env.VITE_FR_TERMS_URL) || '/fr/cgv',
    cookies: '/fr/cookies',
  },
  /** Spanish legal pages (aviso legal is mandatory under the LSSI-CE, art. 10). */
  legalEs: {
    aviso: clean(env.VITE_ES_LEGAL_URL) || '/es/aviso-legal',
    privacidad: clean(env.VITE_ES_PRIVACY_URL) || '/es/privacidad',
    condiciones: clean(env.VITE_ES_TERMS_URL) || '/es/condiciones',
    cookies: '/es/politica-de-cookies',
  },
  /** Italian legal pages (company data is mandatory under art. 2250 Codice Civile). */
  legalIt: {
    note: clean(env.VITE_IT_LEGAL_URL) || '/it/note-legali',
    privacy: clean(env.VITE_IT_PRIVACY_URL) || '/it/privacy',
    condizioni: clean(env.VITE_IT_TERMS_URL) || '/it/condizioni',
    cookie: '/it/cookie',
  },
  /** Dati societari (art. 2250 c.c.) — owner-provided, never invented. */
  noteLegali: {
    company: clean(env.VITE_IT_COMPANY),
    vatId: clean(env.VITE_IT_VAT_ID),
    taxCode: clean(env.VITE_IT_TAX_CODE),
    addressLines: lines(clean(env.VITE_IT_ADDRESS)),
    registry: clean(env.VITE_IT_REGISTRY),
    rea: clean(env.VITE_IT_REA),
    shareCapital: clean(env.VITE_IT_SHARE_CAPITAL),
    pec: clean(env.VITE_IT_PEC),
    dpoContact: clean(env.VITE_IT_DPO_CONTACT),
  },
  /** Aviso legal (LSSI-CE art. 10) — owner-provided, never invented. */
  avisoLegal: {
    company: clean(env.VITE_ES_COMPANY),
    nif: clean(env.VITE_ES_NIF),
    addressLines: lines(clean(env.VITE_ES_ADDRESS)),
    registry: clean(env.VITE_ES_REGISTRY),
    dpoContact: clean(env.VITE_ES_DPO_CONTACT),
  },
  /** Mentions légales (LCEN art. 6-III) — owner-provided, never invented. */
  mentionsLegales: {
    company: clean(env.VITE_FR_COMPANY),
    legalForm: clean(env.VITE_FR_LEGAL_FORM),
    capital: clean(env.VITE_FR_CAPITAL),
    addressLines: lines(clean(env.VITE_FR_ADDRESS)),
    rcs: clean(env.VITE_FR_RCS),
    siret: clean(env.VITE_FR_SIRET),
    vatId: clean(env.VITE_FR_VAT_ID),
    publicationDirector: clean(env.VITE_FR_PUBLICATION_DIRECTOR),
    host: clean(env.VITE_FR_HOST),
    dpoContact: clean(env.VITE_FR_DPO_CONTACT),
  },
  /** Angaben gemäß § 5 DDG / § 18 Abs. 2 MStV — owner-provided, never invented. */
  impressum: {
    company: clean(env.VITE_IMPRESSUM_COMPANY),
    legalForm: clean(env.VITE_IMPRESSUM_LEGAL_FORM),
    addressLines: lines(clean(env.VITE_IMPRESSUM_ADDRESS)),
    representatives: clean(env.VITE_IMPRESSUM_REPRESENTATIVES),
    registerCourt: clean(env.VITE_IMPRESSUM_REGISTER_COURT),
    registerNumber: clean(env.VITE_IMPRESSUM_REGISTER_NUMBER),
    vatId: clean(env.VITE_IMPRESSUM_VAT_ID),
    contentResponsible: clean(env.VITE_IMPRESSUM_CONTENT_RESPONSIBLE),
    dataProtectionOfficer: clean(env.VITE_DE_DPO_CONTACT),
  },
  social: parseSocial(clean(env.VITE_SOCIAL_PROFILES)),
};

export const SITE_META: Record<SiteId, { siteId: string; locale: string; ogLocale: string; homePath: string }> = {
  en: { siteId: 'en-global', locale: 'en-US', ogLocale: 'en_US', homePath: '/' },
  de: { siteId: 'de-de', locale: 'de-DE', ogLocale: 'de_DE', homePath: '/de/' },
  fr: { siteId: 'fr-fr', locale: 'fr-FR', ogLocale: 'fr_FR', homePath: '/fr/' },
  es: { siteId: 'es-es', locale: 'es-ES', ogLocale: 'es_ES', homePath: '/es/' },
  it: { siteId: 'it-it', locale: 'it-IT', ogLocale: 'it_IT', homePath: '/it/' },
};

/** Local preview ports mirror the six independently served language sites. */
const LOCAL_SITE_PORTS: Record<string, number> = {
  en: 8081,
  de: 8082,
  fr: 8083,
  es: 8084,
  it: 8085,
  nl: 8086,
};

/**
 * Return a locale homepage URL. Local preview links intentionally target the
 * corresponding port root so language switching never leaves the user on a
 * second-level hash route. Production keeps the configured site URL/path.
 */
export const localizedUrl = (path: string, locale?: string) => {
  if (typeof window !== 'undefined' && /^(?:localhost|127\.0\.0\.1)$/.test(window.location.hostname)) {
    const port = locale ? LOCAL_SITE_PORTS[locale.toLowerCase()] : undefined;
    if (port) return `${window.location.protocol}//${window.location.hostname}:${port}/`;
  }
  return `${siteUrl}${path}`;
};

export const hasDirectContact = Boolean(
  siteConfig.contact.email || siteConfig.contact.phone || siteConfig.contact.address,
);
