// Flight Crew Files — Live Video Feed (videos.html)
// Fetches videos-data.json, categorizes items, and renders an infinite-scroll-style feed.
document.addEventListener('DOMContentLoaded', function () {
  var feedEl = document.getElementById('vf-feed');
  var sentinelEl = document.getElementById('vf-sentinel');
  var endEl = document.getElementById('vf-end');
  var breakingEl = document.getElementById('vf-breaking-text');
  var filterButtons = document.querySelectorAll('[data-vf-filter]');

  if (!feedEl) return;

  var BATCH_SIZE = 6;
  var CATEGORY_ACCENT = {
    UAP: '#39e6c5',
    Heroic: '#e8c766',
    News: '#2e8fff',
    Historic: '#e0a530',
    Bizarre: '#b06bff'
  };

  var allItems = [];
  var activeFilter = 'all';
  var visibleItems = [];
  var cursor = 0;
  var observer = null;

  function decodeEntities(str) {
    var el = document.createElement('textarea');
    el.innerHTML = str;
    return el.value;
  }

  function categorize(item) {
    var content = ((item.title || '') + ' ' + (item.description || '')).toLowerCase();
    if (/\bufo\b|\buap\b|alien|unidentified|flying saucer/.test(content)) return 'UAP';
    if (/emergency landing|miracle|rescue|survived|belly landing|both engines|ditch/.test(content)) return 'Heroic';
    if (/cockpit voice recorder|\bcvr\b|declassified|\bdisaster\b/.test(content)) return 'Historic';
    if (/bizarre|strange|weird|shocking|prank|jump.*plane|annoyed|no.?kids|original color|isn.?t.*black/.test(content)) return 'Bizarre';
    var q = (item.matched_query || '').toLowerCase();
    if (q.indexOf('uap') > -1) return 'UAP';
    if (q.indexOf('emergency landing') > -1) return 'Heroic';
    if (q.indexOf('voice recorder') > -1) return 'Historic';
    return 'News';
  }

  function timeAgo(iso) {
    var then = new Date(iso).getTime();
    var now = Date.now();
    var diff = Math.round((now - then) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return Math.floor(diff / 604800) + 'w ago';
  }

  // Deterministic pseudo-random like count so the feed feels alive without a backend.
  function seedCount(id) {
    var hash = 0;
    for (var i = 0; i < id.length; i++) { hash = (hash * 31 + id.charCodeAt(i)) >>> 0; }
    return 60 + (hash % 2400);
  }

  function formatCount(n) {
    if (n >= 1000) return (n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0) + 'k';
    return String(n);
  }

  // This is an English-language site; the YouTube search that builds videos-data.json
  // only hints at language (relevanceLanguage isn't a hard filter), so a few
  // non-English clips can still slip through. Drop titles that are mostly
  // non-ASCII rather than show them untranslated in the feed.
  function looksEnglish(text) {
    if (!text) return true;
    var asciiCount = 0;
    for (var i = 0; i < text.length; i++) {
      if (text.charCodeAt(i) < 128) asciiCount++;
    }
    return (asciiCount / text.length) >= 0.7;
  }

  function buildCard(item) {
    var category = item._category;
    var accent = CATEGORY_ACCENT[category] || '#2e8fff';
    var likeCount = seedCount(item.video_id);

    var article = document.createElement('article');
    article.className = 'vf-card';
    article.setAttribute('data-vf-tag', category);
    article.style.setProperty('--accent', accent);
    article.innerHTML =
      '<div class="vf-card-head">' +
        '<span class="vf-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M21 3 3 10.5l7 2.2L14 20l2.2-7L21 3Z"/></svg></span>' +
        '<div class="vf-card-head-info">' +
          '<span class="vf-channel"></span>' +
          '<span class="vf-meta"><span class="vf-tag">' + category + '</span><span class="vf-dot">&bull;</span><span class="vf-time"></span></span>' +
        '</div>' +
      '</div>' +
      '<div class="vf-embed"><iframe loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>' +
      '<div class="vf-card-body">' +
        '<h3 class="vf-title"><a target="_blank" rel="noopener"></a></h3>' +
        '<p class="vf-desc"></p>' +
      '</div>' +
      '<div class="vf-card-actions">' +
        '<button class="vf-action vf-like" type="button" aria-pressed="false"><svg viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7.5-4.6-10-9.2C.5 8.4 2.3 5 5.8 5c2 0 3.4 1 4.6 2.6C11.6 6 13 5 15 5c3.5 0 5.3 3.4 3.8 6.8C19.5 16.4 12 21 12 21z"/></svg><span class="vf-like-count"></span></button>' +
        '<button class="vf-action vf-share" type="button"><svg viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.6l6.8-3.8M8.6 13.4l6.8 3.8"/></svg><span>Share</span></button>' +
        '<a class="vf-action vf-watch" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 5h6v6M20 5l-9 9M9 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"/></svg><span>Watch on YouTube</span></a>' +
      '</div>';

    var title = decodeEntities(item.title || '');
    var description = decodeEntities(item.description || '');
    var channel = decodeEntities(item.channel || 'Unknown Channel');

    article.querySelector('.vf-channel').textContent = channel;
    article.querySelector('.vf-time').textContent = timeAgo(item.published_at);

    var iframe = article.querySelector('.vf-embed iframe');
    iframe.src = 'https://www.youtube.com/embed/' + item.video_id;
    iframe.title = title;

    var titleLink = article.querySelector('.vf-title a');
    titleLink.textContent = title;
    titleLink.href = item.url;

    article.querySelector('.vf-desc').textContent = description;

    var watchLink = article.querySelector('.vf-watch');
    watchLink.href = item.url;

    var likeBtn = article.querySelector('.vf-like');
    var likeCountEl = article.querySelector('.vf-like-count');
    var liked = false;
    likeCountEl.textContent = formatCount(likeCount);
    likeBtn.addEventListener('click', function () {
      liked = !liked;
      likeBtn.classList.toggle('is-liked', liked);
      likeBtn.setAttribute('aria-pressed', String(liked));
      likeCountEl.textContent = formatCount(likeCount + (liked ? 1 : 0));
    });

    var shareBtn = article.querySelector('.vf-share');
    shareBtn.addEventListener('click', function () {
      var shareText = shareBtn.querySelector('span');
      var restore = function () {
        shareBtn.classList.remove('is-copied');
        shareText.textContent = 'Share';
      };
      var markCopied = function () {
        shareBtn.classList.add('is-copied');
        shareText.textContent = 'Copied!';
        setTimeout(restore, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(item.url).then(markCopied, markCopied);
      } else {
        markCopied();
      }
    });

    return article;
  }

  function revealCard(card) {
    feedEl.appendChild(card);
    // Force layout before toggling the class so the transition runs.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { card.classList.add('is-visible'); });
    });
  }

  function renderNextBatch() {
    var next = visibleItems.slice(cursor, cursor + BATCH_SIZE);
    next.forEach(function (item) { revealCard(buildCard(item)); });
    cursor += next.length;

    if (cursor >= visibleItems.length) {
      sentinelEl.hidden = true;
      endEl.hidden = false;
      if (observer) observer.disconnect();
    } else {
      sentinelEl.hidden = false;
      endEl.hidden = true;
    }
  }

  function loadMoreWithDelay() {
    if (cursor >= visibleItems.length) return;
    sentinelEl.hidden = false;
    endEl.hidden = true;
    setTimeout(renderNextBatch, 450);
  }

  function setupObserver() {
    if (observer) observer.disconnect();
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) loadMoreWithDelay();
      });
    }, { rootMargin: '400px 0px' });
    observer.observe(sentinelEl);
  }

  function applyFilter(filter) {
    activeFilter = filter;
    cursor = 0;
    feedEl.innerHTML = '';
    endEl.hidden = true;
    visibleItems = filter === 'all' ? allItems : allItems.filter(function (i) { return i._category === filter; });

    if (!visibleItems.length) {
      var empty = document.createElement('div');
      empty.className = 'vf-empty';
      empty.textContent = 'No footage in this category yet — check back soon.';
      feedEl.appendChild(empty);
      sentinelEl.hidden = true;
      return;
    }

    renderNextBatch();
    setupObserver();
  }

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterButtons.forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      applyFilter(btn.getAttribute('data-vf-filter'));
    });
  });

  fetch('videos-data.json?v=' + Date.now())
    .then(function (res) { return res.json(); })
    .then(function (data) {
      allItems = (data.items || [])
        .filter(function (item) { return looksEnglish(item.title); })
        .sort(function (a, b) {
          return new Date(b.published_at) - new Date(a.published_at);
        });
      allItems.forEach(function (item) { item._category = categorize(item); });

      if (breakingEl) {
        breakingEl.innerHTML = '<strong>' + allItems.length + '</strong> aviation videos live right now &mdash; new footage added daily.';
      }

      applyFilter('all');
    })
    .catch(function () {
      feedEl.innerHTML = '<div class="vf-empty">The live feed couldn&rsquo;t be loaded right now. Please check back shortly.</div>';
      if (breakingEl) breakingEl.textContent = 'Feed temporarily unavailable.';
    });
});
