(function () {
  'use strict';

  var SCRUB = 1;

  function init() {
    var cards = document.querySelectorAll('.ov__card');
    if (!cards.length) return;

    cards.forEach(function (card) {
      var fill = card.querySelector('.ov__bar-fill');
      if (!fill) return;

      gsap.to(fill, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top 80%',
          end: 'bottom 30%',
          scrub: SCRUB,
        }
      });
    });
  }

  window.addEventListener('load', init);
})();
