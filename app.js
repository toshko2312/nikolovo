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

// ---- Image lightbox: click a photo to open it larger in a dialog ----
(function () {
  var imgs = document.querySelectorAll('.post-media img, .gallery-item img');
  if (!imgs.length || typeof HTMLDialogElement === 'undefined') return;

  var dlg = document.createElement('dialog');
  dlg.className = 'lightbox';
  var big = document.createElement('img');
  big.decoding = 'async';
  dlg.appendChild(big);
  document.body.appendChild(dlg);

  imgs.forEach(function (img) {
    img.classList.add('zoomable');
    img.addEventListener('click', function () {
      big.src = img.currentSrc || img.src; // reuse the already-loaded (webp) source
      big.alt = img.alt || '';
      dlg.showModal();
    });
  });

  // Click anywhere (image or backdrop) closes; Escape closes natively.
  dlg.addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('close', function () { big.removeAttribute('src'); });
})();

// ---- Custom themed video player (progressive enhancement over <video>) ----
(function () {
  var videos = document.querySelectorAll('video.post-video');
  if (!videos.length) return;

  var SVG = {
    play:  '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
    vol:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/></svg>',
    mute:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none"/><path d="M17 9.5l4 5M21 9.5l-4 5"/></svg>',
    full:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    big:   '<svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="38" fill="rgba(12,15,10,.45)" stroke="#fff" stroke-width="2"/><path d="M33 26v28l23-14z" fill="#fff"/></svg>'
  };

  function fmt(t) {
    if (!isFinite(t) || t < 0) t = 0;
    var m = Math.floor(t / 60), s = Math.floor(t % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  videos.forEach(function (v) {
    v.removeAttribute('controls');
    v.setAttribute('playsinline', '');

    var wrap = document.createElement('div');
    wrap.className = 'player paused';
    v.parentNode.insertBefore(wrap, v);
    wrap.appendChild(v);

    var big = document.createElement('button');
    big.type = 'button';
    big.className = 'pl-big';
    big.setAttribute('aria-label', 'Пусни видео / Play');
    big.innerHTML = SVG.big;
    wrap.appendChild(big);

    var bar = document.createElement('div');
    bar.className = 'pl-bar';
    bar.innerHTML =
      '<button type="button" class="pl-btn pl-play" aria-label="Пусни / пауза">' + SVG.play + '</button>' +
      '<input type="range" class="pl-seek" min="0" max="100" value="0" step="0.1" aria-label="Позиция във видеото">' +
      '<span class="pl-time">0:00</span>' +
      '<button type="button" class="pl-btn pl-mute" aria-label="Заглуши / включи звук">' + SVG.vol + '</button>' +
      '<button type="button" class="pl-btn pl-full" aria-label="Цял екран">' + SVG.full + '</button>';
    wrap.appendChild(bar);

    var playBtn = bar.querySelector('.pl-play');
    var seek    = bar.querySelector('.pl-seek');
    var time    = bar.querySelector('.pl-time');
    var muteBtn = bar.querySelector('.pl-mute');
    var fullBtn = bar.querySelector('.pl-full');
    var seeking = false;

    function toggle() { v.paused ? v.play() : v.pause(); }
    big.addEventListener('click', toggle);
    playBtn.addEventListener('click', toggle);
    v.addEventListener('click', toggle);

    v.addEventListener('play', function () {
      wrap.classList.remove('paused'); wrap.classList.add('playing');
      playBtn.innerHTML = SVG.pause;
    });
    v.addEventListener('pause', function () {
      wrap.classList.add('paused'); wrap.classList.remove('playing');
      playBtn.innerHTML = SVG.play;
    });

    function refreshTime() {
      time.textContent = fmt(v.currentTime) + ' / ' + fmt(v.duration);
    }
    v.addEventListener('loadedmetadata', refreshTime);
    v.addEventListener('timeupdate', function () {
      if (!seeking && v.duration) seek.value = (v.currentTime / v.duration) * 100;
      refreshTime();
    });

    seek.addEventListener('input', function () {
      seeking = true;
      if (v.duration) time.textContent = fmt(v.duration * seek.value / 100) + ' / ' + fmt(v.duration);
    });
    seek.addEventListener('change', function () {
      if (v.duration) v.currentTime = v.duration * seek.value / 100;
      seeking = false;
    });

    muteBtn.addEventListener('click', function () { v.muted = !v.muted; });
    v.addEventListener('volumechange', function () {
      muteBtn.innerHTML = v.muted || v.volume === 0 ? SVG.mute : SVG.vol;
    });

    fullBtn.addEventListener('click', function () {
      if (document.fullscreenElement) { document.exitFullscreen(); return; }
      if (wrap.requestFullscreen) wrap.requestFullscreen();
      else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen(); // iOS Safari
    });
  });
})();
