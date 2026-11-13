(function () {
  "use strict";

  var canvas = document.querySelector("[data-cursor-stardust]");
  if (!canvas) return;

  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var fineQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  var darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  var TAU = Math.PI * 2;
  var MAX_DUST = 180;

  var width = 0;
  var height = 0;
  var dpr = 1;
  var dust = [];
  var pointer = { x: 0, y: 0, active: false };
  var accent = [166, 90, 31];
  var bright = [210, 172, 143];
  var intensity = 1;
  var rafId = 0;
  var lastTime = 0;
  var running = false;
  var observer = null;

  function readPalette() {
    var color = window.getComputedStyle(canvas).color;
    var parts = color && color.match(/\d+(\.\d+)?/g);

    if (!parts || parts.length < 3) return;

    accent = [Number(parts[0]), Number(parts[1]), Number(parts[2])];
    bright = accent.map(function (channel) {
      return Math.round(channel + (255 - channel) * 0.55);
    });

    // 浅色主题的铜色更深，稍微提亮一点才不会糊在纸上
    var luminance = accent[0] * 0.299 + accent[1] * 0.587 + accent[2] * 0.114;
    intensity = luminance < 170 ? 1.25 : 1;
  }

  function rgba(rgb, alpha) {
    return "rgba(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ", " +
      Math.max(0, Math.min(1, alpha)) + ")";
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function resize() {
    width = Math.max(1, window.innerWidth);
    height = Math.max(1, window.innerHeight);
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn(x, y, vx, vy) {
    var angle = Math.random() * TAU;
    var drift = Math.random() * 0.32;
    var life = 520 + Math.random() * 460;

    dust.push({
      x: x + (Math.random() - 0.5) * 7,
      y: y + (Math.random() - 0.5) * 7,
      vx: clamp(vx * 0.05, -1.5, 1.5) + Math.cos(angle) * drift,
      vy: clamp(vy * 0.05, -1.5, 1.5) + Math.sin(angle) * drift - 0.08,
      life: life,
      maxLife: life,
      size: 0.5 + Math.random() * 1.2 + (Math.random() > 0.9 ? 0.8 : 0),
      twinkle: Math.random() * TAU,
      twinkleSpeed: 0.004 + Math.random() * 0.006,
      warm: Math.random() > 0.28
    });

    if (dust.length > MAX_DUST) {
      dust.splice(0, dust.length - MAX_DUST);
    }
  }

  function emit(fromX, fromY, toX, toY) {
    var dx = toX - fromX;
    var dy = toY - fromY;
    var distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 1) return;

    var count = Math.min(4, Math.max(1, Math.round(distance / 8)));

    for (var i = 1; i <= count; i += 1) {
      var t = i / (count + 1);
      spawn(fromX + dx * t, fromY + dy * t, dx, dy);
    }
  }

  function update(dt) {
    var step = Math.min(dt / 16.67, 2);

    for (var i = dust.length - 1; i >= 0; i -= 1) {
      var p = dust[i];
      p.life -= dt;

      if (p.life <= 0) {
        dust.splice(i, 1);
        continue;
      }

      p.x += p.vx * step;
      p.y += p.vy * step;
      p.vx *= 0.985;
      p.vy = p.vy * 0.985 + 0.002;
    }

    return dust.length > 0;
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);

    for (var i = 0; i < dust.length; i += 1) {
      var p = dust[i];
      var life = p.life / p.maxLife;
      var twinkle = 0.6 + 0.4 * Math.sin(time * p.twinkleSpeed + p.twinkle);
      var alpha = Math.min(1, life * 2.2) * twinkle * intensity;
      var rgb = p.warm ? accent : bright;

      if (alpha <= 0.01) continue;

      if (p.size > 1.1) {
        ctx.fillStyle = rgba(rgb, alpha * 0.18);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3.4, 0, TAU);
        ctx.fill();
      }

      ctx.fillStyle = rgba(rgb, alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, TAU);
      ctx.fill();
    }
  }

  function frame(time) {
    var dt = lastTime ? Math.min(time - lastTime, 48) : 16.67;
    lastTime = time;

    if (!update(dt)) {
      stop();
      return;
    }

    draw(time);
    rafId = window.requestAnimationFrame(frame);
  }

  function start() {
    if (running || motionQuery.matches || !fineQuery.matches) return;

    running = true;
    lastTime = 0;
    rafId = window.requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    lastTime = 0;

    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }

    dust = [];
    ctx.clearRect(0, 0, width, height);
  }

  function onPointerMove(event) {
    if (motionQuery.matches || !fineQuery.matches || event.pointerType === "touch") {
      return;
    }

    var prevX = pointer.active ? pointer.x : event.clientX;
    var prevY = pointer.active ? pointer.y : event.clientY;

    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;

    emit(prevX, prevY, pointer.x, pointer.y);
    start();
  }

  function handleThemeChange() {
    readPalette();
  }

  function hide() {
    pointer.active = false;
  }

  function bindEvents() {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("blur", hide);

    document.addEventListener("mouseout", function (event) {
      if (!event.relatedTarget) hide();
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        hide();
        stop();
      }
    });

    if (typeof motionQuery.addEventListener === "function") {
      motionQuery.addEventListener("change", function () {
        if (motionQuery.matches) {
          hide();
          stop();
        }
      });
    } else if (typeof motionQuery.addListener === "function") {
      motionQuery.addListener(function () {
        if (motionQuery.matches) {
          hide();
          stop();
        }
      });
    }

    if (typeof fineQuery.addEventListener === "function") {
      fineQuery.addEventListener("change", function () {
        if (!fineQuery.matches) {
          hide();
          stop();
        }
      });
    }

    if (typeof darkQuery.addEventListener === "function") {
      darkQuery.addEventListener("change", handleThemeChange);
    } else if (typeof darkQuery.addListener === "function") {
      darkQuery.addListener(handleThemeChange);
    }

    if (window.MutationObserver) {
      observer = new MutationObserver(handleThemeChange);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-season", "class"]
      });
      if (document.body) {
        observer.observe(document.body, {
          attributes: true,
          attributeFilter: ["class"]
        });
      }
    }
  }

  resize();
  readPalette();
  bindEvents();
})();
