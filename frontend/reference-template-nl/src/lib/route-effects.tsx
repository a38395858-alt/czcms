import { useEffect, useRef, type MouseEvent } from 'react';
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
  const previousKey = useRef<string | null>(null);

  useEffect(() => {
    const previous = previousKey.current;
    previousKey.current = key;
    const pageChanged = previous !== null && previous !== key;
    const isPush = consumePushIntent();
    const anchor =
      route.name === 'home' ||
      route.name === 'de-home' ||
      route.name === 'fr-home' ||
      route.name === 'es-home' ||
      route.name === 'it-home' ||
      route.name === 'nl-home'
        ? route.anchor
        : null;

    requestAnimationFrame(() => {
      if (pageChanged || previous === null) {
        const saved = getSavedScroll(key);
        if (pageChanged && !isPush && saved !== undefined && !anchor) {
          jump(() => window.scrollTo(0, saved));
        } else if (anchor) {
          const target = document.getElementById(anchor);
          if (target) {
            jump(() => target.scrollIntoView({ block: 'start' }));
            if (pageChanged) focusWithoutScroll(target);
          }
        } else if (pageChanged) {
          jump(() => window.scrollTo(0, 0));
        }
        if (pageChanged && !anchor) {
          const main = document.getElementById('main');
          if (main) focusWithoutScroll(main);
        }
      } else if (anchor && isPush) {
        // Same-page anchor navigation via path-style hashes (e.g. #/de → #/de/anfrage):
        // the browser has no matching element id, so the router scrolls explicitly.
        const target = document.getElementById(anchor);
        if (target) jump(() => target.scrollIntoView({ block: 'start' }));
      }
      resumeScrollTracking(key);
    });
  }, [key, route]);
}

export function SkipLink({ label }: { label: string }) {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const main = document.getElementById('main');
    if (!main) return;
    focusWithoutScroll(main);
    jump(() => main.scrollIntoView({ block: 'start' }));
  };
  return (
    <a
      href="#main"
      onClick={onClick}
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[3px] focus:bg-white focus:px-4 focus:py-3 focus:font-semibold focus:text-navy-900 focus:shadow-lg"
    >
      {label}
    </a>
  );
}

