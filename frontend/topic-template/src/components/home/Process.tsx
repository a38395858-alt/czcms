import type { ProcessSection } from '../../content/types';
import { cn } from '../../utils/cn';
import { RouteChangeIcon } from '../ui/Icons';

/** The page's only numbered sequence: a route line on desktop, a vertical timeline on mobile. */
export function Process({ section }: { section: ProcessSection }) {
  const last = section.items.length - 1;

  return (
    <section id="process" aria-labelledby="process-title" className="bg-mist-50 py-20 sm:py-24 lg:py-32">
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h2 id="process-title" className="h2 text-navy-900 lg:col-span-6">
            {section.title}
          </h2>
          <p className="text-lg leading-relaxed text-navy-600 lg:col-span-5 lg:col-start-8">{section.body}</p>
        </div>

        <ol className="mt-14 grid lg:mt-20 lg:grid-cols-4 lg:gap-8">
          {section.items.map((step, index) => (
            <li
              key={step.step}
              className={cn(
                'relative pb-12 pl-12 lg:pb-0 lg:pl-0 lg:pt-12',
                index !== last &&
                  'before:absolute before:bottom-0 before:left-[7px] before:top-6 before:w-px before:bg-navy-200 lg:before:hidden',
                index !== last &&
                  'lg:after:absolute lg:after:left-6 lg:after:right-[-2rem] lg:after:top-[7px] lg:after:h-px lg:after:bg-navy-200',
              )}
            >
              <span
                aria-hidden="true"
                className="absolute left-0 top-1 h-[15px] w-[15px] rounded-full bg-safety-500 ring-[5px] ring-mist-50 lg:top-0"
              />
              <p className="font-mono text-sm font-medium tracking-[0.08em] text-signal-700">
                <span className="sr-only">Step </span>
                {step.step}
              </p>
              <h3 className="mt-3 font-display text-2xl font-semibold leading-tight text-navy-900 sm:text-[1.65rem]">
                {step.title}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-navy-600">{step.copy}</p>
            </li>
          ))}
        </ol>

        <div className="mt-16 flex max-w-4xl items-start gap-4 border-t border-navy-200 pt-8 lg:mt-20">
          <span
            aria-hidden="true"
            className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-signal-600 text-signal-700"
          >
            <RouteChangeIcon className="h-[18px] w-[18px]" />
          </span>
          <p className="font-display text-xl font-medium leading-snug text-navy-800 sm:text-2xl">{section.settings.closing}</p>
        </div>
      </div>
    </section>
  );
}
