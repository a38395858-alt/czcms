import { siteConfig } from '../config/site';
import type { StartingPointValue } from '../content/types';
import { enStrings, type EnquiryFieldName, type TimingValue, type ValidationMessages } from './enquiry-i18n';

export type { TimingValue };

/* ------------------------------------------------------------------
   Enquiry schema — mirrors the server-side validation rules.
------------------------------------------------------------------- */
export const STARTING_POINT_VALUES: readonly StartingPointValue[] = [
  'product-sourcing',
  'ocean-freight',
  'air-freight',
  'warehousing-fulfillment',
  'packaging-branding',
  'not-sure',
];

export const TIMING_VALUES: ReadonlyArray<Exclude<TimingValue, ''>> = ['ready-now', 'this-month', 'planning-ahead'];

export interface EnquiryValues {
  fullName: string;
  workEmail: string;
  company: string;
  phone: string;
  origin: string;
  destination: string;
  startingPoint: StartingPointValue | '';
  cargoDetails: string;
  timing: TimingValue;
  context: string;
  consent: boolean;
}

export type FieldName = EnquiryFieldName;
export type FieldErrors = Partial<Record<FieldName, string>>;

export const EMPTY_VALUES: EnquiryValues = {
  fullName: '',
  workEmail: '',
  company: '',
  phone: '',
  origin: '',
  destination: '',
  startingPoint: '',
  cargoDetails: '',
  timing: '',
  context: '',
  consent: false,
};

export const FIELD_ORDER: FieldName[] = [
  'fullName',
  'workEmail',
  'company',
  'phone',
  'origin',
  'destination',
  'startingPoint',
  'cargoDetails',
  'timing',
  'context',
  'consent',
];

const SERVER_FIELDS: Record<FieldName, string> = {
  fullName: 'full_name',
  workEmail: 'work_email',
  company: 'company',
  phone: 'phone',
  origin: 'origin',
  destination: 'destination',
  startingPoint: 'starting_point',
  cargoDetails: 'cargo_details',
  timing: 'target_timing',
  context: 'additional_context',
  consent: 'consent',
};

export const LIMITS = { short: 120, email: 254, location: 160, long: 2000 };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[0-9\s().-]{6,24}$/;

export function validateEnquiry(values: EnquiryValues, m: ValidationMessages = enStrings.validation): FieldErrors {
  const errors: FieldErrors = {};
  const name = values.fullName.trim();
  const email = values.workEmail.trim();
  const company = values.company.trim();
  const phone = values.phone.trim();
  const origin = values.origin.trim();
  const destination = values.destination.trim();

  if (!name) errors.fullName = m.fullNameRequired;
  else if (name.length > LIMITS.short) errors.fullName = m.fullNameLong(LIMITS.short);

  if (!email) errors.workEmail = m.emailRequired;
  else if (!EMAIL.test(email) || email.length > LIMITS.email) errors.workEmail = m.emailInvalid;

  if (!company) errors.company = m.companyRequired;
  else if (company.length > LIMITS.short) errors.company = m.companyLong(LIMITS.short);

  if (phone) {
    const digits = phone.replace(/\D/g, '');
    if (!PHONE.test(phone) || digits.length < 6 || digits.length > 15) errors.phone = m.phoneInvalid;
  }

  if (!origin) errors.origin = m.originRequired;
  else if (origin.length > LIMITS.location) errors.origin = m.originLong(LIMITS.location);

  if (!destination) errors.destination = m.destinationRequired;
  else if (destination.length > LIMITS.location) errors.destination = m.destinationLong(LIMITS.location);

  if (!values.startingPoint) errors.startingPoint = m.startingPointRequired;

  if (values.cargoDetails.length > LIMITS.long) errors.cargoDetails = m.cargoLong;
  if (values.context.length > LIMITS.long) errors.context = m.contextLong;

  if (!values.consent) errors.consent = m.consentRequired;

  return errors;
}

/* ------------------------------------------------------------------
   Submission — first-party endpoint with CSRF, honeypot, timing, and a request ID.
------------------------------------------------------------------- */
export interface SubmitMeta {
  startedAt: number;
  honeypot: string;
  requestId: string;
  placement: string;
  siteId: string;
  locale: string;
  messages: ValidationMessages;
}

export type SubmitResult =
  | { ok: true; reference: string | null }
  | { ok: false; reason: 'validation'; errors: FieldErrors }
  | { ok: false; reason: 'network' | 'server' | 'session' | 'rate_limited' };

export function createRequestId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `fv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function readCsrfToken(): string {
  return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
}

function toPayload(values: EnquiryValues, meta: SubmitMeta) {
  const payload: Record<string, string | boolean | number> = {};
  for (const field of FIELD_ORDER) {
    const value = values[field];
    payload[SERVER_FIELDS[field]] = typeof value === 'string' ? value.trim() : value;
  }
  return {
    ...payload,
    website: meta.honeypot, // honeypot — must stay empty
    form_started_at: meta.startedAt,
    placement: meta.placement,
    site_id: meta.siteId,
    locale: meta.locale,
  };
}

function mapServerErrors(raw: unknown): FieldErrors {
  const errors: FieldErrors = {};
  if (!raw || typeof raw !== 'object') return errors;
  const source = raw as Record<string, unknown>;
  for (const field of FIELD_ORDER) {
    const message = source[SERVER_FIELDS[field]] ?? source[field];
    if (typeof message === 'string' && message) errors[field] = message;
    else if (Array.isArray(message) && typeof message[0] === 'string') errors[field] = message[0];
  }
  return errors;
}

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

/** Demo adapter used when no endpoint is configured — mirrors server behaviour. */
async function submitToDemoAdapter(values: EnquiryValues, meta: SubmitMeta): Promise<SubmitResult> {
  await wait(1100);
  if (meta.honeypot) return { ok: true, reference: null }; // silently discard automated submissions
  const errors = validateEnquiry(values, meta.messages);
  if (Object.keys(errors).length > 0) return { ok: false, reason: 'validation', errors };
  return { ok: true, reference: null };
}

export async function submitEnquiry(values: EnquiryValues, meta: SubmitMeta): Promise<SubmitResult> {
  const endpoint = siteConfig.enquiryEndpoint;
  if (!endpoint) return submitToDemoAdapter(values, meta);

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Accept-Language': meta.locale,
        'X-CSRF-Token': readCsrfToken(),
        'X-Request-ID': meta.requestId,
      },
      body: JSON.stringify(toPayload(values, meta)),
    });
  } catch {
    return { ok: false, reason: 'network' };
  }

  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (response.ok) return { ok: true, reference: typeof data.reference === 'string' ? data.reference : null };
  if (response.status === 400 || response.status === 422) {
    const errors = mapServerErrors(data.errors);
    return Object.keys(errors).length > 0 ? { ok: false, reason: 'validation', errors } : { ok: false, reason: 'server' };
  }
  if (response.status === 403 || response.status === 419) return { ok: false, reason: 'session' };
  if (response.status === 429) return { ok: false, reason: 'rate_limited' };
  return { ok: false, reason: 'server' };
}

/* ------------------------------------------------------------------
   Prefill store — lets service CTAs preselect the form's starting point.
------------------------------------------------------------------- */
export interface PrefillSnapshot {
  value: StartingPointValue | null;
  nonce: number;
}

let prefill: PrefillSnapshot = { value: null, nonce: 0 };
let consumedNonce = 0;
const prefillListeners = new Set<() => void>();

export function setPrefill(value: StartingPointValue) {
  prefill = { value, nonce: prefill.nonce + 1 };
  prefillListeners.forEach((listener) => listener());
}

export function subscribePrefill(listener: () => void) {
  prefillListeners.add(listener);
  return () => {
    prefillListeners.delete(listener);
  };
}

export const getPrefill = () => prefill;

/** Returns a pending prefill once; later calls return null until a new prefill is set. */
export function consumePrefill(snapshot: PrefillSnapshot): StartingPointValue | null {
  if (!snapshot.value || snapshot.nonce <= consumedNonce) return null;
  consumedNonce = snapshot.nonce;
  return snapshot.value;
}
