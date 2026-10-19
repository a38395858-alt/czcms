import type { TopicPageContent, TopicSection } from '../../content/en-global/topics/types';
import { getTopicLayout, type TopicLayoutVariant } from '../topic/variants';
import { orderedTopicSections } from '../topic/composition';
import { getMedia } from '../../content/media';
import { useDocumentMeta } from '../../lib/seo';
import { setPrefill } from '../../lib/enquiry';
import { FR_STRINGS } from '../../lib/enquiry-locale';
import { Link } from '../../lib/router';
import { EnquiryForm, type EnquiryPlacement } from '../enquiry/EnquiryForm';
import { Img } from '../ui/Img';
import { ArrowRight, ArrowUpRight, CheckIcon, PlusIcon } from '../ui/Icons';

const sectionId = (section: TopicSection, index: number) => section.type === 'workflow' ? 'deroule' : section.type === 'faq' ? 'faq' : `fr-topic-${section.type}-${index}`;
const number = (index: number) => String(index + 1).padStart(2, '0');

function scrollTo(id: string) {
  const target = document.getElementById(id);
  target?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  target?.focus({ preventScroll: true });
}

function PageNavigation({ content }: { content: TopicPageContent }) {
  const groups = [
    { label: 'Présentation', types: ['decision'] }, { label: 'Déroulé', types: ['workflow'] },
    { label: 'Périmètre', types: ['controls'] }, { label: 'Préparation', types: ['checklist'] }, { label: 'FAQ', types: ['faq'] },
  ];
  return <nav className="fr-topic-page-nav" aria-label="Sur cette page"><div className="shell">
    {groups.map(group => { const index = content.sections.findIndex(s => group.types.includes(s.type)); return index < 0 ? null : <a key={group.label} href={`#${sectionId(content.sections[index], index)}`}>{group.label}</a>; })}
    <a href="#demande">Demander un plan <ArrowRight className="h-4 w-4" /></a>
  </div></nav>;
}

function Section({ section, index, layout }: { section: TopicSection; index: number; layout: TopicLayoutVariant }) {
  const headingId = `fr-heading-${index}`;
  const type = section.type;
  return <section id={sectionId(section, index)} tabIndex={-1} aria-labelledby={headingId} data-section-type={type} data-layout={layout[type as keyof TopicLayoutVariant]} className={`fr-topic-section fr-topic-${type}`}><div className="shell">
    {type === 'decision' && <div className="fr-topic-split topic-split"><h2 id={headingId}>{section.content.heading}</h2><div className="fr-topic-prose">{section.content.paragraphs.map(p => <p key={p}>{p}</p>)}</div></div>}
    {type === 'scenarios' && <><div className="fr-topic-section-intro"><h2 id={headingId}>{section.content.heading}</h2>{section.content.intro && <p>{section.content.intro}</p>}</div><ul className="fr-topic-scenarios-ledger topic-scenarios-ledger">{section.content.cards.map(card => <li key={card.title}><h3>{card.title}</h3><p>{card.copy}</p></li>)}</ul></>}
    {type === 'workflow' && <div className="fr-topic-split topic-split"><div><h2 id={headingId}>{section.content.heading}</h2>{section.content.intro && <p className="fr-topic-section-lead">{section.content.intro}</p>}<a href="#demande" className="fr-topic-text-link">Préparer mon prochain relais <ArrowRight className="h-4 w-4" /></a></div><ol className="fr-topic-workflow-list topic-workflow-list">{section.content.steps.map((step, i) => <li key={i}><span aria-hidden="true">{step.step ?? number(i)}</span><div><h3>{step.title ?? step.copy}</h3>{step.title && <p>{step.copy}</p>}</div></li>)}</ol></div>}
    {type === 'controls' && <><h2 id={headingId}>{section.content.heading}</h2>{section.content.intro && <p className="fr-topic-section-lead">{section.content.intro}</p>}
      {!!section.content.groups?.length && <div className="fr-topic-scope-groups topic-scope-groups">{section.content.groups.map((group, i) => <div key={group.label}><h3>{i === 0 ? <CheckIcon className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}{group.label}</h3><ul>{group.items.map(item => <li key={item}>{item}</li>)}</ul></div>)}</div>}
      {!!section.content.paragraphs?.length && <div className="fr-topic-prose">{section.content.paragraphs.map(p => <p key={p}>{p}</p>)}</div>}
      {!!section.content.items?.length && <ul className="fr-topic-control-list topic-control-list">{section.content.items.map(item => <li key={item}><CheckIcon className="h-5 w-5" /><span>{item}</span></li>)}</ul>}
    </>}
    {type === 'checklist' && <div className="fr-topic-split topic-split"><h2 id={headingId}>{section.content.heading}</h2><div>{section.content.body && <p className="fr-topic-section-lead">{section.content.body}</p>}{!!section.content.items?.length && <ul className="fr-topic-checklist-list topic-checklist-list">{section.content.items.map(item => <li key={item}><CheckIcon className="h-4 w-4" /><span>{item}</span></li>)}</ul>}</div></div>}
    {type === 'faq' && <div className="fr-topic-split topic-split"><div><h2 id={headingId}>{section.content.heading}</h2>{section.content.guide && <p className="fr-topic-section-lead">{section.content.guide}</p>}</div><div className="fr-topic-faq-list topic-faq-list">{section.content.items.map(item => <details key={item.id}><summary><span>{item.question}</span><PlusIcon className="h-5 w-5" /></summary><p>{item.answer}</p></details>)}</div></div>}
  </div></section>;
}

export function FrenchTopicPage({ content }: { content: TopicPageContent }) {
  useDocumentMeta({ ...content.meta, path: content.route, lang: 'fr-FR' });
  const request = () => { if (content.startingPoint) setPrefill(content.startingPoint); scrollTo('demande'); };
  const { hero } = content;
  const layout = getTopicLayout(content.route);
  return <>
    <section className="fr-topic-hero topic-hero" aria-labelledby="fr-topic-title"><div className="shell">
      <nav aria-label="Fil d’Ariane" className="fr-topic-breadcrumb"><Link to="/fr">Accueil</Link><span aria-hidden="true">/</span><Link to={content.breadcrumbParent.href}>{content.breadcrumbParent.label}</Link><span aria-hidden="true">/</span><span aria-current="page">{content.pageLabel}</span></nav>
      <div className="fr-topic-hero-columns topic-hero-columns"><div><h1 id="fr-topic-title">{hero.title}</h1><p>{hero.body}</p><div className="fr-topic-hero-actions topic-hero-actions"><button className="fr-topic-button" type="button" onClick={request}>{hero.primaryCta}<ArrowRight className="h-4 w-4" /></button><a href="#deroule" className="fr-topic-button fr-topic-button-outline">{hero.secondaryCta}</a></div></div>
        <figure><Img media={getMedia(hero.mediaId)} alt={hero.mediaAlt} priority sizes={layout.hero === 'stacked' ? '100vw' : layout.hero === 'band' ? '(min-width: 1024px) 28vw, 100vw' : '(min-width: 1024px) 44vw, 100vw'} /><figcaption>{hero.kicker}</figcaption></figure>
      </div>
      <ol className="fr-topic-hero-rail topic-hero-rail" aria-label="Parcours du service">{hero.rail.map((item, i) => <li key={item.label}><span>{item.label}</span>{item.note && <small>{item.note}</small>}{i < hero.rail.length - 1 && <ArrowRight className="h-4 w-4" />}</li>)}</ol>
    </div></section>
    <PageNavigation content={content} />
    {orderedTopicSections(content.route, content.sections).map(({ section, index }) => <Section key={index} section={section} index={index} layout={layout} />)}
    <section className="fr-topic-related topic-related" aria-label="Explorer les services et secteurs"><div className="shell">{[content.related, content.relatedIndustries].filter(Boolean).map(related => <div key={related!.heading}><h2>{related!.heading}</h2><ul>{related!.links.map(link => <li key={link.href}><Link to={link.href}><span><strong>{link.label}</strong><small>{link.note}</small></span><ArrowUpRight className="h-5 w-5" /></Link></li>)}</ul></div>)}</div></section>
    <section id="demande" tabIndex={-1} className="fr-topic-enquiry" aria-labelledby="fr-topic-enquiry-title"><div className="shell fr-topic-enquiry-grid topic-enquiry-grid"><div><h2 id="fr-topic-enquiry-title">{content.enquiry.heading}</h2>{content.enquiry.body && <p>{content.enquiry.body}</p>}<p className="fr-topic-enquiry-note">Commencez avec les informations dont vous disposez. Les points ouverts restent des questions à confirmer.</p></div><div className="fr-topic-form">
      <EnquiryForm idPrefix={content.id} placement={content.id as EnquiryPlacement} strings={FR_STRINGS} privacyUrl="/fr/confidentialite" theme={{ accentText: 'text-fr-action', accentSolid: 'bg-fr-encre', accentButton: 'bg-fr-action text-white hover:bg-fr-action-hover', radius: 'rounded-[6px]' }} copy={{ button: content.formButton, loading: 'Envoi de votre demande…', success_title: 'Merci. Nous avons bien reçu votre demande.', success_body: 'Un spécialiste FreightVanta examinera votre demande et vous répondra avec la prochaine étape.', error: 'La demande n’a pas pu être envoyée. Vérifiez les champs indiqués puis réessayez.', reassurance: [], consent_prefix: 'J’accepte que FreightVanta utilise ces informations pour examiner ma demande et me contacter, conformément à la', consent_link_label: 'politique de confidentialité', consent_suffix: '.' }} topicExtras={{ contextTitle: content.enquiry.contextTitle, contextFields: content.enquiry.contextFields, attachments: { label: 'Fichiers de référence', hint: 'Seuls les noms de fichiers sont transmis. Partagez les fichiers après notre réponse.' } }} />
    </div></div></section>
  </>;
}
