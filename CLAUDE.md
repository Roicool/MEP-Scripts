# MEP Custom Scripts — Project Reference

## Overview

This repository contains a library of production-ready vanilla JavaScript animation scripts built for **Webflow** sites. All scripts are self-executing IIFEs (Immediately Invoked Function Expressions) with no module system. They are loaded as CDN scripts inside Webflow's embed blocks or page settings.

**Tech stack:** GSAP (with ScrollTrigger, Flip, SplitText, Draggable plugins), Swiper.js, Lenis (smooth scroll), VanillaTilt — all loaded globally via CDN before these scripts run.

**Language context:** Comments and variable names are sometimes in Turkish (this is intentional for the team).

---

## Directory Structure

```
mep-cs/
├── current/              ← Active production scripts (load these via CDN)
├── backup/               ← Inline script backups from before CDN migration
├── webflow-scripts/
│   └── backup-2026-04-04/ ← Versioned backups of older script iterations
├── cursor-flair-cta/     ← Standalone HTML prototype for flair-cta
└── marquee-draggable/    ← Standalone HTML prototype for draggable marquee
```

---

## Scripts Reference (`current/`)

### Core Infrastructure

#### `lenis-1.0.0.js`
- **Purpose:** Smooth scroll initialization. Must load first — other scripts wait for `window.__lenis`.
- **Dependencies:** GSAP, Lenis CDN
- **Sets:** `window.__lenis = lenis` (global sentinel used by other scripts)
- **Config:** lerp=0.1, wheelMultiplier=0.7, GSAP ticker integrated (not RAF)

#### `navbar-1.0.0.js`
- **Purpose:** Scroll-direction-aware navbar hide/show + scroll state classes.
- **Dependencies:** GSAP, ScrollTrigger
- **DOM:** `.navbar_s`, `.nav_logo_home`, `.nav-container_grid`, `#add-is-active`, `.nav-wrap`

---

### Animation Primitives

#### `entrance-1.0.0.js`
- **Purpose:** Scroll-reveal animation for any element. Data-attribute driven.
- **Dependencies:** GSAP, ScrollTrigger. Waits for `window.__lenis`.
- **Usage:**
  ```html
  <p data-entrance="bottom">Text</p>
  <h2 data-entrance="left" data-entrance-delay="0.15">Heading</h2>
  ```
- **Attributes:** `data-entrance` (left|right|top|bottom), `data-entrance-delay` (seconds), `data-entrance-start` (ScrollTrigger start, default: "top 88%"), `data-entrance-trigger` (scroll|load)
- **Config:** distance=52px, duration=0.9s, ease=power4.out

#### `parallax-1.0.0.js`
- **Purpose:** Scroll parallax on images or designated elements inside sections.
- **Dependencies:** GSAP, ScrollTrigger. Waits for `window.__lenis`.
- **Usage:**
  ```html
  <section data-parallax>        <!-- auto-finds first img -->
  <section data-parallax="0.3">  <!-- custom intensity -->
  ```
- **Note:** Moves the child element, not the section — prevents layout disruption.

#### `img-reveal-1.0.0.js`
- **Purpose:** Scroll-scrub reveal (opacity + scale + translateY). Reverses on scroll-back.
- **Dependencies:** GSAP, ScrollTrigger
- **Usage:** `<div data-img-reveal>` on any element

#### `scrollcolor-1.0.0.js`
- **Purpose:** Background color transitions triggered by scroll position.
- **Dependencies:** GSAP, ScrollTrigger
- **Usage:**
  ```html
  <section data-scroll-color="#1a1a2e">
  <section data-scroll-color="#000" data-scroll-color-reverse="false">
  <section data-scroll-color="oklch(20% 0.05 260)" data-scroll-color-scrub="true">
  ```
- **Attributes:** `data-scroll-color`, `data-scroll-color-from`, `data-scroll-color-start`, `data-scroll-color-end`, `data-scroll-color-reverse`, `data-scroll-color-scrub`

#### `scrollscale-1.0.0.js`
- **Purpose:** Enter from large → normal scale; exit normal → small + fade. GPU-composited.
- **Dependencies:** GSAP, ScrollTrigger. Waits for `window.__lenis`.
- **Usage:**
  ```html
  <section data-scroll-scale>
  <section data-scroll-scale="0.12">       <!-- custom amount -->
  <section data-scroll-scale data-scroll-scale-enter="false">  <!-- exit only -->
  ```

#### `fill-text-1.0.0.js`
- **Purpose:** Scroll-scrub text fill animation (dark → light per line).
- **Dependencies:** GSAP, ScrollTrigger, SplitText (GSAP premium plugin)
- **Usage:** `<p class="fill-text">` — uses `document.fonts.ready` to avoid FOUT

---

### Complex Components

#### `hero-1.0.0.js`
- **Purpose:** Pinned two-scene hero. S1=heading/description/buttons/bar/marquee, S2=stats counter/case swiper/tagline.
- **Dependencies:** GSAP, ScrollTrigger, Swiper. Waits for `window.__lenis`.
- **Config:** PIN_LENGTH=2.5 (250vh), SCRUB=2.5, BP_DESKTOP=992px

#### `fsc-1.0.0.js` — Fullscreen Section Cases
- **Purpose:** Fullscreen section with scroll scale-in (0.88→1.0) + auto-advancing tabs with progress fill bars, animated bg/video/content transitions.
- **Dependencies:** GSAP, ScrollTrigger. Waits for `window.__lenis`.
- **Config:** AUTO_DELAY=9000ms, SCRUB=1, DUR=0.85s, SCALE_FROM=0.88
- **DOM:**
  ```
  section.section-fsc
    div.fsc__list  ← Webflow CMS Collection List (hidden after init)
      div.fsc__item  ← one per slide
        div.fsc__bg
        div.fsc__video
        div.fsc__tab > span.fsc__tab-label + div.fsc__tab-bar > div.fsc__tab-bar-fill
        div.fsc__content
  ```
- **Note:** Script extracts DOM from CMS list and reorganizes into bg-track/inner structure. The CMS list is hidden (`display:none`) after init.

#### `flair-cta-1.0.0.js`
- **Purpose:** Cursor image-trail effect within `.section-flair-cta`. On tablet (≤991px): slideshow only (no trail).
- **Dependencies:** GSAP
- **DOM:**
  ```
  .section-flair-cta  (or .flair-cta)
    .flair-cta__slides > .flair-cta__slide  ← background slideshow
    .flair-cta__flair[]                     ← trail tile images
    .flair-cta__cta                         ← excluded from spawn zone
  ```
- **Config:** BG_SLIDE_INTERVAL_MS=4000, MAX_ACTIVE_CAP=9, IDLE_MS=950, MIN_SPAWN_MS=72
- **Prototype:** `cursor-flair-cta/index.html`

#### `featureslider-3.4.5.js`
- **Purpose:** Auto-advancing feature tabs with GSAP progress bar fill. 4 items.
- **Dependencies:** GSAP (globally loaded)
- **DOM IDs:** `fi-item-{0-3}`, `fi-content-{0-3}`, `fi-image-{0-3}`, `fi-slot-{0-3}`, `fi-progress-fill`, `fi-pause`, `fi-pause-icon`, `fi-play-icon`
- **Config:** 4 tabs hardcoded (`t=4`), 6-second fill duration

#### `growswiper-1.4.3.js`
- **Purpose:** Centered Swiper carousel with expanding tabs (slots), GSAP progress fill, pause control.
- **Dependencies:** GSAP, Swiper
- **DOM IDs:** `grow-section`, `grow-swiper`, `grow-fi-slot-{n}`, `grow-fi-progress-fill`, `grow-fi-pause`, `grow-fi-pause-icon`, `grow-fi-play-icon`
- **DOM Classes:** `.swiper-button[data-grow-slide]`, `.grow-slide-{n}` (optional, for ordering)
- **Config:** loop=true, autoplay delay=6700ms, centeredSlides=true

#### `blogslider-1.0.0.js`
- **Purpose:** Custom-controlled Swiper blog slider with dot pagination + prev/next arrows. No loop. Custom opacity for inactive slides.
- **Dependencies:** Swiper
- **DOM IDs:** `blog-slider-section`, `blog-swiper`, `blog-swiper-pagination`
- **Config:** AUTOPLAY_MS=8000, spaceBetween=24, speed=700

#### `mobcardswiper-1.1.2.js`
- **Purpose:** Swiper carousel for cards, mobile only (< 992px). Progress bar pagination.
- **Dependencies:** Swiper
- **DOM:** `.mobilde-swiper` (Swiper container)
- **Note:** Entire script is a no-op on desktop (early return if `window.innerWidth >= 992`)

#### `sticky-tabs-1.0.0.js`
- **Purpose:** Scroll-pinned tabbed content. Each tab fills a progress bar as scroll advances. Image transitions via clip-path + translateY wipe.
- **Dependencies:** GSAP, ScrollTrigger. Waits for `window.__lenis`.
- **DOM:**
  ```
  section.section-st
    div.st__left
      div.st__contents > div.st__content[]  ← text content per tab
      div.st__items > div.st__item[]        ← tab nav items
        span.st__item-label
        div.st__item-track > div.st__item-fill
    div.st__right
      div.st__slides > div.st__slide[]      ← images per tab
  ```

#### `stickygrid-1.0.0.js`
- **Purpose:** Wrapper slide-in on scroll + grid image reveal with zoom + content toggle.
- **Dependencies:** GSAP, ScrollTrigger
- **DOM:** `.stickygrid`, `.stickygrid__wrapper`, `.stickygrid__content`, `.stickygrid__title`, `.stickygrid__description`, `.stickygrid__button`

#### `ic-1.0.0.js`
- **Purpose:** Horizontally expanding cards on hover. Mouse-tracked category image on desktop (> 1024px).
- **Dependencies:** GSAP
- **DOM:** `.ic` (section), `.ic__card[]` (cards)
- **Responsive:** width expand on desktop, height expand on mobile (< 768px)

#### `gallery-flip-1.0.0.js`
- **Purpose:** GSAP Flip scroll animation — gallery morphs from default to final layout while pinned.
- **Dependencies:** GSAP, ScrollTrigger, Flip plugin
- **DOM:** `#gallery-8`, `.gallery__item[]`, `.gallery--final` (CSS class for final state)
- **Behavior:** Debounced resize (200ms) re-creates tween

#### `vex-1.0.0.js` — Video Expand Section
- **Purpose:** Pinned 3-phase scroll animation: card → full-bleed → blur + text → 2-column grid.
- **Dependencies:** GSAP, ScrollTrigger. Waits for `window.__lenis`.
- **Config:** PIN_VH=3.5 (pin scroll = 3.5× viewport height), SCRUB=1, CARD_V=32px, CARD_H_PCT=5%, CARD_RADIUS=20px
- **Phases:**
  - **0→1** `clip-path` card → full-bleed (GPU composited)
  - **1→2** `backdrop-filter` blur overlay + headline text slide-up
  - **2→3** headline fades out, 2-column grid fades in (left slides from -56px, right from +32px)
- **DOM:**
  ```
  section.section-vex
    div.vex__bg > video or img     ← full-fill background media
    div.vex__blur                  ← backdrop-filter overlay (Phase 1)
    div.vex__headline              ← centered text (Phase 1)
    div.vex__grid                  ← 50/50 grid (Phase 2)
      div.vex__left                ← tabs + content (white bg)
      div.vex__right               ← product screenshot (img or video)
  ```
- **Pointer events:** Grid gets `is-interactive` class at 75%+ scroll progress (toggled via `onUpdate`).
- **Responsive:** Below 768px, grid stacks vertically (1fr / 1fr rows).
- **Tab switching:** Not handled by VEX — use Webflow Tabs or the inline snippet in `vex-ref.html`.
- **Reference:** `current/vex-ref.html`

#### `gallery-flip-reverse-1.0.0.js`
- **Purpose:** Same as gallery-flip but reversed — starts at final state, opens on scroll.
- **Dependencies:** GSAP, ScrollTrigger, Flip plugin
- **DOM:** Same as gallery-flip-1.0.0.js

#### `splitcards-1.0.0.js`
- **Purpose:** Three-card reveal: A and C slide in from sides, B settles with scale. One-shot (self-destroys after firing).
- **Dependencies:** GSAP, ScrollTrigger. Waits for `window.__lenis`.
- **Config:** DURATION=0.68s, SLIDE_X=48px, B_SCALE=1.04
- **Prototype:** `current/splitcards-ref.html`

#### `marquee-1.0.0.js`
- **Purpose:** Scroll-speed-linked marquee on desktop; Swiper carousel on mobile (< 768px).
- **Dependencies:** GSAP, ScrollTrigger; Swiper on mobile
- **DOM:** `.mq` (section), `.mq__overflow`, `.mq__track`, `.mq__item[]`

#### `polaroid-drag-1.0.0.js`
- **Purpose:** Draggable polaroid photo pile with rotation. Letter card acts as a center anchor.
- **Dependencies:** GSAP, Draggable plugin
- **DOM:** `.letter-card`, `.polaroid[]`
- **Config:** Desktop uses 10 rotations, mobile uses 6 (only first 6 polaroids shown on mobile)

#### `vanilla-tilt-1.0.0.js`
- **Purpose:** 3D tilt effect on cards, desktop only (> 991px).
- **Dependencies:** VanillaTilt CDN
- **DOM IDs:** `card-1`, `card-2`, `card-3`
- **Config:** max=4, scale=1.01, glare=true, max-glare=0.1

---

## Global Conventions

### Script Loading Order (critical)
1. `lenis-1.0.0.js` — must be first (sets `window.__lenis`)
2. All other scripts — safe to load in any order after lenis

### Initialization Pattern
Scripts that depend on `window.__lenis` poll for it (20 attempts × 100ms = 2s timeout), then init regardless. This prevents deadlocks if Lenis fails to load.

```js
// Pattern used by: entrance, fsc, sticky-tabs, splitcards, scrollscale, parallax
function waitAndInit() {
  if (window.__lenis) { init(); return; }
  var attempts = 0;
  var timer = setInterval(function () {
    attempts++;
    if (window.__lenis || attempts >= 20) { clearInterval(timer); init(); }
  }, 100);
}
window.addEventListener('load', waitAndInit);
```

Scripts without Lenis dependency use `DOMContentLoaded` or `window.load` directly.

### Performance Rules
- All animations use **transform + opacity only** — no layout/paint triggers
- `will-change` is set dynamically (before animation) and cleared after (`'auto'`)
- `force3D: true` on GSAP tweens for GPU compositing
- `overwrite: 'auto'` to prevent tween stacking

### Versioning
Files follow `name-MAJOR.MINOR.PATCH.js` semver. Breaking DOM changes = major bump. New features = minor. Bug fixes = patch.

### No Modules / No Build Step
All scripts are plain ES5-compatible IIFEs. No TypeScript, no bundler, no npm. Deploy by uploading to a CDN and pasting the URL into Webflow's script embed.

---

## Standalone Prototypes

### `cursor-flair-cta/`
HTML prototype for `flair-cta-1.0.0.js`. Open `index.html` directly in a browser to test the cursor trail and slideshow behavior without Webflow.

### `marquee-draggable/`
HTML prototype for a draggable GSAP marquee (different from `marquee-1.0.0.js` — this one supports drag-to-scroll). Files: `index.html`, `marquee.js`, `marquee.css`.

---

## When Editing Scripts

1. **Test in the prototype HTML first** (if one exists), then copy to `current/`.
2. **Bump the patch version** in the filename on any change.
3. **Do not add error handling** for missing DOM elements beyond the existing early-return pattern — Webflow pages are controlled environments.
4. **Do not convert to ES6+** — Webflow's CDN targets browsers that may not support modern syntax without a transpiler.
5. **Keep each script self-contained** — no imports, no shared state between files except `window.__lenis`.
