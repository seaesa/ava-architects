/* ==========================================================================
   AVA Architects — front-end behaviour
   Hand-written replacements for the behaviours measured on the live site:
   see docs/research/BEHAVIORS.md.

   Contents
     1. helpers
     2. sticky header (hide on scroll down, pin on scroll up)
     3. off-canvas mobile menu with sliding sub-levels
     4. desktop dropdowns (touch + keyboard)
     5. search lightbox
     6. slider (Flickity-compatible subset)
     7. counters
     8. reveal-on-scroll
     9. portfolio filtering
    10. image lightbox
    11. back to top
    12. misc (TOC toggle, widget accordions, contact form)
   ========================================================================== */

(function () {
  'use strict';

  /* -- 1. helpers --------------------------------------------------------- */

  const $  = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Run fn at most once per animation frame. */
  function rafThrottle(fn) {
    let queued = false;
    return function (...args) {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; fn.apply(this, args); });
    };
  }

  /** The builder writes loose JSON into data-flickity-options; be forgiving. */
  function parseOptions(raw) {
    if (!raw) return {};
    try { return JSON.parse(raw); } catch (e) { /* fall through */ }
    try {
      return JSON.parse(
        raw.replace(/([{,]\s*)'([^']+)'\s*:/g, '$1"$2":')
           .replace(/:\s*'([^']*)'/g, ': "$1"')
           .replace(/,\s*([}\]])/g, '$1')
      );
    } catch (e) {
      console.warn('[ava] could not parse slider options', e);
      return {};
    }
  }

  /* -- 2. sticky header ---------------------------------------------------- */
  /* Scrolling DOWN lets the bar scroll away with the page. Scrolling UP pins
     it to the top and fades it in. Matches `sticky-hide-on-scroll` + `stuck`. */

  function initStickyHeader() {
    const header  = $('#header');
    const wrapper = $('.header-wrapper', header || document);
    if (!header || !wrapper) return;

    // Placeholder keeps the page from jumping when the bar becomes fixed.
    const guard = document.createElement('div');
    guard.className = 'header-height-guard';
    guard.style.display = 'none';
    wrapper.parentNode.insertBefore(guard, wrapper.nextSibling);

    let lastY = window.scrollY;
    let stuck = false;
    const THRESHOLD = 4;                   // ignore sub-pixel jitter
    const OFFSET = wrapper.offsetHeight;   // start pinning past the bar itself

    const stick = () => {
      if (stuck) return;
      stuck = true;
      guard.style.height = OFFSET + 'px';
      guard.style.display = 'block';
      wrapper.classList.add('stuck');
      header.classList.remove('sticky-hide-on-scroll--active');
    };

    const unstick = () => {
      if (!stuck) return;
      stuck = false;
      guard.style.display = 'none';
      wrapper.classList.remove('stuck');
    };

    const update = () => {
      const y = window.scrollY;
      const delta = y - lastY;

      if (y <= OFFSET) {
        // Back at the very top: return the bar to the document flow.
        unstick();
        header.classList.remove('sticky-hide-on-scroll--active');
      } else if (delta > THRESHOLD) {
        // Scrolling down — let it go.
        unstick();
        header.classList.add('sticky-hide-on-scroll--active');
      } else if (delta < -THRESHOLD) {
        // Scrolling up — bring it back, pinned.
        stick();
      }

      if (Math.abs(delta) > THRESHOLD) lastY = y;
    };

    on(window, 'scroll', rafThrottle(update), { passive: true });
    update();
  }

  /* -- 3. off-canvas mobile menu ------------------------------------------- */

  function initOffCanvas() {
    const panel = $('#main-menu');
    if (!panel) return;

    const opener = $('a[data-open="#main-menu"]');
    const tray = $('.sidebar-menu', panel);
    const nav = $('.nav-slide', panel);

    // Chrome that the original builds at runtime, built here too.
    const overlay = document.createElement('div');
    overlay.className = 'off-canvas-overlay';
    document.body.appendChild(overlay);

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'off-canvas-close';
    close.setAttribute('aria-label', 'Đóng menu');
    close.innerHTML = '&times;';
    panel.appendChild(close);

    panel.classList.remove('mfp-hide');
    panel.setAttribute('aria-hidden', 'true');

    let lastFocus = null;

    function openMenu(e) {
      if (e) e.preventDefault();
      lastFocus = document.activeElement;
      document.documentElement.classList.add('has-off-canvas', 'has-off-canvas-right', 'off-canvas-open');
      panel.classList.add('is-open');
      panel.setAttribute('aria-hidden', 'false');
      if (opener) opener.setAttribute('aria-expanded', 'true');
      close.focus();
    }

    function closeMenu() {
      document.documentElement.classList.remove('has-off-canvas', 'has-off-canvas-right', 'off-canvas-open');
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
      if (opener) opener.setAttribute('aria-expanded', 'false');
      resetLevels();
      if (lastFocus) lastFocus.focus();
    }

    /* -- sliding sub-levels --
       Opening a level slides the whole tray left by the panel width and shows
       the sub-menu that sits just off its right edge. */

    function resetLevels() {
      if (tray) tray.classList.remove('is-slid');
      if (nav) nav.classList.remove('is-current-parent');
      $$('.sub-menu.is-current-slide', panel).forEach((ul) => {
        ul.classList.remove('is-current-slide');
        ul.setAttribute('aria-hidden', 'true');
      });
      $$('li[aria-expanded="true"]', panel).forEach((li) => li.setAttribute('aria-expanded', 'false'));
    }

    function openLevel(li) {
      const sub = $(':scope > .sub-menu, :scope > ul.children', li);
      if (!sub) return;
      sub.classList.add('is-current-slide');
      sub.setAttribute('aria-hidden', 'false');
      li.setAttribute('aria-expanded', 'true');
      if (nav) nav.classList.add('is-current-parent');
      // Slide by the panel's real width so it works at <300px viewports too.
      if (tray) {
        tray.style.setProperty('--ava-tray-shift', panel.offsetWidth + 'px');
        tray.classList.add('is-slid');
      }
      const firstLink = $('a', sub);
      if (firstLink) firstLink.focus();
      $$('a', sub).forEach((a) => a.removeAttribute('tabindex'));
    }

    on(opener, 'click', openMenu);
    on(close, 'click', closeMenu);
    on(overlay, 'click', closeMenu);

    on(panel, 'click', (e) => {
      const back = e.target.closest('.nav-slide-header .toggle');
      if (back) { e.preventDefault(); resetLevels(); return; }

      const toggle = e.target.closest('button.toggle');
      if (toggle) {
        e.preventDefault();
        const li = toggle.closest('li');
        if (li && li.getAttribute('aria-expanded') === 'true') resetLevels();
        else if (li) openLevel(li);
      }
    });

    on(document, 'keydown', (e) => {
      if (e.key !== 'Escape' || !panel.classList.contains('is-open')) return;
      if (tray && tray.classList.contains('is-slid')) resetLevels();
      else closeMenu();
    });

    // Leaving mobile width with the tray open would otherwise lock the page.
    on(window, 'resize', rafThrottle(() => {
      if (window.innerWidth > 849 && panel.classList.contains('is-open')) closeMenu();
    }));
  }

  /* -- 4. desktop dropdowns ------------------------------------------------ */
  /* Hover is handled in CSS. This adds tap-to-open on touch devices and
     keyboard access, mirroring the original's `current-dropdown` class. */

  function initDropdowns() {
    const items = $$('#header li.has-dropdown');
    if (!items.length) return;

    const closeAll = (except) =>
      items.forEach((li) => { if (li !== except) li.classList.remove('current-dropdown'); });

    items.forEach((li) => {
      const link = $(':scope > a', li);
      if (!link) return;

      on(link, 'click', (e) => {
        // Only intercept where hover is unavailable; otherwise follow the link.
        if (window.matchMedia('(hover: hover)').matches) return;
        if (!li.classList.contains('current-dropdown')) {
          e.preventDefault();
          closeAll(li);
          li.classList.add('current-dropdown');
          link.setAttribute('aria-expanded', 'true');
        }
      });

      on(li, 'focusin', () => { closeAll(li); li.classList.add('current-dropdown'); });
      on(li, 'focusout', (e) => {
        if (!li.contains(e.relatedTarget)) li.classList.remove('current-dropdown');
      });
      on(li, 'mouseenter', () => link.setAttribute('aria-expanded', 'true'));
      on(li, 'mouseleave', () => link.setAttribute('aria-expanded', 'false'));
    });

    on(document, 'click', (e) => { if (!e.target.closest('#header li.has-dropdown')) closeAll(null); });
    on(document, 'keydown', (e) => { if (e.key === 'Escape') closeAll(null); });
  }

  /* -- 5. search lightbox -------------------------------------------------- */

  function initSearchLightbox() {
    const source = $('#search-lightbox');
    const trigger = $('a[data-open="#search-lightbox"]');
    if (!source || !trigger) return;

    const overlay = document.createElement('div');
    overlay.className = 'search-lightbox-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    source.classList.remove('mfp-hide');
    overlay.appendChild(source);
    document.body.appendChild(overlay);

    const open = (e) => {
      e.preventDefault();
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      const field = $('input.search-field', overlay);
      if (field) field.focus();
    };
    const close = () => {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
    };

    on(trigger, 'click', open);
    on(overlay, 'click', (e) => { if (e.target === overlay) close(); });
    on(document, 'keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  /* -- 6. slider ----------------------------------------------------------- */
  /* A compact re-implementation of the Flickity behaviour the site relies on:
     cellAlign, wrapAround, groupCells, autoPlay (+pause on hover), arrows,
     dots, drag, adaptiveHeight and asNavFor. It builds the same DOM Flickity
     does so the stylesheet in 05-slider.css applies unchanged. */

  const ARROW_SVG =
    '<svg class="flickity-button-icon" viewBox="0 0 100 100">' +
    '<path d="M 10,50 L 60,100 L 70,90 L 30,50  L 70,10 L 60,0 Z" class="arrow"></path></svg>';

  class Slider {
    constructor(root) {
      this.root = root;
      this.opts = parseOptions(root.getAttribute('data-flickity-options'));
      this.cells = Array.from(root.children).filter(
        (c) => !c.classList.contains('loading-spin') && c.tagName !== 'STYLE'
      );
      if (this.cells.length === 0) return;

      this.index = 0;
      this.wrap = this.opts.wrapAround !== false && this.cells.length > 1;
      this.group = this.opts.groupCells === '100%' || this.opts.groupCells === true;
      this.isFade = root.classList.contains('slider-type-fade');

      this.build();
      this.measure();
      this.bind();
      this.select(0, false);
      this.startAuto();

      root.classList.add('flickity-enabled');
      if (this.opts.draggable !== false) root.classList.add('is-draggable');
    }

    build() {
      const viewport = document.createElement('div');
      viewport.className = 'flickity-viewport';
      const track = document.createElement('div');
      track.className = 'flickity-slider';
      this.cells.forEach((c) => track.appendChild(c));
      viewport.appendChild(track);
      this.root.appendChild(viewport);
      this.viewport = viewport;
      this.track = track;

      if (this.opts.prevNextButtons !== false && this.cells.length > 1) {
        this.prevBtn = this.makeButton('previous');
        this.nextBtn = this.makeButton('next');
        this.root.appendChild(this.prevBtn);
        this.root.appendChild(this.nextBtn);
      }

      if (this.opts.pageDots !== false && this.cells.length > 1) {
        this.dotsEl = document.createElement('ol');
        this.dotsEl.className = 'flickity-page-dots';
        this.root.appendChild(this.dotsEl);
      }
    }

    makeButton(dir) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'flickity-button flickity-prev-next-button ' + dir;
      b.setAttribute('aria-label', dir === 'next' ? 'Next' : 'Previous');
      b.innerHTML = dir === 'next'
        ? ARROW_SVG.replace('<svg ', '<svg style="transform: rotate(180deg)" ')
        : ARROW_SVG;
      on(b, 'click', () => { dir === 'next' ? this.next() : this.prev(); this.startAuto(); });
      return b;
    }

    /** Re-read the layout: how many cells fit, where each one starts. */
    measure() {
      const vw = this.viewport.clientWidth || 1;
      this.viewWidth = vw;
      // offsetLeft is relative to the track, so it survives the translate.
      this.offsets = this.cells.map((c) => c.offsetLeft);
      this.widths = this.cells.map((c) => c.offsetWidth);
      this.trackWidth = this.cells.length
        ? this.offsets[this.cells.length - 1] + this.widths[this.cells.length - 1]
        : 0;

      const cw = this.widths[0] || vw;
      this.perView = Math.max(1, Math.round(vw / cw));
      this.pages = this.group
        ? Math.max(1, Math.ceil(this.cells.length / this.perView))
        : Math.max(1, this.cells.length - (this.wrap ? 0 : this.perView - 1));

      this.renderDots();
      if (this.opts.adaptiveHeight) this.applyHeight();
    }

    renderDots() {
      if (!this.dotsEl) return;
      if (this.dotsEl.children.length === this.pages) return;
      this.dotsEl.innerHTML = '';
      for (let i = 0; i < this.pages; i++) {
        const li = document.createElement('li');
        li.className = 'dot';
        li.setAttribute('role', 'button');
        li.setAttribute('aria-label', 'Slide ' + (i + 1));
        on(li, 'click', () => { this.select(i * this.step()); this.startAuto(); });
        this.dotsEl.appendChild(li);
      }
    }

    applyHeight() {
      const cell = this.cells[this.index];
      const h = cell && cell.offsetHeight;
      if (h) this.viewport.style.height = h + 'px';
    }

    step() { return this.group ? this.perView : 1; }

    maxIndex() {
      return this.wrap ? this.cells.length - 1
        : Math.max(0, this.cells.length - this.perView);
    }

    /** Track offset that brings cell `i` into place, honouring cellAlign/contain. */
    positionFor(i) {
      let x = this.offsets[i] || 0;
      if (this.opts.cellAlign === 'center') {
        x -= (this.viewWidth - (this.widths[i] || 0)) / 2;
      }
      if (this.opts.contain !== false) {
        const max = Math.max(0, this.trackWidth - this.viewWidth);
        x = Math.min(Math.max(x, 0), max);
      }
      return x;
    }

    next() { this.select(this.index + this.step()); }
    prev() { this.select(this.index - this.step()); }

    /** Move to cell `i`, wrapping or clamping as the options dictate. */
    select(i, animate = true) {
      const max = this.maxIndex();
      if (this.wrap) {
        if (i > max) i = 0;
        else if (i < 0) i = max - (max % this.step());
      } else {
        i = Math.min(Math.max(i, 0), max);
      }
      this.index = i;

      this.cells.forEach((c, n) => c.classList.toggle('is-selected', n === i));

      if (this.isFade) {
        this.track.style.transform = '';
      } else {
        this.track.style.transition = animate && !prefersReducedMotion()
          ? 'transform .4s cubic-bezier(.25,.46,.45,.94)' : 'none';
        this.track.style.transform = 'translateX(' + -this.positionFor(i) + 'px)';
      }

      if (this.dotsEl) {
        const active = Math.min(this.pages - 1, Math.floor(i / this.step()));
        $$('.dot', this.dotsEl).forEach((d, n) => d.classList.toggle('is-selected', n === active));
      }

      if (!this.wrap) {
        if (this.prevBtn) this.prevBtn.disabled = i <= 0;
        if (this.nextBtn) this.nextBtn.disabled = i >= max;
      }

      if (this.opts.adaptiveHeight) this.applyHeight();
      if (this.navFor) this.navFor.select(i);
    }

    /* autoplay */
    startAuto() {
      this.stopAuto();
      const ms = this.opts.autoPlay;
      if (!ms || typeof ms !== 'number' || this.cells.length < 2) return;
      this.timer = setInterval(() => this.next(), ms);
    }
    stopAuto() { if (this.timer) { clearInterval(this.timer); this.timer = null; } }

    bind() {
      if (this.opts.pauseAutoPlayOnHover !== false) {
        on(this.root, 'mouseenter', () => this.stopAuto());
        on(this.root, 'mouseleave', () => this.startAuto());
      }

      // Pointer drag / swipe
      if (this.opts.draggable !== false) {
        let startX = 0, startY = 0, dragging = false, decided = false, horizontal = false;
        const threshold = this.opts.dragThreshold || 10;

        on(this.viewport, 'pointerdown', (e) => {
          if (e.button !== 0 && e.pointerType === 'mouse') return;
          dragging = true; decided = false; horizontal = false;
          startX = e.clientX; startY = e.clientY;
          this.viewport.classList.add('is-pointer-down');
          this.stopAuto();
        });

        on(this.viewport, 'pointermove', (e) => {
          if (!dragging) return;
          const dx = e.clientX - startX, dy = e.clientY - startY;
          if (!decided && (Math.abs(dx) > threshold || Math.abs(dy) > threshold)) {
            decided = true;
            horizontal = Math.abs(dx) > Math.abs(dy);
            if (horizontal) this.root.classList.add('is-dragging');
          }
          if (horizontal) e.preventDefault();
        }, { passive: false });

        const end = (e) => {
          if (!dragging) return;
          dragging = false;
          this.viewport.classList.remove('is-pointer-down');
          this.root.classList.remove('is-dragging');
          if (horizontal) {
            const dx = e.clientX - startX;
            if (Math.abs(dx) > threshold * 2) dx < 0 ? this.next() : this.prev();
          }
          this.startAuto();
        };
        on(this.viewport, 'pointerup', end);
        on(this.viewport, 'pointercancel', end);
        on(this.viewport, 'dragstart', (e) => e.preventDefault());
      }

      const relayout = rafThrottle(() => { this.measure(); this.select(this.index, false); });
      on(window, 'resize', relayout);

      // The viewport also changes size during full-page screenshots and when
      // fonts or images finish loading, so watch the element itself.
      if ('ResizeObserver' in window) new ResizeObserver(relayout).observe(this.viewport);

      $$('img', this.root).forEach((img) => { if (!img.complete) on(img, 'load', relayout); });
    }
  }

  function initSliders() {
    const instances = new Map();
    $$('.slider').forEach((el) => {
      if (el.classList.contains('flickity-enabled')) return;
      const s = new Slider(el);
      if (s.cells && s.cells.length) instances.set(el, s);
    });

    // asNavFor: a thumbnail strip drives its main gallery.
    instances.forEach((slider, el) => {
      const target = slider.opts && slider.opts.asNavFor;
      if (!target) return;
      const mainEl = $(target);
      const main = mainEl && instances.get(mainEl);
      if (!main) return;
      slider.cells.forEach((cell, i) => {
        cell.style.cursor = 'pointer';
        on(cell, 'click', () => { main.select(i); main.startAuto(); });
      });
    });
  }

  /* -- 7. counters --------------------------------------------------------- */
  /* The stats strip (17 / 350+ / 700+ / 60+) counts up once in view. */

  function initCounters() {
    const targets = $$('.icon-group .icon-box-text h3, .icon-group .icon-box-text .counter, [data-counter]');
    const numeric = targets.filter((el) => /^\s*\d[\d.,]*\s*\+?\s*$/.test(el.textContent));
    if (!numeric.length || !('IntersectionObserver' in window)) return;

    const run = (el) => {
      const raw = el.textContent.trim();
      const suffix = raw.endsWith('+') ? '+' : '';
      const end = parseInt(raw.replace(/[^\d]/g, ''), 10);
      if (!end || prefersReducedMotion()) return;
      const duration = 1400;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(end * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        run(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.4 });

    numeric.forEach((el) => io.observe(el));
  }

  /* -- 8. reveal on scroll ------------------------------------------------- */

  function initReveal() {
    const items = $$('[data-animate]');
    if (!items.length) return;

    if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
      items.forEach((el) => el.classList.add('is-animated'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-animated');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    items.forEach((el) => {
      // Layers inside a carousel sit off to the side of the viewport and would
      // never intersect, so they are revealed up front rather than never.
      if (el.closest('.flickity-slider')) { el.classList.add('is-animated'); return; }
      io.observe(el);
    });
  }

  /* -- 9. portfolio filtering ---------------------------------------------- */

  function initPortfolioFilter() {
    const wrappers = $$('.portfolio-element-wrapper.has-filtering');
    wrappers.forEach((wrapper) => {
      const buttons = $$('[data-filter]', wrapper.closest('section') || document);
      if (!buttons.length) return;
      const boxes = $$('.portfolio-box', wrapper);

      buttons.forEach((btn) => on(btn, 'click', (e) => {
        e.preventDefault();
        const filter = btn.dataset.filter;
        buttons.forEach((b) => b.classList.toggle('active', b === btn));
        boxes.forEach((box) => {
          const show = filter === '*' || box.classList.contains(filter);
          box.classList.toggle('is-filtered-out', !show);
        });
      }));
    });
  }

  /* -- 10. image lightbox --------------------------------------------------- */

  function initLightbox() {
    if (!document.body.classList.contains('lightbox')) return;
    const links = $$('a[href$=".jpg"], a[href$=".jpeg"], a[href$=".png"], a[href$=".webp"]')
      .filter((a) => a.querySelector('img'));
    if (!links.length) return;

    const overlay = document.createElement('div');
    overlay.className = 'ava-lightbox';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML =
      '<button type="button" class="ava-lightbox__close" aria-label="Đóng">&times;</button>' +
      '<img class="ava-lightbox__img" alt="">';
    document.body.appendChild(overlay);

    const img = $('.ava-lightbox__img', overlay);
    const close = () => { overlay.classList.remove('is-open'); overlay.setAttribute('aria-hidden', 'true'); };

    links.forEach((a) => on(a, 'click', (e) => {
      e.preventDefault();
      img.src = a.href;
      img.alt = (a.querySelector('img') || {}).alt || '';
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
    }));

    on(overlay, 'click', (e) => { if (e.target !== img) close(); });
    on(document, 'keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  /* -- 11. back to top ------------------------------------------------------ */

  function initBackToTop() {
    let link = $('#top-link');
    if (!link) {
      link = document.createElement('a');
      link.id = 'top-link';
      link.href = '#top';
      link.setAttribute('aria-label', 'Lên đầu trang');
      link.innerHTML = '<i class="icon-angle-up"></i>';
      document.body.appendChild(link);
    }

    on(link, 'click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    });

    const toggle = rafThrottle(() => link.classList.toggle('is-visible', window.scrollY > 400));
    on(window, 'scroll', toggle, { passive: true });
    toggle();
  }

  /* -- 12. misc ------------------------------------------------------------- */

  function initTocToggle() {
    const box = $('#ez-toc-container');
    if (!box) return;
    const btn = $('.ez-toc-toggle, .ez-toc-btn-xs', box);
    const list = $('.ez-toc-list', box);
    if (!btn || !list) return;
    on(btn, 'click', (e) => {
      e.preventDefault();
      const hidden = list.style.display === 'none';
      list.style.display = hidden ? '' : 'none';
      btn.setAttribute('aria-expanded', String(hidden));
    });
  }

  function initWidgetAccordions() {
    $$('.widget li.has-child > .toggle').forEach((btn) => on(btn, 'click', (e) => {
      e.preventDefault();
      const li = btn.closest('li');
      const sub = $(':scope > ul', li);
      if (!sub) return;
      const open = sub.style.display === 'block';
      sub.style.display = open ? 'none' : 'block';
      li.classList.toggle('active', !open);
    }));
  }

  /** The forms have no backend in this clone; say so rather than 404. */
  function initForms() {
    $$('form.wpcf7-form, form.searchform').forEach((form) => {
      if (form.classList.contains('searchform')) return;   // search still navigates
      on(form, 'submit', (e) => {
        e.preventDefault();
        let out = $('.wpcf7-response-output', form);
        if (!out) {
          out = document.createElement('div');
          out.className = 'wpcf7-response-output';
          form.appendChild(out);
        }
        form.classList.add('sent');
        out.textContent = 'Cảm ơn bạn! Đây là bản clone tĩnh nên biểu mẫu không được gửi đi.';
      });
    });
  }

  /** The English site is out of scope for this clone, so EN is a no-op. */
  function initLanguageSwitch() {
    $$('a.lang-en').forEach((a) => on(a, 'click', (e) => e.preventDefault()));
  }

  /* -- boot ---------------------------------------------------------------- */

  function init() {
    initStickyHeader();
    initOffCanvas();
    initDropdowns();
    initSearchLightbox();
    initSliders();
    initCounters();
    initReveal();
    initPortfolioFilter();
    initLightbox();
    initBackToTop();
    initTocToggle();
    initWidgetAccordions();
    initForms();
    initLanguageSwitch();
    document.documentElement.classList.remove('loading-site');
  }

  if (document.readyState === 'loading') on(document, 'DOMContentLoaded', init);
  else init();
})();
