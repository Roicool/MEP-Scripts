/**
 * MobCardSwiper 1.1.2 — under 992px .mobilde-swiper (footer).
 * Kaynak: backup-2026-04-04 (CDN ile aynı mantık).
 */
(function () {
  if (window.innerWidth >= 992) return;
  var st = document.createElement('style');
  st.textContent =
    '.mobilde-swiper{overflow:hidden!important;}' +
    '.mob-pg{position:relative!important;height:4px!important;background:rgba(0,0,0,.15)!important;margin-top:16px;border-radius:2px;overflow:hidden;}' +
    '.mob-pg .swiper-pagination-progressbar-fill{background:rgba(0,0,0,.6)!important;border-radius:2px;}';
  document.head.appendChild(st);
  function init() {
    var el = document.querySelector('.mobilde-swiper');
    if (!el) return;
    var pg = document.createElement('div');
    pg.className = 'mob-pg';
    el.parentNode.insertBefore(pg, el.nextSibling);
    new Swiper('.mobilde-swiper', {
      slidesPerView: 1.15,
      spaceBetween: 12,
      centeredSlides: true,
      loop: false,
      grabCursor: true,
      pagination: { el: '.mob-pg', type: 'progressbar' },
    });
  }
  function wait() {
    typeof Swiper !== 'undefined' ? init() : setTimeout(wait, 100);
  }
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', wait)
    : wait();
})();
