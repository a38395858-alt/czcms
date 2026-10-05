import type { FaqSection } from '../../content/types';
import { Link } from '../../lib/router';
import { ArrowRight, PlusIcon } from '../ui/Icons';

/** Native <details>/<summary>: keyboard and screen-reader friendly, multiple answers can stay open. */
export function Faq({ section }: { section: FaqSection }) {
  return (
    <section id="faq" aria-labelledby="faq-title" className="bg-white py-20 sm:py-24 lg:py-32">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <h2 id="faq-title" className="h2 text-navy-900">
              {section.title}
            </h2>
            <p className="mt-5 text-[17px] leading-relaxed text-navy-600">{section.settings.aside_prompt}</p>
            <Link to={section.settings.aside_link_url} className="text-link mt-3">
              {section.settings.aside_link_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="border-t border-mist-200">
            {section.items.map((item) => (
              <details key={item.id} className="group border-b border-mist-200">
                <summary className="flex min-h-[44px] cursor-pointer items-start justify-between gap-6 rounded-[2px] py-6 text-left font-display text-[1.3rem] font-semibold leading-snug text-navy-900 transition-colors hover:text-signal-700 sm:text-[1.45rem]">
                  <span>{item.question}</span>
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-mist-300 text-navy-700 transition-all group-open:rotate-45 group-open:border-signal-600 group-open:bg-signal-600 group-open:text-white"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </span>
                </summary>
                <p className="max-w-2xl pb-7 pr-12 text-[17px] leading-relaxed text-navy-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
