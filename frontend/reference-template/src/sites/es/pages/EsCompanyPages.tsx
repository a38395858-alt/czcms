import type { ReactNode } from 'react';
import { EnquiryForm } from '../../../components/enquiry/EnquiryForm';
import { ArrowRight, MailIcon, PhoneIcon, PinIcon } from '../../../components/ui/Icons';
import { SITE_META, hasDirectContact, siteConfig } from '../../../config/site';
import { ES_ANCHORS, enquiryEs, operationEs, processEs } from '../../../content/es/home';
import { getMedia } from '../../../content/media';
import { openConsentSettings, setConsent, useConsent } from '../../../lib/analytics';
import { esStrings } from '../../../lib/enquiry-i18n';
import { Link } from '../../../lib/router';
import { useDocumentMeta } from '../../../lib/seo';
import { EsDataProtectionTable } from '../components/EsHome';
import { EsCheckList, EsCtaBand, EsPageHero } from '../components/EsParts';

const ES = { ogLocale: 'es_ES' };

/* ------------------------------------------------------------------ Quiénes somos */
export function EsAboutPage() {
  useDocumentMeta({
    title: 'Quiénes somos | FreightVanta',
    description:
      'FreightVanta convierte traspasos dispersos de compras y transporte en un plan de envío práctico para importadores, tiendas online, equipos de producto, distribuidores y marcas en crecimiento.',
    path: '/es/quienes-somos',
    ...ES,
  });
  const audiences = ['Importadores', 'Tiendas online', 'Equipos de producto', 'Distribuidores', 'Marcas en crecimiento'];
  const confirmations = [
    'Plazos, tarifas y alcance se confirman en el plan de envío; nunca se prometen por adelantado.',
    'Las responsabilidades aduaneras, el representante aduanero y el alcance del despacho se definen antes de cualquier compromiso.',
    'El alcance de almacenaje y logística e-commerce se confirma antes de mover el stock.',
    'Si cambia una hipótesis, el plan muestra el cambio.',
  ];

  return (
    <>
      <EsPageHero
        breadcrumbs={[{ label: 'Inicio', to: '/es/' }, { label: 'Quiénes somos' }]}
        eyebrow="Quiénes somos"
        title="Un plan de envío práctico."
        lead="FreightVanta convierte traspasos dispersos de compras y transporte en un plan de envío con el que su equipo puede trabajar."
        media={getMedia('es-about-barcelona')}
        mediaAlt="Vista aérea del puerto de Barcelona con grúas, contenedores y barcos en un día soleado."
      />
      <section aria-labelledby="es-about-who" className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="es-about-who" className="es-h2 text-carbon-900">
              Con quién trabajamos
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-carbon-600">
              Empresas en crecimiento que compran en China y venden a clientes en España y en la Unión Europea, y que necesitan que el recorrido completo, de la búsqueda de proveedores a la entrega al destinatario, siga siendo claro.
            </p>
          </div>
          <ul className="grid content-start gap-3 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
            {audiences.map((audience) => (
              <li key={audience} className="flex items-center gap-3 border-b-2 border-carbon-900/10 py-4 font-es text-2xl font-extrabold tracking-[-0.015em] text-carbon-900">
                <span aria-hidden="true" className="h-2.5 w-2.5 rotate-45 bg-albero-400" />
                {audience}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section aria-labelledby="es-about-how" className="bg-pino-900 py-16 text-white sm:py-20 lg:py-24">
        <div className="shell">
          <h2 id="es-about-how" className="es-h2 max-w-3xl text-white">
            Cómo trabajamos
          </h2>
          <ul className="mt-12 grid gap-px border border-white/15 bg-white/15 md:grid-cols-2 lg:grid-cols-4">
            {operationEs.items.map((item) => (
              <li key={item.title} className="bg-pino-900 p-7">
                <span aria-hidden="true" className="block h-1 w-10 bg-albero-400" />
                <h3 className="mt-5 font-es text-xl font-extrabold">{item.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-pino-200">{item.copy}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section aria-labelledby="es-about-confirm" className="bg-arena-50 py-16 sm:py-20 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="es-about-confirm" className="es-h2 text-carbon-900">
              Lo que confirmamos antes de comprometernos
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-carbon-600">{processEs.body}</p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <EsCheckList items={confirmations} />
          </div>
        </div>
      </section>
      <EsCtaBand />
    </>
  );
}

/* ------------------------------------------------------------------ Contacto */
export function EsContactPage() {
  useDocumentMeta({ title: 'Contacto | Solicitar plan de envío | FreightVanta', description: enquiryEs.body, path: '/es/contacto', ...ES });
  const { email, phone, address } = siteConfig.contact;

  return (
    <>
      <EsPageHero breadcrumbs={[{ label: 'Inicio', to: '/es/' }, { label: 'Contacto' }]} eyebrow="Contacto" title="Hable con FreightVanta" lead={enquiryEs.body} />
      <section aria-labelledby="es-contact-form-title" className="relative isolate bg-arena-100 py-16 sm:py-20 lg:py-24">
        <div aria-hidden="true" className="es-azulejo pointer-events-none absolute inset-0 -z-10 opacity-70" />
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="es-contact-form-title" className="font-es text-[2rem] font-extrabold leading-tight tracking-[-0.02em] text-carbon-900">
              Solicitar plan de envío
            </h2>
            {hasDirectContact && (
              <ul className="mt-6 space-y-3 text-[16px] text-carbon-800">
                {email && (
                  <li>
                    <a href={`mailto:${email}`} className="es-link">
                      <MailIcon className="h-4 w-4" />
                      {email}
                    </a>
                  </li>
                )}
                {phone && (
                  <li>
                    <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="es-link">
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
            <h3 className="es-eyebrow mt-10 text-carbon-700">Conviene indicar</h3>
            <p className="mt-3 text-[16px] leading-relaxed text-carbon-800">{processEs.items[0].copy}</p>
            <EsCheckList items={enquiryEs.settings.reassurance} className="mt-6" />
          </div>
          <div className="lg:col-span-7">
            <EnquiryForm
              idPrefix="es-contacto"
              placement="contact"
              copy={enquiryEs.settings}
              strings={esStrings}
              theme="mediterraneo"
              privacyUrl={siteConfig.legalEs.privacidad}
              siteId={SITE_META.es.siteId}
              locale={SITE_META.es.locale}
            />
            <EsDataProtectionTable />
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ Páginas legales */
const PLACEHOLDER = 'A completar por el titular antes de la publicación';

function Value({ value, multiline = false }: { value: string | string[]; multiline?: boolean }) {
  const lines = Array.isArray(value) ? value : [value];
  const filled = lines.some((line) => line.trim() !== '');
  if (!filled) return <span className="rounded border border-dashed border-almagre-600 bg-almagre-100 px-2 py-0.5 text-[14px] text-almagre-700">[{PLACEHOLDER}]</span>;
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
      <EsPageHero breadcrumbs={[{ label: 'Inicio', to: '/es/' }, { label: breadcrumb }]} eyebrow="Información legal" title={title} lead={lead} />
      <section className="bg-white py-16 sm:py-20">
        <div className="shell max-w-3xl space-y-10 text-carbon-700">{children}</div>
      </section>
    </>
  );
}

function LegalBlock({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <div className="border-t-2 border-carbon-900/10 pt-6">
      <h2 className="font-es text-2xl font-extrabold tracking-[-0.015em] text-carbon-900">{heading}</h2>
      <div className="mt-3 space-y-3 text-[17px] leading-relaxed">{children}</div>
    </div>
  );
}

function DraftNotice({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border-l-4 border-almagre-600 bg-arena-50 px-5 py-4 text-[15px] leading-relaxed text-carbon-700">
      <span className="mr-2 text-[12px] font-extrabold uppercase tracking-[0.12em] text-almagre-700">Borrador</span>
      {children}
    </p>
  );
}

const ES_LEGAL_SLUGS = ['aviso-legal', 'privacidad', 'politica-de-cookies', 'condiciones'] as const;
export type EsLegalSlug = (typeof ES_LEGAL_SLUGS)[number];
export const isEsLegalSlug = (slug: string): slug is EsLegalSlug => (ES_LEGAL_SLUGS as readonly string[]).includes(slug);

export function EsLegalPage({ slug }: { slug: EsLegalSlug }) {
  switch (slug) {
    case 'aviso-legal':
      return <AvisoLegalPage />;
    case 'privacidad':
      return <PrivacidadPage />;
    case 'politica-de-cookies':
      return <CookiesPage />;
    default:
      return <CondicionesPage />;
  }
}

function AvisoLegalPage() {
  useDocumentMeta({ title: 'Aviso legal | FreightVanta', description: 'Datos identificativos del titular del sitio conforme al artículo 10 de la LSSI-CE.', path: '/es/aviso-legal', ...ES });
  const a = siteConfig.avisoLegal;
  const { email, phone } = siteConfig.contact;
  const complete = Boolean(a.company && a.nif && a.addressLines.length && a.registry && email);

  return (
    <LegalShell
      title="Aviso legal"
      lead="Información que exige el artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE)."
      breadcrumb="Aviso legal"
    >
      {!complete && (
        <DraftNotice>
          Los datos obligatorios se gestionan en la configuración del sitio y debe completarlos el titular antes de la publicación. Esta plantilla no inventa razones sociales, NIF, datos registrales ni datos de contacto.
        </DraftNotice>
      )}
      <LegalBlock heading="Datos identificativos">
        <p>
          Titular: <Value value={a.company} />
        </p>
        <p>
          NIF: <Value value={a.nif} />
        </p>
        <p>
          Domicilio social: <Value value={a.addressLines} multiline />
        </p>
        <p>
          Datos registrales: <Value value={a.registry} />
        </p>
      </LegalBlock>
      <LegalBlock heading="Contacto">
        <p>Correo electrónico: {email ? <a href={`mailto:${email}`} className="es-link">{email}</a> : <Value value="" />}</p>
        <p>Teléfono: {phone ? <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="es-link">{phone}</a> : <Value value="" />}</p>
      </LegalBlock>
      <LegalBlock heading="Objeto y condiciones de uso">
        <p>Este sitio web informa sobre los servicios de coordinación de compras, transporte, almacenaje y entrega de FreightVanta. El acceso y la navegación implican la aceptación de este aviso legal.</p>
      </LegalBlock>
      <LegalBlock heading="Propiedad intelectual e industrial">
        <p>Los contenidos de este sitio (textos, estructura, diseño e ilustraciones) están protegidos por la normativa de propiedad intelectual e industrial. Queda prohibida su reproducción sin autorización.</p>
      </LegalBlock>
      <LegalBlock heading="Responsabilidad">
        <p>Los contenidos se ofrecen con fines informativos y no constituyen una oferta vinculante ni asesoramiento jurídico, aduanero o fiscal. El titular no responde de los contenidos de sitios de terceros enlazados.</p>
      </LegalBlock>
      <LegalBlock heading="Legislación aplicable">
        <p>Este aviso legal se rige por la legislación española.</p>
      </LegalBlock>
      <LegalBlock heading="Créditos fotográficos">
        <p>Fotografías: Pexels (entre otros, Fives TM, Explorando la provincia de Cádiz, Regimantas Danys, Oleksiy Yeshtokyn, Tiger Lily, RDNE Stock project y Quang Nguyen Vinh) bajo la licencia de Pexels.</p>
      </LegalBlock>
    </LegalShell>
  );
}

function PrivacidadPage() {
  useDocumentMeta({ title: 'Política de privacidad | FreightVanta', description: 'Información sobre el tratamiento de datos personales conforme al RGPD y a la LOPDGDD.', path: '/es/privacidad', ...ES });
  const a = siteConfig.avisoLegal;
  const { consent } = useConsent();
  const { email } = siteConfig.contact;

  return (
    <LegalShell
      title="Política de privacidad"
      lead="Información sobre el tratamiento de sus datos personales conforme al Reglamento (UE) 2016/679 (RGPD) y a la Ley Orgánica 3/2018, de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD)."
      breadcrumb="Política de privacidad"
    >
      <DraftNotice>
        Esta política describe las funciones reales de esta plantilla (formulario de solicitud, almacenamiento local del consentimiento, medición de audiencia propia opcional y fuentes alojadas localmente). El titular debe revisarla antes de la publicación y completarla con el proveedor de alojamiento, los plazos de conservación y cualquier otro tratamiento.
      </DraftNotice>
      <LegalBlock heading="1. Responsable del tratamiento">
        <p>
          <Value value={a.company} />, NIF <Value value={a.nif} />
          <br />
          <Value value={a.addressLines} multiline />
        </p>
        <p>Correo electrónico: {email ? <a href={`mailto:${email}`} className="es-link">{email}</a> : <Value value="" />}</p>
        {a.dpoContact && <p>Delegado/a de protección de datos: {a.dpoContact}</p>}
      </LegalBlock>
      <LegalBlock heading="2. Finalidades y legitimación">
        <p>
          <strong className="text-carbon-900">Solicitud de plan de envío.</strong> Tratamos los datos que usted indica (nombre y apellidos, correo electrónico profesional, empresa, teléfono opcional, origen y destino, punto de partida, detalles de la mercancía e información adicional) únicamente para gestionar su solicitud y ponernos en contacto con usted. Base jurídica: su consentimiento (art. 6.1.a RGPD) y la aplicación de medidas precontractuales a petición suya (art. 6.1.b RGPD). Para evitar envíos automatizados se comprueban un campo oculto y la hora de inicio del formulario; cada solicitud se registra con un identificador técnico.
        </p>
        <p>
          <strong className="text-carbon-900">Navegación y registros del servidor.</strong> El proveedor de alojamiento trata datos técnicamente necesarios (dirección IP, fecha y hora, página visitada, tipo de navegador) para servir el sitio y garantizar su seguridad. Base jurídica: interés legítimo (art. 6.1.f RGPD).
        </p>
        <p>
          <strong className="text-carbon-900">Medición de audiencia.</strong> Solo con su consentimiento (art. 22.2 LSSI-CE y art. 6.1.a RGPD) registramos eventos de interacción, como cambios de pestaña, clics en enlaces o el inicio del formulario, junto con la página, el idioma y la hora. Nunca se transmite lo que escribe en los formularios. La medición es propia, sin terceros.
        </p>
      </LegalBlock>
      <LegalBlock heading="3. Plazo de conservación">
        <p>
          Los datos se conservan mientras sean necesarios para gestionar su solicitud y, después, durante los plazos legales aplicables. Plazos concretos y sistemas receptores (por ejemplo, CRM): <Value value="" />
        </p>
      </LegalBlock>
      <LegalBlock heading="4. Destinatarios y encargados del tratamiento">
        <p>
          No se cederán datos a terceros, salvo obligación legal. Los proveedores que nos prestan servicios (por ejemplo, alojamiento web o gestión de solicitudes) actúan como encargados del tratamiento con contrato conforme al art. 28 RGPD. Proveedores y, en su caso, transferencias internacionales: <Value value="" />
        </p>
      </LegalBlock>
      <LegalBlock heading="5. Fuentes tipográficas e imágenes">
        <p>
          Las fuentes (Archivo) están alojadas localmente en el sitio; no se establece conexión con servicios de fuentes de terceros. La carga de fotografías puede establecer una conexión con la red de distribución del proveedor Pexels, lo que transmite su dirección IP. Para el funcionamiento en producción recomendamos alojar todas las imágenes en servidores propios.
        </p>
      </LegalBlock>
      <LegalBlock heading="6. Sus derechos">
        <p>
          Puede ejercer sus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad (arts. 15 a 22 RGPD), así como retirar su consentimiento en cualquier momento, escribiendo a la dirección de contacto indicada. Si considera que el tratamiento no se ajusta a la normativa, puede presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).
        </p>
        <p>
          Elección actual sobre la medición de audiencia: {consent === 'granted' ? 'aceptada' : consent === 'denied' ? 'rechazada' : 'todavía sin elegir'}.{' '}
          <button type="button" onClick={openConsentSettings} className="es-link">
            Configurar cookies
          </button>
        </p>
      </LegalBlock>
      <LegalBlock heading="7. Actualización">
        <p>Última actualización de esta política: septiembre de 2026.</p>
      </LegalBlock>
    </LegalShell>
  );
}

function CookiesPage() {
  useDocumentMeta({ title: 'Política de cookies | FreightVanta', description: 'Qué guarda este sitio en su navegador, para qué y cómo configurarlo.', path: '/es/politica-de-cookies', ...ES });
  const { consent } = useConsent();
  const rows = [
    { name: 'fv.analytics-consent.v1', owner: 'Propia', purpose: 'Técnica: recuerda su elección sobre la medición de audiencia (exenta de consentimiento).', duration: 'Persistente, hasta que la borre' },
    { name: 'fv.site-choice.v1', owner: 'Propia', purpose: 'Personalización solicitada: recuerda el idioma que ha elegido.', duration: 'Persistente, hasta que la borre' },
    { name: 'fv.locale-suggestion.dismissed', owner: 'Propia', purpose: 'Técnica: recuerda que ha cerrado el aviso de idioma.', duration: 'Sesión' },
    { name: 'Medición de audiencia (eventos)', owner: 'Propia', purpose: 'Analítica: qué secciones ayudan a planificar envíos. Solo con su consentimiento.', duration: 'Según el sistema receptor' },
  ];

  return (
    <LegalShell
      title="Política de cookies"
      lead="Qué guarda este sitio en su navegador, para qué lo usa y cómo puede configurarlo, conforme al artículo 22.2 de la LSSI-CE y a la guía de la AEPD."
      breadcrumb="Política de cookies"
    >
      <LegalBlock heading="¿Qué son las cookies y tecnologías similares?">
        <p>Son pequeños archivos o entradas de almacenamiento que un sitio guarda en su navegador. Este sitio no usa cookies de terceros: solo almacenamiento local propio.</p>
      </LegalBlock>
      <div className="border-t-2 border-carbon-900/10 pt-6">
        <h2 className="font-es text-2xl font-extrabold tracking-[-0.015em] text-carbon-900">Qué utilizamos</h2>
        <div className="mt-4 overflow-x-auto rounded-lg ring-1 ring-carbon-900/10">
          <table className="w-full min-w-[36rem] text-left text-[15px]">
            <caption className="sr-only">Almacenamiento utilizado por este sitio</caption>
            <thead className="bg-arena-100 text-[12px] font-extrabold uppercase tracking-[0.1em] text-carbon-900">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Nombre
                </th>
                <th scope="col" className="px-4 py-3">
                  Titular
                </th>
                <th scope="col" className="px-4 py-3">
                  Finalidad
                </th>
                <th scope="col" className="px-4 py-3">
                  Duración
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-carbon-900/10 bg-white">
              {rows.map((row) => (
                <tr key={row.name}>
                  <th scope="row" className="px-4 py-3 font-mono text-[13px] font-normal text-carbon-900">
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
      <div className="rounded-lg bg-arena-50 p-6 ring-1 ring-carbon-900/10">
        <h2 className="font-es text-xl font-extrabold text-carbon-900">Configurar su elección</h2>
        <p className="mt-2 text-[16px] leading-relaxed">
          Elección actual: <strong className="text-carbon-900">{consent === 'granted' ? 'medición de audiencia aceptada' : consent === 'denied' ? 'medición de audiencia rechazada' : 'todavía sin elegir'}</strong>. Rechazar es tan sencillo como aceptar y puede cambiar de opinión cuando quiera.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={() => setConsent('denied')} aria-pressed={consent === 'denied'} className="es-btn es-btn-outline min-h-11 px-5 text-sm">
            Rechazar la medición
          </button>
          <button type="button" onClick={() => setConsent('granted')} aria-pressed={consent === 'granted'} className="es-btn es-btn-outline min-h-11 px-5 text-sm">
            Aceptar la medición
          </button>
        </div>
        <p className="mt-4 text-sm text-carbon-600">También puede borrar el almacenamiento desde la configuración de su navegador.</p>
      </div>
      <Link to="/es/contacto" className="es-link">
        Contactar con FreightVanta
        <ArrowRight className="h-4 w-4" />
      </Link>
    </LegalShell>
  );
}

function CondicionesPage() {
  useDocumentMeta({ title: 'Condiciones generales | FreightVanta', description: 'Condiciones de uso del sitio y marco de contratación de los servicios.', path: '/es/condiciones', ...ES });
  return (
    <LegalShell title="Condiciones generales" lead="Condiciones de uso de este sitio y marco en el que se contratan los servicios." breadcrumb="Condiciones generales">
      <DraftNotice>
        Las condiciones generales completas, incluida, en su caso, la incorporación de condiciones generales del sector (por ejemplo, las de FETEIA-OLTRA) y el régimen de responsabilidad aplicable al transporte (Ley 15/2009, del contrato de transporte terrestre de mercancías), deben fijarlas el titular y su asesoría jurídica antes de la publicación.
      </DraftNotice>
      <LegalBlock heading="Ámbito">
        <p>Esta oferta se dirige exclusivamente a empresas y profesionales. Los contenidos de este sitio no constituyen una oferta en sentido jurídico.</p>
      </LegalBlock>
      <LegalBlock heading="Contratación de los servicios">
        <p>El alcance, las responsabilidades, los precios, los plazos y la responsabilidad se pactan exclusivamente en el plan de envío escrito o en el presupuesto. La información de este sitio no supone compromiso alguno de plazo, precio o resultado del despacho aduanero.</p>
      </LegalBlock>
      <LegalBlock heading="Contenido de las guías">
        <p>Las guías y los contenidos del sitio son información general de planificación y no sustituyen el asesoramiento jurídico, aduanero o fiscal.</p>
      </LegalBlock>
      <LegalBlock heading="Legislación aplicable">
        <p>Estas condiciones se rigen por la legislación española, sin perjuicio de las normas imperativas aplicables.</p>
      </LegalBlock>
    </LegalShell>
  );
}

/* ------------------------------------------------------------------ 404 */
export function EsNotFoundPage({ path }: { path: string }) {
  useDocumentMeta({ title: 'Página no encontrada | FreightVanta', description: 'No hemos encontrado la página solicitada.', path, ...ES });
  return (
    <section className="relative isolate overflow-hidden bg-arena-50 py-24 text-carbon-900 sm:py-32">
      <div aria-hidden="true" className="es-azulejo pointer-events-none absolute inset-0 -z-10 opacity-80" />
      <div className="shell max-w-3xl">
        <p className="es-eyebrow text-almagre-700">Ruta no encontrada</p>
        <h1 className="mt-5 font-es text-5xl font-extrabold leading-tight tracking-[-0.025em]">Este traspaso no lleva a ninguna parte.</h1>
        <p className="mt-5 text-lg text-carbon-700">
          La página <span className="font-mono text-base text-carbon-900">{path}</span> no está disponible. Elija un siguiente paso.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link to="/es/" className="es-btn es-btn-primary">
            Volver al inicio
          </Link>
          <Link to={ES_ANCHORS.services} className="es-btn es-btn-outline">
            Ver soluciones
          </Link>
        </div>
      </div>
    </section>
  );
}
