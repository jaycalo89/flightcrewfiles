// Flight Crew Files — social share buttons for story cards
// Injects a Facebook / X / Copy-link row into every story card on the page.
// Cards don't have individual permalinks, so all three buttons share the
// current page's canonical URL; only the X/Twitter text differs per card.
document.addEventListener('DOMContentLoaded', function () {
  var cards = document.querySelectorAll('.article-card, .case-file, .timeline-item, .file-card');
  if (!cards.length) return;

  var pageUrl = location.origin + location.pathname;
  var encodedUrl = encodeURIComponent(pageUrl);

  function buildShareRow(title) {
    var row = document.createElement('div');
    row.className = 'share-row';
    row.innerHTML =
      '<span class="share-label">Share</span>' +
      '<div class="share-buttons">' +
        '<a class="share-btn share-fb" href="https://www.facebook.com/sharer/sharer.php?u=' + encodedUrl + '" target="_blank" rel="noopener" aria-label="Share on Facebook">' +
          '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15 8.5h2.5V5H15c-2.2 0-4 1.8-4 4v2H9v3.5h2V21h3.5v-6.5H17l.7-3.5h-3.2V9c0-.3.2-.5.5-.5z"/></svg>' +
        '</a>' +
        '<a class="share-btn share-x" href="https://twitter.com/intent/tweet?url=' + encodedUrl + '&text=' + encodeURIComponent(title) + '" target="_blank" rel="noopener" aria-label="Share on X">' +
          '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 3h3.1l-7.6 8.7L23 21h-6.8l-5.3-6.6L4.8 21H1.7l8.2-9.3L1.6 3h7l4.8 6.1L18.9 3zm-1.2 16h1.7L7.4 4.9H5.6L17.7 19z"/></svg>' +
        '</a>' +
        '<button type="button" class="share-btn share-copy" aria-label="Copy link">' +
          '<svg class="icon-link" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.4 1.3"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.3-1.3"/></svg>' +
          '<svg class="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg>' +
        '</button>' +
      '</div>' +
      '<span class="share-copied-msg" aria-live="polite">Copied!</span>';
    return row;
  }

  cards.forEach(function (card) {
    var titleEl = card.querySelector('.file-title') || card.querySelector('h3') || card.querySelector('h4');
    var title = titleEl ? titleEl.textContent.trim() : document.title;
    var target = card.querySelector('.article-body') || card.querySelector('.file-body') || card;

    var row = buildShareRow(title);
    target.appendChild(row);

    var copyBtn = row.querySelector('.share-copy');
    copyBtn.addEventListener('click', function () {
      function showCopied() {
        row.classList.add('is-copied');
        clearTimeout(copyBtn._copyTimer);
        copyBtn._copyTimer = setTimeout(function () { row.classList.remove('is-copied'); }, 2000);
      }
      function fallbackCopy() {
        var ta = document.createElement('textarea');
        ta.value = pageUrl;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        showCopied();
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(pageUrl).then(showCopied).catch(fallbackCopy);
      } else {
        fallbackCopy();
      }
    });
  });
});
