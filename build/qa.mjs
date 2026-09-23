// Runtime QA: drive every main page and assert the behaviours we rebuilt.
// Usage: node build/qa.mjs   (the preview server must be running)
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:4173';

const PAGES = [
  ['home',            '/'],
  ['về AVA',          '/ve-ava-architects/'],
  ['con người AVA',   '/con-nguoi-ava/'],
  ['dịch vụ',         '/dich-vu/'],
  ['dịch vụ chi tiết','/dich-vu/dich-vu-chi-tiet/'],
  ['dự án',           '/du-an/'],
  ['tin tức',         '/tin-tuc/'],
  ['liên hệ',         '/lien-he/'],
  ['chi tiết dự án',  '/chi-tiet-du-an/bellerive-resort/'],
  ['bài viết',        '/phong-cach-japandi/'],
  ['chuyên mục',      '/chuyen-muc/blog-thiet-ke-ava/'],
  ['tìm kiếm',        '/search/'],
];

const results = [];
const record = (page, name, ok, detail = '') => results.push({ page, name, ok, detail });

const browser = await chromium.launch();

/* ---------------------------------------------------------------- desktop */
const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });

for (const [label, path] of PAGES) {
  await desktop.goto(BASE + path, { waitUntil: 'load' });
  await desktop.waitForTimeout(400);

  // Scroll the whole page so lazy content and reveals fire, then let the
  // 1.6s transform transition finish before measuring.
  await desktop.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); }
    window.scrollTo(0, 0);
    // Pause every carousel (they stop on hover) so measurements never land
    // mid-transition.
    document.querySelectorAll('.slider.flickity-enabled')
      .forEach(s => s.dispatchEvent(new MouseEvent('mouseenter')));
  });
  await desktop.waitForTimeout(2600);

  const r = await desktop.evaluate(() => {
    const cs = (el, p) => (el ? getComputedStyle(el)[p] : null);
    const anim = [...document.querySelectorAll('[data-animate]')];
    const caret = document.querySelector('#header .header-nav-main li.has-dropdown > a > i');
    const bannerH1 = document.querySelector('.banner h1');
    const titleIcon = document.querySelector('.section-title a i');
    return {
      brokenImgs: [...document.querySelectorAll('img')].filter(i => i.complete && i.naturalWidth === 0)
        .map(i => i.getAttribute('src')),
      animTotal: anim.length,
      animStuck: anim.filter(e => cs(e, 'opacity') === '0' && !e.closest('.flickity-slider')).length,
      animOffset: anim.filter(e => { const t = cs(e, 'transform'); return t && t !== 'none' && t !== 'matrix(1, 0, 0, 1, 0, 0)' && !e.closest('.flickity-slider'); }).length,
      caret: caret ? { fs: cs(caret, 'fontSize'), ml: cs(caret, 'marginLeft'), op: cs(caret, 'opacity') } : null,
      enHref: document.querySelector('a.lang-en')?.getAttribute('href'),
      bannerH1: bannerH1 ? cs(bannerH1, 'fontSize') : null,
      titleIconContent: titleIcon ? getComputedStyle(titleIcon, '::before').content : null,
      sliders: document.querySelectorAll('.slider').length,
      slidersReady: document.querySelectorAll('.slider.flickity-enabled').length,
      // The real invariant, whatever cellAlign/contain work out to: the
      // selected cell must sit wholly inside the viewport, never half-cropped.
      slidersSnapped: [...document.querySelectorAll('.slider.flickity-enabled')].every(s => {
        const vp = s.querySelector('.flickity-viewport');
        const sel = s.querySelector('.flickity-slider > .is-selected');
        if (!vp || !sel) return true;
        const v = vp.getBoundingClientRect(), c = sel.getBoundingClientRect();
        return c.left >= v.left - 2 && c.right <= v.right + 2;
      }),
      overflowX: document.documentElement.scrollWidth > window.innerWidth,
    };
  });

  record(label, 'no broken images', r.brokenImgs.length === 0, r.brokenImgs.slice(0, 2).join(', '));
  record(label, 'reveals settled', r.animStuck === 0 && r.animOffset === 0, `${r.animTotal} animated, ${r.animStuck} stuck, ${r.animOffset} offset`);
  record(label, 'caret spaced + dimmed', !r.caret || (r.caret.fs === '16px' && r.caret.ml === '3.2px' && r.caret.op === '0.6'), JSON.stringify(r.caret));
  record(label, 'EN inert', r.enHref === '#', String(r.enHref));
  if (r.bannerH1) record(label, 'banner h1 = 56px', r.bannerH1 === '56px', r.bannerH1);
  if (r.titleIconContent) record(label, 'title arrow is image', /url\(/.test(r.titleIconContent), r.titleIconContent.slice(0, 40));
  record(label, 'sliders initialised', r.sliders === r.slidersReady, `${r.slidersReady}/${r.sliders}`);
  record(label, 'sliders snapped', r.slidersSnapped);
  record(label, 'no horizontal overflow', !r.overflowX);

  // The contact page is hand-authored; assert its layout holds together.
  if (path === '/lien-he/') {
    const c = await desktop.evaluate(() => {
      const R = n => Math.round(n);
      const grid = document.querySelector('.c-grid');
      const card = document.querySelector('.c-card');
      const form = document.querySelector('.c-formwrap');
      const map = document.querySelector('.c-map__frame iframe');
      const fields = [...document.querySelectorAll('.c-field__input')];
      const labels = [...document.querySelectorAll('.c-field__label')];
      const cardR = card.getBoundingClientRect(), formR = form.getBoundingClientRect();
      return {
        cols: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
        gap: R(formR.left - cardR.right),
        cardW: R(cardR.width), formW: R(formR.width),
        fields: fields.length, labels: labels.length,
        everyFieldLabelled: fields.every(f => !!document.querySelector(`label[for="${f.id}"]`)),
        mapW: R(map.getBoundingClientRect().width),
        mapH: R(map.getBoundingClientRect().height),
        containerW: R(document.querySelector('.c-map .container').getBoundingClientRect().width),
        cardTop: R(cardR.top), formTop: R(formR.top),
        hasContactDetails: /29 Nguyễn Sơn Trà/.test(document.querySelector('.c-info').textContent),
      };
    });
    record(label, 'contact: two columns', c.cols === 2, String(c.cols));
    record(label, 'contact: 28px gutter', Math.abs(c.gap - 28) <= 1, String(c.gap));
    record(label, 'contact: card + form aligned', c.cardTop === c.formTop, `${c.cardTop}/${c.formTop}`);
    record(label, 'contact: every field labelled', c.everyFieldLabelled && c.labels >= c.fields, `${c.labels} labels / ${c.fields} fields`);
    record(label, 'contact: map inside container', Math.abs(c.mapW - c.containerW + 30) <= 2, `${c.mapW} vs ${c.containerW}`);
    record(label, 'contact: map 420px tall', Math.abs(c.mapH - 420) <= 1, String(c.mapH));
    record(label, 'contact: details present', c.hasContactDetails);
  }

  // Search lightbox geometry (header control exists on every page).
  const lb = await desktop.evaluate(async () => {
    const t = document.querySelector('a[data-open="#search-lightbox"]');
    if (!t) return null;
    t.click();
    await new Promise(r => setTimeout(r, 700));
    const round = (n) => Math.round(n * 100) / 100;
    const input = document.querySelector('#search-lightbox input.search-field');
    const btn = document.querySelector('#search-lightbox button.ux-search-submit');
    const back = getComputedStyle(document.querySelector('.search-lightbox-overlay'), '::before');
    const out = {
      inputW: round(input.getBoundingClientRect().width),
      inputH: round(input.getBoundingClientRect().height),
      btnL: round(btn.getBoundingClientRect().left),
      backdrop: back.backgroundColor, backdropOpacity: back.opacity,
    };
    document.querySelector('.search-lightbox-close').click();
    await new Promise(r => setTimeout(r, 400));
    out.closed = !document.querySelector('.search-lightbox-overlay').classList.contains('is-open');
    return out;
  });
  if (lb) {
    record(label, 'search field 605×67', Math.abs(lb.inputW - 605) < 2 && Math.abs(lb.inputH - 67.1) < 1, `${lb.inputW}×${lb.inputH}`);
    record(label, 'search submit overlaps', Math.abs(lb.btnL - 949) < 3, String(lb.btnL));
    record(label, 'search backdrop #0b0b0b/.6', lb.backdrop === 'rgb(11, 11, 11)' && lb.backdropOpacity === '0.6');
    record(label, 'search closes', lb.closed === true);
  }
}
await desktop.close();

/* ----------------------------------------------------------------- mobile */
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });

for (const [label, path] of PAGES.slice(0, 8)) {
  await mobile.goto(BASE + path, { waitUntil: 'load' });
  await mobile.waitForTimeout(600);

  const m = await mobile.evaluate(async () => {
    const round = (n) => Math.round(n * 100) / 100;
    const rect = (el) => { const r = el.getBoundingClientRect(); return { l: round(r.left), r: round(r.right), h: round(r.height) }; };
    const burger = rect(document.querySelector('.nav-icon .button'));
    const containerRight = round(document.querySelector('.header-inner').getBoundingClientRect().right - 15);

    document.querySelector('a[data-open="#main-menu"]').click();
    await new Promise(r => setTimeout(r, 700));
    const panel = rect(document.querySelector('#main-menu'));
    const items = [...document.querySelectorAll('#main-menu .nav-slide > li.menu-item')].map(li => round(li.getBoundingClientRect().height));

    const parent = [...document.querySelectorAll('#main-menu .nav-slide > li')].find(li => li.querySelector('button.toggle'));
    parent.querySelector('button.toggle').click();
    await new Promise(r => setTimeout(r, 700));
    const sub = parent.querySelector('.sub-menu');
    const hdr = sub.querySelector('.nav-slide-header');
    const subItem = sub.querySelector('li.menu-item');
    const out = {
      burgerFlush: Math.abs(burger.r - containerRight) < 2,
      panelFlush: Math.abs(panel.r - window.innerWidth) < 2,
      itemsUniform: new Set(items.map(h => Math.round(h))).size === 1 && Math.abs(items[0] - 51.47) < 1,
      subFlush: Math.abs(rect(sub).r - window.innerWidth) < 2,
      hdrH: round(hdr.getBoundingClientRect().height),
      subItemH: round(subItem.getBoundingClientRect().height),
      trayShift: getComputedStyle(document.querySelector('#main-menu .sidebar-menu')).transform,
      overflowX: document.documentElement.scrollWidth > window.innerWidth,
    };
    sub.querySelector('.nav-slide-header .toggle').click();
    await new Promise(r => setTimeout(r, 600));
    out.backWorks = getComputedStyle(document.querySelector('#main-menu .sidebar-menu')).transform === 'matrix(1, 0, 0, 1, 0, 0)';
    document.querySelector('.off-canvas-close').click();
    await new Promise(r => setTimeout(r, 500));
    out.closes = !document.querySelector('#main-menu').classList.contains('is-open');
    return out;
  });

  record(label + ' (mobile)', 'burger flush right', m.burgerFlush);
  record(label + ' (mobile)', 'panel flush right', m.panelFlush);
  record(label + ' (mobile)', 'rows uniform 51.47px', m.itemsUniform);
  record(label + ' (mobile)', 'submenu aligned', m.subFlush);
  record(label + ' (mobile)', 'back row 68.8px', Math.abs(m.hdrH - 68.8) < 1.5, String(m.hdrH));
  record(label + ' (mobile)', 'sub item 35.59px', Math.abs(m.subItemH - 35.59) < 1.5, String(m.subItemH));
  record(label + ' (mobile)', 'tray slid -300px', /matrix\(1, 0, 0, 1, -300, 0\)/.test(m.trayShift), m.trayShift);
  record(label + ' (mobile)', 'back returns', m.backWorks);
  record(label + ' (mobile)', 'menu closes', m.closes);
  record(label + ' (mobile)', 'no horizontal overflow', !m.overflowX);
}
await mobile.close();
await browser.close();

/* ---------------------------------------------------------------- report */
const byPage = new Map();
for (const r of results) {
  if (!byPage.has(r.page)) byPage.set(r.page, []);
  byPage.get(r.page).push(r);
}
let pass = 0, fail = 0;
for (const [page, list] of byPage) {
  const bad = list.filter((r) => !r.ok);
  pass += list.length - bad.length;
  fail += bad.length;
  console.log(`${bad.length ? 'FAIL' : 'ok  '}  ${page.padEnd(22)} ${list.length - bad.length}/${list.length}`);
  for (const b of bad) console.log(`        ✗ ${b.name}${b.detail ? '  — ' + b.detail : ''}`);
}
console.log(`\n${pass} passed, ${fail} failed, across ${byPage.size} page runs`);
process.exit(fail ? 1 : 0);
