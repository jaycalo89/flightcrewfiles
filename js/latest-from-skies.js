// Flight Crew Files — "Latest From The Skies" homepage video strip.
// Pulls the 6 newest items straight from videos-data.json, so it reflects
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

  // This is an English-language site; videos-data.json's keyword-matched YouTube
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

  // Click-to-play thumbnail facade instead of an eager iframe: some YouTube
  // videos restrict embedding (age-gated, blocked by the uploader, etc.),
  // which shows a broken/blocked placeholder inside an always-on iframe.
  // Showing the real YouTube thumbnail and only creating the iframe on click
  // sidesteps that (a blocked video just fails when the visitor clicks
  // through, same as clicking a normal YouTube thumbnail anywhere else) and
  // avoids loading 6 YouTube players up front.
  function activateEmbed(facade, videoId, title) {
    var iframe = document.createElement('iframe');
    iframe.width = '560';
    iframe.height = '315';
    iframe.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0';
    iframe.title = title;
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    iframe.allowFullscreen = true;
    facade.replaceWith(iframe);
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
      '<div class="vf-embed lfs-embed-facade" role="button" tabindex="0">' +
        '<img class="lfs-thumb" loading="lazy" alt="">' +
        '<span class="lfs-play-btn" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>' +
      '</div>' +
      '<div class="lfs-card-body">' +
        '<span class="vf-tag"></span>' +
        '<h3 class="lfs-title"></h3>' +
        '<p class="lfs-desc"></p>' +
        '<a class="btn btn-gold lfs-watch-btn" target="_blank" rel="noopener">Watch Now</a>' +
      '</div>';

    var facade = card.querySelector('.lfs-embed-facade');
    var thumb = card.querySelector('.lfs-thumb');
    thumb.src = 'https://i.ytimg.com/vi/' + item.video_id + '/hqdefault.jpg';
    thumb.alt = title;
    facade.setAttribute('aria-label', 'Play video: ' + title);

    var play = function () { activateEmbed(facade, item.video_id, title); };
    facade.addEventListener('click', play);
    facade.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); }
    });

    card.querySelector('.vf-tag').textContent = category;
    card.querySelector('.lfs-title').textContent = title;
    card.querySelector('.lfs-desc').textContent = description;
    card.querySelector('.lfs-watch-btn').href = item.url;

    return card;
  }

  fetch('videos-data.json?v=' + Date.now())
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
