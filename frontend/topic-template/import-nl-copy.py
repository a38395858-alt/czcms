"""Import the supplied NL copy without publishing its production/CMS notes."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'docs/freightvanta-nl-topic-copy-source.md'
document = SOURCE.read_text(encoding='utf-8')
labels = {
    'product-sourcing': 'Sourcing in China',
    'services/bulk-procurement': 'Grootschalige inkoop in China',
    'services/packaging-branding': 'Verpakking en merk',
    'services/inventory-storage': 'Opslag en vrijgave van voorraad',
    'services/private-white-label': 'Eigen merk en white label',
    'services/worldwide-fulfillment': 'Orderverwerking',
    'industries/cross-border-ecommerce': 'Grensoverschrijdende e-commerce',
    'industries/consumer-goods': 'Consumentengoederen',
    'industries/industrial-components': 'Industriële onderdelen',
    'industries/time-critical-cargo': 'Tijdkritische vracht',
}
media = dict(zip(labels, ['service-product-sourcing', 'service-warehousing', 'service-packaging', 'service-warehousing', 'service-private-label', 'service-warehousing', 'service-warehousing', 'service-packaging', 'industry-receiving', 'service-air-freight']))
alts = dict(zip(labels, ['Productmonsters en meetgereedschap op een werktafel.', 'Verpakte kartons bij opslagrekken.', 'Kartons en verpakkingsonderdelen op een werktafel.', 'Goederen geordend in een opslagzone.', 'Productmonsters en onbedrukte merkmaterialen.', 'Rekken en goederen in een magazijn.', 'E-commercegoederen geordend op rekken.', 'Een product voorbereiden met beschermend papier.', 'Onderdelen in een houten krat bij een ontvangstzone.', 'Vracht en transportactiviteiten bij een vliegtuig.']))
notes = dict(zip(labels, ['Productreferentie, leveranciersvragen en volgende beslissing.', 'Aantal, voorraaddoel en volgende bestemming.', 'Goedgekeurde materialen en verpakkingsinstructie.', 'Ontvangst, identificatie en vrijgave.', 'Productversie, merk en goedkeuring.', 'Picken, verpakken en uitzonderingsroute.', 'Van sourcing naar klantklare orders.', 'Presentatie, kanaal en vrijgavebeslissing.', 'Specificatie, documenten en ontvangst.', 'Beschikbaarheid, route en escalatieverantwoordelijke.']))

def field(text, name, default=''):
    match = re.search(r'^- ' + re.escape(name) + r'：(.+)$', text, re.M)
    return match[1].strip() if match else default

def section(kind, heading, **content):
    return {'type': kind, 'tone': 'white', 'content': {'heading': heading, **content}}

def base(route):
    industry = route.startswith('industries/')
    return {'id': 'nl-' + route.replace('/', '-'), 'kind': 'industry' if industry else 'service', 'route': '/nl/' + route,
            'pageLabel': labels[route], 'breadcrumbParent': {'label': 'Sectoren' if industry else 'Diensten', 'href': '/nl/sectoren' if industry else '/nl/diensten'},
            'serviceName': None if industry else labels[route],
            'startingPoint': 'packaging-branding' if route.endswith('packaging-branding') else 'air-freight' if route.endswith('time-critical-cargo') else 'warehousing-fulfillment' if route.endswith(('inventory-storage', 'worldwide-fulfillment')) else 'product-sourcing' if not industry else None}

topics = {}
for chapter in re.split(r'(?=^### [12]\.\d )', document, flags=re.M)[1:]:
    route_match = re.search(r'路由：/nl/([a-z/-]+)', chapter)
    if not route_match:
        continue
    route = route_match[1]
    if route == 'product-sourcing':
        continue
    record = base(route)
    record['meta'] = {'title': field(chapter, 'Title'), 'description': field(chapter, 'Meta'), 'keywords': [field(chapter, 'Primary'), *field(chapter, 'Supporting').split('、')]}
    ctas = field(chapter, 'CTA', 'Plan aanvragen / Werkwijze bekijken').split(' / ')
    record['formButton'] = ctas[0]
    record['hero'] = {'kicker': field(chapter, 'Eyebrow'), 'title': field(chapter, 'H1'), 'body': field(chapter, 'Lead'), 'primaryCta': ctas[0], 'secondaryCta': ctas[1], 'mediaId': media[route], 'mediaAlt': alts[route], 'rail': [{'label': x.strip()} for x in field(chapter, 'Rail', 'REFERENTIE → BRIEF → GOEDKEURING → OVERDRACHT').split('→')]}
    body = chapter.split('**板块与文案**')[1].split('**Beeld / CMS**')[0]
    sections = []
    enquiry = {'kicker': 'Aanvraag', 'heading': 'Plan uw volgende overdracht.', 'reassurance': [], 'contextTitle': 'Context van de aanvraag', 'contextFields': []}
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
                faqs.append({'id': f'nl-{route.replace("/", "-")}-{i}', 'question': question, 'answer': answer})
            sections.append(section('faq', 'Veelgestelde vragen', items=faqs))
        elif prefix == 'Kader':
            sections.append(section('decision', heading, paragraphs=paragraphs))
        elif prefix in ['Wanneer het past', "Kanaalscenario's", 'Vrijgavecontexten', 'Onderdeelcontexten', 'Tijdkritische contexten']:
            cards=[]
            for item in bullets:
                label, copy = item.split(' — ', 1)
                cards.append({'title': label, 'copy': copy})
            sections.append(section('scenarios', heading, cards=cards))
        elif prefix in ['Zes stappen', 'Verpakkingsproces', 'Proces van ontvangst tot vrijgave', 'Goedkeurings- en overdrachtsproces', 'Ordercyclus', 'Verbonden proces', 'Urgentieproces']:
            steps=[]
            for item in bullets:
                if ' — ' in item:
                    label, copy = item.split(' — ',1)
                    steps.append({'title': label, 'copy': copy})
                else: steps.append({'copy':item})
            sections.append(section('workflow', heading, steps=steps))
        elif prefix in ['Scope', 'Operationele controles']:
            groups=[]
            for item in bullets:
                if ': ' in item:
                    label, content = item.split(': ',1)
                    groups.append({'label': label, 'items':[x.strip() for x in content.split(', ')]})
            sections.append(section('controls', heading, **({'groups':groups} if groups else {'paragraphs':paragraphs, 'items':bullets})))
        else:
            # Readable checklists retain the exact source phrases.
            items=bullets
            if rest.startswith('Vier blokken: '):
                items=rest.removeprefix('Vier blokken: ').rstrip('.').split('、'); paragraphs=[]
            elif not bullets and ';' in rest:
                items=[x.strip() for x in rest.split(';')]; paragraphs=[]
            sections.append(section('checklist', heading, **({'items':items} if items else {}), **({'body':' '.join(paragraphs)} if paragraphs else {})))
    record['sections'], record['enquiry'] = sections, enquiry
    topics[route]=record

# The attachment explicitly refers to the existing, complete sourcing copy.
go=(ROOT/'internal/httpserver/product_sourcing.go').read_text(encoding='utf-8').split('\n\t"nl": {',1)[1].split('\n}\n',1)[0]
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
record['hero']={'kicker':scalar('HeroKicker'),'title':scalar('HeroTitle'),'body':scalar('HeroBody'),'primaryCta':scalar('HeroPrimary'),'secondaryCta':'Werkwijze bekijken','mediaId':media[route],'mediaAlt':alts[route],'rail':[{'label':a,'note':b} for a,b in grouped('HeroStages',2)]}
summary=document.split('### 1.1 ',1)[1].split('### 1.2 ',1)[0]
record['meta']['title']=field(summary,'Title',record['meta']['title'])
record['hero']['title']=field(summary,'H1',record['hero']['title'])
record['sections']=[
    section('decision',scalar('ChinaTitle'),paragraphs=[scalar('ChinaBody')]),
    section('scenarios',scalar('FitTitle'),intro=scalar('FitBody'),cards=[{'tag':a,'title':b,'copy':c} for a,b,c in grouped('Situations',3)]),
    section('workflow',scalar('ProcessTitle'),intro=scalar('ProcessBody'),steps=[{'step':a,'title':b,'copy':c} for a,b,c in grouped('ProcessSteps',3)]),
    section('checklist','Product, leverancier en beslissing in één brief.',items=go_field('ChinaPoints')),
    section('checklist',scalar('RequirementsTitle'),body=scalar('RequirementsBody'),items=go_field('Requirements')),
    section('faq',scalar('FAQTitle'),guide=scalar('FAQBody'),items=[{'id':f'nl-sourcing-{i}','question':a,'answer':b} for i,(a,b) in enumerate(grouped('FAQs',2))]),
]
record['enquiry']={'kicker':scalar('ContactKicker'),'heading':scalar('ContactTitle'),'body':scalar('ContactBody'),'reassurance':[],'contextTitle':'Context van de aanvraag','contextFields':[]}
topics={route:record,**topics}
for route,record in topics.items():
    record['related']={'heading':'Gerelateerde diensten','links':[{'label':label,'href':'/nl/'+other,'note':notes[other]} for other,label in labels.items() if other!=route and not other.startswith('industries/')]}
    record['relatedIndustries']={'heading':'Gerelateerde sectoren','links':[{'label':label,'href':'/nl/'+other,'note':notes[other]} for other,label in labels.items() if other!=route and other.startswith('industries/')]}
target=ROOT/'frontend/topic-template/src/content/nl/topics.ts'
target.parent.mkdir(parents=True,exist_ok=True)
target.write_text("// Generated from docs/freightvanta-nl-topic-copy-source.md by import-nl-copy.py.\nimport type { TopicPageContent } from '../en-global/topics/types';\nexport const NL_TOPICS: Record<string, TopicPageContent> = "+json.dumps(topics,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
nav=[{'route':route,'slug':route.split('/')[-1],'kind':record['kind'],'navLabel':record['pageLabel'],'menuLine':notes[route]} for route,record in topics.items()]
nav_source="// Generated alongside the Dutch topic content.\nimport { homeContext } from '../../lib/home-context';\nimport { localizedUrl } from '../../config/site';\nconst topics = "+json.dumps(nav,ensure_ascii=False,indent=2)+";\nexport const NL_TOPIC_SERVICES = topics.filter(t => t.kind === 'service');\nexport const NL_TOPIC_INDUSTRIES = topics.filter(t => t.kind === 'industry');\nexport function nlTopicHref(route: string) { return (homeContext()?.languages.nl ?? localizedUrl('/nl/', 'nl')).replace(/\\/$/, '') + '/' + route; }\n"
(ROOT/'frontend/reference-template-nl/src/content/nl/topic-nav.ts').write_text(nav_source,encoding='utf-8')
out=ROOT/'output/nl-topics';out.mkdir(parents=True,exist_ok=True)
(out/'content-model.json').write_text(json.dumps(topics,ensure_ascii=False,indent=2),encoding='utf-8')
assert len(topics)==10
assert sum(len(s['content']['items']) for t in topics.values() for s in t['sections'] if s['type']=='faq')==58
print('Imported 10 Dutch topics, 54 supplied FAQ pairs and 4 existing sourcing FAQ pairs.')
