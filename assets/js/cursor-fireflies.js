(function () {
  "use strict";

  var canvas = document.querySelector("[data-cursor-fireflies]");
  if (!canvas) return;

  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var fineQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  var darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  var TAU = Math.PI * 2;
  var FLY_COUNT = 10;
  var IDLE_AFTER = 2200;
  var FADE_IN = 220;
  var FADE_OUT = 650;

  var width = 0;
  var height = 0;
  var dpr = 1;
  var flies = [];
  var pointer = { x: 0, y: 0, active: false };
  var accent = [166, 90, 31];
  var core = [210, 172, 143];
  var intensity = 1;
  var presence = 0;
  var lastMove = 0;
  var rafId = 0;
  var lastTime = 0;
  var running = false;
  var observer = null;

  function readPalette() {
    var color = window.getComputedStyle(canvas).color;
    var parts = color && color.match(/\d+(\.\d+)?/g);

    if (!parts || parts.length < 3) return;

    accent = [Number(parts[0]), Number(parts[1]), Number(parts[2])];
    core = accent.map(function (channel) {
      return Math.round(channel + (255 - channel) * 0.32);
    });

    // 浅色主题的铜色更深，稍微提亮一点才不会糊在纸上
    var luminance = accent[0] * 0.299 + accent[1] * 0.587 + accent[2] * 0.114;
    intensity = luminance < 170 ? 1.3 : 1;
  }

  function rgba(rgb, alpha) {
    return "rgba(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ", " +
      Math.max(0, Math.min(1, alpha)) + ")";
  }

  function makeFlies() {
    flies = [];

    for (var i = 0; i < FLY_COUNT; i += 1) {
      var angle = Math.random() * TAU;
      var radius = 40 + Math.random() * 130;

      flies.push({
        x: pointer.x + Math.cos(angle) * radius,
        y: pointer.y + Math.sin(angle) * radius * 0.8,
        vx: 0,
        vy: 0,
        phase: Math.random() * TAU,
        speed: 0.55 + Math.random() * 0.85,
        size: 1.2 + Math.random() * 1.4,
        lag: 0.024 + Math.random() * 0.034,
        orbit: 58 + Math.random() * 108,
        blink: Math.random() * TAU,
        blinkSpeed: 0.6 + Math.random() * 0.9
      });
    }
  }

  function resize() {
    width = Math.max(1, window.innerWidth);
    height = Math.max(1, window.innerHeight);
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function update(dt, time) {
    var step = Math.min(dt / 16.67, 2);
    var idle = time - lastMove > IDLE_AFTER;
    var target = pointer.active && !idle ? 1 : 0;

    if (target) {
      presence = Math.min(1, presence + dt / FADE_IN);
    } else {
      presence = Math.max(0, presence - dt / FADE_OUT);
    }

    if (!pointer.active && presence === 0) return false;
    if (idle && presence === 0) {
      pointer.active = false;
      return false;
    }

    for (var i = 0; i < flies.length; i += 1) {
      var fly = flies[i];
      var angle = fly.phase + time * 0.00055 * fly.speed;
      var targetX = pointer.x + Math.cos(angle) * fly.orbit;
      var targetY = pointer.y + Math.sin(angle * 1.28) * fly.orbit * 0.74;

      fly.vx += (targetX - fly.x) * fly.lag * step;
      fly.vy += (targetY - fly.y) * fly.lag * step;
      fly.vx *= 0.94;
      fly.vy *= 0.94;
      fly.x += fly.vx * step;
      fly.y += fly.vy * step;
    }

    return true;
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);

    for (var i = 0; i < flies.length; i += 1) {
      var fly = flies[i];
      var pulse = 0.52 + 0.48 * Math.pow(
        Math.max(0, Math.sin(time * 0.0013 * fly.blinkSpeed + fly.blink)),
        2
      );
      var alpha = presence * pulse * intensity;

      if (alpha <= 0.01) continue;

      var radius = fly.size * 4.8;
      var glow = ctx.createRadialGradient(fly.x, fly.y, 0, fly.x, fly.y, radius);
      glow.addColorStop(0, rgba(core, alpha));
      glow.addColorStop(0.3, rgba(accent, alpha * 0.7));
      glow.addColorStop(1, rgba(accent, 0));

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(fly.x, fly.y, radius, 0, TAU);
      ctx.fill();

      ctx.fillStyle = rgba(core, alpha);
      ctx.beginPath();
      ctx.arc(fly.x, fly.y, Math.max(0.6, fly.size * 0.62), 0, TAU);
      ctx.fill();
    }
  }

  function frame(time) {
    var dt = lastTime ? Math.min(time - lastTime, 48) : 16.67;
    lastTime = time;

    if (!update(dt, time)) {
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

    ctx.clearRect(0, 0, width, height);
  }

  function hide() {
    pointer.active = false;
  }

  function onPointerMove(event) {
    if (motionQuery.matches || !fineQuery.matches || event.pointerType === "touch") {
      return;
    }

    if (!pointer.active) {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      presence = 0;
      makeFlies();
    } else {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    }

    lastMove = performance.now();
    start();
  }

  function handleThemeChange() {
    readPalette();
  }

  function handleMotionChange() {
    if (motionQuery.matches) {
      hide();
      presence = 0;
      stop();
    }
  }

  function bindEvents() {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("scroll", hide, { passive: true });
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
      motionQuery.addEventListener("change", handleMotionChange);
    } else if (typeof motionQuery.addListener === "function") {
      motionQuery.addListener(handleMotionChange);
    }

    if (typeof fineQuery.addEventListener === "function") {
      fineQuery.addEventListener("change", function () {
        if (!fineQuery.matches) {
          hide();
          presence = 0;
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
