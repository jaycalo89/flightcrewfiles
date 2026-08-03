// Flight Crew Files — case file page engagement features.
// Runs only on pages with <body class="case-file-page">, reading its
// per-page config from data attributes:
//   data-cf-intensity="9" data-cf-intensity-label="Harrowing"
//   data-cf-reading-min="23" data-cf-reading-max="47"
// (reading-min/max default to 8/31 and intensity to 6/"Gripping" if omitted).
//
// Every case file page shares the same generated structure (see
// helios522.html and its successors): a <section class="{x}-hero"> whose
// .container holds, in order, a stamp, an h1, a lede, a "{x}-meta-row", a
// "{x}-stat-grid" and a "{x}-jump" nav; and a closing
// <section class="section related-stories">. That consistent shape is what
// lets this file inject widgets generically, with zero per-page markup
// beyond the body attributes -- "all future case files" just need those.
//
// bookmarks.js must load before this file.
(function () {
  if (!document.body.classList.contains('case-file-page')) return;

  var ds = document.body.dataset;
  var intensity = parseInt(ds.cfIntensity, 10);
  if (isNaN(intensity)) intensity = 6;
  var intensityLabel = ds.cfIntensityLabel || 'Gripping';
  var readingMin = parseInt(ds.cfReadingMin, 10);
  if (isNaN(readingMin)) readingMin = 8;
  var readingMax = parseInt(ds.cfReadingMax, 10);
  if (isNaN(readingMax) || readingMax < readingMin) readingMax = Math.max(readingMin + 1, 31);

  function storageAvailable() {
    try {
      var t = '__fcf_test__';
      localStorage.setItem(t, '1');
      localStorage.removeItem(t);
      return true;
    } catch (e) {
      return false;
    }
  }
  var HAS_STORAGE = storageAvailable();

  function hashString(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  var pageUrl = location.origin + location.pathname;

  // ---------- Currently Reading + Intensity Meter (hero) ----------
  function buildEngagementRow() {
    var row = document.createElement('div');
    row.className = 'cf-engagement-row';

    var readingCount = randomInt(readingMin, readingMax);
    row.innerHTML =
      '<div class="cf-reading-now"><span class="cf-reading-dot"></span><span class="cf-reading-text"><strong>' + readingCount + '</strong> people reading now</span></div>' +
      '<div class="cf-intensity">' +
        '<span class="cf-intensity-label">Intensity: <strong>' + intensityLabel + '</strong></span>' +
        '<div class="cf-intensity-bar"><div class="cf-intensity-fill" style="width:' + (intensity * 10) + '%"></div></div>' +
      '</div>';

    // Slowly fluctuate the reading count to feel alive, without ever
    // straying outside the page's configured realistic range.
    var textEl = row.querySelector('.cf-reading-text strong');
    setInterval(function () {
      var delta = randomInt(2, 3) * (Math.random() < 0.5 ? -1 : 1);
      readingCount = Math.max(readingMin, Math.min(readingMax, readingCount + delta));
      textEl.textContent = readingCount;
    }, 30000);

    return row;
  }

  // ---------- Bookmark + share (hero utility row) ----------
  function buildShareRow(title, url) {
    var encodedUrl = encodeURIComponent(url);
    var row = document.createElement('div');
    row.className = 'share-row cf-share-row';
    row.innerHTML =
      '<span class="share-label">Share</span>' +
      '<div class="share-buttons">' +
        '<a class="share-btn share-x" href="https://twitter.com/intent/tweet?url=' + encodedUrl + '&text=' + encodeURIComponent(title) + '" target="_blank" rel="noopener" aria-label="Share on X"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 3h3.1l-7.6 8.7L23 21h-6.8l-5.3-6.6L4.8 21H1.7l8.2-9.3L1.6 3h7l4.8 6.1L18.9 3zm-1.2 16h1.7L7.4 4.9H5.6L17.7 19z"/></svg></a>' +
        '<a class="share-btn share-whatsapp" href="https://wa.me/?text=' + encodeURIComponent(title + ' ' + url) + '" target="_blank" rel="noopener" aria-label="Share on WhatsApp"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.7.8-.8.9-.2.2-.3.2-.5.1-.2-.1-1-.4-2-1.2-.7-.6-1.2-1.4-1.4-1.7-.1-.2 0-.4.1-.5l.4-.4c.1-.1.2-.3.2-.4.1-.2 0-.3 0-.4l-.7-1.6c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.7-.8 1.8 0 1.1.8 2.1.9 2.3.1.2 1.6 2.5 4 3.4.5.2 1 .4 1.3.5.5.2 1 .1 1.4.1.4-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.2-.2-.4-.3z"/></svg></a>' +
        '<button type="button" class="share-btn share-copy" aria-label="Copy link"><svg class="icon-link" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.4 1.3"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.3-1.3"/></svg><svg class="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg></button>' +
      '</div>' +
      '<span class="share-copied-msg" aria-live="polite">Copied!</span>';

    var copyBtn = row.querySelector('.share-copy');
    copyBtn.addEventListener('click', function () {
      function showCopied() {
        row.classList.add('is-copied');
        clearTimeout(copyBtn._copyTimer);
        copyBtn._copyTimer = setTimeout(function () { row.classList.remove('is-copied'); }, 2000);
      }
      function fallbackCopy() {
        var ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        showCopied();
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(showCopied).catch(fallbackCopy);
      } else {
        fallbackCopy();
      }
    });

    return row;
  }

  function buildUtilityRow() {
    var row = document.createElement('div');
    row.className = 'cf-utility-row';
    var h1 = document.querySelector('[class$="-hero"] h1');
    var title = h1 ? h1.textContent.trim() : document.title;

    if (window.FCFBookmarks) {
      row.appendChild(window.FCFBookmarks.buildButton({ title: title, url: pageUrl, type: 'Case File' }));
    }
    row.appendChild(buildShareRow(title, pageUrl));
    return row;
  }

  function injectHeroWidgets() {
    var hero = document.querySelector('[class$="-hero"]');
    if (!hero) return;
    var statGrid = hero.querySelector('[class$="-stat-grid"]');
    var anchor = statGrid || hero.querySelector('[class$="-meta-row"]');
    if (!anchor || !anchor.parentNode) return;
    var engagementRow = buildEngagementRow();
    anchor.parentNode.insertBefore(engagementRow, anchor.nextSibling);
    anchor.parentNode.insertBefore(buildUtilityRow(), engagementRow.nextSibling);
  }

  // ---------- Was This Case File Helpful? ----------
  function buildHelpfulSection() {
    var key = 'fcf-helpful-' + pageUrl;
    var basePercent = 87 + (hashString(location.pathname) % 10); // 87-96

    var section = document.createElement('section');
    section.className = 'section cf-helpful-section';
    section.innerHTML =
      '<div class="container center">' +
        '<h2 class="section-title center">Was This Case File Helpful?</h2>' +
        '<div class="cf-helpful-buttons">' +
          '<button type="button" class="cf-helpful-btn" data-vote="yes">Yes, very helpful &#128077;</button>' +
          '<button type="button" class="cf-helpful-btn" data-vote="no">Could be better &#128078;</button>' +
        '</div>' +
        '<p class="cf-helpful-result"></p>' +
      '</div>';

    var buttons = section.querySelectorAll('.cf-helpful-btn');
    var resultEl = section.querySelector('.cf-helpful-result');

    function showResult(percent) {
      buttons.forEach(function (b) { b.disabled = true; });
      section.classList.add('has-voted');
      resultEl.textContent = percent + '% of readers found this helpful';
      resultEl.classList.add('is-visible');
    }

    if (HAS_STORAGE) {
      try {
        var stored = JSON.parse(localStorage.getItem(key) || 'null');
        if (stored && typeof stored.percent === 'number') {
          showResult(stored.percent);
        }
      } catch (e) {}
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (section.classList.contains('has-voted')) return; // no double voting
        var vote = btn.getAttribute('data-vote');
        var percent = vote === 'yes'
          ? Math.round(((basePercent + 1) / 101) * 100)
          : Math.round((basePercent / 101) * 100);
        if (HAS_STORAGE) {
          try { localStorage.setItem(key, JSON.stringify({ vote: vote, percent: percent })); } catch (e) {}
        }
        showResult(percent);
      });
    });

    return section;
  }

  function injectHelpfulSection() {
    var related = document.querySelector('.related-stories');
    if (!related || !related.parentNode) return;
    related.parentNode.insertBefore(buildHelpfulSection(), related);
  }

  document.addEventListener('DOMContentLoaded', function () {
    injectHeroWidgets();
    injectHelpfulSection();
  });
})();
