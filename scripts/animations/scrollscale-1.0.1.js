/**
 * ScrollScale 1.0.1 — enter: büyükten normale, exit: normalden küçüğe + opacity.
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
 *
 * 1.0.1: Manuel oran (vh/sh) hesabı kaldırıldı — section/viewport yükseklik
 *        cache'lendiği için resize ve geç DOM mutasyonlarında bozuluyordu.
 *        Yerine iki ayrı ScrollTrigger (enter + exit), pozisyonlar refresh'te
 *        otomatik yeniden hesaplanır. gsap.registerPlugin(ScrollTrigger) eklendi.
 */
(function () {
  'use strict';

  var DEFAULT_AMOUNT = 0.08;
  var SCRUB          = 1;

  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('ScrollScale: GSAP veya ScrollTrigger bulunamadı.');
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    var sections = document.querySelectorAll('[data-scroll-scale]');
    if (!sections.length) return;

    sections.forEach(function (section) {
      var raw     = section.getAttribute('data-scroll-scale');
      var amount  = (raw !== '' && !isNaN(parseFloat(raw))) ? parseFloat(raw) : DEFAULT_AMOUNT;
      var doEnter = section.getAttribute('data-scroll-scale-enter') !== 'false';
      var doExit  = section.getAttribute('data-scroll-scale-exit')  !== 'false';

      if (!doEnter && !doExit) return;

      var wc = doExit ? 'transform, opacity' : 'transform';
      gsap.set(section, {
        willChange: wc,
        scale:      doEnter ? 1 + amount : 1,
        opacity:    1,
      });

      /* Enter fazı: section viewport tabanından üst tarafa girerken
       * scale (1+amount) → 1 olur. Pozisyonlar function-based olmadığı
       * için ScrollTrigger zaten refresh'te yeniden hesaplar. */
      if (doEnter) {
        gsap.fromTo(section,
          { scale: 1 + amount },
          {
            scale: 1,
            ease:  'none',
            overwrite: 'auto',
            scrollTrigger: {
              trigger:             section,
              start:               'top bottom',
              end:                 'top top',
              scrub:               SCRUB,
              invalidateOnRefresh: true,
              onEnter:     function () { gsap.set(section, { willChange: wc }); },
              onEnterBack: function () { gsap.set(section, { willChange: wc }); },
            },
          }
        );
      }

      /* Exit fazı: section üst kenarı viewport tabanından alta çıkarken
       * scale 1 → 1-amount*0.6, opacity 1 → 0.5 olur. */
      if (doExit) {
        gsap.fromTo(section,
          { scale: 1, opacity: 1 },
          {
            scale:   1 - amount * 0.6,
            opacity: 0.5,
            ease:    'none',
            overwrite: 'auto',
            scrollTrigger: {
              trigger:             section,
              start:               'bottom bottom',
              end:                 'bottom top',
              scrub:               SCRUB,
              invalidateOnRefresh: true,
              onLeave:     function () { gsap.set(section, { willChange: 'auto' }); },
              onLeaveBack: function () { gsap.set(section, { willChange: 'auto' }); },
              onEnter:     function () { gsap.set(section, { willChange: wc }); },
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

  if (document.readyState === 'complete') {
    waitAndInit();
  } else {
    window.addEventListener('load', waitAndInit);
  }

})();
