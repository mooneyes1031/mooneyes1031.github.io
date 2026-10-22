(function () {
  "use strict";

  function initQuote() {
    var box = document.querySelector("[data-random-quote]");
    if (!box) return;

    var items = Array.prototype.slice.call(
      document.querySelectorAll("[data-quote-item]")
    );
    if (!items.length) return;

    var text = box.querySelector("[data-quote-text]");
    var source = box.querySelector("[data-quote-source]");
    var item = items[Math.floor(Math.random() * items.length)];

    if (text) text.textContent = item.getAttribute("data-text") || "";
    if (source) {
      var sourceText = item.getAttribute("data-source") || "";
      if (sourceText) {
        source.textContent = "—— " + sourceText;
        source.hidden = false;
      } else {
        source.hidden = true;
      }
    }
  }

  function initGame() {
    var root = document.querySelector("[data-error-game]");
    if (!root) return;

    var grid = root.querySelector("[data-error-game-grid]");
    var status = root.querySelector("[data-error-game-status]");
    var reset = root.querySelector("[data-error-game-reset]");
    if (!grid) return;

    var totalCells = 36;
    var rounds = 3;
    var found = 0;
    var oddIndex = -1;
    var locked = false;

    function setStatus(message) {
      if (status) status.textContent = message;
    }

    function newRound() {
      locked = false;
      grid.innerHTML = "";
      oddIndex = Math.floor(Math.random() * totalCells);

      for (var i = 0; i < totalCells; i++) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "error-game__cell";
        button.setAttribute("aria-label", "月亮格子 " + (i + 1));
        button.textContent = i === oddIndex ? "🌘" : "🌙";
        if (i === oddIndex) button.classList.add("is-odd");
        button.addEventListener("click", onCellClick);
        grid.appendChild(button);
      }

      setStatus("第 " + (found + 1) + " / " + rounds + " 局");
    }

    function onCellClick(event) {
      if (locked) return;
      var cell = event.currentTarget;

      if (cell.classList.contains("is-odd")) {
        locked = true;
        found += 1;
        cell.classList.add("is-found");
        setStatus(found >= rounds ? "三局都找到了，月亮归你。" : "找到了。");
        if (found < rounds) {
          window.setTimeout(newRound, 700);
        }
      } else {
        cell.classList.add("is-wrong");
        setStatus("不是这个，再看看。");
        window.setTimeout(function () {
          cell.classList.remove("is-wrong");
        }, 350);
      }
    }

    function resetGame() {
      found = 0;
      newRound();
    }

    root.hidden = false;
    if (reset) reset.addEventListener("click", resetGame);
    newRound();
  }

  function init() {
    initQuote();
    initGame();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
