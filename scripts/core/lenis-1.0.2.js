<script>
  document.getElementById('current-year').textContent = new Date().getFullYear();
</script>

<script>
/**
 * Lenis 1.0.1 — smooth scroll, GSAP ticker entegrasyonu.
 * Finsweet CMS Filter renderitems ile otomatik resize.
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

    var refreshTimer;
    window.__lenisRefresh = function () {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(function () {
        lenis.resize();
        ScrollTrigger.refresh();
      }, 200);
    };

    // Finsweet CMS Filter — filtre sonrası resize
    window.fsAttributes = window.fsAttributes || [];
    window.fsAttributes.push(['cmsfilter', function (filterInstances) {
      filterInstances.forEach(function (instance) {
        instance.on('renderitems', function () {
          window.__lenisRefresh();
        });
      });
    }]);

    // Finsweet CMS Load — pagination / load-more / infinite scroll sonrası resize
    window.fsAttributes.push(['cmsload', function (loadInstances) {
      loadInstances.forEach(function (instance) {
        instance.on('renderitems', function () {
          window.__lenisRefresh();
        });
      });
    }]);

    // Emniyet ağı: body yüksekliği değişirse (her tür dinamik içerik) refresh et
    if (typeof ResizeObserver !== 'undefined') {
      var lastHeight = document.body.scrollHeight;
      var ro = new ResizeObserver(function () {
        var h = document.body.scrollHeight;
        if (h !== lastHeight) {
          lastHeight = h;
          window.__lenisRefresh();
        }
      });
      ro.observe(document.body);
    }

    setTimeout(function () { ScrollTrigger.refresh(); }, 500);
    setTimeout(function () { lenis.resize(); ScrollTrigger.refresh(); }, 1500);
  }

  if (document.readyState === 'complete') {
    run();
  } else {
    window.addEventListener('load', run);
  }
})();
</script>
