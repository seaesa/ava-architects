// Fetch every Vietnamese URL of ava-architects.vn into .cache/ for offline parsing.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const CACHE = join(ROOT, '.cache');
mkdirSync(CACHE, { recursive: true });

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

export const cacheKey = (url) => createHash('sha1').update(url).digest('hex') + '.html';

export async function fetchPage(url, { force = false } = {}) {
  const file = join(CACHE, cacheKey(url));
  if (!force && existsSync(file)) return readFileSync(file, 'utf8');
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'vi,en;q=0.8' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const html = await res.text();
  writeFileSync(file, html);
  return html;
}

async function pool(items, size, worker) {
  const queue = [...items];
  let done = 0;
  const runners = Array.from({ length: size }, async () => {
    while (queue.length) {
      const item = queue.shift();
      try { await worker(item); } catch (e) { console.error('FAIL', item, e.message); }
      if (++done % 25 === 0) console.log(`  ${done}/${items.length}`);
    }
  });
  await Promise.all(runners);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const urls = readFileSync(join(ROOT, 'build/vi_urls.txt'), 'utf8')
    .split('\n').map(s => s.trim())
    .filter(u => u.startsWith('http') && !u.endsWith('.kml'));
  console.log(`Crawling ${urls.length} pages...`);
  await pool(urls, 6, (u) => fetchPage(u));
  console.log('Done.');
}
