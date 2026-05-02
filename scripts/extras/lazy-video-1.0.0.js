/**
 * lazy-video-1.0.0 — Cloudflare Stream iframe'lerini sayfa yüklendikten sonra enjekte eder.
 * Poster görsel anında gösterilir, iframe src sayfa load'undan sonra atanır.
 * data-lv-src  : gerçek iframe src'si
 * data-lv-root : bu attribute'u taşıyan wrapper (poster + iframe aynı parent'ta)
 */
(function () {
  function init() {
    var wrappers = document.querySelectorAll('[data-lv-root]');
    if (!wrappers.length) return;

    wrappers.forEach(function (wrap) {
      var iframe = wrap.querySelector('iframe[data-lv-src]');
      if (!iframe) return;

      var src = iframe.getAttribute('data-lv-src');
      if (!src) return;

      // Küçük gecikme: tarayıcı boşta olduğunda yükle (varsa rIC, yoksa setTimeout)
      var load = function () {
        iframe.setAttribute('src', src);

        // Poster'ı video oynadığında gizle
        var poster = wrap.querySelector('[data-lv-poster]');
        if (!poster) return;

        // Cloudflare Stream iframe'den "stream-state-playing" mesajı gelince poster'ı kaldır
        var onMsg = function (e) {
          try {
            var data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
            if (data && data.type === 'video-state' && data.data && data.data.state === 'playing') {
              poster.style.opacity = '0';
              window.removeEventListener('message', onMsg);
            }
          } catch (_) {}
        };
        window.addEventListener('message', onMsg);

        // Mesaj gelmezse 3s içinde poster'ı yine de kaldır
        setTimeout(function () {
          poster.style.opacity = '0';
          window.removeEventListener('message', onMsg);
        }, 3000);
      };

      if (window.requestIdleCallback) {
        requestIdleCallback(load, { timeout: 2000 });
      } else {
        setTimeout(load, 100);
      }
    });
  }

  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }
})();
