// Flight Crew Files — homepage Featured Case File hero + "You Might Have
// Missed" section. Both are picked deterministically from CASE_FILES (see
// js/case-files-data.js) using js/discovery-core.js, so every visitor sees
// the same picks for a given ISO week and they rotate automatically every
// Monday with zero manual step.
//
// discovery-core.js and case-files-data.js must load before this file.
(function () {
  var ICONS = {
    'Black Box Files': '<rect x="4" y="8" width="16" height="10" rx="2"/><circle cx="12" cy="13" r="2"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',
    'Heroic Moments': '<path d="M12 2l2.4 6.6L21 9l-5.5 4.6L17 21l-5-3.6L7 21l1.5-7.4L3 9l6.6-.4z"/>',
    'Scary Stories': '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>',
    'Bizarre & Unexplained': '<path d="M12 2c2 3 3 6.5 3 10s-1 8-3 10c-2-2-3-6.5-3-10s1-7 3-10z"/><path d="M2 12c3-2 6.5-3 10-3s8 1 10 3c-2 2-6.5 3-10 3s-7-1-10-3z"/>',
    'UAP Files': '<ellipse cx="12" cy="13" rx="9" ry="3"/><ellipse cx="12" cy="13" rx="4" ry="1.4"/><path d="M12 10V4"/><circle cx="12" cy="3" r="1" fill="currentColor" stroke="none"/>'
  };
  var DEFAULT_ICON = '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>';

  // Same 5-band scale as js/case-file-features.js's per-page intensity pill.
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

  function renderFeaturedHero(entry) {
    var mount = document.getElementById('featured-case-file');
    if (!mount || !entry) return;
    var meta = intensityInfo(entry.intensity || 6);
    mount.style.setProperty('--accent', entry.accent || '#2e8fff');
    mount.innerHTML =
      '<div class="fch-media"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">' +
        (ICONS[entry.tag] || DEFAULT_ICON) +
      '</svg></div>' +
      '<div class="fch-body">' +
        '<span class="fch-eyebrow"><span class="fch-eyebrow-dot"></span>Featured Case File &middot; Updated Weekly</span>' +
        '<div class="fch-pills"></div>' +
        '<h2 class="fch-title"><a href="' + (entry.url || '#') + '"></a></h2>' +
        '<p class="fch-quote"></p>' +
        '<p class="fch-excerpt"></p>' +
        '<a href="' + (entry.url || '#') + '" class="btn btn-gold">Read The Full Case File <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>' +
      '</div>';

    var pills = mount.querySelector('.fch-pills');
    var tagPill = document.createElement('span');
    tagPill.className = 'fch-pill';
    tagPill.textContent = entry.tag || '';
    pills.appendChild(tagPill);

    var intensityPill = document.createElement('span');
    intensityPill.className = 'fch-pill fch-pill-intensity';
    intensityPill.style.color = meta.color;
    intensityPill.style.borderColor = meta.color;
    intensityPill.textContent = 'Intensity: ' + meta.label + ' ● ' + (entry.intensity || 6) + '/10';
    pills.appendChild(intensityPill);

    if (entry.stamp) {
      var stampPill = document.createElement('span');
      stampPill.className = 'fch-pill fch-pill-stamp';
      stampPill.textContent = entry.stamp;
      pills.appendChild(stampPill);
    }

    mount.querySelector('.fch-title a').textContent = entry.title || '';
    mount.querySelector('.fch-quote').textContent = entry.pullQuote ? '“' + entry.pullQuote + '”' : '';
    mount.querySelector('.fch-excerpt').textContent = entry.excerpt || '';
  }

  function buildMissedCard(entry) {
    var card = document.createElement('div');
    card.className = 'article-card';
    card.style.setProperty('--accent', entry.accent || '#2e8fff');
    card.innerHTML =
      '<div class="article-media"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">' +
        (ICONS[entry.tag] || DEFAULT_ICON) +
      '</svg></div>' +
      '<div class="article-body">' +
        '<span class="date"></span>' +
        (entry.editorsPick ? '<span class="editors-pick-badge">&#9733; Editor\'s Pick</span>' : '') +
        '<h3></h3>' +
        '<p></p>' +
        '<a class="card-link">Read The Full Case File</a>' +
      '</div>';
    card.querySelector('.date').textContent = entry.tag || '';
    card.querySelector('h3').textContent = entry.title || '';
    card.querySelector('p').textContent = entry.excerpt || '';
    var link = card.querySelector('.card-link');
    link.href = entry.url || '#';
    return card;
  }

  function renderMissed(entries) {
    var grid = document.getElementById('you-might-have-missed-grid');
    if (!grid) return;
    grid.innerHTML = '';
    entries.forEach(function (entry) { grid.appendChild(buildMissedCard(entry)); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (typeof CASE_FILES === 'undefined' || !CASE_FILES.length || !window.FCFDiscovery) return;
    var featured = window.FCFDiscovery.pickWeekly(CASE_FILES, 'featured');
    renderFeaturedHero(featured);
    renderMissed(window.FCFDiscovery.pickManyWeekly(CASE_FILES, 3, 'missed', featured));
  });
})();
