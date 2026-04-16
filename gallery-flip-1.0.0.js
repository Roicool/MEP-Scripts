/**
 * GalleryFlip — GSAP Flip + ScrollTrigger (#gallery-8).
 * Webflow App: GalleryFlip 1.3.0 (load + resize debounce 200ms); repoyla aynı kaynak, View script’te okunaklı gövde.
 */
(function () {
  window.addEventListener('load', function () {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof Flip === 'undefined') {
      console.warn('GalleryFlip: GSAP, ScrollTrigger veya Flip bulunamadı.');
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
        g.classList.add('gallery--final');
        var state = Flip.getState(items);
        g.classList.remove('gallery--final');
        var flip = Flip.to(state, { simple: true, ease: 'expoScale(1, 5)' });
        gsap
          .timeline({
            scrollTrigger: {
              trigger: g,
              start: 'center center',
              end: '+=100%',
              scrub: true,
              pin: g.parentNode,
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
