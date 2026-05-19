/**
 * VEX 1.0.2 — Video Expand Section
 *
 * Pinned 3-faz scroll animasyonu — hem desktop hem mobilde aynı fazlar.
 *
 *   Faz 0 : vex__wrap scale(0.72 → 1) [pre-pin]
 *   Faz 1 : blur + başlık metni girer
 *   Faz 2 : başlık çıkar → media son pozisyonuna gider, sol içerik girer
 *
 * Son pozisyon farkı:
 *   Desktop : media sağa kare olur, sol kolon yanında belirir
 *   Mobil   : media üste kare olur, içerik altta doğal akışta belirir
 *             (section yüksekliği içeriğe göre uzar, kendi içinde scroll yok)
 *
 * Bağımlılıklar: GSAP, ScrollTrigger. window.__lenis bekler.
 */
(function () {
  'use strict';

  var PIN_VH         = 3.5;
  var PIN_VH_MOB     = 1.5;
  var SCRUB          = 1;
  var SCALE_FROM     = 0.72;
  var SCALE_FROM_MOB = 0.88;
  var MOBILE_BP      = 767;
  var MOB_PAD        = 16; /* px — son halde media kenar boşluğu */
  var MOB_RADIUS     = 16; /* px — son halde media border-radius */

  var FLUID_PAD = [
    'clamp(3rem,',
    '((3 - ((5 - 3) / (var(--layout--fluid-max) - var(--layout--fluid-min)))',
    ' * var(--layout--fluid-min))) * 1rem',
    ' + ((5 - 3) / (var(--layout--fluid-max) - var(--layout--fluid-min)))',
    ' * 100vw, 5rem)',
  ].join('');

  var STYLES = [
    /* ─── DESKTOP (1.0.1 ile aynı) ─────────────────────── */
    '.section-vex{',
    'width:100%;height:100vh;height:100svh;',
    'display:flex;align-items:stretch;justify-content:center;',
    'padding:2rem ' + FLUID_PAD + ';',
    'box-sizing:border-box;}',

    '.vex__wrap{',
    'position:relative;',
    'width:100%;height:100%;',
    'border-radius:1.5rem;',
    'overflow:hidden;',
    'clip-path:inset(0 round 1.5rem);',
    'will-change:transform;',
    'transform-origin:center center;}',

    '.vex__media{',
    'position:absolute;inset:0;z-index:0;',
    'overflow:hidden;isolation:isolate;}',
    '.vex__media>video,.vex__media>img{',
    'position:absolute;inset:0;width:100%;height:100%;',
    'object-fit:cover;display:block;}',

    '.vex__blur{',
    'position:absolute;inset:0;z-index:1;',
    'backdrop-filter:blur(22px) brightness(0.52);',
    '-webkit-backdrop-filter:blur(22px) brightness(0.52);}',

    '.vex__headline{',
    'position:absolute;inset:0;z-index:2;',
    'display:flex;align-items:center;justify-content:center;',
    'text-align:center;padding:2rem 10%;',
    'pointer-events:none;}',

    '.vex__grid{',
    'position:absolute;inset:0;z-index:3;',
    'display:grid;grid-template-columns:1fr 1fr;',
    'pointer-events:none;}',
    '.vex__grid.is-interactive{pointer-events:auto;}',

    '.vex__left{',
    'overflow-y:auto;',
    'display:flex;flex-direction:column;justify-content:center;',
    '--vex-pad:' + FLUID_PAD + ';padding:var(--vex-pad);}',

    '.vex__right{position:relative;overflow:hidden;}',
    '.vex__right-overlay{',
    'position:absolute;inset:0;z-index:0;',
    'background:rgba(0,0,0,0.25);pointer-events:none;}',
    '.vex__right-img{',
    'position:absolute;inset:1.5rem;z-index:1;',
    'border-radius:0.75rem;overflow:hidden;',
    'display:flex;align-items:center;justify-content:center;',
    'opacity:0;transition:opacity 0.45s ease;}',
    '.vex__right-img.is-active{opacity:1;}',
    '.vex__right-img>img,.vex__right-img>video{',
    'width:100%;height:auto;max-height:100%;',
    'aspect-ratio:656/494;',
    'border-radius:0.75rem;',
    'object-fit:cover;display:block;}',

    '.vex__panels{position:relative;}',
    '.vex__panel{',
    'opacity:0;transform:translateY(14px);',
    'transition:opacity 0.32s ease,transform 0.32s ease;',
    'pointer-events:none;',
    'position:absolute;top:0;left:0;width:100%;}',
    '.vex__panel.is-active{',
    'opacity:1;transform:translateY(0);',
    'pointer-events:auto;position:relative;}',

    /* ─── MOBİL: aynı fazlar, doğal akış son hali ─────── */
    '@media(max-width:767px){',
    /* Section üst/alt boşluklu, içerik kadar uzar */
    '.section-vex{',
    'height:auto;min-height:0;',
    'display:block;padding:1rem;',
    'overflow:visible;',
    'box-sizing:border-box;}',

    /* Wrap doğal blok */
    '.vex__wrap{',
    'position:relative;',
    'width:100%;height:auto;display:block;',
    'border-radius:0;overflow:visible;',
    'clip-path:none;',
    'transform-origin:center top;}',

    /* Media: ABSOLUTE — section yüksekliğini etkilemez (pin spacer stabil)
     * Başlangıç: portrait kart, viewport içinde dikey ortalı (mt > 0)
     * Son hali  : üst kare (mt = 0)
     * Wrap içinde left:0 right:0 ile yerleşir; height + mt CSS var'larıyla animate */
    '.vex__media{',
    'position:absolute;',
    'top:var(--vex-mt,0px);',
    'left:0;right:0;',
    'width:auto;',
    'height:var(--vex-h,min(calc(100svh - 2rem),160vw));',
    'border-radius:var(--vex-r,16px);',
    'margin:0;',
    'overflow:hidden;isolation:isolate;z-index:0;',
    'will-change:height,top,border-radius;}',
    '.vex__media>video,.vex__media>img{',
    'position:absolute;inset:0;width:100%;height:100%;',
    'border-radius:inherit;object-fit:cover;}',

    /* Blur: media içinde, height/radius inherit */
    '.vex__blur{',
    'position:absolute;inset:0;z-index:1;',
    'border-radius:inherit;}',

    /* Headline: media alanı üstünde konumlanır (mt ile hizalı) */
    '.vex__headline{',
    'position:absolute;left:0;',
    'top:var(--vex-mt,0px);',
    'width:100%;',
    'height:var(--vex-h,min(calc(100svh - 2rem),160vw));',
    'padding:1.5rem 1.25rem;',
    'z-index:5;',
    'font-size:0.9em;}',

    /* Grid: display:contents — child'lar wrap'a direkt akar
     * Bu sayede .vex__right absolute media üstüne, .vex__left flow'da media altına gelir */
    '.vex__grid{',
    'display:contents;}',

    /* Sağ kolon: media alanı üstünde overlay (mt ile hizalı) */
    '.vex__right{',
    'display:block;',
    'position:absolute;',
    'left:0;right:0;',
    'top:var(--vex-mt,0px);',
    'height:var(--vex-h,min(calc(100svh - 2rem),160vw));',
    'border-radius:var(--vex-r,16px);',
    'overflow:hidden;',
    'z-index:3;',
    'pointer-events:none;}',
    '.vex__right-overlay{background:rgba(0,0,0,0.2);}',
    /* tab fotoğrafı media alanını tam doldursun — aspect 656/494 base kuralda korunur */
    '.vex__right-img{inset:0;border-radius:var(--vex-r,16px);}',

    /* Sol kolon: media altında doğal akış, kendi içinde scroll YOK
     * margin-top = son media yüksekliği + gap → media absolute olduğu için
     * left'in üstünde sabit bir boşluk gerekiyor (section yüksekliği stabil) */
    '.vex__left{',
    'position:relative;',
    'margin-top:var(--vex-left-mt,calc(100vw - 1rem));',
    'padding:0 0.25rem;',
    'display:block;height:auto;',
    'overflow:visible !important;}',

    '.vex__left p{margin:0 0 0.75rem;}',
    '.vex__left ul,.vex__left ol{margin:0 0 0.75rem;padding-left:1.1rem;}',
    '}',
  ].join('');

  function injectCSS() {
    var s = document.createElement('style');
    s.textContent = STYLES;
    document.head.appendChild(s);
  }

  /* ── Tab + sağ resim geçişi ───────────────────────────── */
  function initTabs(section) {
    var tabs      = section.querySelectorAll('.vex__tab');
    var panels    = section.querySelectorAll('.vex__panel');
    var rightImgs = section.querySelectorAll('.vex__right-img');
    if (!tabs.length) return;

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var idx = tab.getAttribute('data-vex-tab');
        tabs.forEach(function (t) { t.classList.remove('is-active'); });
        panels.forEach(function (p) { p.classList.remove('is-active'); });
        rightImgs.forEach(function (r) { r.classList.remove('is-active'); });
        tab.classList.add('is-active');
        var panel = section.querySelector('.vex__panel[data-vex-panel="' + idx + '"]');
        if (panel) panel.classList.add('is-active');
        var img = section.querySelector('.vex__right-img[data-vex-panel="' + idx + '"]');
        if (img) img.classList.add('is-active');
      });
    });
  }

  /* ── Mobil için media CSS var'larını uygula ──────────── */
  function applyMobileVars(section, h, mt, r) {
    section.style.setProperty('--vex-h',  h  + 'px');
    section.style.setProperty('--vex-mt', mt + 'px');
    section.style.setProperty('--vex-r',  r  + 'px');
  }

  /* İlk faz: ~5:8 portrait kart, viewport yüksekliğine kapatılmış */
  function mobInitialH() {
    return Math.min(window.innerHeight - 32, Math.round(window.innerWidth * 1.6));
  }
  /* İlk faz dikey ortalama için üst margin */
  function mobInitialMT() {
    return Math.max(0, Math.round((window.innerHeight - 32 - mobInitialH()) / 2));
  }
  /* Son faz: kare (wrap genişliği) */
  function mobFinalH() { return window.innerWidth - 32; }

  /* ── Init: desktop ve mobil aynı fazları paylaşır ────── */
  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('VEX: GSAP veya ScrollTrigger bulunamadı.');
      return;
    }
    var section = document.querySelector('.section-vex');
    if (!section) return;

    var wrap     = section.querySelector('.vex__wrap');
    var media    = section.querySelector('.vex__media');
    var blur     = section.querySelector('.vex__blur');
    var headline = section.querySelector('.vex__headline');
    var grid     = section.querySelector('.vex__grid');
    var left     = grid ? grid.querySelector('.vex__left') : null;

    var isMob   = window.innerWidth <= MOBILE_BP;
    var scaleFr = isMob ? SCALE_FROM_MOB : SCALE_FROM;
    var pinVH   = isMob ? PIN_VH_MOB : PIN_VH;

    /* ── Başlangıç durumu ── */
    if (wrap) gsap.set(wrap, { scale: scaleFr, force3D: true });

    if (media) {
      if (isMob) {
        /* Mobil: portrait kart, viewport içinde dikey ortalı */
        applyMobileVars(section, mobInitialH(), mobInitialMT(), 16);
        /* Left'in margin-top'u = son media yüksekliği + 16px gap */
        section.style.setProperty('--vex-left-mt', (mobFinalH() + 16) + 'px');
      } else {
        /* Desktop: inset:0 */
        gsap.set(media, { top: 0, left: 0, right: 0, bottom: 0, borderRadius: 0 });
      }
    }
    if (blur)     gsap.set(blur,     { opacity: 0 });
    if (headline) gsap.set(headline, { opacity: 0, y: 40 });
    if (grid && !isMob) gsap.set(grid, { opacity: 0 });
    if (left)     gsap.set(left,     isMob
      ? { y: 40, opacity: 0 }
      : { x: -56, opacity: 0 });

    /* ── Faz 0: Scale entrance (pre-pin) ── */
    if (wrap) {
      ScrollTrigger.create({
        trigger:             section,
        start:               'top bottom',
        end:                 'top 15%',
        scrub:               SCRUB,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          var s = scaleFr + (1 - scaleFr) * self.progress;
          gsap.set(wrap, { scale: s, force3D: true });
        },
        onLeave: function () {
          gsap.set(wrap, { scale: 1, force3D: true });
        },
      });
    }

    /* ── Pin timeline ── */
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger:             section,
        start:               'top top',
        end:                 function () { return '+=' + (window.innerHeight * pinVH); },
        scrub:               SCRUB,
        pin:                 true,
        anticipatePin:       1,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          if (!grid) return;
          if (self.progress >= 0.75) {
            grid.classList.add('is-interactive');
          } else {
            grid.classList.remove('is-interactive');
          }
        },
        onScrubComplete: function () {
          if (wrap) gsap.set(wrap, { willChange: 'auto' });
        },
      },
    });

    /* Faz 1: Blur giriş */
    if (blur) {
      tl.to(blur, { opacity: 1, duration: 0.7, ease: 'power2.out' }, 0.8);
    }

    /* Faz 1: Başlık giriş */
    if (headline) {
      tl.to(headline, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 1.0);
    }

    /* Faz 2: Başlık çıkış */
    if (headline) {
      tl.to(headline, { opacity: 0, y: -28, duration: 0.45, ease: 'power2.in' }, 2.0);
    }

    /* Faz 2: Media → son pozisyon */
    if (media) {
      if (isMob) {
        /* Mobil: CSS var'ları proxy obje üzerinden tween — ortalı portrait → üst kare */
        var prog = { h: mobInitialH(), mt: mobInitialMT(), r: 16 };
        tl.to(prog, {
          h:        mobFinalH(),
          mt:       0,
          r:        16,
          duration: 0.9,
          ease:     'power2.inOut',
          onUpdate: function () {
            applyMobileVars(section, prog.h, prog.mt, prog.r);
          },
        }, 2.0);

        /* Faz 2: Sağ kolon (tab fotoğrafı overlay) fade-in */
        var right = section.querySelector('.vex__right');
        if (right) {
          gsap.set(right, { opacity: 0 });
          tl.to(right, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 2.4);
        }
      } else {
        /* Desktop: inset değerleri */
        tl.to(media, {
          top:          '3%',
          left:         '52%',
          right:        '2%',
          bottom:       '3%',
          borderRadius: '1.2rem',
          duration:     0.9,
          ease:         'power2.inOut',
        }, 2.0);
      }
    }

    /* Faz 3: Grid belirir (desktop) */
    if (grid && !isMob) {
      tl.to(grid, { opacity: 1, duration: 0.3, ease: 'none' }, 2.6);
    }

    /* Faz 3: Sol kolon slide-in (mobil: alttan, desktop: soldan) */
    if (left) {
      tl.to(left, isMob
        ? { y: 0, opacity: 1, duration: 0.75, ease: 'power3.out' }
        : { x: 0, opacity: 1, duration: 0.75, ease: 'power3.out' },
      2.7);
    }

    initTabs(section);
  }

  /* ── Lenis hazır olana kadar bekle ───────────────────── */
  function waitAndInit() {
    if (window.__lenis) { init(); return; }
    var attempts = 0;
    var timer = setInterval(function () {
      attempts++;
      if (window.__lenis || attempts >= 20) { clearInterval(timer); init(); }
    }, 100);
  }

  injectCSS();
  window.addEventListener('load', waitAndInit);
})();
</script>

<script>
 (function () {
  var wrap = document.querySelector('.ba-wrap');
  if (!wrap) return;

  var afterImgWrap = wrap.querySelector('.ba-img-wrap.is-after');
  var dragger = wrap.querySelector('.ba-dragger');
  if (!afterImgWrap || !dragger) return;

  Draggable.create(dragger, {
    type: 'x',
    bounds: wrap,
    onDrag: function () {
      var x = wrap.offsetWidth / 2 - gsap.getProperty(this.target, 'x');
      gsap.set(afterImgWrap, { clipPath: 'inset(0px ' + x + 'px 0px 0px)' });
    }
  });
})();
