(function () {
  function boot() {
    if (typeof gsap === 'undefined' || typeof Draggable === 'undefined') {
      setTimeout(boot, 50);
      return;
    }

    gsap.registerPlugin(Draggable);

    var letter    = document.querySelector('.letter-card');
    var polaroids = document.querySelectorAll('.polaroid');
    if (!letter || !polaroids.length) return;

    var desktopRotations = [-28, 17, 23, 11, 15, -15, 8, -19, -35, -11];
    var mobileRotations  = [-15, 11, -65, -16, -19, 17];
    var isMobile = window.innerWidth < 768;
    var rotations = isMobile ? mobileRotations : desktopRotations;

    polaroids.forEach(function (photo, i) {
      if (isMobile && i >= 6) return;
      var scale = (isMobile && i === 1) ? 1.03 : 1;
      gsap.set(photo, { rotation: rotations[i] || 0, scale: scale });
    });

    function isOverlapping(el) {
      var a = el.getBoundingClientRect();
      var b = letter.getBoundingClientRect();
      var margin = 16;
      return !(
        a.right  < b.left   + margin ||
        a.left   > b.right  - margin ||
        a.bottom < b.top    + margin ||
        a.top    > b.bottom - margin
      );
    }

    polaroids.forEach(function (photo) {
      var lastX = 0;
      var lastY = 0;

      Draggable.create(photo, {
        type: 'x,y',
        onDragStart: function () {
          lastX = this.x;
          lastY = this.y;
          photo.classList.add('is-dragging');
          gsap.set(photo, { zIndex: 9 });
          gsap.to(photo, { scale: 1.04, duration: 0.2, ease: 'power2.out' });
        },
        onDrag: function () {
          if (!isOverlapping(photo)) {
            lastX = this.x;
            lastY = this.y;
          }
        },
        onDragEnd: function () {
          photo.classList.remove('is-dragging');
          gsap.to(photo, { scale: 1, duration: 0.25, ease: 'power2.out' });

          if (isOverlapping(photo)) {
            gsap.to(photo, {
              x: lastX,
              y: lastY,
              duration: 0.45,
              ease: 'back.out(1.7)',
            });
          }
        },
      });
    });
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', boot)
    : boot();
})();
