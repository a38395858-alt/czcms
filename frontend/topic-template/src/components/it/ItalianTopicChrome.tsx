import { useEffect, useRef, useState } from 'react';
import { IT_TOPICS } from '../../content/it/topics';
import { LOCALIZED_HOMEPAGES } from '../../config/site';
import { cmsContext, cmsHref, languageHref } from '../../lib/cms';
import { openConsentSettings } from '../../lib/analytics';
import { Link } from '../../lib/router';
import { ArrowRight, ChevronDown, CloseIcon, MenuIcon } from '../ui/Icons';

const topicNotes = new Map(Object.values(IT_TOPICS).flatMap(t => [...t.related.links, ...(t.relatedIndustries?.links ?? [])]).map(link => [link.href, link.note]));

function Logo() {
  return <Link to="/it" className="it-topic-logo" aria-label="FreightVanta — pagina iniziale">
    <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><rect x="1" y="1" width="30" height="30" rx="4" fill="none" stroke="currentColor" opacity=".3" /><path d="M7 23 13 13l6 6 7-11" stroke="currentColor" strokeWidth="2.4" fill="none" /><circle cx="26" cy="8" r="3" fill="#c02620" /></svg>
    <span>Freight<span>Vanta</span></span>
  </Link>;
}

function TopicMenu({ industry = false }: { industry?: boolean }) {
  const current = cmsContext()?.route;
  return <details data-public-menu className="it-topic-menu">
    <summary>{industry ? 'Settori' : 'Servizi'} <ChevronDown className="h-4 w-4" /></summary>
    <div className="it-topic-menu-panel">
      {Object.entries(IT_TOPICS).filter(([, t]) => (t.kind === 'industry') === industry).map(([route, topic]) => <Link key={route} to={topic.route} aria-current={route === current ? 'page' : undefined}>
        <strong>{topic.pageLabel}</strong><span>{topicNotes.get(topic.route)}</span><ArrowRight className="h-4 w-4" />
      </Link>)}
    </div>
  </details>;
}

function LanguageMenu() {
  return <details data-public-menu className="it-topic-language">
    <summary aria-label="Cambia lingua">IT <ChevronDown className="h-4 w-4" /></summary>
    <div>{LOCALIZED_HOMEPAGES.map(language => <a key={language.hreflang} href={languageHref(language.hreflang)} hrefLang={language.hreflang} lang={language.hreflang} aria-current={language.hreflang === 'it' ? 'page' : undefined}>{language.label}</a>)}</div>
  </details>;
}

export function ItalianTopicHeader() {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) { setOpen(false); button.current?.focus(); }
    };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [open]);
  return <>
    <div className="it-topic-announcement"><a href="#richiesta">Merce dalla Cina verso l’Italia o l’UE? Richiedi un piano di spedizione a uno specialista della logistica. <ArrowRight className="h-4 w-4" /></a></div>
    <header className="it-topic-header">
      <div className="shell it-topic-header-row">
        <Logo />
        <nav aria-label="Navigazione principale"><TopicMenu /><TopicMenu industry /><Link to="/it/guides">Guide</Link><Link to="/it/#operazione">Chi siamo</Link><a href="#richiesta">Contatti</a></nav>
        <div className="it-topic-header-actions"><LanguageMenu /><a href="#richiesta" className="it-topic-button it-topic-header-cta">Richiedi un piano</a>
          <button ref={button} type="button" className="it-topic-mobile-toggle" aria-label={open ? 'Chiudi il menu' : 'Apri il menu'} aria-expanded={open} aria-controls="it-topic-mobile-nav" onClick={() => setOpen(!open)}>{open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}</button>
        </div>
      </div>
      <nav id="it-topic-mobile-nav" className="it-topic-mobile-nav shell" aria-label="Navigazione mobile" hidden={!open}><TopicMenu /><TopicMenu industry /><Link to="/it/guides">Guide</Link><a href="#richiesta" onClick={() => setOpen(false)}>Contatti <ArrowRight className="h-4 w-4" /></a></nav>
    </header>
  </>;
}

export function ItalianTopicFooter() {
  return <footer className="it-topic-footer"><div className="shell">
    <div className="it-topic-footer-grid"><div><Logo /><p>Dal sourcing in Cina al prossimo passaggio confermato.</p><a href="#richiesta" className="it-topic-text-link">Richiedi un piano <ArrowRight className="h-4 w-4" /></a></div>
      {['service', 'industry'].map(kind => <nav key={kind} aria-label={kind === 'service' ? 'Servizi nel piè di pagina' : 'Settori nel piè di pagina'}><h2>{kind === 'service' ? 'Servizi' : 'Settori'}</h2>{Object.values(IT_TOPICS).filter(t => t.kind === kind).map(t => <Link key={t.id} to={t.route}>{t.pageLabel}</Link>)}</nav>)}
    </div>
    <div className="it-topic-footer-bottom"><p>© {new Date().getFullYear()} FreightVanta · Italiano · Italia</p><div><a href={cmsHref('/it/privacy')}>Privacy</a><a href={cmsHref('/it/cookie')}>Cookie</a><button type="button" onClick={openConsentSettings}>Preferenze cookie</button></div></div>
  </div></footer>;
}
