// Download every referenced upload + the theme fonts into assets/.
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const ORIGIN = 'https://ava-architects.vn';
import { localPath } from './paths.mjs';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

async function grab(url) {
  const dest = join(ROOT, localPath(url));
  if (existsSync(dest) && statSync(dest).size > 0) return 'cached';
  const res = await fetch(url, { headers: { 'User-Agent': UA, Referer: ORIGIN + '/' } });
  if (!res.ok) throw new Error(res.status);
  const buf = Buffer.from(await res.arrayBuffer());
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, buf);
  return 'saved';
}

async function pool(items, size, worker) {
  const queue = [...items];
  let done = 0, failed = [];
  await Promise.all(Array.from({ length: size }, async () => {
    while (queue.length) {
      const item = queue.shift();
      try { await worker(item); } catch (e) { failed.push(`${item} :: ${e.message}`); }
      if (++done % 200 === 0) console.log(`  ${done}/${items.length}`);
    }
  }));
  return failed;
}

// Images used by the hand-written header/footer chrome, which live outside the
// page content we scrape and so are not discovered automatically.
const CHROME = [
  `${ORIGIN}/wp-content/uploads/2025/04/logo-ava-architects-6-copy@2x-1900x577.png`,
  `${ORIGIN}/wp-content/uploads/2025/04/logo-ava-architects-6-copy-2@2x-1900x577.png`,
  `${ORIGIN}/wp-content/uploads/2025/04/logo-ava-architects-icon-web-tagline-copy@2x-1207x1900.png`,
  // Placeholder used by the author-box plugin on posts with no thumbnail.
  `${ORIGIN}/wp-content/plugins/vk-post-author-display/assets/images/thumbnailDummy.jpg`,
  // Referenced only from the site's custom CSS (button arrows, list bullets,
  // tick marks), so page scraping never sees them.
  `${ORIGIN}/wp-content/uploads/2024/12/arrow-up.png`,
  `${ORIGIN}/wp-content/uploads/2024/12/arrow-up-light.png`,
  `${ORIGIN}/wp-content/uploads/2024/12/ic1.png`,
  `${ORIGIN}/wp-content/uploads/2024/12/ic2.png`,
  `${ORIGIN}/wp-content/uploads/2025/01/tick.png`,
  // Favicon set.
  `${ORIGIN}/wp-content/uploads/2025/04/cropped-logo-ava-architects-iconic-3-32x32.png`,
  `${ORIGIN}/wp-content/uploads/2025/04/cropped-logo-ava-architects-iconic-3-192x192.png`,
  `${ORIGIN}/wp-content/uploads/2025/04/cropped-logo-ava-architects-iconic-3-180x180.png`,
  `${ORIGIN}/wp-content/uploads/2025/04/cropped-logo-ava-architects-iconic-3-270x270.png`,
];

const FONTS = [
  ...['Regular', 'Bold'].flatMap((w) =>
    ['woff2', 'woff', 'ttf'].map((ext) =>
      `${ORIGIN}/wp-content/themes/lw_customize/fonts/SanFranciscoDisplay-${w}.${ext}`)),
  `${ORIGIN}/wp-content/themes/flatsome/assets/css/icons/fl-icons.woff2`,
  `${ORIGIN}/wp-content/themes/flatsome/assets/css/icons/fl-icons.woff`,
  `${ORIGIN}/wp-content/themes/flatsome/assets/css/icons/fl-icons.ttf`,
];

const uploads = JSON.parse(readFileSync(join(ROOT, 'data/assets.json'), 'utf8'));
console.log(`Downloading ${uploads.length} uploads + ${FONTS.length + CHROME.length} chrome/font files...`);
const f1 = await pool(uploads, 8, grab);
const f2 = await pool([...FONTS, ...CHROME], 4, grab);
const failed = [...f1, ...f2];
writeFileSync(join(ROOT, 'data/asset-failures.json'), JSON.stringify(failed, null, 1));
console.log(`Done. failures: ${failed.length}`);
if (failed.length) console.log(failed.slice(0, 20).join('\n'));
