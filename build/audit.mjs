// Static audit: which pages each fix actually touches, and whether the
// markup-level expectations hold across the whole build.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;

function htmlFiles(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (['node_modules', '.cache', 'assets', 'docs', 'build', 'data', 'src'].includes(name) || name.startsWith('.')) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) htmlFiles(p, acc);
    else if (name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

const pages = htmlFiles(ROOT);
const CHECKS = {
  'header + off-canvas markup': (h) => /id="main-menu"/.test(h) && /data-open="#main-menu"/.test(h),
  'EN link inert':              (h) => /class="lang-en"/.test(h) && !/href="https:\/\/ava-architects\.vn\/en\/"/.test(h),
  'nav caret present':          (h) => /icon-angle-down/.test(h),
  'search lightbox markup':     (h) => /id="search-lightbox"/.test(h),
  'stylesheet linked':          (h) => /assets\/css\/style\.css/.test(h),
  'script linked':              (h) => /assets\/js\/main\.js/.test(h),
  'no stale animate attrs':     (h) => !/data-animated=/.test(h) && !/data-animate-transform=/.test(h),
};

const FEATURES = {
  'has [data-animate]':      (h) => /data-animate="/.test(h),
  'has a .banner':           (h) => /class="[^"]*\bbanner\b/.test(h),
  'has banner <h1>':         (h) => /class="[^"]*\bbanner\b[\s\S]{0,4000}?<h1/.test(h),
  'has .section-title link': (h) => /section-title[\s\S]{0,400}?<a /.test(h),
  'has a slider':            (h) => /data-flickity-options/.test(h),
  'has a form':              (h) => /<form/.test(h),
};

const fails = {};
const counts = {};
for (const key of Object.keys(CHECKS)) fails[key] = [];
for (const key of Object.keys(FEATURES)) counts[key] = 0;

for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  for (const [key, fn] of Object.entries(CHECKS)) if (!fn(html)) fails[key].push(relative(ROOT, file));
  for (const [key, fn] of Object.entries(FEATURES)) if (fn(html)) counts[key]++;
}

console.log(`pages audited: ${pages.length}\n`);
console.log('Invariants (must hold on every page):');
for (const [key, list] of Object.entries(fails)) {
  const ok = list.length === 0;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${key.padEnd(26)} ${ok ? '' : list.length + ' failing: ' + list.slice(0, 3).join(', ')}`);
}
console.log('\nReach of each fix:');
for (const [key, n] of Object.entries(counts)) {
  console.log(`  ${String(n).padStart(3)} / ${pages.length}  ${key}`);
}

const anyFail = Object.values(fails).some((l) => l.length);
process.exit(anyFail ? 1 : 0);
