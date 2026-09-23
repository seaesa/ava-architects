# Footer and form specifications

## Footer

- **Markup:** `build/layout.mjs` → `footer()`
- **Styles:** `src/css/09-footer.css`
- **Interaction model:** static, plus link and social hovers

```
footer#footer.footer-wrapper
  section.section.footer-customize
    .row > .col > .col-inner > .stack.gapx-36.stack-row.sm:stack-col
      ├ stack (logo 160px + company details, flex-grow)
      ├ stack w-160  — "Khám phá" + .ux-menu
      └ stack w-276  — newsletter form + socials + "Hồ sơ năng lực"
  .absolute-footer — copyright
```

| Element | Value |
|---|---|
| `.footer-customize` | `border-top: 1px solid #c3c3c3; padding: 30px 0` |
| Column heading | `<strong>` at `font-size: 120%` in the bold face |
| Body copy | `16px`, `line-height: 2`, paragraphs `margin-bottom: 20.8px` |
| `.ux-menu-link__link` | `display: flex; min-height: 40px; padding: 4.8px 0`; hover `var(--ava-primary)` |
| Social button | `33px` circle, `background: var(--ava-primary)`, white glyph, `margin-right: 20px` |
| Newsletter submit | `position: absolute; top: 0; right: -15px` over the field |
| `.absolute-footer` | `padding: 10px 0 15px; background: #fff; color: rgba(0,0,0,.5); font-size: .9em; text-align: center` |

Below 850px the stacks wrap and the fixed-width columns go full width;
below 550px the socials left-align with an 8px gap.

## Forms

- **Styles:** `src/css/08-forms.css`
- **Behaviour:** `src/js/main.js` → `initForms`

### Field chrome
```
height: 2.507em;  margin: 0 0 15.52px;  padding: 0 11.64px;
border: 1px solid #ddd;  border-radius: 0;  background: #fff;
box-shadow: inset 0 1px 2px rgba(0,0,0,.1);  color: #333;  font-size: .97em;
```
`textarea` inherits that `height` and adds `min-height: 100px; padding-top: .7em`.

> The shared `height` is what stops a `rows` attribute stretching the box —
> the source textarea carries `rows="10"` yet renders 100px tall. Leaving
> `height: auto` made the contact section 122px too tall.

`.form-flat` rounds fields to `99px`; inside `.dark` they become
`rgba(255,255,255,.2)` with a `rgba(255,255,255,.09)` hairline.

### “ĐẶT LỊCH TƯ VẤN” (`.sec-contact`)
Fields lose their box entirely: no border or shadow, `padding-left: 0`, and a
single `1px solid #b1b1b1` underline that turns red on focus.

### Submit
`background: var(--ava-primary); color: #fff; text-transform: uppercase;
min-height: 38.8px; padding: 0 18.624px; letter-spacing: .4656px`.

### Validation and submission
The clone is static, so `initForms` intercepts every `wpcf7` submit, marks the
form `.sent` and writes a Vietnamese notice into `.wpcf7-response-output`
explaining that nothing was sent. Search forms are left alone so they still
navigate.
