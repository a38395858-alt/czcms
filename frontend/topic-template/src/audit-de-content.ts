import { mkdirSync, writeFileSync } from 'node:fs';
import { topicContent } from './languages/server';
const routes = ['product-sourcing', 'services/bulk-procurement', 'services/packaging-branding', 'services/inventory-storage', 'services/private-white-label', 'services/worldwide-fulfillment', 'industries/cross-border-ecommerce', 'industries/consumer-goods', 'industries/industrial-components', 'industries/time-critical-cargo'];
mkdirSync('../../output/de-topic-refinement', { recursive: true });
writeFileSync('../../output/de-topic-refinement/content-model.json', JSON.stringify(routes.map(route => ({ route, content: topicContent('de', route) })), null, 2));
