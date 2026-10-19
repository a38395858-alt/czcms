import type { TopicPageContent, TopicSection } from '../../content/en-global/topics/types';
import { getTopicLayout, type TopicLayoutVariant } from '../topic/variants';
import { orderedTopicSections } from '../topic/composition';
import { getMedia } from '../../content/media';
import { useDocumentMeta } from '../../lib/seo';
import { setPrefill } from '../../lib/enquiry';
import { NL_STRINGS } from '../../lib/enquiry-locale';
import { Link } from '../../lib/router';
import { EnquiryForm, type EnquiryPlacement } from '../enquiry/EnquiryForm';
import { Img } from '../ui/Img';
import { ArrowRight, ArrowUpRight, CheckIcon, PlusIcon } from '../ui/Icons';

const sectionId = (section: TopicSection, index: number) => section.type === 'workflow' ? 'werkwijze' : section.type === 'faq' ? 'faq' : `nl-topic-${section.type}-${index}`;
const number = (index: number) => String(index + 1).padStart(2, '0');

function scrollTo(id: string) {
  const target = document.getElementById(id);
  target?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  target?.focus({ preventScroll: true });
}

function PageNavigation({ content }: { content: TopicPageContent }) {
  const groups = [
    { label: 'Kader', types: ['decision'] }, { label: 'Werkwijze', types: ['workflow'] },
    { label: 'Scope', types: ['controls'] }, { label: 'Voorbereiding', types: ['checklist'] }, { label: 'FAQ', types: ['faq'] },
  ];
  return <nav className="nl-topic-page-nav" aria-label="Op deze pagina"><div className="shell">
    {groups.map(group => { const index = content.sections.findIndex(s => group.types.includes(s.type)); return index < 0 ? null : <a key={group.label} href={`#${sectionId(content.sections[index], index)}`}>{group.label}</a>; })}
    <a href="#aanvraag">Plan aanvragen <ArrowRight className="h-4 w-4" /></a>
  </div></nav>;
}

function Section({ section, index, layout }: { section: TopicSection; index: number; layout: TopicLayoutVariant }) {
  const headingId = `nl-heading-${index}`;
  const type = section.type;
  return <section id={sectionId(section, index)} tabIndex={-1} aria-labelledby={headingId} data-section-type={type} data-layout={layout[type as keyof TopicLayoutVariant]} className={`nl-topic-section nl-topic-${type}`}><div className="shell">
    {type === 'decision' && <div className="nl-topic-split topic-split"><h2 id={headingId}>{section.content.heading}</h2><div className="nl-topic-prose">{section.content.paragraphs.map(p => <p key={p}>{p}</p>)}</div></div>}
    {type === 'scenarios' && <><div className="nl-topic-section-intro"><h2 id={headingId}>{section.content.heading}</h2>{section.content.intro && <p>{section.content.intro}</p>}</div><ul className="nl-topic-scenarios-ledger topic-scenarios-ledger">{section.content.cards.map(card => <li key={card.title}><h3>{card.title}</h3><p>{card.copy}</p></li>)}</ul></>}
    {type === 'workflow' && <div className="nl-topic-split topic-split"><div><h2 id={headingId}>{section.content.heading}</h2>{section.content.intro && <p className="nl-topic-section-lead">{section.content.intro}</p>}<a href="#aanvraag" className="nl-topic-text-link">Bereid de volgende overdracht voor <ArrowRight className="h-4 w-4" /></a></div><ol className="nl-topic-workflow-list topic-workflow-list">{section.content.steps.map((step, i) => <li key={i}><span aria-hidden="true">{step.step ?? number(i)}</span><div><h3>{step.title ?? step.copy}</h3>{step.title && <p>{step.copy}</p>}</div></li>)}</ol></div>}
    {type === 'controls' && <><h2 id={headingId}>{section.content.heading}</h2>{section.content.intro && <p className="nl-topic-section-lead">{section.content.intro}</p>}
      {!!section.content.groups?.length && <div className="nl-topic-scope-groups topic-scope-groups">{section.content.groups.map((group, i) => <div key={group.label}><h3>{i === 0 ? <CheckIcon className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}{group.label}</h3><ul>{group.items.map(item => <li key={item}>{item}</li>)}</ul></div>)}</div>}
      {!!section.content.paragraphs?.length && <div className="nl-topic-prose">{section.content.paragraphs.map(p => <p key={p}>{p}</p>)}</div>}
      {!!section.content.items?.length && <ul className="nl-topic-control-list topic-control-list">{section.content.items.map(item => <li key={item}><CheckIcon className="h-5 w-5" /><span>{item}</span></li>)}</ul>}
    </>}
    {type === 'checklist' && <div className="nl-topic-split topic-split"><h2 id={headingId}>{section.content.heading}</h2><div>{section.content.body && <p className="nl-topic-section-lead">{section.content.body}</p>}{!!section.content.items?.length && <ul className="nl-topic-checklist-list topic-checklist-list">{section.content.items.map(item => <li key={item}><CheckIcon className="h-4 w-4" /><span>{item}</span></li>)}</ul>}</div></div>}
    {type === 'faq' && <div className="nl-topic-split topic-split"><div><h2 id={headingId}>{section.content.heading}</h2>{section.content.guide && <p className="nl-topic-section-lead">{section.content.guide}</p>}</div><div className="nl-topic-faq-list topic-faq-list">{section.content.items.map(item => <details key={item.id}><summary><span>{item.question}</span><PlusIcon className="h-5 w-5" /></summary><p>{item.answer}</p></details>)}</div></div>}
  </div></section>;
}

export function DutchTopicPage({ content }: { content: TopicPageContent }) {
  useDocumentMeta({ ...content.meta, path: content.route, lang: 'nl-NL' });
  const request = () => { if (content.startingPoint) setPrefill(content.startingPoint); scrollTo('aanvraag'); };
  const { hero } = content;
  const layout = getTopicLayout(content.route);
  return <>
    <section className="nl-topic-hero topic-hero" aria-labelledby="nl-topic-title"><div className="shell">
      <nav aria-label="Broodkruimelpad" className="nl-topic-breadcrumb"><Link to="/nl">Home</Link><span aria-hidden="true">/</span><Link to={content.breadcrumbParent.href}>{content.breadcrumbParent.label}</Link><span aria-hidden="true">/</span><span aria-current="page">{content.pageLabel}</span></nav>
      <div className="nl-topic-hero-columns topic-hero-columns"><div><h1 id="nl-topic-title">{hero.title}</h1><p>{hero.body}</p><div className="nl-topic-hero-actions topic-hero-actions"><button className="nl-topic-button" type="button" onClick={request}>{hero.primaryCta}<ArrowRight className="h-4 w-4" /></button><a href="#werkwijze" className="nl-topic-button nl-topic-button-outline">{hero.secondaryCta}</a></div></div>
        <figure><Img media={getMedia(hero.mediaId)} alt={hero.mediaAlt} priority sizes={layout.hero === 'stacked' ? '100vw' : layout.hero === 'band' ? '(min-width: 1024px) 28vw, 100vw' : '(min-width: 1024px) 44vw, 100vw'} /><figcaption>{hero.kicker}</figcaption></figure>
      </div>
      <ol className="nl-topic-hero-rail topic-hero-rail" aria-label="Werkwijze van de dienst">{hero.rail.map((item, i) => <li key={item.label}><span>{item.label}</span>{item.note && <small>{item.note}</small>}{i < hero.rail.length - 1 && <ArrowRight className="h-4 w-4" />}</li>)}</ol>
    </div></section>
    <PageNavigation content={content} />
    {orderedTopicSections(content.route, content.sections).map(({ section, index }) => <Section key={index} section={section} index={index} layout={layout} />)}
    <section className="nl-topic-related topic-related" aria-label="Bekijk diensten en sectoren"><div className="shell">{[content.related, content.relatedIndustries].filter(Boolean).map(related => <div key={related!.heading}><h2>{related!.heading}</h2><ul>{related!.links.map(link => <li key={link.href}><Link to={link.href}><span><strong>{link.label}</strong><small>{link.note}</small></span><ArrowUpRight className="h-5 w-5" /></Link></li>)}</ul></div>)}</div></section>
    <section id="aanvraag" tabIndex={-1} className="nl-topic-enquiry" aria-labelledby="nl-topic-enquiry-title"><div className="shell nl-topic-enquiry-grid topic-enquiry-grid"><div><h2 id="nl-topic-enquiry-title">{content.enquiry.heading}</h2>{content.enquiry.body && <p>{content.enquiry.body}</p>}<p className="nl-topic-enquiry-note">Begin met de beschikbare informatie. Open punten blijven vragen om te bevestigen.</p></div><div className="nl-topic-form">
      <EnquiryForm idPrefix={content.id} placement={content.id as EnquiryPlacement} strings={NL_STRINGS} privacyUrl="/nl/privacy" theme={{ accentText: 'text-nl-action', accentSolid: 'bg-nl-encre', accentButton: 'bg-nl-action text-white hover:bg-nl-action-hover', radius: 'rounded-[3px]' }} copy={{ button: content.formButton, loading: 'Aanvraag wordt verzonden…', success_title: 'Bedankt. Wij hebben uw aanvraag ontvangen.', success_body: 'Een specialist van FreightVanta beoordeelt uw aanvraag en neemt contact met u op over de volgende stap.', error: 'De aanvraag is niet verzonden. Controleer de aangegeven velden en probeer opnieuw.', reassurance: [], consent_prefix: 'Ik ga ermee akkoord dat FreightVanta deze informatie gebruikt om mijn aanvraag te beoordelen en contact met mij op te nemen, volgens de ', consent_link_label: 'privacyverklaring', consent_suffix: '.' }} topicExtras={{ contextTitle: content.enquiry.contextTitle, contextFields: content.enquiry.contextFields, attachments: { label: 'Referentiebestanden', hint: 'Alleen de bestandsnamen worden meegestuurd. Deel de bestanden na onze reactie.' } }} />
    </div></div></section>
  </>;
}
