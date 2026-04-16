/**
 * FeatureSlider 3.4.5 — fi-item / fi-slot, GSAP cdnjs (footer).
 * Kaynak: backup-2026-04-04 (CDN ile aynı mantık).
 */
(function () {
var fn = function () {
  var t = 4,
    c = 0,
    p = false,
    tw = null,
    f = document.getElementById('fi-progress-fill') || document.querySelector('.fi-progress-fill'),
    pe = document.getElementById('fi-pause'),
    pi = document.getElementById('fi-pause-icon'),
    pl = document.getElementById('fi-play-icon');
  var st = document.createElement('style');
  st.textContent =
    '#fi-progress-fill,.fi-progress-fill{width:100%!important;transform-origin:left center;will-change:transform;}';
  document.head.appendChild(st);
  function act(n) {
    c = n;
    for (var i = 0; i < t; i++) {
      var a = document.getElementById('fi-item-' + i),
        b = document.getElementById('fi-content-' + i),
        d = document.getElementById('fi-image-' + i),
        s = document.getElementById('fi-slot-' + i);
      if (a) a.classList.toggle('is-active', i === n);
      if (b) b.style.display = i === n ? '' : 'none';
      if (d) gsap.to(d, { opacity: i === n ? 1 : 0, duration: 0.6, ease: 'power2.inOut' });
      if (s) {
        s.classList.toggle('is-active', i === n);
        if (i === n && f) s.appendChild(f);
      }
    }
    if (f) {
      if (tw) tw.kill();
      gsap.set(f, { scaleX: 0 });
      tw = gsap.to(f, {
        scaleX: 1,
        duration: 6,
        ease: 'none',
        onComplete: function () {
          act((c + 1) % t);
        },
      });
    }
  }
  for (var i = 0; i < t; i++) {
    (function (x) {
      var e = document.getElementById('fi-item-' + x);
      if (e)
        e.addEventListener('click', function () {
          act(x);
        });
    })(i);
  }
  if (pe)
    pe.addEventListener('click', function () {
      p = !p;
      if (p) {
        if (tw) tw.pause();
        pe.classList.add('is-paused');
        if (pi) pi.style.display = 'none';
        if (pl) pl.style.display = 'block';
      } else {
        if (tw) tw.resume();
        pe.classList.remove('is-paused');
        if (pi) pi.style.display = 'block';
        if (pl) pl.style.display = 'none';
      }
    });
  if (pl) pl.style.display = 'none';
  act(0);
};

// gsap is already loaded globally — no CDN fetch needed
document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', fn)
  : fn();
})();
