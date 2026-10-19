// The offline renderer needs all languages; the browser imports only its own module.
import en from './en';
import de from './de';
import fr from './fr';
import es from './es';
import it from './it';
import nl from './nl';
import type { TopicDefinition } from '../TopicApp';
export const topicDefinitions: Record<string, TopicDefinition> = { en, de, fr, es, it, nl };
export function topicContent(locale: string, route: string) {
  return (topicDefinitions[locale] ?? en).content(route);
}
