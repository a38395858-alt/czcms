"""Verify the supplied Dutch business wording in the actual prerendered HTML."""
import html
import json
import re
from pathlib import Path

root=Path(__file__).resolve().parents[2]
source=(root/'docs/freightvanta-nl-topic-copy-source.md').read_text(encoding='utf-8')
model=json.loads((root/'output/nl-topics/content-model.json').read_text(encoding='utf-8'))
manifest=json.loads((root/'frontend/assets/freightvanta-topic-v18/manifest.json').read_text(encoding='utf-8'))
def normalize(text):
    return re.sub(r'\s+', ' ', html.unescape(text)).strip().rstrip('.')
rows=[]
for route,topic in model.items():
    entry=manifest['nl/'+route]
    markup=(root/'frontend/assets/freightvanta-topic-v18/pages'/entry['file']).read_text(encoding='utf-8')
    visible=normalize(re.sub(r'<[^>]*>', ' ',markup))
    problems=[];phrases=[]
    for key in ['title','description']:
        if entry[key]!=topic['meta'][key]:problems.append('metadata '+key)
    if normalize(topic['hero']['title']) not in visible:problems.append('hero title')
    if normalize(topic['hero']['body']) not in visible:problems.append('hero lead')
    faq=next(s for s in topic['sections'] if s['type']=='faq')['content']['items']
    for item in faq:
        phrases += [item['question'],item['answer']]
    if route!='product-sourcing':
        chapter=next(c for c in re.split(r'(?=^### [12]\.\d )',source,flags=re.M)[1:] if '路由：/nl/'+route+'\n' in c)
        body=chapter.split('**板块与文案**',1)[1].split('**Beeld / CMS**',1)[0]
        for match in re.finditer(r'^\d+\. \*\*(.*?)\*\*\s*\n(.*?)(?=^\d+\. \*\*|\Z)',body,re.M|re.S):
            label,rest=match.groups()
            prefix,_,heading=label.partition(' — ')
            if heading:phrases.append(heading.removeprefix('H2：'))
            for line in rest.strip().splitlines():
                line=line.strip().removeprefix('- ')
                if not line:continue
                if line.startswith(('Inbegrepen:','Eerst bevestigen:','Kan ordenen:')):
                    group,items=line.split(': ',1);phrases += [group,*items.split(', ')]
                elif line.startswith('Vier blokken: '):phrases += line.removeprefix('Vier blokken: ').split('、')
                elif ' — ' in line:phrases += line.split(' — ',1)
                elif ';' in line:phrases += line.split(';')
                else:phrases.append(line)
    phrases=list(dict.fromkeys(normalize(p) for p in phrases if normalize(p)))
    for phrase in phrases:
        if phrase not in visible:problems.append(phrase)
    rows.append({'route':route,'phrasesChecked':len(phrases),'faqPairs':len(faq),'problems':problems})
report={'pages':len(rows),'sourcePhrasesChecked':sum(r['phrasesChecked'] for r in rows),'faqPairs':sum(r['faqPairs'] for r in rows),'rows':rows}
(root/'output/nl-topics/copy-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
assert not any(r['problems'] for r in rows),json.dumps([r for r in rows if r['problems']],ensure_ascii=False)
print(f"PASS: {report['pages']} pages, {report['sourcePhrasesChecked']} source/content phrases, {report['faqPairs']} FAQ pairs.")
