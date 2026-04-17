(function () {
  window.addEventListener('load', function () {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('Marquee: GSAP veya ScrollTrigger bulunamadı.');
      return;
    }

    var section = document.querySelector('.mq');
    if (!section) return;

    var overflow = section.querySelector('.mq__overflow');
    var track    = section.querySelector('.mq__track');
    var items    = section.querySelectorAll('.mq__item');

    if (!overflow || !track || !items.length) return;

    /* ── MOBILE: Swiper ── */
    if (window.innerWidth < 768) {
      if (typeof Swiper === 'undefined') return;
      overflow.classList.add('swiper');
      track.classList.add('swiper-wrapper');
      items.forEach(function (item) {
        item.classList.add('swiper-slide');
      });
      new Swiper(overflow, {
        slidesPerView: 1,
        spaceBetween: 16,
        grabCursor: true,
        pagination: {
          el: '.mq__pagination',
          clickable: true,
        },
      });
      return;
    }

    /* ── DESKTOP: scroll-linked yatay kayma ── */
    gsap.registerPlugin(ScrollTrigger);

    /* updateActive: rAF ile throttle edilir, her scroll frame'de
       tüm item'lara getBoundingClientRect çağrısı azaltılır */
    var rafId = 0;
    function updateActive() {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(function () {
        var centerX = window.innerWidth / 2;
        var closest = null;
        var minDist = Infinity;
        items.forEach(function (item) {
          var rect = item.getBoundingClientRect();
          var dist = Math.abs(rect.left + rect.width / 2 - centerX);
          if (dist < minDist) { minDist = dist; closest = item; }
        });
        items.forEach(function (item) { item.classList.remove('is-active'); });
        if (closest) closest.classList.add('is-active');
      });
    }

    gsap.fromTo(
      track,
      { x: function () { return items[0] ? -items[0].offsetWidth / 2 : 0; } },
      {
        x: function () { return -(track.scrollWidth / 2 - window.innerWidth / 2); },
        ease: 'none',
        scrollTrigger: {
          trigger:             section,
          start:               'top bottom',
          end:                 'bottom top',
          scrub:               1.5,
          invalidateOnRefresh: true,
          onUpdate:            updateActive,
          onRefresh:           updateActive,
        },
      }
    );
  });
})();
