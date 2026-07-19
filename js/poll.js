// Flight Crew Files — homepage weekly poll
// Static site, no backend: vote counts are a fixed baseline (BASE_VOTES) plus
// this visitor's own vote layered on top. One vote per visitor, gated by
// localStorage — voting again or in a new tab after voting is a no-op.
document.addEventListener('DOMContentLoaded', function () {

  var widget = document.getElementById('poll-widget');
  if (!widget) return;

  var POLL_KEY = 'fcf-poll-best-airline-v1';
  var BASE_VOTES = { emirates: 356, singapore: 412, qatar: 298, cathay: 143, ana: 187 };
  var LABELS = {
    emirates: 'Emirates',
    singapore: 'Singapore Airlines',
    qatar: 'Qatar Airways',
    cathay: 'Cathay Pacific',
    ana: 'ANA All Nippon Airways'
  };

  var optionsEl = document.getElementById('poll-options');
  var totalEl = document.getElementById('poll-total-votes');

  var state = null;
  try {
    var raw = localStorage.getItem(POLL_KEY);
    if (raw) { state = JSON.parse(raw); }
  } catch (e) { state = null; }
  if (!state || !state.voted || !LABELS[state.choice]) { state = null; }

  function currentCounts() {
    var counts = {};
    Object.keys(BASE_VOTES).forEach(function (key) { counts[key] = BASE_VOTES[key]; });
    if (state) { counts[state.choice] += 1; }
    return counts;
  }

  function render() {
    var voted = !!state;
    var counts = currentCounts();
    var total = Object.keys(counts).reduce(function (sum, key) { return sum + counts[key]; }, 0);

    widget.classList.toggle('is-voted', voted);

    optionsEl.querySelectorAll('.poll-option').forEach(function (btn) {
      var key = btn.getAttribute('data-option');
      var pctEl = btn.querySelector('.poll-option-pct');
      var fillEl = btn.querySelector('.poll-bar-fill');
      var votesEl = btn.querySelector('.poll-option-votes');
      var pct = total ? Math.round((counts[key] / total) * 100) : 0;

      btn.classList.toggle('is-selected', voted && key === state.choice);
      btn.setAttribute('aria-pressed', voted && key === state.choice ? 'true' : 'false');

      if (voted) {
        btn.setAttribute('aria-disabled', 'true');
        pctEl.textContent = pct + '%';
        fillEl.style.width = pct + '%';
        votesEl.textContent = counts[key].toLocaleString() + (counts[key] === 1 ? ' vote' : ' votes');
      } else {
        btn.removeAttribute('aria-disabled');
        pctEl.textContent = '';
        fillEl.style.width = '0%';
        votesEl.textContent = '';
      }
    });

    if (voted) {
      totalEl.textContent = total.toLocaleString() + ' votes this week — you picked the ' + LABELS[state.choice];
    } else {
      totalEl.textContent = 'Cast your vote — results update instantly';
    }
  }

  optionsEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.poll-option');
    if (!btn || state) return; // already voted this week — ignore further clicks

    var key = btn.getAttribute('data-option');
    if (!LABELS[key]) return;

    state = { voted: true, choice: key, votedAt: Date.now() };
    try { localStorage.setItem(POLL_KEY, JSON.stringify(state)); } catch (e) {}
    render();
  });

  render();
});
