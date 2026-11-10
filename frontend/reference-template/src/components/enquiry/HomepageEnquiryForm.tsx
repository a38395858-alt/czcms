import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from 'react';
import { homeContext } from '../../lib/home-context';
import type { StartingPointValue } from '../../content/types';
import translations from '../../../../shared/enquiry-copy.json';

const POINTS: StartingPointValue[] = ['product-sourcing', 'ocean-freight', 'air-freight', 'warehousing-fulfillment', 'packaging-branding', 'not-sure'];

interface PrefillSnapshot { value: StartingPointValue | null; nonce: number }
interface Props {
  idPrefix: string;
  locale: string;
  prefillStore: {
    subscribe: (listener: () => void) => () => void;
    getSnapshot: () => PrefillSnapshot;
    consume: (snapshot: PrefillSnapshot) => StartingPointValue | null;
  };
}

/** Match the English homepage's five fields and the shared topic form. */
export function HomepageEnquiryForm({ idPrefix, locale, prefillStore }: Props) {
  const context = homeContext()?.enquiry;
  const basePath = context?.basePath ?? '__FV_ENQUIRY_BASE__';
  const copy = translations[locale.split('-')[0] as keyof typeof translations] ?? translations.en;
  const [point, setPoint] = useState<StartingPointValue>('product-sourcing');
  const [brief, setBrief] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; error: boolean } | null>(null);
  const locked = useRef(false);
  const startedAt = useRef(Date.now());
  const statusRef = useRef<HTMLParagraphElement>(null);
  const prefill = useSyncExternalStore(prefillStore.subscribe, prefillStore.getSnapshot, prefillStore.getSnapshot);
  const id = (name: string) => `${idPrefix}-home-${name}`;
  const [beforePolicy, afterPolicy = ''] = copy.consent.split(copy.privacyLabel);

  useEffect(() => {
    const value = prefillStore.consume(prefill);
    if (value) setPoint(value);
  }, [prefill, prefillStore.consume]);
  useEffect(() => { if (feedback) statusRef.current?.focus(); }, [feedback]);
  useEffect(() => {
    if (new URLSearchParams(location.search).get('enquiry') !== '1') return;
    const apply = (event?: Event) => {
      const incoming = (event as CustomEvent<{ brief?: string }> | undefined)?.detail?.brief
        ?? document.querySelector<HTMLElement>('[data-shipping-planner]')?.dataset.spEnquiryBrief;
      if (typeof incoming === 'string' && incoming.trim()) {
        setBrief(current => current.trim() ? current : incoming.slice(0, 2000));
      }
    };
    apply();
    document.addEventListener('freightvanta:shipping-enquiry', apply);
    return () => document.removeEventListener('freightvanta:shipping-enquiry', apply);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (locked.current || !form.reportValidity()) return;
    if (!context) { setFeedback({ text: copy.messages[4], error: true }); return; }
    locked.current = true;
    setBusy(true);
    setFeedback(null);
    const fields = new FormData(form);
    const value = (name: string) => String(fields.get(name) ?? '').trim();
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 25000);
    try {
      const response = await fetch(`${basePath}/home-enquiry`, {
        method: 'POST', credentials: 'same-origin', signal: controller.signal,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          site_id: context.siteId, locale: context.locale, form_token: context.formToken,
          route: '', placement: 'home-enquiry',
          website: value('website'), form_started_at: startedAt.current,
          full_name: value('name'), work_email: value('email'), company: value('company'),
          starting_point: point, cargo_details: value('brief'), consent: fields.get('consent') === 'on',
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 409) {
        setFeedback({ text: copy.messages[3], error: false });
      } else if (response.status === 201 && data.submitted === true) {
        setFeedback({ text: `${copy.messages[1]} ${typeof data.reference === 'string' ? data.reference : ''}`.trim(), error: false });
        form.reset();
        setPoint('product-sourcing');
        setBrief('');
        startedAt.current = Date.now();
      } else {
        setFeedback({ text: response.status === 403 ? copy.messages[4] : copy.messages[2], error: true });
      }
    } catch {
      setFeedback({ text: copy.messages[2], error: true });
    } finally {
      window.clearTimeout(timer);
      locked.current = false;
      setBusy(false);
    }
  }

  return <form className="cz-enq" data-cz-enquiry="1" method="post" action={`${basePath}/home-enquiry`} onSubmit={submit} aria-busy={busy || undefined}>
    <div className="cz-enq-grid">
      <div className="cz-enq-field"><label htmlFor={id('name')}>{copy.labels[0]}</label><input id={id('name')} name="name" autoComplete="name" maxLength={120} required /></div>
      <div className="cz-enq-field"><label htmlFor={id('email')}>{copy.labels[1]}</label><input id={id('email')} name="email" type="email" autoComplete="email" maxLength={254} required /></div>
      <div className="cz-enq-field"><label htmlFor={id('company')}>{copy.labels[2]}</label><input id={id('company')} name="company" autoComplete="organization" maxLength={120} /></div>
      <div className="cz-enq-field"><label htmlFor={id('start')}>{copy.labels[3]}</label><select id={id('start')} name="starting_point" value={point} onChange={event => setPoint(event.target.value as StartingPointValue)}>{POINTS.map((value, index) => <option key={value} value={value}>{copy.options[index]}</option>)}</select></div>
      <div className="cz-enq-field cz-enq-field-wide"><label htmlFor={id('brief')}>{copy.labels[4]}</label><textarea id={id('brief')} name="brief" maxLength={2000} placeholder={copy.placeholder} value={brief} onChange={event => setBrief(event.target.value)} /></div>
    </div>
    <label className="cz-enq-consent"><input type="checkbox" name="consent" required /><span>{beforePolicy}<a href={`${basePath}${copy.privacy}`}>{copy.privacyLabel}</a>{afterPolicy}</span></label>
    <input name="website" hidden tabIndex={-1} autoComplete="off" />
    <button className="cz-enq-submit" type="submit" disabled={busy}>{busy ? copy.messages[0] : <>{copy.button}<span aria-hidden="true">→</span></>}</button>
    <p className="cz-enq-status" ref={statusRef} tabIndex={-1} role={feedback?.error ? 'alert' : 'status'} hidden={!feedback}>{feedback?.text}</p>
  </form>;
}
