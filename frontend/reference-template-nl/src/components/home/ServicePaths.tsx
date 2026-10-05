import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { getMedia } from '../../content/media';
import type { ServicePathsSection } from '../../content/types';
import { track } from '../../lib/analytics';
import { setPrefill } from '../../lib/enquiry';
import { prefersReducedMotion, useMediaQuery } from '../../lib/hooks';
import { Link } from '../../lib/router';
import { cn } from '../../utils/cn';
import { ArrowRight } from '../ui/Icons';
import { Img } from '../ui/Img';

/**
 * Accessible tabs: vertical list + editorial panel on desktop, scrollable strip + stacked panel
 * on mobile. All panels share one grid cell so switching never shifts the layout.
 */
export function ServicePaths({ section }: { section: ServicePathsSection }) {
  const items = section.items;
  const initialIndex = Math.max(0, items.findIndex((item) => item.id === section.settings.default_tab));
  const [active, setActive] = useState(initialIndex);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const stripRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const baseId = useId();

  const select = (index: number, method: 'click' | 'keyboard') => {
    if (index === active) return;
    setActive(index);
    track('home_service_tab_change', { service: items[index].id, method });
  };

  // Keep the selected tab visible inside the mobile strip without scrolling the page.
  useEffect(() => {
    const strip = stripRef.current;
    const tab = tabRefs.current[active];
    if (!strip || !tab || isDesktop) return;
    const left = tab.offsetLeft - (strip.clientWidth - tab.offsetWidth) / 2;
    strip.scrollTo({ left: Math.max(0, left), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, [active, isDesktop]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number | null = null;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        next = (index + 1) % items.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        next = (index - 1 + items.length) % items.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = items.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    select(next, 'keyboard');
    tabRefs.current[next]?.focus();
  };

  return (
    <section id="services" aria-labelledby="services-title" className="bg-white py-20 sm:py-24 lg:py-32">
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-7">
            <p className="eyebrow text-signal-700">{section.eyebrow}</p>
            <h2 id="services-title" className="h2 mt-5 text-navy-900">
              {section.title}
            </h2>
          </div>
          <p className="text-lg leading-relaxed text-navy-600 lg:col-span-5">{section.body}</p>
        </div>

        <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-12 lg:gap-12">
          <div className="relative lg:col-span-4">
            <div
              ref={stripRef}
              role="tablist"
              aria-label="Service paths"
              aria-orientation={isDesktop ? 'vertical' : 'horizontal'}
              className="tab-strip relative -mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-3 sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-l lg:border-mist-200 lg:p-0"
            >
              {items.map((item, index) => {
                const selected = index === active;
                return (
                  <button
                    key={item.id}
                    ref={(element) => {
                      tabRefs.current[index] = element;
                    }}
                    type="button"
                    role="tab"
                    id={`${baseId}-tab-${item.id}`}
                    aria-selected={selected}
                    aria-controls={`${baseId}-panel-${item.id}`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => select(index, 'click')}
                    onKeyDown={(event) => onKeyDown(event, index)}
                    className={cn(
                      'group relative shrink-0 snap-start whitespace-nowrap rounded-[3px] border px-4 py-2.5 text-left text-[15px] font-medium transition-colors',
                      'lg:-ml-px lg:flex lg:w-full lg:items-center lg:justify-between lg:whitespace-normal lg:rounded-none lg:border-0 lg:border-l-2 lg:px-6 lg:py-5 lg:text-[1.1rem]',
                      selected
                        ? 'border-signal-600 bg-signal-600/[0.07] text-navy-900 lg:border-signal-600 lg:bg-mist-50 lg:font-semibold'
                        : 'border-mist-300 text-navy-600 hover:border-navy-300 hover:text-navy-900 lg:border-transparent lg:hover:bg-mist-50/70',
                    )}
                  >
                    <span>{item.label}</span>
                    <ArrowRight
                      className={cn(
                        'hidden h-4 w-4 shrink-0 transition-colors lg:block',
                        selected ? 'text-signal-600' : 'text-transparent group-hover:text-navy-300',
                      )}
                    />
                  </button>
                );
              })}
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-5 top-0 h-[calc(100%-0.75rem)] w-14 bg-linear-to-l from-white to-transparent sm:-right-8 lg:hidden"
            />
          </div>

          <div className="grid lg:col-span-8">
            {items.map((item, index) => {
              const selected = index === active;
              const media = getMedia(item.media_id);
              return (
                <div
                  key={item.id}
                  role="tabpanel"
                  id={`${baseId}-panel-${item.id}`}
                  aria-labelledby={`${baseId}-tab-${item.id}`}
                  className={cn(
                    'col-start-1 row-start-1 flex flex-col',
                    selected ? 'visible motion-safe:animate-panel-in' : 'invisible',
                  )}
                >
                  <div className="relative overflow-hidden rounded-[4px] bg-mist-100">
                    <Img
                      media={media}
                      alt={item.media_alt}
                      loading={index === initialIndex ? 'eager' : 'lazy'}
                      sizes="(min-width: 1024px) 60vw, 100vw"
                      className="aspect-[16/9] w-full object-cover"
                    />
                    <span className="absolute left-4 top-4 bg-navy-950/85 px-2.5 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-white">
                      {item.label}
                    </span>
                  </div>

                  <div className="mt-8 grid gap-7 xl:grid-cols-[minmax(0,1fr)_14rem] xl:gap-10">
                    <div>
                      <h3 className="font-display text-[2rem] font-semibold leading-[1.08] text-navy-900 sm:text-[2.35rem]">
                        {item.title}
                      </h3>
                      <p className="mt-4 text-[17px] leading-relaxed text-navy-600">{item.copy}</p>
                    </div>
                    <ul
                      aria-label={`${item.label} capabilities`}
                      className="flex flex-wrap content-start gap-2 xl:flex-col xl:items-start xl:border-l xl:border-mist-200 xl:pl-6"
                    >
                      {item.tags.map((tag) => (
                        <li
                          key={tag}
                          className="rounded-[2px] border border-mist-300 bg-white px-3 py-1.5 font-mono text-[12.5px] font-medium text-navy-700"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 flex flex-col gap-5 border-t border-mist-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                      to={item.link_url}
                      onClick={() => track('home_service_link_click', { service: item.id, link: 'service_page' })}
                      className="btn btn-dark w-full sm:w-auto"
                    >
                      {item.link_label}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      to="#enquiry"
                      onClick={() => {
                        if (item.starting_point) setPrefill(item.starting_point);
                        track('home_service_link_click', { service: item.id, link: 'enquiry' });
                      }}
                      className="text-link"
                    >
                      {section.settings.panel_cta_label}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
