// Flight Crew Files — renders the homepage Case Files row from CASE_FILES
// (see js/case-files-data.js). Static local data, so this renders synchronously
// on DOMContentLoaded — no fetch, no skeleton state needed.
//
// The homepage shows a hand-picked three rather than the whole archive: the
// three most-searched cases on the site, in a deliberate order. Everything
// else lives in the Black Box Files archive, which the link under the row
// points at. To change the picks, edit HOMEPAGE_PICKS — each string must
// match an entry's `url` in case-files-data.js exactly, and an unmatched
// string is skipped rather than rendering a broken card.
(function () {
  var HOMEPAGE_PICKS = [
    'helios522.html',
    'tenerife-disaster.html',
    'mh370.html'
  ];

  var FALLBACK_IMAGE = 'images/site/tbf-avenger-formation-fallback.jpg';

  // Same 5-band scale as js/case-file-features.js and js/featured-case-file.js.
  var INTENSITY_SCALE = [
    { max: 2, label: 'Informative', color: '#22c55e' },
    { max: 4, label: 'Engaging', color: '#3b82f6' },
    { max: 6, label: 'Gripping', color: '#eab308' },
    { max: 8, label: 'Disturbing', color: '#f97316' },
    { max: 10, label: 'Harrowing', color: '#ef4444' }
  ];
  function intensityInfo(n) {
    for (var i = 0; i < INTENSITY_SCALE.length; i++) {
      if (n <= INTENSITY_SCALE[i].max) return INTENSITY_SCALE[i];
    }
    return INTENSITY_SCALE[INTENSITY_SCALE.length - 1];
  }

  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  function buildCard(entry) {
    var intensity = entry.intensity || 6;
    var meta = intensityInfo(intensity);
    var credit = entry.imageCredit;

    var card = document.createElement('article');
    card.className = 'case-file-card cfp-card';
    card.style.setProperty('--accent', entry.accent || '#2e8fff');
    card.style.setProperty('--intensity', meta.color);

    // The media link duplicates the title link, so it is taken out of the tab
    // order and hidden from assistive tech — the heading and the button below
    // both reach the same page.
    card.innerHTML =
      '<a class="cfp-media" tabindex="-1" aria-hidden="true">' +
        '<img loading="lazy" alt="" decoding="async">' +
        '<span class="cfp-intensity"></span>' +
      '</a>' +
      '<div class="cfp-body">' +
        '<span class="cfp-kicker"></span>' +
        '<h3 class="cfp-title"><a></a></h3>' +
        '<p class="cfp-line"></p>' +
        '<a class="btn btn-gold cfp-open">Open File ' + ARROW + '</a>' +
      '</div>';

    var url = entry.url || '#';
    card.querySelector('.cfp-media').href = url;
    card.querySelector('.cfp-title a').href = url;
    card.querySelector('.cfp-title a').textContent = entry.title || '';
    card.querySelector('.cfp-open').href = url;

    var img = card.querySelector('.cfp-media img');
    img.src = entry.image || FALLBACK_IMAGE;
    img.alt = entry.title || '';
    if (credit && credit.text) { img.title = credit.text; }

    var pill = card.querySelector('.cfp-intensity');
    pill.textContent = meta.label + ' · ' + intensity + '/10';

    var kicker = [entry.tag, entry.date].filter(Boolean).join(' · ');
    card.querySelector('.cfp-kicker').textContent = kicker;

    // pullQuote is the one-sentence hook every entry carries for the featured
    // hero; excerpt is a full paragraph and too long for a card this size.
    card.querySelector('.cfp-line').textContent = entry.pullQuote || entry.excerpt || '';

    if (credit && credit.text) {
      var creditEl = document.createElement(credit.url ? 'a' : 'span');
      creditEl.className = 'cfp-credit';
      creditEl.textContent = credit.text;
      if (credit.url) {
        creditEl.href = credit.url;
        creditEl.target = '_blank';
        creditEl.rel = 'noopener';
      }
      card.querySelector('.cfp-media').appendChild(creditEl);
    }

    if (window.FCFBookmarks) {
      card.querySelector('.cfp-body').appendChild(window.FCFBookmarks.buildButton({
        title: entry.title,
        url: entry.url,
        type: entry.tag || 'Case File'
      }));
    }

    return card;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var grid = document.getElementById('case-files-grid');
    if (!grid || typeof CASE_FILES === 'undefined' || !CASE_FILES.length) return;

    var byUrl = {};
    CASE_FILES.forEach(function (entry) { byUrl[entry.url] = entry; });

    var picks = HOMEPAGE_PICKS.map(function (url) { return byUrl[url]; }).filter(Boolean);
    if (!picks.length) return;

    grid.innerHTML = '';
    picks.forEach(function (entry) {
      grid.appendChild(buildCard(entry));
    });

    // Keep the archive link's count honest as case files are added.
    var countEl = document.getElementById('cf-archive-count');
    if (countEl) { countEl.textContent = CASE_FILES.length; }
  });
})();
