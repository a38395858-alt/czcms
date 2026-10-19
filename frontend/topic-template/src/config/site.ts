import { cmsContext } from '../lib/cms';
/**
 * Site-level configuration for the English Global homepage.
 *
 * Values are read from Vite env variables (see `.env`) so owners can configure them without
 * editing templates. Contact, legal, locale, and URL details must be verified by FreightVanta
 * before publishing — they are intentionally empty by default and hidden when empty.
 */
const env = import.meta.env;
const clean = (value: string | undefined) => (value ?? '').trim();

const siteUrl = (clean(env.VITE_SITE_URL) || 'https://www.freightvanta.com').replace(/\/+$/, '');

export interface LocalizedHomepage {
  hreflang: string;
  label: string;
  path: string;
  current?: boolean;
  /** Set when the localized site is served from this build (in-app route). */
  internal?: string;
}

/**
 * Localized homepages that share the section contract. Keep this list in sync with the
 * hreflang links in index.html. Owner to confirm the published locales and paths.
 */
export const LOCALIZED_HOMEPAGES: LocalizedHomepage[] = [
  { hreflang: 'en', label: 'English (Global)', path: '/', current: true },
  { hreflang: 'es', label: 'Español', path: '/es/', internal: '/es' },
  { hreflang: 'fr', label: 'Français', path: '/fr/', internal: '/fr' },
  { hreflang: 'it', label: 'Italiano', path: '/it/', internal: '/it' },
  { hreflang: 'nl', label: 'Nederlands', path: '/nl/', internal: '/nl' },
  { hreflang: 'de', label: 'Deutsch', path: '/de/', internal: '/de' },
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

export const siteConfig = {
  get siteId() { return String(cmsContext()?.siteId ?? 'en-global'); },
  get locale() { return cmsContext()?.locale ?? 'en-US'; },
  brand: 'FreightVanta',
  get siteUrl() { return cmsContext()?.siteUrl ?? siteUrl; },
  get enquiryEndpoint() { return cmsContext() ? `${cmsContext()!.basePath}/topic-enquiry` : clean(env.VITE_ENQUIRY_ENDPOINT); },
  analyticsEndpoint: clean(env.VITE_ANALYTICS_ENDPOINT),
  contact: {
    email: clean(env.VITE_CONTACT_EMAIL),
    phone: clean(env.VITE_CONTACT_PHONE),
    address: clean(env.VITE_CONTACT_ADDRESS),
  },
  legalEntity: clean(env.VITE_LEGAL_ENTITY),
  /** Legal-policy URLs are configurable; they fall back to the in-site summary pages. */
  legal: {
    privacy: clean(env.VITE_PRIVACY_URL) || '/privacy',
    cookies: clean(env.VITE_COOKIE_URL) || '/cookies',
    terms: clean(env.VITE_TERMS_URL) || '/terms',
  },
  social: parseSocial(clean(env.VITE_SOCIAL_PROFILES)),
};

export const localizedUrl = (path: string) => `${siteUrl}${path}`;

export const hasDirectContact = Boolean(
  siteConfig.contact.email || siteConfig.contact.phone || siteConfig.contact.address,
);
