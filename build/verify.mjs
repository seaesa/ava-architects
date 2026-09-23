// Check the generated site: every local href/src resolves, and nothing still
// points at the origin except the deliberate /en/ links.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;

function htmlFiles(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.cache' || name === 'assets' ||
        name === 'docs' || name === 'build' || name === 'data' || name === 'src' ||
        name.startsWith('.')) continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) htmlFiles(p, acc);
    else if (name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

const pages = htmlFiles(ROOT);
const missing = new Map();   // target -> [pages]
const leftover = new Map();  // absolute origin URL -> count
let refs = 0;

const note = (map, key, val) => {
  if (!map.has(key)) map.set(key, []);
  if (map.get(key).length < 3) map.get(key).push(val);
};

for (const page of pages) {
  // Strip <script> bodies: markup built by inline JS is not a static reference.
  const html = readFileSync(page, 'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  const base = dirname(page);

  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (/^(https?:|mailto:|tel:|data:|#|javascript:)/.test(url)) {
      if (url.startsWith('https://ava-architects.vn')) {
        const path = new URL(url).pathname;
        if (!path.startsWith('/en/')) note(leftover, url.split('?')[0], relative(ROOT, page));
      }
      continue;
    }
    refs++;
    const clean = url.split('#')[0].split('?')[0];
    if (!clean) continue;
    let target = resolve(base, clean);
    if (clean.endsWith('/')) target = join(target, 'index.html');
    if (!existsSync(target)) note(missing, clean, relative(ROOT, page));
  }
}

console.log(`pages: ${pages.length}`);
console.log(`local references checked: ${refs}`);
console.log(`broken local references: ${missing.size}`);
for (const [k, v] of [...missing].slice(0, 25)) console.log(`   ${k}  <- ${v.join(', ')}`);
console.log(`leftover origin links (non-/en/): ${leftover.size}`);
for (const [k, v] of [...leftover].slice(0, 25)) console.log(`   ${k}  <- ${v.join(', ')}`);

process.exit(missing.size || leftover.size ? 1 : 0);
