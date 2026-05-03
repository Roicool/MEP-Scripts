/**
 * Social Proof 1.0.0
 * Full-bleed testimonial slider. CMS'den logo tab + bg/video + content extract.
 * Auto-advance + progress fill. Tab tıklama destekli.
 * GPU composited — transform + opacity only.
 *
 * DOM YAPISI (Webflow'da kullanıcı oluşturur):
 *   section.section-sp
 *     div.sp__list  ← CMS Collection List
 *       div.sp__item  ← CMS Item (her slide için class ekle)
 *         img.sp__bg              ← arka plan görseli (opsiyonel)
 *         div.sp__video           ← arka plan video sarmalayıcı (opsiyonel)
 *         div.sp__tab             ← logo tab öğesi
 *           img.sp__tab-logo      ← marka logosu
 *           div.sp__tab-bar       ← progress bar rayı
 *             div.sp__tab-bar-fill← progress doldurma
 *         div.sp__content         ← alıntı + yazar + CTA
 *           div.sp__quote         ← alıntı metni
 *           div.sp__author
 *             span.sp__author-name
 *             span.sp__author-role
 *           a.sp__cta             ← müşteri hikayesi linki
 */
(function () {
  'use strict';

  var AUTO_DELAY = 8000;  /* ms — tab geçiş süresi      */
  var DUR        = 0.75;  /* geçiş animasyon süresi (s) */

  function mk(tag, cls) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    return el;
  }

  function init() {
    if (typeof gsap === 'undefined') return;

    var section = document.querySelector('.section-sp');
    if (!section) return;

    var list = section.querySelector('.sp__list');
    if (!list) return;

    var items = Array.from(list.querySelectorAll('.sp__item'));
    if (!items.length) return;

    /* ── DOM extract & reorganize ───────────────────────── */
    var bgTrack      = mk('div', 'sp__bg-track');
    var overlay      = mk('div', 'sp__overlay');
    var inner        = mk('div', 'sp__inner');
    var tabsWrap     = mk('div', 'sp__tabs');
    var contentTrack = mk('div', 'sp__content-track');

    var bgs      = [];
    var tabs     = [];
    var contents = [];
    var fills    = [];
    var videos   = [];  /* video referansları — her seferinde querySelector yapmamak için */

    items.forEach(function (item) {
      var bg      = item.querySelector('.sp__bg');
      var video   = item.querySelector('.sp__video');
      var tab     = item.querySelector('.sp__tab');
      var fill    = item.querySelector('.sp__tab-bar-fill');
      var content = item.querySelector('.sp__content');

      var bgSlide = mk('div', 'sp__bg-slide');
      if (video) {
        bgSlide.appendChild(video);
      } else if (bg) {
        bgSlide.appendChild(bg);
      }
      bgTrack.appendChild(bgSlide);
      bgs.push(bgSlide);
      videos.push(bgSlide.querySelector('video') || null);

      if (tab)     { tabsWrap.appendChild(tab);         tabs.push(tab); }
      if (content) { contentTrack.appendChild(content); contents.push(content); }
      if (fill)    { fills.push(fill); }
    });

    /* CMS list gizle */
    list.style.display = 'none';

    inner.appendChild(tabsWrap);
    inner.appendChild(contentTrack);
    section.appendChild(bgTrack);
    section.appendChild(overlay);
    section.appendChild(inner);

    var ns = tabs.length;

    /* ── Progress fill ───────────────────────────────────── */
    var current = 0;
    var fillTw  = null;

    function killFill() {
      if (fillTw) { fillTw.kill(); fillTw = null; }
    }

    function startFill() {
      killFill();
      var fill = fills[current];
      if (!fill) return;
      fill.style.willChange = 'transform';
      gsap.set(fill, { scaleX: 0, transformOrigin: 'left center' });
      fillTw = gsap.to(fill, {
        scaleX:   1,
        duration: AUTO_DELAY / 1000,
        ease:     'none',
        onComplete: function () {
          fill.style.willChange = 'auto';
          goTo((current + 1) % ns);
        },
      });
    }

    /* ── Tüm bg'leri temizle (hızlı geçiş güvenliği) ────── */
    function resetBg(b) {
      gsap.killTweensOf(b);
      b.classList.remove('is-active');
      gsap.set(b, { opacity: 0, scale: 1, zIndex: 0 });
      b.style.willChange = 'auto';
    }

    function resetContent(c) {
      gsap.killTweensOf(c);
      c.classList.remove('is-active');
      gsap.set(c, { opacity: 0, y: 0 });
      c.style.willChange = 'auto';
    }

    /* ── Slide geçiş ─────────────────────────────────────── */
    function goTo(index) {
      if (index === current) return;
      var prev = current;
      current  = index;

      /* Tab aktif durumu */
      tabs.forEach(function (t, i) {
        t.classList.toggle('is-active', i === index);
      });

      /* Fill sıfırla */
      killFill();
      fills.forEach(function (f, i) {
        if (i !== index) {
          gsap.set(f, { scaleX: 0 });
          f.style.willChange = 'auto';
        }
      });

      /* ── Tüm bg/content'leri temizle (hızlı geçiş fix) ── */
      bgs.forEach(function (b, i) {
        if (i !== prev && i !== index) resetBg(b);
      });
      contents.forEach(function (c, i) {
        if (i !== prev && i !== index) resetContent(c);
      });

      /* ── BG crossfade + scale ── */
      var prevBg = bgs[prev];
      var nextBg = bgs[index];

      gsap.killTweensOf(prevBg);
      gsap.killTweensOf(nextBg);

      prevBg.style.willChange = 'opacity, transform';
      nextBg.style.willChange = 'opacity, transform';

      /* prevBg'nin mevcut opacity'sinden (yarım geçiş olabilir) fade-out */
      gsap.set(nextBg, { opacity: 0, scale: 1.05, zIndex: 2 });
      gsap.set(prevBg, { zIndex: 1 });

      gsap.to(prevBg, {
        opacity:   0,
        scale:     0.98,
        duration:  DUR * 0.9,
        ease:      'power2.in',
        overwrite: 'auto',
        onComplete: function () {
          prevBg.classList.remove('is-active');
          gsap.set(prevBg, { opacity: 0, scale: 1, zIndex: 0 });
          prevBg.style.willChange = 'auto';
        },
      });
      gsap.to(nextBg, {
        opacity:   1,
        scale:     1,
        duration:  DUR * 1.4,
        ease:      'power2.out',
        overwrite: 'auto',
        onStart:    function () { nextBg.classList.add('is-active'); },
        onComplete: function () {
          gsap.set(nextBg, { zIndex: 1 });
          nextBg.style.willChange = 'auto';
        },
      });

      /* Video autoplay — önbelleklenmiş referans */
      var vid = videos[index];
      if (vid) { vid.currentTime = 0; vid.play(); }

      /* ── Content geçiş ── */
      var prevCnt = contents[prev];
      var nextCnt = contents[index];

      gsap.killTweensOf(prevCnt);
      gsap.killTweensOf(nextCnt);

      prevCnt.style.willChange = 'opacity, transform';
      nextCnt.style.willChange = 'opacity, transform';

      gsap.to(prevCnt, {
        opacity:   0,
        y:         -18,
        duration:  DUR * 0.38,
        ease:      'power2.in',
        overwrite: 'auto',
        onComplete: function () {
          prevCnt.classList.remove('is-active');
          prevCnt.style.willChange = 'auto';
          gsap.set(prevCnt, { y: 0 });
        },
      });
      gsap.fromTo(nextCnt,
        { opacity: 0, y: 28 },
        {
          opacity:   1,
          y:         0,
          duration:  DUR * 1.1,
          delay:     DUR * 0.32,
          ease:      'power3.out',
          overwrite: 'auto',
          onStart:    function () { nextCnt.classList.add('is-active'); },
          onComplete: function () { nextCnt.style.willChange = 'auto'; },
        }
      );

      startFill();
    }

    /* Tab tıklama */
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        if (i !== current) goTo(i);
      });
    });

    /* ── Init state ──────────────────────────────────────── */
    gsap.set(bgs,      { opacity: 0, scale: 1, zIndex: 0 });
    gsap.set(contents, { opacity: 0 });
    gsap.set(fills,    { scaleX: 0, transformOrigin: 'left center' });

    if (bgs[0])      { gsap.set(bgs[0],      { opacity: 1, zIndex: 1 }); bgs[0].classList.add('is-active'); }
    if (contents[0]) { gsap.set(contents[0], { opacity: 1 });             contents[0].classList.add('is-active'); }
    if (tabs[0])     { tabs[0].classList.add('is-active'); }

    var firstVid = videos[0];
    if (firstVid) firstVid.play();

    startFill();
  }

  window.addEventListener('load', init);
})();
