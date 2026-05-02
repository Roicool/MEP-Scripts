/**
 * GalleryFlipReverse 1.0.0 — GSAP Flip + ScrollTrigger (#gallery-8).
 * Zoom-out versiyonu: gallery--final state'ten başlar, scroll ile açılır.
 * gallery-flip-1.0.0.js ile aynı DOM yapısı, ters yön.
 */
(function () {
  window.addEventListener('load', function () {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof Flip === 'undefined') {
      console.warn('GalleryFlipReverse: GSAP, ScrollTrigger veya Flip bulunamadı.');
      return;
    }
    gsap.registerPlugin(Flip);

    var flipCtx;
    var overlayEl = document.querySelector('#overlay');

    function createTween() {
      var g = document.querySelector('#gallery-8');
      if (!g) return;
      if (flipCtx) flipCtx.revert();
      g.classList.remove('gallery--final');

      flipCtx = gsap.context(function () {
        var items = g.querySelectorAll('.gallery__item');

        /* Final (kompakt) pozisyonları yakala */
        g.classList.add('gallery--final');
        var finalState = Flip.getState(items);

        /* Initial (açık) pozisyona dön — burası scroll sonu */
        g.classList.remove('gallery--final');

        /* Flip.from: final'dan başla → initial'a aç */
        var flip = Flip.from(finalState, {
          simple:   true,
          ease:     'expoScale(5, 1)',
          duration: 1,
        });

        var content = g.querySelector('.gf__content');

        var tl = gsap.timeline({
          scrollTrigger: {
            trigger: g,
            start:   'center center',
            end:     '+=100%',
            scrub:   true,
            pin:     g.parentNode,
          },
        });

        if (content) {
          tl.to(content, {
            opacity:  0,
            scale:    0.82,
            filter:   'blur(14px)',
            force3D:  true,
            ease:     'power3.in',
            duration: 0.2,
          }, 0);
        }

        tl.add(flip, 0);

        return function () {
          gsap.set(items, { clearProps: 'all' });
          if (content) gsap.set(content, { clearProps: 'all' });
        };
      });
    }

    createTween();

    /* Overlay blur fade — context dışında, pinnedContainer ile */
    if (overlayEl) {
      var g2 = document.querySelector('#gallery-8');
      if (g2) {
        gsap.set(overlayEl, { opacity: 1 });
        gsap.to(overlayEl, {
          opacity: 0,
          ease:    'power2.in',
          scrollTrigger: {
            trigger:          g2,
            start:            'center center',
            end:              'center center+=200',
            scrub:            true,
            pinnedContainer:  g2.parentNode,
          },
        });
      }
    }

    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(createTween, 200);
    });
  });
})();
