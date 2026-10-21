(function () {
  "use strict";

  function init() {
    var content = document.querySelector(".post-content");
    if (!content) return;

    var bar = document.createElement("div");
    bar.className = "reading-progress";
    bar.setAttribute("aria-hidden", "true");

    var fill = document.createElement("span");
    bar.appendChild(fill);
    document.body.appendChild(bar);

    var ticking = false;

    function update() {
      ticking = false;
      var total = content.offsetHeight - window.innerHeight;

      if (total <= 0) {
        bar.classList.add("is-hidden");
        fill.style.transform = "scaleX(0)";
        return;
      }

      bar.classList.remove("is-hidden");
      var progress = (-content.getBoundingClientRect().top) / total;
      progress = Math.max(0, Math.min(1, progress));
      fill.style.transform = "scaleX(" + progress + ")";
    }

    function requestUpdate() {
      if (!ticking) {
        ticking = true;
        if (window.requestAnimationFrame) {
          window.requestAnimationFrame(update);
        } else {
          update();
        }
      }
    }

    function onScroll() {
      // 直接更新，避免后台标签页里 requestAnimationFrame 被暂停后进度条不刷新
      update();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("load", requestUpdate);
    update();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
