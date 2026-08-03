// Flight Crew Files — "Aviation Community" feed (homepage)
// Reads community_feed.json, generated daily by setup_flightcrewfiles.py from
// two free, unauthenticated APIs: Hacker News (Algolia search) and Aviation
// Stack Exchange. No calls to either API happen from the browser.
// If the file is missing, empty, or fails to parse, the whole section is
// hidden -- by design, this feature never shows an error to visitors.
//
// Each card also gets three site-native interactions, layered on top of the
// source's own stats: an upvote/react button (localStorage "fcf-votes-{url}"),
// a Save For Later bookmark (via window.FCFBookmarks), and a compact
// copy/X/WhatsApp share row. bookmarks.js must load before this file.
(function () {
  function timeAgo(unixSeconds) {
    if (!unixSeconds) return '';
    var diff = Math.round(Date.now() / 1000 - unixSeconds);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 2592000) return Math.floor(diff / 86400) + 'd ago';
    if (diff < 31536000) return Math.floor(diff / 2592000) + 'mo ago';
    return Math.floor(diff / 31536000) + 'y ago';
  }

  function formatCount(n) {
    n = n || 0;
    if (n >= 10000) return Math.floor(n / 1000) + 'k';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return String(n);
  }

  // Badge text is shortened for display ("HACKER NEWS" / "STACK EXCHANGE" via
  // the .community-tag uppercase style) -- the full "Aviation Stack Exchange"
  // name stays intact in the underlying data.
  function shortSource(source) {
    if (!source) return 'Community';
    if (source.indexOf('Stack Exchange') !== -1) return 'Stack Exchange';
    return source;
  }

  // Deterministic 50-200 "base" reaction count derived from the source's own
  // points, so a popular HN story reads as more-reacted-to than a quiet SE
  // question, without ever looking randomly different between page loads.
  function baseVoteCount(points) {
    var n = 50 + Math.round((points || 0) * 0.3);
    return Math.max(50, Math.min(200, n));
  }

  function storageAvailable() {
    try {
      var t = '__fcf_test__';
      localStorage.setItem(t, '1');
      localStorage.removeItem(t);
      return true;
    } catch (e) {
      return false;
    }
  }
  var HAS_STORAGE = storageAvailable();

  function buildVoteButton(post) {
    var key = 'fcf-votes-' + post.url;
    var base = baseVoteCount(post.points);
    var voted = false;
    if (HAS_STORAGE) {
      try { voted = localStorage.getItem(key) === '1'; } catch (e) {}
    }

    var wrap = document.createElement('div');
    wrap.className = 'community-vote-wrap';
    wrap.innerHTML =
      '<button type="button" class="community-vote-btn" aria-pressed="false">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 10v11H3V10h4zm4.5 0h6.7a2 2 0 0 1 1.94 2.5l-1.5 6A2 2 0 0 1 16.7 20H11a1 1 0 0 1-1-1V11a1 1 0 0 1 .2-.6L13 4l1 .5a2 2 0 0 1 1 2.24L14.4 10H11.5z"/></svg>' +
        '<span class="community-vote-count"></span>' +
      '</button>' +
      '<span class="community-vote-tip" role="status">You found this interesting</span>';

    var btn = wrap.querySelector('.community-vote-btn');
    var countEl = wrap.querySelector('.community-vote-count');
    var tip = wrap.querySelector('.community-vote-tip');
    countEl.textContent = formatCount(voted ? base + 1 : base);

    if (voted) {
      btn.classList.add('is-voted');
      btn.setAttribute('aria-pressed', 'true');
    }
    if (!HAS_STORAGE) {
      btn.disabled = true;
    }

    btn.addEventListener('click', function () {
      if (btn.classList.contains('is-voted') || !HAS_STORAGE) return; // no unvote
      try { localStorage.setItem(key, '1'); } catch (e) {}
      btn.classList.add('is-voted');
      btn.setAttribute('aria-pressed', 'true');
      countEl.textContent = formatCount(base + 1);

      btn.classList.add('is-pulsing');
      setTimeout(function () { btn.classList.remove('is-pulsing'); }, 500);

      tip.classList.add('is-visible');
      setTimeout(function () { tip.classList.remove('is-visible'); }, 2200);
    });

    return wrap;
  }

  function buildShareRow(title, url) {
    var encodedUrl = encodeURIComponent(url);
    var row = document.createElement('div');
    row.className = 'share-row community-share-row';
    row.innerHTML =
      '<a class="share-btn share-x" href="https://twitter.com/intent/tweet?url=' + encodedUrl + '&text=' + encodeURIComponent(title) + '" target="_blank" rel="noopener" aria-label="Share on X"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 3h3.1l-7.6 8.7L23 21h-6.8l-5.3-6.6L4.8 21H1.7l8.2-9.3L1.6 3h7l4.8 6.1L18.9 3zm-1.2 16h1.7L7.4 4.9H5.6L17.7 19z"/></svg></a>' +
      '<a class="share-btn share-whatsapp" href="https://wa.me/?text=' + encodeURIComponent(title + ' ' + url) + '" target="_blank" rel="noopener" aria-label="Share on WhatsApp"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.7.8-.8.9-.2.2-.3.2-.5.1-.2-.1-1-.4-2-1.2-.7-.6-1.2-1.4-1.4-1.7-.1-.2 0-.4.1-.5l.4-.4c.1-.1.2-.3.2-.4.1-.2 0-.3 0-.4l-.7-1.6c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.7-.8 1.8 0 1.1.8 2.1.9 2.3.1.2 1.6 2.5 4 3.4.5.2 1 .4 1.3.5.5.2 1 .1 1.4.1.4-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.2-.2-.4-.3z"/></svg></a>' +
      '<button type="button" class="share-btn share-copy" aria-label="Copy link"><svg class="icon-link" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.4 1.3"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.3-1.3"/></svg><svg class="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg></button>' +
      '<span class="share-copied-msg" aria-live="polite">Copied!</span>';

    var copyBtn = row.querySelector('.share-copy');
    copyBtn.addEventListener('click', function () {
      function showCopied() {
        row.classList.add('is-copied');
        clearTimeout(copyBtn._copyTimer);
        copyBtn._copyTimer = setTimeout(function () { row.classList.remove('is-copied'); }, 2000);
      }
      function fallbackCopy() {
        var ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        showCopied();
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(showCopied).catch(fallbackCopy);
      } else {
        fallbackCopy();
      }
    });

    return row;
  }

  function buildCard(post) {
    var card = document.createElement('article');
    card.className = 'community-card';
    card.innerHTML =
      '<div class="community-card-head">' +
        '<span class="community-tag"></span>' +
        '<span class="community-time"></span>' +
      '</div>' +
      '<h3><a target="_blank" rel="noopener"></a></h3>' +
      '<div class="community-stats">' +
        '<span class="community-stat is-upvote"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l9 9h-6v9H9v-9H3z"/></svg><span></span></span>' +
        '<span class="community-stat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H5l2.6-2.6A8.5 8.5 0 1 1 21 11.5Z"/></svg><span></span></span>' +
      '</div>';

    card.querySelector('.community-tag').textContent = shortSource(post.source);
    card.querySelector('.community-time').textContent = timeAgo(post.created_utc);
    var link = card.querySelector('h3 a');
    link.href = post.url;
    link.textContent = post.title || '';
    card.querySelectorAll('.community-stat span:last-child')[0].textContent = formatCount(post.points);
    card.querySelectorAll('.community-stat span:last-child')[1].textContent = formatCount(post.num_comments);

    var actions = document.createElement('div');
    actions.className = 'community-actions';
    actions.appendChild(buildVoteButton(post));
    if (window.FCFBookmarks) {
      actions.appendChild(window.FCFBookmarks.buildButton({
        title: post.title,
        url: post.url,
        type: shortSource(post.source)
      }));
    }
    card.appendChild(actions);
    card.appendChild(buildShareRow(post.title || '', post.url));

    return card;
  }

  function init() {
    var section = document.getElementById('community-feed');
    var grid = document.getElementById('community-grid');
    if (!section || !grid) return;

    fetch('community_feed.json')
      .then(function (res) {
        if (!res.ok) throw new Error('community_feed.json not available');
        return res.json();
      })
      .then(function (data) {
        var posts = (data && data.posts) || [];
        if (!posts.length) {
          section.style.display = 'none';
          return;
        }
        grid.innerHTML = '';
        posts.slice(0, 4).forEach(function (post) {
          grid.appendChild(buildCard(post));
        });
      })
      .catch(function () {
        section.style.display = 'none';
      });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
