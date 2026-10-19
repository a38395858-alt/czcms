import type { TopicPageContent, TopicSection } from '../../content/en-global/topics/types';
import { getTopicLayout, type TopicLayoutVariant } from '../topic/variants';
import { orderedTopicSections } from '../topic/composition';
import { getMedia } from '../../content/media';
import { useDocumentMeta } from '../../lib/seo';
import { setPrefill } from '../../lib/enquiry';
import { IT_STRINGS } from '../../lib/enquiry-locale';
import { Link } from '../../lib/router';
import { EnquiryForm, type EnquiryPlacement } from '../enquiry/EnquiryForm';
import { Img } from '../ui/Img';
import { ArrowRight, ArrowUpRight, CheckIcon, PlusIcon } from '../ui/Icons';

const sectionId = (section: TopicSection, index: number) => section.type === 'workflow' ? 'percorso' : section.type === 'faq' ? 'faq' : `it-topic-${section.type}-${index}`;
const number = (index: number) => String(index + 1).padStart(2, '0');

function scrollTo(id: string) {
  const target = document.getElementById(id);
  target?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  target?.focus({ preventScroll: true });
}

function PageNavigation({ content }: { content: TopicPageContent }) {
  const groups = [
    { label: 'Inquadramento', types: ['decision'] }, { label: 'Percorso', types: ['workflow'] },
    { label: 'Perimetro', types: ['controls'] }, { label: 'Preparazione', types: ['checklist'] }, { label: 'FAQ', types: ['faq'] },
  ];
  return <nav className="it-topic-page-nav" aria-label="In questa pagina"><div className="shell">
    {groups.map(group => { const index = content.sections.findIndex(s => group.types.includes(s.type)); return index < 0 ? null : <a key={group.label} href={`#${sectionId(content.sections[index], index)}`}>{group.label}</a>; })}
    <a href="#richiesta">Richiedi un piano <ArrowRight className="h-4 w-4" /></a>
  </div></nav>;
}

function Section({ section, index, layout }: { section: TopicSection; index: number; layout: TopicLayoutVariant }) {
  const headingId = `it-heading-${index}`;
  const type = section.type;
  return <section id={sectionId(section, index)} tabIndex={-1} aria-labelledby={headingId} data-section-type={type} data-layout={layout[type as keyof TopicLayoutVariant]} className={`it-topic-section it-topic-${type}`}><div className="shell">
    {type === 'decision' && <div className="it-topic-split topic-split"><h2 id={headingId}>{section.content.heading}</h2><div className="it-topic-prose">{section.content.paragraphs.map(p => <p key={p}>{p}</p>)}</div></div>}
    {type === 'scenarios' && <><div className="it-topic-section-intro"><h2 id={headingId}>{section.content.heading}</h2>{section.content.intro && <p>{section.content.intro}</p>}</div><ul className="it-topic-scenarios-ledger topic-scenarios-ledger">{section.content.cards.map(card => <li key={card.title}><h3>{card.title}</h3><p>{card.copy}</p></li>)}</ul></>}
    {type === 'workflow' && <div className="it-topic-split topic-split"><div><h2 id={headingId}>{section.content.heading}</h2>{section.content.intro && <p className="it-topic-section-lead">{section.content.intro}</p>}<a href="#richiesta" className="it-topic-text-link">Prepara il prossimo passaggio <ArrowRight className="h-4 w-4" /></a></div><ol className="it-topic-workflow-list topic-workflow-list">{section.content.steps.map((step, i) => <li key={i}><span aria-hidden="true">{step.step ?? number(i)}</span><div><h3>{step.title ?? step.copy}</h3>{step.title && <p>{step.copy}</p>}</div></li>)}</ol></div>}
    {type === 'controls' && <><h2 id={headingId}>{section.content.heading}</h2>{section.content.intro && <p className="it-topic-section-lead">{section.content.intro}</p>}
      {!!section.content.groups?.length && <div className="it-topic-scope-groups topic-scope-groups">{section.content.groups.map((group, i) => <div key={group.label}><h3>{i === 0 ? <CheckIcon className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}{group.label}</h3><ul>{group.items.map(item => <li key={item}>{item}</li>)}</ul></div>)}</div>}
      {!!section.content.paragraphs?.length && <div className="it-topic-prose">{section.content.paragraphs.map(p => <p key={p}>{p}</p>)}</div>}
      {!!section.content.items?.length && <ul className="it-topic-control-list topic-control-list">{section.content.items.map(item => <li key={item}><CheckIcon className="h-5 w-5" /><span>{item}</span></li>)}</ul>}
    </>}
    {type === 'checklist' && <div className="it-topic-split topic-split"><h2 id={headingId}>{section.content.heading}</h2><div>{section.content.body && <p className="it-topic-section-lead">{section.content.body}</p>}{!!section.content.items?.length && <ul className="it-topic-checklist-list topic-checklist-list">{section.content.items.map(item => <li key={item}><CheckIcon className="h-4 w-4" /><span>{item}</span></li>)}</ul>}</div></div>}
    {type === 'faq' && <div className="it-topic-split topic-split"><div><h2 id={headingId}>{section.content.heading}</h2>{section.content.guide && <p className="it-topic-section-lead">{section.content.guide}</p>}</div><div className="it-topic-faq-list topic-faq-list">{section.content.items.map(item => <details key={item.id}><summary><span>{item.question}</span><PlusIcon className="h-5 w-5" /></summary><p>{item.answer}</p></details>)}</div></div>}
  </div></section>;
}

export function ItalianTopicPage({ content }: { content: TopicPageContent }) {
  useDocumentMeta({ ...content.meta, path: content.route, lang: 'it-IT' });
  const request = () => { if (content.startingPoint) setPrefill(content.startingPoint); scrollTo('richiesta'); };
  const { hero } = content;
  const layout = getTopicLayout(content.route);
  return <>
    <section className="it-topic-hero topic-hero" aria-labelledby="it-topic-title"><div className="shell">
      <nav aria-label="Percorso di navigazione" className="it-topic-breadcrumb"><Link to="/it">Home</Link><span aria-hidden="true">/</span><Link to={content.breadcrumbParent.href}>{content.breadcrumbParent.label}</Link><span aria-hidden="true">/</span><span aria-current="page">{content.pageLabel}</span></nav>
      <div className="it-topic-hero-columns topic-hero-columns"><div><h1 id="it-topic-title">{hero.title}</h1><p>{hero.body}</p><div className="it-topic-hero-actions topic-hero-actions"><button className="it-topic-button" type="button" onClick={request}>{hero.primaryCta}<ArrowRight className="h-4 w-4" /></button><a href="#percorso" className="it-topic-button it-topic-button-outline">{hero.secondaryCta}</a></div></div>
        <figure><Img media={getMedia(hero.mediaId)} alt={hero.mediaAlt} priority sizes={layout.hero === 'stacked' ? '100vw' : layout.hero === 'band' ? '(min-width: 1024px) 28vw, 100vw' : '(min-width: 1024px) 44vw, 100vw'} /><figcaption>{hero.kicker}</figcaption></figure>
      </div>
      <ol className="it-topic-hero-rail topic-hero-rail" aria-label="Percorso del servizio">{hero.rail.map((item, i) => <li key={item.label}><span>{item.label}</span>{item.note && <small>{item.note}</small>}{i < hero.rail.length - 1 && <ArrowRight className="h-4 w-4" />}</li>)}</ol>
    </div></section>
    <PageNavigation content={content} />
    {orderedTopicSections(content.route, content.sections).map(({ section, index }) => <Section key={index} section={section} index={index} layout={layout} />)}
    <section className="it-topic-related topic-related" aria-label="Esplora servizi e settori"><div className="shell">{[content.related, content.relatedIndustries].filter(Boolean).map(related => <div key={related!.heading}><h2>{related!.heading}</h2><ul>{related!.links.map(link => <li key={link.href}><Link to={link.href}><span><strong>{link.label}</strong><small>{link.note}</small></span><ArrowUpRight className="h-5 w-5" /></Link></li>)}</ul></div>)}</div></section>
    <section id="richiesta" tabIndex={-1} className="it-topic-enquiry" aria-labelledby="it-topic-enquiry-title"><div className="shell it-topic-enquiry-grid topic-enquiry-grid"><div><h2 id="it-topic-enquiry-title">{content.enquiry.heading}</h2>{content.enquiry.body && <p>{content.enquiry.body}</p>}<p className="it-topic-enquiry-note">Inizia dalle informazioni disponibili. I punti aperti restano domande da confermare.</p></div><div className="it-topic-form">
      <EnquiryForm idPrefix={content.id} placement={content.id as EnquiryPlacement} strings={IT_STRINGS} privacyUrl="/it/privacy" theme={{ accentText: 'text-it-action', accentSolid: 'bg-it-encre', accentButton: 'bg-it-action text-white hover:bg-it-action-hover', radius: 'rounded-none' }} copy={{ button: content.formButton, loading: 'Invio della richiesta…', success_title: 'Grazie. Abbiamo ricevuto la tua richiesta.', success_body: 'Uno specialista FreightVanta esaminerà la richiesta e ti risponderà con il prossimo passaggio.', error: 'La richiesta non è stata inviata. Controlla i campi indicati e riprova.', reassurance: [], consent_prefix: 'Accetto che FreightVanta utilizzi queste informazioni per esaminare la richiesta e contattarmi, secondo l’', consent_link_label: 'informativa privacy', consent_suffix: '.' }} topicExtras={{ contextTitle: content.enquiry.contextTitle, contextFields: content.enquiry.contextFields, attachments: { label: 'File di riferimento', hint: 'Vengono trasmessi solo i nomi dei file. Condividi i file dopo la nostra risposta.' } }} />
    </div></div></section>
  </>;
}
