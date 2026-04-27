/**
 * IC 1.0.0 — .ic: yatay genişleyen kartlar, hover aktivasyon, mouse takipli category görseli.
 * Tablet ve altı (1024px): mouse takip devre dışı.
 */
(function () {
  window.addEventListener('load', function () {
    if (typeof gsap === 'undefined') {
      console.warn('IC: GSAP bulunamadı.');
      return;
    }

    var section = document.querySelector('.ic');
    if (!section) return;

  var cards        = Array.from(section.querySelectorAll('.ic__card'));
  var isMobile     = window.innerWidth < 768;
  var isTablet     = window.innerWidth < 1024;
  var activeProp   = isMobile ? 'height' : 'width';
  var activeSize   = isMobile ? '340px'  : '55%';
  var inactiveSize = ((100 - 55) / (cards.length - 1)).toFixed(2) + '%';

  function setCenterCat(cat) {
    gsap.set(cat, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      xPercent: -50,
      yPercent: -50,
      x: 0,
      y: 0,
      scale: 0.5,
      transformOrigin: 'center center',
    });
  }

  cards.forEach(function (card) {
    var isActive = card.classList.contains('is-active');
    var cat      = card.querySelector('.ic__category');
    var bottom   = card.querySelector('.ic__bottom');
    var overlay  = card.querySelector('.ic__overlay');
    var name     = card.querySelector('.ic__name');

    gsap.set(card,    { [activeProp]: isActive ? activeSize : inactiveSize });
    gsap.set(overlay, { opacity: isActive ? 0 : 1 });
    gsap.set(bottom,  { y: isActive ? 0 : '200%' });
    gsap.set(name,    { opacity: isActive ? 0 : 1 });

    if (isActive) {
      var cardH = card.offsetHeight;
      var btmH  = bottom.offsetHeight + 28;
      gsap.set(cat, {
        position: 'absolute',
        top: cardH - btmH - cat.offsetHeight - 24,
        left: 28,
        xPercent: 0, yPercent: 0, x: 0, y: 0,
        scale: 1,
        transformOrigin: 'left top',
      });
    } else {
      setCenterCat(cat);
      gsap.set(cat, { opacity: 0 });
    }
  });

  function activate(target) {
    cards.forEach(function (card) {
      var isTarget = card === target;
      var cat      = card.querySelector('.ic__category');
      var bottom   = card.querySelector('.ic__bottom');
      var overlay  = card.querySelector('.ic__overlay');
      var name     = card.querySelector('.ic__name');

      card.classList.toggle('is-active', isTarget);

      gsap.to(card,    { [activeProp]: isTarget ? activeSize : inactiveSize, duration: 0.65, ease: 'power3.inOut' });
      gsap.to(overlay, { opacity: isTarget ? 0 : 1, duration: 0.5, ease: 'power2.out' });

      if (isTarget) {
        gsap.to(name, { opacity: 0, duration: 0.2, ease: 'power2.out' });
        setCenterCat(cat);
        gsap.set(cat, { opacity: 1 });

        var cardH = card.offsetHeight;
        var btmH  = bottom.offsetHeight + 28;
        gsap.to(cat, {
          top: cardH - btmH - cat.offsetHeight - 24,
          left: 28,
          xPercent: 0, yPercent: 0,
          scale: 1,
          transformOrigin: 'left top',
          duration: 0.65,
          ease: 'power3.inOut',
        });
        gsap.fromTo(bottom, { y: '200%' }, { y: 0, duration: 0.65, delay: 0.2, ease: 'power3.out' });
      } else {
        gsap.to(name, { opacity: 1, duration: 0.3, delay: 0.15, ease: 'power2.out' });
        gsap.to(cat, {
          scale: 0.5, x: 0, y: 0, opacity: 0,
          duration: 0.35, ease: 'power3.inOut',
          onComplete: function () { setCenterCat(cat); },
        });
        gsap.to(bottom, { y: '200%', duration: 0.35, ease: 'power3.in' });
      }
    });
  }

  cards.forEach(function (card) {
    var cat    = card.querySelector('.ic__category');
    var bottom = card.querySelector('.ic__bottom');

    card.addEventListener('mouseenter', function () { activate(card); });

    card.addEventListener('mousemove', function (e) {
      if (isTablet) return;
      if (!card.classList.contains('is-active')) return;

      var rect  = card.getBoundingClientRect();
      var catW  = cat.offsetWidth;
      var catH  = cat.offsetHeight;
      var btmH  = (bottom ? bottom.offsetHeight : 0) + 40;
      var mouseX = e.clientX - rect.left;
      var mouseY = e.clientY - rect.top;

      var targetX = Math.max(0, Math.min(rect.width - catW, mouseX - catW / 2));
      var targetY = Math.max(0, Math.min(rect.height - btmH - catH, mouseY - catH / 2));

      gsap.to(cat, { left: targetX, top: targetY, xPercent: 0, yPercent: 0, duration: 0.15, ease: 'power2.out' });
    });

    card.addEventListener('mouseleave', function () {
      if (isTablet) return;
      var btmH = (bottom ? bottom.offsetHeight : 0) + 28;
      gsap.to(cat, {
        left: 28,
        top: card.offsetHeight - btmH - cat.offsetHeight - 24,
        duration: 0.5,
        ease: 'power3.out',
      });
    });
  });

  }); // load
})();
