/**
 * Navbar 1.0.0 — scroll state + hide/show on scroll direction.
 * Aşağı scroll → navbar yukarı kayar. Yukarı scroll → geri gelir.
 */
(function () {
  window.addEventListener('load', function () {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('Navbar: GSAP veya ScrollTrigger bulunamadı.');
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    var navEls = Array.from(document.querySelectorAll(
      '.navbar_s, .nav_logo_home, .nav-container_grid, [id="add-is-active"]'
    ));
    var navBar = document.querySelector('.nav-wrap');
    var navHidden = false;

    ScrollTrigger.create({
      trigger: 'body',
      start: 'top -50px',
      end: 'bottom top',
      onEnter: function () {
        navEls.forEach(function (el) { el.classList.add('is-active'); });
        if (navBar) navBar.classList.add('is-scrolled');
      },
      onLeaveBack: function () {
        navEls.forEach(function (el) { el.classList.remove('is-active'); });
        if (navBar) navBar.classList.remove('is-scrolled');
        if (navBar && navHidden) {
          navHidden = false;
          gsap.to(navBar, { y: '0%', duration: 0.35, ease: 'power3.inOut', overwrite: 'auto' });
        }
      },
      onUpdate: function (self) {
        if (!navBar) return;
        if (self.direction === 1 && !navHidden) {
          navHidden = true;
          gsap.to(navBar, { y: '-100%', duration: 0.35, ease: 'power3.inOut', overwrite: 'auto' });
        } else if (self.direction === -1 && navHidden) {
          navHidden = false;
          gsap.to(navBar, { y: '0%', duration: 0.35, ease: 'power3.inOut', overwrite: 'auto' });
        }
      },
    });
  });
})();
