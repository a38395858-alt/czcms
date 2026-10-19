import type { TopicDefinition } from '../TopicApp';
import { TopicPage } from '../components/topic/TopicPage';
import { SiteHeader, AnnouncementBar } from '../components/layout/Header';
import { SiteFooter } from '../components/layout/Footer';
import { PRODUCT_SOURCING_TOPIC, SERVICE_TOPICS, INDUSTRY_TOPICS } from '../content/en-global/topics';

function Header() { return <><AnnouncementBar /><SiteHeader /></>; }
export default {
  Header, Footer: SiteFooter, Page: TopicPage,
  content: (route) => {
    const path = route.replace(/^\/+|\/+$/g, '');
    const [kind, slug] = path.split('/');
    if (path === 'product-sourcing') return PRODUCT_SOURCING_TOPIC;
    return kind === 'services' ? SERVICE_TOPICS[slug] ?? null : kind === 'industries' ? INDUSTRY_TOPICS[slug] ?? null : null;
  },
} satisfies TopicDefinition;
