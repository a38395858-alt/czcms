import { TopicPage } from '../components/topic/TopicPage';
import { getServiceTopic } from '../content/en-global/topics';
import { NotFoundPage } from './CompanyPages';

/** English service topic pages (/services/:slug). */
export function ServiceTopicPage({ slug }: { slug: string }) {
  const topic = getServiceTopic(slug);
  return topic ? <TopicPage content={topic} /> : <NotFoundPage path={`/services/${slug}`} />;
}
