// Parse every cached page into normalised JSON: meta + cleaned content HTML + asset list.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import * as cheerio from 'cheerio';
import { cacheKey } from './crawl.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const ORIGIN = 'https://ava-architects.vn';

export const slugOf = (url) => {
  const p = new URL(url).pathname.replace(/^\/|\/$/g, '');
  return p === '' ? 'index' : p;
};

/** Which template a page uses, from its <body> classes. */
export function templateOf($, url) {
  const c = $('body').attr('class') || '';
  // Dead URLs on the live site serve the homepage; treat them as redirects, not pages.
  if (/\bhome\b/.test(c)) return slugOf(url) === 'index' ? 'home' : 'redirect';
  if (/single-featured_item/.test(c)) return 'project';
  if (/single-post/.test(c)) return 'post';
  if (/\b(category|archive)\b/.test(c)) return 'archive';
  if (/\bpage\b/.test(c)) return 'page';
  return 'other';
}

/** Elements that carry no visual meaning in a static clone. */
const JUNK = [
  'script', 'noscript', 'link', 'meta',
  '.screen-reader-response', '.wpcf7-spinner', 'fieldset.hidden-fields-container',
  '#wpadminbar', '.skip-link', '.grecaptcha-badge',
  'style[id]', // WP enqueued inline stylesheets (we rebuild those ourselves)
];

/** Collect the per-element inline <style> blocks the page builder emits; they hold real layout values. */
function harvestInlineStyles($, $scope) {
  const css = [];
  $scope.find('style').each((_, el) => {
    const txt = $(el).html() || '';
    // only the builder's scoped rules (#id { ... }) — never global resets
    if (/#[\w-]+\s*(\{|[>,])/.test(txt)) css.push(txt.trim());
    $(el).remove();
  });
  return css.join('\n');
}

export function extract(url, html) {
  const $ = cheerio.load(html, { decodeEntities: false });
  const template = templateOf($, url);

  const meta = {
    url,
    slug: slugOf(url),
    template,
    title: $('title').text().trim(),
    description: $('meta[name="description"]').attr('content') || '',
    ogImage: $('meta[property="og:image"]').attr('content') || '',
    bodyClass: ($('body').attr('class') || '')
      .split(/\s+/)
      .filter((c) => /^(home|single|page|archive|category|featured-item-|post-template|single-post|single-featured_item)/.test(c))
      .join(' '),
  };

  // --- pick the content root per template -------------------------------
  let $root =
    $('#content').length ? $('#content')
    : $('.portfolio-page-wrapper').length ? $('.portfolio-page-wrapper').parent()
    : $('#main');
  if (!$root.length) $root = $('#wrapper');

  $root.find(JUNK.join(',')).remove();
  const builderCss = harvestInlineStyles($, $root);

  // --- normalise attributes --------------------------------------------
  $root.find('[href]').each((_, el) => {
    const $el = $(el);
    $el.attr('href', $el.attr('href'));
  });
  // drop WP bookkeeping attributes that bloat output
  $root.find('[data-wpcf7-id],[data-status]').removeAttr('data-status');
  $root.find('img').each((_, el) => {
    const $el = $(el);
    $el.removeAttr('srcset').removeAttr('sizes').removeAttr('loading').removeAttr('decoding').removeAttr('fetchpriority');
    // Flatsome lazy attrs -> plain src
    const lazy = $el.attr('data-src');
    if (lazy) { $el.attr('src', lazy); $el.removeAttr('data-src'); }
  });

  // Keep the wrapper element itself (#content / .blog-wrapper / …), not just
  // its children: several layout rules key off its own classes.
  const content = ($.html($root) || '').trim();

  // --- assets -----------------------------------------------------------
  const assets = new Set();
  const addAsset = (u) => {
    if (!u) return;
    let abs;
    try { abs = new URL(u, ORIGIN).href; } catch { return; }
    if (abs.startsWith(ORIGIN + '/wp-content/uploads/')) assets.add(abs.split('?')[0]);
  };
  $root.find('img').each((_, el) => addAsset($(el).attr('src')));
  $root.find('video source, video').each((_, el) => addAsset($(el).attr('src')));
  $root.find('[style]').each((_, el) => {
    const s = $(el).attr('style') || '';
    for (const m of s.matchAll(/url\((['"]?)([^'")]+)\1\)/g)) addAsset(m[2]);
  });
  for (const m of builderCss.matchAll(/url\((['"]?)([^'")]+)\1\)/g)) addAsset(m[2]);
  addAsset(meta.ogImage);

  return { meta, content, builderCss, assets: [...assets] };
}

// ---------------------------------------------------------------------------
if (import.meta.url === `file://${process.argv[1]}`) {
  const urls = readFileSync(join(ROOT, 'build/vi_urls.txt'), 'utf8')
    .split('\n').map((s) => s.trim())
    .filter((u) => u.startsWith('http') && !u.endsWith('.kml'));

  mkdirSync(join(ROOT, 'data/pages'), { recursive: true });
  const index = [];
  const allAssets = new Set();
  const byTemplate = {};

  for (const url of urls) {
    const file = join(ROOT, '.cache', cacheKey(url));
    if (!existsSync(file)) { console.warn('MISSING CACHE', url); continue; }
    const page = extract(url, readFileSync(file, 'utf8'));
    const out = join(ROOT, 'data/pages', page.meta.slug.replace(/\//g, '__') + '.json');
    writeFileSync(out, JSON.stringify(page, null, 1));
    index.push(page.meta);
    page.assets.forEach((a) => allAssets.add(a));
    byTemplate[page.meta.template] = (byTemplate[page.meta.template] || 0) + 1;
  }

  writeFileSync(join(ROOT, 'data/index.json'), JSON.stringify(index, null, 1));
  writeFileSync(join(ROOT, 'data/assets.json'), JSON.stringify([...allAssets].sort(), null, 1));
  console.log('pages:', index.length, byTemplate);
  console.log('assets:', allAssets.size);
}
