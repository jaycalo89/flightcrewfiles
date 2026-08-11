// Flight Crew Files — Previous/Next Case File navigation, bottom of every
// case-file deep-dive page. Uses a fixed canonical order (same 21 pages as
// js/most-read.js) and wraps around at both ends, so there's never a dead
// end. Inserted right before .related-stories, same anchor pattern as
// js/case-file-features.js's "Was This Helpful" section.
(function () {
  if (!document.body.classList.contains('case-file-page')) return;

  var ORDER = [
    { title: 'The Night Lockerbie Burned', url: 'pan-am-103.html' },
    { title: 'The Flight That Lasted 32 Minutes Too Long', url: 'japan-airlines-123.html' },
    { title: '"Larry, We\'re Going Down, Larry"', url: 'air-florida-90.html' },
    { title: 'The Plane That Fell From The Sky', url: 'air-france-447.html' },
    { title: 'Helios 522: The Ghost Flight', url: 'helios522.html' },
    { title: 'The Fire They Couldn\'t Stop', url: 'swissair-111.html' },
    { title: 'Push And Push And Push', url: 'alaska-airlines-261.html' },
    { title: 'The Hijacking That Ran Out Of Fuel', url: 'ethiopian-airlines-961.html' },
    { title: 'The Day Two Jumbos Collided', url: 'tenerife-disaster.html' },
    { title: 'The Sioux City Miracle', url: 'united-232.html' },
    { title: 'The Gimli Glider', url: 'gimli-glider.html' },
    { title: 'The Plane That Lost Its Roof', url: 'aloha-airlines-243.html' },
    { title: 'Four Engines Dead At 37,000 Feet', url: 'captain-eric-moody.html' },
    { title: 'The Man Who Fell 18,000 Feet, And Walked Away', url: 'nicholas-alkemade.html' },
    { title: 'MH370: The Plane That Vanished', url: 'mh370.html' },
    { title: 'The Disappearance Of Amelia Earhart', url: 'amelia-earhart.html' },
    { title: 'The Night The US Air Force Met Something They Couldn\'t Explain', url: 'rendlesham-forest.html' },
    { title: 'The Pilot Who Vanished', url: 'frederick-valentich.html' },
    { title: 'The First Pilot To Die Chasing A UFO', url: 'captain-mantell.html' },
    { title: 'Alone In The Amazon', url: 'juliane-koepcke.html' },
    { title: 'The U-2 Spy Plane That Caused The UFO Panic', url: 'u2-spy-plane.html' }
  ];

  function currentFile() {
    var file = location.pathname.split('/').pop();
    return file || 'index.html';
  }

  function buildNav(prevEntry, nextEntry) {
    var section = document.createElement('section');
    section.className = 'section cf-nav-section';
    section.innerHTML =
      '<div class="container">' +
        '<div class="cf-nav-row">' +
          '<a href="' + prevEntry.url + '" class="cf-nav-link cf-nav-prev">' +
            '<span class="cf-nav-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M11 18l-6-6 6-6"/></svg></span>' +
            '<span class="cf-nav-text"><span class="cf-nav-label">Previous Case File</span><span class="cf-nav-title"></span></span>' +
          '</a>' +
          '<a href="' + nextEntry.url + '" class="cf-nav-link cf-nav-next">' +
            '<span class="cf-nav-text"><span class="cf-nav-label">Next Case File</span><span class="cf-nav-title"></span></span>' +
            '<span class="cf-nav-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>' +
          '</a>' +
        '</div>' +
      '</div>';
    section.querySelector('.cf-nav-prev .cf-nav-title').textContent = prevEntry.title;
    section.querySelector('.cf-nav-next .cf-nav-title').textContent = nextEntry.title;
    return section;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var here = currentFile();
    var idx = -1;
    for (var i = 0; i < ORDER.length; i++) {
      if (ORDER[i].url === here) { idx = i; break; }
    }
    if (idx === -1) return;

    var prevEntry = ORDER[(idx - 1 + ORDER.length) % ORDER.length];
    var nextEntry = ORDER[(idx + 1) % ORDER.length];

    var related = document.querySelector('.related-stories');
    if (!related || !related.parentNode) return;
    related.parentNode.insertBefore(buildNav(prevEntry, nextEntry), related);
  });
})();
