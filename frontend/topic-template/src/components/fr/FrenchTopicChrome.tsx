import { useEffect, useRef, useState } from 'react';
import { FR_TOPICS } from '../../content/fr/topics';
import { LOCALIZED_HOMEPAGES } from '../../config/site';
import { cmsContext, cmsHref, languageHref } from '../../lib/cms';
import { openConsentSettings } from '../../lib/analytics';
import { Link } from '../../lib/router';
import { ArrowRight, ChevronDown, CloseIcon, MenuIcon } from '../ui/Icons';

const topicNotes = new Map(Object.values(FR_TOPICS).flatMap(t => [...t.related.links, ...(t.relatedIndustries?.links ?? [])]).map(link => [link.href, link.note]));

function Logo() {
  return <Link to="/fr" className="fr-topic-logo" aria-label="FreightVanta — accueil">
    <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><rect x="1" y="1" width="30" height="30" rx="4" fill="none" stroke="currentColor" opacity=".3" /><path d="M7 23 13 13l6 6 7-11" stroke="currentColor" strokeWidth="2.4" fill="none" /><circle cx="26" cy="8" r="3" fill="#b45a24" /></svg>
    <span>Freight<span>Vanta</span></span>
  </Link>;
}

function TopicMenu({ industry = false }: { industry?: boolean }) {
  const current = cmsContext()?.route;
  return <details data-public-menu className="fr-topic-menu">
    <summary>{industry ? 'Secteurs' : 'Solutions'} <ChevronDown className="h-4 w-4" /></summary>
    <div className="fr-topic-menu-panel">
      {Object.entries(FR_TOPICS).filter(([, t]) => (t.kind === 'industry') === industry).map(([route, topic]) => <Link key={route} to={topic.route} aria-current={route === current ? 'page' : undefined}>
        <strong>{topic.pageLabel}</strong><span>{topicNotes.get(topic.route)}</span><ArrowRight className="h-4 w-4" />
      </Link>)}
    </div>
  </details>;
}

function LanguageMenu() {
  return <details data-public-menu className="fr-topic-language">
    <summary aria-label="Changer de langue">FR <ChevronDown className="h-4 w-4" /></summary>
    <div>{LOCALIZED_HOMEPAGES.map(language => <a key={language.hreflang} href={languageHref(language.hreflang)} hrefLang={language.hreflang} lang={language.hreflang} aria-current={language.hreflang === 'fr' ? 'page' : undefined}>{language.label}</a>)}</div>
  </details>;
}

export function FrenchTopicHeader() {
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
    <div className="fr-topic-announcement"><a href="#demande">Des marchandises de Chine vers la France ou l’UE ? Demandez un plan d’expédition à un spécialiste logistique. <ArrowRight className="h-4 w-4" /></a></div>
    <header className="fr-topic-header">
      <div className="shell fr-topic-header-row">
        <Logo />
        <nav aria-label="Navigation principale"><TopicMenu /><TopicMenu industry /><Link to="/fr/guides">Guides</Link><Link to="/fr/#operation">À propos</Link><a href="#demande">Contact</a></nav>
        <div className="fr-topic-header-actions"><LanguageMenu /><a href="#demande" className="fr-topic-button fr-topic-header-cta">Demander un plan</a>
          <button ref={button} type="button" className="fr-topic-mobile-toggle" aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={open} aria-controls="fr-topic-mobile-nav" onClick={() => setOpen(!open)}>{open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}</button>
        </div>
      </div>
      <nav id="fr-topic-mobile-nav" className="fr-topic-mobile-nav shell" aria-label="Navigation mobile" hidden={!open}><TopicMenu /><TopicMenu industry /><Link to="/fr/guides">Guides</Link><a href="#demande" onClick={() => setOpen(false)}>Contact <ArrowRight className="h-4 w-4" /></a></nav>
    </header>
  </>;
}

export function FrenchTopicFooter() {
  return <footer className="fr-topic-footer"><div className="shell">
    <div className="fr-topic-footer-grid"><div><Logo /><p>Du sourcing en Chine au prochain relais confirmé.</p><a href="#demande" className="fr-topic-text-link">Demander un plan <ArrowRight className="h-4 w-4" /></a></div>
      {['service', 'industry'].map(kind => <nav key={kind} aria-label={kind === 'service' ? 'Services du pied de page' : 'Secteurs du pied de page'}><h2>{kind === 'service' ? 'Solutions' : 'Secteurs'}</h2>{Object.values(FR_TOPICS).filter(t => t.kind === kind).map(t => <Link key={t.id} to={t.route}>{t.pageLabel}</Link>)}</nav>)}
    </div>
    <div className="fr-topic-footer-bottom"><p>© {new Date().getFullYear()} FreightVanta · Français · France</p><div><a href={cmsHref('/fr/confidentialite')}>Confidentialité</a><a href={cmsHref('/fr/cookies')}>Cookies</a><button type="button" onClick={openConsentSettings}>Préférences de mesure d’audience</button></div></div>
  </div></footer>;
}
