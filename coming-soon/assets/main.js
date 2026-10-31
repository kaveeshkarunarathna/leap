(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- year ---------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- HUD clock ---------- */
  var clock = document.getElementById('clock');
  var start = Date.now();
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  setInterval(function () {
    if (!clock) return;
    var s = Math.floor((Date.now() - start) / 1000);
    clock.textContent = 'T-' + pad(Math.floor(s / 60) % 100) + pad(s % 60);
  }, 1000);

  /* ---------- text scramble (tagline) ---------- */
  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&/<>{}[]=+*';
  function scramble(el, delay) {
    var target = el.textContent;
    el.setAttribute('aria-label', target);
    if (reduce) return;
    el.textContent = ' ';
    var t0 = performance.now() + delay, per = 28, settle = 260;
    function frame(now) {
      var out = '', done = true;
      for (var i = 0; i < target.length; i++) {
        var ch = target[i], ti = t0 + i * per;
        if (ch === ' ') { out += ' '; continue; }
        if (now < ti) { out += ' '; done = false; }
        else if (now < ti + settle) { out += GLYPHS[(Math.random() * GLYPHS.length) | 0]; done = false; }
        else out += ch;
      }
      el.textContent = out;
      if (!done) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var tag = document.querySelector('[data-scramble]');
  if (tag) scramble(tag, 2700);

  /* ---------- scroll reveal ---------- */
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- background: nebula + particles ---------- */
  var cv = document.getElementById('bg');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  var W, H, DPR, parts = [];
  var COLORS = ['#00E5FF', '#5B8CFF', '#B14DFF'];
  var mouse = { x: 0.5, y: 0.5 };

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * DPR; cv.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var n = Math.round(Math.min(140, (W * H) / 9000));
    parts = [];
    for (var i = 0; i < n; i++) {
      parts.push({
        x: Math.random() * W, y: Math.random() * H,
        z: 0.2 + Math.random() * 0.8,
        c: COLORS[(Math.random() * 3) | 0],
        p: Math.random() * Math.PI * 2
      });
    }
  }

  function draw(t) {
    t = t / 1000;
    ctx.fillStyle = '#03060E';
    ctx.fillRect(0, 0, W, H);

    // drifting nebula blobs
    var blobs = [[0.2, 0.25, '#B14DFF', 0.9], [0.85, 0.6, '#00E5FF', 1.3], [0.5, 0.95, '#5B8CFF', 0.7]];
    var r = Math.max(W, H) * 0.6;
    for (var b = 0; b < blobs.length; b++) {
      var bl = blobs[b];
      var x = W * (bl[0] + 0.06 * Math.sin(t * 0.2 * bl[3]) + (mouse.x - 0.5) * 0.03);
      var y = H * (bl[1] + 0.05 * Math.cos(t * 0.17 * bl[3]) + (mouse.y - 0.5) * 0.03);
      var g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, bl[2] + '26'); g.addColorStop(1, bl[2] + '00');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }

    // particles: slow upward drift with twinkle + parallax
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (!reduce) {
        p.y -= 0.12 * p.z;
        if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
      }
      var px = p.x + (mouse.x - 0.5) * 30 * p.z;
      var py = p.y + (mouse.y - 0.5) * 20 * p.z;
      ctx.globalAlpha = (0.25 + 0.6 * p.z) * (0.6 + 0.4 * Math.sin(t * 2 + p.p));
      ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.arc(px, py, 0.6 + 1.6 * p.z, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (!reduce) requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', function (e) {
    mouse.x = e.clientX / W; mouse.y = e.clientY / H;
  }, { passive: true });
  resize();
  requestAnimationFrame(draw);
})();
