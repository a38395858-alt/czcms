import { useEffect, useRef, useState } from 'react';
import { ES_TOPICS } from '../../content/es/topics';
import { LOCALIZED_HOMEPAGES } from '../../config/site';
import { cmsContext, cmsHref, languageHref } from '../../lib/cms';
import { openConsentSettings } from '../../lib/analytics';
import { Link } from '../../lib/router';
import { ArrowRight, ChevronDown, CloseIcon, MenuIcon } from '../ui/Icons';

const topicNotes = new Map(Object.values(ES_TOPICS).flatMap(t => [...t.related.links, ...(t.relatedIndustries?.links ?? [])]).map(link => [link.href, link.note]));

function Logo() {
  return <Link to="/es" className="es-topic-logo" aria-label="FreightVanta — inicio">
    <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><rect x="1" y="1" width="30" height="30" rx="4" fill="none" stroke="currentColor" opacity=".3" /><path d="M7 23 13 13l6 6 7-11" stroke="currentColor" strokeWidth="2.4" fill="none" /><circle cx="26" cy="8" r="3" fill="#a33a1b" /></svg>
    <span>Freight<span>Vanta</span></span>
  </Link>;
}

function TopicMenu({ industry = false }: { industry?: boolean }) {
  const current = cmsContext()?.route;
  return <details data-public-menu className="es-topic-menu">
    <summary>{industry ? 'Sectores' : 'Servicios'} <ChevronDown className="h-4 w-4" /></summary>
    <div className="es-topic-menu-panel">
      {Object.entries(ES_TOPICS).filter(([, t]) => (t.kind === 'industry') === industry).map(([route, topic]) => <Link key={route} to={topic.route} aria-current={route === current ? 'page' : undefined}>
        <strong>{topic.pageLabel}</strong><span>{topicNotes.get(topic.route)}</span><ArrowRight className="h-4 w-4" />
      </Link>)}
    </div>
  </details>;
}

function LanguageMenu() {
  return <details data-public-menu className="es-topic-language">
    <summary aria-label="Cambiar idioma">ES <ChevronDown className="h-4 w-4" /></summary>
    <div>{LOCALIZED_HOMEPAGES.map(language => <a key={language.hreflang} href={languageHref(language.hreflang)} hrefLang={language.hreflang} lang={language.hreflang} aria-current={language.hreflang === 'es' ? 'page' : undefined}>{language.label}</a>)}</div>
  </details>;
}

export function SpanishTopicHeader() {
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
    <div className="es-topic-announcement"><a href="#solicitud">¿Mercancía de China con destino a España o a la UE? Solicita un plan de envío a un especialista en logística. <ArrowRight className="h-4 w-4" /></a></div>
    <header className="es-topic-header">
      <div className="shell es-topic-header-row">
        <Logo />
        <nav aria-label="Navegación principal"><TopicMenu /><TopicMenu industry /><Link to="/es/guides">Guías</Link><Link to="/es/about">Quiénes somos</Link><a href="#solicitud">Contacto</a></nav>
        <div className="es-topic-header-actions"><LanguageMenu /><a href="#solicitud" className="es-topic-button es-topic-header-cta">Solicitar un plan</a>
          <button ref={button} type="button" className="es-topic-mobile-toggle" aria-label={open ? 'Cerrar el menú' : 'Abrir el menú'} aria-expanded={open} aria-controls="es-topic-mobile-nav" onClick={() => setOpen(!open)}>{open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}</button>
        </div>
      </div>
      <nav id="es-topic-mobile-nav" className="es-topic-mobile-nav shell" aria-label="Navegación móvil" hidden={!open}><TopicMenu /><TopicMenu industry /><Link to="/es/guides">Guías</Link><a href="#solicitud" onClick={() => setOpen(false)}>Contacto <ArrowRight className="h-4 w-4" /></a></nav>
    </header>
  </>;
}

export function SpanishTopicFooter() {
  return <footer className="es-topic-footer"><div className="shell">
    <div className="es-topic-footer-grid"><div><Logo /><p>Del sourcing en China al siguiente relevo confirmado.</p><a href="#solicitud" className="es-topic-text-link">Solicitar un plan <ArrowRight className="h-4 w-4" /></a></div>
      {['service', 'industry'].map(kind => <nav key={kind} aria-label={kind === 'service' ? 'Servicios del pie de página' : 'Sectores del pie de página'}><h2>{kind === 'service' ? 'Servicios' : 'Sectores'}</h2>{Object.values(ES_TOPICS).filter(t => t.kind === kind).map(t => <Link key={t.id} to={t.route}>{t.pageLabel}</Link>)}</nav>)}
    </div>
    <div className="es-topic-footer-bottom"><p>© {new Date().getFullYear()} FreightVanta · Español · España</p><div><a href={cmsHref('/es/privacidad')}>Privacidad</a><a href={cmsHref('/es/cookies')}>Cookies</a><button type="button" onClick={openConsentSettings}>Preferencias de analítica</button></div></div>
  </div></footer>;
}
