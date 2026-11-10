import network from '../../../assets/company/partner-network.json';
import '../../../assets/css/partner-network.css';

export default function PartnerNetwork({locale}: {locale: string}) {
 const copy = network.locales[locale as keyof typeof network.locales] ?? network.locales.en;
 return <section className="fv-partners" aria-labelledby="partners-heading">
  <div className="fv-partners-inner"><h2 id="partners-heading">{copy.title}</h2><p>{copy.body}</p>
  <div className="fv-partners-groups">{network.groups.map((logos,index)=><section className="fv-partners-group" key={index} aria-labelledby={`partner-group-${index}`}>
   <h3 id={`partner-group-${index}`}>{copy.groups[index]}</h3><ul>{logos.map(logo=><li key={logo.file}><img src={`/assets/company/partners/${logo.file}.webp`} alt={logo.name} width="240" height="120" loading="lazy" decoding="async" /></li>)}</ul>
  </section>)}</div></div>
 </section>;
}
