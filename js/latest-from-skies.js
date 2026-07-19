// Flight Crew Files — "Latest From The Skies" homepage video strip.
// Pulls the 6 newest items straight from videos.json, so it reflects
// whatever the daily video-fetch run (setup_flightcrewfiles.py) last wrote —
// no separate refresh logic needed here.
document.addEventListener('DOMContentLoaded', function () {
  var gridEl = document.getElementById('lfs-grid');
  if (!gridEl) return;

  var CATEGORY_ACCENT = {
    UAP: '#39e6c5',
    Heroic: '#e8c766',
    News: '#2e8fff',
    Historic: '#e0a530',
    Bizarre: '#b06bff'
  };

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

  // This is an English-language site; videos.json's keyword-matched YouTube
  // search only hints at language, so drop titles that are mostly non-ASCII
  // rather than show them untranslated in a homepage feature.
  function looksEnglish(text) {
    if (!text) return true;
    var asciiCount = 0;
    for (var i = 0; i < text.length; i++) {
      if (text.charCodeAt(i) < 128) asciiCount++;
    }
    return (asciiCount / text.length) >= 0.7;
  }

  function buildCard(item) {
    var category = categorize(item);
    var accent = CATEGORY_ACCENT[category] || '#2e8fff';
    var title = decodeEntities(item.title || '');
    var description = decodeEntities(item.description || '');

    var card = document.createElement('article');
    card.className = 'lfs-card';
    card.style.setProperty('--accent', accent);
    card.innerHTML =
      '<div class="vf-embed"><iframe width="560" height="315" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>' +
      '<div class="lfs-card-body">' +
        '<span class="vf-tag"></span>' +
        '<h3 class="lfs-title"></h3>' +
        '<p class="lfs-desc"></p>' +
        '<a class="btn btn-gold lfs-watch-btn" target="_blank" rel="noopener">Watch Now</a>' +
      '</div>';

    var iframe = card.querySelector('iframe');
    iframe.src = 'https://www.youtube.com/embed/' + item.video_id;
    iframe.title = title;

    card.querySelector('.vf-tag').textContent = category;
    card.querySelector('.lfs-title').textContent = title;
    card.querySelector('.lfs-desc').textContent = description;
    card.querySelector('.lfs-watch-btn').href = item.url;

    return card;
  }

  fetch('videos.json')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      var items = (data.items || [])
        .filter(function (item) { return looksEnglish(item.title); })
        .sort(function (a, b) { return new Date(b.published_at) - new Date(a.published_at); })
        .slice(0, 6);

      if (!items.length) {
        gridEl.innerHTML = '<div class="nf-empty">No footage available right now — check back soon.</div>';
        return;
      }

      gridEl.innerHTML = '';
      items.forEach(function (item) { gridEl.appendChild(buildCard(item)); });
    })
    .catch(function () {
      gridEl.innerHTML = '<div class="nf-empty">The video feed couldn&rsquo;t be loaded right now. Please check back shortly.</div>';
    });
});
