// KURULUM:
// 1. Webflow "Custom Code > Head" kısmına şunu ekle:
//    <script src="https://unpkg.com/@barba/core"></script>
// 2. Webflow'da sayfa içeriğini saran ana div'e şu attribute'ları ekle:
//    data-barba="wrapper"  → en dıştaki wrapper (genellikle body'nin ilk child'ı)
//    data-barba="container" data-barba-namespace="sayfa-adi"  → her sayfanın içeriği

(function () {

  // Overlay elementi yarat
  var overlay = document.createElement('div');
  overlay.style.cssText = [
    'position:fixed',
    'inset:0',
    'background:#fff',      // <-- rengi değiştir
    'z-index:9999',
    'transform:scaleY(0)',
    'transform-origin:bottom',
    'pointer-events:none'
  ].join(';');
  document.body.appendChild(overlay);

  barba.init({
    transitions: [{
      name: 'overlay',

      // Mevcut sayfayı kapat
      leave: function () {
        return gsap.to(overlay, {
          scaleY: 1,
          transformOrigin: 'bottom',
          duration: 0.45,
          ease: 'power3.inOut'
        });
      },

      // Yeni sayfa DOM'a girdi, içeriği hazırla
      beforeEnter: function () {
        // Scroll'u en üste al
        if (window.__lenis) {
          window.__lenis.scrollTo(0, { immediate: true });
        } else {
          window.scrollTo(0, 0);
        }

        // Varsa eski ScrollTrigger'ları temizle
        if (window.ScrollTrigger) {
          ScrollTrigger.getAll().forEach(function (t) { t.kill(); });
        }
      },

      // Overlay'i kaldır
      enter: function () {
        return gsap.to(overlay, {
          scaleY: 0,
          transformOrigin: 'top',
          duration: 0.55,
          ease: 'power3.inOut',
          delay: 0.05
        });
      }
    }]
  });

})();
