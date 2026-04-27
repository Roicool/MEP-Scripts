(function () {
  function run() {
    if (typeof Swiper === 'undefined') return;

    new Swiper('.cc-swiper', {
      slidesPerView: 2,
      spaceBetween: 16,
      grabCursor: true,
      breakpoints: {
        768: { slidesPerView: 3, spaceBetween: 16 },
        992: { slidesPerView: 4, spaceBetween: 16 },
      },
      pagination: {
        el: '.cc-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.cc-next',
        prevEl: '.cc-prev',
      },
    });
  }

  if (document.readyState === 'complete') {
    run();
  } else {
    window.addEventListener('load', run);
  }
})();
