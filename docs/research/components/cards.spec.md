# Card specifications

Three card types carry almost all of the site's listing content.

## Project tile — `.portfolio-box.box-shade.dark`

- **Styles:** `src/css/07-portfolio.css`
- Used on `/du-an/` (51 tiles, `large-columns-3` in a `row-xsmall`) and in
  `DỰ ÁN TIÊU BIỂU` on the home page.

```
.portfolio-box.box.has-hover.box-shade.dark
  a.plain > .box-image > .image-zoom.image-cover[style="padding-top:100%"]
              img + .overlay + .shade
  .box-text.text-left > .box-text-inner > a.plain
              p.portfolio-box-cat (eyebrow) + p.uppercase (name)
```

| Property | Value |
|---|---|
| Image box | square — `.image-cover { padding-top: 100% }`, `img` absolutely `object-fit: cover` |
| `.shade` | `linear-gradient(0deg, #323232 0, rgba(50,50,50,0) 33%)`, `opacity: .3 → .55` on hover, `transition: opacity .3s` |
| `.box-text` | `position: absolute; bottom: 0; padding: 10.08px 21.6px 20.16px`, `14.4px/1.6`, `color: #f1f1f1`, `text-shadow: 1px 1px 1px rgba(0,0,0,.5)` |
| Name | `16px/1.2`, `700`, `uppercase`, `letter-spacing: .05em`, `#fff`, `margin: .1em 0 15px` |
| Hover | image `transform: scale(1.06)`; `.hide` layers switch to `display: inherit` |

## Post card — `.box-blog-post`

- **Styles:** `src/css/06-blog.css`
- Used in the sidebar, archives, related rows and `TIN TỨC NỔI BẬT`.

| Property | Value |
|---|---|
| `.col-inner` | `background: #fff`, `transition: transform .3s, box-shadow .3s, …` |
| `.box-image img` | `object-fit: cover`, `transition: … transform .6s`; `scale(1.04)` on hover |
| `.box-text` | `padding: 10.08px 17.28px 20.16px`, `background: #f4f4f4`, `14.4px/1.6` |
| `.cat-label` | `9px/1.44`, `uppercase`, `letter-spacing: .048em`, `opacity: .7`, clamped to 1 line |
| `.post-title` | `16.56px/1.8em`, `700`, `#2c2c2c`, fixed `height: 3em`; the `<a>` clamps to 2 lines at `line-height: 1.3` |
| `.post-meta` | `11.52px/1.6`, `opacity: .8` |
| Hover | `.has-shadow .col-inner:hover … .post-title a { color: #d2242a }` |
| On `/` | `.home .col.post-item { padding: 0 8px }`, stacked cards get `margin-top: 16px` |

## Stat / icon box — `.icon-box.icon-box-center.is-large`

- **Styles:** `src/css/04-components.css`
- The `17 / 350+ / 700+ / 60+` strip in home section 1.

| Property | Value |
|---|---|
| `.icon-box` | `font-size: 1.15em` (`is-large`) → 18.4px |
| `.icon-box-img` | `width: 60px` (inline), `margin-bottom: 1em`; the SVG is capped at `height: 50px` by `.icon-group .icon-box-img svg` |
| Counter | animates 0 → value over 1.4s with a cubic ease-out when scrolled into view, preserving a trailing `+` |

## Metadata row — `.icon-box.icon-box-left`

Project pages use eight of these (Chủ đầu tư, Quy mô, Địa điểm, Thành tựu,
Thời gian hoàn thành, Tiến độ, Gói thầu, Nhiếp ảnh).

- `display: flex; align-items: center; margin-bottom: 8px`
- `.icon-box-img` `width: 20px; flex: 0 0 auto`
- `.icon-box-text` `flex: 1 1 0; padding-left: 8px`
