import type { ReactNode } from 'react';
import type { MediaAsset } from '../../content/media';
import type { StartingPointValue } from '../../content/types';
import { setPrefill } from '../../lib/enquiry';
import { Link } from '../../lib/router';
import { cn } from '../../utils/cn';
import { ArrowRight, CheckIcon } from '../ui/Icons';
import { Img } from '../ui/Img';

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-navy-300">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true" className="text-navy-400">/</span>}
            {item.to ? (
              <Link to={item.to} className="underline decoration-white/20 underline-offset-4 hover:text-white hover:decoration-white">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-navy-100">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

interface PageHeroProps {
  breadcrumbs: Crumb[];
  eyebrow?: string;
  title: string;
  lead?: string;
  body?: string;
  media?: MediaAsset;
  mediaAlt?: string;
  actions?: ReactNode;
}

export function PageHero({ breadcrumbs, eyebrow, title, lead, body, media, mediaAlt = '', actions }: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-navy-900 text-white">
      <div aria-hidden="true" className="bg-route-grid pointer-events-none absolute inset-0 -z-10" />
      <div className="shell pb-14 pt-10 sm:pb-16 sm:pt-12 lg:pb-20">
        <Breadcrumbs items={breadcrumbs} />
        <div
          className={cn(
            'mt-8 grid gap-10 lg:mt-10',
            media && 'lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center lg:gap-14',
          )}
        >
          <div className={cn(!media && 'max-w-3xl')}>
            {eyebrow && <p className="eyebrow text-signal-300">{eyebrow}</p>}
            <h1 className="mt-5 font-display text-[2.5rem] font-bold leading-[1.03] tracking-[-0.01em] text-balance sm:text-5xl lg:text-[3.6rem]">
              {title}
            </h1>
            {lead && (
              <p className="mt-5 font-display text-2xl font-medium leading-snug text-navy-100 sm:text-[1.75rem]">{lead}</p>
            )}
            {body && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-navy-200">{body}</p>}
            {actions && <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div>}
          </div>
          {media && (
            <div className="overflow-hidden rounded-[4px] bg-navy-800 ring-1 ring-white/10">
              <Img
                media={media}
                alt={mediaAlt}
                priority
                sizes="(min-width: 1024px) 48vw, 100vw"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function CheckList({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={cn('space-y-3', className)}>
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-[16px] leading-relaxed text-navy-700">
          <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-signal-600" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function ScopeNote({ children }: { children: ReactNode }) {
  return (
    <div className="border-l-2 border-signal-600 bg-mist-50 px-5 py-4 text-[15px] leading-relaxed text-navy-700">
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-signal-700">Scope note</p>
      <p className="mt-2">{children}</p>
    </div>
  );
}

interface CtaBandProps {
  title?: string;
  body?: string;
  startingPoint?: StartingPointValue | null;
}

/** Closing conversion band for deep pages — routes to the homepage enquiry form (never a modal). */
export function CtaBand({
  title = 'Tell us what is moving.',
  body = 'Share product links, quantities, origin, destination, target date, and any packaging or compliance needs.',
  startingPoint = null,
}: CtaBandProps) {
  return (
    <section aria-label="Request a shipment plan" className="border-t border-mist-200 bg-mist-100">
      <div className="shell flex flex-col gap-8 py-16 lg:flex-row lg:items-center lg:justify-between lg:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow text-signal-700">Request a shipment plan</p>
          <h2 className="mt-4 font-display text-[2rem] font-semibold leading-tight text-navy-900 sm:text-[2.5rem]">{title}</h2>
          <p className="mt-4 text-lg leading-relaxed text-navy-600">{body}</p>
        </div>
        <Link
          to="#enquiry"
          onClick={() => {
            if (startingPoint) setPrefill(startingPoint);
          }}
          className="btn btn-primary w-full shrink-0 sm:w-auto"
        >
          Get a shipment plan
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
