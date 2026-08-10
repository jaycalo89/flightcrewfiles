// Flight Crew Files — "Take Me Somewhere" random case-file button. Injected
// into the shared nav (.nav-cta, plus .mobile-panel for the mobile drawer)
// on every page, since both are stable, identical markup across all 56
// pages. A true Math.random() pick each click (not the deterministic
// weekly engine in js/discovery-core.js) — this is meant to genuinely
// surprise, not to be consistent across visits.
(function () {
  var CASE_FILES_INDEX = [
    { title: 'The Night Lockerbie Burned', url: 'pan-am-103.html' },
    { title: 'The Flight That Lasted 32 Minutes Too Long', url: 'japan-airlines-123.html' },
    { title: '"Larry, We\'re Going Down, Larry"', url: 'air-florida-90.html' },
    { title: 'The Plane That Fell From The Sky', url: 'air-france-447.html' },
    { title: 'Helios 522: The Ghost Flight', url: 'helios522.html' },
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
    { title: 'A-12 Oxcart: Faster Than The Blackbird', url: 'a12-oxcart.html' },
    { title: 'Horten Ho 229: The Nazi Flying Wing', url: 'horten-ho229.html' },
    { title: 'SR-71 Blackbird: The Fastest Plane Ever Built', url: 'sr71-blackbird.html' },
    { title: 'F-117 Nighthawk: The Invisible Killer', url: 'f117-nighthawk.html' },
    { title: 'The U-2 Spy Plane That Caused The UFO Panic', url: 'u2-spy-plane.html' }
  ];

  function currentFile() {
    var file = location.pathname.split('/').pop();
    return file || 'index.html';
  }

  function goSomewhere() {
    var here = currentFile();
    var pool = CASE_FILES_INDEX.filter(function (e) { return e.url !== here; });
    var pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick) location.href = pick.url;
  }

  function buildButton(extraClass) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-random-btn' + (extraClass ? ' ' + extraClass : '');
    btn.title = 'Take Me Somewhere';
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h4l3.5 6M20 4h-4l-2.2 3.8M4 20h4l7-12h5M4 14l4 6M20 20h-4l-1.6-2.7"/></svg>' +
      '<span>Take Me Somewhere</span>';
    btn.addEventListener('click', goSomewhere);
    return btn;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var navCta = document.querySelector('.nav-cta');
    if (navCta) {
      var liveBadge = navCta.querySelector('.nav-live-badge');
      var btn = buildButton();
      if (liveBadge) navCta.insertBefore(btn, liveBadge);
      else navCta.insertBefore(btn, navCta.firstChild);
    }

    var mobilePanel = document.querySelector('.mobile-panel');
    if (mobilePanel) {
      var mobileLive = mobilePanel.querySelector('.mobile-live-link');
      var mobileBtn = buildButton('nav-random-btn-mobile');
      if (mobileLive) mobilePanel.insertBefore(mobileBtn, mobileLive);
      else mobilePanel.appendChild(mobileBtn);
    }
  });
})();
