/**
 * FillText 1.0.0 — SplitText scroll fill animasyonu (.fill-text) (homepage footer).
 */
(function () {
  window.addEventListener('load', function () {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof SplitText === 'undefined') {
      console.warn('FillText: GSAP, ScrollTrigger veya SplitText bulunamadı.');
      return;
    }
    gsap.registerPlugin(ScrollTrigger, SplitText);
    document.fonts.ready.then(function () {
      document.querySelectorAll('.fill-text').forEach(function (el) {
        var split = SplitText.create(el, { type: 'lines', autoSplit: true });
        gsap.set(split.lines, {
          backgroundImage: 'linear-gradient(to right, #000 50%, #ccc 50%)',
          backgroundSize: '200% 100%',
          backgroundPositionX: '100%',
          webkitBackgroundClip: 'text',
          webkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          display: 'block',
        });
        split.lines.forEach(function (line) {
          gsap.to(line, {
            backgroundPositionX: '0%',
            ease: 'none',
            scrollTrigger: {
              trigger: line,
              start: 'top 85%',
              end: 'top 55%',
              scrub: true,
            },
          });
        });
      });
    });
  });
})();
