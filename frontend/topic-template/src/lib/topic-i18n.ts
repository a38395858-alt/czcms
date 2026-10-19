import { DE_TOPIC_COUNTERPARTS } from '../content/de/topics';
import { cmsContext } from './cms';

export interface TopicCounterpart {
  en: string;
  de: string;
}

/**
 * EN↔DE counterpart for the 10 topic pages. Returns null for every other path.
 * Accepts hash-router paths with or without a leading '#'.
 */
export function topicCounterpartForPath(path: string): TopicCounterpart | null {
  const clean = path.replace(/^#/, '').replace(/\/+$/, '') || '/';
  for (const counterpart of Object.values(DE_TOPIC_COUNTERPARTS)) {
    if (counterpart.en === clean || counterpart.de === clean) return counterpart;
  }
  return null;
}

/** Current hash-router path, or '/' when unavailable (SSR). */
export function currentHashPath(): string {
  const ctx = cmsContext();
  if (ctx) return `${ctx.locale === 'de' ? '/de' : ''}/${ctx.route}`;
  if (typeof window === 'undefined') return '/';
  const hash = window.location.hash;
  if (!hash || hash === '#') return '/';
  return hash.slice(1);
}
