/**
 * Hero 1.0.3 — Pinned 2-scene hero animasyonu + arka plan video crossfade.
 * Desktop (≥992px): scrub'lı pin, 250vh, S1→S2, bar relocate. (1.0.2 ile aynı)
 * Mobile  (<992px): PIN YOK, bar relocate YOK. S1 ve S2 normal akışta alt alta.
 *                   Her grup scroll'da reveal alır.
 *                   .hero__bar-anchor mobilde CSS'te display:none olmalı.
 *
 * YENİ (1.0.3): Arka planda birden fazla video crossfade ile döner.
 *   HTML: arka plan alanına 2+ <video> koy, her birine data-hero-video ver.
 *     <div class="hero__bg">
 *       <video data-hero-video src="..." muted loop playsinline></video>
 *       <video data-hero-video src="..." muted loop playsinline></video>
 *       <video data-hero-video src="..." muted loop playsinline></video>
 *     </div>
 *   CSS: video'lar üst üste yığılmalı (.hero__bg position:relative; video position:absolute; inset:0; object-fit:cover).
 *   Her HERO_VIDEO_SWITCH_MS (20sn) bir sonraki videoya yumuşak geçer.
 *   Performans: aynı anda SADECE aktif video oynar; diğerleri pause — mobilde kasmaz.
 *
 * Lenis + ScrollTrigger uyumlu. GSAP + Swiper gerektirir.
 */
(function () {
  'use strict';

  var PIN_LENGTH_DESKTOP    = 2.5;
  var SCRUB_DESKTOP         = 2.5;
  var BP_DESKTOP            = 992;
  var HERO_VIDEO_SWITCH_MS  = 20000;  // videolar 20sn'de bir değişir

  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('Hero: GSAP veya ScrollTrigger bulunamadı.');
      return;
    }

    var section = document.querySelector('.section-hero');
    if (!section) return;

    var isMobile = window.innerWidth < BP_DESKTOP;
    var reduced  = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    if (!stage || !s1Left) return;

    initVideoBg(section, isMobile, reduced);

    if (reduced) {
      gsap.set([caseEl, s2Right, stats, tagline], { autoAlpha: 1, clearProps: 'transform' });
      initStatsCounter(section, statVals);
      initMarqueeClone(section, isMobile);
      initSwiper(section);
      return;
    }

    if (isMobile) {
      buildMobile();
    } else {
      buildDesktop();
    }

    initStatsCounter(section, statVals);
    initMarqueeClone(section, isMobile);
    initSwiper(section);

    /* ============================================================
     * DESKTOP — pin + scrub + bar relocate (1.0.1 ile aynı)
     * ============================================================ */
    function buildDesktop() {
      if (!bar || !barAnchor) return;

      gsap.set(caseEl,  { autoAlpha: 0, x: -50, yPercent: -50 });
      gsap.set(s2Right, { autoAlpha: 0, yPercent: -50 });
      gsap.set(stats,   { autoAlpha: 0, y: 50 });
      gsap.set(tagline, { autoAlpha: 0, y: 30 });
      gsap.set(bar,     { willChange: 'transform' });

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
      var barDx = 0, barDy = 0;
      function updateDelta() {
        var d = getBarDelta();
        barDx = d.x; barDy = d.y;
      }
      updateDelta();

      var completeTimer  = null;
      var lastScrollTime = 0;
      function onScrollUpdate(self) {
        var now = Date.now();
        lastScrollTime = now;
        var p = self.progress;
        if (p <= 0.02 || p >= 0.98) { clearTimeout(completeTimer); return; }
        clearTimeout(completeTimer);
        var end = self.end;
        completeTimer = setTimeout(function () {
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
          end:                 function () { return '+=' + (window.innerHeight * PIN_LENGTH_DESKTOP); },
          scrub:               SCRUB_DESKTOP,
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

      tl
        .to(marquee,  { autoAlpha: 0, duration: 0.25 }, 0)
        .to(heading,  { y: -80, autoAlpha: 0, duration: 0.35, ease: 'power2.in' }, 0.05)
        .to(s1Left,   { y: -80, autoAlpha: 0, duration: 0.35, ease: 'power2.in' }, 0.10)
        .to(s1Right,  { y: -60, autoAlpha: 0, duration: 0.30, ease: 'power2.in' }, 0.12)
        .to(bar, {
          scaleX: 0, transformOrigin: 'left center', ease: 'power3.inOut', duration: 0.40,
        }, 0.20)
        .set(bar, {
          x: function () { return barDx; },
          y: function () { return barDy; },
        }, 0.60)
        .to(bar, {
          scaleX: 1, transformOrigin: 'right center', ease: 'power3.out', duration: 0.40,
        }, 0.61)
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
        .fromTo(caseEl,
          { x: -60, autoAlpha: 0 },
          { x: 0,   autoAlpha: 1, duration: 0.40, ease: 'power2.out', onComplete: function () { caseEl.style.pointerEvents = 'auto'; } },
          0.68
        );
    }

    /* ============================================================
     * MOBILE — pin yok, relocate yok, sadece reveal
     * S1 (heading, s1Left, s1Right, bar, marquee) load anında görünür entrance.
     * S2 (s2Right içerikleri, case) scroll'da reveal.
     * ============================================================ */
    function buildMobile() {
      /* S1 — load entrance, scrub yok, hızlı stagger */
      var s1 = [heading, s1Left, s1Right, bar, marquee].filter(Boolean);
      gsap.set(s1, { autoAlpha: 0, y: 24 });
      gsap.to(s1, {
        autoAlpha: 1,
        y:         0,
        duration:  0.6,
        stagger:   0.08,
        ease:      'power3.out',
        force3D:   true,
        delay:     0.05,
      });

      /* S2 reveal — her grup ayrı ScrollTrigger, once:true */
      if (s2Right) {
        gsap.set(s2Right, { autoAlpha: 0, y: 30 });
        ScrollTrigger.create({
          trigger: s2Right,
          start:   'top 85%',
          once:    true,
          onEnter: function () {
            gsap.to(s2Right, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', force3D: true });
          },
        });
      }

      if (stats && stats.length) {
        gsap.set(stats, { autoAlpha: 0, y: 30 });
        ScrollTrigger.create({
          trigger: stats[0],
          start:   'top 85%',
          once:    true,
          onEnter: function () {
            gsap.to(stats, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out', force3D: true });
          },
        });
      }

      if (tagline) {
        gsap.set(tagline, { autoAlpha: 0, y: 24 });
        ScrollTrigger.create({
          trigger: tagline,
          start:   'top 88%',
          once:    true,
          onEnter: function () {
            gsap.to(tagline, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power3.out', force3D: true });
          },
        });
      }

      if (caseEl) {
        /* desktop initial state (x:-50, yPercent:-50) mobilde uygulanmasın */
        gsap.set(caseEl, { autoAlpha: 0, y: 32, x: 0, yPercent: 0 });
        ScrollTrigger.create({
          trigger: caseEl,
          start:   'top 88%',
          once:    true,
          onEnter: function () {
            gsap.to(caseEl, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', force3D: true });
          },
        });
      }
    }
  }

  /* ============================================================
   * ARKA PLAN VIDEO CROSSFADE
   * data-hero-video'lu video'lar arasında 20sn'de bir yumuşak geçiş.
   * Aynı anda sadece aktif video oynar (mobil performansı için kritik).
   * ============================================================ */
  function initVideoBg(section, isMobile, reduced) {
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

    /* tek video ya da reduced-motion: sadece ilkini oynat, geçiş yok */
    if (videos.length < 2 || reduced) {
      gsap.set(videos, { autoAlpha: 0 });
      gsap.set(videos[0], { autoAlpha: 1 });
      videos.forEach(function (v, i) { if (i === 0) safePlay(v); else v.pause(); });
      return;
    }

    var FADE  = isMobile ? 0.8 : 1.2;
    var index = 0;

    /* başlangıç durumu: ilki görünür+oynuyor, diğerleri gizli+duruyor */
    videos.forEach(function (v, i) {
      gsap.set(v, { autoAlpha: i === 0 ? 1 : 0 });
      if (i === 0) safePlay(v); else v.pause();
    });

    var timer = setInterval(advance, HERO_VIDEO_SWITCH_MS);

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

  /* ---------- stats sayaç (bir kez) ---------- */
  function initStatsCounter(section, statVals) {
    if (!statVals || !statVals.length) return;
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
          el.style.minWidth = el.offsetWidth + 'px';
          var proxy = { val: 0 };
          gsap.to(proxy, {
            val:      target,
            duration: 1.2,
            ease:     'power2.out',
            onUpdate:  function () { el.textContent = Math.round(proxy.val).toLocaleString(); },
            onComplete: function () { el.textContent = target.toLocaleString(); },
          });
        });
      },
    });
  }

  /* ---------- marquee klonu — mobilde atla ---------- */
  function initMarqueeClone(section, isMobile) {
    if (isMobile) return;
    var marqueeInner = section.querySelector('.hero__marquee-inner');
    var marqueeSet   = section.querySelector('.hero__marquee-set');
    if (marqueeInner && marqueeSet) {
      var clone = marqueeSet.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      marqueeInner.appendChild(clone);
    }
  }

  /* ---------- case swiper ---------- */
  function initSwiper(section) {
    if (typeof Swiper === 'undefined') return;
    var swiperEl = section.querySelector('.hero__swiper');
    if (!swiperEl) return;
    var isMobile = window.innerWidth < BP_DESKTOP;
    new Swiper(swiperEl, {
      slidesPerView: 1,
      loop:          true,
      speed:         isMobile ? 500 : 700,
      grabCursor:    !isMobile,
      autoplay: {
        delay:                isMobile ? 5000 : 4000,
        disableOnInteraction: false,
        pauseOnMouseEnter:    true,
      },
      navigation: {
        prevEl: '.hero__swiper-prev',
        nextEl: '.hero__swiper-next',
      },
    });
  }

  /* ---------- entry — load + idle ile init'i ertele ---------- */
  function schedule() {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(init, { timeout: 500 });
    } else {
      setTimeout(init, 1);
    }
  }

  if (document.readyState === 'complete') {
    schedule();
  } else {
    window.addEventListener('load', schedule);
  }

})();
