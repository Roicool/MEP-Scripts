/**
 * Accordion 1.0.0 — Scroll pinli akordeon liste.
 * Her item scroll ilerledikçe body'si kapanır, bir sonrakinin body'si açılır.
 * Arkaplan rengi item'a göre geçiş yapar. Sol tarafta büyük dekoratif sayaç.
 *
 * DOM YAPISI:
 *   <section class="section-acs">
 *     <span class="acs__counter" aria-hidden="true">1</span>
 *     <div class="acs__items">
 *       <div class="acs__item" data-bg="#ffffff">
 *         <h2 class="acs__title">Başlık</h2>
 *         <div class="acs__body">
 *           <p class="acs__desc">Açıklama metni</p>
 *           <div class="acs__img-wrap">
 *             <img src="..." alt="..." />
 *           </div>
 *         </div>
 *       </div>
 *       <!-- daha fazla .acs__item -->
 *     </div>
 *   </section>
 *
 * CSS GEREKSİNİMLERİ:
 *   .section-acs          → position: relative; overflow: hidden; min-height: 100vh
 *   .acs__item            → display: grid; grid-template-columns: 1fr 1fr
 *   .acs__body            → overflow: hidden (JS set eder — koyma)
 *   .acs__counter         → position: absolute; pointer-events: none; büyük font
 *
 * DATA ATTRİBÜTLERİ:
 *   data-bg               → item aktifken section'ın arkaplan rengi (ör: "#f5e8e0")
 *
 * YÜKLEME SIRASI: lenis → gsap → scrolltrigger → accordion-1.0.0.js
 */
(function () {
  'use strict';

  /* ── Konfig ──────────────────────────────────────────────────────────────── */
  var SCRUB        = true; /* Lenis smoothness'ı kullan, GSAP lag ekleme       */
  var DUR_CLOSE    = 0.5;  /* body kapanma süresi (timeline birimiyle)         */
  var EASE         = 'expo.inOut';
  var PIN_PER_ITEM = 100;  /* her item geçişi için kaç % viewport yüksekliği  */

  /* ── İnit ────────────────────────────────────────────────────────────────── */
  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    var section = document.querySelector('.section-acs');
    if (!section) return;

    var items = [].slice.call(section.querySelectorAll('.acs__item'));
    if (items.length < 2) return;

    var counter = section.querySelector('.acs__counter');
    var totalItems = items.length;

    /* body, title ve num elemanlarını al */
    var bodies = items.map(function (item) { return item.querySelector('.acs__body'); });
    var titles = items.map(function (item) { return item.querySelector('.acs__title'); });
    var nums   = items.map(function (item) { return item.querySelector('.acs__num'); });

    /* Yükseklikleri DOM tam yüklendikten sonra ölç */
    var naturalHeights = bodies.map(function (body) {
      return body ? body.offsetHeight : 0;
    });
    var numHeights = nums.map(function (num) {
      return num ? num.offsetHeight : 0;
    });

    /* ── Başlangıç durumu — hepsi açık ────────────────────────────────────── */
    bodies.forEach(function (body) {
      if (!body) return;
      gsap.set(body, { overflow: 'hidden' });
    });

    nums.forEach(function (num) {
      if (!num) return;
      gsap.set(num, { overflow: 'hidden', display: 'block' });
    });

    var firstBg = items[0].getAttribute('data-bg');
    if (firstBg) gsap.set(section, { backgroundColor: firstBg });

    /* ── Ana ScrollTrigger timeline ────────────────────────────────────────── */
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger:             section,
        start:               'top top',
        end:                 '+=' + ((totalItems - 1) * PIN_PER_ITEM) + '%',
        pin:                 true,
        scrub:               SCRUB,
        anticipatePin:       1,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          if (!counter) return;
          var idx = Math.min(Math.floor(self.progress * totalItems), totalItems - 1);
          counter.textContent = idx + 1;
        }
      }
    });

    /* Her geçiş: mevcut item kapanır, sonraki zaten açık — en son açık kalır */
    for (var i = 0; i < totalItems - 1; i++) {
      var segStart = i;

      /* 1. Mevcut body kapat */
      if (bodies[i]) {
        bodies[i].style.willChange = 'height, opacity';
        tl.to(bodies[i], {
          height:   0,
          opacity:  0,
          duration: DUR_CLOSE,
          ease:     EASE,
          onComplete: (function (b) { return function () { b.style.willChange = 'auto'; }; })(bodies[i])
        }, segStart);
      }

      /* 2. Mevcut num kapat */
      if (nums[i]) {
        nums[i].style.willChange = 'height, opacity';
        tl.to(nums[i], {
          height:   0,
          opacity:  0,
          duration: DUR_CLOSE,
          ease:     EASE,
          onComplete: (function (n) { return function () { n.style.willChange = 'auto'; }; })(nums[i])
        }, segStart);
      }

      /* 3. Mevcut title soldur */
      if (titles[i]) {
        tl.to(titles[i], {
          opacity:  0.45,
          duration: DUR_CLOSE,
          ease:     EASE
        }, segStart);
      }

    }
  }

  /* ── Lenis Bekleme ───────────────────────────────────────────────────────── */
  function waitAndInit() {
    if (window.__lenis) { init(); return; }
    var attempts = 0;
    var timer = setInterval(function () {
      attempts++;
      if (window.__lenis || attempts >= 20) { clearInterval(timer); init(); }
    }, 100);
  }

  window.addEventListener('load', waitAndInit);
})();
