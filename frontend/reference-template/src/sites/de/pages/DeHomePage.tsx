import { siteConfig } from '../../../config/site';
import { HOME_META_DE, getPublishedHomeSectionsDe } from '../../../content/de/home';
import type { FaqSection, HomeSection, ServicePathsSection } from '../../../content/types';
import { useDocumentMeta, useJsonLd } from '../../../lib/seo';
import {
  DeCoverage,
  DeEnquirySection,
  DeFaq,
  DeHero,
  DeIndustries,
  DeOperation,
  DeProcess,
  DeResources,
  DeServicePaths,
} from '../components/DeHome';

function renderSection(section: HomeSection) {
  switch (section.section_key) {
    case 'hero':
      return <DeHero key={section.section_key} section={section} />;
    case 'coverage':
      return <DeCoverage key={section.section_key} section={section} />;
    case 'service_paths':
      return <DeServicePaths key={section.section_key} section={section} />;
    case 'operation':
      return <DeOperation key={section.section_key} section={section} />;
    case 'process':
      return <DeProcess key={section.section_key} section={section} />;
    case 'industries':
      return <DeIndustries key={section.section_key} section={section} />;
    case 'resources':
      return <DeResources key={section.section_key} section={section} />;
    case 'faq':
      return <DeFaq key={section.section_key} section={section} />;
    case 'enquiry':
      return <DeEnquirySection key={section.section_key} section={section} />;
    default:
      return null; // announcement + footer werden vom Seitenrahmen gerendert
  }
}

/** JSON-LD nur aus sichtbaren, verifizierten Inhalten: Organization, WebSite, Service, FAQPage. */
function buildJsonLd(services: ServicePathsSection | undefined, faq: FaqSection | undefined) {
  const root = siteConfig.siteUrl;
  const orgId = `${root}/#organization`;
  const organization: Record<string, unknown> = {
    '@type': 'Organization',
    '@id': orgId,
    name: siteConfig.brand,
    url: `${root}/`,
    description: HOME_META_DE.description,
  };
  if (siteConfig.impressum.company) organization.legalName = siteConfig.impressum.company;
  if (siteConfig.contact.email) organization.email = siteConfig.contact.email;
  if (siteConfig.contact.phone) organization.telephone = siteConfig.contact.phone;
  if (siteConfig.impressum.vatId) organization.vatID = siteConfig.impressum.vatId;
  if (siteConfig.social.length > 0) organization.sameAs = siteConfig.social.map((profile) => profile.url);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      organization,
      {
        '@type': 'WebSite',
        '@id': `${root}/de/#website`,
        name: `${siteConfig.brand} Deutschland`,
        url: `${root}/de/`,
        inLanguage: 'de-DE',
        publisher: { '@id': orgId },
      },
      ...(services?.items ?? []).map((service) => ({
        '@type': 'Service',
        name: service.label,
        serviceType: service.label,
        description: `${service.title} ${service.copy}`,
        provider: { '@id': orgId },
        url: `${root}${service.link_url}`,
        inLanguage: 'de-DE',
      })),
      {
        '@type': 'FAQPage',
        inLanguage: 'de-DE',
        mainEntity: (faq?.items ?? []).map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  };
}

export function DeHomePage() {
  const sections = getPublishedHomeSectionsDe();
  const services = sections.find((s): s is ServicePathsSection => s.section_key === 'service_paths');
  const faq = sections.find((s): s is FaqSection => s.section_key === 'faq');

  useDocumentMeta({ ...HOME_META_DE, ogLocale: 'de_DE' });
  useJsonLd('fv-de-home-jsonld', buildJsonLd(services, faq));

  return <>{sections.map(renderSection)}</>;
}
