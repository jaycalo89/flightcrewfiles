// Flight Crew Files — UAP sightings map (uap.html only).
// Requires Leaflet (loaded via CDN in the page) before this file runs.
// Uses L.circleMarker instead of the default pin icon, since Leaflet's
// default marker images resolve relative to the page, not the CDN, and
// 404 unless explicitly repointed — circleMarker needs no image asset.
document.addEventListener('DOMContentLoaded', function () {
  var mapEl = document.getElementById('uap-map');
  if (!mapEl || typeof L === 'undefined') return;

  var SIGHTINGS = [
    { lat: 33.3943, lng: -104.5230, label: 'Roswell Incident, 1947' },
    { lat: 52.0896, lng: 1.4274, label: 'Rendlesham Forest, 1980' },
    { lat: 33.4484, lng: -112.0740, label: 'Phoenix Lights, 1997' },
    { lat: 32.0, lng: -119.0, label: 'Nimitz Tic Tac, 2004' },
    { lat: 35.6892, lng: 51.3890, label: 'Tehran UFO, 1976' },
    { lat: 50.5039, lng: 4.4699, label: 'Belgium Wave, 1989' },
    { lat: 41.9742, lng: -87.9073, label: "O'Hare Airport, 2006" },
    { lat: 61.2181, lng: -149.9003, label: 'JAL Flight 1628, 1986' },
    { lat: 43.4716, lng: -65.7458, label: 'Shag Harbour, 1967' },
    { lat: 32.2182, lng: -98.2023, label: 'Stephenville, 2008' }
  ];

  var map = L.map('uap-map', { scrollWheelZoom: false }).setView([25, -30], 2);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  var markers = SIGHTINGS.map(function (s) {
    return L.circleMarker([s.lat, s.lng], {
      radius: 9,
      color: '#a9812f',
      weight: 2,
      fillColor: '#d4af37',
      fillOpacity: 0.9
    }).bindPopup('<strong>' + s.label + '</strong>').addTo(map);
  });

  var group = L.featureGroup(markers);
  map.fitBounds(group.getBounds().pad(0.25));
});
