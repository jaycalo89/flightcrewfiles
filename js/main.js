// Flight Crew Files — shared front-end behavior
document.addEventListener('DOMContentLoaded', function () {

  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('nav-open');
    });
    document.querySelectorAll('.mobile-panel a').forEach(function (link) {
      link.addEventListener('click', function () {
        document.body.classList.remove('nav-open');
      });
    });
  }

  // Desktop dropdown nav (Stories / Community / Resources).
  // CSS :hover already opens these; this adds click support for touch/keyboard.
  var dropdowns = document.querySelectorAll('.has-dropdown');
  dropdowns.forEach(function (dd) {
    var trigger = dd.querySelector('.dropdown-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var willOpen = !dd.classList.contains('is-open');
      dropdowns.forEach(function (other) {
        other.classList.remove('is-open');
        var t = other.querySelector('.dropdown-trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
      if (willOpen) {
        dd.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
  document.addEventListener('click', function () {
    dropdowns.forEach(function (dd) { dd.classList.remove('is-open'); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      dropdowns.forEach(function (dd) { dd.classList.remove('is-open'); });
    }
  });

  // Mobile accordion submenus (Stories / Community / Resources)
  document.querySelectorAll('.mobile-dropdown-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var submenu = btn.nextElementSibling;
      var willOpen = !btn.classList.contains('is-open');
      btn.classList.toggle('is-open', willOpen);
      if (submenu) submenu.classList.toggle('is-open', willOpen);
    });
  });

  // Generic "fake submit" handler for newsletter forms.
  // This is a static front-end demo: forms are not wired to a backend yet.
  document.querySelectorAll('form[data-demo-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = form.querySelector('[data-form-message]');
      var button = form.querySelector('button[type="submit"]');
      if (button) {
        var originalText = button.textContent;
        button.textContent = 'Boarding…';
        button.disabled = true;
        setTimeout(function () {
          button.textContent = originalText;
          button.disabled = false;
        }, 1400);
      }
      if (msg) {
        msg.classList.add('show');
        setTimeout(function () { msg.classList.remove('show'); }, 6000);
      }
      form.reset();
    });
  });

  // Category filter chips (visual filtering on archive pages)
  var chips = document.querySelectorAll('.chip[data-filter]');
  var filterCards = document.querySelectorAll('[data-tag]');
  if (chips.length && filterCards.length) {
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('is-active'); });
        chip.classList.add('is-active');
        var filter = chip.getAttribute('data-filter');
        filterCards.forEach(function (card) {
          if (filter === 'all' || card.getAttribute('data-tag') === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // Footer year
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  // This Day In Aviation History (homepage) — curated, date-checked events only.
  // If today's exact date has no confirmed entry, we fall back to a small pool
  // of always-true "evergreen" milestones rather than inventing a false match.
  var tdihEl = document.getElementById('tdih-events');
  if (tdihEl) {
    var tdihEvents = [
      { month: 1, day: 1, year: 1914, title: "First Scheduled Airline Flight", text: "The St. Petersburg-Tampa Airboat Line begins the world's first scheduled commercial airline service across Tampa Bay, Florida." },
      { month: 1, day: 15, year: 2009, title: "The Miracle on the Hudson", text: "Captain Chesley “Sully” Sullenberger ditches US Airways Flight 1549 in the Hudson River after a bird strike knocks out both engines — all 155 aboard survive.", evergreen: true },
      { month: 1, day: 18, year: 1911, title: "First Shipboard Landing", text: "Pilot Eugene Ely lands his Curtiss pusher on a platform built over the deck of the USS Pennsylvania, proving aircraft could operate from ships." },
      { month: 2, day: 9, year: 1969, title: "The Boeing 747 Takes Flight", text: "The first Boeing 747 — the original jumbo jet — completes its maiden flight, changing the scale of commercial air travel forever." },
      { month: 3, day: 27, year: 1977, title: "The Tenerife Disaster", text: "Two Boeing 747s collide on a foggy runway in the Canary Islands, killing 583 people in the deadliest accident in aviation history." },
      { month: 4, day: 18, year: 1942, title: "The Doolittle Raid", text: "Sixteen B-25 bombers launch from the carrier USS Hornet in the first American air raid on the Japanese home islands, a daring one-way mission." },
      { month: 5, day: 2, year: 1952, title: "The Jet Age Begins", text: "BOAC's de Havilland Comet enters service between London and Johannesburg, becoming the world's first commercial jet airliner." },
      { month: 5, day: 6, year: 1937, title: "The Hindenburg Disaster", text: "The German airship Hindenburg bursts into flame while mooring at Lakehurst, New Jersey, effectively ending the era of passenger airships." },
      { month: 5, day: 20, year: 1927, title: "Lindbergh Departs For Paris", text: "Charles Lindbergh takes off from Roosevelt Field, New York, beginning the flight that will make him the first person to cross the Atlantic solo and nonstop." },
      { month: 5, day: 21, year: 1927, title: "Lindbergh Lands In Paris", text: "After roughly 33.5 hours alone over the Atlantic, Lindbergh lands the Spirit of St. Louis at Le Bourget Field outside Paris to a crowd of thousands.", evergreen: true },
      { month: 5, day: 21, year: 1932, title: "Earhart Crosses The Atlantic", text: "Amelia Earhart lands near Derry, Northern Ireland, becoming the first woman to fly solo across the Atlantic." },
      { month: 6, day: 18, year: 1928, title: "Earhart's First Atlantic Crossing", text: "Amelia Earhart becomes the first woman to cross the Atlantic by air, flying as a passenger alongside pilot Wilmer Stultz." },
      { month: 6, day: 30, year: 1956, title: "The Grand Canyon Collision", text: "A TWA Constellation and a United DC-7 collide over the Grand Canyon, killing all 128 aboard both aircraft — a tragedy that helped drive the creation of the FAA." },
      { month: 7, day: 2, year: 1937, title: "Amelia Earhart Disappears", text: "Earhart and navigator Fred Noonan vanish over the central Pacific near Howland Island during an attempt to fly around the world." },
      { month: 7, day: 15, year: 1954, title: "The 707 Prototype Flies", text: "Boeing's 367-80 — the “Dash 80” prototype that led directly to the 707 — makes its first flight, launching the American jetliner era." },
      { month: 7, day: 17, year: 1996, title: "TWA Flight 800", text: "A Boeing 747 bound for Paris explodes and crashes into the Atlantic off Long Island shortly after takeoff, killing all 230 aboard." },
      { month: 7, day: 27, year: 1949, title: "The Comet's First Flight", text: "The de Havilland Comet, the aircraft that would become the world's first jet airliner, makes its maiden flight from Hatfield, England." },
      { month: 8, day: 2, year: 1985, title: "Delta Flight 191", text: "A sudden microburst brings down a Lockheed L-1011 on approach to Dallas-Fort Worth, a disaster that led directly to modern windshear detection technology." },
      { month: 8, day: 25, year: 1919, title: "First Daily International Airline", text: "Aircraft Transport and Travel begins the world's first daily international scheduled air service, flying between London and Paris." },
      { month: 9, day: 8, year: 1994, title: "USAir Flight 427", text: "A Boeing 737 crashes near Pittsburgh after an uncommanded rudder movement — an investigation that ultimately led to a major rudder system redesign across the 737 fleet." },
      { month: 9, day: 11, year: 2001, title: "September 11th", text: "Four commercial airliners are hijacked in coordinated terrorist attacks, reshaping aviation security worldwide for decades to follow." },
      { month: 10, day: 4, year: 1958, title: "Jet Service Crosses The Atlantic", text: "BOAC's de Havilland Comet 4 opens the first transatlantic jet passenger service, flying between London and New York." },
      { month: 10, day: 14, year: 1947, title: "Breaking The Sound Barrier", text: "Chuck Yeager becomes the first person to fly faster than the speed of sound, piloting the Bell X-1 “Glamorous Glennis” over the Mojave Desert.", evergreen: true },
      { month: 10, day: 26, year: 1958, title: "Pan Am's 707 Debut", text: "Pan American World Airways begins Boeing 707 transatlantic service between New York and Paris, kicking off the jet age for U.S. carriers." },
      { month: 11, day: 12, year: 2001, title: "American Airlines Flight 587", text: "An Airbus A300 crashes in Queens, New York, shortly after takeoff when its vertical stabilizer separates in flight." },
      { month: 11, day: 14, year: 1910, title: "First Takeoff From A Ship", text: "Pilot Eugene Ely takes off from a wooden platform built over the deck of the cruiser USS Birmingham, the first aircraft launch from a ship." },
      { month: 12, day: 17, year: 1903, title: "The Wright Brothers Fly", text: "Orville Wright pilots the first sustained, controlled, powered flight in history at Kitty Hawk, North Carolina — 12 seconds that changed the world.", evergreen: true },
      { month: 12, day: 21, year: 1988, title: "The Lockerbie Bombing", text: "Pan Am Flight 103 is destroyed by a terrorist bomb over Lockerbie, Scotland, killing all 259 aboard and 11 on the ground." },
      { month: 12, day: 29, year: 1972, title: "Eastern Air Lines Flight 401", text: "A distracted crew fails to notice the autopilot had disengaged, and a Lockheed L-1011 descends into the Florida Everglades — a crash that reshaped cockpit crew-resource-management training." }
    ];

    var today = new Date();
    var thisMonth = today.getMonth() + 1;
    var thisDay = today.getDate();
    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    var dateEl = document.getElementById('tdih-date');
    if (dateEl) { dateEl.textContent = monthNames[thisMonth - 1] + ' ' + thisDay; }

    var exactMatches = tdihEvents.filter(function (e) { return e.month === thisMonth && e.day === thisDay; });
    var evergreen = tdihEvents.filter(function (e) { return e.evergreen; });
    var subEl = document.getElementById('tdih-subtext');
    var toShow;

    if (exactMatches.length >= 3) {
      toShow = exactMatches.slice(0, 3);
      if (subEl) { subEl.textContent = 'On this exact date in aviation history:'; }
    } else if (exactMatches.length > 0) {
      var fillers = evergreen.filter(function (e) { return exactMatches.indexOf(e) === -1; });
      toShow = exactMatches.concat(fillers).slice(0, 3);
      if (subEl) { subEl.textContent = 'On this date, plus a few more defining moments:'; }
    } else {
      toShow = evergreen.slice(0, 3);
      if (subEl) { subEl.textContent = "No confirmed milestones fall on this exact date — here are three defining moments from aviation history:"; }
    }

    tdihEl.innerHTML = toShow.map(function (e) {
      return '<div class="history-event-card"><span class="hec-year">' + e.year + '</span><h3>' + e.title + '</h3><p>' + e.text + '</p></div>';
    }).join('');
  }
});
