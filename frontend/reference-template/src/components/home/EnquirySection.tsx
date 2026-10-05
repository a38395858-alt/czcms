import { SITE_META, siteConfig } from '../../config/site';
import type { EnquirySection as EnquirySectionRecord } from '../../content/types';
import { EnquiryForm } from '../enquiry/EnquiryForm';
import { CheckIcon } from '../ui/Icons';

/** Pale-blue conversion band: heading and reassurance left, first-party form right (never a modal). */
export function EnquirySection({ section }: { section: EnquirySectionRecord }) {
  return (
    <section
      id="enquiry"
      aria-labelledby="enquiry-title"
      className="relative overflow-hidden border-t border-mist-200 bg-mist-150 py-20 sm:py-24 lg:py-32"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-signal-500/40 to-transparent" />
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <div>
            <p className="eyebrow text-signal-700">{section.eyebrow}</p>
            <h2
              id="enquiry-title"
              className="mt-5 font-display text-[2rem] font-semibold leading-[1.08] text-navy-900 text-balance sm:text-[2.6rem]"
            >
              {section.title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-navy-600">{section.body}</p>
            <ul className="mt-10 space-y-4 border-t border-mist-300 pt-8">
              {section.settings.reassurance.map((line) => (
                <li key={line} className="flex gap-3 text-base leading-relaxed text-navy-700">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-signal-700 ring-1 ring-mist-300">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="lg:col-span-7">
          <EnquiryForm
            idPrefix="home-enquiry"
            placement="home"
            copy={section.settings}
            privacyUrl={siteConfig.legal.privacy}
            siteId={SITE_META.en.siteId}
            locale={SITE_META.en.locale}
          />
        </div>
      </div>
    </section>
  );
}
