import {
  EsCoverage,
  EsEnquiry,
  EsFaq,
  EsHero,
  EsIndustries,
  EsOperation,
  EsProcess,
  EsResources,
  EsServices,
} from '../components/es/SpanishHome';
import { ArrowRight, MailIcon, PhoneIcon } from '../components/ui/Icons';
import { siteConfig } from '../config/site';
import { ES_META, esFaq } from '../content/es/home';
import { openConsentSettings, useConsent } from '../lib/analytics';
import { Link, type EsLegalSlug } from '../lib/router';
import { useDocumentMeta, useJsonLd } from '../lib/seo';

export function SpanishHomePage() {
  useDocumentMeta(ES_META);
  useJsonLd('fv-es-jsonld', {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: 'es-ES',
    mainEntity: esFaq.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  });

  return (
    <>
      <EsHero />
      <div aria-hidden="true" className="azulejo-strip" />
      <EsCoverage />
      <EsServices />
      <EsOperation />
      <EsProcess />
      <EsIndustries />
      <EsResources />
      <EsFaq />
      <EsEnquiry />
    </>
  );
}

/* ------------------------------------------------------------------ Páginas legales */
interface LegalSection {
  heading: string;
  body: string;
}

const ES_LEGAL: Record<EsLegalSlug, { title: string; lead: string; sections: LegalSection[] }> = {
  'aviso-legal': {
    title: 'Aviso legal',
    lead: 'Identificación del titular del sitio web en español de FreightVanta.',
    sections: [],
  },
  privacidad: {
    title: 'Política de privacidad',
    lead: 'Cómo trata este sitio web la información que usted comparte con FreightVanta.',
    sections: [
      {
        heading: 'Solicitudes de plan de envío',
        body: 'El formulario recoge su nombre, correo electrónico profesional, empresa, un teléfono opcional, origen, destino, punto de partida y los detalles de la carga que decida compartir. Estos datos se utilizan únicamente para revisar su solicitud y ponernos en contacto con usted.',
      },
      {
        heading: 'Analítica (con consentimiento)',
        body: 'La analítica propia solo se ejecuta después de que usted la acepte. Registra qué partes de la página se utilizan, nunca los valores que escribe en el formulario. Su elección se guarda localmente en su navegador.',
      },
      {
        heading: 'Sus derechos',
        body: 'De acuerdo con el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), puede ejercer sus derechos de acceso, rectificación, supresión, limitación del tratamiento, portabilidad y oposición. También puede presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD). Para ejercer sus derechos, utilice los datos de contacto del aviso legal.',
      },
    ],
  },
  cookies: {
    title: 'Política de cookies',
    lead: 'Qué almacena este sitio web en su navegador y para qué.',
    sections: [
      {
        heading: 'Almacenamiento esencial',
        body: 'Su preferencia sobre la analítica se guarda localmente en su navegador para que el sitio pueda respetarla en futuras visitas.',
      },
      {
        heading: 'Analítica propia (opcional)',
        body: 'Con su permiso, el sitio registra eventos de interacción, como el cambio de servicio o los clics en enlaces, para entender qué secciones ayudan a los visitantes. Los datos del formulario nunca se incluyen. Aceptar y rechazar tienen el mismo peso en el aviso.',
      },
      {
        heading: 'Cómo cambiar su elección',
        body: 'Puede modificar su preferencia en cualquier momento desde el enlace «Preferencias de cookies» del pie de página o con el botón de esta página.',
      },
    ],
  },
};

function OwnerNotice({ children }: { children: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-carbon-900/30 bg-arena-100 px-5 py-4 text-[15px] leading-relaxed text-carbon-800">
      <p className="font-bricolage text-[11.5px] font-bold uppercase tracking-[0.18em] text-terra-600">Pendiente de completar</p>
      <p className="mt-2">{children}</p>
    </div>
  );
}

export function SpanishLegalPage({ slug }: { slug: EsLegalSlug }) {
  const page = ES_LEGAL[slug];
  const { consent } = useConsent();
  const { email, phone, address } = siteConfig.contact;
  const hasProviderDetails = Boolean(siteConfig.legalEntity || address || email || phone);

  useDocumentMeta({
    title: `${page.title} | FreightVanta`,
    description: page.lead,
    path: `/es/${slug}`,
    lang: 'es-ES',
  });

  return (
    <>
      <section className="bg-arena-50">
        <div className="shell pb-14 pt-10 sm:pb-16 sm:pt-12">
          <nav aria-label="Ruta de navegación">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-carbon-600">
              <li>
                <Link to="/es" className="underline decoration-carbon-600/40 underline-offset-4 hover:text-carbon-900">
                  Inicio
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-carbon-900">
                {page.title}
              </li>
            </ol>
          </nav>
          <p className="es-kicker mt-8 text-terra-600">Información legal</p>
          <h1 className="mt-5 max-w-3xl font-bricolage text-[2.4rem] font-extrabold leading-[1.05] tracking-tight text-carbon-900 sm:text-5xl">
            {page.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-carbon-600">{page.lead}</p>
        </div>
        <div aria-hidden="true" className="azulejo-strip" />
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="shell max-w-3xl space-y-10">
          {slug === 'aviso-legal' && (
            <div className="space-y-8">
              <div className="border-t-2 border-carbon-900/15 pt-6">
                <h2 className="font-bricolage text-2xl font-bold text-carbon-900">Titular del sitio web</h2>
                {hasProviderDetails ? (
                  <dl className="mt-4 space-y-3 text-[17px] leading-relaxed text-carbon-800">
                    {siteConfig.legalEntity && (
                      <div>
                        <dt className="font-bold text-carbon-900">Titular</dt>
                        <dd>{siteConfig.legalEntity}</dd>
                      </div>
                    )}
                    {address && (
                      <div>
                        <dt className="font-bold text-carbon-900">Domicilio</dt>
                        <dd>{address}</dd>
                      </div>
                    )}
                    {(email || phone) && (
                      <div>
                        <dt className="font-bold text-carbon-900">Contacto</dt>
                        <dd className="flex flex-col gap-1">
                          {email && (
                            <a href={`mailto:${email}`} className="inline-flex items-center gap-2 text-azul-700 underline underline-offset-4">
                              <MailIcon className="h-4 w-4" />
                              {email}
                            </a>
                          )}
                          {phone && (
                            <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="inline-flex items-center gap-2 text-azul-700 underline underline-offset-4">
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
                      La información que exige la Ley 34/2002, de servicios de la sociedad de la información y de comercio
                      electrónico (LSSI-CE) —denominación social, NIF, domicilio, datos de inscripción en el Registro
                      Mercantil y correo de contacto— la completará y verificará el titular antes de la publicación. Esta
                      plantilla no inventa ningún dato.
                    </OwnerNotice>
                  </div>
                )}
              </div>
              <OwnerNotice>
                Las responsabilidades del despacho aduanero, las ubicaciones de almacén y el alcance de los servicios se
                confirman en cada plan de envío. El contenido de este sitio es información general y no constituye
                asesoramiento jurídico, aduanero ni fiscal.
              </OwnerNotice>
            </div>
          )}

          {page.sections.map((section) => (
            <div key={section.heading} className="border-t-2 border-carbon-900/15 pt-6">
              <h2 className="font-bricolage text-2xl font-bold text-carbon-900">{section.heading}</h2>
              <p className="mt-3 text-[17px] leading-relaxed text-carbon-800">{section.body}</p>
            </div>
          ))}

          {slug === 'privacidad' && (
            <OwnerNotice>
              Este resumen describe el comportamiento de la plantilla del sitio. La política de privacidad completa y
              validada jurídicamente (responsable del tratamiento, bases jurídicas, plazos de conservación y, en su caso,
              delegado de protección de datos) la añadirá el titular antes de la publicación.
            </OwnerNotice>
          )}

          {slug !== 'aviso-legal' && (
            <div className="rounded-2xl bg-arena-100 p-6">
              <p className="font-bold text-carbon-900">
                Preferencia de analítica:{' '}
                {consent === 'granted' ? 'aceptada' : consent === 'denied' ? 'rechazada' : 'aún sin elegir'}
              </p>
              <button
                type="button"
                onClick={openConsentSettings}
                className="mt-3 inline-flex items-center gap-2 font-bold text-azul-700 underline decoration-2 underline-offset-4"
              >
                Cambiar las preferencias de cookies
              </button>
            </div>
          )}

          <Link
            to="/es"
            className="inline-flex items-center gap-2 font-bold text-azul-700 underline decoration-azul-700/40 decoration-2 underline-offset-4 hover:decoration-azul-700"
          >
            Volver al inicio
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
