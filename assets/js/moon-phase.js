(function () {
  "use strict";

  var SYNODIC_MONTH = 29.530588853;
  var KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);

  var ICONS = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];
  var NAMES = [
    "新月",
    "娥眉月",
    "上弦月",
    "盈凸月",
    "满月",
    "亏凸月",
    "下弦月",
    "残月"
  ];

  function getPhase(date) {
    var days = (date.getTime() - KNOWN_NEW_MOON) / 86400000;
    var phase = ((days % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
    return {
      ratio: phase / SYNODIC_MONTH,
      age: phase
    };
  }

  function init() {
    var el = document.querySelector("[data-moon-phase]");
    if (!el) return;

    var icon = el.querySelector(".moon-phase__icon");
    var label = el.querySelector(".moon-phase__label");
    if (!icon || !label) return;

    var phase = getPhase(new Date());
    var index = Math.round(phase.ratio * 8) % 8;
    var text = NAMES[index];
    var clicks = 0;
    var clickTimer = 0;
    var spinning = false;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    icon.textContent = ICONS[index];
    label.textContent = "月相 · " + text;
    el.setAttribute("title", "月龄约 " + phase.age.toFixed(1) + " 天 · 连点试试");
    el.setAttribute("aria-label", "今天的月相：" + text);
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");

    function bounce() {
      el.classList.remove("is-clicked");
      void el.offsetWidth;
      el.classList.add("is-clicked");
      window.setTimeout(function () {
        el.classList.remove("is-clicked");
      }, 420);
    }

    function spin() {
      if (spinning || reduceMotion.matches) return;
      spinning = true;
      el.classList.add("is-spinning");

      var step = 0;
      var timer = window.setInterval(function () {
        icon.textContent = ICONS[step % 8];
        step += 1;

        if (step > 24) {
          window.clearInterval(timer);
          icon.textContent = ICONS[index];
          el.classList.remove("is-spinning");
          spinning = false;
        }
      }, 80);
    }

    el.addEventListener("click", function () {
      clicks += 1;
      bounce();
      window.clearTimeout(clickTimer);
      clickTimer = window.setTimeout(function () {
        clicks = 0;
      }, 2600);

      if (clicks >= 5) {
        clicks = 0;
        spin();
      }
    });

    el.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        el.click();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
