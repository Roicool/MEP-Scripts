/**
 * ImgReveal 1.0.0 — scroll-scrub reveal, data-img-reveal attribute (site-wide).
 * Lenis uyumlu. Geri dönerken reverse eder.
 */
(function () {
  window.addEventListener('load', function () {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('ImgReveal: GSAP veya ScrollTrigger bulunamadı.');
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    var targets = document.querySelectorAll('[data-img-reveal]');
    if (!targets.length) return;

    targets.forEach(function (el) {
      gsap.fromTo(
        el,
        { autoAlpha: 0, scale: 0.9, y: 40 },
        {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            end: 'top 42%',
            scrub: 1.2,
            invalidateOnRefresh: true,
          },
        }
      );
    });

    ScrollTrigger.refresh();
  });
})();
