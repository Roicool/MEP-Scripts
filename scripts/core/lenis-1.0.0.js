/**
 * Lenis 1.0.0 — smooth scroll, GSAP ticker entegrasyonu (homepage footer).
 * Manuel RAF yerine gsap.ticker kullanılıyor — ScrollTrigger uyumu için doğru yöntem.
 */
(function () {
  function run() {
    gsap.registerPlugin(ScrollTrigger);
    var lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 0.7,
      gestureOrientation: 'vertical',
      normalizeWheel: false,
      smoothTouch: false,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    window.__lenis = lenis;
    ScrollTrigger.refresh();
  }

  if (document.readyState === 'complete') {
    run();
  } else {
    window.addEventListener('load', run);
  }
})();
