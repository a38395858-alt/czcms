import type { TopicDefinition } from '../TopicApp';
import { GermanTopicPage } from '../components/de/GermanTopicPage';
import { DeHeader, DeFooter } from '../components/de/GermanChrome';
import { DE_PRODUCT_SOURCING_TOPIC, getDeServiceTopic, getDeIndustryTopic } from '../content/de/topics';

export default {
  Header: DeHeader, Footer: DeFooter, Page: GermanTopicPage,
  content: (route) => {
    const path = route.replace(/^\/+|\/+$/g, '');
    const [kind, slug] = path.split('/');
    if (path === 'product-sourcing') return DE_PRODUCT_SOURCING_TOPIC;
    return kind === 'services' ? getDeServiceTopic(slug) : kind === 'industries' ? getDeIndustryTopic(slug) : null;
  },
} satisfies TopicDefinition;
