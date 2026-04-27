/**
 * VEX 1.0.0 — Video Expand Section
 * Pinned 3-faz scroll animasyonu:
 *
 *   Faz 0 : vex__wrap scale(0.85 → 1), global genişliğe oturur, border-radius korunur
 *   Faz 1 : blur + başlık metni girer (vex__blur vex__media içinde → sadece bg'yi etkiler)
 *   Faz 2 : başlık çıkar → vex__media xPercent(0 → 50) ile sağa kayar,
 *            blur içinde kayar, sol içerik girer
 *
 * Bağımlılıklar: GSAP, ScrollTrigger. window.__lenis bekler.
 *
 * DOM (vex-ref.html):
 *   section.section-vex
 *     div.vex__wrap
 *       div.vex__media
 *         video veya img
 *         div.vex__blur      ← media içinde! sadece bg'yi etkiler
 *       div.vex__headline
 *       div.vex__grid
 *         div.vex__left
 *         div.vex__right
 *           div.vex__right-overlay
 *           div.vex__right-img[data-vex-panel].is-active
 *             img
 */
(function () {
  'use strict';

  var PIN_VH     = 3.5;
  var SCRUB      = 1;
  var SCALE_FROM = 0.72;

  var FLUID_PAD = [
    'clamp(3rem,',
    '((3 - ((5 - 3) / (var(--layout--fluid-max) - var(--layout--fluid-min)))',
    ' * var(--layout--fluid-min))) * 1rem',
    ' + ((5 - 3) / (var(--layout--fluid-max) - var(--layout--fluid-min)))',
    ' * 100vw, 5rem)',
  ].join('');

  var STYLES = [
    /* Section: tam viewport yüksekliği, padding ile wrap'ı sınırlar */
    /* align-items:stretch → wrap height:100% doğru çalışır        */
    '.section-vex{',
    'width:100%;height:100vh;height:100svh;',
    'display:flex;align-items:stretch;justify-content:center;',
    'padding:2rem ' + FLUID_PAD + ';',
    'box-sizing:border-box;}',

    /* Wrap: padding'den kalan alanı tam doldurur, scale eder */
    /* clip-path: overflow+border-radius composited child'ları doğru clip etmez (Safari/Chrome bug) */
    '.vex__wrap{',
    'position:relative;',
    'width:100%;height:100%;',
    'border-radius:1.5rem;',
    'overflow:hidden;',
    'clip-path:inset(0 round 1.5rem);',
    'will-change:transform;',
    'transform-origin:center center;}',

    /* Media: wrap'ı tamamen kaplar */
    '.vex__media{',
    'position:absolute;inset:0;z-index:0;',
    'overflow:hidden;isolation:isolate;}',
    '.vex__media>video,.vex__media>img{',
    'position:absolute;inset:0;width:100%;height:100%;',
    'object-fit:cover;display:block;}',

    /* Blur: media içinde */
    '.vex__blur{',
    'position:absolute;inset:0;z-index:1;',
    'backdrop-filter:blur(22px) brightness(0.52);',
    '-webkit-backdrop-filter:blur(22px) brightness(0.52);}',

    /* Headline: wrap ortasında */
    '.vex__headline{',
    'position:absolute;inset:0;z-index:2;',
    'display:flex;align-items:center;justify-content:center;',
    'text-align:center;padding:2rem 10%;',
    'pointer-events:none;}',

    /* Grid: wrap'ı tamamen kaplar */
    '.vex__grid{',
    'position:absolute;inset:0;z-index:3;',
    'display:grid;grid-template-columns:1fr 1fr;',
    'pointer-events:none;}',
    '.vex__grid.is-interactive{pointer-events:auto;}',

    /* Sol kolon */
    '.vex__left{',
    'overflow-y:auto;',
    'display:flex;flex-direction:column;justify-content:center;',
    '--vex-pad:' + FLUID_PAD + ';padding:var(--vex-pad);}',

    /* Sağ kolon */
    '.vex__right{position:relative;overflow:hidden;}',

    /* Sağ overlay: media üstünde kalıcı karartma */
    '.vex__right-overlay{',
    'position:absolute;inset:0;z-index:0;',
    'background:rgba(0,0,0,0.25);pointer-events:none;}',

    /* Per-tab resimler: padding + radius ile card görünümü */
    '.vex__right-img{',
    'position:absolute;inset:1.5rem;z-index:1;',
    'border-radius:0.75rem;overflow:hidden;',
    'display:flex;align-items:center;justify-content:center;',
    'opacity:0;transition:opacity 0.45s ease;}',
    '.vex__right-img.is-active{opacity:1;}',
    '.vex__right-img>img,.vex__right-img>video{',
    'width:100%;height:auto;max-height:100%;',
    'aspect-ratio:656/494;',
    'border-radius:0.75rem;',
    'object-fit:cover;display:block;}',

    /* Paneller: fade + slide up */
    '.vex__panels{position:relative;}',
    '.vex__panel{',
    'opacity:0;transform:translateY(14px);',
    'transition:opacity 0.32s ease,transform 0.32s ease;',
    'pointer-events:none;',
    'position:absolute;top:0;left:0;width:100%;}',
    '.vex__panel.is-active{',
    'opacity:1;transform:translateY(0);',
    'pointer-events:auto;position:relative;}',

    /* Mobil: grid stack, sağ üste */
    '@media(max-width:767px){',
    '.section-vex{padding:1.25rem;}',
    '.vex__grid{grid-template-columns:1fr;grid-template-rows:1fr 1fr;}',
    '.vex__right{order:-1;}',
    '.vex__left{--vex-pad:1.25rem;}',
    '}',
  ].join('');

  function injectCSS() {
    var s = document.createElement('style');
    s.textContent = STYLES;
    document.head.appendChild(s);
  }

  /* ── Tab + sağ resim geçişi ───────────────────────────── */
  function initTabs(section) {
    var tabs      = section.querySelectorAll('.vex__tab');
    var panels    = section.querySelectorAll('.vex__panel');
    var rightImgs = section.querySelectorAll('.vex__right-img');
    if (!tabs.length) return;

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var idx = tab.getAttribute('data-vex-tab');

        tabs.forEach(function (t) { t.classList.remove('is-active'); });
        panels.forEach(function (p) { p.classList.remove('is-active'); });
        rightImgs.forEach(function (r) { r.classList.remove('is-active'); });

        tab.classList.add('is-active');

        var panel = section.querySelector('.vex__panel[data-vex-panel="' + idx + '"]');
        if (panel) panel.classList.add('is-active');

        var img = section.querySelector('.vex__right-img[data-vex-panel="' + idx + '"]');
        if (img) img.classList.add('is-active');
      });
    });
  }

  /* ── Scroll animasyonu ────────────────────────────────── */
  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('VEX: GSAP veya ScrollTrigger bulunamadı.');
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    var section  = document.querySelector('.section-vex');
    if (!section) return;

    var wrap     = section.querySelector('.vex__wrap');
    var media    = section.querySelector('.vex__media');
    var blur     = section.querySelector('.vex__blur');     /* media içinde */
    var headline = section.querySelector('.vex__headline');
    var grid     = section.querySelector('.vex__grid');
    var left     = grid ? grid.querySelector('.vex__left') : null;

    /* ── Başlangıç durumu ── */
    if (wrap)     gsap.set(wrap,     { scale: SCALE_FROM, force3D: true });
    if (media)    gsap.set(media,    { top: 0, left: 0, right: 0, bottom: 0, borderRadius: 0 });
    if (blur)     gsap.set(blur,     { opacity: 0 });
    if (headline) gsap.set(headline, { opacity: 0, y: 40 });
    if (grid)     gsap.set(grid,     { opacity: 0 });
    if (left)     gsap.set(left,     { x: -56, opacity: 0 });

    /* ── Scale: section viewport'a girerken (pin'den bağımsız) ──
     * FSC ile aynı pattern: ayrı ScrollTrigger, section alttan girerken açılır.
     * Pin başlamadan önce tamamlanır (end: 'top 15%' < pin start: 'top top') */
    if (wrap) {
      ScrollTrigger.create({
        trigger:             section,
        start:               'top bottom',
        end:                 'top 15%',
        scrub:               SCRUB,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          var s = SCALE_FROM + (1 - SCALE_FROM) * self.progress;
          gsap.set(wrap, { scale: s, force3D: true });
        },
        onLeave: function () {
          gsap.set(wrap, { scale: 1, force3D: true });
        },
        onEnterBack: function () {
          /* pin bölgesinden geri dönüldüğünde scale tekrar scrub'a bırakılır */
        },
      });
    }

    /* ── Pin timeline: blur / text / media / grid ── */
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger:             section,
        start:               'top top',
        end:                 function () { return '+=' + (window.innerHeight * PIN_VH); },
        scrub:               SCRUB,
        pin:                 true,
        anticipatePin:       1,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          if (!grid) return;
          if (self.progress >= 0.75) {
            grid.classList.add('is-interactive');
          } else {
            grid.classList.remove('is-interactive');
          }
        },
        onScrubComplete: function () {
          if (wrap) gsap.set(wrap, { willChange: 'auto' });
        },
      },
    });

    /* Faz 1: Blur (media içinden, sadece bg'yi etkiler) */
    if (blur) {
      tl.to(blur, { opacity: 1, duration: 0.7, ease: 'power2.out' }, 0.8);
    }

    /* Faz 1: Başlık giriş */
    if (headline) {
      tl.to(headline, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 1.0);
    }

    /* Faz 2: Başlık çıkış */
    if (headline) {
      tl.to(headline, { opacity: 0, y: -28, duration: 0.45, ease: 'power2.in' }, 2.0);
    }

    /* Faz 2: Media küçülür — desktop: sağa, mobil: yukarı */
    if (media) {
      var mob = window.innerWidth <= 767;
      tl.to(media, mob ? {
        top:          '2%',
        left:         '3%',
        right:        '3%',
        bottom:       '52%',
        borderRadius: '1.2rem',
        duration:     0.9,
        ease:         'power2.inOut',
      } : {
        top:          '3%',
        left:         '52%',
        right:        '2%',
        bottom:       '3%',
        borderRadius: '1.2rem',
        duration:     0.9,
        ease:         'power2.inOut',
      }, 2.0);
    }

    /* Faz 3: Grid belirir */
    if (grid) {
      tl.to(grid, { opacity: 1, duration: 0.3, ease: 'none' }, 2.6);
    }

    /* Faz 3: Sol kolon slide-in */
    if (left) {
      tl.to(left, { x: 0, opacity: 1, duration: 0.75, ease: 'power3.out' }, 2.7);
    }

    initTabs(section);
  }

  /* ── Lenis hazır olana kadar bekle ───────────────────── */
  function waitAndInit() {
    if (window.__lenis) { init(); return; }
    var attempts = 0;
    var timer = setInterval(function () {
      attempts++;
      if (window.__lenis || attempts >= 20) { clearInterval(timer); init(); }
    }, 100);
  }

  injectCSS();
  window.addEventListener('load', waitAndInit);
})();
