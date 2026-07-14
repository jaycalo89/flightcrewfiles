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

  // Generic "fake submit" handler for newsletter + contact forms.
  // This is a static front-end demo: forms are not wired to a backend yet.
  document.querySelectorAll('form[data-demo-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = form.querySelector('[data-form-message]');
      var button = form.querySelector('button[type="submit"]');
      if (button) {
        var originalText = button.textContent;
        button.textContent = 'Submitting…';
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

  // Job filter chips (visual filtering on jobs.html)
  var chips = document.querySelectorAll('.chip[data-filter]');
  var jobCards = document.querySelectorAll('.job-card[data-region]');
  if (chips.length && jobCards.length) {
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('is-active'); });
        chip.classList.add('is-active');
        var filter = chip.getAttribute('data-filter');
        jobCards.forEach(function (card) {
          if (filter === 'all' || card.getAttribute('data-region') === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // Anonymous toggle on stories.html submission form
  var anonCheckbox = document.querySelector('#anon-submit');
  var nameField = document.querySelector('#story-name-group');
  if (anonCheckbox && nameField) {
    anonCheckbox.addEventListener('change', function () {
      if (anonCheckbox.checked) {
        nameField.style.opacity = '0.45';
        nameField.querySelector('input').setAttribute('disabled', 'disabled');
      } else {
        nameField.style.opacity = '1';
        nameField.querySelector('input').removeAttribute('disabled');
      }
    });
  }

  // Footer year
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }
});
