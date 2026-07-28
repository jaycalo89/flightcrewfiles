// Flight Crew Files — Listen Live page: lazy "quick listen" audio + "peak
// time now" badges. No audio is fetched until a visitor presses play, so
// this never adds load weight and never opens more than one stream at a
// time (starting a new station stops whatever was already playing). Each
// stream is a direct LiveATC.net feed (CORS-open audio/mpeg); if a specific
// feed has gone offline, playback fails gracefully and points listeners to
// the "Listen via LiveATC" link instead, which always reflects whatever is
// currently live for that airport.
(function () {
  var CLASS_PLAYING = 'is-playing';
  var CLASS_ERROR = 'has-error';
  var currentAudio = null;
  var currentWrap = null;

  function resetWrap(wrap) {
    wrap.classList.remove(CLASS_PLAYING);
    var status = wrap.querySelector('.quick-listen-status');
    if (status) status.textContent = 'Quick listen';
  }

  function stopCurrent() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (e) {}
      currentAudio.src = '';
    }
    if (currentWrap) resetWrap(currentWrap);
    currentAudio = null;
    currentWrap = null;
  }

  function initQuickListen() {
    var wraps = document.querySelectorAll('.quick-listen[data-feed]');
    wraps.forEach(function (wrap) {
      var btn = wrap.querySelector('.quick-listen-btn');
      var status = wrap.querySelector('.quick-listen-status');
      var feed = wrap.getAttribute('data-feed');
      var label = wrap.getAttribute('data-label') || 'this station';
      if (!btn || !feed) return;

      btn.addEventListener('click', function () {
        if (currentWrap === wrap) {
          stopCurrent();
          return;
        }
        stopCurrent();

        wrap.classList.remove(CLASS_ERROR);
        status.textContent = 'Connecting…';

        var audio = new Audio('https://d.liveatc.net/' + feed);
        audio.preload = 'none';

        audio.addEventListener('playing', function () {
          wrap.classList.add(CLASS_PLAYING);
          status.textContent = 'Live now: ' + label;
        });
        audio.addEventListener('error', function () {
          wrap.classList.remove(CLASS_PLAYING);
          wrap.classList.add(CLASS_ERROR);
          status.textContent = 'Feed offline. Try Listen via LiveATC below';
          if (currentAudio === audio) {
            currentAudio = null;
            currentWrap = null;
          }
        });

        audio.play().catch(function () {
          wrap.classList.add(CLASS_ERROR);
          status.textContent = 'Tap play to try again';
        });

        currentAudio = audio;
        currentWrap = wrap;
      });
    });

    // Don't leave a stream quietly running in a backgrounded/closed tab.
    window.addEventListener('pagehide', stopCurrent);
  }

  function toMinutes(hhmm) {
    var parts = hhmm.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }

  function isWithinPeak(tz, ranges) {
    try {
      var fmt = new Intl.DateTimeFormat('en-GB', {
        timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false,
      });
      var parts = fmt.formatToParts(new Date());
      var hh = parts.find(function (p) { return p.type === 'hour'; }).value;
      var mm = parts.find(function (p) { return p.type === 'minute'; }).value;
      var nowMin = parseInt(hh, 10) * 60 + parseInt(mm, 10);

      return ranges.some(function (r) {
        var start = toMinutes(r[0]);
        var end = toMinutes(r[1]);
        if (end >= start) return nowMin >= start && nowMin <= end;
        return nowMin >= start || nowMin <= end; // window wraps past midnight
      });
    } catch (e) {
      return false; // unsupported timezone/Intl edge case -- fail quiet, not broken
    }
  }

  function initPeakTags() {
    document.querySelectorAll('.station-peak-tag[data-tz]').forEach(function (tag) {
      var tz = tag.getAttribute('data-tz');
      var ranges;
      try {
        ranges = JSON.parse(tag.getAttribute('data-ranges'));
      } catch (e) {
        return;
      }
      if (isWithinPeak(tz, ranges)) tag.classList.add('is-active');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initQuickListen();
    initPeakTags();
  });
})();
