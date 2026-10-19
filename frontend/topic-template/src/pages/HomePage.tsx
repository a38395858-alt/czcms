import { Coverage } from '../components/home/Coverage';
import { EnquirySection } from '../components/home/EnquirySection';
import { Faq } from '../components/home/Faq';
import { Hero } from '../components/home/Hero';
import { Industries } from '../components/home/Industries';
import { Operation } from '../components/home/Operation';
import { Process } from '../components/home/Process';
import { Resources } from '../components/home/Resources';
import { ServicePaths } from '../components/home/ServicePaths';
import { HOME_META, getPublishedHomeSections } from '../content/en-global/home';
import type { FaqSection, HomeSection, ServicePathsSection } from '../content/types';
import { buildHomeJsonLd, useDocumentMeta, useJsonLd } from '../lib/seo';

function renderSection(section: HomeSection) {
  switch (section.section_key) {
    case 'hero':
      return <Hero key={section.section_key} section={section} />;
    case 'coverage':
      return <Coverage key={section.section_key} section={section} />;
    case 'service_paths':
      return <ServicePaths key={section.section_key} section={section} />;
    case 'operation':
      return <Operation key={section.section_key} section={section} />;
    case 'process':
      return <Process key={section.section_key} section={section} />;
    case 'industries':
      return <Industries key={section.section_key} section={section} />;
    case 'resources':
      return <Resources key={section.section_key} section={section} />;
    case 'faq':
      return <Faq key={section.section_key} section={section} />;
    case 'enquiry':
      return <EnquirySection key={section.section_key} section={section} />;
    default:
      // announcement + footer are rendered by the site layout (header/footer partials)
      return null;
  }
}

export function HomePage() {
  const sections = getPublishedHomeSections();
  const services = sections.find((s): s is ServicePathsSection => s.section_key === 'service_paths');
  const faq = sections.find((s): s is FaqSection => s.section_key === 'faq');

  useDocumentMeta(HOME_META);
  useJsonLd(
    'fv-home-jsonld',
    buildHomeJsonLd({
      description: HOME_META.description,
      services: services?.items ?? [],
      faqs: faq?.items ?? [],
    }),
  );

  return <>{sections.map(renderSection)}</>;
}
