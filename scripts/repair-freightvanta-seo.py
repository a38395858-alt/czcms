"""Repair audited FreightVanta records without replacing a deployment database.

Dry-run by default. --apply creates a consistent SQLite backup and JSON change
record, then commits only the listed fields in one transaction. Media files,
accounts, enquiries, SMTP and robots settings are never modified.
"""
import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import re
import sqlite3
from urllib.parse import urlsplit


def is_example(value):
    try:
        return urlsplit(value).hostname in {"example.com", "www.example.com"}
    except ValueError:
        return False


def clean_schema(value):
    if isinstance(value, dict):
        return {k: clean_schema(v) for k, v in value.items()
                if not (isinstance(v, str) and is_example(v))}
    if isinstance(value, list):
        return [clean_schema(v) for v in value if not (isinstance(v, str) and is_example(v))]
    if value in ("Global Route", "Global Route English"):
        return "FreightVanta"
    return value


def plan(connection):
    changes = []
    sites = connection.execute("SELECT id,code,name,seo_title FROM sites WHERE code IN ('global','germany','france','spain','italy','netherlands')").fetchall()
    for site in sites:
        values = {}
        if site['code'] == 'global':
            if site['name'] in ('Global Route English', 'Global Route'):
                values['name'] = 'FreightVanta English'
            if not site['seo_title']:
                values['seo_title'] = 'China Product Sourcing & International Logistics | FreightVanta'
        if values:
            changes.append(dict(table='sites', id=site['id'], fields=values))
        for row in connection.execute('SELECT * FROM content_locales WHERE site_id=?', (site['id'],)):
            fields = {}
            for field in ('seo_title','og_title'):
                current = row[field] or ''
                fixed = re.sub(r'\s*\|\s*Global Route(?: English)?\s*$', ' | FreightVanta', current)
                if fixed != current:
                    fields[field] = fixed
            if is_example(row['canonical_url'] or ''):
                fields['canonical_url'] = ''  # Derive from the actual site origin.
            raw = row['structured_data_json'] or '{}'
            try:
                parsed = json.loads(raw)
            except json.JSONDecodeError:
                parsed = None
            if parsed is not None:
                clean = clean_schema(parsed)
                if clean != parsed:
                    fields['structured_data_json'] = json.dumps(clean, ensure_ascii=False, separators=(',', ':'))
            if site['code'] == 'global' and row['slug'] == 'temperature-controlled-cargo-planning':
                # Audited legacy screenshots. Unlink only; retain original files.
                body = re.sub(r'<p>\s*<img\b[^>]*src="/media/32/b83e7f45c9fa748f"[^>]*>(?:<br\s*/?>)?\s*</p>', '', row['body_html'])
                if body != row['body_html']:
                    fields['body_html'] = body
                if row['cover_media_id'] in (26,27,28,29,30,31,32):
                    fields['cover_media_id'] = None
                gallery = json.loads(row['gallery_media_ids_json'] or '[]')
                keep = [i for i in gallery if i not in (26,27,28,29,30,31,32)]
                if keep != gallery:
                    fields['gallery_media_ids_json'] = json.dumps(keep)
            if fields:
                changes.append(dict(table='content_locales', id=row['id'], slug=row['slug'], fields=fields))
    # These three legacy entries are informational guides in the guide index,
    # and their authored schema already describes Article, not a saleable item.
    slugs=('temperature-controlled-cargo-planning','customs-documentation-support','express-freight-coordination')
    rows=connection.execute('SELECT DISTINCT c.id,c.content_type FROM contents c JOIN content_locales cl ON cl.content_id=c.id JOIN sites s ON s.id=cl.site_id WHERE s.code=? AND cl.slug IN (?,?,?)', ('global',*slugs)).fetchall()
    for row in rows:
        if row['content_type']=='product':
            changes.append(dict(table='contents', id=row['id'], fields={'content_type':'article'}))
    return changes


def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--database', required=True, type=Path)
    ap.add_argument('--apply', action='store_true')
    ap.add_argument('--backup-dir', type=Path)
    args=ap.parse_args()
    path=args.database.resolve(strict=True)
    with sqlite3.connect(path) as conn:
        conn.row_factory=sqlite3.Row
        changes=plan(conn)
        print(json.dumps({'mode':'apply' if args.apply else 'dry-run','changes':changes}, ensure_ascii=True, indent=2))
        if not args.apply or not changes:
            return
        folder=args.backup_dir or path.parent/'seo-repair-backups'
        folder.mkdir(parents=True,exist_ok=True)
        stamp=datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
        backup=folder/(stamp+'.db')
        with sqlite3.connect(backup) as dest:
            conn.backup(dest)
        now=datetime.now(timezone.utc).isoformat()
        conn.execute('BEGIN IMMEDIATE')
        try:
            # Detect any edit between inspection and the transaction.
            if plan(conn) != changes:
                raise RuntimeError('Records changed; retry the dry run.')
            originals=[]
            for change in changes:
                table=change['table'];fields=change['fields']
                originals.append({'table':table,'id':change['id'],'before':dict(conn.execute(f'SELECT * FROM {table} WHERE id=?',(change['id'],)).fetchone()),'fields':fields})
                columns=','.join(f'{key}=?' for key in fields)
                conn.execute(f'UPDATE {table} SET {columns},version=version+1,updated_at=? WHERE id=?',(*fields.values(),now,change['id']))
            (folder/(stamp+'.json')).write_text(json.dumps(originals,ensure_ascii=False,indent=2),encoding='utf-8')
            conn.commit()
        except BaseException:
            conn.rollback()
            raise
        print(json.dumps({'backup':str(backup),'applied_records':len(changes)}))


if __name__=='__main__':
    main()
