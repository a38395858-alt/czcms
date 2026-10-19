import type { TopicPageContent, TopicSection } from '../../content/en-global/topics/types';
import { getTopicLayout, type TopicLayoutVariant } from '../topic/variants';
import { orderedTopicSections } from '../topic/composition';
import { getMedia } from '../../content/media';
import { useDocumentMeta } from '../../lib/seo';
import { setPrefill } from '../../lib/enquiry';
import { ES_STRINGS } from '../../lib/enquiry-locale';
import { Link } from '../../lib/router';
import { EnquiryForm, type EnquiryPlacement } from '../enquiry/EnquiryForm';
import { Img } from '../ui/Img';
import { ArrowRight, ArrowUpRight, CheckIcon, PlusIcon } from '../ui/Icons';

const sectionId = (section: TopicSection, index: number) => section.type === 'workflow' ? 'proceso' : section.type === 'faq' ? 'faq' : `es-topic-${section.type}-${index}`;
const number = (index: number) => String(index + 1).padStart(2, '0');

function scrollTo(id: string) {
  const target = document.getElementById(id);
  target?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  target?.focus({ preventScroll: true });
}

function PageNavigation({ content }: { content: TopicPageContent }) {
  const groups = [
    { label: 'Resumen', types: ['decision'] }, { label: 'Proceso', types: ['workflow'] },
    { label: 'Alcance', types: ['controls'] }, { label: 'Preparación', types: ['checklist'] }, { label: 'FAQ', types: ['faq'] },
  ];
  return <nav className="es-topic-page-nav" aria-label="En esta página"><div className="shell">
    {groups.map(group => { const index = content.sections.findIndex(s => group.types.includes(s.type)); return index < 0 ? null : <a key={group.label} href={`#${sectionId(content.sections[index], index)}`}>{group.label}</a>; })}
    <a href="#solicitud">Solicitar un plan <ArrowRight className="h-4 w-4" /></a>
  </div></nav>;
}

function Section({ section, index, layout }: { section: TopicSection; index: number; layout: TopicLayoutVariant }) {
  const headingId = `es-heading-${index}`;
  const type = section.type;
  return <section id={sectionId(section, index)} tabIndex={-1} aria-labelledby={headingId} data-section-type={type} data-layout={layout[type as keyof TopicLayoutVariant]} className={`es-topic-section es-topic-${type}`}><div className="shell">
    {type === 'decision' && <div className="es-topic-split topic-split"><h2 id={headingId}>{section.content.heading}</h2><div className="es-topic-prose">{section.content.paragraphs.map(p => <p key={p}>{p}</p>)}</div></div>}
    {type === 'scenarios' && <><div className="es-topic-section-intro"><h2 id={headingId}>{section.content.heading}</h2>{section.content.intro && <p>{section.content.intro}</p>}</div><ul className="es-topic-scenarios-ledger topic-scenarios-ledger">{section.content.cards.map(card => <li key={card.title}><h3>{card.title}</h3><p>{card.copy}</p></li>)}</ul></>}
    {type === 'workflow' && <div className="es-topic-split topic-split"><div><h2 id={headingId}>{section.content.heading}</h2>{section.content.intro && <p className="es-topic-section-lead">{section.content.intro}</p>}<a href="#solicitud" className="es-topic-text-link">Planificar mi próximo paso <ArrowRight className="h-4 w-4" /></a></div><ol className="es-topic-workflow-list topic-workflow-list">{section.content.steps.map((step, i) => <li key={i}><span aria-hidden="true">{step.step ?? number(i)}</span><div><h3>{step.title ?? step.copy}</h3>{step.title && <p>{step.copy}</p>}</div></li>)}</ol></div>}
    {type === 'controls' && <><h2 id={headingId}>{section.content.heading}</h2>{section.content.intro && <p className="es-topic-section-lead">{section.content.intro}</p>}
      {!!section.content.groups?.length && <div className="es-topic-scope-groups topic-scope-groups">{section.content.groups.map((group, i) => <div key={group.label}><h3>{i === 0 ? <CheckIcon className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}{group.label}</h3><ul>{group.items.map(item => <li key={item}>{item}</li>)}</ul></div>)}</div>}
      {!!section.content.paragraphs?.length && <div className="es-topic-prose">{section.content.paragraphs.map(p => <p key={p}>{p}</p>)}</div>}
      {!!section.content.items?.length && <ul className="es-topic-control-list topic-control-list">{section.content.items.map(item => <li key={item}><CheckIcon className="h-5 w-5" /><span>{item}</span></li>)}</ul>}
    </>}
    {type === 'checklist' && <div className="es-topic-split topic-split"><h2 id={headingId}>{section.content.heading}</h2><div>{section.content.body && <p className="es-topic-section-lead">{section.content.body}</p>}{!!section.content.items?.length && <ul className="es-topic-checklist-list topic-checklist-list">{section.content.items.map(item => <li key={item}><CheckIcon className="h-4 w-4" /><span>{item}</span></li>)}</ul>}</div></div>}
    {type === 'faq' && <div className="es-topic-split topic-split"><div><h2 id={headingId}>{section.content.heading}</h2>{section.content.guide && <p className="es-topic-section-lead">{section.content.guide}</p>}</div><div className="es-topic-faq-list topic-faq-list">{section.content.items.map(item => <details key={item.id}><summary><span>{item.question}</span><PlusIcon className="h-5 w-5" /></summary><p>{item.answer}</p></details>)}</div></div>}
  </div></section>;
}

export function SpanishTopicPage({ content }: { content: TopicPageContent }) {
  useDocumentMeta({ ...content.meta, path: content.route, lang: 'es-ES' });
  const request = () => { if (content.startingPoint) setPrefill(content.startingPoint); scrollTo('solicitud'); };
  const { hero } = content;
  const layout = getTopicLayout(content.route);
  return <>
    <section className="es-topic-hero topic-hero" aria-labelledby="es-topic-title"><div className="shell">
      <nav aria-label="Ruta de navegación" className="es-topic-breadcrumb"><Link to="/es">Inicio</Link><span aria-hidden="true">/</span><Link to={content.breadcrumbParent.href}>{content.breadcrumbParent.label}</Link><span aria-hidden="true">/</span><span aria-current="page">{content.pageLabel}</span></nav>
      <div className="es-topic-hero-columns topic-hero-columns"><div><h1 id="es-topic-title">{hero.title}</h1><p>{hero.body}</p><div className="es-topic-hero-actions topic-hero-actions"><button className="es-topic-button" type="button" onClick={request}>{hero.primaryCta}<ArrowRight className="h-4 w-4" /></button><a href="#proceso" className="es-topic-button es-topic-button-outline">{hero.secondaryCta}</a></div></div>
        <figure><Img media={getMedia(hero.mediaId)} alt={hero.mediaAlt} priority sizes={layout.hero === 'stacked' ? '100vw' : layout.hero === 'band' ? '(min-width: 1024px) 28vw, 100vw' : '(min-width: 1024px) 44vw, 100vw'} /><figcaption>{hero.kicker}</figcaption></figure>
      </div>
      <ol className="es-topic-hero-rail topic-hero-rail" aria-label="Recorrido del servicio">{hero.rail.map((item, i) => <li key={item.label}><span>{item.label}</span>{item.note && <small>{item.note}</small>}{i < hero.rail.length - 1 && <ArrowRight className="h-4 w-4" />}</li>)}</ol>
    </div></section>
    <PageNavigation content={content} />
    {orderedTopicSections(content.route, content.sections).map(({ section, index }) => <Section key={index} section={section} index={index} layout={layout} />)}
    <section className="es-topic-related topic-related" aria-label="Explorar servicios y sectores"><div className="shell">{[content.related, content.relatedIndustries].filter(Boolean).map(related => <div key={related!.heading}><h2>{related!.heading}</h2><ul>{related!.links.map(link => <li key={link.href}><Link to={link.href}><span><strong>{link.label}</strong><small>{link.note}</small></span><ArrowUpRight className="h-5 w-5" /></Link></li>)}</ul></div>)}</div></section>
    <section id="solicitud" tabIndex={-1} className="es-topic-enquiry" aria-labelledby="es-topic-enquiry-title"><div className="shell es-topic-enquiry-grid topic-enquiry-grid"><div><h2 id="es-topic-enquiry-title">{content.enquiry.heading}</h2>{content.enquiry.body && <p>{content.enquiry.body}</p>}<p className="es-topic-enquiry-note">Puedes empezar con lo que ya sabes. Los puntos pendientes quedan como preguntas por confirmar.</p></div><div className="es-topic-form">
      <EnquiryForm idPrefix={content.id} placement={content.id as EnquiryPlacement} strings={ES_STRINGS} privacyUrl="/es/privacidad" theme={{ accentText: 'text-es-action', accentSolid: 'bg-es-pine', accentButton: 'bg-es-action text-white hover:bg-es-action-hover', radius: 'rounded-[4px]' }} copy={{ button: content.formButton, loading: 'Enviando tu solicitud…', success_title: 'Gracias. Hemos recibido tu solicitud.', success_body: 'Un especialista de FreightVanta revisará los datos y te responderá con el siguiente paso.', error: 'No se pudo enviar la solicitud. Revisa los campos indicados y vuelve a intentarlo.', reassurance: [], consent_prefix: 'Acepto que FreightVanta utilice estos datos para revisar mi solicitud y ponerse en contacto conmigo, según la', consent_link_label: 'política de privacidad', consent_suffix: '.' }} topicExtras={{ contextTitle: content.enquiry.contextTitle, contextFields: content.enquiry.contextFields, attachments: { label: 'Archivos de referencia', hint: 'Solo se envían los nombres de archivo. Comparte los archivos después de nuestra respuesta.' } }} />
    </div></div></section>
  </>;
}
