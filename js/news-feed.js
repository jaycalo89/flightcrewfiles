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

  // ---------- FCF Take: one original line of context per headline ----------
  // Matched against keywords in the headline only, most-specific rule first.
  var AIRCRAFT_MODEL_RE = /\b(737(?:\s?max)?|747|757|767|777x?|787|a220|a300|a310|a320(?:neo)?|a321(?:neo|xlr)?|a330|a350|a380|md-\d+|dc-\d+)\b/i;

  function hashPick(seed, count) {
    var hash = 0;
    for (var i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    return hash % count;
  }

  var TAKE_RULES = [
    {
      re: /\bufo\b|\buap\b|unidentified (aerial|flying)|flying saucer|extraterrestrial/i,
      takes: [
        'Reports like this stay unresolved for years because pilots still have no low-stakes way to log something strange without risking their certificate — that gap is the real story.',
        'The part worth watching here isn’t the object itself, it’s whether the radar and cockpit data behind the report ever gets released.'
      ]
    },
    {
      re: /crash|\bcrashe[sd]\b|\bmayday\b|emergency landing|ditch(?:ed|ing)?/i,
      takes: [
        'Details from an event like this tend to resurface years later as a line in a training syllabus or an emergency-procedures update.',
        'Survivability numbers in incidents like this are exactly what shapes future cabin safety and evacuation standards.'
      ]
    },
    {
      re: /\bntsb\b|inquiry|investigation reveals|probe find|inquiry reveals/i,
      takes: [
        'Findings from investigations like this rarely change headlines, but they routinely change checklists and maintenance sign-off procedures.',
        'This is the kind of report that gets read closely inside the industry long after the news cycle around it has moved on.'
      ]
    },
    {
      re: /near-miss|near miss|close call|runway incursion|forgot he'?d cleared/i,
      takes: [
        'Near-misses like this get less coverage than crashes, but they’re the clearer signal of where the system is actually strained.',
        'Controller and crew workload in incidents like this is usually the first thing to get scrutinized once the transcripts are released.'
      ]
    },
    {
      re: /strike|walkout|\bunion\b|industrial action|picket/i,
      takes: [
        'Labor disputes at the ground-handling or contractor level rarely make headlines until they start grounding flights — worth watching before it reaches a route you fly.',
        'This is the kind of labor story that looks small right up until it cancels a bank of departures at a major hub.'
      ]
    },
    {
      re: /\b(air force|military|airstrike|air strike|missile|pentagon|defense department|\bnavy\b|\barmy\b|warplane|fighter jet)\b/i,
      takes: [
        'Force-structure stories like this rarely get airline-passenger attention, but they signal where defense aviation budgets and airframes are actually headed.',
        'Numbers like these are the kind of quiet structural shift that only becomes obvious a decade later.'
      ]
    },
    {
      re: /\bfaa\b.*(rule|regulat|clearance|tool|policy)|regulat\w*|\bbill\b|\bact\b\)?\s*(advances|passed)?/i,
      takes: [
        'Regulatory changes like this move slowly and get little coverage, but they’re usually what a cockpit procedure looks like five years from now.',
        'Worth tracking less for the announcement and more for how it eventually gets written into the operating rules pilots actually fly under.'
      ]
    },
    {
      re: /pilot demand|pilot shortage|hiring|forecast/i,
      takes: [
        'Workforce forecasts like this shape everything from flight-school enrollment to first-officer pay scales a few years out.',
        'Numbers like these are worth remembering next time a route gets cut or a training pipeline gets squeezed.'
      ]
    },
    {
      re: /route|destination|network|expansion|launches?\b/i,
      takes: [
        'Network moves like this are as much a hiring and fleet-planning signal as they are a travel story.',
        'Route announcements like this are usually the clearest early read on where an airline thinks demand is actually heading.'
      ]
    },
    {
      re: /aircraftforsale|top pick|for sale/i,
      takes: [
        'Worth a look even if you’re not buying — used-aircraft listings like this are a decent read on where general aviation values are trending.'
      ]
    }
  ];

  function generateFcfTake(title) {
    var text = title || '';
    for (var i = 0; i < TAKE_RULES.length; i++) {
      var rule = TAKE_RULES[i];
      if (rule.re.test(text)) {
        var takes = rule.takes;
        return takes[hashPick(text, takes.length)];
      }
    }

    var modelMatch = text.match(AIRCRAFT_MODEL_RE);
    if (modelMatch) {
      var model = modelMatch[0].toUpperCase();
      var modelTakes = [
        'Fleet and design stories like this one about the ' + model + ' matter because they play out over decades, long after the initial announcement is forgotten.',
        'Changes to the ' + model + ' program tend to ripple into route planning, resale values and training requirements well before most flyers notice.'
      ];
      return modelTakes[hashPick(text, modelTakes.length)];
    }

    var fallback = [
      'Small stories like this are usually how bigger industry shifts get telegraphed first.',
      'Worth a beat of attention — this is the kind of item that reads as routine right up until it isn’t.',
      'Not a headline-grabber on its own, but it’s exactly the kind of detail that matters if you follow this industry closely.'
    ];
    return fallback[hashPick(text, fallback.length)];
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
        '<p class="nf-take"><span class="nf-take-label">FCF Take:</span><span class="nf-take-text"></span></p>' +
        '<p class="nf-excerpt"></p>' +
        '<a class="read-report" target="_blank" rel="noopener">Read Full Story &rarr;</a>';

      card.querySelector('.nf-logo').textContent = monogram(article.source);
      card.querySelector('.nf-source').textContent = article.source || 'Unknown Source';
      card.querySelector('.nf-time').textContent = timeAgo(article.published_at);
      card.querySelector('.vf-tag').textContent = category;
      card.querySelector('.nf-headline').textContent = article.title || '';
      card.querySelector('.nf-take-text').textContent = generateFcfTake(article.title);
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
            feedEl.innerHTML = '<div class="nf-empty">Loading latest aviation news&hellip;</div>';
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
          feedEl.innerHTML = '<div class="nf-empty">Loading latest aviation news&hellip;</div>';
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
