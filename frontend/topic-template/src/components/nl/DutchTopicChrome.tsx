import { useEffect, useRef, useState } from 'react';
import { NL_TOPICS } from '../../content/nl/topics';
import { LOCALIZED_HOMEPAGES } from '../../config/site';
import { cmsContext, cmsHref, languageHref } from '../../lib/cms';
import { openConsentSettings } from '../../lib/analytics';
import { Link } from '../../lib/router';
import { ArrowRight, ChevronDown, CloseIcon, MenuIcon } from '../ui/Icons';

const topicNotes = new Map(Object.values(NL_TOPICS).flatMap(t => [...t.related.links, ...(t.relatedIndustries?.links ?? [])]).map(link => [link.href, link.note]));

function Logo() {
  return <Link to="/nl" className="nl-topic-logo" aria-label="FreightVanta — Nederlandse homepage">
    <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true"><path d="M3 0h23l6 6v23a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3Z" fill="#1e4fa1" /><path d="M8 22 13.5 13l5 5.5L24 10" fill="none" stroke="#f2f5f8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="8" cy="22" r="2.1" fill="#f2f5f8"/><circle cx="24" cy="10" r="3" fill="#e85d04" stroke="#f2f5f8" strokeWidth="1"/></svg>
    <span>Freight<span>Vanta</span></span>
  </Link>;
}

function TopicMenu({ industry = false }: { industry?: boolean }) {
  const current = cmsContext()?.route;
  return <details data-public-menu className="nl-topic-menu">
    <summary>{industry ? 'Sectoren' : 'Diensten'} <ChevronDown className="h-4 w-4" /></summary>
    <div className="nl-topic-menu-panel">
      {Object.entries(NL_TOPICS).filter(([, t]) => (t.kind === 'industry') === industry).map(([route, topic]) => <Link key={route} to={topic.route} aria-current={route === current ? 'page' : undefined}>
        <strong>{topic.pageLabel}</strong><span>{topicNotes.get(topic.route)}</span><ArrowRight className="h-4 w-4" />
      </Link>)}
    </div>
  </details>;
}

function LanguageMenu() {
  return <details data-public-menu className="nl-topic-language">
    <summary aria-label="Taal wijzigen">NL <ChevronDown className="h-4 w-4" /></summary>
    <div>{LOCALIZED_HOMEPAGES.map(language => <a key={language.hreflang} href={languageHref(language.hreflang)} hrefLang={language.hreflang} lang={language.hreflang} aria-current={language.hreflang === 'nl' ? 'page' : undefined}>{language.label}</a>)}</div>
  </details>;
}

export function DutchTopicHeader() {
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
    <div className="nl-topic-announcement"><a href="#aanvraag">Goederen uit China naar Nederland of de EU? Vraag een plan voor de volgende overdracht aan. <ArrowRight className="h-4 w-4" /></a></div>
    <header className="nl-topic-header">
      <div className="shell nl-topic-header-row">
        <Logo />
        <nav aria-label="Hoofdnavigatie"><TopicMenu /><TopicMenu industry /><Link to="/nl/guides">Kennis</Link><Link to="/nl/over-ons">Over ons</Link><a href="#aanvraag">Contact</a></nav>
        <div className="nl-topic-header-actions"><LanguageMenu /><a href="#aanvraag" className="nl-topic-button nl-topic-header-cta">Plan aanvragen</a>
          <button ref={button} type="button" className="nl-topic-mobile-toggle" aria-label={open ? 'Menu sluiten' : 'Menu openen'} aria-expanded={open} aria-controls="nl-topic-mobile-nav" onClick={() => setOpen(!open)}>{open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}</button>
        </div>
      </div>
      <nav id="nl-topic-mobile-nav" className="nl-topic-mobile-nav shell" aria-label="Mobiele navigatie" hidden={!open}><TopicMenu /><TopicMenu industry /><Link to="/nl/guides">Kennis</Link><a href="#aanvraag" onClick={() => setOpen(false)}>Contact <ArrowRight className="h-4 w-4" /></a></nav>
    </header>
  </>;
}

export function DutchTopicFooter() {
  return <footer className="nl-topic-footer"><div className="shell">
    <div className="nl-topic-footer-grid"><div><Logo /><p>Van sourcing in China naar de volgende bevestigde overdracht.</p><a href="#aanvraag" className="nl-topic-text-link">Plan aanvragen <ArrowRight className="h-4 w-4" /></a></div>
      {['service', 'industry'].map(kind => <nav key={kind} aria-label={kind === 'service' ? 'Diensten in de voettekst' : 'Sectoren in de voettekst'}><h2>{kind === 'service' ? 'Diensten' : 'Sectoren'}</h2>{Object.values(NL_TOPICS).filter(t => t.kind === kind).map(t => <Link key={t.id} to={t.route}>{t.pageLabel}</Link>)}</nav>)}
    </div>
    <div className="nl-topic-footer-bottom"><p>© {new Date().getFullYear()} FreightVanta · Nederlands · Nederland</p><div><a href={cmsHref('/nl/privacy')}>Privacy</a><a href={cmsHref('/nl/cookies')}>Cookies</a><button type="button" onClick={openConsentSettings}>Cookievoorkeuren</button></div></div>
  </div></footer>;
}
