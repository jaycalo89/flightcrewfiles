// Flight Crew Files — renders the homepage Case Files grid from CASE_FILES
// (see js/case-files-data.js). Static local data, so this renders synchronously
// on DOMContentLoaded — no fetch, no skeleton state needed.
(function () {
  var ICONS = {
    'Black Box Files': '<rect x="4" y="8" width="16" height="10" rx="2"/><circle cx="12" cy="13" r="2"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',
    'Heroic Moments': '<path d="M12 2l2.4 6.6L21 9l-5.5 4.6L17 21l-5-3.6L7 21l1.5-7.4L3 9l6.6-.4z"/>',
    'Scary Stories': '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>',
    'Bizarre & Unexplained': '<path d="M12 2c2 3 3 6.5 3 10s-1 8-3 10c-2-2-3-6.5-3-10s1-7 3-10z"/><path d="M2 12c3-2 6.5-3 10-3s8 1 10 3c-2 2-6.5 3-10 3s-7-1-10-3z"/>'
  };
  var DEFAULT_ICON = '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>';

  function buildCard(entry) {
    var card = document.createElement('div');
    card.className = 'article-card';
    card.style.setProperty('--accent', entry.accent || '#2e8fff');
    card.innerHTML =
      '<div class="article-media"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">' +
        (ICONS[entry.tag] || DEFAULT_ICON) +
      '</svg></div>' +
      '<div class="article-body">' +
        '<span class="date"></span>' +
        '<h3></h3>' +
        '<span class="story-date"></span>' +
        '<p></p>' +
        '<a class="card-link">Read The Full Case File</a>' +
      '</div>';

    card.querySelector('.date').textContent = entry.tag || '';
    card.querySelector('h3').textContent = entry.title || '';
    card.querySelector('.story-date').textContent = entry.date ? '— ' + entry.date : '';
    card.querySelector('p').textContent = entry.excerpt || '';
    var link = card.querySelector('.card-link');
    link.href = entry.url || '#';

    return card;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var grid = document.getElementById('case-files-grid');
    if (!grid || typeof CASE_FILES === 'undefined' || !CASE_FILES.length) return;

    grid.innerHTML = '';
    CASE_FILES.forEach(function (entry) {
      grid.appendChild(buildCard(entry));
    });
  });
})();
