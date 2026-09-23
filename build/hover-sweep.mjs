// Hover / scroll parity sweep: hover the same elements on the original and on
// the clone and diff their computed styles. Reports only real differences.
// Usage: node build/hover-sweep.mjs
import { chromium } from 'playwright';

const ORIGIN = 'https://ava-architects.vn';
const LOCAL = process.env.BASE || 'http://localhost:4173';

const PAGES = [
  ['home',           '/'],
  ['dịch vụ',        '/dich-vu/'],
  ['dự án',          '/du-an/'],
  ['tin tức',        '/tin-tuc/'],
  ['chi tiết dự án', '/chi-tiet-du-an/bellerive-resort/'],
  ['bài viết',       '/phong-cach-japandi/'],
];

// Element families worth hovering, with the properties that matter for each.
const TARGETS = [
  ['card',        '.box.has-hover',            ['boxShadow', 'transform', 'opacity']],
  ['card image',  '.box.has-hover .box-image img', ['transform', 'opacity', 'filter']],
  ['card overlay','.box.has-hover .overlay',   ['opacity', 'backgroundColor']],
  ['card text',   '.box.has-hover .box-text',  ['top', 'transform', 'opacity', 'backgroundColor']],
  ['portfolio',   '.portfolio-box',            ['transform', 'opacity']],
  ['portfolio img','.portfolio-box .box-image img', ['transform']],
  ['portfolio ov','.portfolio-box .overlay',   ['opacity']],
  ['outline btn', 'a.button.primary.is-outline', ['backgroundColor', 'color', 'borderColor']],
  ['post card',   '.col.post-item .col-inner', ['boxShadow', 'transform']],
  ['post title',  '.box-blog-post .post-title a', ['color']],
  ['nav item',    '#header .header-nav-main > li > a', ['color']],
  ['footer link', '.ux-menu-link__link',       ['color']],
  ['social',      '.social-icons a',           ['opacity', 'backgroundColor']],
];

const IGNORE_NEAR = 0.02; // tolerate sub-pixel / rounding noise on numbers

function nearlyEqual(a, b) {
  if (a === b) return true;
  const na = parseFloat(a), nb = parseFloat(b);
  if (Number.isFinite(na) && Number.isFinite(nb)) return Math.abs(na - nb) <= IGNORE_NEAR;
  return false;
}

async function sample(page, url) {
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(2200);
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 35)); }
    window.scrollTo(0, 0);
    document.querySelectorAll('.slider.flickity-enabled')
      .forEach(s => s.dispatchEvent(new MouseEvent('mouseenter')));
  });
  await page.waitForTimeout(2600);

  // Tag the first on-screen match of each selector so both runs compare the
  // same kind of element and never a carousel cell parked off to the side.
  await page.evaluate((targets) => {
    document.querySelectorAll('[data-sweep]').forEach(e => e.removeAttribute('data-sweep'));
    targets.forEach(([label, sel]) => {
      const hit = [...document.querySelectorAll(sel)].find(e => {
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.left >= -1 && r.right <= window.innerWidth + 1;
      });
      if (hit) hit.setAttribute('data-sweep', label);
    });
  }, TARGETS.map(([l, s]) => [l, s]));

  const out = {};
  for (const [label, selectorRaw, props] of TARGETS) {
    const selector = `[data-sweep="${label}"]`;
    const handle = await page.$(selector);
    if (!handle) { out[label] = null; continue; }
    const read = () => page.$eval(selector, (el, ps) => {
      const c = getComputedStyle(el);
      const o = {};
      ps.forEach(p => o[p] = c[p]);
      return o;
    }, props);

    let rest = null, hover = null;
    try {
      rest = await read();
      // Hover the element's hoverable ancestor when the target is a child.
      const rootSel = selectorRaw.split(' ')[0];
      const hoverTarget = (await handle.evaluateHandle((el, rs) => el.closest(rs) || el, rootSel)).asElement() || handle;
      // `force` because some targets sit under a full-bleed banner link.
      await hoverTarget.hover({ timeout: 3000, force: true });
      await page.waitForTimeout(900);
      hover = await read();
      await page.mouse.move(0, 0);
      // Long enough for the .6s image transition to fully unwind.
      await page.waitForTimeout(1100);
    } catch { /* element not hoverable here */ }
    out[label] = { rest, hover };
  }

  // Scroll behaviours
  out['__scroll'] = await page.evaluate(async () => {
    const W = document.querySelector('.header-wrapper');
    const step = async (from, to) => { const d = to > from ? 24 : -24;
      for (let y = from; d > 0 ? y <= to : y >= to; y += d) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 10)); }
      await new Promise(r => setTimeout(r, 500)); };
    window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 400));
    const atTop = getComputedStyle(W).position;
    await step(0, 900);
    const down = getComputedStyle(W).position;
    await step(900, 600);
    const up = { position: getComputedStyle(W).position, shadow: getComputedStyle(W).boxShadow.slice(0, 40) };
    const topLink = document.querySelector('#top-link');
    const topVisible = topLink ? getComputedStyle(topLink).opacity : null;
    await step(600, 0);
    const back = getComputedStyle(W).position;
    return { atTop, down, up, back, topVisible };
  });

  return out;
}

const browser = await chromium.launch();
const pOrig = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const pMine = await browser.newPage({ viewport: { width: 1440, height: 900 } });

let diffs = 0, checks = 0;
for (const [label, path] of PAGES) {
  const a = await sample(pOrig, ORIGIN + path);
  const b = await sample(pMine, LOCAL + path);
  const lines = [];

  for (const key of Object.keys(a)) {
    if (key === '__scroll') {
      for (const k of Object.keys(a[key])) {
        checks++;
        const x = JSON.stringify(a[key][k]), y = JSON.stringify(b[key][k]);
        if (x !== y) { diffs++; lines.push(`    scroll.${k}\n        orig ${x}\n        mine ${y}`); }
      }
      continue;
    }
    if (!a[key]) continue;
    if (!b[key]) { diffs++; lines.push(`    ${key}: present on original, missing in clone`); continue; }
    for (const state of ['rest', 'hover']) {
      if (!a[key][state]) continue;
      for (const prop of Object.keys(a[key][state])) {
        checks++;
        const x = a[key][state][prop], y = b[key][state]?.[prop];
        if (x !== y && !nearlyEqual(x, y)) {
          diffs++;
          lines.push(`    ${key}.${state}.${prop}\n        orig ${x}\n        mine ${y}`);
        }
      }
    }
  }
  console.log(`${lines.length ? 'DIFF' : 'ok  '}  ${label}`);
  lines.forEach(l => console.log(l));
}

console.log(`\n${checks - diffs}/${checks} properties match across ${PAGES.length} pages`);
await browser.close();
process.exit(diffs ? 1 : 0);
