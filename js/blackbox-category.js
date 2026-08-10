// Flight Crew Files — shared rendering engine for all 6 Black Box category
// pages (blackbox-disasters.html, blackbox-unsolved.html, etc). Reads its
// category from <body data-bb-category="...">, filters BLACKBOX_CASES (see
// js/blackbox-data.js), and renders a filterable, sortable, "Load More"
// paginated grid — 6 cards at a time, exactly as many DOM edits as needed
// for any future category size.
(function () {
  var INTENSITY_BANDS = [
    { key: 'all', label: 'All' },
    { key: '9-10', label: '9-10', min: 9, max: 10, cls: 'tier-badge-red' },
    { key: '7-8', label: '7-8', min: 7, max: 8, cls: 'tier-badge-orange' },
    { key: '5-6', label: '5-6', min: 5, max: 6, cls: 'tier-badge-yellow' },
    { key: '1-4', label: '1-4', min: 1, max: 4, cls: 'tier-badge-blue' }
  ];
  var PAGE_SIZE = 6;

  function badgeClass(intensity) {
    if (intensity >= 9) return 'tier-badge-red';
    if (intensity >= 7) return 'tier-badge-orange';
    if (intensity >= 5) return 'tier-badge-yellow';
    if (intensity >= 3) return 'tier-badge-blue';
    return 'tier-badge-green';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var body = document.body;
    var catKey = body.getAttribute('data-bb-category');
    if (!catKey || typeof BLACKBOX_CASES === 'undefined' || typeof BLACKBOX_CATEGORIES === 'undefined') return;
    var meta = BLACKBOX_CATEGORIES[catKey];
    if (!meta) return;

    var allCases = BLACKBOX_CASES.filter(function (c) { return c.category === catKey; });

    var grid = document.getElementById('bb-category-grid');
    var filterRow = document.getElementById('bb-filter-row');
    var sortSelect = document.getElementById('bb-sort-select');
    var loadMoreBtn = document.getElementById('bb-load-more');
    var emptyState = document.getElementById('bb-empty-state');
    var countLabel = document.getElementById('bb-result-count');
    if (!grid) return;

    var state = { intensity: 'all', sort: 'newest', visible: PAGE_SIZE };

    function applyFilterSort() {
      var band = INTENSITY_BANDS.filter(function (b) { return b.key === state.intensity; })[0];
      var list = allCases.filter(function (c) {
        return !band || band.key === 'all' || (c.intensity >= band.min && c.intensity <= band.max);
      });
      list = list.slice().sort(function (a, b) {
        if (state.sort === 'newest') return b.date.localeCompare(a.date);
        if (state.sort === 'oldest') return a.date.localeCompare(b.date);
        if (state.sort === 'intensity-high') return b.intensity - a.intensity;
        if (state.sort === 'intensity-low') return a.intensity - b.intensity;
        return 0;
      });
      return list;
    }

    function buildCard(entry) {
      var isSoon = entry.status === 'coming-soon';
      var el = document.createElement(isSoon ? 'div' : 'a');
      if (!isSoon) el.href = entry.url;
      el.className = 'bb-cat-card' + (isSoon ? ' is-soon' : '');
      el.style.setProperty('--accent', meta.accent);
      el.innerHTML =
        '<div class="bb-cat-media"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">' + meta.icon + '</svg></div>' +
        '<div class="bb-cat-body">' +
          '<div class="bb-cat-top-row"><span class="bb-cat-date"></span><span class="tier-badge ' + badgeClass(entry.intensity) + '"></span></div>' +
          '<h3></h3>' +
          '<p></p>' +
          (isSoon ? '<span class="bb-cat-soon-label">Coming Soon</span>' : '<span class="bb-cat-open-btn">Open File <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>') +
        '</div>';
      el.querySelector('.bb-cat-date').textContent = entry.dateLabel;
      el.querySelector('.tier-badge').textContent = entry.intensity + '/10';
      el.querySelector('h3').textContent = entry.title;
      el.querySelector('p').textContent = entry.excerpt;
      return el;
    }

    function render() {
      var list = applyFilterSort();
      grid.innerHTML = '';
      list.slice(0, state.visible).forEach(function (entry) { grid.appendChild(buildCard(entry)); });

      if (emptyState) emptyState.style.display = list.length ? 'none' : '';
      if (countLabel) countLabel.textContent = list.length + (list.length === 1 ? ' Case File' : ' Case Files');
      if (loadMoreBtn) loadMoreBtn.style.display = state.visible < list.length ? '' : 'none';
    }

    if (filterRow) {
      INTENSITY_BANDS.forEach(function (band) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'chip' + (band.key === 'all' ? ' is-active' : '');
        chip.textContent = band.label;
        chip.setAttribute('data-intensity-filter', band.key);
        chip.addEventListener('click', function () {
          filterRow.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('is-active'); });
          chip.classList.add('is-active');
          state.intensity = band.key;
          state.visible = PAGE_SIZE;
          render();
        });
        filterRow.appendChild(chip);
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        state.sort = sortSelect.value;
        state.visible = PAGE_SIZE;
        render();
      });
    }

    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', function () {
        state.visible += PAGE_SIZE;
        render();
      });
    }

    render();
  });
})();
