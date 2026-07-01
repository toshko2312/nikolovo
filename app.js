/* Николово — shared interactions: theme toggle + mobile nav.
   Dark class is set on <html> by an inline head script before paint to avoid flash;
   this file only handles toggling and the hamburger menu. */
(function () {
  'use strict';

  // ---- Theme toggle ----
  var btn = document.getElementById('themeBtn');
  function syncIcon() {
    if (btn) btn.textContent = document.documentElement.classList.contains('dark') ? '☀' : '☾';
  }
  syncIcon();
  if (btn) {
    btn.addEventListener('click', function () {
      var dark = !document.documentElement.classList.contains('dark');
      document.documentElement.classList.toggle('dark', dark);
      try { localStorage.setItem('nikolovo-theme', dark ? 'dark' : 'light'); } catch (e) {}
      syncIcon();
    });
  }

  // ---- Language dropdown: close on outside click / Escape ----
  var lang = document.querySelector('.lang-switch');
  if (lang) {
    document.addEventListener('click', function (e) {
      if (lang.open && !lang.contains(e.target)) lang.open = false;
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') lang.open = false;
    });
  }

  // ---- Mobile nav (hamburger) ----
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('mobileNav');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // Close after tapping a link
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
})();
