/**
 * SplitCards 1.0.0 — viewport'a girerken A ve C slide-in, B settle.
 * Pin yok. Bir kez çalışır, kendini yok eder.
 * translate3d (GPU) + eş zamanlı width açılımı.
 * Lenis + ScrollTrigger uyumlu. GSAP gerektirir.
 */
(function () {
  'use strict';

  var DURATION  = 0.68;
  var SLIDE_X   = 48;    /* px — A ve C'nin başlangıç offset'i */
  var B_SCALE   = 1.04;  /* B viewport'a girerken hafif büyük başlar */

  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('SplitCards: GSAP veya ScrollTrigger bulunamadı.');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    var section = document.querySelector('.section-split_cards');
    if (!section) return;

    var slotA = section.querySelector('.split_cards__slot--a');
    var slotB = section.querySelector('.split_cards__slot--b');
    var slotC = section.querySelector('.split_cards__slot--c');
    if (!slotA || !slotB || !slotC) return;

    var widthA = (section.dataset.splitA || '22') + '%';
    var widthC = (section.dataset.splitC || '22') + '%';

    /* Başlangıç durumu — section henüz görünmeden set edilir */
    gsap.set(slotA, { width: 0, x: -SLIDE_X, opacity: 0, force3D: true });
    gsap.set(slotC, { width: 0, x:  SLIDE_X, opacity: 0, force3D: true });
    gsap.set(slotB, { scale: B_SCALE,                    force3D: true });

    ScrollTrigger.create({
      trigger: section,
      start:   'top 72%',
      once:    true,           /* bir kez çalışır, ScrollTrigger kendini yok eder */
      onEnter: function () {
        var tl = gsap.timeline({
          defaults: { ease: 'power3.out', duration: DURATION, force3D: true },
        });

        tl
          /* A ve C aynı anda girer — width + translate3d eş zamanlı */
          .to(slotA, { width: widthA, x: 0, opacity: 1 },              0)
          .to(slotC, { width: widthC, x: 0, opacity: 1 },              0)
          /* B settle — biraz daha uzun sürer, daha ağır hissettirir */
          .to(slotB, { scale: 1, ease: 'power2.out', duration: DURATION * 1.3 }, 0);
      },
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
