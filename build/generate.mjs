// Turn the extracted page data into a static site under the project root.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { documentShell } from './layout.mjs';
import { localPath } from './paths.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const ORIGIN = 'https://ava-architects.vn';

const pages = readdirSync(join(ROOT, 'data/pages'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(ROOT, 'data/pages', f), 'utf8')));

/** slug -> output file, and the set of slugs we actually publish. */
const published = new Set(pages.filter((p) => p.meta.template !== 'redirect').map((p) => p.meta.slug));

const outFileFor = (slug) => (slug === 'index' ? 'index.html' : `${slug}/index.html`);
/** Prefix that walks from a page back up to the site root. */
const relFor = (slug) => (slug === 'index' ? '' : '../'.repeat(slug.split('/').length));

// ---------------------------------------------------------------------------
// URL rewriting
// ---------------------------------------------------------------------------

/** Map one absolute ava-architects.vn URL onto its place in the static build. */
function rewriteUrl(url, rel) {
  let u;
  try { u = new URL(url, ORIGIN); } catch { return url; }
  if (u.hostname !== 'ava-architects.vn') return url;

  // Uploads and theme files become local assets.
  if (u.pathname.startsWith('/wp-content/')) {
    const local = localPath(u.href);
    return rel + local;
  }

  // The English site is out of scope for this clone; keep those links live.
  if (u.pathname.startsWith('/en/')) return u.href;

  const slug = u.pathname.replace(/^\/|\/$/g, '') || 'index';

  // Dead URLs that the live site redirects home.
  const page = pages.find((p) => p.meta.slug === slug);
  if (page && page.meta.template === 'redirect') return rel + 'index.html';

  if (published.has(slug)) {
    return rel + (slug === 'index' ? 'index.html' : slug + '/') + (u.hash || '');
  }

  // Tag / author / pagination archives we do not publish: send them to the
  // nearest thing we do have rather than leaving a dead link.
  if (u.pathname.startsWith('/tags/')) return rel + 'tin-tuc/';
  if (u.pathname.startsWith('/author/')) return rel + 'tin-tuc/';
  if (/\/page\/\d+\/?$/.test(u.pathname)) {
    const base = u.pathname.replace(/\/page\/\d+\/?$/, '').replace(/^\/|\/$/g, '');
    if (published.has(base)) return rel + base + '/';
    return rel + 'tin-tuc/';
  }

  // Anything else still on the original domain stays absolute.
  return u.href;
}

/** Rewrite every ava-architects.vn URL that appears in a blob of HTML or CSS. */
function rewriteAll(text, rel) {
  return text
    // href="..." / src="..." / url(...)
    .replace(/(href|src|content)=("|')(https?:\/\/ava-architects\.vn[^"']*)\2/g,
      (_, attr, q, url) => `${attr}=${q}${rewriteUrl(url, rel)}${q}`)
    .replace(/url\((['"]?)(https?:\/\/ava-architects\.vn[^'")]*)\1\)/g,
      (_, q, url) => `url(${q}${rewriteUrl(url, rel)}${q})`)
    // root-relative paths the builder sometimes emits
    .replace(/(href|src)=("|')(\/wp-content\/[^"']*)\2/g,
      (_, attr, q, path) => `${attr}=${q}${rewriteUrl(ORIGIN + path, rel)}${q}`);
}

// ---------------------------------------------------------------------------
// Stylesheet + script bundles
// ---------------------------------------------------------------------------

function buildAssets() {
  const cssDir = join(ROOT, 'src/css');
  const parts = readdirSync(cssDir).filter((f) => f.endsWith('.css')).sort();
  const css = parts
    .map((f) => `/* ===== ${f} ===== */\n` + readFileSync(join(cssDir, f), 'utf8'))
    .join('\n\n');
  mkdirSync(join(ROOT, 'assets/css'), { recursive: true });
  writeFileSync(join(ROOT, 'assets/css/style.css'), css);

  mkdirSync(join(ROOT, 'assets/js'), { recursive: true });
  writeFileSync(join(ROOT, 'assets/js/main.js'), readFileSync(join(ROOT, 'src/js/main.js'), 'utf8'));

  return { cssParts: parts.length, cssBytes: css.length };
}

// ---------------------------------------------------------------------------
// Page rendering
// ---------------------------------------------------------------------------

function render(page) {
  const { meta, content, builderCss } = page;
  const rel = relFor(meta.slug);

  const html = documentShell({
    rel,
    slug: meta.slug,
    title: meta.title || 'AVA Architects',
    description: meta.description,
    ogImage: meta.ogImage ? rewriteUrl(meta.ogImage, rel) : '',
    bodyClass: meta.bodyClass,
    builderCss: rewriteAll(builderCss || '', rel),
    content: rewriteAll(content, rel),
  });

  const out = join(ROOT, outFileFor(meta.slug));
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  return out;
}

/** A client-side search page plus the index it queries. */
function renderSearch() {
  const items = pages
    .filter((p) => p.meta.template !== 'redirect' && !p.meta.slug.startsWith('blocks/'))
    .map((p) => ({
      u: p.meta.slug === 'index' ? './' : '../' + p.meta.slug + '/',
      t: p.meta.title.replace(/\s*[-–]\s*AVA.*$/, '').trim() || p.meta.title,
      d: (p.meta.description || '').slice(0, 180),
      k: p.meta.template,
    }))
    .sort((a, b) => a.t.localeCompare(b.t, 'vi'));

  mkdirSync(join(ROOT, 'search'), { recursive: true });
  writeFileSync(join(ROOT, 'search/index.json'), JSON.stringify(items));

  const html = documentShell({
    rel: '../',
    slug: 'search',
    title: 'Tìm kiếm - AVA Architects',
    description: 'Tìm kiếm nội dung trên website AVA Architects.',
    ogImage: '',
    bodyClass: 'search',
    builderCss: '',
    content: `<div id="content" class="content-area page-wrapper">
  <div class="row">
    <div class="col large-12">
      <div class="col-inner">
        <div class="container section-title-container">
          <h3 class="section-title section-title-normal"><b></b><span class="section-title-main">Tìm kiếm</span><b></b></h3>
        </div>
        <form class="searchform" id="site-search" role="search" onsubmit="return false">
          <div class="flex-row relative">
            <div class="flex-col flex-grow">
              <input type="search" id="q" class="search-field mb-0" name="s" placeholder="Nhập từ khóa…" aria-label="Từ khóa">
            </div>
            <div class="flex-col">
              <button type="submit" class="ux-search-submit submit-button secondary button icon mb-0" aria-label="Tìm"><i class="icon-search"></i></button>
            </div>
          </div>
        </form>
        <p id="search-count" class="is-small op-7" style="margin-top:1em"></p>
        <div id="search-results" class="row large-columns-1 medium-columns-1 small-columns-1"></div>
      </div>
    </div>
  </div>
</div>
<script>
(function () {
  // The original searches server-side; with a static build we filter a small
  // index of every published page instead.
  var results = document.getElementById('search-results');
  var count = document.getElementById('search-count');
  var input = document.getElementById('q');
  var index = [];

  var fold = function (s) {
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
  };

  fetch('index.json').then(function (r) { return r.json(); }).then(function (data) {
    index = data.map(function (it) { it.f = fold(it.t + ' ' + it.d); return it; });
    run();
  });

  function run() {
    var q = fold(input.value.trim());
    if (!q) { results.innerHTML = ''; count.textContent = 'Nhập từ khóa để tìm kiếm.'; return; }
    var terms = q.split(/\s+/);
    var hits = index.filter(function (it) {
      return terms.every(function (t) { return it.f.indexOf(t) !== -1; });
    }).slice(0, 60);
    count.textContent = hits.length
      ? 'Tìm thấy ' + hits.length + ' kết quả cho "' + input.value.trim() + '"'
      : 'Không tìm thấy kết quả cho "' + input.value.trim() + '"';
    results.innerHTML = hits.map(function (it) {
      return '<div class="col post-item"><div class="col-inner"><div class="box box-blog-post">'
        + '<div class="box-text text-left"><p class="cat-label">' + it.k + '</p>'
        + '<h5 class="post-title is-large"><a href="' + it.u + '">' + it.t + '</a></h5>'
        + (it.d ? '<p class="from_the_blog_excerpt">' + it.d + '</p>' : '')
        + '</div></div></div></div>';
    }).join('');
  }

  input.addEventListener('input', run);
  var q = new URLSearchParams(location.search).get('s');
  if (q) input.value = q;
  input.focus();
})();
</script>`,
  });
  writeFileSync(join(ROOT, 'search/index.html'), html);
}

/** A tiny 404 page using the same chrome. */
function render404() {
  const html = documentShell({
    rel: '',
    slug: '404',
    title: 'Không tìm thấy trang - AVA Architects',
    description: 'Trang bạn tìm không tồn tại.',
    ogImage: '',
    bodyClass: 'error404',
    builderCss: '',
    content: `<div id="content" class="content-area page-wrapper">
  <div class="row">
    <div class="col large-12 text-center">
      <div class="col-inner" style="padding:60px 0;">
        <h1 style="font-size:4em;margin-bottom:.2em;">404</h1>
        <p class="is-large">Rất tiếc, chúng tôi không tìm thấy trang bạn yêu cầu.</p>
        <a href="index.html" class="button primary is-outline lowercase"><span>Về trang chủ</span><i class="icon-angle-right"></i></a>
      </div>
    </div>
  </div>
</div>`,
  });
  writeFileSync(join(ROOT, '404.html'), html);
}

// ---------------------------------------------------------------------------

const assets = buildAssets();
let count = 0;
const byTemplate = {};
for (const page of pages) {
  if (page.meta.template === 'redirect') continue;
  render(page);
  byTemplate[page.meta.template] = (byTemplate[page.meta.template] || 0) + 1;
  count++;
}
render404();
renderSearch();

console.log(`css: ${assets.cssParts} parts, ${(assets.cssBytes / 1024).toFixed(1)} KB`);
console.log(`pages: ${count} + 404`, byTemplate);
