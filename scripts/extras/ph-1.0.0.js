/**
 * PH 1.0.0 — Productions Highlights: hover ile sağ panelde görsel değişimi.
 * Mobil (< 992px): sağ panel gizli, sadece liste gösterilir.
 * DOM: .section-ph > .ph__left (.ph__list > .ph__item[]) + .ph__right (.ph__preview — JS tarafından inşa edilir)
 */
(function () {
  'use strict';

  var BP_DESKTOP  = 992;
  var DUR_IN      = 0.55;
  var DUR_OUT     = 0.4;
  var EASE_IN     = 'power3.out';
  var EASE_OUT    = 'power2.in';
  var Y_OFFSET    = 18;         // gelen görselin başlangıç translateY'i

  function init() {
    if (typeof gsap === 'undefined') {
      console.warn('PH: GSAP bulunamadı.');
      return;
    }

    var section = document.querySelector('.section-ph');
    if (!section) return;

    var items      = section.querySelectorAll('.ph__item');
    var previewWrap = section.querySelector('.ph__preview');

    if (!items.length || !previewWrap) return;

    // Her item'daki .ph__item-img src'sini alıp sağ paneli inşa et
    var previews = [];
    for (var i = 0; i < items.length; i++) {
      var srcEl = items[i].querySelector('.ph__item-img');
      var div   = document.createElement('div');
      div.className = 'ph__preview-img';

      if (srcEl) {
        var img = document.createElement('img');
        img.src = srcEl.src;
        img.alt = srcEl.alt || '';
        img.draggable = false;
        div.appendChild(img);
      }

      previewWrap.appendChild(div);
      previews.push(div);
    }

    // Başlangıç: hiçbir görsel görünmez
    var activeIndex = -1;

    // Hover geçişi
    items.forEach(function (item, i) {
      item.addEventListener('mouseenter', function () {
        if (window.innerWidth < BP_DESKTOP) return;
        if (i === activeIndex) return;

        // Eskiyi kapat (varsa)
        if (activeIndex !== -1) {
          gsap.to(previews[activeIndex], {
            opacity: 0,
            y: -Y_OFFSET * 0.5,
            duration: DUR_OUT,
            ease: EASE_OUT,
            overwrite: 'auto',
          });
          items[activeIndex].classList.remove('is-active');
        }

        // Yeniyi aç
        gsap.fromTo(
          previews[i],
          { opacity: 0, y: Y_OFFSET },
          { opacity: 1, y: 0, duration: DUR_IN, ease: EASE_IN, overwrite: 'auto' }
        );
        items[i].classList.add('is-active');

        activeIndex = i;
      });
    });

    // Section'dan çıkınca aktif görseli gizle
    section.addEventListener('mouseleave', function () {
      if (activeIndex === -1) return;
      gsap.to(previews[activeIndex], {
        opacity: 0,
        y: -Y_OFFSET * 0.5,
        duration: DUR_OUT,
        ease: EASE_OUT,
        overwrite: 'auto',
      });
      items[activeIndex].classList.remove('is-active');
      activeIndex = -1;
    });
  }

  window.addEventListener('load', init);
})();
