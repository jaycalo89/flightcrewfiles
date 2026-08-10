// Flight Crew Files — renders the 6 category cards on blackbox.html from
// BLACKBOX_CATEGORIES / BLACKBOX_CASES (see js/blackbox-data.js). Count and
// intensity range are computed live, so adding a new case file to the data
// file is the only thing needed to keep this page accurate.
(function () {
  function buildCard(key, meta, cases) {
    var count = cases.length;
    var a = document.createElement('a');
    a.href = meta.page;
    a.className = 'bb-category-card' + (count === 0 ? ' is-empty' : '');
    a.style.setProperty('--accent', meta.accent);
    a.innerHTML =
      '<div class="bb-category-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">' + meta.icon + '</svg></div>' +
      '<h3></h3>' +
      '<p></p>' +
      '<div class="bb-category-meta"><span class="bb-category-count"></span><span class="bb-category-intensity"></span></div>' +
      '<span class="bb-category-enter">Enter <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>';

    a.querySelector('h3').textContent = meta.name;
    a.querySelector('p').textContent = meta.tagline;
    a.querySelector('.bb-category-count').textContent = count + (count === 1 ? ' Case File' : ' Case Files');

    var intensityEl = a.querySelector('.bb-category-intensity');
    if (count === 0) {
      intensityEl.textContent = 'Coming Soon';
    } else {
      var levels = cases.map(function (c) { return c.intensity; });
      var min = Math.min.apply(null, levels);
      var max = Math.max.apply(null, levels);
      intensityEl.textContent = 'Intensity ' + (min === max ? min : min + '–' + max);
    }

    return a;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var grid = document.getElementById('bb-category-grid');
    if (!grid || typeof BLACKBOX_CATEGORIES === 'undefined') return;
    grid.innerHTML = '';
    Object.keys(BLACKBOX_CATEGORIES).forEach(function (key) {
      var meta = BLACKBOX_CATEGORIES[key];
      var cases = BLACKBOX_CASES.filter(function (c) { return c.category === key; });
      grid.appendChild(buildCard(key, meta, cases));
    });
  });
})();
