// Flight Crew Files — per-hub Featured card. Hub pages (uap.html,
// blackbox.html, pilot/passenger/fa-archives.html, secret-skies.html,
// evolution.html) are hand-authored static HTML, not data-driven, so this
// takes a lightweight, type-agnostic approach: any existing card marked
// data-hub-featured-eligible on the page is a candidate; one is picked
// deterministically per ISO week (js/discovery-core.js) and cloned into a
// #hub-featured-mount slot near the top of the page, inside a decorative
// frame that strips the clone's own border/background so it reads as one
// oversized "Featured" block regardless of whether the underlying card was
// a .case-file, .file-card, .ss-card or .aircraft-card accordion entry.
//
// discovery-core.js must load before this file.
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    if (!window.FCFDiscovery) return;
    var mount = document.getElementById('hub-featured-mount');
    if (!mount) return;

    var eligible = Array.prototype.slice.call(document.querySelectorAll('[data-hub-featured-eligible]'));
    if (!eligible.length) return;

    var salt = location.pathname.split('/').pop() || 'hub';
    var picked = window.FCFDiscovery.pickWeekly(eligible, salt + '|hub-featured');
    if (!picked) return;

    var clone = picked.cloneNode(true);
    clone.removeAttribute('data-hub-featured-eligible');
    // Strip ids from the clone (and any nested elements) so the page never
    // ends up with two elements sharing the same id as the original card.
    clone.removeAttribute('id');
    var idEls = clone.querySelectorAll ? clone.querySelectorAll('[id]') : [];
    for (var j = 0; j < idEls.length; j++) idEls[j].removeAttribute('id');
    // evolution.html's accordion cards: force open, whether the eligible
    // node itself is a <details> or (as on evolution.html) a wrapping
    // .timeline-item with a <details class="aircraft-card"> inside it.
    if (clone.tagName === 'DETAILS') clone.open = true;
    var nestedDetails = clone.querySelectorAll ? clone.querySelectorAll('details') : [];
    for (var i = 0; i < nestedDetails.length; i++) nestedDetails[i].open = true;

    var wrap = document.createElement('div');
    wrap.className = 'hub-featured-wrap';
    wrap.innerHTML = '<span class="hub-featured-label"><span class="hub-featured-dot"></span>Featured This Week</span>';
    wrap.appendChild(clone);
    mount.appendChild(wrap);
  });
})();
