// Flight Crew Files — shared deterministic "pick of the week" engine.
// Used by the homepage Featured Case File / "You Might Have Missed" widgets
// (js/featured-case-file.js) and future discovery features. Same hash
// approach as js/daily-quiz.js's dateKey()-based "quiz of the day", but
// scoped to an ISO week so picks rotate every Monday instead of daily.
(function () {
  function hashString(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  function isoWeekKey(d) {
    d = d ? new Date(d) : new Date();
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    var dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return d.getUTCFullYear() + '-W' + (weekNo < 10 ? '0' + weekNo : weekNo);
  }

  function pickWeekly(list, salt) {
    if (!list || !list.length) return null;
    var key = isoWeekKey() + '|' + (salt || '');
    return list[hashString(key) % list.length];
  }

  // Deterministic, duplicate-free N-pick for the same ISO week, optionally
  // excluding one item (e.g. whatever pickWeekly() already featured).
  function pickManyWeekly(list, n, salt, exclude) {
    var pool = (list || []).filter(function (item) { return item !== exclude; });
    var key = isoWeekKey() + '|' + (salt || '');
    var picks = [];
    var i = 0;
    while (picks.length < n && pool.length) {
      var idx = hashString(key + '|' + i) % pool.length;
      picks.push(pool[idx]);
      pool.splice(idx, 1);
      i++;
    }
    return picks;
  }

  window.FCFDiscovery = {
    hashString: hashString,
    isoWeekKey: isoWeekKey,
    pickWeekly: pickWeekly,
    pickManyWeekly: pickManyWeekly
  };
})();
