/**
 * FSC 1.0.0 — Fullscreen Section Cases
 * Scroll: section 75% → 100% scale (scrub, reverse)
 * Tabs: CMS'den extract, auto-advance, bg/video/content geçişi
 * GPU composited — transform + opacity only. will-change dinamik.
 *
 * DOM YAPISI (Webflow):
 *   section.section-fsc
 *     div.fsc__list  ← CMS Collection List
 *       div.fsc__item  ← CMS Item (her slide)
 *         div.fsc__bg
 *         div.fsc__video
 *         div.fsc__tab
 *           span.fsc__tab-label
 *           div.fsc__tab-bar
 *             div.fsc__tab-bar-fill
 *         div.fsc__content
 */
(function () {
  'use strict';

  var AUTO_DELAY  = 9000;   /* ms — tab geçiş süresi          */
  var SCRUB       = 1;      /* scroll scale yumuşaklığı        */
  var DUR         = 0.85;   /* geçiş animasyon süresi (saniye) */
  var SCALE_FROM  = 0.88;   /* başlangıç scale                 */

  function mk(tag, cls) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    return el;
  }

  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('FSC: GSAP veya ScrollTrigger bulunamadı.');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    var section = document.querySelector('.section-fsc');
    if (!section) return;

    var list = section.querySelector('.fsc__list');
    if (!list) return;

    var items = Array.from(list.querySelectorAll('.fsc__item'));
    if (!items.length) return;

    /* ── DOM extract & reorganize ───────────────────────── */
    var bgTrack      = mk('div', 'fsc__bg-track');
    var inner        = mk('div', 'fsc__inner');
    var tabsWrap     = mk('div', 'fsc__tabs');
    var videoTrack   = mk('div', 'fsc__video-track');
    var contentTrack = mk('div', 'fsc__content-track');

    var bgs      = [];
    var tabs     = [];
    var videos   = [];
    var contents = [];
    var fills    = [];

    items.forEach(function (item) {
      var bg      = item.querySelector('.fsc__bg');
      var video   = item.querySelector('.fsc__video');
      var tab     = item.querySelector('.fsc__tab');
      var fill    = item.querySelector('.fsc__tab-bar-fill');
      var content = item.querySelector('.fsc__content');

      if (bg)      { bgTrack.appendChild(bg);          bgs.push(bg); }
      if (tab)     { tabsWrap.appendChild(tab);         tabs.push(tab); }
      if (video)   { videoTrack.appendChild(video);     videos.push(video); }
      if (content) { contentTrack.appendChild(content); contents.push(content); }
      if (fill)    { fills.push(fill); }
    });

    /* CMS list veri kaynağı olarak kaldı, görünmez */
    list.style.display = 'none';

    inner.appendChild(tabsWrap);
    inner.appendChild(videoTrack);
    inner.appendChild(contentTrack);
    section.appendChild(bgTrack);
    section.appendChild(inner);

    var ns = tabs.length;

    /* ── Scroll Scale ────────────────────────────────────── */
    var rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

    function calcOrigin() {
      var rect = section.getBoundingClientRect();
      var ox   = rect.width > 0
        ? ((window.innerWidth / 2 - rect.left) / rect.width * 100).toFixed(2)
        : 50;
      gsap.set(section, { transformOrigin: ox + '% center' });
    }

    gsap.set(section, {
      scale:        SCALE_FROM,
      borderRadius: '1rem',
      force3D:      true,
    });
    calcOrigin();

    ScrollTrigger.create({
      trigger:             section,
      start:               'top bottom',
      end:                 'top 40%',
      scrub:               SCRUB,
      invalidateOnRefresh: true,
      onRefresh:           calcOrigin,
      onUpdate: function (self) {
        var p     = self.progress;
        var scale = SCALE_FROM + (1 - SCALE_FROM) * p;
        gsap.set(section, { scale: scale });
        /* borderRadius: scroll bittikten sonra tek seferlik kaldır */
        section.style.willChange = (p > 0.01 && p < 0.99) ? 'transform' : 'auto';
        if (p >= 0.99) {
          section.style.borderRadius = '0px';
        } else if (p <= 0.01) {
          section.style.borderRadius = '1rem';
        }
      },
    });

    /* ── Tab / Progress ──────────────────────────────────── */
    var current = 0;
    var fillTw  = null;

    function killFill() {
      if (fillTw) { fillTw.kill(); fillTw = null; }
    }

    function startFill() {
      killFill();
      var fill = fills[current];
      if (!fill) return;
      fill.style.willChange = 'transform';
      gsap.set(fill, { scaleX: 0, transformOrigin: 'left center' });
      fillTw = gsap.to(fill, {
        scaleX:   1,
        duration: AUTO_DELAY / 1000,
        ease:     'none',
        onComplete: function () {
          fill.style.willChange = 'auto';
          goTo((current + 1) % ns);
        },
      });
    }

    function goTo(index) {
      if (index === current) return;
      var prev = current;
      current  = index;

      /* tab aktif class */
      tabs.forEach(function (t, i) {
        t.classList.toggle('is-active', i === index);
      });

      /* fill — hepsini kill + sıfırla */
      killFill();
      fills.forEach(function (f, i) {
        if (i !== index) {
          gsap.set(f, { scaleX: 0 });
          f.style.willChange = 'auto';
        }
      });

      /* tüm content/video tween'lerini öldür,
         prev ve next dışındakileri anında gizle */
      contents.forEach(function (c, i) {
        gsap.killTweensOf(c);
        if (i !== prev && i !== index) {
          c.classList.remove('is-active');
          gsap.set(c, { opacity: 0, y: 0, rotateX: 0, scale: 1 });
          c.style.willChange = 'auto';
        }
      });
      videos.forEach(function (v, i) {
        gsap.killTweensOf(v);
        if (i !== prev && i !== index) {
          v.classList.remove('is-active');
          gsap.set(v, { opacity: 0, y: 0, scale: 1 });
          v.style.willChange = 'auto';
        }
      });

      /* ── BG — zar çevirme ─── */
      bgs.forEach(function (b) { gsap.killTweensOf(b); });
      var prevBg = bgs[prev];
      var nextBg = bgs[index];
      prevBg.style.willChange = 'opacity, transform';
      nextBg.style.willChange = 'opacity, transform';
      gsap.set(nextBg, { opacity: 0, rotateX: -3, zIndex: 2 });
      gsap.set(prevBg, { zIndex: 1 });
      gsap.to(prevBg, {
        opacity: 0, rotateX: 3,
        duration: DUR * 0.9,
        ease: 'power2.in',
        overwrite: 'auto',
      });
      gsap.to(nextBg, {
        opacity: 1, rotateX: 0,
        duration: DUR * 1.3,
        ease: 'power2.out',
        overwrite: 'auto',
        onComplete: function () {
          prevBg.classList.remove('is-active');
          nextBg.classList.add('is-active');
          gsap.set(prevBg, { opacity: 0, rotateX: 0, zIndex: 0 });
          gsap.set(nextBg, { zIndex: 1 });
          prevBg.style.willChange = 'auto';
          nextBg.style.willChange = 'auto';
        },
      });

      /* ── Video — zar çevirme ─── */
      var prevVid = videos[prev];
      var nextVid = videos[index];
      prevVid.style.willChange = 'opacity, transform';
      nextVid.style.willChange = 'opacity, transform';
      gsap.to(prevVid, {
        opacity: 0, y: 20, scale: 0.96, rotateX: 6,
        duration: DUR * 0.4,
        ease: 'power2.in',
        overwrite: 'auto',
        onComplete: function () {
          prevVid.classList.remove('is-active');
          prevVid.style.willChange = 'auto';
          gsap.set(prevVid, { y: 0, scale: 1, rotateX: 0 });
        },
      });
      gsap.fromTo(nextVid,
        { opacity: 0, y: -20, scale: 0.96, rotateX: -6 },
        {
          opacity: 1, y: 0, scale: 1, rotateX: 0,
          duration: DUR * 1.1,
          delay:    DUR * 0.3,
          ease:     'power3.out',
          overwrite: 'auto',
          onStart: function () { nextVid.classList.add('is-active'); },
          onComplete: function () { nextVid.style.willChange = 'auto'; },
        }
      );

      /* ── Content — zar çevirme ─── */
      var prevCnt = contents[prev];
      var nextCnt = contents[index];
      prevCnt.style.willChange = 'opacity, transform';
      nextCnt.style.willChange = 'opacity, transform';
      gsap.to(prevCnt, {
        opacity: 0, y: -20, scale: 0.97, rotateX: 5,
        duration: DUR * 0.4,
        ease: 'power2.in',
        overwrite: 'auto',
        onComplete: function () {
          prevCnt.classList.remove('is-active');
          prevCnt.style.willChange = 'auto';
          gsap.set(prevCnt, { y: 0, scale: 1, rotateX: 0 });
        },
      });
      gsap.fromTo(nextCnt,
        { opacity: 0, y: 20, scale: 0.97, rotateX: -5 },
        {
          opacity: 1, y: 0, scale: 1, rotateX: 0,
          duration: DUR * 1.1,
          delay:    DUR * 0.3,
          ease:     'power3.out',
          overwrite: 'auto',
          onStart: function () { nextCnt.classList.add('is-active'); },
          onComplete: function () { nextCnt.style.willChange = 'auto'; },
        }
      );

      startFill();
    }

    /* tab tıklama */
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        if (i !== current) goTo(i);
      });
    });

    /* ── Init state ──────────────────────────────────────── */
    gsap.set(bgs,      { opacity: 0, zIndex: 0 });
    gsap.set(videos,   { opacity: 0 });
    gsap.set(contents, { opacity: 0 });
    gsap.set(fills,    { scaleX: 0, transformOrigin: 'left center' });

    if (bgs[0])      { gsap.set(bgs[0],      { opacity: 1, zIndex: 1 }); bgs[0].classList.add('is-active'); }
    if (videos[0])   { gsap.set(videos[0],   { opacity: 1 }); videos[0].classList.add('is-active'); }
    if (contents[0]) { gsap.set(contents[0], { opacity: 1 }); contents[0].classList.add('is-active'); }
    if (tabs[0])     { tabs[0].classList.add('is-active'); }

    startFill();
  }

  function waitAndInit() {
    if (window.__lenis) {
      init();
    } else {
      var attempts = 0;
      var timer = setInterval(function () {
        attempts++;
        if (window.__lenis || attempts >= 20) {
          clearInterval(timer);
          init();
        }
      }, 100);
    }
  }

  window.addEventListener('load', waitAndInit);
})();
