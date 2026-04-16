/**
 * GrowSwiper 1.4.3 — grow section tabs, slots, GSAP progress (footer).
 * Kaynak: backup-2026-04-04 (CDN ile aynı mantık).
 */
(function () {
  var c =
    '.grow-slider-bleed{width:100vw!important;max-width:none!important;margin-left:calc(50% - 50vw)!important;overflow:hidden!important;position:relative;transform:translateZ(0)}' +
    '#grow-swiper{overflow:visible!important;width:100%!important}' +
    '#grow-swiper .swiper-wrapper{will-change:auto}' +
    '#grow-swiper .swiper-slide{width:calc((calc((100vw - 520px)/12)*8) + (40px*7))!important;max-width:92vw!important;overflow:hidden!important;position:relative!important}' +
    '@media(max-width:991px){#grow-swiper .swiper-slide{width:88vw!important;max-width:none!important}}' +
    '#grow-fi-progress-fill{width:100%!important;transform-origin:left center;will-change:transform}' +
    '.grow-slide-active{z-index:2}';
  var x = document.createElement('style');
  x.textContent = c;
  document.head.appendChild(x);

  function gv(t) {
    var v = parseInt(t.getAttribute('data-grow-slide'), 10);
    return isNaN(v) ? 0 : v;
  }

  function srt(nodes, rx) {
    return nodes.slice().sort(function (a, b) {
      var ma = rx.exec(a.id),
        mb = rx.exec(b.id);
      if (!ma || !mb) return 0;
      return parseInt(ma[1], 10) - parseInt(mb[1], 10);
    });
  }

  function boot() {
    var R = document.getElementById('grow-section');
    if (!R) return;
    var el = document.getElementById('grow-swiper');
    if (!el) return;
    var bw = el.closest ? el.closest('.max-w-full') : null;
    if (!bw) {
      bw = el;
      while (bw.parentElement && bw.parentElement !== R) bw = bw.parentElement;
    }
    if (bw && bw !== R) bw.classList.add('grow-slider-bleed');

    var tabs = [].slice.call(R.querySelectorAll('.swiper-button'));
    var slots = srt(
      [].slice.call(R.querySelectorAll('[id^=grow-fi-slot-]')),
      /grow-fi-slot-(\d+)/
    );
    var fill = document.getElementById('grow-fi-progress-fill');
    var pb   = document.getElementById('grow-fi-pause');
    var pi   = document.getElementById('grow-fi-pause-icon');
    var pl   = document.getElementById('grow-fi-play-icon');
    var wrapperEl = el.querySelector('.swiper-wrapper');

    var tw = null, sw = null, paused = false;
    /* Orijinal slide'ları Swiper init'ten ÖNCE topla — henüz klon yok */
    var ss = [];
    var ns = 0;

    function kt() {
      if (tw) { tw.kill(); tw = null; }
    }

    function tL() {
      if (!sw || !ns) return 0;
      return Math.min(Math.max(0, sw.realIndex), ns - 1);
    }

    function gL(i) {
      if (!sw || !ns) return;
      sw.slideToLoop(Math.max(0, Math.min(i, ns - 1)));
    }

    function sa(i) {
      if (!ns) return;
      i = Math.max(0, Math.min(i, ns - 1));

      tabs.forEach(function (t) {
        var v = Math.max(0, Math.min(gv(t), ns - 1));
        t.classList.toggle('tab-active', v === i);
      });
      slots.forEach(function (s, j) {
        var active = j === i;
        s.style.willChange = active ? 'width' : 'auto';
        s.classList.toggle('is-active', active);
      });
      ss.forEach(function (s, j) {
        s.classList.toggle('grow-slide-active', j === i);
      });

      if (fill && slots[i]) slots[i].appendChild(fill);
      kt();
      if (fill && typeof gsap !== 'undefined') {
        gsap.set(fill, { scaleX: 0 });
        tw = gsap.to(fill, { scaleX: 1, duration: 6.7, ease: 'none' });
      }
    }

    /* will-change: slide geçişi sırasında aç, bitince kapat */
    function enableWC()  { if (wrapperEl) wrapperEl.style.willChange = 'transform'; }
    function disableWC() { if (wrapperEl) wrapperEl.style.willChange = 'auto'; }

    function init() {
      if (typeof Swiper === 'undefined') {
        setTimeout(init, 50);
        return;
      }

      /* Orijinal slide'ları Swiper init öncesi al — klon henüz yok */
      var allSlides = wrapperEl ? [].slice.call(wrapperEl.children).filter(function (n) {
        return n.classList && n.classList.contains('swiper-slide');
      }) : [];

      /* id'ye göre sırala, yoksa mobil olmayanları al */
      var byId = allSlides.filter(function (s) { return /^grow-slide-\d+$/.test(s.id); });
      ss = byId.length ? byId : allSlides.filter(function (s) { return !s.classList.contains('mobile'); });
      if (!ss.length) ss = allSlides;
      ss.sort(function (p, q) {
        var ip = /^grow-slide-(\d+)$/.exec(p.id),
            iq = /^grow-slide-(\d+)$/.exec(q.id);
        if (!ip || !iq) return 0;
        return parseInt(ip[1], 10) - parseInt(iq[1], 10);
      });
      ns = ss.length;

      sw = new Swiper('#grow-swiper', {
        slidesPerView:       'auto',
        centeredSlides:      true,
        spaceBetween:        24,
        speed:               700,
        loop:                true,
        grabCursor:          true,
        keyboard:            { enabled: true, onlyInViewport: true },
        autoplay:            { delay: 6700, disableOnInteraction: false, pauseOnMouseEnter: true },
        on: {
          slideChangeTransitionStart: enableWC,
          slideChangeTransitionEnd:   disableWC,
          touchStart:                 enableWC,
          touchEnd:                   disableWC,
        },
      });

      sw.on('slideChange', function () { sa(tL()); });

      tabs.forEach(function (t) {
        t.addEventListener('click', function (e) {
          e.preventDefault();
          if (ns) gL(Math.max(0, Math.min(gv(t), ns - 1)));
        });
      });

      slots.forEach(function (s, j) {
        s.addEventListener('click', function () {
          if (j < ns) gL(j);
        });
      });

      if (pb) {
        pb.addEventListener('click', function () {
          paused = !paused;
          pb.classList.toggle('is-paused', paused);
          if (paused) {
            if (sw.autoplay) sw.autoplay.stop();
            kt();
            if (pi) pi.style.display = 'none';
            if (pl) pl.style.display = 'block';
          } else {
            if (sw.autoplay) sw.autoplay.start();
            if (pi) pi.style.display = 'block';
            if (pl) pl.style.display = 'none';
            sa(tL());
          }
        });
      }

      if (pl) pl.style.display = 'none';
      sw.update();

      /* ilk aktif state + autoplay başlat */
      setTimeout(function () {
        sw.update();
        sa(tL());
        if (sw.autoplay && !paused) sw.autoplay.start();
      }, 100);
    }

    init();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', boot)
    : boot();
})();
