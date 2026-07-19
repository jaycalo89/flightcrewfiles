// Flight Crew Files — UAP sightings map (uap.html only).
// Requires Leaflet (loaded via CDN in the page) before this file runs.
// Uses L.circleMarker instead of the default pin icon, since Leaflet's
// default marker images resolve relative to the page, not the CDN, and
// 404 unless explicitly repointed — circleMarker needs no image asset.
document.addEventListener('DOMContentLoaded', function () {
  var mapEl = document.getElementById('uap-map');
  if (!mapEl || typeof L === 'undefined') return;

  var SIGHTINGS = [
    {
      id: 'roswell-1947', lat: 33.3943, lng: -104.5230,
      name: 'Roswell Incident', year: '1947', location: 'Roswell, New Mexico',
      description: 'A rancher’s discovery of strange debris led the local Army Air Field to announce it had recovered a "flying disc" — a story retracted within a day for a weather balloon explanation. The Air Force later admitted even that cover story was hiding a classified program, and persistent witness claims of recovered wreckage and pressured silence have never been officially substantiated.',
      credibility: 'Military'
    },
    {
      id: 'rendlesham-1980', lat: 52.0896, lng: 1.4274,
      name: 'Rendlesham Forest', year: '1980', location: 'Rendlesham Forest, England',
      description: 'U.S. Air Force personnel stationed beside a NATO airbase reported a craft on the ground in the forest over several nights. The deputy base commander documented radiation readings above background level in an official memo to the UK Ministry of Defence.',
      credibility: 'Military'
    },
    {
      id: 'phoenix-lights-1997', lat: 33.4484, lng: -112.0740,
      name: 'Phoenix Lights', year: '1997', location: 'Phoenix, Arizona',
      description: 'Thousands of witnesses across Arizona watched a mile-wide, V-shaped formation of lights move silently over Phoenix for roughly two hours. Then-Governor Fife Symington mocked the sighting publicly, only admitting a decade later that he had personally witnessed it too.',
      credibility: 'Civilian'
    },
    {
      id: 'nimitz-2004', lat: 32.0, lng: -119.0,
      name: 'Nimitz "Tic Tac"', year: '2004', location: 'Pacific Ocean, off California',
      description: 'Navy F/A-18 pilots training with the USS Nimitz carrier group were vectored onto a radar contact that dropped from 80,000 feet to sea level in seconds. They described a smooth, tic-tac-shaped object with no wings or exhaust that outran their jets — footage the Department of Defense later confirmed as authentic.',
      credibility: 'Military'
    },
    {
      id: 'tehran-1976', lat: 35.6892, lng: 51.3890,
      name: 'Tehran UFO', year: '1976', location: 'Tehran, Iran',
      description: 'Iranian Air Force F-4 Phantoms scrambled to intercept a bright object over Tehran reported their weapons and communications systems failing each time they approached it, recovering only once they backed away. The incident is documented in a declassified U.S. Defense Intelligence Agency report.',
      credibility: 'Military'
    },
    {
      id: 'belgium-wave-1989', lat: 50.5039, lng: 4.4699,
      name: 'Belgian Wave', year: '1989–1990', location: 'Belgium',
      description: 'A wave of thousands of sightings of large, silent triangular craft peaked when Belgian Air Force F-16s were scrambled after a target appeared on multiple radar systems. The jets recorded brief radar locks during nine attempted intercepts over the course of an hour.',
      credibility: 'Military'
    },
    {
      id: 'ohare-2006', lat: 41.9742, lng: -87.9073,
      name: "O'Hare Airport", year: '2006', location: 'Chicago, Illinois',
      description: 'United Airlines ground crew and pilots reported a dark, saucer-shaped object hovering silently over a gate before shooting straight up through solid cloud cover, punching a visible hole in the overcast behind it. The airline directed staff not to discuss the sighting.',
      credibility: 'Civilian'
    },
    {
      id: 'jal1628-1986', lat: 61.2181, lng: -149.9003,
      name: 'JAL Flight 1628', year: '1986', location: 'Anchorage, Alaska',
      description: 'A Japan Air Lines cargo crew reported a massive object pacing their 747 over Alaska for roughly 400 miles, visible on both onboard and ground radar. The FAA investigated, confirmed the radar returns, and found the veteran crew credible.',
      credibility: 'Official'
    },
    {
      id: 'shag-harbour-1967', lat: 43.4716, lng: -65.7458,
      name: 'Shag Harbour', year: '1967', location: 'Shag Harbour, Nova Scotia',
      description: 'At least eleven witnesses watched a large lit object descend into the Atlantic and vanish beneath the surface. The Royal Canadian Navy searched the seafloor for days and found nothing — one of the only crashes any government has ever officially filed as a UFO.',
      credibility: 'Official'
    },
    {
      id: 'stephenville-2008', lat: 32.2182, lng: -98.2023,
      name: 'Stephenville', year: '2008', location: 'Stephenville, Texas',
      description: 'Hundreds of residents watched a massive, fast, silent object cross the sky, followed by what looked like military jets in pursuit. The Air Force reversed its initial denial to confirm F-16s were in the area, and FAA radar data later obtained via FOIA showed an unexplained target among them.',
      credibility: 'Official'
    }
  ];

  var map = L.map('uap-map', { scrollWheelZoom: false }).setView([25, -30], 2);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function buildPopup(s) {
    var credClass = 'uap-cred-' + s.credibility.toLowerCase();
    return (
      '<div class="uap-popup">' +
        '<div class="uap-popup-title">' + escapeHtml(s.name) + ', <span class="uap-popup-year">' + escapeHtml(s.year) + '</span></div>' +
        '<div class="uap-popup-location">' + escapeHtml(s.location) + '</div>' +
        '<p class="uap-popup-desc">' + s.description + '</p>' +
        '<span class="uap-cred-badge ' + credClass + '">' + escapeHtml(s.credibility) + '</span>' +
        '<a class="uap-popup-link" href="uap.html#' + s.id + '">Read Full Case File &rarr;</a>' +
      '</div>'
    );
  }

  var markers = SIGHTINGS.map(function (s) {
    return L.circleMarker([s.lat, s.lng], {
      radius: 9,
      color: '#a9812f',
      weight: 2,
      fillColor: '#d4af37',
      fillOpacity: 0.9
    }).bindPopup(buildPopup(s), { maxWidth: 320, minWidth: 260, className: 'uap-popup-wrap' }).addTo(map);
  });

  var group = L.featureGroup(markers);
  map.fitBounds(group.getBounds().pad(0.25));
});
