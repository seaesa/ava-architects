// Shared probe: run in both the original and the clone and diff the results.
// Paste-able into evaluate_script as the body of an async function.
async () => {
  const h = document.documentElement.scrollHeight;
  for (let y = 0; y < h; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 55)); }
  window.scrollTo(0, 0);
  await new Promise(r => setTimeout(r, 1200));

  const round = (n) => Math.round(n);
  const geo = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: round(r.x), y: round(r.y + window.scrollY), w: round(r.width), h: round(r.height) };
  };
  const type = (el) => {
    if (!el) return null;
    const c = getComputedStyle(el);
    return [c.fontSize, c.fontWeight, c.lineHeight, c.color, c.textTransform].join(' | ');
  };

  const out = { pageHeight: h, sections: [] };

  document.querySelectorAll('#main > div > section.section, #content > section.section').forEach((s, i) => {
    out.sections.push({
      i,
      geo: geo(s),
      title: (s.querySelector('.section-title-main') || {}).textContent?.trim() || null,
      titleGeo: geo(s.querySelector('.section-title-main')),
      cols: s.querySelectorAll('.col').length,
      imgs: s.querySelectorAll('img').length,
      text: (s.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 60),
    });
  });

  out.header = geo(document.querySelector('#header'));
  out.headerInner = geo(document.querySelector('.header-inner'));
  out.logo = geo(document.querySelector('#logo img'));
  out.navLinkType = type(document.querySelector('.header-nav-main > li > a'));
  out.footer = geo(document.querySelector('#footer'));
  out.container = geo(document.querySelector('#main .container'));
  out.bodyType = type(document.body);
  return out;
}
