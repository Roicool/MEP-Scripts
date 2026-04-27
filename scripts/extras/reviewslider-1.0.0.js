(function () {
  'use strict';

  window.addEventListener('load', function () {
    var titleWidths = [];
    var quoteEl = document.querySelector('.rv__quote');
    var FADE_MS = 300;

    function calcTitleWidths() {
      var slides = document.querySelectorAll('.rv__titles .swiper-slide');
      titleWidths = Array.from(slides).map(function (slide) {
        var el = slide.querySelector('.rv__title');
        return el ? el.offsetWidth : 0;
      });
    }

    function setNextWidth(swiper) {
      var nextIndex = swiper.activeIndex + 1;
      if (titleWidths[nextIndex] !== undefined) {
        document.documentElement.style.setProperty(
          '--rv-next-width',
          titleWidths[nextIndex] + 'px'
        );
      }
    }

    function setQuote(swiper) {
      var activeSlide = swiper.slides[swiper.activeIndex];
      var quote = activeSlide ? activeSlide.getAttribute('data-quote') : '';
      if (!quoteEl || !quote) return;

      quoteEl.style.opacity = '0';
      setTimeout(function () {
        quoteEl.textContent = quote;
        quoteEl.style.opacity = '1';
      }, FADE_MS);
    }

    function init() {
      calcTitleWidths();

      var swiper = new Swiper('.rv__titles', {
        slidesPerView: 3,
        centeredSlides: true,
        effect: 'creative',
        speed: 600,
        observer: true,
        observeParents: true,
        watchSlidesProgress: true,
        creativeEffect: {
          prev: {
            translate: ['-100%', 0, 0],
          },
          next: {
            translate: ['calc(200% - var(--rv-next-width))', 0, 0],
          },
          limitProgress: 2,
        },
        navigation: {
          nextEl: '.rv__btn--next',
          prevEl: '.rv__btn--prev',
        },
        pagination: {
          el: '.rv__pagination',
          type: 'custom',
          renderCustom: function (swiper, current) {
            var n = current < 10 ? '0' + current : current;
            return '<span class="rv__current">// ' + n + '</span>';
          },
        },
        breakpoints: {
          0: {
            slidesPerView: 1,
            centeredSlides: false,
            creativeEffect: {
              prev: { translate: ['-100%', 0, 0] },
              next: { translate: ['calc(100% - var(--rv-next-width))', 0, 0] },
            },
          },
          480: {
            slidesPerView: 1,
            centeredSlides: false,
            creativeEffect: {
              prev: { translate: ['-100%', 0, 0] },
              next: { translate: ['calc(100% - var(--rv-next-width))', 0, 0] },
            },
          },
          991: {
            slidesPerView: 3,
            centeredSlides: true,
            creativeEffect: {
              prev: { translate: ['-100%', 0, 0] },
              next: { translate: ['calc(200% - var(--rv-next-width))', 0, 0] },
            },
          },
        },
        on: {
          init: function (swiper) {
            setNextWidth(swiper);
            setQuote(swiper);
          },
          slideChangeTransitionStart: function (swiper) {
            setNextWidth(swiper);
            setQuote(swiper);
          },
        },
      });
    }

    init();
  });
})();
