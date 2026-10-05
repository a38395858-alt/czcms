import { siteConfig } from '../../../config/site';
import { HOME_META_ES, getPublishedHomeSectionsEs } from '../../../content/es/home';
import type { FaqSection, HomeSection, ServicePathsSection } from '../../../content/types';
import { useDocumentMeta, useJsonLd } from '../../../lib/seo';
import { EsCoverage, EsEnquirySection, EsFaq, EsHero, EsIndustries, EsOperation, EsProcess, EsResources, EsServicePaths } from '../components/EsHome';

function renderSection(section: HomeSection) {
  switch (section.section_key) {
    case 'hero':
      return <EsHero key={section.section_key} section={section} />;
    case 'coverage':
      return <EsCoverage key={section.section_key} section={section} />;
    case 'service_paths':
      return <EsServicePaths key={section.section_key} section={section} />;
    case 'operation':
      return <EsOperation key={section.section_key} section={section} />;
    case 'process':
      return <EsProcess key={section.section_key} section={section} />;
    case 'industries':
      return <EsIndustries key={section.section_key} section={section} />;
    case 'resources':
      return <EsResources key={section.section_key} section={section} />;
    case 'faq':
      return <EsFaq key={section.section_key} section={section} />;
    case 'enquiry':
      return <EsEnquirySection key={section.section_key} section={section} />;
    default:
      return null; // aviso superior y pie de página los renderiza la plantilla del sitio
  }
}

/** JSON-LD solo con contenido visible y verificado: Organization, WebSite, Service y FAQPage. */
function buildJsonLd(services: ServicePathsSection | undefined, faq: FaqSection | undefined) {
  const root = siteConfig.siteUrl;
  const orgId = `${root}/#organization`;
  const organization: Record<string, unknown> = {
    '@type': 'Organization',
    '@id': orgId,
    name: siteConfig.brand,
    url: `${root}/`,
    description: HOME_META_ES.description,
  };
  if (siteConfig.avisoLegal.company) organization.legalName = siteConfig.avisoLegal.company;
  if (siteConfig.avisoLegal.nif) organization.taxID = siteConfig.avisoLegal.nif;
  if (siteConfig.contact.email) organization.email = siteConfig.contact.email;
  if (siteConfig.contact.phone) organization.telephone = siteConfig.contact.phone;
  if (siteConfig.social.length > 0) organization.sameAs = siteConfig.social.map((profile) => profile.url);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      organization,
      {
        '@type': 'WebSite',
        '@id': `${root}/es/#website`,
        name: `${siteConfig.brand} España`,
        url: `${root}/es/`,
        inLanguage: 'es-ES',
        publisher: { '@id': orgId },
      },
      ...(services?.items ?? []).map((service) => ({
        '@type': 'Service',
        name: service.label,
        serviceType: service.label,
        description: `${service.title} ${service.copy}`,
        provider: { '@id': orgId },
        url: `${root}${service.link_url}`,
        inLanguage: 'es-ES',
      })),
      {
        '@type': 'FAQPage',
        inLanguage: 'es-ES',
        mainEntity: (faq?.items ?? []).map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  };
}

export function EsHomePage() {
  const sections = getPublishedHomeSectionsEs();
  const services = sections.find((s): s is ServicePathsSection => s.section_key === 'service_paths');
  const faq = sections.find((s): s is FaqSection => s.section_key === 'faq');

  useDocumentMeta({ ...HOME_META_ES, ogLocale: 'es_ES' });
  useJsonLd('fv-es-home-jsonld', buildJsonLd(services, faq));

  return <>{sections.map(renderSection)}</>;
}
