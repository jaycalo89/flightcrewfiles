// Flight Crew Files — "Your Flight Log" (saved-files.html)
// Renders everything stored under the shared FCFBookmarks localStorage key.
// bookmarks.js must load before this file.
(function () {
  function formatDate(iso) {
    var d = iso ? new Date(iso) : null;
    if (!d || isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function buildCard(item, onRemove) {
    var card = document.createElement('div');
    card.className = 'saved-card';
    card.innerHTML =
      '<span class="date"></span>' +
      '<h3><a target="_blank" rel="noopener"></a></h3>' +
      '<span class="saved-card-date"></span>' +
      '<button type="button" class="saved-remove-btn">Remove</button>';

    card.querySelector('.date').textContent = item.type || 'Story';
    var link = card.querySelector('h3 a');
    link.href = item.url;
    link.textContent = item.title || item.url;
    var savedText = formatDate(item.date);
    card.querySelector('.saved-card-date').textContent = savedText ? 'Saved ' + savedText : '';
    card.querySelector('.saved-remove-btn').addEventListener('click', function () {
      onRemove(item.url);
    });

    return card;
  }

  function init() {
    var grid = document.getElementById('saved-files-grid');
    var emptyState = document.getElementById('saved-empty');
    if (!grid || !emptyState || !window.FCFBookmarks) return;

    function render() {
      var items = window.FCFBookmarks.getAll().slice().reverse(); // newest saved first
      grid.innerHTML = '';

      if (!items.length) {
        grid.style.display = 'none';
        emptyState.style.display = '';
        return;
      }

      grid.style.display = '';
      emptyState.style.display = 'none';
      items.forEach(function (item) {
        grid.appendChild(buildCard(item, function (url) {
          window.FCFBookmarks.remove(url);
          render();
        }));
      });
    }

    render();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
