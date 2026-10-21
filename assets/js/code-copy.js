(function () {
  "use strict";

  function fallbackCopy(text) {
    return new Promise(function (resolve, reject) {
      var textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();

      try {
        var ok = document.execCommand("copy");
        document.body.removeChild(textarea);
        ok ? resolve() : reject(new Error("copy failed"));
      } catch (error) {
        document.body.removeChild(textarea);
        reject(error);
      }
    });
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () {
        return fallbackCopy(text);
      });
    }

    return fallbackCopy(text);
  }

  function init() {
    var blocks = document.querySelectorAll(".post-content .highlight");

    Array.prototype.forEach.call(blocks, function (block) {
      if (block.querySelector(".code-copy")) return;

      var code = block.querySelector("code");
      if (!code) return;

      var language = code.getAttribute("data-lang");
      if (language) {
        var badge = document.createElement("span");
        badge.className = "code-lang";
        badge.textContent = language;
        block.appendChild(badge);
      }

      var button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy";
      button.textContent = "复制";
      button.setAttribute("aria-label", "复制代码");

      button.addEventListener("click", function () {
        copyText(code.textContent).then(function () {
          button.textContent = "已复制";
          button.classList.add("is-copied");
          window.setTimeout(function () {
            button.textContent = "复制";
            button.classList.remove("is-copied");
          }, 1600);
        }).catch(function () {
          button.textContent = "复制失败";
          window.setTimeout(function () {
            button.textContent = "复制";
          }, 1600);
        });
      });

      block.appendChild(button);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
