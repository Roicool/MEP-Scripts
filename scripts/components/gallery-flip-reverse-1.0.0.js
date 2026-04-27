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
    gsap.registerPlugin(ScrollTrigger, Flip);
    var flipCtx;
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
          simple: true,
          ease: 'expoScale(5, 1)',
        });

        gsap
          .timeline({
            scrollTrigger: {
              trigger: g,
              start:   'center center',
              end:     '+=100%',
              scrub:   true,
              pin:     g.parentNode,
            },
          })
          .add(flip);

        return function () {
          gsap.set(items, { clearProps: 'all' });
        };
      });
    }
    createTween();
    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(createTween, 200);
    });
  });
})();
