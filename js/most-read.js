// Flight Crew Files — "Most Read This Week" panel for case-file deep-dive
// pages. These pages are single-column with no true sidebar, so this
// inserts as a compact section right before the universal .related-stories
// cross-promo block, mirroring how js/case-file-features.js already injects
// its own "Was This Helpful" section in the same spot. Picks are
// deterministic per ISO week (js/discovery-core.js), excluding whichever
// page you're currently reading.
//
// discovery-core.js must load before this file.
(function () {
  if (!document.body.classList.contains('case-file-page')) return;

  var CASE_FILES_INDEX = [
    { title: 'The Night Lockerbie Burned', tag: 'Black Box Files', url: 'pan-am-103.html' },
    { title: 'The Flight That Lasted 32 Minutes Too Long', tag: 'Black Box Files', url: 'japan-airlines-123.html' },
    { title: '"Larry, We\'re Going Down, Larry"', tag: 'Black Box Files', url: 'air-florida-90.html' },
    { title: 'The Plane That Fell From The Sky', tag: 'Black Box Files', url: 'air-france-447.html' },
    { title: 'Helios 522: The Ghost Flight', tag: 'Black Box Files', url: 'helios522.html' },
    { title: 'The Day Two Jumbos Collided', tag: 'Black Box Files', url: 'tenerife-disaster.html' },
    { title: 'The Sioux City Miracle', tag: 'Heroic Moments', url: 'united-232.html' },
    { title: 'The Gimli Glider', tag: 'Heroic Moments', url: 'gimli-glider.html' },
    { title: 'The Plane That Lost Its Roof', tag: 'Heroic Moments', url: 'aloha-airlines-243.html' },
    { title: 'Four Engines Dead At 37,000 Feet', tag: 'Heroic Moments', url: 'captain-eric-moody.html' },
    { title: 'The Man Who Fell 18,000 Feet, And Walked Away', tag: 'Heroic Moments', url: 'nicholas-alkemade.html' },
    { title: 'MH370: The Plane That Vanished', tag: 'Bizarre & Unexplained', url: 'mh370.html' },
    { title: 'The Disappearance Of Amelia Earhart', tag: 'Bizarre & Unexplained', url: 'amelia-earhart.html' },
    { title: 'The Night The US Air Force Met Something They Couldn\'t Explain', tag: 'UAP Files', url: 'rendlesham-forest.html' },
    { title: 'The Pilot Who Vanished', tag: 'UAP Files', url: 'frederick-valentich.html' },
    { title: 'The First Pilot To Die Chasing A UFO', tag: 'UAP Files', url: 'captain-mantell.html' },
    { title: 'Alone In The Amazon', tag: 'Scary Stories', url: 'juliane-koepcke.html' },
    { title: 'The U-2 Spy Plane That Caused The UFO Panic', tag: 'UAP Files', url: 'u2-spy-plane.html' }
  ];

  function currentFile() {
    var file = location.pathname.split('/').pop();
    return file || 'index.html';
  }

  function buildItem(entry, rank) {
    var a = document.createElement('a');
    a.className = 'most-read-item';
    a.href = entry.url;
    a.innerHTML =
      '<span class="most-read-rank">' + (rank < 10 ? '0' + rank : rank) + '</span>' +
      '<span class="most-read-body"><span class="most-read-tag"></span><span class="most-read-title"></span></span>' +
      '<svg class="most-read-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    a.querySelector('.most-read-tag').textContent = entry.tag;
    a.querySelector('.most-read-title').textContent = entry.title;
    return a;
  }

  function buildSection(entries) {
    var section = document.createElement('section');
    section.className = 'section most-read-section';
    section.innerHTML =
      '<div class="container">' +
        '<span class="eyebrow gold">Discovery</span>' +
        '<h2 class="section-title">Most Read This Week</h2>' +
        '<div class="gold-divider"></div>' +
        '<div class="most-read-list"></div>' +
      '</div>';
    var list = section.querySelector('.most-read-list');
    entries.forEach(function (entry, i) { list.appendChild(buildItem(entry, i + 1)); });
    return section;
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!window.FCFDiscovery) return;
    var related = document.querySelector('.related-stories');
    if (!related || !related.parentNode) return;

    var here = currentFile();
    var pool = CASE_FILES_INDEX.filter(function (e) { return e.url !== here; });
    var picks = window.FCFDiscovery.pickManyWeekly(pool, 4, 'most-read');
    if (!picks.length) return;

    related.parentNode.insertBefore(buildSection(picks), related);
  });
})();
