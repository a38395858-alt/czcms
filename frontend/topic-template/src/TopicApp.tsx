import { useEffect, type ComponentType } from 'react';
import { getTopicLayout, topicLayoutKey } from './components/topic/variants';
import { ConsentBanner } from './components/layout/ConsentBanner';
import { RouterProvider } from './lib/router';
import { cmsContext } from './lib/cms';
import type { TopicPageContent } from './content/en-global/topics/types';

export interface TopicDefinition {
  Header: ComponentType;
  Footer: ComponentType;
  Page: ComponentType<{ content: TopicPageContent }>;
  content: (route: string) => TopicPageContent | null;
}

export default function TopicApp({ definition }: { definition: TopicDefinition }) {
  const ctx = cmsContext();
  useEffect(() => {
    // Document enhancements may only touch React markup after hydration commits.
    document.documentElement.dataset.topicHydrated = 'true';
    document.dispatchEvent(new Event('freightvanta:topic-ready'));
  }, []);
  const german = ctx?.locale === 'de';
  const spanish = ctx?.locale === 'es';
  const french = ctx?.locale === 'fr';
  const italian = ctx?.locale === 'it';
  const dutch = ctx?.locale === 'nl';
  const content = definition.content(ctx?.route ?? 'product-sourcing');
  if (!content) return null;
  const { Header, Footer, Page } = definition;
  const layout = getTopicLayout(content.route);
  return <RouterProvider>
    <div className={`${spanish ? 'es-topic-site ' : french ? 'fr-topic-site ' : italian ? 'it-topic-site ' : dutch ? 'nl-topic-site ' : ''}flex min-h-screen flex-col overflow-x-clip`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:px-4 focus:py-3 focus:text-navy-900">
        {german ? 'Zum Inhalt springen' : spanish ? 'Saltar al contenido' : french ? 'Aller au contenu' : italian ? 'Vai al contenuto' : dutch ? 'Direct naar inhoud' : 'Skip to main content'}
      </a>
      {!ctx?.sharedHeader && <Header />}
      <main data-topic-layout={topicLayoutKey(content.route)} data-hero={layout.hero} data-enquiry={layout.enquiry} data-related={layout.related} id="main" tabIndex={-1} className={german ? 'topic-composition de-topic-page flex-1 outline-none' : 'topic-composition flex-1 outline-none'}>
        <Page content={content} />
      </main>
      <Footer />
      <ConsentBanner locale={german ? 'de' : spanish ? 'es' : french ? 'fr' : italian ? 'it' : dutch ? 'nl' : 'en'} />
    </div>
  </RouterProvider>;
}
