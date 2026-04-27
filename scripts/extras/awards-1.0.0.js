/**
 * Awards 1.0.0 — GSAP Draggable slider. Swiper yok.
 * Tab index = slide index. Loop destekli.
 */
(function () {
  'use strict';

  var SPEED            = 0.55;
  var GAP              = 24;
  var SLIDE_RATIO      = 0.42; /* desktop */
  var SLIDE_RATIO_MOB  = 0.80; /* mobile: ~1.2 kart görünür */
  var BP_MOBILE        = 767;
  var FADE_OUT         = 0.16;
  var FADE_IN          = 0.28;

  var CASCADE = [
    { scale: 1,    opacity: 1    },
    { scale: 0.85, opacity: 0.65 },
    { scale: 0.75, opacity: 0.35 },
  ];

  /* ── Kritik yapısal stiller ───────────────────────────── */
  var css =
    '.section-awards{overflow:hidden}' +
    '.awards__body{display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:48px}' +
    '.awards__left{display:flex;flex-direction:column;gap:32px}' +
    '.awards__content{min-height:160px}' +
    '.awards__tabs{display:flex;align-items:center}' +
    '.awards__nav{display:flex;align-items:center}' +
    /* overflow:hidden → taşma yok, cascade container içinde kalır */
    '.awards__right{overflow:hidden;position:relative}' +
    /* swiper-wrapper track olarak kullanılıyor */
    '[data-awards-swiper] .swiper-wrapper{display:flex;gap:' + GAP + 'px;cursor:grab;user-select:none;will-change:transform}' +
    '[data-awards-swiper] .swiper-wrapper:active{cursor:grabbing}' +
    '.awards__slide{flex-shrink:0;transform-origin:left center;will-change:transform,opacity}' +
    '@media(max-width:991px){' +
      '.awards__body{grid-template-columns:1fr;gap:32px}' +
      '.awards__left{order:2}' +
      '.awards__right{order:1}' +
      '.awards__tabs{overflow-x:auto;-webkit-overflow-scrolling:touch;flex-wrap:nowrap}' +
    '}';

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ── Boot ─────────────────────────────────────────────── */
  function boot() {
    var swiperEl  = document.querySelector('[data-awards-swiper]');
    if (!swiperEl) return;

    var section   = swiperEl.closest('.section-awards');
    if (!section) return;

    var track     = swiperEl.querySelector('.swiper-wrapper');
    var right     = section.querySelector('.awards__right');
    var contentEl = section.querySelector('[data-awards-content]');
    var tabs      = [].slice.call(section.querySelectorAll('[data-awards-tab]'));
    var prevBtn   = section.querySelector('[data-awards-prev]');
    var nextBtn   = section.querySelector('[data-awards-next]');

    if (!track || !right) return;

    if (typeof gsap === 'undefined' || typeof Draggable === 'undefined') {
      setTimeout(boot, 50); return;
    }

    var slides  = [].slice.call(track.children).filter(function (n) {
      return n.classList && n.classList.contains('swiper-slide');
    });
    var N       = slides.length;
    var current = 0;

    /* ── Boyutlar ── */
    function getRatio() {
      return window.innerWidth <= BP_MOBILE ? SLIDE_RATIO_MOB : SLIDE_RATIO;
    }
    var containerW = right.offsetWidth;
    var slideW     = Math.round(containerW * getRatio());
    var unit       = slideW + GAP;

    slides.forEach(function (s) { gsap.set(s, { width: slideW }); });

    /* ── Cascade ── */
    function updateCascade(index) {
      slides.forEach(function (slide, i) {
        var offset = i - index;
        var c;
        if (offset < 0) {
          c = { scale: 0.85, opacity: 0 };
        } else {
          c = CASCADE[Math.min(offset, CASCADE.length - 1)];
        }
        gsap.to(slide, {
          scale: c.scale, opacity: c.opacity,
          duration: SPEED, ease: 'power2.out',
          force3D: true
        });
      });
    }

    /* ── Slide'a git ── */
    function goTo(index, animate) {
      index   = ((index % N) + N) % N;
      current = index;

      var targetX = -(index * unit);

      gsap.to(track, {
        x: targetX,
        duration: animate === false ? 0 : SPEED,
        ease: 'power2.out'
      });

      updateCascade(index);
      activateTab(index, tabs);
      if (animate !== false) animateContent(slides[index], contentEl);
    }

    /* ── Draggable ── */
    Draggable.create(track, {
      type:    'x',
      inertia: true,
      bounds:  { minX: -((N - 1) * unit), maxX: 0 },
      onDragEnd: function () {
        var nearest = Math.max(0, Math.min(Math.round(-this.x / unit), N - 1));
        goTo(nearest, true);
      }
    });

    /* ── İlk durum ── */
    setContent(slides[0], contentEl);
    updateCascade(0);
    gsap.set(track, { x: 0 });

    /* ── Tablar ── */
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { goTo(i, true); });
    });

    /* ── Ok butonları ── */
    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1, true); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1, true); });

    /* ── Resize ── */
    window.addEventListener('resize', function () {
      containerW = right.offsetWidth;
      slideW     = Math.round(containerW * getRatio());
      unit       = slideW + GAP;
      slides.forEach(function (s) { gsap.set(s, { width: slideW }); });
      gsap.set(track, { x: -(current * unit) });
    });
  }

  /* ── Tab sync ─────────────────────────────────────────── */
  function activateTab(index, tabs) {
    tabs.forEach(function (t, i) {
      if (i === index) t.setAttribute('data-state', 'active');
      else t.removeAttribute('data-state');
    });
  }

  /* ── Sol içerik ───────────────────────────────────────── */
  function buildHTML(slide) {
    return '<h2 class="awards__content-heading">' +
      (slide.getAttribute('data-award-heading') || '') +
      '</h2><p class="awards__content-desc">' +
      (slide.getAttribute('data-award-desc') || '') + '</p>';
  }

  function setContent(slide, el) {
    if (!el) return;
    el.innerHTML = buildHTML(slide);
  }

  function animateContent(slide, el) {
    if (!el || !slide) return;
    gsap.to(el, {
      opacity: 0, y: 8, duration: FADE_OUT, ease: 'power2.in',
      onComplete: function () {
        el.innerHTML = buildHTML(slide);
        gsap.fromTo(el,
          { opacity: 0, y: -8 },
          { opacity: 1, y: 0, duration: FADE_IN, ease: 'power2.out' }
        );
      }
    });
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', boot)
    : boot();

})();
