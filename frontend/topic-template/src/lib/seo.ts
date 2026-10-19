import { cmsContext } from './cms';
import { useEffect } from 'react';
import { siteConfig } from '../config/site';
import type { FaqItem, ServicePathItem } from '../content/types';

export interface PageMeta {
  title: string;
  description: string;
  path: string;
  /** BCP 47 language tag for the page; defaults to en-US. */
  lang?: string;
  /** Optional SEO keywords; when omitted, any stale keywords tag is removed. */
  keywords?: string[];
}

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = href;
}

export function truncate(text: string, max = 158): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

/** Keeps title, description, keywords, canonical, language, and Open Graph in step with the visible page. */
export function useDocumentMeta({ title, description, path, lang = 'en-US', keywords }: PageMeta) {
  useEffect(() => {
    if (cmsContext()) return;
    const url = `${siteConfig.siteUrl}${path}`;
    document.title = title;
    document.documentElement.lang = lang;
    upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertCanonical(url);
    const existing = document.head.querySelector<HTMLMetaElement>('meta[name="keywords"]');
    if (keywords && keywords.length > 0) {
      upsertMeta('name', 'keywords', keywords.join(', '));
    } else {
      existing?.remove();
    }
  }, [title, description, path, lang, keywords]);
}

/**
 * Page-level hreflang alternates (e.g. EN↔DE topic counterparts).
 * Temporarily repoints the static homepage alternates and restores them on cleanup.
 */
export function useHreflang(alternates: Array<{ lang: string; path: string }>) {
  const key = alternates.map((alt) => `${alt.lang}:${alt.path}`).join('|');
  useEffect(() => {
    if (cmsContext()) return;
    if (alternates.length === 0) return;
    const restored: Array<{ el: HTMLLinkElement; href: string }> = [];
    for (const alt of alternates) {
      const el = document.head.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${alt.lang}"]`);
      if (!el) continue;
      restored.push({ el, href: el.href });
      el.href = `${siteConfig.siteUrl}${alt.path}`;
    }
    return () => {
      for (const { el, href } of restored) el.href = href;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

/** Injects JSON-LD built from the same data that renders the visible page. */
export function useJsonLd(id: string, data: object | null) {
  const json = data ? JSON.stringify(data).replace(/</g, '\\u003c') : null;
  useEffect(() => {
    if (cmsContext()) return;
    if (!json) return;
    document.getElementById(id)?.remove();
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.text = json;
    document.head.appendChild(script);
    return () => script.remove();
  }, [id, json]);
}

export function buildHomeJsonLd(args: { description: string; services: ServicePathItem[]; faqs: FaqItem[] }) {
  const root = siteConfig.siteUrl;
  const orgId = `${root}/#organization`;

  const organization: Record<string, unknown> = {
    '@type': 'Organization',
    '@id': orgId,
    name: siteConfig.brand,
    url: `${root}/`,
    description: args.description,
  };
  // Only verified, owner-configured details are emitted.
  if (siteConfig.legalEntity) organization.legalName = siteConfig.legalEntity;
  if (siteConfig.contact.email) organization.email = siteConfig.contact.email;
  if (siteConfig.contact.phone) organization.telephone = siteConfig.contact.phone;
  if (siteConfig.social.length > 0) organization.sameAs = siteConfig.social.map((profile) => profile.url);

  const website = {
    '@type': 'WebSite',
    '@id': `${root}/#website`,
    name: siteConfig.brand,
    url: `${root}/`,
    inLanguage: siteConfig.locale,
    publisher: { '@id': orgId },
  };

  const services = args.services.map((service) => ({
    '@type': 'Service',
    name: service.label,
    serviceType: service.label,
    description: `${service.title} ${service.copy}`,
    provider: { '@id': orgId },
    url: `${root}${service.link_url}`,
  }));

  const faqPage = {
    '@type': 'FAQPage',
    mainEntity: args.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return { '@context': 'https://schema.org', '@graph': [organization, website, ...services, faqPage] };
}
