import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent, type ReactNode } from 'react';
import { siteConfig } from '../../config/site';
import type { EnquiryCopy } from '../../content/types';
import { track } from '../../lib/analytics';
import {
  EMPTY_VALUES,
  FIELD_ORDER,
  LIMITS,
  consumePrefill,
  createRequestId,
  getPrefill,
  submitEnquiry,
  subscribePrefill,
  validateEnquiry,
  type EnquiryValues,
  type FieldErrors,
  type FieldName,
  type TimingValue,
} from '../../lib/enquiry';
import { EN_STRINGS, type EnquiryStrings } from '../../lib/enquiry-locale';
import { Link } from '../../lib/router';
import { cn } from '../../utils/cn';
import { AlertIcon, ArrowRight, CheckIcon, ChevronDown, MailIcon, PhoneIcon, SpinnerIcon } from '../ui/Icons';

type Status = 'idle' | 'submitting' | 'success' | 'error';
type TextFieldName = 'fullName' | 'workEmail' | 'company' | 'phone' | 'origin' | 'destination';

interface AriaProps {
  'aria-describedby'?: string;
  'aria-invalid'?: true;
  'aria-required'?: true;
}

/** Visual accents so the form fits both the English (signal blue) and German (brick/petrol) templates. */
export interface FormTheme {
  accentText: string;
  /** Solid background used for the success check. */
  accentSolid: string;
  accentButton: string;
  radius: string;
}

const EN_THEME: FormTheme = {
  accentText: 'text-signal-700',
  accentSolid: 'bg-signal-600',
  accentButton: 'btn-primary',
  radius: 'rounded-[4px]',
};

const inputBase =
  'block w-full rounded-[3px] border bg-white px-3.5 py-3 text-base text-navy-900 placeholder:text-navy-400 shadow-[inset_0_1px_2px_rgba(10,27,51,0.06)] transition-colors hover:border-navy-400 focus-visible:outline-offset-1';

const inputClass = (invalid: boolean) =>
  cn(inputBase, invalid ? 'border-red-600 bg-red-50/40 hover:border-red-700' : 'border-mist-300');

function FieldShell({
  id,
  label,
  required,
  optionalTag,
  hint,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  required?: boolean;
  optionalTag: string;
  hint?: string;
  error?: string;
  children: (aria: AriaProps) => ReactNode;
  className?: string;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-[15px] font-semibold text-navy-900">
        <span>
          {label}
          {required && (
            <span aria-hidden="true" className="ml-0.5 text-red-700">
              *
            </span>
          )}
        </span>
        {!required && <span className="text-[13px] font-normal text-navy-500">{optionalTag}</span>}
      </label>
      {hint && (
        <p id={hintId} className="mt-1 text-[13px] leading-snug text-navy-500">
          {hint}
        </p>
      )}
      <div className="mt-2">
        {children({
          'aria-describedby': describedBy,
          'aria-invalid': error ? true : undefined,
          'aria-required': required ? true : undefined,
        })}
      </div>
      {error && (
        <p id={errorId} className="mt-2 flex items-start gap-1.5 text-sm font-medium text-red-700">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

function ContactAlternatives({ strings }: { strings: EnquiryStrings }) {
  const { email, phone } = siteConfig.contact;
  if (!email && !phone) {
    return <p className="mt-4 border-t border-red-200 pt-4 text-[15px] text-red-900">{strings.keepEntriesNote}</p>;
  }
  return (
    <div className="mt-4 border-t border-red-200 pt-4 text-[15px] text-red-900">
      <p className="font-semibold">{strings.contactHeading}</p>
      <ul className="mt-2 space-y-1">
        {email && (
          <li>
            <a href={`mailto:${email}`} className="inline-flex items-center gap-2 underline underline-offset-2">
              <MailIcon className="h-4 w-4" />
              {email}
            </a>
          </li>
        )}
        {phone && (
          <li>
            <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="inline-flex items-center gap-2 underline underline-offset-2">
              <PhoneIcon className="h-4 w-4" />
              {phone}
            </a>
          </li>
        )}
      </ul>
    </div>
  );
}

interface EnquiryFormProps {
  idPrefix: string;
  placement: 'home' | 'contact' | 'de-home' | 'fr-home' | 'es-home' | 'it-home' | 'nl-home';
  copy: EnquiryCopy;
  /** UI strings; defaults to English. */
  strings?: EnquiryStrings;
  /** Consent link target; defaults to the site privacy URL. */
  privacyUrl?: string;
  theme?: FormTheme;
}

export function EnquiryForm({
  idPrefix,
  placement,
  copy,
  strings = EN_STRINGS,
  privacyUrl = siteConfig.legal.privacy,
  theme = EN_THEME,
}: EnquiryFormProps) {
  const [values, setValues] = useState<EnquiryValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [failure, setFailure] = useState<'validation' | 'request' | null>(null);
  const [honeypot, setHoneypot] = useState('');
  const [reference, setReference] = useState<string | null>(null);
  const startedAt = useRef(Date.now());
  const startedTracked = useRef(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const prefill = useSyncExternalStore(subscribePrefill, getPrefill, getPrefill);

  // Apply a starting point chosen from a service CTA.
  useEffect(() => {
    const value = consumePrefill(prefill);
    if (!value) return;
    setValues((current) => ({ ...current, startingPoint: value }));
    setErrors((current) => {
      if (!current.startingPoint) return current;
      const next = { ...current };
      delete next.startingPoint;
      return next;
    });
  }, [prefill]);

  const fieldId = (name: FieldName) => `${idPrefix}-${name}`;
  const submitting = status === 'submitting';
  const messages = strings.messages;

  const updateError = (name: FieldName, message: string | undefined) =>
    setErrors((current) => {
      if (current[name] === message) return current;
      const next = { ...current };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });

  const setField = <K extends FieldName>(name: K, value: EnquiryValues[K]) => {
    const next = { ...values, [name]: value };
    setValues(next);
    if (errors[name]) updateError(name, validateEnquiry(next, messages)[name]);
  };

  // Format checks on blur, without nagging about empty fields before the first submit.
  const onBlurField = (name: FieldName) => {
    const raw = values[name];
    if (typeof raw === 'string' && raw.trim() === '' && !errors[name]) return;
    updateError(name, validateEnquiry(values, messages)[name]);
  };

  const focusField = (name: FieldName) => {
    const target =
      name === 'startingPoint'
        ? document.querySelector<HTMLInputElement>(`input[name="${idPrefix}-startingPoint"]:checked`) ??
          document.getElementById(fieldId(name))
        : document.getElementById(fieldId(name));
    target?.focus();
  };

  const onFirstFocus = () => {
    if (startedTracked.current) return;
    startedTracked.current = true;
    track('home_enquiry_started', { placement });
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const found = validateEnquiry(values, messages);
    const invalid = FIELD_ORDER.filter((name) => found[name]);
    if (invalid.length > 0) {
      setErrors(found);
      setFailure('validation');
      setStatus('error');
      track('home_enquiry_error', { placement, type: 'validation', fields: invalid.join(','), count: invalid.length });
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setErrors({});
    setFailure(null);
    setStatus('submitting');
    track('home_enquiry_submitted', { placement });

    const result = await submitEnquiry(
      values,
      { startedAt: startedAt.current, honeypot, requestId: createRequestId(), placement },
      messages,
    );

    if (result.ok) {
      setReference(siteConfig.enquiryEndpoint ? result.reference : null);
      setStatus('success');
      requestAnimationFrame(() => successRef.current?.focus());
      return;
    }

    if (result.reason === 'validation') {
      setErrors(result.errors);
      setFailure('validation');
    } else {
      setFailure('request');
    }
    setStatus('error');
    track('home_enquiry_error', { placement, type: result.reason });
    requestAnimationFrame(() => summaryRef.current?.focus());
  }

  const reset = () => {
    setValues(EMPTY_VALUES);
    setErrors({});
    setFailure(null);
    setStatus('idle');
    setReference(null);
    startedAt.current = Date.now();
    requestAnimationFrame(() => document.getElementById(fieldId('fullName'))?.focus());
  };

  if (status === 'success') {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className={cn(
          'border border-mist-300 bg-white p-8 shadow-[0_24px_48px_-28px_rgba(10,27,51,0.35)] outline-none sm:p-10',
          theme.radius,
        )}
      >
        <span className={cn('grid h-12 w-12 place-items-center rounded-full text-white', theme.accentSolid)}>
          <CheckIcon className="h-6 w-6" />
        </span>
        <h3 className="mt-6 font-display text-[1.9rem] font-semibold leading-tight text-navy-900">{copy.success_title}</h3>
        <p className="mt-3 text-lg leading-relaxed text-navy-600">{copy.success_body}</p>
        {reference && (
          <p className="mt-4 font-mono text-sm text-navy-500">
            {strings.referenceLabel}: {reference}
          </p>
        )}
        <button
          type="button"
          onClick={reset}
          className={cn(
            'mt-8 inline-flex items-center gap-1.5 font-semibold underline decoration-2 underline-offset-4',
            theme.accentText,
          )}
        >
          {strings.sendAnother}
        </button>
      </div>
    );
  }

  const errorEntries = FIELD_ORDER.filter((name) => errors[name]).map((name) => [name, errors[name] as string] as const);
  const showSummary = status === 'error' && (failure === 'request' || errorEntries.length > 0);

  const textField = (
    name: TextFieldName,
    options: {
      type?: string;
      autoComplete?: string;
      required?: boolean;
      placeholder?: string;
      maxLength?: number;
      inputMode?: 'text' | 'email' | 'tel';
    },
  ) => (
    <FieldShell
      id={fieldId(name)}
      label={strings.labels[name]}
      required={options.required}
      optionalTag={strings.optionalTag}
      hint={strings.hints[name]}
      error={errors[name]}
    >
      {(aria) => (
        <input
          id={fieldId(name)}
          name={name}
          type={options.type ?? 'text'}
          inputMode={options.inputMode}
          autoComplete={options.autoComplete}
          placeholder={options.placeholder}
          maxLength={options.maxLength}
          value={values[name]}
          onChange={(event) => setField(name, event.target.value)}
          onBlur={() => onBlurField(name)}
          className={inputClass(Boolean(errors[name]))}
          {...aria}
        />
      )}
    </FieldShell>
  );

  const textArea = (name: 'cargoDetails' | 'context') => (
    <FieldShell
      id={fieldId(name)}
      label={strings.labels[name]}
      optionalTag={strings.optionalTag}
      hint={strings.hints[name]}
      error={errors[name]}
    >
      {(aria) => (
        <>
          <textarea
            id={fieldId(name)}
            name={name}
            rows={4}
            value={values[name]}
            onChange={(event) => setField(name, event.target.value)}
            onBlur={() => onBlurField(name)}
            className={cn(inputClass(Boolean(errors[name])), 'min-h-28 resize-y leading-relaxed')}
            {...aria}
          />
          <p className={cn('mt-1 text-right text-[12px]', values[name].length > LIMITS.long ? 'text-red-700' : 'text-navy-500')}>
            {values[name].length.toLocaleString(strings.numberLocale)} / {LIMITS.long.toLocaleString(strings.numberLocale)}
          </p>
        </>
      )}
    </FieldShell>
  );

  const startingPointError = errors.startingPoint;
  const startingHintId = `${fieldId('startingPoint')}-hint`;
  const startingErrorId = `${fieldId('startingPoint')}-error`;

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      onFocusCapture={onFirstFocus}
      aria-busy={submitting || undefined}
      aria-label={copy.button}
      className={cn(
        'relative border border-mist-300 bg-white p-5 shadow-[0_1px_0_rgba(10,27,51,0.04),0_32px_64px_-36px_rgba(10,27,51,0.45)] sm:p-8 lg:p-10',
        theme.radius,
      )}
    >
      {showSummary && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="mb-8 rounded-[3px] border border-red-200 border-l-4 border-l-red-600 bg-red-50 p-5 outline-none"
        >
          <p className="flex items-start gap-2 font-semibold leading-snug text-red-900">
            <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{copy.error}</span>
          </p>
          {errorEntries.length > 0 && (
            <ul className="mt-3 space-y-1.5 pl-7 text-[15px] text-red-900">
              {errorEntries.map(([name, message]) => (
                <li key={name}>
                  <button
                    type="button"
                    onClick={() => focusField(name)}
                    className="text-left underline underline-offset-2 hover:no-underline"
                  >
                    <span className="font-semibold">{strings.labels[name]}:</span> {message}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <ContactAlternatives strings={strings} />
        </div>
      )}

      <p className="text-[13px] text-navy-500">{strings.requiredNote}</p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {textField('fullName', { autoComplete: 'name', required: true, maxLength: 200 })}
        {textField('workEmail', {
          type: 'email',
          inputMode: 'email',
          autoComplete: 'email',
          required: true,
          placeholder: strings.emailPlaceholder,
          maxLength: 300,
        })}
        {textField('company', { autoComplete: 'organization', required: true, maxLength: 200 })}
        {textField('phone', {
          type: 'tel',
          inputMode: 'tel',
          autoComplete: 'tel',
          placeholder: strings.phonePlaceholder,
          maxLength: 40,
        })}
        {textField('origin', { required: true, maxLength: 240 })}
        {textField('destination', { required: true, maxLength: 240 })}
      </div>

      <fieldset
        role="radiogroup"
        aria-required="true"
        aria-invalid={startingPointError ? true : undefined}
        aria-describedby={[startingHintId, startingPointError ? startingErrorId : ''].filter(Boolean).join(' ')}
        className="mt-8"
      >
        <legend className="text-[15px] font-semibold text-navy-900">
          {strings.labels.startingPoint}
          <span aria-hidden="true" className="ml-0.5 text-red-700">
            *
          </span>
        </legend>
        <p id={startingHintId} className="mt-1 text-[13px] leading-snug text-navy-500">
          {strings.startingHint}
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {strings.startingPoints.map((option, index) => (
            <label
              key={option.value}
              className={cn(
                'flex min-h-12 cursor-pointer items-center gap-3 rounded-[3px] border bg-white px-3.5 py-2.5 text-[15px] text-navy-800 transition-colors hover:border-navy-400',
                'has-checked:border-current has-checked:font-semibold has-checked:text-navy-900',
                startingPointError ? 'border-red-600' : 'border-mist-300',
              )}
            >
              <input
                id={index === 0 ? fieldId('startingPoint') : undefined}
                type="radio"
                name={`${idPrefix}-startingPoint`}
                value={option.value}
                checked={values.startingPoint === option.value}
                onChange={() => setField('startingPoint', option.value)}
                className={cn('h-4 w-4 shrink-0', theme.accentText, 'accent-current')}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        {startingPointError && (
          <p id={startingErrorId} className="mt-2 flex items-start gap-1.5 text-sm font-medium text-red-700">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{startingPointError}</span>
          </p>
        )}
      </fieldset>

      <div className="mt-8 grid gap-6">
        {textArea('cargoDetails')}
        <FieldShell
          id={fieldId('timing')}
          label={strings.labels.timing}
          optionalTag={strings.optionalTag}
          className="sm:max-w-sm"
        >
          {(aria) => (
            <div className="relative">
              <select
                id={fieldId('timing')}
                name="timing"
                value={values.timing}
                onChange={(event) => setField('timing', event.target.value as TimingValue)}
                className={cn(inputClass(false), 'appearance-none pr-10')}
                {...aria}
              >
                <option value="">{strings.timingPlaceholder}</option>
                {strings.timingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-500" />
            </div>
          )}
        </FieldShell>
        {textArea('context')}
      </div>

      {/* Honeypot: hidden from people and assistive technology; automated submissions fill it. */}
      <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
        <label htmlFor={`${idPrefix}-website`}>{strings.honeypotLabel}</label>
        <input
          id={`${idPrefix}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      <div className="mt-8 border-t border-mist-200 pt-6">
        <div className="flex items-start gap-3">
          <input
            id={fieldId('consent')}
            type="checkbox"
            checked={values.consent}
            onChange={(event) => setField('consent', event.target.checked)}
            aria-required="true"
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? `${fieldId('consent')}-error` : undefined}
            className={cn('mt-0.5 h-5 w-5 shrink-0 accent-current', theme.accentText)}
          />
          <label htmlFor={fieldId('consent')} className="text-[15px] leading-relaxed text-navy-700">
            {copy.consent_prefix}{' '}
            <Link
              to={privacyUrl}
              newTab
              className={cn('font-semibold underline underline-offset-2', theme.accentText)}
            >
              {copy.consent_link_label}
              <span className="sr-only"> {strings.consentNewTabSr}</span>
            </Link>
            {copy.consent_suffix}
            <span aria-hidden="true" className="ml-0.5 text-red-700">
              *
            </span>
          </label>
        </div>
        {errors.consent && (
          <p id={`${fieldId('consent')}-error`} className="mt-2 flex items-start gap-1.5 pl-8 text-sm font-medium text-red-700">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errors.consent}</span>
          </p>
        )}
      </div>

      <div className="mt-8">
        <button
          type="submit"
          aria-disabled={submitting || undefined}
          className={cn('btn w-full px-4 text-base sm:w-auto sm:px-7', theme.accentButton, submitting && 'cursor-progress')}
        >
          {submitting ? (
            <>
              <SpinnerIcon className="h-5 w-5 motion-safe:animate-spin" />
              {copy.loading}
            </>
          ) : (
            <>
              {copy.button}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
        <p aria-live="polite" className="sr-only">
          {submitting ? copy.loading : ''}
        </p>
      </div>
    </form>
  );
}
