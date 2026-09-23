# Off-canvas mobile menu specification

## Overview
- **Markup:** `build/layout.mjs` → `offCanvas()`
- **Styles:** `src/css/03-header.css`, “Off-canvas mobile menu” section
- **Behaviour:** `src/js/main.js` → `initOffCanvas`
- **Screenshot:** `docs/design-references/clone-mobile-menu.jpeg`
- **Interaction model:** click to open; click to slide one sub-level

## DOM structure

```
#main-menu.mobile-sidebar.mobile-sidebar-slide.mobile-sidebar-levels-1[data-levels="1"]
  .sidebar-menu.no-scrollbar
    ul.nav.nav-sidebar.nav-vertical.nav-uppercase.nav-slide
      li.header-search-form           > .header-search-form-wrapper > form.searchform
      li.menu-item                    > a
      li.menu-item.has-child          > a + button.toggle + ul.sub-menu
                                          └ li.nav-slide-header > button.toggle (back row)
  button.off-canvas-close             (added by JS)
div.off-canvas-overlay                (added by JS, appended to <body>)
```

Opened by `a[data-open="#main-menu"][data-pos="right"]`, which also sets
`has-off-canvas has-off-canvas-right off-canvas-open` on `<html>` and locks
page scrolling.

## Computed styles (measured)

| Element | Value |
|---|---|
| `.off-canvas-overlay` | `position: fixed; inset: 0; background: #d3242b; opacity: .6; transition: opacity .25s; z-index: 1042` |
| `.mobile-sidebar` | `position: fixed; top/bottom: 0; right: 0; width: 300px; max-width: 100%; background: rgba(26,26,26,.95); box-shadow: 0 0 10px rgba(0,0,0,.5); z-index: 1045` |
| entry | `transform: translateX(100%) → translateX(0)`, `transition: transform .2s` |
| `.sidebar-menu` | `height: 100%; transition: transform .3s` |
| `.nav-slide` | `padding-top: 20px; overflow: hidden auto` |
| `.nav-sidebar > li` | `display: flex; border-top: 1px solid rgba(255,255,255,.2); transition: background-color .3s`; measured height **51.47px** (original 51) |
| `.nav-sidebar > li > a` | `12.8px/1.6 "San Francisco Display Bold" 700`, `rgba(255,255,255,.8)`, `uppercase`, `letter-spacing: .02em`, `padding: 15px 0 15px 20px` |
| `button.toggle` | `width: 45px; opacity: .6`, icon `icon-angle-right` |
| `.off-canvas-close` | `40 × 40px`, top-right, `font-size: 28px`, `opacity: .6` |
| `li.header-search-form` | `display: block; padding: 20px; border-top: 0` → 73px tall |
| search field | context `font-size: .85rem` → `13.192px`; `height: 2.507em` = **33.07px**; `border-radius: 99px`; `background: rgba(255,255,255,.2)`; `border: 1px solid rgba(255,255,255,.09)` |
| submit | `2.5em` square pill, transparent, `rgba(255,255,255,.8)` |

> The link padding is scoped as `.mobile-sidebar .nav-sidebar > li > a` so it
> outranks the site layer's blanket `.nav > li > a { padding: 0 }` — the original
> achieves the same by scoping under `.off-canvas`.

## Sub-level slide (`mobile-sidebar-levels-1`)

- `.sub-menu` rests at `position: fixed; top: 0; bottom: 0; left: 100%; width: 100%`
  of the tray, `display: none`.
- Opening a level:
  - parent `li` gets `aria-expanded="true"`
  - the sub-menu gets `.is-current-slide` → `display: block`
  - `ul.nav-sidebar` gets `.is-current-parent`
  - `.sidebar-menu` gets `.is-slid` → `transform: translateX(-300px)` with
    `transition: transform .3s`. The distance comes from
    `--ava-tray-shift`, set by JS from the panel's measured width, so it is
    still correct on viewports narrower than 300px.
- The sub-menu is headed by `li.nav-slide-header > button.toggle` — `‹ LABEL`,
  `.97em`, uppercase, bold, `opacity: .6` — which reverses the transform.

## Closing
Close button, overlay click, or <kbd>Esc</kbd>. <kbd>Esc</kbd> first backs out of an
open sub-level, then closes the tray. Focus returns to the hamburger. Resizing
past 849px with the tray open closes it so the page cannot stay scroll-locked.

## Verified
A scripted open → open “Giới thiệu” → back → close cycle reproduces the original's
transforms (`translateX(0)` → `translateX(-300px)` → `translateX(0)`),
`aria-expanded` values and `display` states exactly.
