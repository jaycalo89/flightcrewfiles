// Flight Crew Files — "The Complete Archive" grid on blackbox.html. Renders
// every BLACKBOX_CASES entry except the 3 hand-picked featured cases already
// shown above as static markup, filterable by category tab, no page reload.
(function () {
  var FEATURED_URLS = ['helios522.html', 'tenerife-disaster.html', 'pan-am-103.html'];
  var TABS = [
    { key: 'all', label: 'All' },
    { key: 'the-disasters', label: 'Disasters' },
    { key: 'the-unsolved', label: 'Unsolved' },
    { key: 'the-heroes', label: 'Heroes' },
    { key: 'ghost-flights', label: 'Ghost Flights' },
    { key: 'acts-of-terror', label: 'Terror' }
  ];

  function badgeClass(intensity) {
    if (intensity >= 9) return 'tier-badge-red';
    if (intensity >= 7) return 'tier-badge-orange';
    if (intensity >= 5) return 'tier-badge-yellow';
    if (intensity >= 3) return 'tier-badge-blue';
    return 'tier-badge-green';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var grid = document.getElementById('bb-archive-grid');
    var tabRow = document.getElementById('bb-archive-tabs');
    if (!grid || !tabRow || typeof BLACKBOX_CASES === 'undefined') return;

    var archiveCases = BLACKBOX_CASES.filter(function (c) { return FEATURED_URLS.indexOf(c.url) === -1; });
    var state = { tab: 'all' };

    function buildCard(entry) {
      var isSoon = entry.status === 'coming-soon';
      var el = document.createElement(isSoon ? 'div' : 'a');
      if (!isSoon) el.href = entry.url;
      el.className = 'bb-archive-card' + (isSoon ? ' is-soon' : '');
      el.innerHTML =
        '<div class="bb-archive-media">' +
          '<img class="bb-archive-img" loading="lazy">' +
          '<span class="tier-badge bb-archive-badge ' + badgeClass(entry.intensity) + '"></span>' +
        '</div>' +
        '<div class="bb-archive-body">' +
          '<span class="bb-archive-date"></span>' +
          '<h3></h3>' +
          (isSoon
            ? '<span class="bb-archive-soon">Coming Soon</span>'
            : '<span class="bb-archive-open">Open File <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>') +
        '</div>';

      var img = el.querySelector('.bb-archive-img');
      img.src = entry.image;
      img.alt = entry.title;
      el.querySelector('.bb-archive-badge').textContent = entry.intensity + '/10';
      el.querySelector('.bb-archive-date').textContent = entry.dateLabel;
      el.querySelector('h3').textContent = entry.title;
      return el;
    }

    function render() {
      grid.innerHTML = '';
      var list = state.tab === 'all'
        ? archiveCases
        : archiveCases.filter(function (c) { return c.category === state.tab; });
      list.forEach(function (entry) { grid.appendChild(buildCard(entry)); });
    }

    TABS.forEach(function (tab) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip' + (tab.key === 'all' ? ' is-active' : '');
      chip.textContent = tab.label;
      chip.addEventListener('click', function () {
        tabRow.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('is-active'); });
        chip.classList.add('is-active');
        state.tab = tab.key;
        render();
      });
      tabRow.appendChild(chip);
    });

    render();
  });
})();
