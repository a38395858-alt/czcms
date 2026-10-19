import '../../shared/client-recovery.css';
import { withClientRecovery } from '../../shared/client-recovery';
import { hydrateRoot } from 'react-dom/client';
import TopicApp from './TopicApp';
import './fonts';
import './index.css';
import './de-topic-refinement.css';
import './es-topics.css';
import './fr-topics.css';
import './it-topics.css';
import './nl-topics.css';
import './topic-composition.css';
import { cmsContext } from './lib/cms';
const loaders = {
  en: () => import('./languages/en'), de: () => import('./languages/de'),
  fr: () => import('./languages/fr'), es: () => import('./languages/es'),
  it: () => import('./languages/it'), nl: () => import('./languages/nl'),
};
const locale = cmsContext()?.locale ?? 'en';
const load = loaders[locale as keyof typeof loaders] ?? loaders.en;
withClientRecovery(() => load().then(({ default: definition }) => {
  hydrateRoot(document.getElementById('root')!, <TopicApp definition={definition} />);
}), locale);
