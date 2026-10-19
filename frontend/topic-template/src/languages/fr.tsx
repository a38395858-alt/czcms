import type { TopicDefinition } from '../TopicApp';
import { FR_TOPICS } from '../content/fr/topics';
import { FrenchTopicHeader, FrenchTopicFooter } from '../components/fr/FrenchTopicChrome';
import { FrenchTopicPage } from '../components/fr/FrenchTopicPage';

export default {
  Header: FrenchTopicHeader, Footer: FrenchTopicFooter, Page: FrenchTopicPage,
  content: (route) => FR_TOPICS[route.replace(/^\/+|\/+$/g, '')] ?? null,
} satisfies TopicDefinition;
