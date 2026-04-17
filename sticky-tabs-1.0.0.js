/**
 * StickyTabs 1.0.0 — Scroll pinli sekmeli içerik.
 * Her sekme scroll ilerledikçe fill bar dolar.
 * Resim + içerik geçişi: clip-path + translateY (height-wipe efekti).
 * GPU composited — transform + clip-path only.
 *
 * DOM YAPISI:
 *   <section class="section-st">
 *     <div class="st__left">
 *       <div class="st__contents">
 *         <div class="st__content">  ← her sekme için (heading, desc, cta)
 *       <div class="st__items">
 *         <div class="st__item">     ← her sekme için
 *           <span class="st__item-label">Başlık</span>
 *           <div class="st__item-track">
 *             <div class="st__item-fill"></div>
 *           </div>
 *     <div class="st__right">
 *       <div class="st__slides">
 *         <div class="st__slide">   ← her sekme için (img içerir)
 *
 * CSS GEREKSİNİMLERİ:
 *   .section-st          → position: relative
 *   .st__slides          → position: relative; overflow: hidden
 *   .st__slide           → position: absolute; inset: 0
 *   .st__contents        → position: relative; overflow: hidden
 *   .st__content         → position: absolute; inset: 0
 *   .st__item            → opacity: 0.3; transition: opacity 0.3s
 *   .st__item.is-active  → opacity: 1
 *   .st__item-fill       → transform-origin: left center; height: 2px; background: currentColor
 */
(function () {
  'use strict';

  var DUR_SLIDE = 0.7;   /* resim + içerik geçiş süresi */
  var EASE_OUT  = 'power3.inOut';
  var PIN_PAD   = 1;     /* her sekme için kaç vh scroll (toplam: n * PIN_PAD * vh) */

  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('StickyTabs: GSAP veya ScrollTrigger bulunamadı.');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    var section  = document.querySelector('.section-st');
    if (!section) return;

    var items    = Array.from(section.querySelectorAll('.st__item'));
    var fills    = Array.from(section.querySelectorAll('.st__item-fill'));
    var slides   = Array.from(section.querySelectorAll('.st__slide'));
    var contents = Array.from(section.querySelectorAll('.st__content'));

    var n = items.length;
    if (!n) return;

    var current = 0;
    var animating = false;

    /* ── Init state ─────────────────────────────────────── */
    gsap.set(fills, { scaleX: 0, transformOrigin: 'left center' });

    gsap.set(slides,   { clipPath: 'inset(100% 0% 0% 0%)', y: 30, force3D: true });
    gsap.set(contents, { autoAlpha: 0, y: 20, force3D: true });

    if (slides[0]) {
      gsap.set(slides[0],   { clipPath: 'inset(0% 0% 0% 0%)', y: 0 });
      slides[0].classList.add('is-active');
    }
    if (contents[0]) {
      gsap.set(contents[0], { autoAlpha: 1, y: 0 });
      contents[0].classList.add('is-active');
    }
    if (items[0]) items[0].classList.add('is-active');

    /* ── Geçiş animasyonu ───────────────────────────────── */
    function goTo(index) {
      if (index === current || index < 0 || index >= n) return;

      var prev = current;
      current  = index;

      /* item aktif class */
      items.forEach(function (item, i) {
        item.classList.toggle('is-active', i === index);
      });

      /* fill: geçmiş = tam, gelecek = boş */
      fills.forEach(function (fill, i) {
        if (i < index)  gsap.set(fill, { scaleX: 1 });
        if (i > index)  gsap.set(fill, { scaleX: 0 });
      });

      /* ── Resim geçişi — height-wipe ── */
      var prevSlide = slides[prev];
      var nextSlide = slides[index];

      if (prevSlide) {
        prevSlide.style.willChange = 'clip-path, transform';
        gsap.to(prevSlide, {
          clipPath: 'inset(100% 0% 0% 0%)',
          y:        -30,
          duration: DUR_SLIDE * 0.85,
          ease:     EASE_OUT,
          force3D:  true,
          overwrite: 'auto',
          onComplete: function () {
            prevSlide.classList.remove('is-active');
            prevSlide.style.willChange = 'auto';
          },
        });
      }

      if (nextSlide) {
        nextSlide.style.willChange = 'clip-path, transform';
        gsap.fromTo(nextSlide,
          { clipPath: 'inset(100% 0% 0% 0%)', y: 30 },
          {
            clipPath:  'inset(0% 0% 0% 0%)',
            y:         0,
            duration:  DUR_SLIDE,
            ease:      EASE_OUT,
            force3D:   true,
            overwrite: 'auto',
            onStart:    function () { nextSlide.classList.add('is-active'); },
            onComplete: function () { nextSlide.style.willChange = 'auto'; },
          }
        );
      }

      /* ── İçerik geçişi ── */
      var prevCnt = contents[prev];
      var nextCnt = contents[index];

      if (prevCnt) {
        prevCnt.style.willChange = 'opacity, transform';
        gsap.to(prevCnt, {
          autoAlpha: 0,
          y:         -20,
          duration:  DUR_SLIDE * 0.6,
          ease:      'power2.in',
          force3D:   true,
          overwrite: 'auto',
          onComplete: function () {
            prevCnt.classList.remove('is-active');
            prevCnt.style.willChange = 'auto';
            gsap.set(prevCnt, { y: 20 });
          },
        });
      }

      if (nextCnt) {
        nextCnt.style.willChange = 'opacity, transform';
        gsap.fromTo(nextCnt,
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1,
            y:         0,
            duration:  DUR_SLIDE,
            delay:     DUR_SLIDE * 0.2,
            ease:      EASE_OUT,
            force3D:   true,
            overwrite: 'auto',
            onStart:    function () { nextCnt.classList.add('is-active'); },
            onComplete: function () { nextCnt.style.willChange = 'auto'; },
          }
        );
      }
    }

    /* ── ScrollTrigger pin ──────────────────────────────── */
    ScrollTrigger.create({
      trigger:             section,
      start:               'top top',
      end:                 '+=' + (window.innerHeight * n * PIN_PAD),
      pin:                 true,
      invalidateOnRefresh: true,
      onUpdate: function (self) {
        var p    = self.progress;               /* 0 → 1 */
        var step = 1 / n;
        var idx  = Math.min(Math.floor(p / step), n - 1);
        var localP = (p - idx * step) / step;  /* 0 → 1 içinde sekme */

        if (idx !== current) goTo(idx);

        /* fill: sadece aktif sekmeyi güncelle */
        if (fills[current]) {
          fills[current].style.willChange = 'transform';
          gsap.set(fills[current], {
            scaleX:          localP,
            transformOrigin: 'left center',
          });
        }
      },
    });
  }

  function waitAndInit() {
    if (window.__lenis) {
      init();
    } else {
      var attempts = 0;
      var timer = setInterval(function () {
        attempts++;
        if (window.__lenis || attempts >= 20) {
          clearInterval(timer);
          init();
        }
      }, 100);
    }
  }

  window.addEventListener('load', waitAndInit);
})();
