// Flight Crew Files — sitewide breadcrumb trail + schema.org BreadcrumbList.
// Pure JS injection: needs zero markup changes on any of the 56 pages beyond
// this file's own <script> tag, since <header class="site-header"> is a
// reliable anchor present on every page. Skipped on index.html (it IS home)
// and 404.html (not part of the real hierarchy).
(function () {
  var ROUTES = {
    // ---- top-level (children of Home) ----
    'stories.html': { label: 'Case Files & Stories', parent: null },
    'blackbox.html': { label: 'Black Box Files', parent: null },
    'uap.html': { label: 'UAP Files', parent: null },
    'news.html': { label: 'Flight Log', parent: null },
    'community.html': { label: 'Community Hub', parent: null },
    'resources.html': { label: 'Resources', parent: null },
    'history.html': { label: 'Aviation History', parent: null },
    'about.html': { label: 'About', parent: null },
    'contact.html': { label: 'Contact', parent: null },
    'tipline.html': { label: 'Tip Line', parent: null },
    'privacy-policy.html': { label: 'Privacy Policy', parent: null },
    'terms-of-service.html': { label: 'Terms of Service', parent: null },
    'dmca.html': { label: 'DMCA Policy', parent: null },
    'corrections.html': { label: 'Corrections Policy', parent: null },
    'search.html': { label: 'Search', parent: null },
    'saved-files.html': { label: 'Saved Files', parent: null },

    // ---- Case Files & Stories categories ----
    'scary.html': { label: 'Scary Stories', parent: 'stories.html' },
    'heroic.html': { label: 'Heroic Moments', parent: 'stories.html' },
    'bizarre.html': { label: 'Bizarre & Unexplained', parent: 'stories.html' },
    'pilots.html': { label: 'Pilot Stories', parent: 'stories.html' },
    'crew.html': { label: 'Crew Stories', parent: 'stories.html' },
    'passengers.html': { label: 'Passenger Stories', parent: 'stories.html' },

    // ---- deeper archives ----
    'pilot-archives.html': { label: 'The Pilot Files', parent: 'pilots.html' },
    'fa-archives.html': { label: 'The Cabin Crew Files', parent: 'crew.html' },
    'passenger-archives.html': { label: 'The Passenger Files', parent: 'passengers.html' },

    // ---- Black Box Files deep-dives ----
    'pan-am-103.html': { label: 'Pan Am 103', parent: 'blackbox.html' },
    'japan-airlines-123.html': { label: 'Japan Airlines 123', parent: 'blackbox.html' },
    'air-florida-90.html': { label: 'Air Florida 90', parent: 'blackbox.html' },
    'air-france-447.html': { label: 'Air France 447', parent: 'blackbox.html' },
    'helios522.html': { label: 'Helios 522', parent: 'blackbox.html' },
    'tenerife-disaster.html': { label: 'Tenerife Disaster', parent: 'blackbox.html' },
    'kegworth-air-disaster.html': { label: 'Kegworth Air Disaster', parent: 'blackbox.html' },
    'swissair-111.html': { label: 'Swissair 111', parent: 'blackbox.html' },
    'ethiopian-airlines-961.html': { label: 'Ethiopian Airlines 961', parent: 'blackbox.html' },
    'twa-flight-800.html': { label: 'TWA Flight 800', parent: 'blackbox.html' },
    'payne-stewart.html': { label: 'Payne Stewart', parent: 'blackbox.html' },
    'alaska-airlines-261.html': { label: 'Alaska Airlines 261', parent: 'blackbox.html' },

    // ---- Heroic Moments deep-dives ----
    'united-232.html': { label: 'United 232', parent: 'heroic.html' },
    'gimli-glider.html': { label: 'Gimli Glider', parent: 'heroic.html' },
    'aloha-airlines-243.html': { label: 'Aloha 243', parent: 'heroic.html' },
    'captain-eric-moody.html': { label: 'Captain Eric Moody', parent: 'heroic.html' },
    'nicholas-alkemade.html': { label: 'Nicholas Alkemade', parent: 'heroic.html' },
    'miracle-on-the-hudson.html': { label: 'Miracle On The Hudson', parent: 'heroic.html' },

    // ---- Bizarre & Unexplained deep-dives ----
    'mh370.html': { label: 'MH370', parent: 'bizarre.html' },
    'amelia-earhart.html': { label: 'Amelia Earhart', parent: 'bizarre.html' },

    // ---- UAP Files deep-dives ----
    'rendlesham-forest.html': { label: 'Rendlesham Forest', parent: 'uap.html' },
    'frederick-valentich.html': { label: 'Frederick Valentich', parent: 'uap.html' },
    'captain-mantell.html': { label: 'Captain Mantell', parent: 'uap.html' },
    'jal-flight-1628.html': { label: 'JAL Flight 1628', parent: 'uap.html' },

    // ---- Passenger Files deep-dive ----
    'juliane-koepcke.html': { label: 'Juliane Koepcke', parent: 'passenger-archives.html' },

    // ---- Aviation History ----
    'secret-skies.html': { label: 'The Secret Skies', parent: 'history.html' },
    'evolution.html': { label: 'Evolution of Flight', parent: 'history.html' },

    // ---- Secret Skies aircraft ----
    'a12-oxcart.html': { label: 'A-12 Oxcart', parent: 'secret-skies.html' },
    'horten-ho229.html': { label: 'Horten Ho 229', parent: 'secret-skies.html' },
    'sr71-blackbird.html': { label: 'SR-71 Blackbird', parent: 'secret-skies.html' },
    'f117-nighthawk.html': { label: 'F-117 Nighthawk', parent: 'secret-skies.html' },
    'u2-spy-plane.html': { label: 'U-2 Spy Plane', parent: 'secret-skies.html' },

    // ---- Resources ----
    'listen-live.html': { label: 'Listen Live', parent: 'resources.html' },
    'live-flights.html': { label: 'Live Flights', parent: 'resources.html' },
    'glossary.html': { label: 'Aviation Glossary', parent: 'resources.html' },
    'fear-of-flying.html': { label: 'Fear of Flying', parent: 'resources.html' },
    'bookshelf.html': { label: 'Bookshelf', parent: 'resources.html' },
    'videos.html': { label: 'Video Feed', parent: 'resources.html' }
  };

  function currentFile() {
    var file = location.pathname.split('/').pop();
    return file || 'index.html';
  }

  function buildChain(file) {
    var chain = [];
    var seen = {};
    while (file && ROUTES[file] && !seen[file]) {
      seen[file] = true;
      chain.unshift({ label: ROUTES[file].label, url: file });
      file = ROUTES[file].parent;
    }
    return chain;
  }

  function injectJsonLd(chain) {
    var items = [{ '@type': 'ListItem', position: 1, name: 'Home', item: location.origin + '/index.html' }];
    chain.forEach(function (item, i) {
      items.push({ '@type': 'ListItem', position: i + 2, name: item.label, item: location.origin + '/' + item.url });
    });
    var ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items });
    document.head.appendChild(ld);
  }

  function renderTrail(chain) {
    var header = document.querySelector('header.site-header');
    if (!header) return;

    var nav = document.createElement('nav');
    nav.className = 'fcf-breadcrumbs';
    nav.setAttribute('aria-label', 'Breadcrumb');

    var container = document.createElement('div');
    container.className = 'container';
    var ol = document.createElement('ol');

    var homeLi = document.createElement('li');
    homeLi.innerHTML = '<a href="index.html">Home</a>';
    ol.appendChild(homeLi);

    chain.forEach(function (item, i) {
      var li = document.createElement('li');
      if (i === chain.length - 1) {
        li.textContent = item.label;
        li.setAttribute('aria-current', 'page');
      } else {
        var a = document.createElement('a');
        a.href = item.url;
        a.textContent = item.label;
        li.appendChild(a);
      }
      ol.appendChild(li);
    });

    container.appendChild(ol);
    nav.appendChild(container);
    header.insertAdjacentElement('afterend', nav);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var file = currentFile();
    if (!ROUTES[file]) return; // index.html, 404.html, or anything unmapped
    var chain = buildChain(file);
    if (!chain.length) return;
    renderTrail(chain);
    injectJsonLd(chain);
  });
})();
