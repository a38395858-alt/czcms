import { GermanTopicPage } from '../components/de/GermanTopicPage';
import {
  DE_PRODUCT_SOURCING_TOPIC,
  getDeIndustryTopic,
  getDeServiceTopic,
} from '../content/de/topics';
import { Link } from '../lib/router';
import { useDocumentMeta } from '../lib/seo';

/** Deutsche Beschaffungs-Themenseite (/de/product-sourcing). */
export function GermanProductSourcingPage() {
  return <GermanTopicPage content={DE_PRODUCT_SOURCING_TOPIC} />;
}

/** Deutsche Service- und Branchen-Themenseiten (/de/services/*, /de/industries/*). */
export function GermanTopicPageRoute({ kind, slug }: { kind: 'service' | 'industry'; slug: string }) {
  const topic = kind === 'service' ? getDeServiceTopic(slug) : getDeIndustryTopic(slug);
  if (topic) return <GermanTopicPage content={topic} />;
  return <GermanTopicNotFound kind={kind} slug={slug} />;
}

function GermanTopicNotFound({ kind, slug }: { kind: 'service' | 'industry'; slug: string }) {
  const path = kind === 'service' ? `/de/services/${slug}` : `/de/industries/${slug}`;
  useDocumentMeta({
    title: 'Seite nicht gefunden | FreightVanta',
    description: 'Die gewünschte Seite wurde nicht gefunden.',
    path,
    lang: 'de-DE',
  });

  return (
    <section className="bg-din-grid bg-paper-25 py-24 sm:py-32">
      <div className="shell max-w-3xl">
        <p className="de-kicker text-brick-600">404 · Seite nicht gefunden</p>
        <h1 className="mt-6 font-serif text-[2.4rem] font-bold leading-[1.1] text-graphite-900 sm:text-5xl">
          Diese Seite gibt es hier nicht.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-graphite-500">
          Die Adresse <span className="font-mono text-base text-graphite-900">{path}</span> ist auf der
          deutschen Website nicht vorhanden. Zurück zur Übersicht:
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/de"
            className="btn rounded-[2px] bg-brick-600 px-6 text-base text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.18)] hover:bg-brick-500"
          >
            Zur deutschen Startseite
          </Link>
          <Link
            to="/"
            hrefLang="en"
            className="btn rounded-[2px] border border-graphite-900/30 px-6 text-base text-graphite-900 hover:border-graphite-900"
          >
            Zur englischen Startseite
          </Link>
        </div>
      </div>
    </section>
  );
}
