# Slider specification

## Overview
- **Styles:** `src/css/05-slider.css`
- **Behaviour:** `src/js/main.js` → `class Slider`, `initSliders`
- **Interaction model:** time-driven (autoplay) + drag, arrows, dots

The original uses Flickity. This clone re-implements the subset the site relies
on and builds the same DOM, so the stylesheet applies unchanged:

```
.slider[data-flickity-options]        -> + .flickity-enabled .is-draggable
  .flickity-viewport
    .flickity-slider                  (flex row, translated on X)
      <cell> .is-selected
  button.flickity-prev-next-button.previous / .next
  ol.flickity-page-dots > li.dot.is-selected
```

**Difference from Flickity:** the track is a flex row in normal flow and cells
keep their natural or percentage widths, rather than each cell being absolutely
positioned. Cell offsets are read with `offsetLeft`, so variable-width cells
(the partner-logo carousel) work without extra bookkeeping.

## Options honoured

Read from `data-flickity-options`; three distinct configurations exist on the
site plus `asNavFor` pairs on project galleries.

| Option | Handling |
|---|---|
| `cellAlign` | `left` (default) or `center` — centre subtracts `(viewport − cell) / 2` |
| `contain` | clamps the offset to `[0, trackWidth − viewportWidth]` |
| `wrapAround` | index loops past either end |
| `groupCells: "100%"` | pages by the number of visible cells |
| `autoPlay` | `setInterval` at the given ms |
| `pauseAutoPlayOnHover` | pointer enter/leave |
| `prevNextButtons`, `pageDots` | build/skip the controls |
| `adaptiveHeight` | viewport height follows the selected cell |
| `draggable`, `dragThreshold` | pointer-events drag, axis-locked |
| `asNavFor` | clicking a thumbnail selects the matching main slide |

## Measured styles

### Arrows
`position: absolute; top/bottom: 40%; width: 36px; opacity: 0`, revealed to `.7`
on slider hover with `transform: translateX(±20%) → 0`.
`.slider-nav-light` paints them `#fff`. SVG has `padding: 20%`, `fill: currentColor`,
and turns `var(--ava-primary)` on hover.

### Dots
`position: absolute; left/right: 20%; bottom: 15px`.
`li.dot` — `12px`, `border: 3px solid`, `border-radius: 50%`, `opacity: .4`,
`transition: opacity .3s`; `.is-selected` fills and goes to `opacity: 1`.
Variants: `-dots-dashes` (40 × 4px, square), `-dots-square`, `nav-dots-small`.
`.slider-style-normal` moves them to `bottom: -15px` (the hero).

### `slider-style-focus` (testimonials)
`padding: 30px 0`; cells `max-width: 1050px; margin: 0 auto`;
non-selected cells `opacity: .5; transform: scale(.93)`; dots at `bottom: 6px`.

### Hero (home, section 0)
5 cells, 789px tall at 1440px. Options: `cellAlign: center`, `wrapAround: true`,
`autoPlay: 6000`, `contain`, `adaptiveHeight`, `dragThreshold: 10`.
Each cell is `.banner > .banner-inner.fill > .banner-bg.fill > img.bg` plus
`.banner-layers.container` holding absolutely positioned `.text-box` layers.

> `.banner-inner` must stay absolutely filled (`.fill`). `.banner` takes its
> height from `padding-top`, so a percentage height on a relative child
> collapses to zero — this was the cause of an early blank hero.

## Progressive enhancement
Before JS runs, `.slider:not(.flickity-enabled)` is a horizontal scroller with
inline-block children, so every slide is reachable without script.
Layers inside a track are revealed immediately by `initReveal` rather than left
at `opacity: 0`, because they sit outside the viewport and would never intersect.
