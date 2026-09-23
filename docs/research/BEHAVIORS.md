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

## Other observed behaviours
- **Counters** (`17 / 350+ / 700+ / 60+`) animate up when scrolled into view.
- **Testimonial slider** and **partner-logo carousel**: Flickity, arrows + dots.
- `.box-text` / `.portfolio-box` hover: `transition: all .5s ease-out`; the `.hide` layer
  reveals on hover (child theme).
- `.section-title a:hover::after` — the same red wipe as the outline button.
- Back-to-top button, bottom-right.
- No smooth-scroll library (no Lenis / Locomotive) — native scrolling.
