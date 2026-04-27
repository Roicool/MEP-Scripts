/**
 * StatScroll 1.0.0 — Scroll-driven sıralı stat kartları.
 * Pin yok; her kart viewport'a girince is-active alır.
 * Aktif kart: sol icon-wrap'te grain gradient, sağ panel dark bg.
 * Açıklama metni: inactive=muted, active=main text.
 *
 * DOM YAPISI:
 *   <section class="section-sc">
 *     <div class="sc__card">
 *       <div class="sc__left">
 *         <div class="sc__icon-wrap">
 *           <svg class="sc__arrow">…</svg>
 *         </div>
 *         <div class="sc__stat">
 *           <div class="sc__number">28B</div>
 *           <div class="sc__label">Keywords</div>
 *         </div>
 *       </div>
 *       <div class="sc__desc">Açıklama metni.</div>
 *     </div>
 *     …tekrar…
 *   </section>
 *
 * CSS GEREKSİNİMLERİ (Webflow'da ayarla):
 *   .section-sc          → background: #f3f0e9 (thin)
 *   .sc__card            → display: grid; grid-template-columns: 1fr 1fr; align-items: center
 *   .sc__left            → display: flex; align-items: stretch
 *   .sc__icon-wrap       → min-width: 120px; display:flex; align-items:center; justify-content:center
 *   .sc__stat            → flex:1; padding: 20px 24px
 *   .sc__number          → font-size: clamp(48px,6vw,80px); font-weight:700; line-height:1
 *   .sc__desc            → max-width: 320px; font-size: clamp(16px,1.4vw,20px); line-height:1.5
 */
(function () {
  'use strict';

  /* ── Marka Renkleri ───────────────────────────────────────── */
  var GRAD_START    = '#15adaa';                    /* turquoise  */
  var GRAD_END      = '#bfa799';                    /* brown      */
  var STAT_BG       = 'oklch(0.2017 0.0435 1.51)'; /* dark       */
  var TEXT_ACTIVE   = 'oklch(0.1942 0.03 56.26)';  /* espresso   */
  var TEXT_INACTIVE = '#bfa799';                    /* brown      */
  var NUM_ACTIVE    = '#f9ecd6';                    /* light      */
  var ICON_INACTIVE = '#ece8e0';                    /* neutral bg */
  var STAT_INACTIVE = '#ece8e0';                    /* neutral bg */
  var GRAIN_OP      = 0.22;

  /* ── Script Config ────────────────────────────────────────── */
  var TRIGGER_START = 'top 62%';
  var DUR           = 0.55;

  /* ── CSS enjeksiyonu ──────────────────────────────────────── */
  function injectCSS() {
    if (document.getElementById('sc-styles')) return;

    var svgNoise = '<svg xmlns="http://www.w3.org/2000/svg" width="250" height="250">'
      + '<filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.78"'
      + ' numOctaves="4" stitchTiles="stitch"/></filter>'
      + '<rect width="250" height="250" filter="url(#g)" opacity="1"/></svg>';
    var noiseURL = 'data:image/svg+xml,' + encodeURIComponent(svgNoise);

    var css = [
      /* icon-wrap: background geçişi CSS ile */
      '.sc__icon-wrap {',
      '  position: relative; overflow: hidden;',
      '  background: ' + ICON_INACTIVE + ';',
      '  transition: background 0.5s ease;',
      '}',
      '.sc__card.is-active .sc__icon-wrap {',
      '  background: linear-gradient(145deg, ' + GRAD_START + ' 0%, ' + GRAD_END + ' 100%);',
      '}',
      /* grain overlay */
      '.sc__icon-wrap::after {',
      '  content: ""; position: absolute; inset: 0;',
      '  background-image: url("' + noiseURL + '");',
      '  background-size: 250px 250px;',
      '  opacity: 0; transition: opacity 0.5s ease;',
      '  pointer-events: none; mix-blend-mode: overlay;',
      '}',
      '.sc__card.is-active .sc__icon-wrap::after { opacity: ' + GRAIN_OP + '; }',
      /* stat bg */
      '.sc__stat {',
      '  background: ' + STAT_INACTIVE + ';',
      '  transition: background 0.5s ease;',
      '}',
      '.sc__card.is-active .sc__stat { background: ' + STAT_BG + '; }',
      /* number + label renk */
      '.sc__number { color: ' + TEXT_INACTIVE + '; transition: color 0.45s ease; }',
      '.sc__card.is-active .sc__number { color: ' + NUM_ACTIVE + '; }',
      '.sc__label  { color: ' + TEXT_INACTIVE + '; transition: color 0.45s ease; }',
      '.sc__card.is-active .sc__label  { color: ' + NUM_ACTIVE + '; }',
      /* arrow icon */
      '.sc__arrow { transition: color 0.45s ease; color: ' + TEXT_INACTIVE + '; }',
      '.sc__card.is-active .sc__arrow { color: ' + STAT_BG + '; }',
      /* desc renk */
      '.sc__desc { color: ' + TEXT_INACTIVE + '; transition: color 0.45s ease; }',
      '.sc__card.is-active .sc__desc { color: ' + TEXT_ACTIVE + '; }',
    ].join('\n');

    var el = document.createElement('style');
    el.id = 'sc-styles';
    el.textContent = css;
    document.head.appendChild(el);
  }

  /* ── Init ─────────────────────────────────────────────────── */
  function init() {
    if (typeof gsap === 'undefined') {
      console.warn('StatScroll: GSAP bulunamadı.');
      return;
    }

    var section = document.querySelector('.section-sc');
    if (!section) return;

    var cards = Array.from(section.querySelectorAll('.sc__card'));
    var n = cards.length;
    if (!n) return;

    injectCSS();

    var currentIdx = -1;

    /* ── Aktifleştirme ──────────────────────────────────────── */
    function activate(idx) {
      if (idx < 0 || idx >= n || idx === currentIdx) return;

      /* öncekini kapat */
      if (currentIdx >= 0) {
        var prev = cards[currentIdx];
        prev.classList.remove('is-active');

        var prevDesc = prev.querySelector('.sc__desc');
        var prevNum  = prev.querySelector('.sc__number');
        var prevLab  = prev.querySelector('.sc__label');

        if (prevDesc) {
          prevDesc.style.willChange = 'opacity, transform';
          gsap.to(prevDesc, {
            autoAlpha: 0.5, y: -6,
            duration: DUR * 0.6, ease: 'power2.in',
            overwrite: 'auto', force3D: true,
            onComplete: function () { prevDesc.style.willChange = 'auto'; },
          });
        }
        if (prevNum) {
          prevNum.style.willChange = 'opacity, transform';
          gsap.to(prevNum, {
            autoAlpha: 0.5, y: -4,
            duration: DUR * 0.5, ease: 'power2.in',
            overwrite: 'auto', force3D: true,
            onComplete: function () { prevNum.style.willChange = 'auto'; },
          });
        }
        if (prevLab) {
          gsap.to(prevLab, {
            autoAlpha: 0.5,
            duration: DUR * 0.5, ease: 'power2.in',
            overwrite: 'auto',
          });
        }
      }

      currentIdx = idx;
      var card = cards[idx];
      card.classList.add('is-active');

      var desc = card.querySelector('.sc__desc');
      var num  = card.querySelector('.sc__number');
      var lab  = card.querySelector('.sc__label');

      if (desc) {
        desc.style.willChange = 'opacity, transform';
        gsap.fromTo(desc,
          { autoAlpha: 0.5, y: 8 },
          {
            autoAlpha: 1, y: 0,
            duration: DUR, ease: 'power3.out',
            overwrite: 'auto', force3D: true,
            onComplete: function () { desc.style.willChange = 'auto'; },
          }
        );
      }
      if (num) {
        num.style.willChange = 'opacity, transform';
        gsap.fromTo(num,
          { autoAlpha: 0.5, y: 10 },
          {
            autoAlpha: 1, y: 0,
            duration: DUR, ease: 'power3.out',
            overwrite: 'auto', force3D: true,
            onComplete: function () { num.style.willChange = 'auto'; },
          }
        );
      }
      if (lab) {
        gsap.fromTo(lab,
          { autoAlpha: 0.5 },
          { autoAlpha: 1, duration: DUR * 0.8, ease: 'power3.out', overwrite: 'auto' }
        );
      }
    }

    /* ── Başlangıç state ────────────────────────────────────── */
    cards.forEach(function (card) {
      var desc = card.querySelector('.sc__desc');
      var num  = card.querySelector('.sc__number');
      var lab  = card.querySelector('.sc__label');
      if (desc) gsap.set(desc, { autoAlpha: 0.5 });
      if (num)  gsap.set(num,  { autoAlpha: 0.5 });
      if (lab)  gsap.set(lab,  { autoAlpha: 0.5 });
    });

    /* ── Scroll listener ────────────────────────────────────── */
    /* ScrollTrigger yerine direkt Lenis scroll event'i dinle.
       - ST init'teki sahte onEnter sorunu yok.
       - Pin'li üst component'ın neden olduğu pozisyon kaymasından etkilenmez.
       - getBoundingClientRect() her zaman Lenis'in lerp pozisyonuyla senkron. */
    var triggerPct = parseInt(TRIGGER_START.split(' ')[1], 10) / 100;

    function resolveActive() {
      var triggerY = window.innerHeight * triggerPct;
      var newIdx   = 0;
      cards.forEach(function (card, i) {
        if (card.getBoundingClientRect().top < triggerY) newIdx = i;
      });
      activate(newIdx);
    }

    if (window.__lenis) {
      window.__lenis.on('scroll', resolveActive);
    } else {
      window.addEventListener('scroll', resolveActive, { passive: true });
    }

    window.addEventListener('resize', resolveActive, { passive: true });

    resolveActive();
  }

  window.addEventListener('load', init);
})();
