import type { TopicDefinition } from '../TopicApp';
import { IT_TOPICS } from '../content/it/topics';
import { ItalianTopicHeader, ItalianTopicFooter } from '../components/it/ItalianTopicChrome';
import { ItalianTopicPage } from '../components/it/ItalianTopicPage';

export default {
  Header: ItalianTopicHeader, Footer: ItalianTopicFooter, Page: ItalianTopicPage,
  content: (route) => IT_TOPICS[route.replace(/^\/+|\/+$/g, '')] ?? null,
} satisfies TopicDefinition;
