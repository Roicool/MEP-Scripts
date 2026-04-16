/**
 * StickyGrid 1.0.0 — .stickygrid: wrapper slide-in, grid reveal + zoom, content toggle.
 */
(function () {
  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('StickyGrid: GSAP veya ScrollTrigger bulunamadı.');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    var block = document.querySelector('.stickygrid');
    if (!block) return;

    var wrapper     = block.querySelector('.stickygrid__wrapper');
    var content     = block.querySelector('.stickygrid__content');
    var title       = block.querySelector('.stickygrid__title');
    var description = block.querySelector('.stickygrid__description');
    var button      = block.querySelector('.stickygrid__button');
    var grid        = block.querySelector('.stickygrid__rack');
    var items       = block.querySelectorAll('.stickygrid__slot');

    if (!wrapper || !grid || !items.length) return;

    var titleOffsetY = 0;
    if (description && button) {
      gsap.set([description, button], { opacity: 0, pointerEvents: 'none' });
    }
    if (content && title) {
      var dy = (content.offsetHeight - title.offsetHeight) / 2;
      titleOffsetY = (dy / content.offsetHeight) * 100;
      gsap.set(title, { yPercent: titleOffsetY });
    }

    var numColumns = 3;
    var columns = Array.from({ length: numColumns }, function () { return []; });
    Array.from(items).forEach(function (item, index) {
      columns[index % numColumns].push(item);
    });

    if (wrapper) {
      gsap.from(wrapper, {
        yPercent: -100, ease: 'none',
        scrollTrigger: {
          trigger: block,
          start: 'top bottom',
          end: 'top top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }

    if (title) {
      gsap.from(title, {
        opacity: 0, duration: 0.7, ease: 'power1.out',
        scrollTrigger: {
          trigger: block,
          start: 'top 57%',
          toggleActions: 'play none none reset',
          invalidateOnRefresh: true,
        },
      });
    }

    function gridRevealTimeline() {
      var tl = gsap.timeline();
      var wh = window.innerHeight;
      var dy = wh - (wh - grid.offsetHeight) / 2;
      columns.forEach(function (column, colIndex) {
        var fromTop = colIndex % 2 === 0;
        tl.from(column, {
          y: dy * (fromTop ? -1 : 1),
          stagger: { each: 0.06, from: fromTop ? 'end' : 'start' },
          ease: 'power1.inOut',
        }, 'grid-reveal');
      });
      return tl;
    }

    function gridZoomTimeline() {
      var tl = gsap.timeline({ defaults: { duration: 1, ease: 'power3.inOut' } });
      tl.to(grid, { scale: 2.05 });
      tl.to(columns[0], { xPercent: -40 }, '<');
      tl.to(columns[2], { xPercent: 40 }, '<');
      tl.to(columns[1], {
        yPercent: function (index) {
          return (index < Math.floor(columns[1].length / 2) ? -1 : 1) * 40;
        },
        duration: 0.5, ease: 'power1.inOut',
      }, '-=0.5');
      return tl;
    }

    function toggleContent(isVisible) {
      if (!title || !description || !button) return;
      gsap.timeline({ defaults: { overwrite: true } })
        .to(title, { yPercent: isVisible ? 0 : titleOffsetY, duration: 0.7, ease: 'power2.inOut' })
        .to([description, button], {
          opacity: isVisible ? 1 : 0, duration: 0.4,
          ease: 'power1.' + (isVisible ? 'inOut' : 'out'),
          pointerEvents: isVisible ? 'all' : 'none',
        }, isVisible ? '-=90%' : '<');
    }

    var mainTl = gsap.timeline({
      scrollTrigger: {
        trigger: block,
        start: 'top top',
        end: '+=' + (window.innerHeight * 4),
        scrub: 2,
        pin: wrapper,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    mainTl
      .add(gridRevealTimeline())
      .add(gridZoomTimeline(), '-=0.6')
      .add(function () {
        toggleContent(mainTl.scrollTrigger.direction === 1);
      }, '-=0.32');

  }

  function waitAndInit() {
    if (window.__lenis) {
      init();
    } else {
      var attempts = 0;
      var timer = setInterval(function () {
        attempts++;
        if (window.__lenis || attempts >= 20) {
          clearInterval(timer);
          init();
        }
      }, 100);
    }
  }

  window.addEventListener('load', waitAndInit);

})();
