import type { ReactNode } from 'react';
import { EnquiryForm } from '../../../components/enquiry/EnquiryForm';
import { ArrowRight, MailIcon, PhoneIcon, PinIcon } from '../../../components/ui/Icons';
import { SITE_META, hasDirectContact, siteConfig } from '../../../config/site';
import { IT_ANCHORS, enquiryIt, operationIt, processIt } from '../../../content/it/home';
import { getMedia } from '../../../content/media';
import { openConsentSettings, setConsent, useConsent } from '../../../lib/analytics';
import { itStrings } from '../../../lib/enquiry-i18n';
import { Link } from '../../../lib/router';
import { useDocumentMeta } from '../../../lib/seo';
import { ItPrivacyNotice } from '../components/ItHome';
import { ItCheckList, ItCtaBand, ItPageHero } from '../components/ItParts';

const IT = { ogLocale: 'it_IT' };

/* ------------------------------------------------------------------ Chi siamo */
export function ItAboutPage() {
  useDocumentMeta({
    title: 'Chi siamo | FreightVanta',
    description:
      'FreightVanta trasforma passaggi dispersi di acquisti e trasporto in un piano di spedizione concreto, per importatori, negozi online, team di prodotto, distributori e marchi in crescita.',
    path: '/it/chi-siamo',
    ...IT,
  });
  const audiences = ['Importatori', 'Negozi online', 'Team di prodotto', 'Distributori', 'Marchi in crescita'];
  const confirmations = [
    'Tempi, tariffe e perimetro si confermano nel piano di spedizione, mai promessi in anticipo.',
    'Responsabilità doganali, rappresentante doganale e perimetro dello sdoganamento si definiscono prima di ogni impegno.',
    'Il perimetro di magazzino e logistica e-commerce si conferma prima di muovere lo stock.',
    'Se cambia un’ipotesi, il piano mostra il cambiamento.',
  ];

  return (
    <>
      <ItPageHero
        breadcrumbs={[{ label: 'Home', to: '/it/' }, { label: 'Chi siamo' }]}
        eyebrow="Chi siamo"
        title="Un piano di spedizione concreto."
        lead="FreightVanta trasforma passaggi dispersi di acquisti e trasporto in un piano con cui il suo team può lavorare."
        media={getMedia('it-about-porto')}
        mediaAlt="Gru portacontainer in un porto al tramonto."
      />
      <section aria-labelledby="it-about-who" className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="it-about-who" className="it-h2 text-grafite-900">
              Con chi lavoriamo
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-grafite-600">
              Aziende in crescita che acquistano in Cina e vendono a clienti in Italia e nell’Unione europea, e che hanno bisogno che l’intero percorso, dalla ricerca fornitori alla consegna al destinatario, resti leggibile.
            </p>
          </div>
          <ul className="border-t-2 border-grafite-900 lg:col-span-6 lg:col-start-7">
            {audiences.map((audience, index) => (
              <li key={audience} className="flex items-baseline gap-4 border-b border-grafite-200 py-4 font-it-display text-2xl font-semibold text-grafite-900">
                <span aria-hidden="true" className="it-folio">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {audience}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section aria-labelledby="it-about-how" className="bg-grafite-900 py-16 text-white sm:py-20 lg:py-24">
        <div className="shell">
          <h2 id="it-about-how" className="it-h2 max-w-3xl text-white">
            Come lavoriamo
          </h2>
          <ul className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4">
            {operationIt.items.map((item, index) => (
              <li key={item.title} className="border-t border-white/20 py-7 lg:border-l lg:border-t-0 lg:px-6 lg:py-0 lg:first:border-l-0 lg:first:pl-0">
                <span className="font-it-display text-[0.95rem] font-semibold text-rosso-500">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="mt-4 font-it-display text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-grafite-300">{item.copy}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section aria-labelledby="it-about-confirm" className="bg-nebbia-50 py-16 sm:py-20 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="it-about-confirm" className="it-h2 text-grafite-900">
              Che cosa verifichiamo prima di impegnarci
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-grafite-600">{processIt.body}</p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <ItCheckList items={confirmations} />
          </div>
        </div>
      </section>
      <ItCtaBand />
    </>
  );
}

/* ------------------------------------------------------------------ Contatti */
export function ItContactPage() {
  useDocumentMeta({ title: 'Contatti | Richiedi un piano di spedizione | FreightVanta', description: enquiryIt.body, path: '/it/contatti', ...IT });
  const { email, phone, address } = siteConfig.contact;
  const pec = siteConfig.noteLegali.pec;

  return (
    <>
      <ItPageHero breadcrumbs={[{ label: 'Home', to: '/it/' }, { label: 'Contatti' }]} eyebrow="Contatti" title="Parli con FreightVanta" lead={enquiryIt.body} />
      <section aria-labelledby="it-contact-form-title" className="bg-nebbia-100 py-16 sm:py-20 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="it-contact-form-title" className="font-it-display text-[2rem] font-semibold leading-tight tracking-[-0.015em] text-grafite-900">
              Richiedi un piano di spedizione
            </h2>
            {(hasDirectContact || pec) && (
              <ul className="mt-6 space-y-3 text-[16px] text-grafite-800">
                {email && (
                  <li>
                    <a href={`mailto:${email}`} className="it-link">
                      <MailIcon className="h-4 w-4" />
                      {email}
                    </a>
                  </li>
                )}
                {pec && (
                  <li>
                    <a href={`mailto:${pec}`} className="it-link">
                      <MailIcon className="h-4 w-4" />
                      PEC: {pec}
                    </a>
                  </li>
                )}
                {phone && (
                  <li>
                    <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="it-link">
                      <PhoneIcon className="h-4 w-4" />
                      {phone}
                    </a>
                  </li>
                )}
                {address && (
                  <li className="flex gap-2">
                    <PinIcon className="mt-1 h-4 w-4 shrink-0" />
                    <span>{address}</span>
                  </li>
                )}
              </ul>
            )}
            <h3 className="it-eyebrow mt-10 text-grafite-500">Utile da indicare</h3>
            <p className="mt-3 text-[16px] leading-relaxed text-grafite-800">{processIt.items[0].copy}</p>
            <ItCheckList items={enquiryIt.settings.reassurance} className="mt-6" />
          </div>
          <div className="lg:col-span-7">
            <EnquiryForm
              idPrefix="it-contatti"
              placement="contact"
              copy={enquiryIt.settings}
              strings={itStrings}
              theme="grafica"
              privacyUrl={siteConfig.legalIt.privacy}
              siteId={SITE_META.it.siteId}
              locale={SITE_META.it.locale}
            />
            <ItPrivacyNotice />
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ Pagine legali */
const PLACEHOLDER = 'Da completare dal titolare prima della pubblicazione';

function Value({ value, multiline = false }: { value: string | string[]; multiline?: boolean }) {
  const lines = Array.isArray(value) ? value : [value];
  const filled = lines.some((line) => line.trim() !== '');
  if (!filled) return <span className="border border-dashed border-rosso-600 bg-rosso-100 px-2 py-0.5 text-[14px] text-rosso-700">[{PLACEHOLDER}]</span>;
  if (!multiline) return <span>{lines.join(' ')}</span>;
  return (
    <span className="block">
      {lines.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </span>
  );
}

function LegalShell({ title, lead, children, breadcrumb }: { title: string; lead: string; children: ReactNode; breadcrumb: string }) {
  return (
    <>
      <ItPageHero breadcrumbs={[{ label: 'Home', to: '/it/' }, { label: breadcrumb }]} eyebrow="Informazioni legali" title={title} lead={lead} />
      <section className="bg-white py-16 sm:py-20">
        <div className="shell max-w-3xl space-y-10 text-grafite-700">{children}</div>
      </section>
    </>
  );
}

function LegalBlock({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <div className="border-t border-grafite-200 pt-6">
      <h2 className="font-it-display text-2xl font-semibold text-grafite-900">{heading}</h2>
      <div className="mt-3 space-y-3 text-[17px] leading-relaxed">{children}</div>
    </div>
  );
}

function DraftNotice({ children }: { children: ReactNode }) {
  return (
    <p className="border-l-2 border-rosso-600 bg-nebbia-50 px-5 py-4 text-[15px] leading-relaxed text-grafite-700">
      <span className="it-eyebrow mr-2 text-rosso-700">Bozza</span>
      {children}
    </p>
  );
}

const IT_LEGAL_SLUGS = ['note-legali', 'privacy', 'cookie', 'condizioni'] as const;
export type ItLegalSlug = (typeof IT_LEGAL_SLUGS)[number];
export const isItLegalSlug = (slug: string): slug is ItLegalSlug => (IT_LEGAL_SLUGS as readonly string[]).includes(slug);

export function ItLegalPage({ slug }: { slug: ItLegalSlug }) {
  switch (slug) {
    case 'note-legali':
      return <NoteLegaliPage />;
    case 'privacy':
      return <PrivacyPage />;
    case 'cookie':
      return <CookiePage />;
    default:
      return <CondizioniPage />;
  }
}

function NoteLegaliPage() {
  useDocumentMeta({ title: 'Note legali | FreightVanta', description: 'Dati societari del titolare del sito ai sensi dell’art. 2250 del Codice Civile.', path: '/it/note-legali', ...IT });
  const n = siteConfig.noteLegali;
  const { email, phone } = siteConfig.contact;
  const complete = Boolean(n.company && n.vatId && n.addressLines.length && n.registry && n.rea && email);

  return (
    <LegalShell
      title="Note legali"
      lead="Dati societari indicati ai sensi dell’art. 2250 del Codice Civile e informazioni sull’uso di questo sito."
      breadcrumb="Note legali"
    >
      {!complete && (
        <DraftNotice>
          I dati obbligatori si gestiscono nella configurazione del sito e devono essere completati dal titolare prima della pubblicazione. Questo modello non inventa denominazioni sociali, partite IVA, dati registrali o recapiti.
        </DraftNotice>
      )}
      <LegalBlock heading="Titolare del sito">
        <p>
          Denominazione: <Value value={n.company} />
        </p>
        <p>
          Sede legale: <Value value={n.addressLines} multiline />
        </p>
        <p>
          Partita IVA: <Value value={n.vatId} />
        </p>
        <p>
          Codice fiscale: <Value value={n.taxCode} />
        </p>
        <p>
          Registro delle Imprese: <Value value={n.registry} />
        </p>
        <p>
          Numero REA: <Value value={n.rea} />
        </p>
        <p>
          Capitale sociale: <Value value={n.shareCapital} />
        </p>
      </LegalBlock>
      <LegalBlock heading="Contatti">
        <p>E-mail: {email ? <a href={`mailto:${email}`} className="it-link">{email}</a> : <Value value="" />}</p>
        <p>PEC: {n.pec ? <a href={`mailto:${n.pec}`} className="it-link">{n.pec}</a> : <Value value="" />}</p>
        <p>Telefono: {phone ? <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="it-link">{phone}</a> : <Value value="" />}</p>
      </LegalBlock>
      <LegalBlock heading="Oggetto del sito">
        <p>Questo sito presenta i servizi di coordinamento di acquisti, trasporto, magazzino e consegna di FreightVanta. L’accesso e la navigazione comportano l’accettazione di queste note legali.</p>
      </LegalBlock>
      <LegalBlock heading="Proprietà intellettuale">
        <p>I contenuti di questo sito (testi, struttura, grafica e illustrazioni) sono protetti dalla normativa sul diritto d’autore. Ne è vietata la riproduzione non autorizzata.</p>
      </LegalBlock>
      <LegalBlock heading="Responsabilità">
        <p>I contenuti hanno finalità informativa e non costituiscono un’offerta vincolante né consulenza legale, doganale o fiscale. Il titolare non risponde dei contenuti dei siti di terzi collegati.</p>
      </LegalBlock>
      <LegalBlock heading="Crediti fotografici">
        <p>Fotografie: Pexels (tra gli altri Павел Хлыстунов, Diego F. Parra, DeLuca G, Tiger Lily, RDNE Stock project e Quang Nguyen Vinh) con licenza Pexels.</p>
      </LegalBlock>
      <LegalBlock heading="Legge applicabile">
        <p>Queste note legali sono regolate dalla legge italiana.</p>
      </LegalBlock>
    </LegalShell>
  );
}

function PrivacyPage() {
  useDocumentMeta({ title: 'Informativa privacy | FreightVanta', description: 'Informazioni sul trattamento dei dati personali ai sensi del GDPR e del Codice Privacy.', path: '/it/privacy', ...IT });
  const n = siteConfig.noteLegali;
  const { consent } = useConsent();
  const { email } = siteConfig.contact;

  return (
    <LegalShell
      title="Informativa privacy"
      lead="Informazioni sul trattamento dei suoi dati personali ai sensi dell’art. 13 del Regolamento (UE) 2016/679 (GDPR) e del D.lgs. 196/2003 (Codice Privacy)."
      breadcrumb="Informativa privacy"
    >
      <DraftNotice>
        Questa informativa descrive le funzioni effettive di questo modello (modulo di richiesta, memorizzazione locale del consenso, misurazione statistica di prima parte facoltativa e font ospitati localmente). Il titolare deve riesaminarla prima della pubblicazione e completarla con fornitore di hosting, tempi di conservazione ed eventuali altri trattamenti.
      </DraftNotice>
      <LegalBlock heading="1. Titolare del trattamento">
        <p>
          <Value value={n.company} />
          <br />
          <Value value={n.addressLines} multiline />
        </p>
        <p>E-mail: {email ? <a href={`mailto:${email}`} className="it-link">{email}</a> : <Value value="" />}</p>
        {n.dpoContact && <p>Responsabile della protezione dei dati (DPO): {n.dpoContact}</p>}
      </LegalBlock>
      <LegalBlock heading="2. Finalità e basi giuridiche">
        <p>
          <strong className="text-grafite-900">Richiesta di un piano di spedizione.</strong> Trattiamo i dati che lei indica (nome e cognome, e-mail aziendale, azienda, telefono facoltativo, origine e destinazione, punto di partenza, dettagli della merce e informazioni aggiuntive) unicamente per gestire la sua richiesta e ricontattarla. Basi giuridiche: il suo consenso (art. 6.1.a GDPR) e le misure precontrattuali adottate su sua richiesta (art. 6.1.b GDPR). Per contrastare gli invii automatizzati vengono verificati un campo nascosto e l’orario di inizio compilazione; ogni richiesta è registrata con un identificativo tecnico.
        </p>
        <p>
          <strong className="text-grafite-900">Navigazione e log del server.</strong> Il fornitore di hosting tratta dati tecnicamente necessari (indirizzo IP, data e ora, pagina richiesta, tipo di browser) per erogare il sito e garantirne la sicurezza. Base giuridica: legittimo interesse (art. 6.1.f GDPR).
        </p>
        <p>
          <strong className="text-grafite-900">Statistiche di utilizzo.</strong> Solo con il suo consenso (art. 122 del Codice Privacy e art. 6.1.a GDPR) registriamo eventi di interazione, come cambi di scheda, clic sui link o l’inizio della compilazione del modulo, insieme a pagina, lingua e orario. Ciò che scrive nei moduli non viene mai trasmesso. La misurazione è di prima parte, senza fornitori terzi.
        </p>
      </LegalBlock>
      <LegalBlock heading="3. Tempi di conservazione">
        <p>
          I dati sono conservati per il tempo necessario a gestire la richiesta e, successivamente, nei termini previsti dalla legge. Tempi specifici e sistemi destinatari (ad esempio un CRM): <Value value="" />
        </p>
      </LegalBlock>
      <LegalBlock heading="4. Destinatari e responsabili del trattamento">
        <p>
          I dati non sono diffusi a terzi, salvo obblighi di legge. I fornitori che erogano servizi per nostro conto (ad esempio hosting o gestione delle richieste) agiscono come responsabili del trattamento designati ai sensi dell’art. 28 GDPR. Fornitori ed eventuali trasferimenti extra-UE: <Value value="" />
        </p>
      </LegalBlock>
      <LegalBlock heading="5. Font e immagini">
        <p>
          I font (Bodoni Moda e Manrope) sono ospitati localmente sul sito: non viene stabilita alcuna connessione con servizi di font di terze parti. Il caricamento delle fotografie può stabilire una connessione con la rete di distribuzione del fornitore Pexels, con trasmissione del suo indirizzo IP. Per l’esercizio in produzione consigliamo di ospitare tutte le immagini su server propri.
        </p>
      </LegalBlock>
      <LegalBlock heading="6. I suoi diritti">
        <p>
          Può esercitare i diritti di accesso, rettifica, cancellazione, limitazione, opposizione e portabilità (artt. 15-22 GDPR) e revocare il consenso in qualsiasi momento, scrivendo ai recapiti indicati. Ha inoltre diritto di proporre reclamo al Garante per la protezione dei dati personali (www.garanteprivacy.it).
        </p>
        <p>
          Scelta attuale sulle statistiche: {consent === 'granted' ? 'accettate' : consent === 'denied' ? 'rifiutate' : 'non ancora espressa'}.{' '}
          <button type="button" onClick={openConsentSettings} className="it-link">
            Gestisci le preferenze
          </button>
        </p>
      </LegalBlock>
      <LegalBlock heading="7. Aggiornamento">
        <p>Ultimo aggiornamento di questa informativa: settembre 2026.</p>
      </LegalBlock>
    </LegalShell>
  );
}

function CookiePage() {
  useDocumentMeta({ title: 'Cookie policy | FreightVanta', description: 'Che cosa memorizza questo sito nel suo browser, perché e come gestirlo.', path: '/it/cookie', ...IT });
  const { consent } = useConsent();
  const rows = [
    { name: 'fv.analytics-consent.v1', owner: 'Prima parte', purpose: 'Tecnico: ricorda la sua scelta sulle statistiche (non richiede consenso).', duration: 'Persistente, fino a cancellazione' },
    { name: 'fv.site-choice.v1', owner: 'Prima parte', purpose: 'Funzionale su sua richiesta: ricorda la lingua che ha scelto.', duration: 'Persistente, fino a cancellazione' },
    { name: 'fv.locale-suggestion.dismissed', owner: 'Prima parte', purpose: 'Tecnico: ricorda che ha chiuso l’avviso sulla lingua.', duration: 'Sessione' },
    { name: 'Statistiche (eventi)', owner: 'Prima parte', purpose: 'Analitico: quali sezioni aiutano a pianificare le spedizioni. Solo con il suo consenso.', duration: 'Secondo il sistema destinatario' },
  ];

  return (
    <LegalShell
      title="Cookie policy"
      lead="Che cosa memorizza questo sito nel suo browser, per quale finalità e come gestirlo, ai sensi dell’art. 122 del Codice Privacy e delle Linee guida cookie del Garante."
      breadcrumb="Cookie policy"
    >
      <LegalBlock heading="Cookie e strumenti analoghi">
        <p>Sono piccoli file o voci di archiviazione che un sito salva nel suo browser. Questo sito non utilizza cookie di terze parti: solo archiviazione locale di prima parte.</p>
      </LegalBlock>
      <div className="border-t border-grafite-200 pt-6">
        <h2 className="font-it-display text-2xl font-semibold text-grafite-900">Che cosa utilizziamo</h2>
        <div className="mt-4 overflow-x-auto border border-grafite-900">
          <table className="w-full min-w-[36rem] text-left text-[15px]">
            <caption className="sr-only">Archiviazione utilizzata da questo sito</caption>
            <thead className="border-b border-grafite-900 bg-nebbia-100 text-[12px] font-semibold uppercase tracking-[0.1em] text-grafite-900">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Nome
                </th>
                <th scope="col" className="px-4 py-3">
                  Titolarità
                </th>
                <th scope="col" className="px-4 py-3">
                  Finalità
                </th>
                <th scope="col" className="px-4 py-3">
                  Durata
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grafite-200 bg-white">
              {rows.map((row) => (
                <tr key={row.name}>
                  <th scope="row" className="px-4 py-3 font-mono text-[13px] font-normal text-grafite-900">
                    {row.name}
                  </th>
                  <td className="px-4 py-3">{row.owner}</td>
                  <td className="px-4 py-3">{row.purpose}</td>
                  <td className="px-4 py-3">{row.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="border border-grafite-900 bg-nebbia-50 p-6">
        <h2 className="font-it-display text-xl font-semibold text-grafite-900">Gestisci la tua scelta</h2>
        <p className="mt-2 text-[16px] leading-relaxed">
          Scelta attuale: <strong className="text-grafite-900">{consent === 'granted' ? 'statistiche accettate' : consent === 'denied' ? 'statistiche rifiutate' : 'non ancora espressa'}</strong>. Rifiutare è semplice quanto accettare e può cambiare idea in qualsiasi momento.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={() => setConsent('denied')} aria-pressed={consent === 'denied'} className="it-btn it-btn-outline min-h-11 px-5 text-sm">
            Rifiuta le statistiche
          </button>
          <button type="button" onClick={() => setConsent('granted')} aria-pressed={consent === 'granted'} className="it-btn it-btn-outline min-h-11 px-5 text-sm">
            Accetta le statistiche
          </button>
        </div>
        <p className="mt-4 text-sm text-grafite-500">Può inoltre cancellare l’archiviazione dalle impostazioni del suo browser.</p>
      </div>
      <Link to="/it/contatti" className="it-link">
        Contatta FreightVanta
        <ArrowRight className="h-4 w-4" />
      </Link>
    </LegalShell>
  );
}

function CondizioniPage() {
  useDocumentMeta({ title: 'Condizioni generali | FreightVanta', description: 'Condizioni d’uso del sito e quadro di conclusione dei servizi.', path: '/it/condizioni', ...IT });
  return (
    <LegalShell title="Condizioni generali" lead="Condizioni d’uso di questo sito e quadro in cui si concludono i servizi." breadcrumb="Condizioni generali">
      <DraftNotice>
        Le condizioni generali complete — compresa l’eventuale adozione delle condizioni generali di settore (ad esempio quelle di Fedespedi per le case di spedizione) e il regime di responsabilità applicabile al trasporto — devono essere definite dal titolare e dal suo consulente legale prima della pubblicazione.
      </DraftNotice>
      <LegalBlock heading="Ambito">
        <p>Questa offerta si rivolge esclusivamente a imprese e professionisti. I contenuti di questo sito non costituiscono un’offerta in senso giuridico.</p>
      </LegalBlock>
      <LegalBlock heading="Conclusione dei servizi">
        <p>Perimetro, responsabilità, prezzi, tempi e limiti di responsabilità sono concordati esclusivamente nel piano di spedizione scritto o nel preventivo. Le informazioni di questo sito non comportano alcun impegno su tempi di resa, prezzi o esiti dello sdoganamento.</p>
      </LegalBlock>
      <LegalBlock heading="Contenuti delle guide">
        <p>Le guide e i contenuti del sito sono informazioni generali di pianificazione e non sostituiscono la consulenza legale, doganale o fiscale.</p>
      </LegalBlock>
      <LegalBlock heading="Legge applicabile">
        <p>Le presenti condizioni sono regolate dalla legge italiana, fatte salve le norme imperative applicabili.</p>
      </LegalBlock>
    </LegalShell>
  );
}

/* ------------------------------------------------------------------ 404 */
export function ItNotFoundPage({ path }: { path: string }) {
  useDocumentMeta({ title: 'Pagina non trovata | FreightVanta', description: 'La pagina richiesta non è disponibile.', path, ...IT });
  return (
    <section className="border-b border-grafite-900 bg-white py-24 text-grafite-900 sm:py-32">
      <div className="shell max-w-3xl">
        <p className="it-eyebrow text-rosso-700">Rotta non trovata</p>
        <h1 className="mt-5 font-it-display text-5xl font-semibold leading-tight tracking-[-0.02em]">Questo passaggio non porta da nessuna parte.</h1>
        <p className="mt-5 text-lg text-grafite-600">
          La pagina <span className="font-mono text-base text-grafite-900">{path}</span> non è disponibile. Scelga un passo successivo.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link to="/it/" className="it-btn it-btn-primary">
            Torna alla home
          </Link>
          <Link to={IT_ANCHORS.services} className="it-btn it-btn-outline">
            Vedi i servizi
          </Link>
        </div>
      </div>
    </section>
  );
}
