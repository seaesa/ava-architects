# AVA Architects — static clone

A hand-built HTML/CSS/JS reconstruction of [ava-architects.vn](https://ava-architects.vn)
(Vietnamese pages), running entirely offline.

**298 pages + a search page and a 404, 3,319 local assets, zero broken references.**

```bash
npm install          # cheerio, used only by the build scripts
npm run build        # regenerate the site from data/
npm run serve        # http://localhost:4173
```

## What is here

| Path | |
|---|---|
| `index.html`, `<slug>/index.html` | the generated site — open `index.html` directly or serve the folder |
| `assets/css/style.css` | one stylesheet, concatenated from `src/css/*.css` |
| `assets/js/main.js` | all behaviour, no dependencies |
| `assets/img`, `assets/fonts` | every image, video and font, local |
| `src/css`, `src/js` | **the sources you edit** |
| `build/` | the crawl → extract → generate pipeline |
| `data/` | scraped page content as JSON |
| `docs/research/` | measurements, behaviour notes, component specs |

## How it was built

The site is WordPress (Flatsome theme, UX Builder). Rather than downloading it,
the clone was reverse-engineered in four stages:

1. **`build/crawl.mjs`** — fetch every Vietnamese URL from the sitemaps into
   `.cache/` (312 documents).
2. **`build/extract.mjs`** — parse each one with cheerio: strip scripts,
   trackers and WordPress bookkeeping; keep the content root, the page-builder's
   per-element `<style>` rules, and the real text and asset URLs. Classify by
   template. Dead URLs that the live site redirects home are marked `redirect`
   and skipped.
3. **`build/download-assets.mjs`** — pull all 3,319 referenced uploads plus the
   self-hosted fonts into `assets/`.
4. **`build/generate.mjs`** — wrap each page in hand-written chrome
   (`build/layout.mjs`), rewrite every URL to a relative local path, and
   concatenate `src/css/*.css` into the stylesheet.

Three checks guard the result, all runnable any time:

```bash
npm run verify   # every href/src in all 300 pages resolves on disk
npm run audit    # markup invariants hold on every page; reports each fix's reach
npm run qa       # drives 12 pages in a real browser, desktop + mobile
```

`qa` asserts the rebuilt behaviours against measured values — reveal timing,
caret metrics, banner heading size, the arrow image on section links, slider
snapping, the search lightbox geometry, and the whole off-canvas menu sequence
(open → slide sub-level → back → close). It currently reports
**218 passed, 0 failed across 20 page runs**.

### The stylesheet

`src/css` is written from measurements taken in the browser — every value came
from `getComputedStyle` on the live site, recorded in `docs/research/`:

```
01-base         reset, self-hosted fonts, design tokens, typography
02-layout       container, 12-column flex grid, sections, stacks
02b-positions   generated banner-layer x/y utilities
03-header       header, nav, dropdowns, off-canvas menu
04-components   buttons, boxes, banners, section titles, icons
05-slider       the Flickity-compatible carousel
06-blog         post, cards, table of contents, author box, sidebar
07-portfolio    project grid and single-project layout
08-forms        field chrome and the two Contact Form 7 layouts
09-footer       footer
10-utilities    single-purpose helpers, reveal animations
11-site-custom  the site's own bespoke layer (generated — see below)
```

`11-site-custom.css` is produced by `build/gen-site-custom.mjs` from the
`/* Custom CSS */` block the site serves inline. That block is the client's own
hand-authored design layer — nav colouring, card treatments, filter bars,
mobile overrides — which cannot be derived from the theme. It is reformatted and
its asset URLs rewritten to local copies. Everything *before* that marker is
theme configuration, and is reproduced from measurements in the partials above.

### The JavaScript

`src/js/main.js` (~750 lines, no dependencies) implements:

- the scroll-direction sticky header
- the off-canvas menu with sliding sub-levels
- dropdowns with touch and keyboard support
- the search lightbox
- a Flickity-compatible slider (autoplay, drag, arrows, dots, `groupCells`,
  `adaptiveHeight`, `asNavFor`)
- scroll-triggered counters and reveal animations
- portfolio filtering, an image lightbox, back-to-top, the TOC toggle
- client-side site search (`/search/`)

## Fidelity

Measured against the live site at 1440px:

| | Original | Clone | Δ |
|---|---:|---:|---:|
| Home page height | 6,729px | 6,666px | −0.9% |
| Footer top | 6,328px | 6,326px | −2px |
| Header / logo / container | — | — | exact |
| Body and nav typography | — | — | exact |

Four of the nine home sections are pixel-exact; the total absolute height error
across the page is 148px (2.2%), concentrated in the testimonial and contact
sections where text reflows.

The header's sticky behaviour, the mobile tray's slide transforms and the
dropdown geometry were each verified step by step against the original and match
its classes, positions and dimensions. See `docs/research/BEHAVIORS.md`.

## Known limitations

- **Vietnamese only.** `/en/` was out of scope; the `EN` switch and English
  links still point at the live site.
- **No backend.** Contact and newsletter forms intercept submission and explain
  that nothing was sent. Search is reimplemented client-side at `/search/`: it
  filters a generated index of every published page, matching accent- and
  case-insensitively, rather than querying WordPress.
- **Tag and author archives are not generated.** Roughly 1,000 tag pages exist
  on the original; links to them are redirected to `/tin-tuc/`. Pagination links
  resolve to page 1.
- Two WordPress attachment pages, two oEmbed endpoints, one typo'd link in the
  source content and one page that returns 410 on the original remain absolute.
  All four are faithful to the original's own behaviour.
- The Google Maps embed on `/lien-he/` is a third-party iframe and still needs a
  network connection; everything else renders offline.
- `assets/` is 795 MB because the site serves full-resolution photography.

## Regenerating from scratch

```bash
node build/crawl.mjs            # refetch the source pages
node build/extract.mjs          # re-parse into data/
node build/download-assets.mjs  # refetch assets (skips what exists)
node build/gen-position-css.mjs # regenerate 02b
node build/gen-site-custom.mjs  # regenerate 11
node build/generate.mjs         # rebuild the site
node build/verify.mjs           # check every link
```
