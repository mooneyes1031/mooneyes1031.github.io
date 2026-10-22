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

    icon.textContent = ICONS[index];
    label.textContent = "月相 · " + text;
    el.setAttribute("title", "月龄约 " + phase.age.toFixed(1) + " 天");
    el.setAttribute("aria-label", "今天的月相：" + text);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
