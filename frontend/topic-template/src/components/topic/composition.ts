import type { TopicSection } from '../../content/en-global/topics/types';
import { topicLayoutKey } from './variants';

// Preserve original indices so navigation and heading IDs survive reordering.
export function orderedTopicSections(route: string, sections: TopicSection[]) {
  const key = topicLayoutKey(route);
  const priorities: Record<string, string[]> = {
    'inventory-storage': ['decision', 'workflow', 'controls', 'scenarios', 'checklist', 'faq'],
    'worldwide-fulfillment': ['decision', 'workflow', 'scenarios', 'controls', 'checklist', 'faq'],
    'industry-time-critical-cargo': ['decision', 'checklist', 'workflow', 'scenarios', 'controls', 'faq'],
    'industry-industrial-components': ['decision', 'controls', 'scenarios', 'workflow', 'checklist', 'faq'],
    'private-white-label': ['decision', 'controls', 'workflow', 'scenarios', 'checklist', 'faq'],
  };
  const order = priorities[key];
  const entries = sections.map((section, index) => ({ section, index }));
  if (!order) return entries;
  // Rich English/German sections keep their relative order within each stage.
  return entries.sort((a, b) => {
    const rank = (type: string) => {
      const mapped = type === 'scopeTable' ? 'controls' : ['brief', 'comparison', 'checkpoints'].includes(type) ? 'checklist' : type;
      const position = order.indexOf(mapped);
      return position < 0 ? order.length : position;
    };
    return rank(a.section.type) - rank(b.section.type);
  });
}
