// Flight Crew Files — client-side site search (search.html only)
(function () {
  var input = document.getElementById('search-input');
  var resultsEl = document.getElementById('search-results');
  var countEl = document.getElementById('search-count');
  var emptyEl = document.getElementById('search-empty');
  var promptEl = document.getElementById('search-prompt');
  if (!input || !resultsEl || typeof SEARCH_INDEX === 'undefined') return;

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function cardHtml(item) {
    return (
      '<div class="related-card search-result-card">' +
        '<span class="search-result-tag">' + escapeHtml(item.tag) + '</span>' +
        '<h3>' + escapeHtml(item.title) + '</h3>' +
        '<p>' + escapeHtml(item.desc) + '</p>' +
        '<a href="' + item.url + '" class="btn btn-gold-outline">Explore <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>' +
      '</div>'
    );
  }

  function search(query) {
    var q = query.trim().toLowerCase();
    if (!q) return null;

    var terms = q.split(/\s+/).filter(Boolean);
    var scored = [];

    for (var i = 0; i < SEARCH_INDEX.length; i++) {
      var item = SEARCH_INDEX[i];
      var titleLc = item.title.toLowerCase();
      var descLc = item.desc.toLowerCase();
      var tagLc = item.tag.toLowerCase();
      var score = 0;
      var matched = true;

      for (var t = 0; t < terms.length; t++) {
        var term = terms[t];
        var inTitle = titleLc.indexOf(term) !== -1;
        var inTag = tagLc.indexOf(term) !== -1;
        var inDesc = descLc.indexOf(term) !== -1;
        if (!inTitle && !inTag && !inDesc) { matched = false; break; }
        if (inTitle) score += titleLc.indexOf(term) === 0 ? 12 : 6;
        if (inTag) score += 3;
        if (inDesc) score += 1;
      }

      if (matched) scored.push({ item: item, score: score });
    }

    scored.sort(function (a, b) { return b.score - a.score; });
    return scored.map(function (s) { return s.item; });
  }

  function render(query) {
    var results = search(query);

    if (results === null) {
      resultsEl.innerHTML = '';
      resultsEl.style.display = 'none';
      emptyEl.style.display = 'none';
      countEl.textContent = '';
      promptEl.style.display = '';
      return;
    }

    promptEl.style.display = 'none';

    if (results.length === 0) {
      resultsEl.innerHTML = '';
      resultsEl.style.display = 'none';
      emptyEl.style.display = '';
      countEl.textContent = '';
      return;
    }

    emptyEl.style.display = 'none';
    resultsEl.style.display = '';
    countEl.textContent = results.length + (results.length === 1 ? ' result' : ' results');
    resultsEl.innerHTML = results.map(cardHtml).join('');
  }

  function syncUrl(query) {
    var url = new URL(window.location.href);
    if (query) url.searchParams.set('q', query);
    else url.searchParams.delete('q');
    window.history.replaceState({}, '', url);
  }

  input.addEventListener('input', function () {
    render(input.value);
    syncUrl(input.value.trim());
  });

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';
  if (initialQuery) {
    input.value = initialQuery;
  }
  render(initialQuery);
})();
