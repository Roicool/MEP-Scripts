/**
 * Entrance 1.0.0 — Scroll reveal animasyonu
 * GPU composited — transform + opacity only. will-change dinamik.
 *
 * KULLANIM:
 *   <p data-entrance="bottom">Metin</p>
 *   <h2 data-entrance="left" data-entrance-delay="0.15">Başlık</h2>
 *
 * YÖNLER:
 *   left | right | top | bottom
 *
 * OPSİYONEL:
 *   data-entrance-delay  — saniye cinsinden gecikme  (varsayılan: 0)
 *   data-entrance-start  — ScrollTrigger start noktası (varsayılan: "top 88%")
 */
(function () {
  'use strict';

  var DISTANCE = 52;          /* px — kayma mesafesi */
  var DURATION = 0.9;         /* saniye              */
  var EASE     = 'power4.out';
  var START    = 'top 88%';

  function getFrom(dir) {
    switch (dir) {
      case 'left':   return { x: -DISTANCE, y: 0 };
      case 'right':  return { x:  DISTANCE, y: 0 };
      case 'top':    return { x: 0, y: -DISTANCE };
      case 'bottom':
      default:       return { x: 0, y:  DISTANCE };
    }
  }

  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('Entrance: GSAP veya ScrollTrigger bulunamadı.');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    var els = document.querySelectorAll('[data-entrance]');
    if (!els.length) return;

    els.forEach(function (el) {
      var dir   = el.getAttribute('data-entrance') || 'bottom';
      var delay = parseFloat(el.getAttribute('data-entrance-delay') || 0);
      var start = el.getAttribute('data-entrance-start') || START;
      var from  = getFrom(dir);

      gsap.set(el, {
        x:       from.x,
        y:       from.y,
        opacity: 0,
        force3D: true,
      });
      el.style.willChange = 'transform, opacity';

      ScrollTrigger.create({
        trigger:             el,
        start:               start,
        once:                true,
        invalidateOnRefresh: true,
        onEnter: function () {
          gsap.to(el, {
            x:        0,
            y:        0,
            opacity:  1,
            duration: DURATION,
            delay:    delay,
            ease:     EASE,
            force3D:  true,
            overwrite: 'auto',
            onComplete: function () {
              el.style.willChange = 'auto';
              gsap.set(el, { clearProps: 'x,y,force3D' });
            },
          });
        },
      });
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
