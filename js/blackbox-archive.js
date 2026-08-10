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
  var TAG_LABELS = {
    'the-disasters': 'Disaster',
    'the-unsolved': 'Unsolved',
    'the-heroes': 'Hero',
    'ghost-flights': 'Ghost Flight',
    'acts-of-terror': 'Terror',
    'near-misses': 'Near Miss'
  };

  function badgeClass(intensity) {
    if (intensity >= 9) return 'tier-badge-red';
    if (intensity >= 7) return 'tier-badge-orange';
    if (intensity >= 5) return 'tier-badge-yellow';
    if (intensity >= 3) return 'tier-badge-blue';
    return 'tier-badge-green';
  }

  // Derives the red "fatalities" line from the aboard/fatalities/survivors
  // facts already in BLACKBOX_CASES — never invents a number. entry.fatalitiesLabel
  // can override the computed phrasing for special cases (e.g. MH370, still unsolved).
  function fatalitiesLabel(entry) {
    if (entry.fatalitiesLabel) return entry.fatalitiesLabel;
    if (typeof entry.fatalities !== 'number' || typeof entry.aboard !== 'number') return '';
    if (entry.fatalities === 0) return 'All ' + entry.aboard + ' survived';
    if (entry.fatalities === entry.aboard) return 'All ' + entry.aboard + ' perished';
    if (entry.category === 'the-heroes') {
      var survivors = typeof entry.survivors === 'number' ? entry.survivors : (entry.aboard - entry.fatalities);
      return survivors + ' survived';
    }
    return entry.fatalities + ' killed';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var grid = document.getElementById('bb-archive-grid');
    var tabRow = document.getElementById('bb-archive-tabs');
    if (!grid || !tabRow || typeof BLACKBOX_CASES === 'undefined') return;

    var archiveCases = BLACKBOX_CASES.filter(function (c) { return FEATURED_URLS.indexOf(c.url) === -1; });
    var state = { tab: 'all' };

    function buildCard(entry) {
      var isSoon = entry.status === 'coming-soon';
      var cat = BLACKBOX_CATEGORIES[entry.category];
      var el = document.createElement(isSoon ? 'div' : 'a');
      if (!isSoon) el.href = entry.url;
      el.className = 'bb-archive-card' + (isSoon ? ' is-soon' : '');
      el.innerHTML =
        '<div class="bb-archive-media">' +
          '<img class="bb-archive-img" loading="lazy">' +
          '<span class="tier-badge bb-archive-badge ' + badgeClass(entry.intensity) + '"></span>' +
          (isSoon
            ? '<div class="bb-archive-lock" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg></div>'
            : '') +
        '</div>' +
        '<div class="bb-archive-body">' +
          '<div class="bb-archive-toprow">' +
            '<span class="bb-archive-date"></span>' +
            '<span class="bb-archive-tag"></span>' +
          '</div>' +
          '<h3></h3>' +
          '<p class="bb-archive-fatalities"></p>' +
          '<div class="bb-archive-stats">' +
            '<span class="bb-archive-stat" title="People aboard"><span class="bb-archive-stat-icon" aria-hidden="true">👥</span><span class="bb-archive-stat-aboard"></span></span>' +
            '<span class="bb-archive-stat" title="Aircraft"><span class="bb-archive-stat-icon" aria-hidden="true">✈️</span><span class="bb-archive-stat-aircraft"></span></span>' +
            '<span class="bb-archive-stat" title="Location"><span class="bb-archive-stat-icon" aria-hidden="true">📍</span><span class="bb-archive-stat-location"></span></span>' +
          '</div>' +
          (isSoon
            ? '<span class="bb-archive-soon">🔒 Case File In Progress</span>'
            : '<span class="bb-archive-open">Open File <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>') +
        '</div>';

      var img = el.querySelector('.bb-archive-img');
      img.src = entry.image;
      img.alt = entry.title;
      el.querySelector('.bb-archive-badge').textContent = entry.intensity + '/10';
      el.querySelector('.bb-archive-date').textContent = entry.dateLabel;
      el.querySelector('h3').textContent = entry.title;

      var tag = el.querySelector('.bb-archive-tag');
      if (cat) {
        tag.textContent = TAG_LABELS[entry.category] || cat.name;
        tag.style.color = cat.accent;
      }

      var fatalitiesEl = el.querySelector('.bb-archive-fatalities');
      var fLabel = fatalitiesLabel(entry);
      if (fLabel) {
        fatalitiesEl.textContent = fLabel;
      } else {
        fatalitiesEl.remove();
      }

      if (typeof entry.aboard === 'number') {
        el.querySelector('.bb-archive-stat-aboard').textContent = entry.aboard;
      } else {
        el.querySelector('.bb-archive-stat-aboard').closest('.bb-archive-stat').remove();
      }
      if (entry.aircraftAbbr) {
        el.querySelector('.bb-archive-stat-aircraft').textContent = entry.aircraftAbbr;
        if (entry.aircraft) {
          el.querySelector('.bb-archive-stat-aircraft').closest('.bb-archive-stat').title = entry.aircraft;
        }
      } else {
        el.querySelector('.bb-archive-stat-aircraft').closest('.bb-archive-stat').remove();
      }
      if (entry.location) {
        el.querySelector('.bb-archive-stat-location').textContent = entry.location;
      } else {
        el.querySelector('.bb-archive-stat-location').closest('.bb-archive-stat').remove();
      }

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
