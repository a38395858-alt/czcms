"""Import the supplied FR copy without publishing its production/CMS notes."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'docs/freightvanta-fr-topic-copy-source.md'
document = SOURCE.read_text(encoding='utf-8')
labels = {
    'product-sourcing': 'Sourcing en Chine',
    'services/bulk-procurement': 'Achat en volume depuis la Chine',
    'services/packaging-branding': 'Emballage et image de marque',
    'services/inventory-storage': 'Stockage et libération des stocks',
    'services/private-white-label': 'Marque propre et marque blanche',
    'services/worldwide-fulfillment': 'Préparation de commandes',
    'industries/cross-border-ecommerce': 'E-commerce transfrontalier',
    'industries/consumer-goods': 'Biens de consommation',
    'industries/industrial-components': 'Composants industriels',
    'industries/time-critical-cargo': 'Fret urgent',
}
media = dict(zip(labels, ['service-product-sourcing', 'service-warehousing', 'service-packaging', 'service-warehousing', 'service-private-label', 'industry-ecommerce', 'industry-ecommerce', 'industry-consumer-goods', 'industry-industrial', 'industry-time-critical']))
alts = dict(zip(labels, ['Échantillons de produit et outils de mesure sur une table de travail.', 'Cartons préparés près des rayonnages de stockage.', "Cartons et éléments d'emballage sur une table de travail.", 'Marchandises organisées dans une zone de stockage.', 'Échantillons de produit et éléments de marque non imprimés.', 'Rayonnages et marchandises dans un entrepôt.', 'Marchandises e-commerce organisées sur des rayonnages.', 'Préparation d’un produit avec du papier de protection.', 'Composants industriels et références de pièces.', 'Marchandises et opérations de fret près d’un avion.']))
notes = dict(zip(labels, ['Référence, questions fournisseur et prochaine décision.', 'Quantité, finalité du stock et prochaine destination.', 'Éléments validés et instruction de conditionnement.', 'Réception, identification et libération.', 'Version produit, marque et validation.', 'Picking, conditionnement et circuit d’exception.', 'Du produit sourcé à la commande client.', 'Présentation, canal et décision de libération.', 'Spécification, documents et réception.', 'Disponibilité, itinéraire et responsable d’escalade.']))

def field(text, name, default=''):
    match = re.search(r'^- ' + re.escape(name) + r'：(.+)$', text, re.M)
    return match[1].strip() if match else default

def section(kind, heading, **content):
    return {'type': kind, 'tone': 'white', 'content': {'heading': heading, **content}}

def base(route):
    industry = route.startswith('industries/')
    return {'id': 'fr-' + route.replace('/', '-'), 'kind': 'industry' if industry else 'service', 'route': '/fr/' + route,
            'pageLabel': labels[route], 'breadcrumbParent': {'label': 'Secteurs' if industry else 'Solutions', 'href': '/fr/secteurs' if industry else '/fr/solutions'},
            'serviceName': None if industry else labels[route],
            'startingPoint': 'packaging-branding' if route.endswith('packaging-branding') else 'air-freight' if route.endswith('time-critical-cargo') else 'warehousing-fulfillment' if route.endswith(('inventory-storage', 'worldwide-fulfillment')) else 'product-sourcing' if not industry else None}

topics = {}
for chapter in re.split(r'(?=^### [12]\.\d )', document, flags=re.M)[1:]:
    route_match = re.search(r'路由：/fr/([a-z/-]+)', chapter)
    if not route_match:
        continue
    route = route_match[1]
    if route == 'product-sourcing':
        continue
    record = base(route)
    record['meta'] = {'title': field(chapter, 'Title'), 'description': field(chapter, 'Meta'), 'keywords': [field(chapter, 'Primary'), *field(chapter, 'Supporting').split('、')]}
    ctas = field(chapter, 'CTA', 'Demander un plan / Voir le déroulé').split(' / ')
    record['formButton'] = ctas[0]
    record['hero'] = {'kicker': field(chapter, 'Eyebrow'), 'title': field(chapter, 'H1'), 'body': field(chapter, 'Lead'), 'primaryCta': ctas[0], 'secondaryCta': ctas[1], 'mediaId': media[route], 'mediaAlt': alts[route], 'rail': [{'label': x.strip()} for x in field(chapter, 'Rail', 'RÉFÉRENCE → BRIEF → VALIDATION → RELAIS').split('→')]}
    body = chapter.split('**板块与文案**')[1].split('**Images / CMS**')[0]
    sections = []
    enquiry = {'kicker': 'Demande', 'heading': 'Demandez un plan pour votre prochain relais.', 'reassurance': [], 'contextTitle': 'Contexte de votre demande', 'contextFields': []}
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
                faqs.append({'id': f'fr-{route.replace("/", "-")}-{i}', 'question': question, 'answer': answer})
            sections.append(section('faq', 'Questions fréquentes', items=faqs))
        elif prefix == 'Cadrage':
            sections.append(section('decision', heading, paragraphs=paragraphs))
        elif prefix in ['Quand cela convient', 'Scénarios de canal', 'Contextes de libération', 'Contextes de composant', 'Contextes urgents']:
            cards=[]
            for item in bullets:
                label, copy = item.split(' — ', 1)
                cards.append({'title': label, 'copy': copy})
            sections.append(section('scenarios', heading, cards=cards))
        elif prefix in ['Six étapes', 'Déroulé de conditionnement', 'Déroulé réception-libération', 'Déroulé de validation et de relais', 'Cycle de commande', 'Déroulé connecté', "Déroulé d'urgence"]:
            steps=[]
            for item in bullets:
                if ' — ' in item:
                    label, copy = item.split(' — ',1)
                    steps.append({'title': label, 'copy': copy})
                else: steps.append({'copy':item})
            sections.append(section('workflow', heading, steps=steps))
        elif prefix in ['Périmètre', 'Contrôles opérationnels']:
            groups=[]
            for item in bullets:
                if ' : ' in item:
                    label, content = item.split(' : ',1)
                    groups.append({'label': label, 'items':[x.strip() for x in content.split(', ')]})
            sections.append(section('controls', heading, **({'groups':groups} if groups else {'paragraphs':paragraphs, 'items':bullets})))
        else:
            # Readable checklists retain the exact source phrases.
            items=bullets
            if rest.startswith('Quatre blocs : '):
                items=rest.removeprefix('Quatre blocs : ').rstrip('.').split('、'); paragraphs=[]
            elif not bullets and ';' in rest:
                items=[x.strip() for x in rest.split(';')]; paragraphs=[]
            sections.append(section('checklist', heading, **({'items':items} if items else {}), **({'body':' '.join(paragraphs)} if paragraphs else {})))
    record['sections'], record['enquiry'] = sections, enquiry
    topics[route]=record

# The attachment explicitly refers to the existing, complete sourcing copy.
go=(ROOT/'internal/httpserver/product_sourcing.go').read_text(encoding='utf-8').split('\n\t"fr": {',1)[1].split('\n\t"es": {',1)[0]
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
record['hero']={'kicker':scalar('HeroKicker'),'title':scalar('HeroTitle'),'body':scalar('HeroBody'),'primaryCta':scalar('HeroPrimary'),'secondaryCta':'Voir le déroulé','mediaId':media[route],'mediaAlt':alts[route],'rail':[{'label':a,'note':b} for a,b in grouped('HeroStages',2)]}
record['sections']=[
    section('decision',scalar('ChinaTitle'),paragraphs=[scalar('ChinaBody')]),
    section('scenarios',scalar('FitTitle'),intro=scalar('FitBody'),cards=[{'tag':a,'title':b,'copy':c} for a,b,c in grouped('Situations',3)]),
    section('workflow',scalar('ProcessTitle'),intro=scalar('ProcessBody'),steps=[{'step':a,'title':b,'copy':c} for a,b,c in grouped('ProcessSteps',3)]),
    section('checklist','Produit, fournisseur et décision dans le même brief.',items=go_field('ChinaPoints')),
    section('checklist',scalar('RequirementsTitle'),body=scalar('RequirementsBody'),items=go_field('Requirements')),
    section('faq',scalar('FAQTitle'),guide=scalar('FAQBody'),items=[{'id':f'fr-sourcing-{i}','question':a,'answer':b} for i,(a,b) in enumerate(grouped('FAQs',2))]),
]
record['enquiry']={'kicker':scalar('ContactKicker'),'heading':scalar('ContactTitle'),'body':scalar('ContactBody'),'reassurance':[],'contextTitle':'Contexte de votre demande','contextFields':[]}
topics={route:record,**topics}
for route,record in topics.items():
    record['related']={'heading':'Services liés','links':[{'label':label,'href':'/fr/'+other,'note':notes[other]} for other,label in labels.items() if other!=route and not other.startswith('industries/')]}
    record['relatedIndustries']={'heading':'Secteurs liés','links':[{'label':label,'href':'/fr/'+other,'note':notes[other]} for other,label in labels.items() if other!=route and other.startswith('industries/')]}
target=ROOT/'frontend/topic-template/src/content/fr/topics.ts'
target.write_text("// Generated from docs/freightvanta-fr-topic-copy-source.md by import-fr-copy.py.\nimport type { TopicPageContent } from '../en-global/topics/types';\nexport const FR_TOPICS: Record<string, TopicPageContent> = "+json.dumps(topics,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
nav=[{'route':route,'slug':route.split('/')[-1],'kind':record['kind'],'navLabel':record['pageLabel'],'menuLine':notes[route]} for route,record in topics.items()]
nav_source="// Generated alongside the French topic content.\nimport { homeContext } from '../../lib/home-context';\nimport { localizedUrl } from '../../config/site';\nconst topics = "+json.dumps(nav,ensure_ascii=False,indent=2)+";\nexport const FR_TOPIC_SERVICES = topics.filter(t => t.kind === 'service');\nexport const FR_TOPIC_INDUSTRIES = topics.filter(t => t.kind === 'industry');\nexport function frTopicHref(route: string) { return (homeContext()?.languages.fr ?? localizedUrl('/fr/', 'fr')).replace(/\\/$/, '') + '/' + route; }\n"
(ROOT/'frontend/reference-template/src/content/fr/topic-nav.ts').write_text(nav_source,encoding='utf-8')
out=ROOT/'output/fr-topics';out.mkdir(parents=True,exist_ok=True)
(out/'content-model.json').write_text(json.dumps(topics,ensure_ascii=False,indent=2),encoding='utf-8')
assert len(topics)==10
assert sum(len(s['content']['items']) for t in topics.values() for s in t['sections'] if s['type']=='faq')==58
print('Imported 10 French topics, 54 supplied FAQ pairs and 4 existing sourcing FAQ pairs.')
