import { useEffect, useRef, type MouseEvent } from 'react';
import { SITE_META } from '../config/site';
import { ensureEnFonts } from '../sites/en/fonts';
import { consumePushIntent, getSavedScroll, resumeScrollTracking, routeKey, type Route } from './router';

/** Jump without smooth scrolling (works in browsers that do not support behavior: 'instant'). */
function jump(action: () => void) {
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  action();
  root.style.scrollBehavior = previous;
}

function focusWithoutScroll(element: HTMLElement) {
  if (!element.hasAttribute('tabindex')) {
    element.setAttribute('tabindex', '-1');
    element.style.outline = 'none';
  }
  element.focus({ preventScroll: true });
}

/** Scroll + focus management: new pages start at the top, anchors land below the sticky header. */
export function useRouteScroll(route: Route) {
  const key = routeKey(route);
  const anchor = route.name === 'home' ? route.anchor : null;
  const anchorKey = `${key}#${anchor ?? ''}`;
  const previousKey = useRef<string | null>(null);
  const previousAnchorKey = useRef<string | null>(null);

  useEffect(() => {
    const previous = previousKey.current;
    const previousAnchor = previousAnchorKey.current;
    previousKey.current = key;
    previousAnchorKey.current = anchorKey;
    const firstRender = previous === null;
    const pageChanged = !firstRender && previous !== key;
    const anchorChanged = !firstRender && previousAnchor !== anchorKey;
    const isPush = consumePushIntent();

    requestAnimationFrame(() => {
      if (pageChanged || firstRender || (anchor && anchorChanged)) {
        const saved = getSavedScroll(key);
        if (pageChanged && !isPush && saved !== undefined && !anchor) {
          jump(() => window.scrollTo(0, saved));
        } else if (anchor) {
          const target = document.getElementById(anchor);
          if (target) {
            jump(() => target.scrollIntoView({ block: 'start' }));
            if (pageChanged || anchorChanged) focusWithoutScroll(target);
          }
        } else if (pageChanged) {
          jump(() => window.scrollTo(0, 0));
        }
        if (pageChanged && !anchor) {
          const main = document.getElementById('main');
          if (main) focusWithoutScroll(main);
        }
      }
      resumeScrollTracking(key);
    });
  }, [key, anchor, anchorKey]);
}

export function useSiteDocument(route: Route) {
  useEffect(() => {
    const root = document.documentElement;
    root.lang = SITE_META[route.site].locale;
    root.dataset.site = route.site;
    if (route.site === 'en') ensureEnFonts();
  }, [route.site]);
}

export const focusMain = (event: MouseEvent<HTMLAnchorElement>) => {
  event.preventDefault();
  const main = document.getElementById('main');
  if (!main) return;
  focusWithoutScroll(main);
  jump(() => main.scrollIntoView({ block: 'start' }));
};

