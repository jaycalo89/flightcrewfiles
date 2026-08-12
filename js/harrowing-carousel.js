// Flight Crew Files — "Most Harrowing" carousel (homepage).
//
// The section lists every case file rated 9/10 or higher, which is currently
// eleven cards and growing; shown as a plain grid it was the tallest block on
// the page by a wide margin. This pages through them three at a time instead
// (two on a tablet, one on a phone) without dropping any of them.
//
// Built on native scroll snapping rather than a transform track: the browser
// then gives us touch swipe, trackpad flicks, momentum and keyboard scrolling
// for free, and the arrows are just scrollBy() calls. No library, no pointer
// maths, and it degrades to a normal horizontal scroller if the JS never runs.
//
// js/discovery-sections.js fills the track; this file only has to wait for it,
// which it does by polling a few frames rather than depending on script order.
(function () {
  var track = document.getElementById('most-harrowing-grid');
  if (!track) return;

  var root = document.getElementById('most-harrowing-carousel');
  var viewport = track.parentElement;
  var dotsEl = document.getElementById('most-harrowing-dots');
  var status = root.querySelector('.hcar-status');
  var prev = root.querySelector('.hcar-prev');
  var next = root.querySelector('.hcar-next');

  var pageCount = 1;
  var pageIndex = 0;
  var ticking = false;
  var anim = null;

  // Pages are measured, not assumed, so the same code covers the 3 / 2 / 1
  // card breakpoints without knowing which one is active.
  //
  // Page count comes from the cards, not from scrollWidth / viewportWidth:
  // the gaps between cards push the track a fraction of a page wider than the
  // cards alone, and dividing by viewport width rounds that fraction up into
  // a whole extra page — an eleventh dot for ten cards, which can never be
  // the active one because scrolling clamps before it.
  function measure() {
    var w = viewport.clientWidth;
    if (!w) return;

    var cards = track.children;
    var first = null;
    for (var i = 0; i < cards.length; i++) {
      if (cards[i].nodeType === 1 && cards[i].tagName !== 'NOSCRIPT') { first = cards[i]; break; }
    }
    if (!first) { pageCount = 1; buildDots(); sync(); return; }

    var count = 0;
    for (var j = 0; j < cards.length; j++) {
      if (cards[j].nodeType === 1 && cards[j].tagName !== 'NOSCRIPT') count++;
    }

    var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    var step = first.getBoundingClientRect().width + gap;
    var perView = step > 0 ? Math.max(1, Math.round(w / step)) : 1;

    pageCount = Math.max(1, Math.ceil(count / perView));
    // Sub-pixel column maths can leave a pixel or two of phantom overflow.
    if (track.scrollWidth - w <= 4) pageCount = 1;

    buildDots();
    sync();
  }

  function buildDots() {
    if (dotsEl.children.length === pageCount) return;
    dotsEl.innerHTML = '';
    if (pageCount < 2) { root.classList.add('is-static'); return; }
    root.classList.remove('is-static');
    for (var i = 0; i < pageCount; i++) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'hcar-dot';
      dot.setAttribute('aria-label', 'Go to page ' + (i + 1) + ' of ' + pageCount);
      dot.dataset.page = i;
      dotsEl.appendChild(dot);
    }
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function cancelAnim() {
    if (anim === null) return;
    cancelAnimationFrame(anim);
    anim = null;
    viewport.style.scrollSnapType = '';
  }

  // The slide is animated here rather than handed to scrollTo({behavior:'smooth'}),
  // which is a no-op in some browsers and browser configurations — writing
  // scrollLeft directly always works. Snapping is switched off for the duration:
  // with `mandatory` in force every per-frame write would be pulled to the
  // nearest card edge and the slide would judder from card to card instead of
  // gliding. Touch swipes still get native snapping, which is the point of it.
  function animateTo(left) {
    cancelAnim();
    var start = viewport.scrollLeft;
    var delta = left - start;
    if (Math.abs(delta) < 1) return;

    // Jump straight there when there is no animation worth running: reduced
    // motion, or a background tab, where requestAnimationFrame never fires and
    // an rAF-driven slide would leave the carousel stuck on the old page.
    if (prefersReducedMotion() || document.hidden) {
      viewport.scrollLeft = left;
      sync();
      return;
    }

    viewport.style.scrollSnapType = 'none';
    var t0 = null;
    var DURATION = 420;
    (function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / DURATION);
      var eased = 1 - Math.pow(1 - p, 3);
      viewport.scrollLeft = start + (delta * eased);
      if (p < 1) { anim = requestAnimationFrame(step); }
      else { anim = null; viewport.style.scrollSnapType = ''; sync(); }
    })(performance.now());
  }

  function goTo(i) {
    var w = viewport.clientWidth;
    var max = track.scrollWidth - w;
    animateTo(Math.max(0, Math.min(i * w, max)));
  }

  function sync() {
    var w = viewport.clientWidth;
    if (!w) return;
    var max = track.scrollWidth - w;
    var left = viewport.scrollLeft;

    // Round to the nearest page, but treat "scrolled to the end" as the last
    // page even when the final page is a partial one — otherwise the last dot
    // can never light up on a set that doesn't divide evenly.
    pageIndex = left >= max - 2 ? pageCount - 1 : Math.round(left / w);
    if (pageIndex < 0) pageIndex = 0;
    if (pageIndex > pageCount - 1) pageIndex = pageCount - 1;

    for (var i = 0; i < dotsEl.children.length; i++) {
      var dot = dotsEl.children[i];
      var on = i === pageIndex;
      dot.classList.toggle('is-active', on);
      if (on) { dot.setAttribute('aria-current', 'true'); }
      else { dot.removeAttribute('aria-current'); }
    }

    prev.disabled = left <= 2;
    next.disabled = left >= max - 2;
    if (status) { status.textContent = 'Page ' + (pageIndex + 1) + ' of ' + pageCount; }
  }

  prev.addEventListener('click', function () { goTo(pageIndex - 1); });
  next.addEventListener('click', function () { goTo(pageIndex + 1); });

  dotsEl.addEventListener('click', function (e) {
    var dot = e.target.closest ? e.target.closest('.hcar-dot') : null;
    if (dot) goTo(Number(dot.dataset.page));
  });

  viewport.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; sync(); });
  }, { passive: true });

  // A swipe, wheel or drag mid-slide should take over immediately rather than
  // fight the animation for the scroll position.
  ['pointerdown', 'wheel', 'touchstart'].forEach(function (evt) {
    viewport.addEventListener(evt, cancelAnim, { passive: true });
  });

  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(pageIndex - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); goTo(pageIndex + 1); }
  });

  // Every card stays in the tab order, so tabbing into an off-screen one would
  // otherwise scroll the viewport to a position the dots don't agree with.
  // Re-sync instead of trapping focus — all the content stays reachable.
  track.addEventListener('focusin', function () {
    requestAnimationFrame(sync);
  });

  // discovery-sections.js appends the cards on DOMContentLoaded, and this file
  // is a deferred script so it runs before that. Rather than guess at script
  // order or poll for a fixed number of frames, watch for the cards arriving:
  // measure() is idempotent, so firing it repeatedly is harmless.
  if (window.MutationObserver) {
    new MutationObserver(measure).observe(track, { childList: true });
  }
  // Covers width changes, the font swap, and the first layout in one — and is
  // what actually gets the carousel measured if the cards were already there.
  if (window.ResizeObserver) {
    new ResizeObserver(measure).observe(viewport);
  } else {
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(measure, 150);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', measure);
  } else {
    measure();
  }
  window.addEventListener('load', measure);
})();
