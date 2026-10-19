import type { TopicDefinition } from '../TopicApp';
import { NL_TOPICS } from '../content/nl/topics';
import { DutchTopicHeader, DutchTopicFooter } from '../components/nl/DutchTopicChrome';
import { DutchTopicPage } from '../components/nl/DutchTopicPage';

export default {
  Header: DutchTopicHeader, Footer: DutchTopicFooter, Page: DutchTopicPage,
  content: (route) => NL_TOPICS[route.replace(/^\/+|\/+$/g, '')] ?? null,
} satisfies TopicDefinition;
