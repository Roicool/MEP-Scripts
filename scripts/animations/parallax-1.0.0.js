/**
 * Parallax 1.0.0 — section'a tek attribute, layout bozmayan scroll efekti.
 * Lenis + ScrollTrigger uyumlu. GSAP gerektirir.
 *
 * NASIL ÇALIŞIR:
 *   Section'ın kendisi hareket etmez — layout bozulmaz, nesting sorunu olmaz.
 *   Section içindeki ilk img veya [data-parallax-target] attribute'lu eleman hareket eder.
 *   İkisi de yoksa section arka planına yavaş scale efekti uygulanır.
 *
 * KULLANIM:
 *
 *   1) Section içinde img varsa otomatik bulur:
 *      <section data-parallax>
 *        <img src="bg.jpg" />
 *        <div>İçerik buraya</div>
 *      </section>
 *
 *   2) Hareket etmesini istediğin öğeyi kendin belirt:
 *      <section data-parallax>
 *        <div data-parallax-target>arka plan wrapper</div>
 *        <div>İçerik buraya</div>
 *      </section>
 *
 *   3) Ne img ne target varsa: section'a hafif scale efekti (layout etkilenmez):
 *      <section data-parallax></section>
 *
 *   Hız override (varsayılan 0.25, negatif = ters yön):
 *      <section data-parallax="0.15">...</section>
 */
(function () {
  'use strict';

  var DEFAULT_SPEED = 0.25;
  var SCRUB         = 2;

  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('Parallax: GSAP veya ScrollTrigger bulunamadı.');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    var sections = document.querySelectorAll('[data-parallax]');
    if (!sections.length) return;

    sections.forEach(function (section) {
      var raw    = section.getAttribute('data-parallax');
      var speed  = (raw !== '' && !isNaN(parseFloat(raw))) ? parseFloat(raw) : DEFAULT_SPEED;

      /* Hangi eleman hareket edecek? */
      var target = section.querySelector('[data-parallax-target]')
                || section.querySelector('img');

      var trigger = {
        trigger:             section,
        start:               'top bottom',
        end:                 'bottom top',
        scrub:               SCRUB,
        invalidateOnRefresh: true,
      };

      if (target) {
        /*
         * img veya belirlenmiş target'ı hareket ettir.
         * Section overflow: hidden/clip ile zaten kırpıyor — layout etkilenmez.
         */
        var dist = window.innerHeight * speed;
        gsap.fromTo(target,
          { y: -dist },
          { y: dist, ease: 'none', scrollTrigger: trigger }
        );
      } else {
        /*
         * Fallback: section'a scale efekti.
         * y/x yok — layout'a sıfır etkisi var.
         */
        gsap.fromTo(section,
          { scale: 1 + Math.abs(speed) * 0.4 },
          { scale: 1, ease: 'none', scrollTrigger: trigger }
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
