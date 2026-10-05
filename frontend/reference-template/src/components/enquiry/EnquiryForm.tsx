import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent, type ReactNode } from 'react';
import { siteConfig } from '../../config/site';
import type { EnquiryCopy } from '../../content/types';
import { track } from '../../lib/analytics';
import { enStrings, type EnquiryStrings } from '../../lib/enquiry-i18n';
import {
  EMPTY_VALUES,
  FIELD_ORDER,
  LIMITS,
  STARTING_POINT_VALUES,
  TIMING_VALUES,
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

/** Visual theme: English "Pacific Operations", German "Hanse Präzision" or French "Atelier Maritime". */
export type FormTheme = 'pacific' | 'hanse' | 'atelier' | 'mediterraneo' | 'grafica';

const THEMES: Record<
  FormTheme,
  {
    shell: string;
    input: string;
    inputInvalid: string;
    inputValid: string;
    label: string;
    hint: string;
    required: string;
    radio: string;
    radioChecked: string;
    accent: string;
    accentBg: string;
    link: string;
    button: string;
    textLink: string;
    successIcon: string;
    divider: string;
    successShell: string;
    successTitle: string;
    successBody: string;
    summary: string;
    consentText: string;
    radioInvalid: string;
  }
> = {
  pacific: {
    successTitle: 'font-display text-navy-900',
    successBody: 'text-navy-600',
    summary: 'rounded-[3px] border border-red-200 border-l-red-600 bg-red-50 text-red-900',
    consentText: 'text-navy-700',
    radioInvalid: 'border-red-600',
    shell:
      'relative rounded-[4px] border border-mist-300 bg-white p-5 shadow-[0_1px_0_rgba(10,27,51,0.04),0_32px_64px_-36px_rgba(10,27,51,0.45)] sm:p-8 lg:p-10',
    input:
      'block w-full rounded-[3px] border bg-white px-3.5 py-3 text-base text-navy-900 placeholder:text-navy-400 shadow-[inset_0_1px_2px_rgba(10,27,51,0.06)] transition-colors hover:border-navy-400 focus-visible:outline-offset-1',
    inputInvalid: 'border-red-600 bg-red-50/40 hover:border-red-700',
    inputValid: 'border-mist-300',
    label: 'text-navy-900',
    hint: 'text-navy-500',
    required: 'text-red-700',
    radio:
      'flex min-h-12 cursor-pointer items-center gap-3 rounded-[3px] border bg-white px-3.5 py-2.5 text-[15px] text-navy-800 transition-colors hover:border-navy-400',
    radioChecked: 'has-checked:border-signal-600 has-checked:bg-signal-600/[0.06] has-checked:font-semibold has-checked:text-navy-900',
    accent: 'accent-signal-600',
    accentBg: 'bg-signal-600',
    link: 'font-semibold text-signal-700 underline underline-offset-2 hover:text-signal-800',
    button: 'btn btn-primary w-full px-4 text-base sm:w-auto sm:px-7',
    textLink: 'text-link',
    successIcon: 'bg-signal-600',
    divider: 'border-mist-200',
    successShell: 'rounded-[4px] border border-mist-300 bg-white p-8 shadow-[0_24px_48px_-28px_rgba(10,27,51,0.35)] sm:p-10',
  },
  hanse: {
    successTitle: 'font-de-display text-anthrazit-900',
    successBody: 'text-anthrazit-600',
    summary: 'rounded-none border border-rose-200 border-l-rose-800 bg-rose-50 text-rose-900',
    consentText: 'text-anthrazit-700',
    radioInvalid: 'border-rose-800',
    shell: 'relative border border-anthrazit-900 bg-white p-5 sm:p-8 lg:p-10',
    input:
      'block w-full rounded-none border bg-white px-3.5 py-3 text-base text-anthrazit-900 placeholder:text-anthrazit-400 transition-colors hover:border-anthrazit-700 focus-visible:outline-offset-1',
    inputInvalid: 'border-rose-800 bg-rose-50/50 hover:border-rose-900',
    inputValid: 'border-anthrazit-300',
    label: 'text-anthrazit-900',
    hint: 'text-anthrazit-600',
    required: 'text-rose-800',
    radio:
      'flex min-h-12 cursor-pointer items-center gap-3 rounded-none border bg-white px-3.5 py-2.5 text-[15px] text-anthrazit-800 transition-colors hover:border-anthrazit-700',
    radioChecked: 'has-checked:border-enzian-700 has-checked:bg-enzian-100 has-checked:font-semibold has-checked:text-anthrazit-900',
    accent: 'accent-enzian-600',
    accentBg: 'bg-enzian-700',
    link: 'font-semibold text-enzian-700 underline underline-offset-2 hover:text-enzian-800',
    button: 'de-btn de-btn-primary w-full px-4 text-base sm:w-auto sm:px-7',
    textLink: 'de-link',
    successIcon: 'bg-enzian-700',
    divider: 'border-anthrazit-200',
    successShell: 'border border-anthrazit-900 bg-white p-8 sm:p-10',
  },
  atelier: {
    successTitle: 'font-fr-serif text-encre-900',
    successBody: 'text-encre-600',
    summary: 'rounded-[6px] border border-red-200 border-l-red-700 bg-red-50 text-red-900',
    consentText: 'text-encre-700',
    radioInvalid: 'border-red-700',
    shell: 'relative rounded-[10px] border border-lin-300 bg-white p-5 shadow-[0_24px_48px_-32px_rgba(28,31,39,0.35)] sm:p-8 lg:p-10',
    input:
      'block w-full rounded-[6px] border bg-white px-3.5 py-3 text-base text-encre-900 placeholder:text-encre-400 transition-colors hover:border-encre-600 focus-visible:outline-offset-1',
    inputInvalid: 'border-red-700 bg-red-50/40 hover:border-red-800',
    inputValid: 'border-lin-300',
    label: 'text-encre-900',
    hint: 'text-encre-500',
    required: 'text-red-700',
    radio:
      'flex min-h-12 cursor-pointer items-center gap-3 rounded-[6px] border bg-white px-3.5 py-2.5 text-[15px] text-encre-800 transition-colors hover:border-encre-600',
    radioChecked: 'has-checked:border-outremer-700 has-checked:bg-outremer-100 has-checked:font-semibold has-checked:text-encre-900',
    accent: 'accent-outremer-600',
    accentBg: 'bg-outremer-700',
    link: 'font-semibold text-outremer-700 underline underline-offset-2 hover:text-outremer-800',
    button: 'fr-btn fr-btn-primary w-full px-4 text-base sm:w-auto sm:px-7',
    textLink: 'fr-link',
    successIcon: 'bg-outremer-700',
    divider: 'border-lin-200',
    successShell: 'rounded-[10px] border border-lin-300 bg-white p-8 sm:p-10',
  },
  mediterraneo: {
    successTitle: 'font-es font-extrabold tracking-[-0.02em] text-carbon-900',
    successBody: 'text-carbon-600',
    summary: 'rounded-lg border border-red-200 border-l-red-700 bg-red-50 text-red-900',
    consentText: 'text-carbon-700',
    radioInvalid: 'border-red-700',
    shell: 'relative rounded-xl border border-carbon-900/10 bg-white p-5 shadow-[0_24px_48px_-32px_rgba(11,48,39,0.45)] sm:p-8 lg:p-10',
    input:
      'block w-full rounded-md border bg-white px-3.5 py-3 text-base text-carbon-900 placeholder:text-carbon-500 transition-colors hover:border-carbon-600 focus-visible:outline-offset-1',
    inputInvalid: 'border-red-700 bg-red-50/40 hover:border-red-800',
    inputValid: 'border-carbon-300',
    label: 'text-carbon-900',
    hint: 'text-carbon-600',
    required: 'text-red-700',
    radio:
      'flex min-h-12 cursor-pointer items-center gap-3 rounded-md border bg-white px-3.5 py-2.5 text-[15px] text-carbon-800 transition-colors hover:border-carbon-600',
    radioChecked: 'has-checked:border-pino-700 has-checked:bg-pino-100 has-checked:font-semibold has-checked:text-carbon-900',
    accent: 'accent-pino-700',
    accentBg: 'bg-pino-700',
    link: 'font-semibold text-mar-700 underline underline-offset-2 hover:text-mar-800',
    button: 'es-btn es-btn-primary w-full px-4 text-base sm:w-auto sm:px-7',
    textLink: 'es-link',
    successIcon: 'bg-pino-700',
    divider: 'border-carbon-200',
    successShell: 'rounded-xl border border-carbon-900/10 bg-white p-8 sm:p-10',
  },
  grafica: {
    successTitle: 'font-it-display text-grafite-900',
    successBody: 'text-grafite-600',
    summary: 'rounded-none border border-rosso-500/40 border-l-rosso-600 bg-rosso-100 text-rosso-700',
    consentText: 'text-grafite-700',
    radioInvalid: 'border-rosso-600',
    shell: 'relative border border-grafite-900 bg-white p-5 sm:p-8 lg:p-10',
    input:
      'block w-full rounded-none border-0 border-b bg-transparent px-0 py-3 text-base text-grafite-900 placeholder:text-grafite-400 transition-colors hover:border-grafite-900 focus-visible:outline-offset-4',
    inputInvalid: 'border-rosso-600',
    inputValid: 'border-grafite-300',
    label: 'text-grafite-900',
    hint: 'text-grafite-500',
    required: 'text-rosso-600',
    radio:
      'flex min-h-12 cursor-pointer items-center gap-3 rounded-none border bg-white px-3.5 py-2.5 text-[15px] text-grafite-800 transition-colors hover:border-grafite-900',
    radioChecked: 'has-checked:border-grafite-900 has-checked:bg-grafite-900 has-checked:font-semibold has-checked:text-white',
    accent: 'accent-ottanio-700',
    accentBg: 'bg-ottanio-700',
    link: 'font-semibold text-ottanio-700 underline underline-offset-2 hover:text-ottanio-800',
    button: 'it-btn it-btn-primary w-full px-4 text-base sm:w-auto sm:px-7',
    textLink: 'it-link',
    successIcon: 'bg-ottanio-700',
    divider: 'border-grafite-200',
    successShell: 'border border-grafite-900 bg-white p-8 sm:p-10',
  },
};

function FieldShell({
  id,
  label,
  required,
  hint,
  error,
  children,
  className,
  strings,
  theme,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: (aria: AriaProps) => ReactNode;
  className?: string;
  strings: EnquiryStrings;
  theme: (typeof THEMES)[FormTheme];
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className={cn('flex items-baseline justify-between gap-3 text-[15px] font-semibold', theme.label)}>
        <span>
          {label}
          {required && (
            <span aria-hidden="true" className={cn('ml-0.5', theme.required)}>
              *
            </span>
          )}
        </span>
        {!required && <span className={cn('text-[13px] font-normal', theme.hint)}>{strings.optional}</span>}
      </label>
      {hint && (
        <p id={hintId} className={cn('mt-1 text-[13px] leading-snug', theme.hint)}>
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
        <p id={errorId} className={cn('mt-2 flex items-start gap-1.5 text-sm font-medium', theme.required)}>
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
    return <p className="mt-4 border-t border-current/20 pt-4 text-[15px]">{strings.stillInForm}</p>;
  }
  return (
    <div className="mt-4 border-t border-current/20 pt-4 text-[15px]">
      <p className="font-semibold">{strings.contactDetails}</p>
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
  placement: 'home' | 'contact';
  copy: EnquiryCopy;
  strings?: EnquiryStrings;
  theme?: FormTheme;
  privacyUrl: string;
  siteId: string;
  locale: string;
}

export function EnquiryForm({
  idPrefix,
  placement,
  copy,
  strings = enStrings,
  theme: themeName = 'pacific',
  privacyUrl,
  siteId,
  locale,
}: EnquiryFormProps) {
  const t = THEMES[themeName];
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
  const validate = (next: EnquiryValues) => validateEnquiry(next, strings.validation);
  const inputClass = (invalid: boolean) => cn(t.input, invalid ? t.inputInvalid : t.inputValid);

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
    if (errors[name]) updateError(name, validate(next)[name]);
  };

  // Format checks on blur, without nagging about empty fields before the first submit.
  const onBlurField = (name: FieldName) => {
    const raw = values[name];
    if (typeof raw === 'string' && raw.trim() === '' && !errors[name]) return;
    updateError(name, validate(values)[name]);
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

    const found = validate(values);
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

    const result = await submitEnquiry(values, {
      startedAt: startedAt.current,
      honeypot,
      requestId: createRequestId(),
      placement,
      siteId,
      locale,
      messages: strings.validation,
    });

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
      <div ref={successRef} tabIndex={-1} role="status" className={cn(t.successShell, 'outline-none')}>
        <span className={cn('grid h-12 w-12 place-items-center rounded-full text-white', t.successIcon)}>
          <CheckIcon className="h-6 w-6" />
        </span>
        <h3 className={cn('mt-6 text-[1.9rem] font-semibold leading-tight', t.successTitle)}>{copy.success_title}</h3>
        <p className={cn('mt-3 text-lg leading-relaxed', t.successBody)}>{copy.success_body}</p>
        {reference && (
          <p className={cn('mt-4 font-mono text-sm', t.hint)}>
            {strings.reference} {reference}
          </p>
        )}
        <button type="button" onClick={reset} className={cn(t.textLink, 'mt-8')}>
          {strings.sendAnother}
        </button>
      </div>
    );
  }

  const errorEntries = FIELD_ORDER.filter((name) => errors[name]).map((name) => [name, errors[name] as string] as const);
  const showSummary = status === 'error' && (failure === 'request' || errorEntries.length > 0);
  const f = strings.fields;

  const textField = (
    name: TextFieldName,
    options: { type?: string; autoComplete?: string; required?: boolean; maxLength?: number; inputMode?: 'text' | 'email' | 'tel' },
  ) => (
    <FieldShell
      id={fieldId(name)}
      label={f[name].label}
      required={options.required}
      hint={f[name].hint}
      error={errors[name]}
      strings={strings}
      theme={t}
    >
      {(aria) => (
        <input
          id={fieldId(name)}
          name={name}
          type={options.type ?? 'text'}
          inputMode={options.inputMode}
          autoComplete={options.autoComplete}
          placeholder={f[name].placeholder}
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
    <FieldShell id={fieldId(name)} label={f[name].label} hint={f[name].hint} error={errors[name]} strings={strings} theme={t}>
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
          <p className={cn('mt-1 text-right text-[12px]', values[name].length > LIMITS.long ? t.required : t.hint)}>
            {values[name].length.toLocaleString(strings.locale)} / {LIMITS.long.toLocaleString(strings.locale)}
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
      aria-label={strings.formLabel}
      className={t.shell}
    >
      {showSummary && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className={cn('mb-8 border-l-4 p-5 outline-none', t.summary)}
        >
          <p className="flex items-start gap-2 font-semibold leading-snug">
            <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{copy.error}</span>
          </p>
          {errorEntries.length > 0 && (
            <ul className="mt-3 space-y-1.5 pl-7 text-[15px]">
              {errorEntries.map(([name, message]) => (
                <li key={name}>
                  <button type="button" onClick={() => focusField(name)} className="text-left underline underline-offset-2 hover:no-underline">
                    <span className="font-semibold">{f[name].label}:</span> {message}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <ContactAlternatives strings={strings} />
        </div>
      )}

      <p className={cn('text-[13px]', t.hint)}>
        {strings.requiredBefore}{' '}
        <span aria-hidden="true" className={t.required}>
          *
        </span>
        <span className="sr-only">{strings.requiredAsterisk}</span> {strings.requiredAfter}
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {textField('fullName', { autoComplete: 'name', required: true, maxLength: 200 })}
        {textField('workEmail', { type: 'email', inputMode: 'email', autoComplete: 'email', required: true, maxLength: 300 })}
        {textField('company', { autoComplete: 'organization', required: true, maxLength: 200 })}
        {textField('phone', { type: 'tel', inputMode: 'tel', autoComplete: 'tel', maxLength: 40 })}
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
        <legend className={cn('text-[15px] font-semibold', t.label)}>
          {f.startingPoint.label}
          <span aria-hidden="true" className={cn('ml-0.5', t.required)}>
            *
          </span>
        </legend>
        <p id={startingHintId} className={cn('mt-1 text-[13px] leading-snug', t.hint)}>
          {f.startingPoint.hint}
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {STARTING_POINT_VALUES.map((value, index) => (
            <label
              key={value}
              className={cn(t.radio, t.radioChecked, startingPointError ? t.radioInvalid : t.inputValid)}
            >
              <input
                id={index === 0 ? fieldId('startingPoint') : undefined}
                type="radio"
                name={`${idPrefix}-startingPoint`}
                value={value}
                checked={values.startingPoint === value}
                onChange={() => setField('startingPoint', value)}
                className={cn('h-4 w-4 shrink-0', t.accent)}
              />
              <span>{strings.startingPoints[value]}</span>
            </label>
          ))}
        </div>
        {startingPointError && (
          <p id={startingErrorId} className={cn('mt-2 flex items-start gap-1.5 text-sm font-medium', t.required)}>
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{startingPointError}</span>
          </p>
        )}
      </fieldset>

      <div className="mt-8 grid gap-6">
        {textArea('cargoDetails')}
        <FieldShell id={fieldId('timing')} label={f.timing.label} className="sm:max-w-sm" strings={strings} theme={t}>
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
                {TIMING_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {strings.timing[value]}
                  </option>
                ))}
              </select>
              <ChevronDown className={cn('pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2', t.hint)} />
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

      <div className={cn('mt-8 border-t pt-6', t.divider)}>
        <div className="flex items-start gap-3">
          <input
            id={fieldId('consent')}
            type="checkbox"
            checked={values.consent}
            onChange={(event) => setField('consent', event.target.checked)}
            aria-required="true"
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? `${fieldId('consent')}-error` : undefined}
            className={cn('mt-0.5 h-5 w-5 shrink-0', t.accent)}
          />
          <label htmlFor={fieldId('consent')} className={cn('text-[15px] leading-relaxed', t.consentText)}>
            {copy.consent_prefix}{' '}
            <Link to={privacyUrl} newTab className={t.link}>
              {copy.consent_link_label}
              <span className="sr-only"> {strings.newTab}</span>
            </Link>
            {copy.consent_suffix}
            <span aria-hidden="true" className={cn('ml-0.5', t.required)}>
              *
            </span>
          </label>
        </div>
        {errors.consent && (
          <p id={`${fieldId('consent')}-error`} className={cn('mt-2 flex items-start gap-1.5 pl-8 text-sm font-medium', t.required)}>
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errors.consent}</span>
          </p>
        )}
      </div>

      <div className="mt-8">
        <button type="submit" aria-disabled={submitting || undefined} className={cn(t.button, submitting && 'cursor-progress')}>
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
