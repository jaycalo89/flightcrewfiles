// Flight Crew Files — Live news ticker (every page) + live feed (news.html)
// news.json is a broad keyword-matched scrape, so everything here filters down
// to aviation-relevant items before it's shown to a reader.
(function () {
  var REFRESH_MS = 5 * 60 * 1000;

  var AVIATION_RE = /\b(airlin\w*|air\s?lines?|aircraft\w*|aviation\w*|airport\w*|airspace\w*|airbus\w*|boeing\w*|faa|ntsb\w*|pilot\w*|cockpit\w*|runway\w*|jet\w*|flight\w*|aerospace\w*|helicopter\w*|drone\w*|icao\w*|turbulence\w*|fuselage\w*|air traffic|airfield\w*|jetliner\w*|737|747|787|a320|a380|hijack\w*|passenger jet|air force|fighter jet)\b/i;
  var UAP_RE = /\bufo\b|\buap\b|unidentified (aerial|flying)|flying saucer|extraterrestrial/i;
  var MILITARY_RE = /air force|military|airstrike|air strike|missile|fighter jet|pentagon|defense department|\bnavy\b|\barmy\b|troops|warplane|explosion|\biran\b|conflict/i;
  var SAFETY_RE = /crash|accident|incident|emergency|safe\w*|hijack|investigation|\bntsb\b|\bfaa\b|grounded|mayday|turbulence|engine failure/i;
  var HISTORY_RE = /anniversary|historic|\bhistory\b|decades ago/i;

  var CATEGORY_ACCENT = {
    UAP: '#39e6c5',
    Military: '#e0a530',
    Safety: '#ff4d4d',
    History: '#b06bff',
    Airlines: '#2e8fff'
  };

  function isAviationRelevant(article) {
    var text = (article.title || '') + ' ' + (article.description || '');
    return AVIATION_RE.test(text);
  }

  function categorize(article) {
    var text = (article.title || '') + ' ' + (article.description || '');
    if (UAP_RE.test(text)) return 'UAP';
    if (MILITARY_RE.test(text)) return 'Military';
    if (SAFETY_RE.test(text)) return 'Safety';
    if (HISTORY_RE.test(text)) return 'History';
    return 'Airlines';
  }

  function timeAgo(iso) {
    var then = new Date(iso).getTime();
    var diff = Math.round((Date.now() - then) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
  }

  function monogram(source) {
    var letters = (source || '?').replace(/[^A-Za-z]/g, '');
    return (letters.slice(0, 2) || '?').toUpperCase();
  }

  function fetchNews() {
    return fetch('news.json').then(function (res) { return res.json(); });
  }

  // ---------- Ticker (every page) ----------
  function initTicker() {
    var track = document.getElementById('site-ticker-track');
    if (!track) return;

    function render(data) {
      var items = (data.articles || [])
        .filter(isAviationRelevant)
        .sort(function (a, b) { return new Date(b.published_at) - new Date(a.published_at); })
        .slice(0, 10);

      if (!items.length) return; // leave the static fallback headlines in place

      var html = items.map(function (a) {
        var cat = categorize(a).toUpperCase();
        return '<span>' + cat + ': <a href="' + a.url + '" target="_blank" rel="noopener">' + a.title + '</a></span>';
      }).join('');

      track.innerHTML = html + html; // duplicate once for the seamless scroll loop
    }

    fetchNews().then(render).catch(function () { /* keep static fallback */ });
  }

  // ---------- Live feed (news.html) ----------
  function initFeed() {
    var feedEl = document.getElementById('nf-feed');
    if (!feedEl) return;

    var updatedEl = document.getElementById('nf-updated-text');
    var filterButtons = document.querySelectorAll('[data-nf-filter]');
    var lastFetch = null;
    var seenUrls = {};
    var allItems = [];
    var activeFilter = 'all';

    function buildCard(article, isNew) {
      var category = categorize(article);
      var accent = CATEGORY_ACCENT[category] || '#2e8fff';
      var isBreaking = (Date.now() - new Date(article.published_at).getTime()) < 3 * 60 * 60 * 1000;

      var card = document.createElement('article');
      card.className = 'nf-card' + (isBreaking ? ' is-breaking' : '');
      card.setAttribute('data-nf-tag', category);
      card.style.setProperty('--accent', accent);
      card.innerHTML =
        '<div class="nf-card-head">' +
          '<span class="nf-logo"></span>' +
          '<div class="nf-source-info">' +
            '<span class="nf-source"></span>' +
            '<span class="nf-time"></span>' +
          '</div>' +
          (isBreaking ? '<span class="nf-breaking-flag">Breaking</span>' : '') +
        '</div>' +
        '<span class="vf-tag"></span>' +
        '<h3 class="nf-headline"></h3>' +
        '<p class="nf-excerpt"></p>' +
        '<a class="read-report" target="_blank" rel="noopener">Read Full Story &rarr;</a>';

      card.querySelector('.nf-logo').textContent = monogram(article.source);
      card.querySelector('.nf-source').textContent = article.source || 'Unknown Source';
      card.querySelector('.nf-time').textContent = timeAgo(article.published_at);
      card.querySelector('.vf-tag').textContent = category;
      card.querySelector('.nf-headline').textContent = article.title || '';
      card.querySelector('.nf-excerpt').textContent = article.description || '';
      card.querySelector('.read-report').href = article.url;

      return card;
    }

    function reveal(card) {
      feedEl.insertBefore(card, feedEl.firstChild);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { card.classList.add('is-visible'); });
      });
    }

    function applyFilter() {
      var cards = feedEl.querySelectorAll('.nf-card');
      var visibleCount = 0;
      cards.forEach(function (card) {
        var show = activeFilter === 'all' || card.getAttribute('data-nf-tag') === activeFilter;
        card.classList.toggle('is-hidden', !show);
        if (show) visibleCount++;
      });
      var emptyEl = feedEl.querySelector('.nf-empty');
      if (visibleCount === 0) {
        if (!emptyEl) {
          emptyEl = document.createElement('div');
          emptyEl.className = 'nf-empty';
          emptyEl.textContent = 'No stories in this category right now — check back soon.';
          feedEl.appendChild(emptyEl);
        }
      } else if (emptyEl) {
        emptyEl.remove();
      }
    }

    function updateTimestamp() {
      if (!updatedEl || !lastFetch) return;
      var secs = Math.round((Date.now() - lastFetch) / 1000);
      var label = secs < 60 ? 'Just now' : Math.floor(secs / 60) + (Math.floor(secs / 60) === 1 ? ' minute ago' : ' minutes ago');
      updatedEl.textContent = 'Last updated: ' + label;
    }

    function load(isRefresh) {
      fetchNews().then(function (data) {
        lastFetch = Date.now();
        updateTimestamp();

        var relevant = (data.articles || [])
          .filter(isAviationRelevant)
          .sort(function (a, b) { return new Date(b.published_at) - new Date(a.published_at); });

        if (!relevant.length) {
          if (!isRefresh) {
            feedEl.innerHTML = '<div class="nf-empty">No aviation stories in the feed right now — check back soon.</div>';
          }
          return;
        }

        var freshItems = relevant.filter(function (a) { return !seenUrls[a.url]; });

        if (!isRefresh) {
          feedEl.innerHTML = '';
        }

        // Newest first; insertBefore keeps that order as each new card lands at the top.
        freshItems.slice().reverse().forEach(function (article) {
          seenUrls[article.url] = true;
          allItems.push(article);
          reveal(buildCard(article, isRefresh));
        });

        applyFilter();
      }).catch(function () {
        if (!isRefresh) {
          feedEl.innerHTML = '<div class="nf-empty">The live feed couldn&rsquo;t be loaded right now. Please check back shortly.</div>';
        }
      });
    }

    filterButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterButtons.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        activeFilter = btn.getAttribute('data-nf-filter');
        applyFilter();
      });
    });

    load(false);
    setInterval(function () { load(true); }, REFRESH_MS);
    setInterval(updateTimestamp, 30 * 1000);
  }

  // ---------- Compact live feed (homepage) ----------
  function initHomeFeed() {
    var feedEl = document.getElementById('home-news-feed');
    if (!feedEl) return;

    function buildCard(article) {
      var card = document.createElement('article');
      card.className = 'nf-card is-visible';
      card.innerHTML =
        '<div class="nf-card-head">' +
          '<span class="nf-source"></span>' +
          '<span class="vf-dot">&bull;</span>' +
          '<span class="nf-time"></span>' +
        '</div>' +
        '<h3 class="nf-headline"></h3>' +
        '<p class="nf-excerpt"></p>' +
        '<a class="read-report" target="_blank" rel="noopener">Read More &rarr;</a>';

      card.querySelector('.nf-source').textContent = article.source || 'Unknown Source';
      card.querySelector('.nf-time').textContent = timeAgo(article.published_at);
      card.querySelector('.nf-headline').textContent = article.title || '';
      card.querySelector('.nf-excerpt').textContent = article.description || '';
      card.querySelector('.read-report').href = article.url;

      return card;
    }

    function load() {
      fetchNews().then(function (data) {
        var latest = (data.articles || [])
          .filter(isAviationRelevant)
          .sort(function (a, b) { return new Date(b.published_at) - new Date(a.published_at); })
          .slice(0, 6);

        if (!latest.length) {
          feedEl.innerHTML = '<div class="nf-empty">No aviation stories in the feed right now — check back soon.</div>';
          return;
        }

        feedEl.innerHTML = '';
        latest.forEach(function (article) { feedEl.appendChild(buildCard(article)); });
      }).catch(function () {
        feedEl.innerHTML = '<div class="nf-empty">The live feed couldn&rsquo;t be loaded right now. Please check back shortly.</div>';
      });
    }

    load();
    setInterval(load, REFRESH_MS);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTicker();
    initFeed();
    initHomeFeed();
  });
})();
