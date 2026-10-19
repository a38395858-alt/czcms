"""Import the supplied IT copy without publishing its production/CMS notes."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'docs/freightvanta-it-topic-copy-source.md'
document = SOURCE.read_text(encoding='utf-8')
labels = {
    'product-sourcing': 'Ricerca fornitori in Cina',
    'services/bulk-procurement': "Acquisto all'ingrosso in Cina",
    'services/packaging-branding': 'Imballaggio e immagine di marca',
    'services/inventory-storage': 'Stoccaggio e rilascio delle scorte',
    'services/private-white-label': 'Marca privata e white label',
    'services/worldwide-fulfillment': 'Preparazione degli ordini',
    'industries/cross-border-ecommerce': 'E-commerce transfrontaliero',
    'industries/consumer-goods': 'Beni di consumo',
    'industries/industrial-components': 'Componenti industriali',
    'industries/time-critical-cargo': 'Spedizione urgente',
}
media = dict(zip(labels, ['service-product-sourcing', 'service-warehousing', 'service-packaging', 'service-warehousing', 'service-private-label', 'industry-ecommerce', 'industry-ecommerce', 'industry-consumer-goods', 'industry-industrial', 'industry-time-critical']))
alts = dict(zip(labels, ['Campioni di prodotto e strumenti di misura su un tavolo di lavoro.', 'Cartoni preparati vicino agli scaffali di stoccaggio.', 'Cartoni e componenti di imballaggio su un tavolo di lavoro.', 'Merci organizzate in una zona di stoccaggio.', 'Campioni di prodotto e materiali di marca non stampati.', 'Scaffali e merci in un magazzino.', 'Merci e-commerce organizzate sugli scaffali.', 'Preparazione di un prodotto con carta protettiva.', 'Componenti industriali e referenze di parti.', 'Merci e operazioni di trasporto vicino a un aereo.']))
notes = dict(zip(labels, ['Referenza, domande al fornitore e prossima decisione.', 'Quantità, finalità delle scorte e prossima destinazione.', 'Materiali approvati e istruzione di confezionamento.', 'Ricezione, identificazione e rilascio.', 'Versione prodotto, marca e approvazione.', 'Prelievo, confezionamento e percorso di eccezione.', 'Dal prodotto approvvigionato all’ordine cliente.', 'Presentazione, canale e decisione di rilascio.', 'Specifica, documenti e ricezione.', 'Disponibilità, itinerario e responsabile di escalation.']))

def field(text, name, default=''):
    match = re.search(r'^- ' + re.escape(name) + r'：(.+)$', text, re.M)
    return match[1].strip() if match else default

def section(kind, heading, **content):
    return {'type': kind, 'tone': 'white', 'content': {'heading': heading, **content}}

def base(route):
    industry = route.startswith('industries/')
    return {'id': 'it-' + route.replace('/', '-'), 'kind': 'industry' if industry else 'service', 'route': '/it/' + route,
            'pageLabel': labels[route], 'breadcrumbParent': {'label': 'Settori' if industry else 'Servizi', 'href': '/it/settori' if industry else '/it/servizi'},
            'serviceName': None if industry else labels[route],
            'startingPoint': 'packaging-branding' if route.endswith('packaging-branding') else 'air-freight' if route.endswith('time-critical-cargo') else 'warehousing-fulfillment' if route.endswith(('inventory-storage', 'worldwide-fulfillment')) else 'product-sourcing' if not industry else None}

topics = {}
for chapter in re.split(r'(?=^### [12]\.\d )', document, flags=re.M)[1:]:
    route_match = re.search(r'路由：/it/([a-z/-]+)', chapter)
    if not route_match:
        continue
    route = route_match[1]
    if route == 'product-sourcing':
        continue
    record = base(route)
    record['meta'] = {'title': field(chapter, 'Title'), 'description': field(chapter, 'Meta'), 'keywords': [field(chapter, 'Primary'), *field(chapter, 'Supporting').split('、')]}
    ctas = field(chapter, 'CTA', 'Richiedi un piano / Vedi il percorso').split(' / ')
    record['formButton'] = ctas[0]
    record['hero'] = {'kicker': field(chapter, 'Eyebrow'), 'title': field(chapter, 'H1'), 'body': field(chapter, 'Lead'), 'primaryCta': ctas[0], 'secondaryCta': ctas[1], 'mediaId': media[route], 'mediaAlt': alts[route], 'rail': [{'label': x.strip()} for x in field(chapter, 'Rail', 'REFERENZA → BRIEF → APPROVAZIONE → PASSAGGIO').split('→')]}
    body = chapter.split('**板块与文案**')[1].split('**Immagini / CMS**')[0]
    sections = []
    enquiry = {'kicker': 'Richiesta', 'heading': 'Richiedi un piano per il prossimo passaggio.', 'reassurance': [], 'contextTitle': 'Contesto della richiesta', 'contextFields': []}
    for block in re.finditer(r'^\d+\. \*\*(.*?)\*\*\s*\n(.*?)(?=^\d+\. \*\*|\Z)', body, re.M | re.S):
        title, rest = block[1], block[2].strip()
        prefix, _, heading = title.partition(' — ')
        heading = heading or prefix
        lines = [x.strip() for x in rest.splitlines() if x.strip()]
        bullets = [x[2:] for x in lines if x.startswith('- ')]
        paragraphs = [x for x in lines if not x.startswith('- ')]
        if prefix == 'CTA':
            enquiry['heading'] = heading.removeprefix('H2：')
            if paragraphs: enquiry['body'] = ' '.join(paragraphs)
        elif prefix == 'FAQ':
            faqs = []
            for i, item in enumerate(bullets):
                question, answer = item.split(' — ', 1)
                faqs.append({'id': f'it-{route.replace("/", "-")}-{i}', 'question': question, 'answer': answer})
            sections.append(section('faq', 'Domande frequenti', items=faqs))
        elif prefix == 'Inquadramento':
            sections.append(section('decision', heading, paragraphs=paragraphs))
        elif prefix in ['Quando è adatto', 'Scenari di canale', 'Contesti di rilascio', 'Contesti di componente', 'Contesti urgenti']:
            cards=[]
            for item in bullets:
                label, copy = item.split(' — ', 1)
                cards.append({'title': label, 'copy': copy})
            sections.append(section('scenarios', heading, cards=cards))
        elif prefix in ['Sei passaggi', 'Percorso di confezionamento', 'Percorso da ricezione a rilascio', 'Percorso di approvazione e passaggio', "Ciclo dell'ordine", 'Percorso collegato', 'Percorso di urgenza']:
            steps=[]
            for item in bullets:
                if ' — ' in item:
                    label, copy = item.split(' — ',1)
                    steps.append({'title': label, 'copy': copy})
                else: steps.append({'copy':item})
            sections.append(section('workflow', heading, steps=steps))
        elif prefix in ['Perimetro', 'Controlli operativi']:
            groups=[]
            for item in bullets:
                if ': ' in item:
                    label, content = item.split(': ',1)
                    groups.append({'label': label, 'items':[x.strip() for x in content.split(', ')]})
            sections.append(section('controls', heading, **({'groups':groups} if groups else {'paragraphs':paragraphs, 'items':bullets})))
        else:
            # Readable checklists retain the exact source phrases.
            items=bullets
            if rest.startswith('Quattro blocchi: '):
                items=rest.removeprefix('Quattro blocchi: ').rstrip('.').split('、'); paragraphs=[]
            elif not bullets and ';' in rest:
                items=[x.strip() for x in rest.split(';')]; paragraphs=[]
            sections.append(section('checklist', heading, **({'items':items} if items else {}), **({'body':' '.join(paragraphs)} if paragraphs else {})))
    record['sections'], record['enquiry'] = sections, enquiry
    topics[route]=record

# The attachment explicitly refers to the existing, complete sourcing copy.
go=(ROOT/'internal/httpserver/product_sourcing.go').read_text(encoding='utf-8').split('\n\t"it": {',1)[1].split('\n\t"nl": {',1)[0]
quoted=r'"(?:\\.|[^"\\])*"'
def go_field(name):
    text=re.search(r'^\s*'+name+r':\s*(.*?)(?=^\s*[A-Z]\w*:|\Z)',go,re.M|re.S)[1]
    return [json.loads(x) for x in re.findall(quoted,text)]
def scalar(name):return go_field(name)[0]
def grouped(name,n):
    values=go_field(name)
    return [values[i:i+n] for i in range(0,len(values),n)]
route='product-sourcing';record=base(route)
record['meta']={'title':scalar('SEOTitle'),'description':scalar('SEODescription'),'keywords':go_field('SEOKeywords')}
record['formButton']=scalar('ContactButton')
record['hero']={'kicker':scalar('HeroKicker'),'title':scalar('HeroTitle'),'body':scalar('HeroBody'),'primaryCta':scalar('HeroPrimary'),'secondaryCta':'Vedi il percorso','mediaId':media[route],'mediaAlt':alts[route],'rail':[{'label':a,'note':b} for a,b in grouped('HeroStages',2)]}
record['sections']=[
    section('decision',scalar('ChinaTitle'),paragraphs=[scalar('ChinaBody')]),
    section('scenarios',scalar('FitTitle'),intro=scalar('FitBody'),cards=[{'tag':a,'title':b,'copy':c} for a,b,c in grouped('Situations',3)]),
    section('workflow',scalar('ProcessTitle'),intro=scalar('ProcessBody'),steps=[{'step':a,'title':b,'copy':c} for a,b,c in grouped('ProcessSteps',3)]),
    section('checklist','Prodotto, fornitore e decisione nello stesso brief.',items=go_field('ChinaPoints')),
    section('checklist',scalar('RequirementsTitle'),body=scalar('RequirementsBody'),items=go_field('Requirements')),
    section('faq',scalar('FAQTitle'),guide=scalar('FAQBody'),items=[{'id':f'it-sourcing-{i}','question':a,'answer':b} for i,(a,b) in enumerate(grouped('FAQs',2))]),
]
record['enquiry']={'kicker':scalar('ContactKicker'),'heading':scalar('ContactTitle'),'body':scalar('ContactBody'),'reassurance':[],'contextTitle':'Contesto della richiesta','contextFields':[]}
topics={route:record,**topics}
for route,record in topics.items():
    record['related']={'heading':'Servizi correlati','links':[{'label':label,'href':'/it/'+other,'note':notes[other]} for other,label in labels.items() if other!=route and not other.startswith('industries/')]}
    record['relatedIndustries']={'heading':'Settori correlati','links':[{'label':label,'href':'/it/'+other,'note':notes[other]} for other,label in labels.items() if other!=route and other.startswith('industries/')]}
target=ROOT/'frontend/topic-template/src/content/it/topics.ts'
target.write_text("// Generated from docs/freightvanta-it-topic-copy-source.md by import-it-copy.py.\nimport type { TopicPageContent } from '../en-global/topics/types';\nexport const IT_TOPICS: Record<string, TopicPageContent> = "+json.dumps(topics,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
nav=[{'route':route,'slug':route.split('/')[-1],'kind':record['kind'],'navLabel':record['pageLabel'],'menuLine':notes[route]} for route,record in topics.items()]
nav_source="// Generated alongside the Italian topic content.\nimport { homeContext } from '../../lib/home-context';\nimport { localizedUrl } from '../../config/site';\nconst topics = "+json.dumps(nav,ensure_ascii=False,indent=2)+";\nexport const IT_TOPIC_SERVICES = topics.filter(t => t.kind === 'service');\nexport const IT_TOPIC_INDUSTRIES = topics.filter(t => t.kind === 'industry');\nexport function itTopicHref(route: string) { return (homeContext()?.languages.it ?? localizedUrl('/it/', 'it')).replace(/\\/$/, '') + '/' + route; }\n"
(ROOT/'frontend/reference-template/src/content/it/topic-nav.ts').write_text(nav_source,encoding='utf-8')
out=ROOT/'output/it-topics';out.mkdir(parents=True,exist_ok=True)
(out/'content-model.json').write_text(json.dumps(topics,ensure_ascii=False,indent=2),encoding='utf-8')
assert len(topics)==10
assert sum(len(s['content']['items']) for t in topics.values() for s in t['sections'] if s['type']=='faq')==58
print('Imported 10 Italian topics, 54 supplied FAQ pairs and 4 existing sourcing FAQ pairs.')
