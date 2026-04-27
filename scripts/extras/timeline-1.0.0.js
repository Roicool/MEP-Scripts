(function () {
  'use strict';

  window.addEventListener('load', function () {
    if (typeof gsap === 'undefined' || typeof Draggable === 'undefined') return;

    var wrap = document.querySelector('.tl__slider-wrap');
    if (!wrap) return;

    var track = wrap.querySelector('.tl__items');
    if (!track) return;

    gsap.registerPlugin(Draggable);

    var originals = Array.from(track.children);
    if (originals.length === 0) return;

    // Her iki tarafa 1'er set klon ekle — sonsuz görünüm için
    var frag = document.createDocumentFragment();
    originals.forEach(function (el) {
      var clone = el.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      frag.appendChild(clone);
    });
    track.appendChild(frag.cloneNode(true));
    track.insertBefore(frag, track.firstChild);

    // Cycle sonu: her N. slide'a is-cycle-end ekle (line orada kesilir)
    var N = originals.length;
    var allSlides = Array.from(track.children);
    for (var k = N - 1; k < allSlides.length; k += N) {
      if (allSlides[k]) allSlides[k].classList.add('is-cycle-end');
    }

    var setWidth = 0;
    var slideW = 0;
    var center = 0;
    var PEEK_RATIO = parseFloat(wrap.getAttribute('data-peek')) || 1.2;

    function measure() {
      var total = 0;
      for (var i = 0; i < originals.length; i++) {
        total += originals[i].offsetWidth;
      }
      setWidth = total;
      slideW = originals[0] ? originals[0].offsetWidth : 0;
      center = -setWidth + slideW * PEEK_RATIO;
    }

    function wrapX(x) {
      if (!setWidth) return x;
      var shifted = x - center + 0.5 * setWidth;
      shifted = ((shifted % setWidth) + setWidth) % setWidth;
      return shifted - 0.5 * setWidth + center;
    }

    function updateActive() {
      var wrapRect = wrap.getBoundingClientRect();
      var anchor = wrapRect.left + wrapRect.width / 2;
      var slides = track.children;
      for (var i = 0; i < slides.length; i++) {
        var rect = slides[i].getBoundingClientRect();
        // Slide'ın ortası wrap'in ortasını geçtiyse "geçilmiş" sayılır
        var isPassed = (rect.left + rect.width / 2) <= anchor;
        slides[i].classList.toggle('is-active', isPassed);
      }
    }

    measure();
    gsap.set(track, { x: center });
    updateActive();

    Draggable.create(track, {
      type: 'x',
      allowNativeTouchScrolling: false,
      onPress: function () {
        wrap.classList.add('is-dragging');
      },
      onDrag: function () {
        updateActive();
      },
      onRelease: function () {
        wrap.classList.remove('is-dragging');
        var x = parseFloat(gsap.getProperty(track, 'x')) || 0;
        var wrapped = wrapX(x);
        if (wrapped !== x) {
          gsap.set(track, { x: wrapped });
        }
        updateActive();
      },
    });

    var resizeRaf = 0;
    window.addEventListener('resize', function () {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(function () {
        measure();
        var x = parseFloat(gsap.getProperty(track, 'x')) || 0;
        gsap.set(track, { x: wrapX(x) });
        updateActive();
      });
    });
  });
})();
