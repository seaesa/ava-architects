// The shared page chrome: <head>, header, off-canvas menu, footer.
// Markup is written by hand to match the structure the original renders, so
// the hand-written stylesheet in src/css applies to both.

/** Nav model, transcribed from the live menu. */
export const MENU = [
  { label: 'Trang chủ', href: '/' },
  {
    label: 'Giới thiệu', href: '/ve-ava-architects/',
    children: [
      { label: 'Về AVA Architects', href: '/ve-ava-architects/' },
      { label: 'Con người AVA', href: '/con-nguoi-ava/' },
    ],
  },
  { label: 'Dịch vụ', href: '/dich-vu/' },
  { label: 'Dự án', href: '/du-an/' },
  {
    label: 'Tin tức', href: '/tin-tuc/',
    children: [
      { label: 'Blog thiết kế AVA', href: '/chuyen-muc/blog-thiet-ke-ava/' },
      { label: 'Blog thi công AVA', href: '/chuyen-muc/blog-thi-cong-ava/' },
      { label: 'Tin tức về AVA', href: '/chuyen-muc/tin-tuc-ve-ava/' },
      { label: 'Pháp lý', href: '/chuyen-muc/phap-ly/' },
      { label: 'Phong thủy', href: '/chuyen-muc/phong-thuy/' },
      { label: 'Đầu Tư – Quy Hoạch', href: '/chuyen-muc/dau-tu-quy-hoach/' },
      { label: 'Tuyển Dụng', href: '/chuyen-muc/tuyen-dung-ava-architects/' },
    ],
  },
  { label: 'Liên hệ', href: '/lien-he/' },
];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Is `href` the page currently being rendered? */
const isCurrent = (href, slug) => {
  const target = href === '/' ? 'index' : href.replace(/^\/|\/$/g, '');
  return target === slug;
};

function searchForm(rel, extraClass = '') {
  return `<div class="searchform-wrapper ux-search-box relative ${extraClass}">
  <form method="get" class="searchform" action="${rel}search/" role="search">
    <div class="flex-row relative">
      <div class="flex-col flex-grow">
        <input type="search" class="search-field mb-0" name="s" value="" placeholder="Tìm kiếm…" aria-label="Tìm kiếm">
      </div>
      <div class="flex-col">
        <button type="submit" class="ux-search-submit submit-button secondary button icon mb-0" aria-label="Tìm">
          <i class="icon-search"></i>
        </button>
      </div>
    </div>
    <div class="live-search-results text-left z-top"></div>
  </form>
</div>`;
}

function desktopNav(rel, slug) {
  return MENU.map((item) => {
    const current = isCurrent(item.href, slug);
    const cls = [
      'menu-item',
      item.children ? 'menu-item-has-children has-dropdown' : '',
      current ? 'active current-menu-item' : '',
      'menu-item-design-default',
    ].filter(Boolean).join(' ');

    const caret = item.children ? '<i class="icon-angle-down"></i>' : '';
    const aria = item.children ? ' aria-expanded="false" aria-haspopup="menu"' : '';
    const sub = item.children
      ? `\n        <ul class="sub-menu nav-dropdown nav-dropdown-default">${item.children
          .map((c) => `\n          <li class="menu-item${isCurrent(c.href, slug) ? ' active' : ''}"><a href="${rel}${c.href.replace(/^\//, '')}">${esc(c.label)}</a></li>`)
          .join('')}\n        </ul>`
      : '';

    return `        <li class="${cls}"><a href="${rel}${item.href.replace(/^\//, '')}" class="nav-top-link"${aria}>${esc(item.label)}${caret}</a>${sub}</li>`;
  }).join('\n');
}

function mobileNav(rel, slug) {
  return MENU.map((item) => {
    const current = isCurrent(item.href, slug);
    const cls = ['menu-item', item.children ? 'menu-item-has-children has-child' : '', current ? 'active' : ''].filter(Boolean).join(' ');
    const expanded = item.children ? ' aria-expanded="false"' : '';
    const toggle = item.children
      ? `<button class="toggle" aria-label="Mở ${esc(item.label)}"><i class="icon-angle-right"></i></button>`
      : '';
    const sub = item.children
      ? `<ul class="sub-menu nav-sidebar-ul children" aria-hidden="true">
          <li class="nav-slide-header pt-half pb-half">
            <button class="toggle" tabindex="-1"><i class="icon-angle-left"></i> ${esc(item.label)}</button>
          </li>${item.children
            .map((c) => `\n          <li class="menu-item"><a href="${rel}${c.href.replace(/^\//, '')}" tabindex="-1">${esc(c.label)}</a></li>`)
            .join('')}
        </ul>`
      : '';

    return `      <li class="${cls}"${expanded}><a href="${rel}${item.href.replace(/^\//, '')}">${esc(item.label)}</a>${toggle}${sub}</li>`;
  }).join('\n');
}

export function header(rel, slug) {
  return `<header id="header" class="header has-sticky sticky-fade sticky-hide-on-scroll">
  <div class="header-wrapper">
    <div id="masthead" class="header-main">
      <div class="header-inner flex-row container logo-left medium-logo-left" role="navigation">

        <div id="logo" class="flex-col logo">
          <a href="${rel}index.html" title="AVA - Architects." rel="home">
            <img width="1020" height="310" src="${rel}assets/img/2025/04/logo-ava-architects-6-copy@2x-1900x577.png" class="header_logo header-logo" alt="AVA Architects">
          </a>
        </div>

        <div class="flex-col show-for-medium flex-left">
          <ul class="mobile-nav nav nav-left"></ul>
        </div>

        <div class="flex-col hide-for-medium flex-left flex-grow">
          <ul class="header-nav header-nav-main nav nav-left nav-line-bottom nav-size-xlarge nav-spacing-xlarge">
${desktopNav(rel, slug)}
          </ul>
        </div>

        <div class="flex-col hide-for-medium flex-right">
          <ul class="header-nav header-nav-main nav nav-right nav-size-xlarge nav-spacing-xlarge">
            <li class="html custom html_topbar_left">
              <a href="${rel}index.html" class="active">VI</a>
              <span style="color:#f00;font-weight:bold;">|</span>
              <a href="#" class="lang-en" aria-disabled="true" title="Bản tiếng Anh chưa có trong bản clone này">EN</a>
            </li>
            <li class="header-search header-search-lightbox has-icon">
              <a href="#search-lightbox" aria-label="Tìm kiếm" data-open="#search-lightbox" class="is-small">
                <i class="icon-search" style="font-size:16px;"></i>
              </a>
              <div id="search-lightbox" class="mfp-hide dark text-center">
                ${searchForm(rel, 'form-flat is-large')}
              </div>
            </li>
          </ul>
        </div>

        <div class="flex-col show-for-medium flex-right">
          <ul class="mobile-nav nav nav-right">
            <li class="html custom html_topbar_left">
              <a href="${rel}index.html" class="active">VI</a>
              <span style="color:#f00;font-weight:bold;">|</span>
              <a href="#" class="lang-en" aria-disabled="true" title="Bản tiếng Anh chưa có trong bản clone này">EN</a>
            </li>
            <li class="nav-icon has-icon">
              <div class="header-button">
                <a href="#main-menu" data-open="#main-menu" data-pos="right" class="icon primary button round is-small"
                   aria-label="Menu" aria-controls="main-menu" aria-expanded="false">
                  <i class="icon-menu"></i>
                </a>
              </div>
            </li>
          </ul>
        </div>

      </div>
      <div class="container"><div class="top-divider full-width"></div></div>
    </div>
    <div class="header-bg-container fill">
      <div class="header-bg-image fill"></div>
      <div class="header-bg-color fill"></div>
    </div>
  </div>
</header>`;
}

export function offCanvas(rel, slug) {
  return `<div id="main-menu" class="mobile-sidebar no-scrollbar mfp-hide mobile-sidebar-slide mobile-sidebar-levels-1" data-levels="1">
  <div class="sidebar-menu no-scrollbar">
    <ul class="nav nav-sidebar nav-vertical nav-uppercase nav-slide" data-tab="1">
      <li class="header-search-form search-form html relative has-icon">
        <div class="header-search-form-wrapper">
          ${searchForm(rel, 'form-flat is-normal')}
        </div>
      </li>
${mobileNav(rel, slug)}
    </ul>
  </div>
</div>`;
}

export function footer(rel) {
  const link = (label, href) =>
    `        <div class="ux-menu-link flex menu-item">
          <a class="ux-menu-link__link flex" href="${rel}${href.replace(/^\//, '')}"><span class="ux-menu-link__text">${esc(label)}</span></a>
        </div>`;

  const social = (name, icon, href) =>
    `        <a href="${href}" target="_blank" rel="noopener noreferrer" class="icon button circle ${name}" aria-label="${esc(name)}"><i class="icon-${icon}"></i></a>`;

  return `<footer id="footer" class="footer-wrapper">
  <section class="section footer-customize">
    <div class="section-content relative">
      <div class="row">
        <div class="col small-12 large-12">
          <div class="col-inner">
            <div class="stack gapx-36 stack-row justify-start items-stretch sm:stack-col">

              <div class="stack full-mobile flex-grow gapx-16 stack-row justify-start items-stretch sm:stack-col">
                <div class="stack full-mobile w-160 flex-shrink gapy-16 stack-row justify-start items-stretch">
                  <div class="img has-hover hide-for-small" style="width:87%">
                    <div class="img-inner dark">
                      <img src="${rel}assets/img/2025/04/logo-ava-architects-icon-web-tagline-copy@2x-1207x1900.png" alt="AVA Architects" width="1020" height="1606">
                    </div>
                  </div>
                </div>

                <div class="stack flex-grow gap-16 stack-col justify-start items-stretch">
                  <div class="text"><span style="font-size:120%"><strong>Công ty CP Kiến trúc sư Huy Vũ &amp; Cộng sự A.V.A</strong></span></div>
                  <div class="text fz-16">
                    <p><strong>Văn phòng Đà Nẵng:</strong> 29 Nguyễn Sơn Trà, P. Hòa Cường Bắc, Q. Hải Châu, TP. Đà Nẵng, Việt Nam</p>
                    <p><strong>Email:</strong> <a href="mailto:kientrucava@gmail.com">kientrucava@gmail.com</a></p>
                    <p><strong>Điện thoại:</strong> <a href="tel:02362665577">(0236) 2 66 55 77</a></p>
                    <p><strong>Hotline:</strong> <a href="tel:0988088411">0988 088 411</a> (Mr Vu) - <a href="tel:0906474758">0906 474 758</a> (Mr Lam)</p>
                  </div>
                </div>
              </div>

              <div class="stack full-mobile w-160 flex-shrink gapy-16 stack-col justify-start items-stretch">
                <div class="text"><span style="font-size:120%"><strong>Khám phá</strong></span></div>
                <div class="ux-menu stack stack-col justify-start fz-16">
${link('Trang chủ', '/')}
${link('Giới thiệu', '/ve-ava-architects/')}
${link('Dịch vụ', '/dich-vu/')}
${link('Tin tức', '/tin-tuc/')}
${link('Liên hệ', '/lien-he/')}
                </div>
              </div>

              <div class="stack full-mobile w-276 flex-shrink gapy-24 stack-col justify-start items-stretch">
                <div class="text"><span style="font-size:120%"><strong>Đăng ký nhận tin mới</strong></span></div>
                <div class="wpcf7">
                  <form class="wpcf7-form" novalidate>
                    <p style="position:relative;margin:0;">
                      <input type="email" name="your-email" class="wpcf7-form-control" placeholder="Email của bạn" aria-label="Email của bạn" required>
                      <input type="submit" value="Gửi" class="wpcf7-form-control wpcf7-submit button">
                    </p>
                  </form>
                </div>
                <div class="social-icons follow-icons">
${social('facebook', 'facebook', 'https://www.facebook.com/avaarchitects')}
${social('youtube', 'youtube', 'https://www.youtube.com/@avaarchitects')}
${social('instagram', 'instagram', 'https://www.instagram.com/avaarchitects')}
${social('linkedin', 'linkedin', 'https://www.linkedin.com/company/ava-architects')}
${social('email', 'envelop', 'mailto:kientrucava@gmail.com')}
                </div>
                <a href="${rel}ve-ava-architects/#hosonangluc" class="button primary is-outline lowercase">
                  <span>Hồ sơ năng lực</span><i class="icon-angle-right" aria-hidden="true"></i>
                </a>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div class="absolute-footer dark medium-text-center text-center">
    <div class="container clearfix">
      <div class="footer-primary pull-left">
        <div class="copyright-footer">Copyright 2025 © AVA</div>
      </div>
    </div>
  </div>
</footer>`;
}

export function documentShell({ rel, slug, title, description, ogImage, bodyClass, builderCss, content }) {
  return `<!DOCTYPE html>
<html lang="vi" class="loading-site no-js">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="AVA Architects">
${ogImage ? `<meta property="og:image" content="${esc(ogImage)}">` : ''}
<link rel="icon" href="${rel}assets/img/2025/04/logo-ava-architects-6-copy@2x-1900x577.png">
<link rel="stylesheet" href="${rel}assets/css/style.css">
<script>document.documentElement.className = document.documentElement.className.replace(/\\bno-js\\b/, 'js');</script>
${builderCss ? `<style>\n${builderCss}\n</style>` : ''}
</head>
<body class="${esc(bodyClass)} lightbox nav-dropdown-has-arrow nav-dropdown-has-shadow nav-dropdown-has-border mobile-submenu-slide mobile-submenu-slide-levels-1">
<a class="skip-link screen-reader-text" href="#main">Bỏ qua nội dung</a>

<div id="wrapper">

${header(rel, slug)}

<main id="main" class="">
${content}
</main>

${footer(rel)}

</div>

${offCanvas(rel, slug)}

<script src="${rel}assets/js/main.js"></script>
</body>
</html>
`;
}
