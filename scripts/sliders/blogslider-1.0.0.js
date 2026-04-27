(function () {
  var AUTOPLAY_MS = 8000;

  function boot() {
    var section = document.getElementById('blog-slider-section');
    if (!section) return;
    var swiperEl = document.getElementById('blog-swiper');
    if (!swiperEl) return;

    section.style.setProperty('--bs-autoplay', AUTOPLAY_MS + 'ms');

    var pagEl = document.getElementById('blog-swiper-pagination');
    var wrapperEl = swiperEl.querySelector('.swiper-wrapper');
    var sw = null;

    var totalSlides = wrapperEl
      ? [].slice.call(wrapperEl.children).filter(function (el) {
          return el.classList.contains('swiper-slide');
        }).length
      : 0;

    function buildPagination() {
      if (!pagEl || !totalSlides) return;
      pagEl.innerHTML = '';
      pagEl.classList.add('bs-controls');

      var dotsWrap = document.createElement('div');
      dotsWrap.className = 'bs-dots';

      for (var i = 0; i < totalSlides; i++) {
        (function (idx) {
          var dot = document.createElement('span');
          dot.className = 'bs-dot';
          dot.addEventListener('click', function () {
            if (sw) sw.slideTo(idx);
          });
          dotsWrap.appendChild(dot);
        })(i);
      }

      var prevBtn = document.createElement('button');
      prevBtn.className = 'bs-arrow bs-arrow-prev';
      prevBtn.setAttribute('aria-label', 'Previous slide');
      prevBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

      var nextBtn = document.createElement('button');
      nextBtn.className = 'bs-arrow bs-arrow-next';
      nextBtn.setAttribute('aria-label', 'Next slide');
      nextBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

      var arrowWrap = document.createElement('div');
      arrowWrap.className = 'bs-arrows';
      arrowWrap.appendChild(prevBtn);
      arrowWrap.appendChild(nextBtn);

      pagEl.appendChild(dotsWrap);
      pagEl.appendChild(arrowWrap);

      prevBtn.addEventListener('click', function () { if (sw) sw.slidePrev(); });
      nextBtn.addEventListener('click', function () { if (sw) sw.slideNext(); });
    }

    function updatePagination(idx) {
      if (!pagEl) return;
      var dots = pagEl.querySelectorAll('.bs-dot');
      for (var i = 0; i < dots.length; i++) {
        dots[i].classList.remove('is-active');
      }
      if (dots[idx]) {
        void dots[idx].offsetWidth; // reflow — animasyonu sıfırla
        dots[idx].classList.add('is-active');
      }
      var prevBtn = pagEl.querySelector('.bs-arrow-prev');
      var nextBtn = pagEl.querySelector('.bs-arrow-next');
      if (prevBtn) prevBtn.disabled = idx === 0;
      if (nextBtn) nextBtn.disabled = idx === totalSlides - 1;
    }

    function init() {
      if (typeof Swiper === 'undefined') { setTimeout(init, 50); return; }

      function updateOpacity(idx) {
        var slides = swiperEl.querySelectorAll('.swiper-slide');
        for (var i = 0; i < slides.length; i++) {
          slides[i].style.opacity = i === idx ? '1' : '0.5';
        }
      }

      sw = new Swiper('#blog-swiper', {
        slidesPerView: 'auto',
        centeredSlides: false,
        spaceBetween: 24,
        speed: 700,
        loop: false,
        grabCursor: true,
        keyboard: { enabled: true, onlyInViewport: true },
        autoplay: { delay: AUTOPLAY_MS, disableOnInteraction: false, pauseOnMouseEnter: true },
        on: {
          slideChangeTransitionStart: function () {
            updateOpacity(sw.activeIndex);
            updatePagination(sw.activeIndex);
          },
        },
      });

      // transition init'te bir kere set edilir, sonra sadece opacity değişir
      var allSlides = swiperEl.querySelectorAll('.swiper-slide');
      for (var i = 0; i < allSlides.length; i++) {
        allSlides[i].style.transition = 'opacity 700ms ease';
        allSlides[i].style.opacity = i === 0 ? '1' : '0.5';
      }

      buildPagination();
      updatePagination(0);
    }

    init();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', boot)
    : boot();
})();
