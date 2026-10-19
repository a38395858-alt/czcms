import type { CoverageSection } from '../../content/types';
import { Link } from '../../lib/router';
import { cn } from '../../utils/cn';

/** Horizontal capability rail — structured labels, not cards. */
export function Coverage({ section }: { section: CoverageSection }) {
  return (
    <section id="coverage" aria-labelledby="coverage-title" className="border-b border-mist-200 bg-white">
      <h2 id="coverage-title" className="sr-only">
        {section.title}
      </h2>
      <div className="shell">
        <ul className="grid grid-cols-2 gap-x-5 py-4 sm:grid-cols-3 sm:py-5 xl:grid-cols-6 xl:gap-0 xl:py-0">
          {section.items.map((item, index) => (
            <li key={item.href} className={cn('xl:border-l xl:border-mist-200', index === 0 && 'xl:border-l-0')}>
              <Link
                to={item.href}
                className="group flex min-h-12 items-center gap-2.5 py-2 text-[15px] font-medium leading-snug text-navy-900 transition-colors hover:text-signal-700 xl:min-h-[4.75rem] xl:justify-center xl:px-4"
              >
                <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 bg-signal-600 transition-transform group-hover:scale-125" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
