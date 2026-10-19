import type { TopicDefinition } from '../TopicApp';
import { ES_TOPICS } from '../content/es/topics';
import { SpanishTopicHeader, SpanishTopicFooter } from '../components/es/SpanishTopicChrome';
import { SpanishTopicPage } from '../components/es/SpanishTopicPage';

export default {
  Header: SpanishTopicHeader, Footer: SpanishTopicFooter, Page: SpanishTopicPage,
  content: (route) => ES_TOPICS[route.replace(/^\/+|\/+$/g, '')] ?? null,
} satisfies TopicDefinition;
