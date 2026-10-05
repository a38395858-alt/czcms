import { useSyncExternalStore } from 'react';
import { siteConfig } from '../config/site';

/* ------------------------------------------------------------------
   Consent (first-party, stored locally). Analytics only run when granted.
------------------------------------------------------------------- */
export type ConsentChoice = 'granted' | 'denied';
export type ConsentState = ConsentChoice | 'unset';

const STORAGE_KEY = 'fv.analytics-consent.v1';
const listeners = new Set<() => void>();

function readConsent(): ConsentState {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'granted' || value === 'denied' ? value : 'unset';
  } catch {
    return 'unset';
  }
}

let consent: ConsentState = typeof window === 'undefined' ? 'unset' : readConsent();
let settingsOpen = false;

interface ConsentSnapshot {
  consent: ConsentState;
  promptOpen: boolean;
  reopened: boolean;
}
let snapshot: ConsentSnapshot = { consent, promptOpen: consent === 'unset', reopened: false };

function emit() {
  snapshot = { consent, promptOpen: consent === 'unset' || settingsOpen, reopened: settingsOpen };
  listeners.forEach((listener) => listener());
}

export function setConsent(choice: ConsentChoice) {
  consent = choice;
  settingsOpen = false;
  try {
    window.localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    /* storage unavailable — keep the choice for this session only */
  }
  emit();
}

export function openConsentSettings() {
  settingsOpen = true;
  emit();
}

export function useConsent(): ConsentSnapshot {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => snapshot,
    () => snapshot,
  );
}

/* ------------------------------------------------------------------
   Events. Never pass form values — only event names and non-personal context.
------------------------------------------------------------------- */
export type AnalyticsEvent =
  | 'home_hero_primary_click'
  | 'home_hero_secondary_click'
  | 'home_service_tab_change'
  | 'home_service_link_click'
  | 'home_industry_click'
  | 'home_guides_click'
  | 'home_enquiry_started'
  | 'home_enquiry_submitted'
  | 'home_enquiry_error';

export type EventProps = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    fvDataLayer?: Array<Record<string, unknown>>;
  }
}

const SAFE_KEY = /^[a-z][a-z0-9_]{0,31}$/;

function sanitize(props: EventProps): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(props)) {
    if (!SAFE_KEY.test(key) || value === null || value === undefined) continue;
    out[key] = typeof value === 'string' ? value.slice(0, 80) : value;
  }
  return out;
}

export function track(event: AnalyticsEvent, props: EventProps = {}) {
  if (consent !== 'granted' || typeof window === 'undefined') return;

  const payload: Record<string, unknown> = {
    event,
    ...sanitize(props),
    site_id: siteConfig.siteId,
    locale: siteConfig.locale,
    page: window.location.hash || '#/',
    ts: new Date().toISOString(),
  };

  window.fvDataLayer = window.fvDataLayer || [];
  window.fvDataLayer.push(payload);

  const endpoint = siteConfig.analyticsEndpoint;
  if (endpoint) {
    const body = JSON.stringify(payload);
    try {
      const queued = navigator.sendBeacon?.(endpoint, new Blob([body], { type: 'application/json' }));
      if (!queued) {
        void fetch(endpoint, {
          method: 'POST',
          body,
          keepalive: true,
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
        }).catch(() => undefined);
      }
    } catch {
      /* analytics must never block the interface */
    }
  }

  if (import.meta.env.DEV) console.info('[analytics]', payload);
}
