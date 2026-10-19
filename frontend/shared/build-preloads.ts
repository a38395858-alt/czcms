import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface Chunk { file: string; imports?: string[]; isEntry?: boolean }

/** Preload the selected locale and its static dependencies, never other locales. */
export function writePreloads(output: string, base: string, entries: Record<string, string>) {
  const chunks: Record<string, Chunk> = JSON.parse(readFileSync(resolve(output, '.vite/manifest.json'), 'utf8'));
  const main = Object.keys(chunks).find(key => chunks[key].isEntry && !key.endsWith('.css'));
  if (!main) throw new Error('Missing client entry in Vite manifest');
  const locales = Object.fromEntries(Object.entries(entries).map(([locale, entry]) => {
    if (!chunks[entry]) throw new Error(`Missing ${locale} chunk: ${entry}`);
    const files = new Set<string>();
    const seen = new Set<string>();
    const visit = (key: string) => {
      if (seen.has(key)) return;
      seen.add(key);
      const chunk = chunks[key];
      if (!chunk) throw new Error(`Missing chunk dependency: ${key}`);
      for (const dependency of chunk.imports ?? []) visit(dependency);
      if (key !== main) files.add(base + chunk.file);
    };
    visit(main);
    visit(entry);
    return [locale, [...files]];
  }));
  writeFileSync(resolve(output, 'client.json'), JSON.stringify({ entry: base + chunks[main].file, preloads: locales }, null, 2));
  return locales;
}
