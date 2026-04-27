/**
 * FlairCTA 1.0.0 — .section-flair-cta / .flair-cta: cursor flair trail + slideshow.
 * Tablet ve altı (991px): flair yok, slayt döner.
 */
(function () {
  var ROOT_SELECTOR = '.section-flair-cta, .flair-cta';
  var SLIDESHOW_ONLY_MQ = '(max-width: 991px)';
  var mqSlideshowOnly =
    typeof window.matchMedia !== 'undefined' ? window.matchMedia(SLIDESHOW_ONLY_MQ) : null;

  function isSlideshowOnlyViewport() {
    return mqSlideshowOnly ? mqSlideshowOnly.matches : false;
  }

  var GAP_TILE_FACTOR = 0.9;
  var MIN_SPAWN_MS = 72;
  var FOLLOW_BASE = 0.4;
  var FOLLOW_LAG_GAIN = 0.0034;
  var FOLLOW_PULL_MAX = 0.92;
  var MAX_ACTIVE_CAP = 9;
  var IDLE_MS = 950;
  var IDLE_FADE_OUT_MS = 520;
  var SPAWN_SOFTEN_FROM = 0.94;
  var SPAWN_SOFTEN_DURATION = 0.09;
  var LEAVE_FADE_SEC = 0.14;
  var IDLE_CHECK_EVERY = 3;
  var BG_SLIDE_INTERVAL_MS = 4000;
  var BG_SLIDES_OPACITY = 1;
  var BG_SLIDES_SHOW_DELAY_MS = 480;
  var CTA_SPAWN_EXCLUDE_PAD = 16;

  function removeFromActive(queue, el) {
    var i = queue.indexOf(el);
    while (i !== -1) { queue.splice(i, 1); i = queue.indexOf(el); }
  }

  function noopDestroy() {}

  function init(root) {
    if (!root || typeof gsap === 'undefined') return noopDestroy;

    var slidesRoot = root.querySelector('.flair-cta__slides');
    var slideEls = slidesRoot ? gsap.utils.toArray(slidesRoot.querySelectorAll('.flair-cta__slide')) : [];
    var slideIndex = 0;
    var slideInterval = null;
    var slidesShowTimer = null;

    function stopSlideRotation() {
      if (slideInterval) { clearInterval(slideInterval); slideInterval = null; }
    }

    function advanceSlide() {
      if (!slideEls.length) return;
      slideIndex = (slideIndex + 1) % slideEls.length;
      slideEls.forEach(function (el, i) { el.classList.toggle('is-active', i === slideIndex); });
    }

    function startSlideRotation() {
      if (!slideEls.length || slideInterval) return;
      slideInterval = setInterval(advanceSlide, BG_SLIDE_INTERVAL_MS);
    }

    if (isSlideshowOnlyViewport()) {
      if (!slidesRoot || !slideEls.length) return noopDestroy;
      gsap.set(slidesRoot, { opacity: BG_SLIDES_OPACITY });
      startSlideRotation();
      return function destroySlideshowOnly() {
        stopSlideRotation();
        if (slidesRoot) gsap.killTweensOf(slidesRoot);
      };
    }

    var flair = gsap.utils.toArray(root.querySelectorAll('.flair-cta__flair'));
    if (!flair.length) return noopDestroy;

    var maxConcurrent = Math.min(MAX_ACTIVE_CAP, flair.length);
    var ctaEl = root.querySelector('.flair-cta__cta');
    var activeQueue = [];
    var idleFadeTl = null;
    var lastPointerActivity = 0;
    var lastSpawnTime = 0;
    var lastSpawnClient = { x: 0, y: 0 };
    var idleTick = 0;
    var spawnGapClientPx = 72;
    var resizeRaf = 0;
    var index = 0;
    var wrapper = gsap.utils.wrap(0, flair.length);
    var mousePos = { x: 0, y: 0 };
    var cachedFollow = { x: 0, y: 0 };
    var pointerInside = false;
    var tickerFn;

    function hideBgSlides() {
      if (!slidesRoot) return;
      if (slidesShowTimer) { clearTimeout(slidesShowTimer); slidesShowTimer = null; }
      stopSlideRotation();
      gsap.killTweensOf(slidesRoot, 'opacity');
      gsap.to(slidesRoot, { opacity: 0, duration: 0.32, ease: 'power2.out' });
    }

    function showBgSlidesDebounced() {
      if (!slidesRoot) return;
      if (slidesShowTimer) clearTimeout(slidesShowTimer);
      slidesShowTimer = setTimeout(function () {
        slidesShowTimer = null;
        if (!slidesRoot) return;
        if (pointerInside && (activeQueue.length > 0 || idleFadeTl)) return;
        gsap.killTweensOf(slidesRoot, 'opacity');
        gsap.to(slidesRoot, { opacity: BG_SLIDES_OPACITY, duration: 0.55, ease: 'power2.out' });
        startSlideRotation();
      }, BG_SLIDES_SHOW_DELAY_MS);
    }

    function computeSpawnGap() {
      var el = flair[0];
      var w = el ? el.getBoundingClientRect().width : 0;
      if (!w || w < 4) w = Math.min(window.innerWidth * 0.1, 160);
      spawnGapClientPx = Math.max(16, w * GAP_TILE_FACTOR);
    }

    function onResize() {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(computeSpawnGap);
    }

    computeSpawnGap();
    window.addEventListener('resize', onResize, { passive: true });

    function now() {
      return typeof performance !== 'undefined' ? performance.now() : Date.now();
    }

    function restoreVisibleCards() {
      activeQueue.forEach(function (el) {
        gsap.killTweensOf(el);
        gsap.set(el, { opacity: 1, scale: 1, transformOrigin: '50% 50%' });
      });
    }

    function markActivity() {
      lastPointerActivity = now();
      if (idleFadeTl) { idleFadeTl.kill(); idleFadeTl = null; restoreVisibleCards(); }
    }

    function clearQueueAndDom(q) {
      q.forEach(function (el) { gsap.killTweensOf(el); gsap.set(el, { clearProps: 'all' }); });
      activeQueue.length = 0;
      idleFadeTl = null;
      showBgSlidesDebounced();
    }

    function fadeIdleSquash() {
      if (!activeQueue.length) { idleFadeTl = null; return; }
      if (idleFadeTl) idleFadeTl.kill();
      var q = activeQueue.slice();
      idleFadeTl = gsap.timeline({ onComplete: function () { clearQueueAndDom(q); } });
      q.forEach(function (el) {
        gsap.set(el, { transformOrigin: '50% 50%' });
        idleFadeTl.to(el, { opacity: 0, scale: 0, duration: IDLE_FADE_OUT_MS / 1000, ease: 'power2.inOut' }, 0);
      });
    }

    function fadeOnLeave() {
      if (!activeQueue.length) { idleFadeTl = null; showBgSlidesDebounced(); return; }
      if (idleFadeTl) idleFadeTl.kill();
      var q = activeQueue.slice();
      idleFadeTl = gsap.timeline({ onComplete: function () { clearQueueAndDom(q); } });
      q.forEach(function (el) {
        idleFadeTl.to(el, { opacity: 0, duration: LEAVE_FADE_SEC, ease: 'power2.out' }, 0);
      });
    }

    function localPoint(clientX, clientY) {
      var rect = root.getBoundingClientRect();
      return { x: clientX - rect.left + root.scrollLeft, y: clientY - rect.top + root.scrollTop };
    }

    function isPointerOverCta(clientX, clientY) {
      if (!ctaEl) return false;
      var r = ctaEl.getBoundingClientRect();
      var p = CTA_SPAWN_EXCLUDE_PAD;
      return clientX >= r.left - p && clientX <= r.right + p && clientY >= r.top - p && clientY <= r.bottom + p;
    }

    if (slidesRoot) { gsap.set(slidesRoot, { opacity: BG_SLIDES_OPACITY }); startSlideRotation(); }

    root.addEventListener('mouseenter', function (e) {
      pointerInside = true;
      markActivity();
      computeSpawnGap();
      mousePos.x = cachedFollow.x = lastSpawnClient.x = e.clientX;
      mousePos.y = cachedFollow.y = lastSpawnClient.y = e.clientY;
      lastSpawnTime = 0;
    });
    root.addEventListener('mouseleave', function () {
      pointerInside = false;
      activeQueue.length ? fadeOnLeave() : showBgSlidesDebounced();
    });
    root.addEventListener('mousemove', function (e) {
      if (!pointerInside) return;
      hideBgSlides();
      markActivity();
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
    }, { passive: true });

    function imageTrail() {
      var t = now();
      idleTick++;
      if (pointerInside && activeQueue.length && !idleFadeTl && idleTick % IDLE_CHECK_EVERY === 0) {
        if (t - lastPointerActivity >= IDLE_MS) fadeIdleSquash();
      }
      if (!pointerInside) return;

      var lag = Math.hypot(mousePos.x - cachedFollow.x, mousePos.y - cachedFollow.y);
      var pull = Math.min(FOLLOW_PULL_MAX, FOLLOW_BASE + lag * FOLLOW_LAG_GAIN);
      cachedFollow.x = gsap.utils.interpolate(cachedFollow.x, mousePos.x, pull);
      cachedFollow.y = gsap.utils.interpolate(cachedFollow.y, mousePos.y, pull);

      var dist = Math.hypot(cachedFollow.x - lastSpawnClient.x, cachedFollow.y - lastSpawnClient.y);
      if (dist < spawnGapClientPx) return;
      if (t - lastSpawnTime < MIN_SPAWN_MS) return;
      if (isPointerOverCta(cachedFollow.x, cachedFollow.y)) return;

      animateImage();
      lastSpawnClient.x = cachedFollow.x;
      lastSpawnClient.y = cachedFollow.y;
      lastSpawnTime = t;
    }

    function animateImage() {
      markActivity();
      hideBgSlides();

      while (activeQueue.length >= maxConcurrent) {
        var victim = activeQueue.shift();
        if (!victim) break;
        gsap.killTweensOf(victim);
        gsap.set(victim, { clearProps: 'all' });
      }

      var wrappedIndex = wrapper(index);
      var img = flair[wrappedIndex];
      removeFromActive(activeQueue, img);
      gsap.killTweensOf(img);
      gsap.set(img, { clearProps: 'all' });

      var local = localPoint(cachedFollow.x, cachedFollow.y);
      gsap.set(img, {
        opacity: 1, scale: SPAWN_SOFTEN_FROM, transformOrigin: '50% 50%',
        left: 0, top: 0, x: local.x, y: local.y, xPercent: -50, yPercent: -50,
      });
      gsap.to(img, { scale: 1, duration: SPAWN_SOFTEN_DURATION, ease: 'power2.out', overwrite: 'auto' });

      activeQueue.push(img);
      index++;
    }

    tickerFn = imageTrail;
    gsap.ticker.add(tickerFn);

    return function destroy() {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(resizeRaf);
      gsap.ticker.remove(tickerFn);
      if (idleFadeTl) idleFadeTl.kill();
      if (slidesShowTimer) clearTimeout(slidesShowTimer);
      stopSlideRotation();
      if (slidesRoot) gsap.killTweensOf(slidesRoot);
      flair.forEach(function (el) { gsap.killTweensOf(el); });
      activeQueue.length = 0;
    };
  }

  function boot() {
    var seen = typeof WeakSet !== 'undefined' ? new WeakSet() : null;
    var roots = document.querySelectorAll(ROOT_SELECTOR);
    for (var r = 0; r < roots.length; r++) {
      var root = roots[r];
      if (seen && seen.has(root)) continue;
      if (seen) seen.add(root);
      var prev = root._flairCtaDestroy;
      if (typeof prev === 'function') prev();
      root._flairCtaDestroy = init(root);
    }
  }

  if (mqSlideshowOnly && mqSlideshowOnly.addEventListener) {
    mqSlideshowOnly.addEventListener('change', boot);
  } else if (mqSlideshowOnly && mqSlideshowOnly.addListener) {
    mqSlideshowOnly.addListener(boot);
  }

  window.addEventListener('load', boot);
})();
