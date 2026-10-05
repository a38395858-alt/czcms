import { getMedia } from '../../content/media';
import type { HeroSection } from '../../content/types';
import { track } from '../../lib/analytics';
import { Link } from '../../lib/router';
import { ArrowRight } from '../ui/Icons';
import { Img } from '../ui/Img';

export function Hero({ section }: { section: HeroSection }) {
  const media = getMedia(section.media_id);

  return (
    <section id="hero" aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-navy-900 text-white">
      <div aria-hidden="true" className="bg-route-grid pointer-events-none absolute inset-0 -z-10" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-56 -top-56 -z-10 h-[40rem] w-[40rem] rounded-full bg-signal-500/[0.14] blur-3xl"
      />

      <div className="shell grid items-center gap-12 pb-16 pt-12 sm:pb-20 sm:pt-16 lg:grid-cols-[minmax(0,46fr)_minmax(0,54fr)] lg:gap-12 lg:pb-24 lg:pt-20 xl:gap-16">
        <div className="max-w-2xl">
          <p className="eyebrow text-signal-300">{section.eyebrow}</p>
          <h1
            id="hero-title"
            className="mt-6 font-display text-[2.6rem] font-bold leading-[1.02] tracking-[-0.012em] text-balance sm:text-[3.4rem] lg:text-[3.5rem] xl:text-[4rem]"
          >
            {section.title}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-navy-200 sm:text-[1.2rem] sm:leading-relaxed">{section.body}</p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              to={section.cta_primary_url}
              onClick={() => track('home_hero_primary_click')}
              className="btn btn-primary w-full px-6 text-base sm:w-auto"
            >
              {section.cta_primary_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={section.cta_secondary_url}
              onClick={() => track('home_hero_secondary_click')}
              className="btn btn-ghost-light w-full px-6 text-base sm:w-auto"
            >
              {section.cta_secondary_label}
            </Link>
          </div>

          <p className="mt-8 max-w-lg border-l-2 border-white/15 pl-4 text-[15px] leading-relaxed text-navy-300">
            {section.settings.microcopy}
          </p>
        </div>

        <figure className="relative">
          <div className="relative overflow-hidden rounded-t-[4px] bg-navy-800 ring-1 ring-white/10">
            <Img
              media={media}
              alt={section.media_alt}
              priority
              sizes="(min-width: 1024px) 54vw, 100vw"
              className="aspect-[4/3] w-full object-cover object-[58%_50%] sm:aspect-[16/10] lg:aspect-[5/4] xl:aspect-[4/3]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-navy-950/70 to-transparent"
            />
          </div>
          <RouteStrip labels={section.settings.route_labels} />
        </figure>
      </div>
    </section>
  );
}

function RouteStrip({ labels }: { labels: string[] }) {
  return (
    <figcaption className="relative rounded-b-[4px] border border-t-0 border-white/10 bg-navy-950/90 px-2 pb-4 pt-5 sm:px-6">
      <span className="sr-only">Shipment route: {labels.map((label) => label.toLowerCase()).join(', then ')}.</span>
      <div aria-hidden="true" className="relative">
        <div className="absolute left-[12.5%] right-[12.5%] top-[7px] h-px overflow-hidden bg-white/25">
          <span className="absolute inset-y-0 left-0 w-1/4 bg-linear-to-r from-transparent via-signal-300 to-transparent motion-safe:animate-route-flow" />
        </div>
        <ol className="relative grid grid-cols-4">
          {labels.map((label, index) => (
            <li key={label} className="relative flex flex-col items-center gap-3 text-center">
              <span className="block h-[15px] w-[15px] rounded-full bg-safety-500 ring-4 ring-navy-950" />
              <span className="font-mono text-[11px] font-medium tracking-[0.02em] text-navy-100 sm:text-xs sm:tracking-[0.14em]">
                {label}
              </span>
              {index < labels.length - 1 && (
                <span className="absolute -right-[5px] top-[2px] text-[10px] leading-none text-navy-300">›</span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </figcaption>
  );
}
