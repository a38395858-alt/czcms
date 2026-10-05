import {
  ItCoverage,
  ItEnquiry,
  ItFaq,
  ItHero,
  ItIndustries,
  ItOperation,
  ItProcess,
  ItResources,
  ItServices,
} from '../components/it/ItalianHome';
import { ArrowRight, MailIcon, PhoneIcon } from '../components/ui/Icons';
import { siteConfig } from '../config/site';
import { IT_META, itFaq } from '../content/it/home';
import { openConsentSettings, useConsent } from '../lib/analytics';
import { Link, type ItLegalSlug } from '../lib/router';
import { useDocumentMeta, useJsonLd } from '../lib/seo';

export function ItalianHomePage() {
  useDocumentMeta(IT_META);
  useJsonLd('fv-it-jsonld', {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: 'it-IT',
    mainEntity: itFaq.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  });

  return (
    <>
      <ItHero />
      <ItCoverage />
      <ItServices />
      <ItOperation />
      <ItProcess />
      <ItIndustries />
      <ItResources />
      <ItFaq />
      <ItEnquiry />
    </>
  );
}

/* ------------------------------------------------------------------ Pagine legali */
interface LegalSection {
  heading: string;
  body: string;
}

const IT_LEGAL: Record<ItLegalSlug, { title: string; lead: string; sections: LegalSection[] }> = {
  'note-legali': {
    title: 'Note legali',
    lead: 'Identificazione del titolare del sito in italiano di FreightVanta.',
    sections: [],
  },
  privacy: {
    title: 'Informativa sulla privacy',
    lead: 'Come questo sito tratta le informazioni che condivide con FreightVanta.',
    sections: [
      {
        heading: 'Richieste di piano di spedizione',
        body: 'Il modulo raccoglie nome, e-mail di lavoro, azienda, un telefono facoltativo, origine, destinazione, punto di partenza e i dettagli sul carico che decide di condividere. Questi dati servono unicamente a esaminare la Sua richiesta e a ricontattarLa.',
      },
      {
        heading: 'Analisi (con consenso)',
        body: 'L’analisi proprietaria si esegue solo dopo il Suo consenso. Registra quali parti della pagina vengono usate, mai i valori inseriti nel modulo. La Sua scelta si conserva localmente nel browser.',
      },
      {
        heading: 'I Suoi diritti',
        body: 'Ai sensi del Regolamento (UE) 2016/679 (GDPR) può esercitare i diritti di accesso, rettifica, cancellazione, limitazione, portabilità e opposizione. Può inoltre presentare reclamo al Garante per la protezione dei dati personali. Per esercitare i diritti utilizzi i recapiti delle note legali.',
      },
    ],
  },
  cookie: {
    title: 'Informativa sui cookie',
    lead: 'Cosa conserva questo sito nel Suo browser e perché.',
    sections: [
      {
        heading: 'Archiviazione essenziale',
        body: 'La Sua preferenza sull’analisi si conserva localmente nel browser così che il sito possa rispettarla nelle visite successive.',
      },
      {
        heading: 'Analisi proprietaria (facoltativa)',
        body: 'Con il Suo permesso, il sito registra eventi di interazione, come il cambio di servizio o i clic sui collegamenti, per capire quali sezioni aiutano i visitatori. I dati del modulo non sono mai inclusi. Accettare e rifiutare hanno lo stesso peso nell’avviso.',
      },
      {
        heading: 'Come cambiare la scelta',
        body: 'Può modificare la preferenza in qualsiasi momento dal collegamento «Preferenze sui cookie» nel piè di pagina o dal pulsante di questa pagina.',
      },
    ],
  },
};

function OwnerNotice({ children }: { children: string }) {
  return (
    <div className="border-l-4 border-rosso-600 bg-avorio-100 px-5 py-4 text-[15px] leading-relaxed text-verde-900">
      <p className="font-bodoni text-[12px] font-bold uppercase tracking-[0.22em] text-rosso-600">Da completare</p>
      <p className="mt-2">{children}</p>
    </div>
  );
}

export function ItalianLegalPage({ slug }: { slug: ItLegalSlug }) {
  const page = IT_LEGAL[slug];
  const { consent } = useConsent();
  const { email, phone, address } = siteConfig.contact;
  const hasProviderDetails = Boolean(siteConfig.legalEntity || address || email || phone);

  useDocumentMeta({
    title: `${page.title} | FreightVanta`,
    description: page.lead,
    path: `/it/${slug}`,
    lang: 'it-IT',
  });

  return (
    <>
      <section className="bg-avorio-50">
        <div className="shell pb-14 pt-10 sm:pb-16 sm:pt-12">
          <nav aria-label="Percorso di navigazione">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-fumo-600">
              <li>
                <Link to="/it" className="underline decoration-verde-900/30 underline-offset-4 hover:text-verde-900">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-verde-950">
                {page.title}
              </li>
            </ol>
          </nav>
          <p className="it-kicker mt-8 text-rosso-600">Informazioni legali</p>
          <h1 className="mt-5 max-w-3xl font-bodoni text-[2.4rem] font-bold leading-[1.04] text-verde-950 sm:text-5xl">
            {page.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-fumo-600">{page.lead}</p>
        </div>
        <div aria-hidden="true" className="it-rule-gold" />
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="shell max-w-3xl space-y-10">
          {slug === 'note-legali' && (
            <div className="space-y-8">
              <div className="border-t-2 border-verde-900/15 pt-6">
                <h2 className="font-bodoni text-2xl font-bold text-verde-950">Titolare del sito</h2>
                {hasProviderDetails ? (
                  <dl className="mt-4 space-y-3 text-[17px] leading-relaxed text-verde-900">
                    {siteConfig.legalEntity && (
                      <div>
                        <dt className="font-bold text-verde-950">Titolare</dt>
                        <dd>{siteConfig.legalEntity}</dd>
                      </div>
                    )}
                    {address && (
                      <div>
                        <dt className="font-bold text-verde-950">Sede</dt>
                        <dd>{address}</dd>
                      </div>
                    )}
                    {(email || phone) && (
                      <div>
                        <dt className="font-bold text-verde-950">Contatti</dt>
                        <dd className="flex flex-col gap-1">
                          {email && (
                            <a href={`mailto:${email}`} className="inline-flex items-center gap-2 text-verde-800 underline underline-offset-4">
                              <MailIcon className="h-4 w-4" />
                              {email}
                            </a>
                          )}
                          {phone && (
                            <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="inline-flex items-center gap-2 text-verde-800 underline underline-offset-4">
                              <PhoneIcon className="h-4 w-4" />
                              {phone}
                            </a>
                          )}
                        </dd>
                      </div>
                    )}
                  </dl>
                ) : (
                  <div className="mt-4">
                    <OwnerNotice>
                      Le informazioni richieste dal D.Lgs. 9 aprile 2003, n. 70 sul commercio elettronico e dall’art.
                      2250 c.c. — denominazione, sede, partita IVA, iscrizione al Registro delle Imprese, capitale
                      sociale ed e-mail — saranno completate e verificate dal titolare prima della pubblicazione.
                      Questo modello non inventa alcun dato.
                    </OwnerNotice>
                  </div>
                )}
              </div>
              <OwnerNotice>
                Le responsabilità dello sdoganamento, le sedi di magazzino e l’ambito dei servizi si confermano in
                ciascun piano di spedizione. I contenuti del sito sono informazioni generali e non costituiscono
                consulenza legale, doganale o fiscale.
              </OwnerNotice>
            </div>
          )}

          {page.sections.map((section) => (
            <div key={section.heading} className="border-t-2 border-verde-900/15 pt-6">
              <h2 className="font-bodoni text-2xl font-bold text-verde-950">{section.heading}</h2>
              <p className="mt-3 text-[17px] leading-relaxed text-verde-900">{section.body}</p>
            </div>
          ))}

          {slug === 'privacy' && (
            <OwnerNotice>
              Questa sintesi descrive il comportamento del modello di sito. L’informativa completa e validata
              giuridicamente (titolare del trattamento, basi giuridiche, tempi di conservazione ed eventuale
              responsabile della protezione dei dati) sarà aggiunta dal titolare prima della pubblicazione.
            </OwnerNotice>
          )}

          {slug !== 'note-legali' && (
            <div className="bg-avorio-100 p-6">
              <p className="font-bold text-verde-950">
                Preferenza di analisi:{' '}
                {consent === 'granted' ? 'accettata' : consent === 'denied' ? 'rifiutata' : 'non ancora scelta'}
              </p>
              <button
                type="button"
                onClick={openConsentSettings}
                className="mt-3 inline-flex items-center gap-2 font-bold text-verde-800 underline decoration-2 underline-offset-4"
              >
                Modifichi le preferenze sui cookie
              </button>
            </div>
          )}

          <Link
            to="/it"
            className="inline-flex items-center gap-2 font-bold text-rosso-600 underline decoration-rosso-600/40 decoration-2 underline-offset-4 hover:decoration-rosso-600"
          >
            Torni alla pagina iniziale
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
