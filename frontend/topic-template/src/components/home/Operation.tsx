import type { OperationSection } from '../../content/types';
import { Link } from '../../lib/router';
import { ArrowRight } from '../ui/Icons';

export function Operation({ section }: { section: OperationSection }) {
  return (
    <section
      id="operation"
      aria-labelledby="operation-title"
      className="relative isolate overflow-hidden bg-navy-950 py-20 text-white sm:py-24 lg:py-32"
    >
      <div aria-hidden="true" className="bg-route-grid pointer-events-none absolute inset-0 -z-10 opacity-80" />
      <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <p className="eyebrow text-signal-300">{section.eyebrow}</p>
            <h2 id="operation-title" className="h2 mt-5 text-white">
              {section.title}
            </h2>
            <p className="mt-8 max-w-md border-l-2 border-signal-500 pl-5 font-display text-xl font-medium leading-snug text-navy-100 sm:text-2xl">
              {section.settings.pull_quote}
            </p>
            <Link
              to={section.cta_primary_url}
              className="mt-10 inline-flex items-center gap-2 font-semibold text-signal-300 underline decoration-signal-300/40 underline-offset-4 hover:decoration-signal-300"
            >
              {section.cta_primary_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <ul className="relative before:absolute before:bottom-4 before:left-[7px] before:top-3 before:w-px before:bg-linear-to-b before:from-white/30 before:via-white/15 before:to-white/0">
            {section.items.map((item) => (
              <li key={item.title} className="relative pb-12 pl-12 last:pb-0">
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-[0.45rem] h-[15px] w-[15px] rounded-full border-[3px] border-safety-500 bg-navy-950"
                />
                <h3 className="font-display text-2xl font-semibold leading-tight text-white sm:text-[1.75rem]">{item.title}</h3>
                <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-navy-200">{item.copy}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
