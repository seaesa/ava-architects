# Header specification

## Overview
- **Markup:** `build/layout.mjs` → `header()`
- **Styles:** `src/css/03-header.css`
- **Behaviour:** `src/js/main.js` → `initStickyHeader`, `initDropdowns`, `initSearchLightbox`
- **Screenshot:** `docs/design-references/clone-hero.jpeg`
- **Interaction model:** scroll-direction driven; hover for dropdowns

## DOM structure

```
header#header.has-sticky.sticky-fade.sticky-hide-on-scroll
  .header-wrapper
    #masthead.header-main
      .header-inner.flex-row.container.logo-left
        #logo.flex-col.logo            > a > img.header-logo
        .flex-col.show-for-medium      > ul.mobile-nav (empty, left)
        .flex-col.hide-for-medium      > ul.header-nav-main.nav-left   (6 items, 2 with dropdowns)
        .flex-col.hide-for-medium      > ul.header-nav-main.nav-right  (VI|EN, search)
        .flex-col.show-for-medium      > ul.mobile-nav (VI|EN, hamburger)
      .container > .top-divider.full-width
    .header-bg-container.fill > .header-bg-image.fill + .header-bg-color.fill
```

## Computed styles (measured with `getComputedStyle`)

### `.header-inner`
- `display: flex; align-items: center; justify-content: space-between`
- `height: 76px`, `max-width: 1170px`, `padding: 0 15px` → 1140px of content
- At ≤849px: `height: 70px`; at ≤549px the logo narrows to 112px

### `#logo img`
- `162 × 49.2px`, `transition: max-height .5s`
- A second `.header-logo-dark` exists in the source and is `display: none`

### `.header-bg-color`
- `position: absolute; inset: 0; background-color: #fff; transition: background .4s`

### `.top-divider`
- `height: 1px; margin-bottom: -1px; border-top: 1px solid #1a1a1a; opacity: .1`

### `.header-nav-main > li > a`
- `font: 700 17.6px/1.6 "San Francisco Display Bold"`
- `color: #2c2c2c`; current page `#000`
- `display: inline-flex; align-items: center; padding: 0 0 2px; transition: .2s`
- `li` spacing: `margin: 0 15px` (`nav-spacing-xlarge`)

### `.nav-dropdown` (`nav-dropdown-default`)
- `position: absolute; top: 100%; min-width: 180px; padding: 20px`
- `background: #fff; border: 2px solid #ddd; box-shadow: 1px 1px 15px rgba(0,0,0,.15)`
- `font-size: 100%`; links `16px/1.3`, `color: #000`, `padding: 10px 0`,
  `border-bottom: 1px solid #ececec` (last child none)
- Hidden with `left: -99999px; opacity: 0; visibility: hidden`

## States & behaviours

### Scroll-direction sticky
| | State A — at rest / scrolling down | State B — scrolling up |
|---|---|---|
| Trigger | default, or `scrollY` increasing past the bar height | `scrollY` decreasing by > 4px |
| Classes | `#header.sticky-hide-on-scroll--active` | `.header-wrapper.stuck` |
| Position | `relative` — scrolls away with the page | `fixed; top: 0; z-index: 1001` |
| Height | 76px | 80px |
| Shadow | none | `1px 1px 10px rgba(0,0,0,.15)` |
| Entry | — | `ava-header-fade-in .3s` (opacity + translateY) |

Returning to `scrollY <= 76` drops back to State A. A `.header-height-guard`
spacer is inserted while pinned so the page does not jump.

**Verified against the original:** identical class, position, height and shadow at
every step of a scroll down → up → down → top sequence.

### Nav underline (`nav-line-bottom`)
`li > a::before` — `3px` bar, `background: var(--ava-primary)`, `width: 100%`,
`opacity: 0 → 1` on `:hover` / `.active`, `transition: .3s`.

### Dropdown caret (`nav-dropdown-has-arrow`)
Two stacked triangles on `li.has-dropdown::before/::after` (11px `#ddd`, 8px `#fff`),
`opacity: 0 → 1` with `transition: opacity .25s`.

### Caret glyph on a parent item
`.nav > li > a > i` — `display: block; font-size: 16px; margin-left: .2em;
opacity: .6`. The link is `inline-flex` with `align-items: center`, so the caret
centres itself against the label; the margin is what separates the two.

### Search lightbox
`a[data-open="#search-lightbox"]` moves `#search-lightbox` into a full-screen
`.search-lightbox-overlay`, focuses the field, and closes on backdrop click,
the × or <kbd>Esc</kbd>. Backdrop `#0b0b0b` at `opacity: .6`; the content column
drops in from `-30px`. Full measurements in `BEHAVIORS.md`.

## Responsive
- **≥850px:** full nav, `.show-for-medium` hidden
- **550–849px:** nav replaced by the hamburger; header 70px
- **≤549px:** logo 112px; `VI | EN` restyled by the site layer (`15px`, red pipe)

> `.logo-left .flex-right` carries a `min-width: 200px`, so the mobile nav list
> must be given `width: 100%` — otherwise it shrink-wraps and the hamburger
> floats 119px short of the container's right edge.
