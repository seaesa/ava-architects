# AVA Architects — Behaviour Bible

Extracted live from https://ava-architects.vn via CDP `getComputedStyle` + scripted
interaction. Every value below is measured, not estimated.

## Global

| Token | Value |
|---|---|
| Body font | `"San Francisco Display"` (self-hosted, Regular) |
| Bold font | `"San Francisco Display Bold"` (separate family, used as `font-family` swap not `font-weight`) |
| Body | `16px / 25.6px`, colour `#1a1a1a` (forced `!important` by child theme) |
| Brand red | `#d3242b` (buttons, overlay) / `#d2242a` (section-title bar) |
| Container | `max-width: 1170px; padding: 0 15px` → content width **1140px** |
| Row | negative gutter, `.col` padding `0 9.8px 19.6px` |
| html bg | `#fff` |

Breakpoints (Flatsome): `medium ≤ 849px` (`.show-for-medium` / `.hide-for-medium`),
`small ≤ 549px`.

## Header — `#header.has-sticky.sticky-fade.sticky-hide-on-scroll`

**INTERACTION MODEL: scroll-direction driven.**

| State | Trigger | Styles |
|---|---|---|
| **A — at rest / scrolling down** | default, or scrolling *down* (adds `sticky-hide-on-scroll--active` on `#header`) | `.header-wrapper { position: relative }` → header scrolls away with the page. Height **76px**. |
| **B — stuck** | scrolling *up* (removes `--active`, adds `.stuck` on `.header-wrapper`) | `position: fixed; top: 0; z-index: 1001; height: 80px; box-shadow: 1px 1px 10px rgba(0,0,0,.15); opacity → 1` |

- Transition: `background-color .3s, opacity .3s` (the fade in `sticky-fade`).
- Background is a separate fill layer `.header-bg-color` = `#fff`, `transition: background .4s`.
- Bottom hairline `.top-divider`: `border-top: 1px solid #1a1a1a; opacity: .1; width: 1140px; margin-bottom: -1px`.
- Logo: 162 × 49.2px. A second `.header-logo-dark` exists in DOM but is `display: none` on this site.
- **Note the height change 76 → 80px between states** — it is the `.stuck` padding, not a shrink.

### Desktop nav
- `.nav-size-xlarge`: link `font-size: 17.6px`, `font-family: "San Francisco Display Bold"`, `font-weight: 700`, `line-height: 28.16px`.
- Colour `#2c2c2c`; current item `#000`.
- `display: inline-flex; align-items: center; padding-bottom: 2px; transition: .2s`.
- `.nav-line-bottom`: underline bar grows from the bottom on hover / current.
- Dropdown `.nav-dropdown-default`: `position: absolute; top: 30.16px; width: 183px; padding: 20px; background: #fff; box-shadow: 1px 1px 15px rgba(0,0,0,.15)`. Hidden with `left: -99999px`, shown on `li:hover`.
- Right cluster: `VI | EN` (the `|` is `#f00`, bold) then a search icon (16px) opening a lightbox.

## Mobile menu — off-canvas `#main-menu`

**INTERACTION MODEL: click to open, click-to-slide sub-levels.**

Opened by `a[data-open="#main-menu"][data-pos="right"]`. Adds `has-off-canvas has-off-canvas-right` to `<html>`.

| Part | Styles |
|---|---|
| Overlay `.mfp-bg` | `position: fixed; inset: 0; background: #d3242b; opacity: .6; transition: opacity .25s; z-index: 1042` |
| Panel `.mfp-content` | `position: fixed; right: 0; top: 0; bottom: 0; width: 300px; max-width: 100%; background: rgba(26,26,26,.95); box-shadow: 0 0 10px rgba(0,0,0,.5); transition: transform .2s; z-index: 1045` |
| Enter | `translateX(100%)` → `translateX(0)` |
| Nav list | `padding-top: 20px` |
| Item `<a>` | `12.8px` SF Display Bold 700, `rgba(255,255,255,.8)`, `uppercase`, `letter-spacing: .256px`, `padding: 15px 0 15px 20px`, `line-height: 20.48px` |
| Item `<li>` | `display: flex; border-top: 1px solid rgba(255,255,255,.2); transition: background-color .3s` |
| Toggle `button.toggle` | width `45px`, `opacity: .6`, icon `angle-right` |
| Close `.mfp-close` | `40 × 40px`, top-right, `opacity: .6` |

### Sub-level slide (`mobile-sidebar-slide`, `data-levels="1"`)
- `.sub-menu` sits at `position: fixed; top: 0; left: 100%; width: 100%` of the panel, `display: none`.
- On toggle click: parent `li` gets `aria-expanded="true"`, `ul.nav-sidebar` gets `is-current-parent`,
  sub-menu becomes `display: block`, and **`.sidebar-menu` gets `transform: translateX(-300px)`**
  with `transition: transform .3s`.
- Each sub-menu is headed by a back row `li.nav-slide-header > button.toggle` —
  `15.52px`, uppercase, bold, `opacity: .6`, `‹` icon — which reverses the transform.

### Mobile search box (top of panel)
`input.search-field`: `height: 40px; border-radius: 99px; background: rgba(255,255,255,.2);
border: 1px solid rgba(255,255,255,.09); color: rgba(255,255,255,.8); padding: 0 12px`;
wrapper width `260px`. Submit button is a transparent 40px pill with the search glyph.

## Hero slider (home) — Flickity

`data-flickity-options`:
```json
{"cellAlign":"center","imagesLoaded":true,"lazyLoad":1,"freeScroll":false,"wrapAround":true,
 "autoPlay":6000,"pauseAutoPlayOnHover":true,"prevNextButtons":true,"contain":true,
 "adaptiveHeight":true,"dragThreshold":10,"percentPosition":true}
```
- 5 slides, section height **789px** at 1440px wide (aspect-driven).
- Slide = `.banner > .banner-inner.fill > .banner-bg.fill > img.bg` (cover) + `.banner-layers.container` with absolutely positioned `.text-box` layers using `x{n}` / `y{n}` percentage classes.
- Arrows `.flickity-prev-next-button`: 36px circles, white, `left: 28.8px` / `right: 28.8px`, vertically centred.
- Dots `.flickity-page-dots`: bottom `-15px`, centred; `li.dot` `12px`, `border: 3px solid #fff`, `border-radius: 50%`, `opacity: .4`, `transition: opacity .3s`; `.is-selected` → `background: #fff; opacity: 1`.
- Slide 0 carries the “since 2009” SVG + `Hồ sơ năng lực` button, animated `fadeInLeft`.

## Buttons

`.button.primary.is-outline`
- `background: rgba(255,255,255,.8); color: #d3242b; border: 2px solid #d3242b; border-radius: 0`
- `min-height: 38.8px; padding: 0 18.624px; font: 700 15.52px/33.99px "San Francisco Display"; letter-spacing: .4656px`
- `transition: transform .3s, border .3s, background .3s, box-shadow .3s, opacity .3s, color .3s`
- **Hover:** child theme adds `::after { background:#d3242b; height:100%; left:0; top:0; width:0 → 100%; transition: width .35s ease-in-out; z-index:0 }` — a red wipe from the left; the label sits at `z-index: 2` and turns white.

`input[type=submit]` / `.button.primary`
- `background: #d3242b; color: #fff; text-transform: uppercase; border-radius: 0; min-height: 38.8px`.

## Section title (`.section-title.section-title-normal`)
- `display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px`
- Markup `<b></b><span class="section-title-main">…</span><b></b>`
- `.section-title-main`: `30px/24px "San Francisco Display Bold" 700`, `uppercase`,
  `letter-spacing: .3px`, `border-left: 10px solid #d2242a; padding-left: 10px; margin: 0 15px -2px 0`.

## Reveal on scroll

**INTERACTION MODEL: scroll position, transition-based (not keyframes).**

Every `[data-animate]` element starts hidden. The theme reveals it by adding
**three attributes in sequence**, and the order is the whole trick — the
element must first jump to its start offset *without* a transition, or it would
slide in from wherever it happened to be.

| Step | Attribute added | When | Effect |
|---|---|---|---|
| 1 | `data-animate-transform="true"` | element's top enters the viewport | the start offset applies instantly (`transition` is still `none`) |
| 2 | `data-animate-transition="true"` | **+17 ms** (next frame) | the transition is armed |
| 3 | `data-animated="true"` | **+300 ms** | it eases to rest |

Measured gaps across many elements: step 1→2 is 16–24 ms, step 2→3 is 300–307 ms.
There is no per-sibling stagger — items in the same row reveal together.

**Trigger:** the element's top crossing `window.innerHeight` (measured tops at
fire: 814–874 against a 877px viewport).

```css
[data-animate] {
  opacity: 0 !important;
  transition: filter 1.3s, transform 1.6s, opacity .7s ease-in;
  animation-fill-mode: forwards;
  backface-visibility: hidden;
  will-change: filter, transform, opacity;
}
[data-animate]:not([data-animate-transform])  { transform: none !important; }
[data-animate]:not([data-animate-transition]) { transition: none !important; }

[data-animate="fadeInLeft"]  { transform: translate3d(-70px, 0, 0); }
[data-animate="fadeInRight"] { transform: translate3d(70px, 0, 0); }
[data-animate="fadeInUp"]    { transform: translate3d(0, 70px, 0); }
[data-animate="fadeInDown"]  { transform: translate3d(0, -70px, 0); }
[data-animate="bounceInLeft"] / [bounceInRight] { ±300px }
[data-animate="bounceIn"]    { transform: scale(1.3); }
[data-animate="blurIn"]      { filter: blur(15px); }

[data-animated="true"],
.slider .is-selected [data-animated="true"] { opacity: 1 !important; transform: translateZ(0) scale(1); }
.flickity-slider > :not(.is-selected) [data-animated="true"] { transition: transform .7s, opacity .3s !important; }
```

The reveal is deliberately slow and pronounced: opacity takes **0.7s ease-in**
and the 70px slide takes **1.6s**, so an element is still visibly drifting into
place more than a second after it appears.

Sampled curve for a `fadeInLeft` column (original vs. clone):

| t | Original `opacity` / `x` | Clone `opacity` / `x` |
|---|---|---|
| before | 0 / none | 0 / none |
| +60 ms | 0 / −70 | 0 / −70 |
| +360 ms | 0 / −70 | 0.001 / −69.7 |
| +610 ms | 0.176 / −56.1 | 0.197 / −54.6 |
| +1210 ms | 1 / −11.15 | 1 / −11.15 |
| +2610 ms | 1 / 0 | 1 / 0 |

Carousel layers use the same mechanism, but only those on the selected slide are
visible: `.slider [data-animate]` (0,0,2,0) outranks `[data-animated="true"]`
(0,0,1,0), while `.slider .is-selected [data-animated="true"]` (0,0,3,0)
outranks both.

Only 5 of the 298 pages use `data-animate` at all: the home page (19 elements),
`con-nguoi-ava` (44), `dich-vu` (9), `lien-he` (1) and one post.

## Search lightbox (desktop)

Opened from the magnifier in the header.

| Part | Value |
|---|---|
| Backdrop | `position: fixed; inset: 0; background: #0b0b0b; opacity: .6; z-index: 1042; transition: opacity .25s` |
| Content column | `width: container − 60px` (1380px at 1440), `max-width: 100%`, `z-index: 1045` |
| Enter | `translateY(-30px)` + `opacity: 0` → `translateY(0)` + `opacity: 1`, `transition: transform .5s, opacity .3s` |
| Panel | `#search-lightbox.dark.text-center` — `width: 600px`, centred, `font-size: 1.5em`, `color: #f1f1f1` |
| Field | `height: 2.507em` = **67.12px**, `font-size: 26.772px`, `padding: 0 .75em`, `border-radius: 99px`, `background: rgba(255,255,255,.2)`, `border: 1px solid rgba(255,255,255,.09)` |
| Submit | `2.5em` square pill, transparent, `#f1f1f1` |
| Close | `40 × 40px` at the content column's top right, `font-size: 40px`, `opacity: .6` |

The submit is pulled back over the field so the pair reads as one pill:

```css
.flex-row.form-flat .flex-col { padding-right: 4px; }
.searchform-wrapper.form-flat .flex-col:last-of-type { margin-left: -2.9em; }
```

That same rule governs the search box in the mobile tray.

## Other observed behaviours
- **Counters** (`17 / 350+ / 700+ / 60+`) animate up when scrolled into view.
- **Testimonial slider** and **partner-logo carousel**: Flickity, arrows + dots.
- `.box-text` / `.portfolio-box` hover: `transition: all .5s ease-out`; the `.hide` layer
  reveals on hover (child theme).
- `.section-title a:hover::after` — the same red wipe as the outline button.
- Back-to-top button, bottom-right.
- No smooth-scroll library (no Lenis / Locomotive) — native scrolling.
