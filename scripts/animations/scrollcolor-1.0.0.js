/**
 * ScrollColor 1.0.0 — section arka plan renk geçişi, scroll tetiklemeli.
 * background-color animasyonu — layout yok, paint minimal, mobile uyumlu.
 * Toggle modunda çalışır — her scroll frame'de hesaplama yok.
 *
 * KULLANIM:
 *   <section data-scroll-color="#1a1a2e">...</section>
 *
 * OPSİYONEL ATTRİBUTE'LAR:
 *   data-scroll-color-from    — başlangıç rengi         (varsayılan: mevcut arka plan)
 *   data-scroll-color-start   — tetik noktası           (varsayılan: "top 70%")
 *   data-scroll-color-reverse — "false" → geri dönmez   (varsayılan: true)
 *   data-scroll-color-scrub   — "true" → scroll senkron (varsayılan: false)
 *   data-scroll-color-end     — scrub bitiş noktası     (varsayılan: "top 20%", sadece scrub modunda)
 *
 * ÖRNEKLER:
 *   data-scroll-color="#000"
 *   data-scroll-color="oklch(20% 0.05 260)" data-scroll-color-scrub="true"
 *   data-scroll-color="#0a0a0a" data-scroll-color-reverse="false"
 */
(function () {
  'use strict';

  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('ScrollColor: GSAP veya ScrollTrigger bulunamadı.');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    var sections = document.querySelectorAll('[data-scroll-color]');
    if (!sections.length) return;

    sections.forEach(function (section) {
      var toColor   = section.getAttribute('data-scroll-color');
      if (!toColor) return;

      var fromColor = section.getAttribute('data-scroll-color-from')
                    || window.getComputedStyle(section).backgroundColor
                    || 'transparent';
      var start     = section.getAttribute('data-scroll-color-start') || 'top 70%';
      var end       = section.getAttribute('data-scroll-color-end')   || 'top 20%';
      var reverse   = section.getAttribute('data-scroll-color-reverse') !== 'false';
      var isScrub   = section.getAttribute('data-scroll-color-scrub') === 'true';

      /* başlangıç rengini inline set et — computed değer kaybolmasın */
      gsap.set(section, { backgroundColor: fromColor });

      if (isScrub) {
        /* scroll ile senkron — geri scroll edince otomatik geri döner */
        gsap.to(section, {
          backgroundColor: toColor,
          ease:            'none',
          scrollTrigger: {
            trigger:             section,
            start:               start,
            end:                 end,
            scrub:               1,
            invalidateOnRefresh: true,
          },
        });
      } else {
        /* viewport'a girerken play, çıkarken opsiyonel reverse */
        gsap.to(section, {
          backgroundColor: toColor,
          duration:        0.7,
          ease:            'power2.inOut',
          scrollTrigger: {
            trigger:             section,
            start:               start,
            toggleActions:       reverse ? 'play none none reverse' : 'play none none none',
            invalidateOnRefresh: true,
          },
        });
      }
    });
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
