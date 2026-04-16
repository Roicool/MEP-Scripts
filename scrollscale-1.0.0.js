/**
 * ScrollScale 1.0.0 — enter: büyükten normale, exit: normalden küçüğe + opacity.
 * Sadece transform + opacity — GPU composited, layout/paint tetiklemez.
 * Lenis + ScrollTrigger uyumlu. GSAP gerektirir.
 *
 * KULLANIM:
 *   <section data-scroll-scale>...</section>
 *
 *   Miktar override (varsayılan 0.08):
 *   <section data-scroll-scale="0.12">...</section>
 *
 *   Sadece exit:
 *   <section data-scroll-scale data-scroll-scale-enter="false">...</section>
 *
 *   Sadece enter:
 *   <section data-scroll-scale data-scroll-scale-exit="false">...</section>
 */
(function () {
  'use strict';

  var DEFAULT_AMOUNT = 0.08;
  var SCRUB          = 2;

  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('ScrollScale: GSAP veya ScrollTrigger bulunamadı.');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    var sections = document.querySelectorAll('[data-scroll-scale]');
    if (!sections.length) return;

    sections.forEach(function (section) {
      var raw        = section.getAttribute('data-scroll-scale');
      var amount     = (raw !== '' && !isNaN(parseFloat(raw))) ? parseFloat(raw) : DEFAULT_AMOUNT;
      var doEnter    = section.getAttribute('data-scroll-scale-enter') !== 'false';
      var doExit     = section.getAttribute('data-scroll-scale-exit')  !== 'false';

      if (!doEnter && !doExit) return;

      /* willChange: aktif animasyonlara göre belirle, her iki durumda da set edilir */
      var wc = doExit ? 'transform, opacity' : 'transform';
      gsap.set(section, { willChange: wc });

      /* ENTER — alttan gelirken büyükten 1'e iner */
      if (doEnter) {
        gsap.fromTo(section,
          { scale: 1 + amount },
          {
            scale: 1,
            ease:  'none',
            scrollTrigger: {
              trigger:             section,
              start:               'top bottom',
              end:                 'top top',
              scrub:               SCRUB,
              invalidateOnRefresh: true,
              /* exit yoksa enter'ın sonunda layer'ı serbest bırak */
              onLeave: doExit ? null : function () { gsap.set(section, { willChange: 'auto' }); },
            },
          }
        );
      }

      /* EXIT — üstten çıkarken küçülür + solar */
      if (doExit) {
        gsap.fromTo(section,
          { scale: 1, opacity: 1 },
          {
            scale:   1 - amount * 0.6,
            opacity: 0.5,
            ease:    'none',
            scrollTrigger: {
              trigger:             section,
              start:               'bottom bottom',
              end:                 'bottom top',
              scrub:               SCRUB,
              invalidateOnRefresh: true,
              onLeave:     function () { gsap.set(section, { willChange: 'auto' }); },
              onEnterBack: function () { gsap.set(section, { willChange: wc }); },
            },
          }
        );
      }
    });

    ScrollTrigger.refresh();
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
