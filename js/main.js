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

  // Story submission tabs (tipline.html) — 5 story types, one form panel each.
  var storyTabs = document.querySelectorAll('.story-tab');
  if (storyTabs.length) {
    storyTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.getAttribute('data-tab');
        storyTabs.forEach(function (t) {
          t.classList.remove('is-active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('is-active');
        tab.setAttribute('aria-selected', 'true');
        document.querySelectorAll('.story-panel').forEach(function (panel) {
          panel.classList.toggle('is-active', panel.getAttribute('data-panel') === target);
        });
      });
    });
  }

  // "Start a Discussion" buttons (community.html) — scroll to the shared
  // submission form and pre-select its category.
  var discussButtons = document.querySelectorAll('.discuss-btn');
  if (discussButtons.length) {
    discussButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var category = btn.getAttribute('data-category');
        var categorySelect = document.getElementById('disc-category');
        if (categorySelect && category) { categorySelect.value = category; }
        var target = document.getElementById('start-discussion');
        if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        var titleField = document.getElementById('disc-title');
        if (titleField) { setTimeout(function () { titleField.focus(); }, 500); }
      });
    });
  }

  // Real form submissions (FormSubmit.co, static-site-friendly, no backend of
  // our own) for the forum's discussion form and the tipline's 5 story forms.
  // Submissions are emailed to the editorial inbox, which doubles as the
  // moderation queue. Unlike data-demo-form above, these actually send.
  var FORMSUBMIT_ENDPOINT = 'https://formsubmit.co/ajax/jaycalo89@gmail.com';
  document.querySelectorAll('form[data-live-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = form.querySelector('[data-form-message]');
      var errorMsg = form.querySelector('[data-form-error]');
      var button = form.querySelector('button[type="submit"]');
      var subject = form.getAttribute('data-subject') || 'New Submission — Flight Crew Files';
      var originalText = button ? button.textContent : '';

      if (errorMsg) { errorMsg.classList.remove('show'); }
      if (msg) { msg.classList.remove('show'); }
      if (button) { button.textContent = 'Sending…'; button.disabled = true; }

      var formData = new FormData(form);
      formData.append('_subject', subject);
      formData.append('_template', 'table');
      formData.append('_captcha', 'false');

      fetch(FORMSUBMIT_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      }).then(function (res) {
        if (!res.ok) { throw new Error('Request failed'); }
        return res.json();
      }).then(function () {
        if (msg) {
          msg.classList.add('show');
          setTimeout(function () { msg.classList.remove('show'); }, 8000);
        }
        form.reset();
      }).catch(function () {
        if (errorMsg) {
          errorMsg.classList.add('show');
          setTimeout(function () { errorMsg.classList.remove('show'); }, 8000);
        }
      }).finally(function () {
        if (button) { button.textContent = originalText; button.disabled = false; }
      });
    });
  });

  // Cookie consent banner — shows once per browser (localStorage-persisted),
  // Accept/Decline both dismiss it and record the choice. Injected via JS so
  // every page picks it up automatically from this one shared script.
  (function () {
    var STORAGE_KEY = 'fcf-cookie-consent';
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch (e) {
      return; // localStorage unavailable (private browsing lockdown, etc.) -- skip silently
    }

    var banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML =
      '<p class="cookie-banner-text">We use cookies for site functionality and to support the ads that keep Flight Crew Files free. ' +
      'See our <a href="privacy-policy.html">Privacy Policy</a> for details.</p>' +
      '<div class="cookie-banner-actions">' +
        '<button type="button" class="cookie-btn cookie-btn-decline" data-cookie-choice="declined">Decline</button>' +
        '<button type="button" class="cookie-btn cookie-btn-accept" data-cookie-choice="accepted">Accept</button>' +
      '</div>';
    document.body.appendChild(banner);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () { banner.classList.add('is-visible'); });
    });

    banner.querySelectorAll('[data-cookie-choice]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        try { localStorage.setItem(STORAGE_KEY, btn.getAttribute('data-cookie-choice')); } catch (e) {}
        banner.classList.remove('is-visible');
        setTimeout(function () { banner.remove(); }, 400);
      });
    });
  })();

  // Footer year
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  // This Day In Aviation History (homepage) — curated, date-checked events only.
  // If today's exact date has no confirmed entry, we fall back to a small pool
  // of always-true "evergreen" milestones rather than inventing a false match.
  var tdihEl = document.getElementById('tdih-events');
  if (tdihEl) {
    // Images are real, verified Wikimedia Commons photos, checked individually for
    // license and downloaded to images/tdih/ (self-hosted rather than hotlinked --
    // Wikimedia rate-limits repeated direct requests, which isn't something a
    // homepage section on every pageview should depend on). Several entries
    // intentionally share one photo of the same aircraft type where no free photo
    // of that specific incident exists -- e.g. every 747 disaster reuses the 747
    // prototype photo, both L-1011 crashes reuse the same generic L-1011 photo.
    // That's illustrative, not a photo of the actual incident, same convention
    // used on our case-file pages.
    var IMG_747 = "images/tdih/boeing-747-prototype.jpg";
    var CREDIT_747 = "InSapphoWeTrust via Wikimedia Commons, CC BY-SA 2.0 — the first Boeing 747 built, illustrative";
    var IMG_COMET = "images/tdih/comet-1-boac.jpg";
    var CREDIT_COMET = "Public domain — a BOAC de Havilland Comet 1, illustrative";
    var IMG_SPIRIT = "images/tdih/spirit-of-st-louis.jpg";
    var CREDIT_SPIRIT = "Raul654 via Wikimedia Commons, CC BY-SA 3.0 — the actual Spirit of St. Louis, on display at the Smithsonian";
    var IMG_ELY_PENNSYLVANIA = "images/tdih/uss-pennsylvania-ely-landing.jpg";
    var CREDIT_ELY_PENNSYLVANIA = "U.S. Navy, Public domain";
    var IMG_L1011 = "images/tdih/lockheed-l1011-tristar.jpg";
    var CREDIT_L1011 = "Aero Icarus via Wikimedia Commons, CC BY-SA 2.0 — a Lockheed L-1011 TriStar, illustrative";

    var tdihEvents = [
      { month: 1, day: 1, year: 1914, title: "First Scheduled Airline Flight", text: "The St. Petersburg-Tampa Airboat Line begins the world's first scheduled commercial airline service across Tampa Bay, Florida.",
        image: "images/tdih/benoist-xiv-airline.jpg", imageCredit: "Public domain — the actual Benoist XIV taking off on the inaugural flight" },
      { month: 1, day: 15, year: 2009, title: "The Miracle on the Hudson", text: "Captain Chesley “Sully” Sullenberger ditches US Airways Flight 1549 in the Hudson River after a bird strike knocks out both engines — all 155 aboard survive.", evergreen: true,
        image: "images/tdih/miracle-on-hudson.jpg", imageCredit: "Greg L via Wikimedia Commons, CC BY 2.0" },
      { month: 1, day: 18, year: 1911, title: "First Shipboard Landing", text: "Pilot Eugene Ely lands his Curtiss pusher on a platform built over the deck of the USS Pennsylvania, proving aircraft could operate from ships.",
        image: IMG_ELY_PENNSYLVANIA, imageCredit: CREDIT_ELY_PENNSYLVANIA },
      { month: 2, day: 9, year: 1969, title: "The Boeing 747 Takes Flight", text: "The first Boeing 747 — the original jumbo jet — completes its maiden flight, changing the scale of commercial air travel forever.",
        image: IMG_747, imageCredit: "InSapphoWeTrust via Wikimedia Commons, CC BY-SA 2.0 — the actual first Boeing 747 built" },
      { month: 3, day: 27, year: 1977, title: "The Tenerife Disaster", text: "Two Boeing 747s collide on a foggy runway in the Canary Islands, killing 583 people in the deadliest accident in aviation history.",
        image: IMG_747, imageCredit: CREDIT_747 },
      { month: 4, day: 18, year: 1942, title: "The Doolittle Raid", text: "Sixteen B-25 bombers launch from the carrier USS Hornet in the first American air raid on the Japanese home islands, a daring one-way mission.",
        image: "images/tdih/b25-doolittle-raid.jpeg", imageCredit: "U.S. Army Air Forces, Public domain" },
      { month: 5, day: 2, year: 1952, title: "The Jet Age Begins", text: "BOAC's de Havilland Comet enters service between London and Johannesburg, becoming the world's first commercial jet airliner.",
        image: IMG_COMET, imageCredit: "Public domain — a BOAC de Havilland Comet 1 of the era" },
      { month: 5, day: 6, year: 1937, title: "The Hindenburg Disaster", text: "The German airship Hindenburg bursts into flame while mooring at Lakehurst, New Jersey, effectively ending the era of passenger airships.",
        image: "images/tdih/hindenburg.jpg", imageCredit: "Sam Shere, Public domain" },
      { month: 5, day: 20, year: 1927, title: "Lindbergh Departs For Paris", text: "Charles Lindbergh takes off from Roosevelt Field, New York, beginning the flight that will make him the first person to cross the Atlantic solo and nonstop.",
        image: IMG_SPIRIT, imageCredit: CREDIT_SPIRIT },
      { month: 5, day: 21, year: 1927, title: "Lindbergh Lands In Paris", text: "After roughly 33.5 hours alone over the Atlantic, Lindbergh lands the Spirit of St. Louis at Le Bourget Field outside Paris to a crowd of thousands.", evergreen: true,
        image: IMG_SPIRIT, imageCredit: CREDIT_SPIRIT },
      { month: 5, day: 21, year: 1932, title: "Earhart Crosses The Atlantic", text: "Amelia Earhart lands near Derry, Northern Ireland, becoming the first woman to fly solo across the Atlantic.",
        image: "images/tdih/lockheed-vega-earhart-cockpit.jpg", imageCredit: "Smithsonian NASM via Wikimedia Commons, CC0 — the cockpit of Earhart's actual Lockheed Vega" },
      { month: 6, day: 18, year: 1928, title: "Earhart's First Atlantic Crossing", text: "Amelia Earhart becomes the first woman to cross the Atlantic by air, flying as a passenger alongside pilot Wilmer Stultz.",
        image: "images/tdih/amelia-earhart-1928.jpg", imageCredit: "Public domain, 1928" },
      { month: 6, day: 30, year: 1956, title: "The Grand Canyon Collision", text: "A TWA Constellation and a United DC-7 collide over the Grand Canyon, killing all 128 aboard both aircraft — a tragedy that helped drive the creation of the FAA.",
        image: "images/tdih/twa-constellation.jpg", imageCredit: "Aeroprints.com via Wikimedia Commons, CC BY-SA 3.0 — a TWA Lockheed Constellation, illustrative" },
      { month: 7, day: 2, year: 1937, title: "Amelia Earhart Disappears", text: "Earhart and navigator Fred Noonan vanish over the central Pacific near Howland Island during an attempt to fly around the world.",
        image: "images/tdih/amelia-earhart-1937.jpg", imageCredit: "Public domain, 1937" },
      { month: 7, day: 15, year: 1954, title: "The 707 Prototype Flies", text: "Boeing's 367-80 — the “Dash 80” prototype that led directly to the 707 — makes its first flight, launching the American jetliner era.",
        image: "images/tdih/boeing-367-80-dash80.jpg", imageCredit: "Boeing Dreamscape / Joe Parke via Wikimedia Commons, CC BY 2.0" },
      { month: 7, day: 17, year: 1996, title: "TWA Flight 800", text: "A Boeing 747 bound for Paris explodes and crashes into the Atlantic off Long Island shortly after takeoff, killing all 230 aboard.",
        image: IMG_747, imageCredit: CREDIT_747 },
      { month: 7, day: 27, year: 1949, title: "The Comet's First Flight", text: "The de Havilland Comet, the aircraft that would become the world's first jet airliner, makes its maiden flight from Hatfield, England.",
        image: IMG_COMET, imageCredit: CREDIT_COMET },
      { month: 8, day: 2, year: 1985, title: "Delta Flight 191", text: "A sudden microburst brings down a Lockheed L-1011 on approach to Dallas-Fort Worth, a disaster that led directly to modern windshear detection technology.",
        image: IMG_L1011, imageCredit: CREDIT_L1011 },
      { month: 8, day: 25, year: 1919, title: "First Daily International Airline", text: "Aircraft Transport and Travel begins the world's first daily international scheduled air service, flying between London and Paris.",
        image: "images/tdih/dh16-paris-1919.jpg", imageCredit: "Public domain — an Airco DH.16 of Aircraft Transport and Travel, Paris 1919" },
      { month: 9, day: 8, year: 1994, title: "USAir Flight 427", text: "A Boeing 737 crashes near Pittsburgh after an uncommanded rudder movement — an investigation that ultimately led to a major rudder system redesign across the 737 fleet.",
        image: "images/tdih/boeing-737-200-generic.jpg", imageCredit: "Martin Swart via Wikimedia Commons, CC BY-SA 2.0 — a Boeing 737-200, illustrative" },
      { month: 9, day: 11, year: 2001, title: "September 11th", text: "Four commercial airliners are hijacked in coordinated terrorist attacks, reshaping aviation security worldwide for decades to follow.",
        image: "images/tdih/boeing-767-generic.jpeg", imageCredit: "Ad Meskens via Wikimedia Commons, CC BY-SA 3.0 — a Boeing 767, the aircraft type involved, unrelated airline" },
      { month: 10, day: 4, year: 1958, title: "Jet Service Crosses The Atlantic", text: "BOAC's de Havilland Comet 4 opens the first transatlantic jet passenger service, flying between London and New York.",
        image: IMG_COMET, imageCredit: "Public domain — a BOAC de Havilland Comet, illustrative (Comet 1 pictured; this event flew the later Comet 4)" },
      { month: 10, day: 14, year: 1947, title: "Breaking The Sound Barrier", text: "Chuck Yeager becomes the first person to fly faster than the speed of sound, piloting the Bell X-1 “Glamorous Glennis” over the Mojave Desert.", evergreen: true,
        image: "images/tdih/chuck-yeager-x1.jpg", imageCredit: "U.S. Air Force, Public domain — Yeager beside the actual Bell X-1" },
      { month: 10, day: 26, year: 1958, title: "Pan Am's 707 Debut", text: "Pan American World Airways begins Boeing 707 transatlantic service between New York and Paris, kicking off the jet age for U.S. carriers.",
        image: "images/tdih/pan-am-707-delivery.jpg", imageCredit: "Smithsonian NASM, Public domain — Pan Am 707s awaiting delivery" },
      { month: 11, day: 12, year: 2001, title: "American Airlines Flight 587", text: "An Airbus A300 crashes in Queens, New York, shortly after takeoff when its vertical stabilizer separates in flight.",
        image: "images/tdih/airbus-a300-generic.jpg", imageCredit: "Public domain — an American Airlines Airbus A300 at JFK, illustrative" },
      { month: 11, day: 14, year: 1910, title: "First Takeoff From A Ship", text: "Pilot Eugene Ely takes off from a wooden platform built over the deck of the cruiser USS Birmingham, the first aircraft launch from a ship.",
        image: IMG_ELY_PENNSYLVANIA, imageCredit: "U.S. Navy, Public domain — Ely's 1911 USS Pennsylvania landing, illustrative (no free photo of the 1910 Birmingham takeoff itself is known to survive)" },
      { month: 12, day: 17, year: 1903, title: "The Wright Brothers Fly", text: "Orville Wright pilots the first sustained, controlled, powered flight in history at Kitty Hawk, North Carolina — 12 seconds that changed the world.", evergreen: true,
        image: "images/tdih/wright-brothers-first-flight.jpg", imageCredit: "John T. Daniels, Public domain — the actual first flight" },
      { month: 12, day: 21, year: 1988, title: "The Lockerbie Bombing", text: "Pan Am Flight 103 is destroyed by a terrorist bomb over Lockerbie, Scotland, killing all 259 aboard and 11 on the ground.",
        image: IMG_747, imageCredit: CREDIT_747 },
      { month: 12, day: 29, year: 1972, title: "Eastern Air Lines Flight 401", text: "A distracted crew fails to notice the autopilot had disengaged, and a Lockheed L-1011 descends into the Florida Everglades — a crash that reshaped cockpit crew-resource-management training.",
        image: IMG_L1011, imageCredit: CREDIT_L1011 }
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
      var searchUrl = 'https://www.google.com/search?q=' + encodeURIComponent(e.title + ' aviation history');
      var titleAttr = e.imageCredit ? ' title="Photo: ' + e.imageCredit.replace(/"/g, '&quot;') + '"' : '';
      return '<div class="history-event-card">' +
        '<div class="hec-media"><img src="' + e.image + '" alt="' + e.title + '" loading="lazy"' + titleAttr + '><span class="hec-year">' + e.year + '</span></div>' +
        '<div class="hec-body">' +
          '<h3>' + e.title + '</h3><p>' + e.text + '</p>' +
          '<a class="hec-readmore" href="' + searchUrl + '" target="_blank" rel="noopener">Read More <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>' +
        '</div>' +
      '</div>';
    }).join('');
  }
});
