// Inspect a cached page: node build/peek.mjs <url> [--full|--sel=<regex>]
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cacheKey } from './crawl.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const url = process.argv[2];
const html = readFileSync(join(ROOT, '.cache', cacheKey(url)), 'utf8');

const strip = (s) => s.replace(/\?[a-zA-Z0-9=&.#_%;-]*/g, '');

if (process.argv.includes('--full')) { console.log(strip(html)); process.exit(0); }

// body classes
console.log('BODY:', strip(html.match(/<body[^>]*class="([^"]*)"/)?.[1] || ''));
console.log('TITLE:', html.match(/<title>([^<]*)</)?.[1]);

// outline: every element with an id starting section_/row-/col- plus headings
const body = html.slice(html.indexOf('<body'));
const re = /<(section|div|h1|h2|h3|h4|article|nav)\b([^>]*)>/gi;
let m, depth = 0;
const out = [];
while ((m = re.exec(body))) {
  const attrs = m[2];
  const id = attrs.match(/id="([^"]+)"/)?.[1] || '';
  const cls = attrs.match(/class="([^"]+)"/)?.[1] || '';
  if (!/^(section|h1|h2|h3|h4|article)$/i.test(m[1]) && !/^(section_|row-|col-|post-|main-content|content)/.test(id) && !/\b(section|row|entry-content|page-wrapper|portfolio|blog-wrapper|large-9|large-3|post-item|banner|breadcrumb)\b/.test(cls)) continue;
  out.push(`<${m[1].toLowerCase()}${id ? '#' + id : ''}${cls ? ' .' + cls.slice(0, 90) : ''}>`);
}
console.log(out.slice(0, 120).join('\n'));
