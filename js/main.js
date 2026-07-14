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
});
