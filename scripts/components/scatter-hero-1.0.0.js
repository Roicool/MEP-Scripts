(function () {
  'use strict';

  var BP_DESKTOP = 1024;

  function init() {
    var section = document.querySelector('.section-sh');
    if (!section) return;

    var scene = section.querySelector('.sh__scene');
    if (!scene) return;

    gsap.registerPlugin(ScrollTrigger);

    var desktop = window.innerWidth >= BP_DESKTOP;

    if (!desktop) {
      section.dataset.loaded = 'true';
      return;
    }

    var imagesWrap = section.querySelector('.sh__images');
    var copyInner  = section.querySelector('.sh__copy-inner');
    var imgInners  = section.querySelectorAll('.sh__img-inner');
    var imgPics    = section.querySelectorAll('.sh__img-inner picture');
    var vh         = window.innerHeight;
    var pad        = parseFloat(getComputedStyle(section).paddingTop) || 0;

    gsap.set(imagesWrap, {
      xPercent: -50,
      yPercent: -50,
      transformPerspective: 1000,
      transformStyle: 'preserve-3d',
      force3D: true
    });
    gsap.set(copyInner, {
      transformPerspective: 1000,
      force3D: true
    });

    // 1. Pin scene — padding scroll edildikten sonra başlar
    ScrollTrigger.create({
      trigger: section,
      start: 'top+=' + pad + ' top',
      end: '+=' + (vh * 1.5),
      pin: scene,
      pinSpacing: true
    });

    // 2. Zoom-out (one-shot): padding + 200px sonra tetiklenir
    var zoomTl = gsap.timeline({ paused: true });
    zoomTl
      .to(imagesWrap,
        { z: -700, duration: 0.6, ease: 'sine.out', force3D: true },
        0)
      .to(copyInner,
        { opacity: 0, duration: 0.3, ease: 'power2.out' },
        0)
      .to(copyInner,
        { z: -100, duration: 0.6, ease: 'sine.out', force3D: true },
        0);

    ScrollTrigger.create({
      trigger: section,
      start: 'top+=' + (pad + 200) + ' top',
      end: '+=' + vh,
      toggleActions: 'play none none reverse',
      animation: zoomTl
    });

    // 3. Rise (scrub): padding + 500px sonra tetiklenir
    var riseTl = gsap.timeline();
    riseTl
      .fromTo(imgPics,
        { yPercent: 0 },
        { yPercent: -100, ease: 'sine.in', duration: 0.5, overwrite: 'auto', force3D: true },
        0)
      .fromTo(imgInners,
        { y: 0 },
        { y: -(vh * 1.25), ease: 'none', duration: 1, overwrite: 'auto', force3D: true },
        0);

    ScrollTrigger.create({
      trigger: section,
      start: 'top+=' + (pad + 500) + ' top',
      end: '+=' + (vh * 1.5),
      scrub: 1,
      animation: riseTl
    });

    section.dataset.loaded = 'true';
  }

  function waitAndInit() {
    if (window.__lenis) { init(); return; }
    var attempts = 0;
    var timer = setInterval(function () {
      attempts++;
      if (window.__lenis || attempts >= 20) { clearInterval(timer); init(); }
    }, 100);
  }

  window.addEventListener('load', waitAndInit);
}());
