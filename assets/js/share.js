(function () {
  "use strict";

  function fallbackCopy(text) {
    return new Promise(function (resolve, reject) {
      var area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.top = "-1000px";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();

      try {
        if (document.execCommand("copy")) {
          resolve();
        } else {
          reject(new Error("copy failed"));
        }
      } catch (error) {
        reject(error);
      } finally {
        document.body.removeChild(area);
      }
    });
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () {
        return fallbackCopy(text);
      });
    }
    return fallbackCopy(text);
  }

  function init() {
    var buttons = document.querySelectorAll(".share-copy");
    if (!buttons.length) return;

    Array.prototype.forEach.call(buttons, function (button) {
      var label = button.querySelector(".share-copy-text");
      var original = label ? label.textContent : "";
      var timer = null;

      button.addEventListener("click", function () {
        var url = button.getAttribute("data-url") || window.location.href;
        copyText(url).then(function () {
          button.classList.add("is-copied");
          if (label) label.textContent = "已复制";
          clearTimeout(timer);
          timer = setTimeout(function () {
            button.classList.remove("is-copied");
            if (label) label.textContent = original;
          }, 1800);
        }).catch(function () {
          if (label) label.textContent = "复制失败";
          clearTimeout(timer);
          timer = setTimeout(function () {
            if (label) label.textContent = original;
          }, 1800);
        });
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
