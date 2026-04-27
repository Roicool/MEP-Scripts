/**
 * VanillaTilt 1.0.0 — tilt efekti, sadece desktop >991px (homepage footer).
 */
(function () {
  if (window.innerWidth <= 991) return;
  window.addEventListener('load', function () {
    var s = {
      max: 4, speed: 1000, glare: true,
      'max-glare': 0.1, scale: 1.01, perspective: 1500,
    };
    ['card-1', 'card-2', 'card-3'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) VanillaTilt.init(el, s);
    });
  });
})();
