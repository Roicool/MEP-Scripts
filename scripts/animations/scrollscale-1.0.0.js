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
  var SCRUB          = 1;

  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('ScrollScale: GSAP veya ScrollTrigger bulunamadı.');
      return;
    }

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

      /* Tek timeline + tek ScrollTrigger — section'ın görünür kaldığı tüm scroll
       * aralığını kapsar. Enter ve exit faz oranları gerçek section/viewport
       * yüksekliklerine göre hesaplanır → asla çakışmaz, asla boşluk bırakmaz. */
      var tl = gsap.timeline({
        defaults: { ease: 'none', overwrite: 'auto' },
        scrollTrigger: {
          trigger:             section,
          start:               'top bottom',
          end:                 'bottom top',
          scrub:               SCRUB,
          invalidateOnRefresh: true,
          onLeave:     function () { gsap.set(section, { willChange: 'auto' }); },
          onLeaveBack: function () { gsap.set(section, { willChange: 'auto' }); },
          onEnter:     function () { gsap.set(section, { willChange: wc }); },
          onEnterBack: function () { gsap.set(section, { willChange: wc }); },
        },
      });

      var vh = window.innerHeight;
      var sh = section.offsetHeight;
      var total = sh + vh;

      /* enter = section viewport'a girerken (vh kadar scroll)
       * exit  = section viewport'tan çıkarken (sh kadar scroll)
       * hold  = ortada hareketsiz aralık (negatifse section vh'den kısa demektir) */
      var enterDur = doEnter ? (vh / total) : 0;
      var exitDur  = doExit  ? (sh / total) : 0;
      var holdDur  = 1 - enterDur - exitDur;

      /* Section vh'den kısaysa enter+exit oranları 1'i aşar — sıkıştır,
       * çakışmayı önle. Görsel timing biraz değişir ama zıplama olmaz. */
      if (holdDur < 0 && doEnter && doExit) {
        var totalActive = enterDur + exitDur;
        enterDur = enterDur / totalActive;
        exitDur  = exitDur  / totalActive;
        holdDur  = 0;
      }

      if (doEnter) {
        tl.to(section, { scale: 1, duration: enterDur }, 0);
      }

      if (doExit) {
        tl.to(section, {
          scale:   1 - amount * 0.6,
          opacity: 0.5,
          duration: exitDur,
        }, enterDur + holdDur);
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

  if (document.readyState === 'complete') {
    waitAndInit();
  } else {
    window.addEventListener('load', waitAndInit);
  }

})();
