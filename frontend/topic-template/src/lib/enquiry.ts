import { cmsContext } from './cms';
import { siteConfig } from '../config/site';
import type { StartingPointValue } from '../content/types';

/* ------------------------------------------------------------------
   Enquiry schema — mirrors the server-side validation rules.
------------------------------------------------------------------- */
export const STARTING_POINTS: ReadonlyArray<{ value: StartingPointValue; label: string }> = [
  { value: 'product-sourcing', label: 'Product sourcing' },
  { value: 'ocean-freight', label: 'Ocean freight' },
  { value: 'air-freight', label: 'Air freight' },
  { value: 'warehousing-fulfillment', label: 'Warehousing & fulfillment' },
  { value: 'packaging-branding', label: 'Packaging & branding' },
  { value: 'not-sure', label: 'Not sure yet' },
];

export type TimingValue = '' | 'ready-now' | 'this-month' | 'planning-ahead';

export const TIMING_OPTIONS: ReadonlyArray<{ value: Exclude<TimingValue, ''>; label: string }> = [
  { value: 'ready-now', label: 'Ready now' },
  { value: 'this-month', label: 'This month' },
  { value: 'planning-ahead', label: 'Planning ahead' },
];

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

export type FieldName = keyof EnquiryValues;
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

export const FIELD_LABELS: Record<FieldName, string> = {
  fullName: 'Full name',
  workEmail: 'Work email',
  company: 'Company',
  phone: 'Phone',
  origin: 'Origin',
  destination: 'Destination',
  startingPoint: 'Starting point',
  cargoDetails: 'Cargo or product details',
  timing: 'Target timing',
  context: 'Additional context',
  consent: 'Consent',
};

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

/** Localizable validation messages; the German site provides its own bundle. */
export interface ValidationMessages {
  fullNameRequired: string;
  fullNameLong: string;
  emailRequired: string;
  emailInvalid: string;
  companyRequired: string;
  companyLong: string;
  phoneInvalid: string;
  originRequired: string;
  originLong: string;
  destinationRequired: string;
  destinationLong: string;
  startingPointRequired: string;
  longText: string;
  consentRequired: string;
}

export const EN_MESSAGES: ValidationMessages = {
  fullNameRequired: 'Enter your full name so a specialist knows who to reply to.',
  fullNameLong: `Shorten your name to ${LIMITS.short} characters or fewer.`,
  emailRequired: 'Enter your work email so we can send your plan.',
  emailInvalid: 'Enter a complete email address, for example name@company.com.',
  companyRequired: 'Enter your company name.',
  companyLong: `Shorten the company name to ${LIMITS.short} characters or fewer.`,
  phoneInvalid: 'Enter the number with its country code, such as +1 followed by the number, or leave this field blank.',
  originRequired: 'Enter where the goods start: a country, city, or port.',
  originLong: `Keep the origin under ${LIMITS.location} characters.`,
  destinationRequired: 'Enter where the goods need to go: a country, city, port, or ZIP code.',
  destinationLong: `Keep the destination under ${LIMITS.location} characters.`,
  startingPointRequired: 'Choose a starting point. Pick “Not sure yet” if you would like us to suggest one.',
  longText: 'Keep this field under 2,000 characters. You can share more in the follow-up.',
  consentRequired: 'Confirm that you agree to the privacy policy so we can respond to your request.',
};

export function validateEnquiry(values: EnquiryValues, m: ValidationMessages = EN_MESSAGES): FieldErrors {
  const errors: FieldErrors = {};
  const name = values.fullName.trim();
  const email = values.workEmail.trim();
  const company = values.company.trim();
  const phone = values.phone.trim();
  const origin = values.origin.trim();
  const destination = values.destination.trim();

  if (!name) errors.fullName = m.fullNameRequired;
  else if (name.length > LIMITS.short) errors.fullName = m.fullNameLong;

  if (!email) errors.workEmail = m.emailRequired;
  else if (!EMAIL.test(email) || email.length > LIMITS.email) errors.workEmail = m.emailInvalid;

  if (!company) errors.company = m.companyRequired;
  else if (company.length > LIMITS.short) errors.company = m.companyLong;

  if (phone) {
    const digits = phone.replace(/\D/g, '');
    if (!PHONE.test(phone) || digits.length < 6 || digits.length > 15) errors.phone = m.phoneInvalid;
  }

  if (!origin) errors.origin = m.originRequired;
  else if (origin.length > LIMITS.location) errors.origin = m.originLong;

  if (!destination) errors.destination = m.destinationRequired;
  else if (destination.length > LIMITS.location) errors.destination = m.destinationLong;

  if (!values.startingPoint) errors.startingPoint = m.startingPointRequired;

  if (values.cargoDetails.length > LIMITS.long) errors.cargoDetails = m.longText;
  if (values.context.length > LIMITS.long) errors.context = m.longText;

  if (!values.consent) errors.consent = m.consentRequired;

  return errors;
}

/* ------------------------------------------------------------------
   Topic-page extras — per-page context fields and reference attachments.
   Optional everywhere; enforced client-side and mirrored by the endpoint.
------------------------------------------------------------------- */
export interface TopicContextField {
  name: string;
  label: string;
  hint?: string;
}

export interface AttachmentMeta {
  name: string;
  size: number;
  type: string;
}

export const CONTEXT_LIMIT = 500;

export const ATTACHMENT_RULES = {
  maxFiles: 5,
  maxBytes: 10 * 1024 * 1024,
  extensions: ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'dwg', 'dxf'],
} as const;

export function validateContextFields(
  fields: TopicContextField[],
  values: Record<string, string>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const value = (values[field.name] ?? '').trim();
    if (value.length > CONTEXT_LIMIT) {
      errors[field.name] = `Keep this field under ${CONTEXT_LIMIT} characters. You can share more in the follow-up.`;
    }
  }
  return errors;
}

export function validateAttachmentFiles(
  existing: File[],
  incoming: File[],
  messages?: { unsupported: (name: string) => string; tooLarge: (name: string) => string; tooMany: (maximum: number) => string },
): { accepted: File[]; error: string | null } {
  const accepted: File[] = [];
  const problems: string[] = [];
  for (const file of incoming) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!(ATTACHMENT_RULES.extensions as readonly string[]).includes(ext)) {
      problems.push(messages?.unsupported(file.name) ?? `“${file.name}” is not a supported file type.`);
      continue;
    }
    if (file.size > ATTACHMENT_RULES.maxBytes) {
      problems.push(messages?.tooLarge(file.name) ?? `“${file.name}” is larger than 10 MB.`);
      continue;
    }
    if (existing.length + accepted.length >= ATTACHMENT_RULES.maxFiles) {
      problems.push(messages?.tooMany(ATTACHMENT_RULES.maxFiles) ?? `Only ${ATTACHMENT_RULES.maxFiles} files can be attached.`);
      continue;
    }
    accepted.push(file);
  }
  return { accepted, error: problems.length > 0 ? problems.join(' ') : null };
}

/* ------------------------------------------------------------------
   Submission — first-party endpoint with CSRF, honeypot, timing, and a request ID.
------------------------------------------------------------------- */
export interface SubmitMeta {
  startedAt: number;
  honeypot: string;
  requestId: string;
  placement: string;
  /** Optional per-page context answers (topic pages). */
  context?: Record<string, string>;
  /** Reference-file metadata (topic pages). Binaries travel via a separate upload handshake. */
  attachments?: AttachmentMeta[];
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

function toPayload(values: EnquiryValues, meta: SubmitMeta): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const field of FIELD_ORDER) {
    const value = values[field];
    payload[SERVER_FIELDS[field]] = typeof value === 'string' ? value.trim() : value;
  }
  const context: Record<string, string> = {};
  for (const [key, value] of Object.entries(meta.context ?? {})) {
    const trimmed = value.trim();
    if (trimmed) context[key] = trimmed;
  }
  return {
    ...payload,
    website: meta.honeypot, // honeypot — must stay empty
    form_started_at: meta.startedAt,
    placement: meta.placement,
    route: cmsContext()?.route,
    form_token: cmsContext()?.formToken,
    site_id: Number(siteConfig.siteId),
    locale: siteConfig.locale,
    // Only non-empty answers travel; the endpoint mirrors CONTEXT_LIMIT.
    ...(Object.keys(context).length > 0 ? { page_context: { placement: meta.placement, fields: context } } : {}),
    // Metadata only — binary uploads use a separate endpoint handshake in production.
    ...(meta.attachments && meta.attachments.length > 0 ? { attachments: meta.attachments } : {}),
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

export async function submitEnquiry(
  values: EnquiryValues,
  meta: SubmitMeta,
  messages: ValidationMessages = EN_MESSAGES,
): Promise<SubmitResult> {
  const endpoint = siteConfig.enquiryEndpoint;
  const errors = validateEnquiry(values, messages);
  if (Object.keys(errors).length > 0) return { ok: false, reason: 'validation', errors };
  if (!endpoint) return { ok: false, reason: 'server' };

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
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
