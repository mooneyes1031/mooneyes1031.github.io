(function () {
  "use strict";

  var canvas = document.querySelector("[data-ambient-stars]");
  if (!canvas) return;

  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  var TAU = Math.PI * 2;
  var LINK_DISTANCE = 115;
  var POINTER_DISTANCE = 200;

  var width = 0;
  var height = 0;
  var dpr = 1;
  var stars = [];
  var accent = "#a65a1f";
  var pointer = { x: 0, y: 0, active: false };
  var rafId = 0;
  var lastTime = 0;
  var running = false;
  var observer = null;
  var resizeObserver = null;

  function readAccent() {
    var color = window.getComputedStyle(canvas).color;

    if (color && color !== "rgba(0, 0, 0, 0)") {
      accent = color;
    }
  }

  function makeStars() {
    var count = Math.round((width * height) / 7000);
    count = Math.max(42, Math.min(120, count));
    stars = [];

    for (var i = 0; i < count; i += 1) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: 1 + Math.random() * 1.5,
        alpha: 0.36 + Math.random() * 0.5,
        phase: Math.random() * TAU,
        twinkle: 0.05 + Math.random() * 0.08
      });
    }
  }

  function resize() {
    var rect = canvas.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    makeStars();
  }

  function update(dt) {
    var step = Math.min(dt / 16.67, 2);

    for (var i = 0; i < stars.length; i += 1) {
      var star = stars[i];
      star.x += star.vx * step;
      star.y += star.vy * step;

      if (star.x < -12) star.x = width + 12;
      else if (star.x > width + 12) star.x = -12;

      if (star.y < -12) star.y = height + 12;
      else if (star.y > height + 12) star.y = -12;
    }
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = accent;
    ctx.strokeStyle = accent;
    ctx.lineCap = "round";

    var i;
    var j;
    var p;
    var q;
    var dx;
    var dy;
    var distance;
    var alpha;
    var near;

    // 星点之间很淡的连线，像星座的底稿
    ctx.lineWidth = 0.65;
    for (i = 0; i < stars.length; i += 1) {
      p = stars[i];
      for (j = i + 1; j < stars.length; j += 1) {
        q = stars[j];
        dx = p.x - q.x;
        dy = p.y - q.y;

        if (Math.abs(dx) > LINK_DISTANCE || Math.abs(dy) > LINK_DISTANCE) {
          continue;
        }

        distance = Math.sqrt(dx * dx + dy * dy);
        if (distance >= LINK_DISTANCE) continue;

        alpha = (1 - distance / LINK_DISTANCE) * 0.14;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }
    }

    // 鼠标附近的星点被连起来，形成更明显的星座
    if (pointer.active) {
      ctx.lineWidth = 1.1;
      for (i = 0; i < stars.length; i += 1) {
        p = stars[i];
        dx = p.x - pointer.x;
        dy = p.y - pointer.y;

        if (Math.abs(dx) > POINTER_DISTANCE || Math.abs(dy) > POINTER_DISTANCE) {
          continue;
        }

        distance = Math.sqrt(dx * dx + dy * dy);
        if (distance >= POINTER_DISTANCE) continue;

        alpha = (1 - distance / POINTER_DISTANCE) * 0.58;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(pointer.x, pointer.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
    }

    // 每颗星自己呼吸、闪烁；靠近鼠标时更亮一点
    for (i = 0; i < stars.length; i += 1) {
      p = stars[i];
      near = 0;

      if (pointer.active) {
        dx = p.x - pointer.x;
        dy = p.y - pointer.y;
        distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < POINTER_DISTANCE) {
          near = 1 - distance / POINTER_DISTANCE;
        }
      }

      alpha = p.alpha + Math.sin(time * 0.0012 + p.phase) * p.twinkle + near * 0.35;
      ctx.globalAlpha = Math.max(0.2, Math.min(1, alpha));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r + near * 1, 0, TAU);
      ctx.fill();
    }

    // 鼠标位置本身是一个小节点
    if (pointer.active) {
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, 2.6, 0, TAU);
      ctx.fill();

      ctx.globalAlpha = 0.32;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, 7, 0, TAU);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }

  function frame(time) {
    var dt = lastTime ? time - lastTime : 16.67;
    lastTime = time;
    update(dt);
    draw(time);
    rafId = window.requestAnimationFrame(frame);
  }

  function start() {
    if (running || motionQuery.matches) return;
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

  function handleMotionPreference() {
    if (motionQuery.matches) {
      stop();
    } else {
      resize();
      readAccent();
      start();
    }
  }

  function handleThemeChange() {
    readAccent();
  }

  function bindEvents() {
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", function (event) {
      var rect = canvas.getBoundingClientRect();
      var x = event.clientX - rect.left;
      var y = event.clientY - rect.top;

      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        pointer.active = false;
        return;
      }

      pointer.x = x;
      pointer.y = y;
      pointer.active = true;
    }, { passive: true });

    window.addEventListener(
      "scroll",
      function () {
        pointer.active = false;
      },
      { passive: true }
    );

    window.addEventListener("pointerleave", function () {
      pointer.active = false;
    });

    window.addEventListener("blur", function () {
      pointer.active = false;
    });

    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(function () {
        resize();
      });
      resizeObserver.observe(canvas.parentElement);
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });

    if (typeof motionQuery.addEventListener === "function") {
      motionQuery.addEventListener("change", handleMotionPreference);
    } else if (typeof motionQuery.addListener === "function") {
      motionQuery.addListener(handleMotionPreference);
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
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["class"]
      });
    }
  }

  resize();
  readAccent();
  bindEvents();

  if (!motionQuery.matches) {
    start();
  }
})();
