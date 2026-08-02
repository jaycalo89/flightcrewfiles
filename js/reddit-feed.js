// Flight Crew Files — "From The Flight Deck" community feed (homepage)
// Reads reddit_feed.json, generated daily by setup_flightcrewfiles.py from
// Reddit's public JSON API. No Reddit calls happen from the browser.
// If the file is missing, empty, or fails to parse, the whole section is
// hidden -- by design, this feature never shows an error to visitors.
(function () {
  function timeAgo(unixSeconds) {
    var diff = Math.round(Date.now() / 1000 - unixSeconds);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
  }

  function formatCount(n) {
    n = n || 0;
    if (n >= 10000) return Math.floor(n / 1000) + 'k';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return String(n);
  }

  function buildCard(post) {
    var card = document.createElement('article');
    card.className = 'reddit-card';
    card.innerHTML =
      '<div class="reddit-card-head">' +
        '<span class="reddit-tag"></span>' +
        '<span class="reddit-time"></span>' +
      '</div>' +
      '<h3><a target="_blank" rel="noopener"></a></h3>' +
      '<div class="reddit-stats">' +
        '<span class="reddit-stat is-upvote"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l9 9h-6v9H9v-9H3z"/></svg><span></span></span>' +
        '<span class="reddit-stat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H5l2.6-2.6A8.5 8.5 0 1 1 21 11.5Z"/></svg><span></span></span>' +
      '</div>';

    card.querySelector('.reddit-tag').textContent = 'r/' + (post.subreddit || 'aviation');
    card.querySelector('.reddit-time').textContent = timeAgo(post.created_utc);
    var link = card.querySelector('h3 a');
    link.href = post.url;
    link.textContent = post.title || '';
    card.querySelectorAll('.reddit-stat span:last-child')[0].textContent = formatCount(post.score);
    card.querySelectorAll('.reddit-stat span:last-child')[1].textContent = formatCount(post.num_comments);

    return card;
  }

  function init() {
    var section = document.getElementById('community-feed');
    var grid = document.getElementById('reddit-feed');
    if (!section || !grid) return;

    fetch('reddit_feed.json')
      .then(function (res) {
        if (!res.ok) throw new Error('reddit_feed.json not available');
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
