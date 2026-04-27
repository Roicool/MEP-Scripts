(function () {

  // Overlay elementi yarat ve body'e ekle
  var overlay = document.createElement('div');
  overlay.style.cssText = [
    'position:fixed',
    'inset:0',
    'background:#fff',      // <-- rengi değiştir
    'z-index:9999',
    'transform:scaleY(1)',
    'transform-origin:top',
    'pointer-events:none'
  ].join(';');
  document.body.appendChild(overlay);

  // Sayfa açılınca overlay'i kaldır (enter)
  // pageshow: load + geri tuşu (bfcache) her ikisini de yakalar
  window.addEventListener('pageshow', function (e) {
    gsap.killTweensOf(overlay);
    gsap.set(overlay, { transformOrigin: 'top' });
    gsap.to(overlay, {
      scaleY: 0,
      duration: 0.55,
      ease: 'power3.inOut',
      delay: 0.05
    });
  });

  // Linklere tıklayınca overlay'i indir, sonra navigate et (leave)
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href]');
    if (!link) return;

    var href = link.getAttribute('href');

    // Dış link, anchor, yeni sekme, download — dokunma
    if (
      !href ||
      href.startsWith('http') ||
      href.startsWith('//') ||
      href.startsWith('#') ||
      href.startsWith('mailto') ||
      href.startsWith('tel') ||
      link.target === '_blank' ||
      link.hasAttribute('download') ||
      e.ctrlKey || e.metaKey || e.shiftKey
    ) return;

    e.preventDefault();

    overlay.style.transformOrigin = 'bottom';

    gsap.to(overlay, {
      scaleY: 1,
      duration: 0.45,
      ease: 'power3.inOut',
      onComplete: function () {
        window.location.href = href;
      }
    });
  });

})();
