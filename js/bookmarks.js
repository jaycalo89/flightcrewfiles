// Flight Crew Files — shared "Save For Later" bookmarking.
// Exposes window.FCFBookmarks so other scripts (community-feed.js,
// case-files.js, news-feed.js, case-file-features.js, saved-files.js) can
// attach a consistent bookmark button to any card without duplicating the
// localStorage logic. Must load before those scripts.
// Storage: localStorage key "fcf-bookmarks", an array of
// {title, url, type, date}. Degrades to a disabled, inert button if
// localStorage isn't available (private browsing lockdown, etc).
window.FCFBookmarks = (function () {
  var KEY = 'fcf-bookmarks';

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

  function getAll() {
    if (!HAS_STORAGE) return [];
    try {
      var raw = localStorage.getItem(KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function saveAll(list) {
    if (!HAS_STORAGE) return;
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
  }

  function findIndex(list, url) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].url === url) return i;
    }
    return -1;
  }

  function isSaved(url) {
    return findIndex(getAll(), url) !== -1;
  }

  // Toggles the bookmark for `item` ({title, url, type}); returns the new
  // saved state (true if now saved, false if removed).
  function toggle(item) {
    var list = getAll();
    var idx = findIndex(list, item.url);
    var nowSaved;
    if (idx === -1) {
      list.push({
        title: item.title || '',
        url: item.url,
        type: item.type || 'Story',
        date: new Date().toISOString()
      });
      nowSaved = true;
    } else {
      list.splice(idx, 1);
      nowSaved = false;
    }
    saveAll(list);
    return nowSaved;
  }

  function remove(url) {
    var list = getAll();
    var idx = findIndex(list, url);
    if (idx !== -1) {
      list.splice(idx, 1);
      saveAll(list);
    }
  }

  // Builds a standalone toggle button. `item` is {title, url, type}.
  // `onChange(nowSaved)` is an optional callback fired after each toggle.
  function buildButton(item, onChange) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'bookmark-btn';
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h12a1 1 0 0 1 1 1v16.5a.5.5 0 0 1-.77.42L12 17l-6.23 3.92a.5.5 0 0 1-.77-.42V4a1 1 0 0 1 1-1z"/></svg>';

    if (!HAS_STORAGE) {
      btn.disabled = true;
      btn.setAttribute('aria-label', 'Saving unavailable in this browser');
      btn.title = 'Saving requires browser storage';
      return btn;
    }

    var saved = isSaved(item.url);
    btn.classList.toggle('is-saved', saved);
    btn.setAttribute('aria-pressed', String(saved));
    btn.setAttribute('aria-label', saved ? 'Remove from saved' : 'Save for later');

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var nowSaved = toggle(item);
      btn.classList.toggle('is-saved', nowSaved);
      btn.setAttribute('aria-pressed', String(nowSaved));
      btn.setAttribute('aria-label', nowSaved ? 'Remove from saved' : 'Save for later');
      if (onChange) onChange(nowSaved);
    });

    return btn;
  }

  return {
    hasStorage: HAS_STORAGE,
    getAll: getAll,
    isSaved: isSaved,
    toggle: toggle,
    remove: remove,
    buildButton: buildButton
  };
})();
