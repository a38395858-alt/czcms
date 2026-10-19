import { getMedia } from '../../content/media';
import type { IndustriesSection } from '../../content/types';
import { track } from '../../lib/analytics';
import { Link } from '../../lib/router';
import { ArrowRight } from '../ui/Icons';
import { Img } from '../ui/Img';

/** One featured image story plus an editorial list of deep-linked industries. */
export function Industries({ section }: { section: IndustriesSection }) {
  const media = getMedia(section.media_id);

  return (
    <section id="industries" aria-labelledby="industries-title" className="bg-white py-20 sm:py-24 lg:py-32">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-x-12">
        <div className="lg:col-span-7">
          <h2 id="industries-title" className="h2 text-navy-900">
            {section.title}
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-navy-600">{section.body}</p>

          <figure className="relative mt-10 lg:mt-14">
            <div className="overflow-hidden rounded-[4px] bg-mist-100">
              <Img
                media={media}
                alt={section.media_alt}
                sizes="(min-width: 1024px) 56vw, 100vw"
                className="aspect-[4/3] w-full object-cover lg:aspect-[16/11]"
              />
            </div>
            <figcaption className="mt-3 flex items-center gap-2 font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-navy-500 sm:absolute sm:bottom-0 sm:left-0 sm:mt-0 sm:rounded-tr-[4px] sm:bg-navy-950/90 sm:px-4 sm:py-3 sm:text-navy-100">
              <span aria-hidden="true" className="h-2 w-2 bg-signal-500" />
              {section.settings.media_caption}
            </figcaption>
          </figure>
        </div>

        <div className="flex flex-col lg:col-span-5 lg:pt-2">
          <ul className="border-t border-mist-200">
            {section.items.map((item) => (
              <li key={item.slug} className="group relative border-b border-mist-200 py-7 transition-colors hover:bg-mist-50/70 sm:px-3">
                <h3 className="font-display text-[1.6rem] font-semibold leading-tight text-navy-900">
                  <Link
                    to={item.href}
                    onClick={() => track('home_industry_click', { industry: item.slug })}
                    className="outline-none transition-colors after:absolute after:inset-0 group-hover:text-signal-700 focus-visible:after:outline-3 focus-visible:after:outline-offset-2 focus-visible:after:outline-signal-500"
                  >
                    {item.name}
                  </Link>
                </h3>
                <p className="mt-2 text-base leading-relaxed text-navy-600">{item.copy}</p>
                <span aria-hidden="true" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-signal-700">
                  View industry page
                  <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" />
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Link
              to={section.cta_primary_url}
              onClick={() => track('home_industry_click', { industry: 'all' })}
              className="btn btn-dark w-full sm:w-auto"
            >
              {section.cta_primary_label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
