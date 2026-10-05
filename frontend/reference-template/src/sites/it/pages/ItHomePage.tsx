import { siteConfig } from '../../../config/site';
import { HOME_META_IT, getPublishedHomeSectionsIt } from '../../../content/it/home';
import type { FaqSection, HomeSection, ServicePathsSection } from '../../../content/types';
import { useDocumentMeta, useJsonLd } from '../../../lib/seo';
import { ItCoverage, ItEnquirySection, ItFaq, ItHero, ItIndustries, ItOperation, ItProcess, ItResources, ItServicePaths } from '../components/ItHome';

function renderSection(section: HomeSection) {
  switch (section.section_key) {
    case 'hero':
      return <ItHero key={section.section_key} section={section} />;
    case 'coverage':
      return <ItCoverage key={section.section_key} section={section} />;
    case 'service_paths':
      return <ItServicePaths key={section.section_key} section={section} />;
    case 'operation':
      return <ItOperation key={section.section_key} section={section} />;
    case 'process':
      return <ItProcess key={section.section_key} section={section} />;
    case 'industries':
      return <ItIndustries key={section.section_key} section={section} />;
    case 'resources':
      return <ItResources key={section.section_key} section={section} />;
    case 'faq':
      return <ItFaq key={section.section_key} section={section} />;
    case 'enquiry':
      return <ItEnquirySection key={section.section_key} section={section} />;
    default:
      return null; // avviso in alto e piè di pagina sono resi dal layout del sito
  }
}

/** JSON-LD solo con contenuti visibili e verificati: Organization, WebSite, Service e FAQPage. */
function buildJsonLd(services: ServicePathsSection | undefined, faq: FaqSection | undefined) {
  const root = siteConfig.siteUrl;
  const orgId = `${root}/#organization`;
  const organization: Record<string, unknown> = {
    '@type': 'Organization',
    '@id': orgId,
    name: siteConfig.brand,
    url: `${root}/`,
    description: HOME_META_IT.description,
  };
  if (siteConfig.noteLegali.company) organization.legalName = siteConfig.noteLegali.company;
  if (siteConfig.noteLegali.vatId) organization.vatID = siteConfig.noteLegali.vatId;
  if (siteConfig.noteLegali.taxCode) organization.taxID = siteConfig.noteLegali.taxCode;
  if (siteConfig.contact.email) organization.email = siteConfig.contact.email;
  if (siteConfig.contact.phone) organization.telephone = siteConfig.contact.phone;
  if (siteConfig.social.length > 0) organization.sameAs = siteConfig.social.map((profile) => profile.url);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      organization,
      {
        '@type': 'WebSite',
        '@id': `${root}/it/#website`,
        name: `${siteConfig.brand} Italia`,
        url: `${root}/it/`,
        inLanguage: 'it-IT',
        publisher: { '@id': orgId },
      },
      ...(services?.items ?? []).map((service) => ({
        '@type': 'Service',
        name: service.label,
        serviceType: service.label,
        description: `${service.title} ${service.copy}`,
        provider: { '@id': orgId },
        url: `${root}${service.link_url}`,
        inLanguage: 'it-IT',
      })),
      {
        '@type': 'FAQPage',
        inLanguage: 'it-IT',
        mainEntity: (faq?.items ?? []).map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  };
}

export function ItHomePage() {
  const sections = getPublishedHomeSectionsIt();
  const services = sections.find((s): s is ServicePathsSection => s.section_key === 'service_paths');
  const faq = sections.find((s): s is FaqSection => s.section_key === 'faq');

  useDocumentMeta({ ...HOME_META_IT, ogLocale: 'it_IT' });
  useJsonLd('fv-it-home-jsonld', buildJsonLd(services, faq));

  return <>{sections.map(renderSection)}</>;
}
