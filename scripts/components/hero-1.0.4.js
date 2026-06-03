/**
 * Hero 1.0.3 — Pinned 2-scene hero animasyonu (1.0.0 tabanı, değişmedi).
 * S1: başlık / açıklama / butonlar / bar / marquee
 * S2: stats (sayaç) / case swiper / bar yeni pozisyon / tagline
 * Pin 250vh. Lenis + ScrollTrigger uyumlu. GSAP + Swiper gerektirir.
 *
 * YENİ (1.0.3 — 1.0.0'a göre TEK fark): Arka plan videoları crossfade ile döner.
 *   HTML: arka plan alanına 2+ <video> koy, her birine data-hero-video ver.
 *     <div class="hero__bg">
 *       <video data-hero-video src="..." muted loop playsinline></video>
 *       <video data-hero-video src="..." muted loop playsinline></video>
 *       <video data-hero-video src="..." muted loop playsinline></video>
 *     </div>
 *   CSS: video'lar üst üste yığılmalı
 *     .hero__bg { position: relative; }
 *     .hero__bg video { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
 *   Her HERO_VIDEO_SWITCH_MS (20sn) bir sonraki videoya yumuşak geçer.
 *   Performans: aynı anda SADECE aktif video oynar; diğerleri pause — mobilde kasmaz.
 */
(function () {
  'use strict';

  var PIN_LENGTH           = 2.5;
  var SCRUB                = 2.5;
  var BP_DESKTOP           = 992;
  var HERO_VIDEO_SWITCH_MS = 20000;  // videolar 20sn'de bir değişir

  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('Hero: GSAP veya ScrollTrigger bulunamadı.');
      return;
    }

    var section = document.querySelector('.section-hero');
    if (!section) return;

    /* video crossfade — mobil dahil her zaman çalışır */
    initVideoBg(section, window.innerWidth < BP_DESKTOP);

    /* 1.0.0 davranışı: mobilde pin animasyonu yok */
    if (window.innerWidth < BP_DESKTOP) return;

    var stage     = section.querySelector('.hero__stage');
    var heading   = section.querySelector('.hero__heading');
    var s1Left    = section.querySelector('.hero__s1-left');
    var s1Right   = section.querySelector('.hero__s1-right');
    var bar       = section.querySelector('.hero__bar');
    var barAnchor = section.querySelector('.hero__bar-anchor');
    var marquee   = section.querySelector('.hero__marquee');
    var caseEl    = section.querySelector('.hero__case');
    var s2Right   = section.querySelector('.hero__s2-right');
    var stats     = section.querySelectorAll('.hero__stat');
    var tagline   = section.querySelector('.hero__tagline');
    var statVals  = section.querySelectorAll('.hero__stat-val');

    if (!stage || !s1Left || !bar || !barAnchor) return;

    /* CSS'deki opacity:0 yerine JS ile gizle — getBoundingClientRect doğru çalışsın */
    gsap.set(caseEl,  { autoAlpha: 0, x: -50, yPercent: -50 });
    gsap.set(s2Right, { autoAlpha: 0, yPercent: -50 });
    gsap.set(stats,   { autoAlpha: 0, y: 50 });
    gsap.set(tagline, { autoAlpha: 0, y: 30 });

    /* bar layer'ını baştan aç — 3 fazlı transform arası repaint önler */
    gsap.set(bar, { willChange: 'transform' });

    /* ---------- bar delta hesaplama ----------
     * Anchor: getBoundingClientRect (parent transform'larını dahil eder, görsel poz).
     * Bar: rect - kendi GSAP x/y (kendi transform'unu çıkarıp natural pozu bul).
     * Böylece ölçüm hangi anda yapılırsa yapılsın doğru delta çıkar.
     */
    function getBarDelta() {
      var anchorRect = barAnchor.getBoundingClientRect();
      var barRect    = bar.getBoundingClientRect();
      var bx = parseFloat(gsap.getProperty(bar, 'x')) || 0;
      var by = parseFloat(gsap.getProperty(bar, 'y')) || 0;
      return {
        x: anchorRect.left - (barRect.left - bx),
        y: anchorRect.top  - (barRect.top  - by),
      };
    }

    /* ---------- bar delta — bir kez hesapla, resize'da güncelle ---------- */
    var barDx = 0;
    var barDy = 0;

    function updateDelta() {
      var d = getBarDelta();
      barDx = d.x;
      barDy = d.y;
    }
    updateDelta();

    /* ---------- auto-complete — 3 sn scroll olmazsa animasyonu tamamla ---------- */
    var completeTimer  = null;
    var lastScrollTime = 0;

    function onScrollUpdate(self) {
      var now = Date.now();
      lastScrollTime = now;
      var p = self.progress;
      if (p <= 0.02 || p >= 0.98) {
        clearTimeout(completeTimer);
        return;
      }
      clearTimeout(completeTimer);
      var end = self.end;
      completeTimer = setTimeout(function () {
        /* sadece scroll durmuşsa tamamla */
        if (Date.now() - lastScrollTime < 2900) return;
        var lenis = window.__lenis;
        if (lenis) {
          lenis.scrollTo(end, { duration: 1.2, easing: function (t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; } });
        }
      }, 3000);
    }

    var tl = gsap.timeline({
      defaults: { ease: 'power3.out', force3D: true },
      scrollTrigger: {
        trigger:             section,
        start:               'top top',
        end:                 function () { return '+=' + (window.innerHeight * PIN_LENGTH); },
        scrub:               SCRUB,
        pin:                 stage,
        pinSpacing:          true,
        anticipatePin:       1,
        invalidateOnRefresh: true,
        onRefresh: function () {
          updateDelta();
          s2Right.style.pointerEvents = '';
          caseEl.style.pointerEvents  = '';
        },
        onUpdate: onScrollUpdate,
      },
    });

    /* --- S1 EXIT --- */
    tl
      /* marquee ilk solar */
      .to(marquee,  { autoAlpha: 0, duration: 0.25 }, 0)

      /* heading ve s1-left aynı anda yukarı */
      .to(heading,  { y: -80, autoAlpha: 0, duration: 0.35, ease: 'power2.in' }, 0.05)
      .to(s1Left,   { y: -80, autoAlpha: 0, duration: 0.35, ease: 'power2.in' }, 0.10)
      .to(s1Right,  { y: -60, autoAlpha: 0, duration: 0.30, ease: 'power2.in' }, 0.12)

      /* bar: soldan yavaşça çöker */
      .to(bar, {
        scaleX:          0,
        transformOrigin: 'left center',
        ease:            'power3.inOut',
        duration:        0.40,
      }, 0.20)

      /* bar: S2 pozisyonuna geçer, sağdan yavaşça açılır */
      .set(bar, {
        x: function () { return barDx; },
        y: function () { return barDy; },
      }, 0.60)
      .to(bar, {
        scaleX:          1,
        transformOrigin: 'right center',
        ease:            'power3.out',
        duration:        0.40,
      }, 0.61)

    /* --- S2 ENTER --- */
      /* s2-right önce görünür, içindeki elementler sırayla gelir */
      .fromTo(s2Right,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.10, onComplete: function () { s2Right.style.pointerEvents = 'auto'; } },
        0.62
      )
      .fromTo(stats,
        { y: 40, autoAlpha: 0 },
        { y: 0,  autoAlpha: 1, duration: 0.40, stagger: 0.10, ease: 'power2.out' },
        0.65
      )
      .fromTo(tagline,
        { y: 25, autoAlpha: 0 },
        { y: 0,  autoAlpha: 1, duration: 0.35, ease: 'power2.out' },
        0.82
      )

      /* case card en son soldan gelir */
      .fromTo(caseEl,
        { x: -60, autoAlpha: 0 },
        { x: 0,   autoAlpha: 1, duration: 0.40, ease: 'power2.out', onComplete: function () { caseEl.style.pointerEvents = 'auto'; } },
        0.68
      );

    /* ---------- stats sayaç (bir kez, geri dönmez) ---------- */
    if (statVals.length) {
      var counted = false;
      ScrollTrigger.create({
        trigger: section,
        start:   'top -55%',
        once:    true,
        onEnter: function () {
          if (counted) return;
          counted = true;
          statVals.forEach(function (el) {
            var target = parseInt(el.dataset.count, 10) || 0;
            /* min-width kilitle — textContent değişince layout thrash olmasın */
            el.style.minWidth = el.offsetWidth + 'px';
            var proxy = { val: 0 };
            gsap.to(proxy, {
              val:      target,
              duration: 1.4,
              ease:     'power2.out',
              onUpdate:  function () { el.textContent = Math.round(proxy.val).toLocaleString(); },
              onComplete: function () { el.textContent = target.toLocaleString(); },
            });
          });
        },
      });
    }

    /* ---------- marquee klonu (CMS tek set verir, JS ikincisini oluşturur) ---------- */
    var marqueeInner = section.querySelector('.hero__marquee-inner');
    var marqueeSet   = section.querySelector('.hero__marquee-set');
    if (marqueeInner && marqueeSet) {
      var clone = marqueeSet.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      marqueeInner.appendChild(clone);
    }

    /* ---------- case swiper ---------- */
    if (typeof Swiper !== 'undefined') {
      var swiperEl = section.querySelector('.hero__swiper');
      if (swiperEl) {
        new Swiper(swiperEl, {
          slidesPerView: 1,
          loop:          true,
          speed:         700,
          grabCursor:    true,
          autoplay: {
            delay:                4000,
            disableOnInteraction: false,
            pauseOnMouseEnter:    true,
          },
          navigation: {
            prevEl: '.hero__swiper-prev',
            nextEl: '.hero__swiper-next',
          },
        });
      }
    }

  }

  /* ============================================================
   * ARKA PLAN VIDEO CROSSFADE (1.0.3'te eklendi)
   * data-hero-video'lu video'lar arasında 20sn'de bir yumuşak geçiş.
   * Aynı anda sadece aktif video oynar (mobil performansı için kritik).
   * ============================================================ */
  function initVideoBg(section, isMobile) {
    var videos = section.querySelectorAll('[data-hero-video]');
    if (!videos.length) return;

    /* hepsini sessiz/loop/inline yap — autoplay garantisi */
    videos.forEach(function (v) {
      v.muted = true;
      v.loop  = true;
      v.setAttribute('muted', '');
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
    });

    function safePlay(v) {
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    }

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* başlangıç: ilki görünür+oynuyor, diğerleri gizli+duruyor */
    videos.forEach(function (v, i) {
      gsap.set(v, { autoAlpha: i === 0 ? 1 : 0 });
      if (i === 0) safePlay(v); else v.pause();
    });

    /* tek video ya da reduced-motion: geçiş yapma */
    if (videos.length < 2 || reduced) return;

    var FADE  = isMobile ? 0.8 : 1.2;
    var index = 0;

    setInterval(advance, HERO_VIDEO_SWITCH_MS);

    function advance() {
      /* sekme arka plandaysa geçiş yapma (boşuna decode etme) */
      if (document.hidden) return;

      var prev = index;
      index = (index + 1) % videos.length;
      var next = videos[index];

      try { next.currentTime = 0; } catch (e) {}
      safePlay(next);

      gsap.to(next, { autoAlpha: 1, duration: FADE, ease: 'power2.inOut', force3D: true });
      gsap.to(videos[prev], {
        autoAlpha: 0,
        duration:  FADE,
        ease:      'power2.inOut',
        force3D:   true,
        onComplete: function () { videos[prev].pause(); },
      });
    }

    /* sekmeye geri dönünce aktif video kaldığı yerden devam etsin */
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) safePlay(videos[index]);
    });
  }

  window.addEventListener('load', init);

})();
