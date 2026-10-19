import { useRef, useState, type KeyboardEvent } from 'react';
import {
  esCoverage,
  esEnquiry,
  esFaq,
  esHero,
  esIndustries,
  esOperation,
  esProcess,
  esResources,
  esServices,
  esServicesSection,
} from '../../content/es/home';
import { getMedia } from '../../content/media';
import { track } from '../../lib/analytics';
import { setPrefill } from '../../lib/enquiry';
import { ES_STRINGS } from '../../lib/enquiry-locale';
import { Link } from '../../lib/router';
import { cn } from '../../utils/cn';
import { EnquiryForm, type FormTheme } from '../enquiry/EnquiryForm';
import { ArrowRight, ArrowUpRight, CheckIcon, PlusIcon } from '../ui/Icons';
import { Img } from '../ui/Img';

const ES_FORM_THEME: FormTheme = {
  accentText: 'text-azul-700',
  accentSolid: 'bg-azul-700',
  accentButton: 'rounded-[3px] bg-terra-700 text-white hover:bg-terra-600',
  radius: 'rounded-[3px]',
};

const heading = 'font-bricolage text-[clamp(2rem,3.5vw,3.75rem)] font-semibold leading-[1.05] tracking-[-0.045em] text-azul-800 text-balance';
const kicker = 'font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-terra-700';
const buttonPrimary = 'btn w-full rounded-[3px] bg-terra-700 px-6 text-base text-white hover:bg-terra-600 sm:w-auto';
const buttonOutline = 'btn w-full rounded-[3px] border border-white/65 px-6 text-base text-white hover:bg-white/10 sm:w-auto';
const number = (index: number) => String(index + 1).padStart(2, '0');

const SERVICE_MEDIA: Record<string, { id: string; alt: string }> = {
  sourcing: { id: 'service-product-sourcing', alt: 'Muestras de producto, herramientas de medición y especificaciones sobre una mesa de trabajo.' },
  maritimo: { id: 'service-ocean-freight', alt: 'Buque portacontenedores junto a las grúas de una terminal.' },
  aereo: { id: 'service-air-freight', alt: 'Operaciones de carga aérea junto a un avión de mercancías.' },
  aduanas: { id: 'service-customs', alt: 'Documentos de envío y cajas organizados sobre una mesa de trabajo.' },
  almacenaje: { id: 'service-warehousing', alt: 'Operario escaneando una caja en un almacén.' },
  embalaje: { id: 'service-packaging', alt: 'Materiales de embalaje y cajas preparados sobre una mesa.' },
};

/* A single full-bleed freight photograph anchors the first viewport. */
export function EsHero() {
  return (
    <section id="inicio" aria-labelledby="es-hero-title" className="relative isolate flex min-h-[680px] items-center overflow-hidden bg-azul-800 text-white sm:min-h-[740px]">
      <Img
        media={getMedia(esHero.media_id)}
        alt={esHero.media_alt}
        priority
        sizes="100vw"
        className="es-hero-photo absolute inset-0 -z-20 h-full w-full object-cover object-center"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-r from-[#061633]/95 via-[#0b234b]/78 to-[#071b39]/25" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-[#061633]/60 via-transparent to-[#061633]/15" />
      <div className="shell py-20 sm:py-24 lg:py-28">
        <div className="max-w-[760px]">
          <p className="font-bricolage text-[clamp(2.35rem,7.4vw,6.6rem)] font-bold leading-[0.95] tracking-[-0.07em] text-white">
            FreightVanta<span className="text-oranje-300">.</span>
          </p>
          <p className="mt-9 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-white/85 sm:text-xs">{esHero.eyebrow}</p>
          <h1 id="es-hero-title" className="mt-4 max-w-2xl font-bricolage text-[clamp(2.25rem,4.4vw,4rem)] font-semibold leading-[1.07] tracking-[-0.045em] text-balance">
            {esHero.title}
          </h1>
          <p className="mt-6 max-w-[600px] text-[16px] leading-[1.7] text-white/90 sm:text-lg">{esHero.body}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link to={esHero.cta_primary_url} onClick={() => track('home_hero_primary_click', { site: 'es' })} className={buttonPrimary}>
              {esHero.cta_primary_label}<ArrowRight className="h-4 w-4" />
            </Link>
            <Link to={esHero.cta_secondary_url} onClick={() => track('home_hero_secondary_click', { site: 'es' })} className={buttonOutline}>
              {esHero.cta_secondary_label}
            </Link>
          </div>
          <p className="mt-7 max-w-lg border-l border-oranje-300 pl-4 text-sm leading-relaxed text-white/80">{esHero.microcopy}</p>
        </div>
      </div>
    </section>
  );
}

/* A thin route index and capability rail introduce the page after the hero. */
export function EsCoverage() {
  return (
    <section aria-label="Ruta y servicios" className="bg-arena-50">
      <div className="border-b border-carbon-900/15">
        <div className="shell grid grid-cols-2 gap-x-6 gap-y-5 py-7 md:grid-cols-4 md:gap-8 md:py-9">
          {esHero.route_labels.map((label, index) => (
            <div key={label} className="relative border-l-2 border-terra-600 pl-4">
              <span className="block font-mono text-[11px] font-semibold text-terra-700">{number(index)} / 04</span>
              <span className="mt-1 block font-bricolage text-base font-semibold tracking-tight text-azul-800">{label}</span>
            </div>
          ))}
        </div>
      </div>
      <ul className="shell grid grid-cols-2 gap-x-5 gap-y-1 py-5 sm:grid-cols-3 xl:grid-cols-6 xl:gap-0 xl:py-0">
        {esCoverage.map((label) => (
          <li key={label} className="xl:border-l xl:border-carbon-900/10 xl:first:border-l-0">
            <Link to="/es/servicios" className="flex min-h-12 items-center py-2 text-[14px] font-medium leading-snug text-carbon-800 transition-colors hover:text-azul-700 xl:min-h-[4.5rem] xl:px-4">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* Left-hand editorial selector, not a mosaic of competing boxes. */
export function EsServices() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const service = esServices[active];
  const photo = SERVICE_MEDIA[service.id];

  const select = (index: number, method: 'click' | 'keyboard') => {
    if (index === active) return;
    setActive(index);
    track('home_service_tab_change', { site: 'es', service: esServices[index].id, method });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const total = esServices.length;
    let next: number;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % total;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + total) % total;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = total - 1;
    else return;
    event.preventDefault();
    select(next, 'keyboard');
    tabRefs.current[next]?.focus();
  };

  return (
    <section id="servicios" aria-labelledby="es-services-title" className="bg-white py-20 sm:py-24 lg:py-32">
      <div className="shell">
        <p className={kicker}>{esServicesSection.kicker}</p>
        <div className="mt-5 grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h2 id="es-services-title" className={cn(heading, 'lg:col-span-7')}>{esServicesSection.title}</h2>
          <p className="text-[17px] leading-relaxed text-carbon-600 lg:col-span-5">{esServicesSection.body}</p>
        </div>
        <div className="mt-12 grid gap-7 lg:grid-cols-[minmax(0,0.32fr)_minmax(0,0.68fr)] lg:gap-12">
          <div role="tablist" aria-label="Servicios" className="tab-strip -mx-5 flex gap-2 overflow-x-auto px-5 pb-3 sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-t lg:border-carbon-900/15 lg:p-0">
            {esServices.map((item, index) => (
              <button
                key={item.id}
                ref={(element) => { tabRefs.current[index] = element; }}
                type="button"
                role="tab"
                id={`es-tab-${item.id}`}
                aria-selected={active === index}
                aria-controls="es-service-panel"
                tabIndex={active === index ? 0 : -1}
                onClick={() => select(index, 'click')}
                onKeyDown={(event) => onKeyDown(event, index)}
                className={cn(
                  'flex min-h-12 shrink-0 items-center gap-3 whitespace-nowrap rounded-[3px] border px-4 py-3 text-left text-sm font-semibold transition-colors lg:w-full lg:whitespace-normal lg:rounded-none lg:border-0 lg:border-b lg:border-carbon-900/15 lg:px-2 lg:py-5 lg:text-base',
                  active === index ? 'border-azul-700 bg-azul-800 text-white lg:bg-arena-50 lg:text-azul-800' : 'border-carbon-900/15 bg-white text-carbon-600 hover:text-azul-800',
                )}
              >
                <span className={cn('font-mono text-[11px]', active === index ? 'text-oranje-300 lg:text-terra-700' : 'text-carbon-600')}>{number(index)}</span>
                <span className="flex-1">{item.label}</span>
                <ArrowRight className={cn('hidden h-4 w-4 lg:block', active === index ? 'text-terra-700' : 'text-transparent')} />
              </button>
            ))}
          </div>
          <div key={service.id} role="tabpanel" id="es-service-panel" aria-labelledby={`es-tab-${service.id}`} className="min-w-0 motion-safe:animate-panel-in">
            <div className="overflow-hidden bg-arena-100">
              <Img media={getMedia(photo.id)} alt={photo.alt} sizes="(min-width: 1024px) 60vw, 100vw" className="aspect-[16/9] w-full object-cover" />
            </div>
            <div className="mt-7 grid gap-6 border-b border-carbon-900/15 pb-8 xl:grid-cols-[minmax(0,1fr)_12rem]">
              <div>
                <h3 className="font-bricolage text-[clamp(1.65rem,2.5vw,2.5rem)] font-semibold leading-tight tracking-tight text-azul-800">{service.title}</h3>
                <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-carbon-600">{service.copy}</p>
              </div>
              <ul aria-label={`${service.label}: capacidades`} className="flex flex-wrap content-start gap-x-3 gap-y-2 xl:flex-col xl:border-l xl:border-carbon-900/15 xl:pl-5">
                {service.tags.map((tag) => <li key={tag} className="text-[13px] font-medium text-carbon-600">{tag}</li>)}
              </ul>
            </div>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Link to="/es/solicitud" onClick={() => { if (service.starting_point) setPrefill(service.starting_point); track('home_service_link_click', { site: 'es', service: service.id, link: 'enquiry' }); }} className={buttonPrimary}>
                {esServicesSection.panel_cta_label}<ArrowRight className="h-4 w-4" />
              </Link>
              <Link to={service.detail_url} hrefLang="en" onClick={() => track('home_service_link_click', { site: 'es', service: service.id, link: 'service_page_en' })} className="inline-flex items-center gap-1.5 font-semibold text-azul-700 underline underline-offset-4 hover:text-azul-800">
                {esServicesSection.detail_link_label}<ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function EsOperation() {
  return (
    <section id="operacion" aria-labelledby="es-operation-title" className="bg-azul-800 py-20 text-white sm:py-24 lg:py-32">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <p className={cn(kicker, 'text-oranje-300')}>{esOperation.kicker}</p>
          <h2 id="es-operation-title" className="mt-5 font-bricolage text-[clamp(2rem,3.5vw,3.6rem)] font-semibold leading-[1.06] tracking-tight text-balance">{esOperation.title}</h2>
          <blockquote className="mt-8 max-w-md border-l-2 border-oranje-300 pl-5 text-xl leading-snug text-white/85">{esOperation.pull_quote}</blockquote>
        </div>
        <ol className="border-t border-white/25 lg:col-span-6 lg:col-start-7">
          {esOperation.items.map((item, index) => (
            <li key={item.title} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 border-b border-white/25 py-6 sm:grid-cols-[3.5rem_minmax(0,1fr)]">
              <span className="font-mono text-sm text-oranje-300">{number(index)}</span>
              <div><h3 className="font-bricolage text-xl font-semibold">{item.title}</h3><p className="mt-2 text-[16px] leading-relaxed text-white/80">{item.copy}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function EsProcess() {
  return (
    <section id="proceso" aria-labelledby="es-process-title" className="bg-arena-50 py-20 sm:py-24 lg:py-32">
      <div className="shell">
        <p className={kicker}>{esProcess.kicker}</p>
        <div className="mt-5 grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h2 id="es-process-title" className={cn(heading, 'lg:col-span-7')}>{esProcess.title}</h2>
          <p className="text-[17px] leading-relaxed text-carbon-600 lg:col-span-5">{esProcess.body}</p>
        </div>
        <ol className="mt-12 border-t border-carbon-900/20 lg:mt-16">
          {esProcess.steps.map((step) => (
            <li key={step.step} className="grid gap-3 border-b border-carbon-900/15 py-7 sm:grid-cols-[4rem_minmax(0,0.55fr)_minmax(0,0.95fr)] sm:gap-6 sm:py-9">
              <span className="font-mono text-sm font-semibold text-terra-700">{step.step}</span>
              <h3 className="font-bricolage text-[1.4rem] font-semibold leading-snug text-azul-800">{step.title}</h3>
              <p className="max-w-xl text-[16px] leading-relaxed text-carbon-600">{step.copy}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 max-w-3xl border-l-2 border-terra-600 pl-5 text-[17px] leading-relaxed text-carbon-800">{esProcess.closing}</p>
      </div>
    </section>
  );
}

export function EsIndustries() {
  return (
    <section id="sectores" aria-labelledby="es-industries-title" className="bg-white py-20 sm:py-24 lg:py-32">
      <div className="shell">
        <p className={kicker}>{esIndustries.kicker}</p>
        <div className="mt-5 grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h2 id="es-industries-title" className={cn(heading, 'lg:col-span-7')}>{esIndustries.title}</h2>
          <p className="text-[17px] leading-relaxed text-carbon-600 lg:col-span-5">{esIndustries.body}</p>
        </div>
        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-14">
          <figure className="lg:col-span-6">
            <div className="overflow-hidden bg-arena-100"><Img media={getMedia(esIndustries.media_id)} alt={esIndustries.media_alt} sizes="(min-width: 1024px) 50vw, 100vw" className="aspect-[4/3] w-full object-cover" /></div>
            <figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-carbon-600">{esIndustries.media_caption}</figcaption>
          </figure>
          <ul className="border-t border-carbon-900/20 lg:col-span-6">
            {esIndustries.items.map((item, index) => (
              <li key={item.slug} className="group relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 border-b border-carbon-900/15 py-6">
                <span className="font-mono text-xs font-semibold text-terra-700">{number(index)}</span>
                <div>
                  <h3 className="font-bricolage text-[1.35rem] font-semibold leading-tight text-azul-800"><Link to={item.href} hrefLang="en" onClick={() => track('home_industry_click', { site: 'es', industry: item.slug })} className="outline-none after:absolute after:inset-0 group-hover:text-azul-700 focus-visible:after:outline-3 focus-visible:after:outline-offset-2 focus-visible:after:outline-azul-700">{item.name}</Link></h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-carbon-600">{item.copy}</p>
                  <span aria-hidden="true" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-azul-700">{esIndustries.detail_label}<ArrowUpRight className="h-4 w-4" /></span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function EsResources() {
  return (
    <section id="recursos" aria-labelledby="es-resources-title" className="bg-arena-50 py-20 sm:py-24 lg:py-32">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <p className={kicker}>{esResources.kicker}</p>
          <h2 id="es-resources-title" className={cn(heading, 'mt-5')}>{esResources.title}</h2>
          <p className="mt-5 text-[17px] leading-relaxed text-carbon-600">{esResources.body}</p>
          <p className="mt-6 border-l-2 border-azul-700 pl-4 text-[14px] leading-relaxed text-carbon-600">{esResources.note}</p>
          <Link to={esResources.cta_url} hrefLang="en" onClick={() => track('home_guides_click', { site: 'es', target: 'resource_center' })} className="mt-8 inline-flex items-center gap-2 font-semibold text-azul-700 underline underline-offset-4 hover:text-azul-800">{esResources.cta_label}<ArrowUpRight className="h-4 w-4" /></Link>
        </div>
        <ul className="border-t border-carbon-900/20 lg:col-span-6 lg:col-start-7">
          {esResources.topics.map((topic, index) => (
            <li key={topic.href} className="border-b border-carbon-900/15">
              <Link to={topic.href} hrefLang="en" onClick={() => track('home_guides_click', { site: 'es', target: 'topic', slug: topic.href.split('/').pop() })} className="group flex min-h-16 items-center gap-4 py-4 text-[16px] font-semibold text-azul-800 hover:text-azul-700">
                <span className="font-mono text-xs text-terra-700">{number(index)}</span><span className="flex-1">{topic.label}</span><ArrowUpRight className="h-4 w-4 shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function EsFaq() {
  return (
    <section id="preguntas" aria-labelledby="es-faq-title" className="bg-white py-20 sm:py-24 lg:py-32">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4"><p className={kicker}>{esFaq.kicker}</p><h2 id="es-faq-title" className={cn(heading, 'mt-5')}>{esFaq.title}</h2><p className="mt-5 text-[16px] leading-relaxed text-carbon-600">{esFaq.aside_prompt}</p><Link to={esFaq.aside_link_url} className="mt-4 inline-flex items-center gap-2 font-semibold text-azul-700 underline underline-offset-4">{esFaq.aside_link_label}<ArrowRight className="h-4 w-4" /></Link></div>
        <div className="border-t border-carbon-900/20 lg:col-span-8">
          {esFaq.items.map((item) => (
            <details key={item.id} className="group border-b border-carbon-900/15">
              <summary className="flex min-h-16 cursor-pointer items-start justify-between gap-5 py-5 font-bricolage text-[1.15rem] font-semibold leading-snug text-azul-800 hover:text-azul-700"><span>{item.question}</span><span aria-hidden="true" className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center border border-carbon-900/20 transition-transform group-open:rotate-45"><PlusIcon className="h-4 w-4" /></span></summary>
              <p className="max-w-2xl pb-6 pr-10 text-[16px] leading-relaxed text-carbon-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EsEnquiry() {
  return (
    <section id="solicitud" aria-labelledby="es-enquiry-title" className="bg-azul-800 py-20 text-white sm:py-24 lg:py-32">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <p className={cn(kicker, 'text-oranje-300')}>{esEnquiry.kicker}</p>
          <h2 id="es-enquiry-title" className="mt-5 font-bricolage text-[clamp(2rem,3.5vw,3.5rem)] font-semibold leading-[1.08] tracking-tight text-balance">{esEnquiry.title}</h2>
          <p className="mt-5 text-[17px] leading-relaxed text-white/85">{esEnquiry.body}</p>
          <ul className="mt-9 space-y-4 border-t border-white/25 pt-7">
            {esEnquiry.reassurance.map((line) => <li key={line} className="flex gap-3 text-[15px] leading-relaxed text-white/85"><CheckIcon className="mt-1 h-4 w-4 shrink-0 text-oranje-300" /><span>{line}</span></li>)}
          </ul>
        </div>
        <div className="lg:col-span-7">
          <EnquiryForm idPrefix="es-enquiry" placement="es-home" copy={esEnquiry.copy} strings={ES_STRINGS} privacyUrl="/es/privacidad" theme={ES_FORM_THEME} />
        </div>
      </div>
    </section>
  );
}