import { useEffect, useRef } from 'react';
import { siteConfig } from '../../config/site';
import { setConsent, useConsent } from '../../lib/analytics';
import { Link } from '../../lib/router';

/** Consent prompt for first-party analytics. Non-modal, never blocks page content. */
export function ConsentBanner() {
  const { promptOpen, reopened, consent } = useConsent();
  const allowRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (promptOpen && reopened) allowRef.current?.focus();
  }, [promptOpen, reopened]);

  if (!promptOpen) return null;

  return (
    <div
      role="region"
      aria-label="Analytics preferences"
      className="fixed inset-x-3 bottom-3 z-[70] sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[25rem]"
    >
      <div className="rounded-[4px] border border-white/10 bg-navy-950 p-5 text-navy-100 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.65)]">
        <p className="font-display text-lg font-semibold text-white">Analytics preferences</p>
        <p className="mt-2 text-sm leading-relaxed text-navy-200">
          We use first-party analytics to learn which parts of this page help visitors plan a shipment. Form entries are
          never included.
          {consent !== 'unset' && ` Current choice: ${consent === 'granted' ? 'allowed' : 'declined'}.`}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            ref={allowRef}
            type="button"
            onClick={() => setConsent('granted')}
            className="btn min-h-10 bg-white px-4 py-2 text-sm text-navy-950 hover:bg-mist-100"
          >
            Allow analytics
          </button>
          <button
            type="button"
            onClick={() => setConsent('denied')}
            className="btn min-h-10 px-4 py-2 text-sm text-white ring-1 ring-white/30 hover:bg-white/[0.06]"
          >
            Decline
          </button>
          <Link
            to={siteConfig.legal.cookies}
            className="ml-auto py-2 text-sm font-medium text-signal-300 underline underline-offset-4 hover:text-white"
          >
            Cookie policy
          </Link>
        </div>
      </div>
    </div>
  );
}
