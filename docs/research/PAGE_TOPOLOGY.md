# Page topology

Every Vietnamese URL on ava-architects.vn, grouped by the template that renders it.
Counts are from `data/index.json` (see `build/extract.mjs`).

| Template | Pages | Content root | Notes |
|---|---:|---|---|
| `home` | 1 | `#content.content-area` | Nine page-builder sections |
| `page` | 8 | `#content.content-area` | Bespoke builder layouts |
| `project` | 55 | `.portfolio-page-wrapper` | `chi-tiet-du-an/<slug>/` |
| `post` | 216 | `#content.blog-wrapper.blog-single` | Article + sidebar |
| `archive` | 10 | `#content` | `chuyen-muc/<slug>/`, `featured_item/` |
| `other` | 8 | `#content` | Builder blocks, oEmbed caches, `/blog/` |
| `redirect` | 14 | — | Dead URLs that the live site 302s to `/`; not generated |

**Published: 298 pages + `404.html`.**

## Home (`/`)

Rendered top to bottom; heights measured at a 1440px viewport.

| # | Section | Height | Interaction model |
|---|---|---:|---|
| 0 | Hero banner slider | 789px | time-driven (autoplay 6s) + drag/arrows/dots |
| 1 | Intro paragraph + stat counters | 512px | scroll-driven (counters animate in view) |
| 2 | Brand lock-up + `DỊCH VỤ` cards | 1329px | hover (caption + button reveal) |
| 3 | `DỰ ÁN TIÊU BIỂU` — 4 project cards | 1088px | hover (image zoom) |
| 4 | `CẢM NHẬN KHÁCH HÀNG` testimonial slider | 596px | time-driven (3s) + dots |
| 5 | `KHÁCH HÀNG & ĐỐI TÁC` logo carousel | 271px | time-driven (3s) + arrows |
| 6 | `TIN TỨC NỔI BẬT` — 1 large + 2 small cards | 782px | hover |
| 7 | `AVA BRANDED HOUSE` logo row | 226px | static |
| 8 | `ĐẶT LỊCH TƯ VẤN` contact form | 698px | form |

Fixed/overlay layers: the header (see below), a back-to-top button bottom-right,
and a floating social rail (`.social_fixed`).

## Page (`page`)

`/ve-ava-architects/`, `/con-nguoi-ava/`, `/dich-vu/`, `/dich-vu/dich-vu-chi-tiet/`,
`/du-an/`, `/tin-tuc/`, `/lien-he/`, `/author/`.

Shape: a full-bleed `.banner` hero carrying an `<h1>`, then page-builder sections.
`/du-an/` adds the filterable portfolio grid (`.portfolio-element-wrapper.has-filtering`,
51 `.portfolio-box` tiles in a 3-column `row-xsmall`).

## Project (`project`)

1. `#image_detail_pr` — full-bleed hero image (763px at 1440px wide)
2. `.page-title` — breadcrumbs, 60px tall
3. `.portfolio-top > .portfolio-inner` — category eyebrow, `<h3>` name,
   a two-column block of gallery image + 8 metadata rows (`icon-box-left`)
4. Alternating full-width image rows and galleries
5. `.related-projects` — a `DỰ ÁN LIÊN QUAN` slider

## Post (`post`)

`.row.row-large` (1200px) splits `large-8` article / `large-4` sidebar.

- Article: breadcrumbs → `h1.entry-title` → meta → featured image →
  `#ez-toc-container` (Phụ lục) → `.entry-content` → tags → `#padSection`
  author box → `.blog-share` → related posts
- Sidebar: search widget → `TIN TỨC MỚI` post cards

## Archive (`archive`)

Category header, then a `large-columns-3` grid of `.box-blog-post` cards
with `.nav-pagination` beneath.

## Shared chrome (every page)

- **Header** — `#header.has-sticky.sticky-fade.sticky-hide-on-scroll`;
  scroll-direction driven (see `BEHAVIORS.md`). Logo left, centred nav with two
  dropdowns, `VI | EN` plus a search lightbox on the right. Below 850px it
  collapses to a hamburger opening the off-canvas tray.
- **Off-canvas menu** — `#main-menu`, 300px from the right over a red overlay,
  with one level of sliding sub-menus.
- **Footer** — a four-column `stack`: logo, company details, `Khám phá` links,
  newsletter + socials + `Hồ sơ năng lực` button; then a centred copyright bar.
