(function () {
  "use strict";

  function init() {
    var root = document.getElementById("music-player");
    if (!root) return;

    var toggle = document.getElementById("music-toggle");
    var panel = document.getElementById("music-panel");
    var close = document.getElementById("music-close");
    var frame = document.getElementById("music-frame");

    // 第一次打开时才创建 iframe，避免每个页面都去加载网易云
    function loadFrame() {
      if (!frame || frame.getAttribute("data-loaded") === "1") return;

      var iframe = document.createElement("iframe");
      iframe.src = frame.getAttribute("data-src");
      iframe.width = "100%";
      iframe.height = frame.getAttribute("data-height") || "430";
      iframe.frameBorder = "0";
      iframe.loading = "lazy";
      iframe.allow = "autoplay; encrypted-media";
      iframe.title = "网易云音乐播放器";

      frame.appendChild(iframe);
      frame.setAttribute("data-loaded", "1");
    }

    function open() {
      loadFrame();
      panel.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
    }

    function shut() {
      panel.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", function () {
      if (panel.hidden) {
        open();
      } else {
        shut();
      }
    });

    close.addEventListener("click", shut);

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !panel.hidden) shut();
    });

    // 点面板外面收起（点 iframe 内部的事件不会冒泡到这里，不影响播放）
    document.addEventListener("click", function (event) {
      if (panel.hidden) return;
      if (root.contains(event.target)) return;
      shut();
    });
  }

  // 主题在播放器标记之前就加载了这个脚本，所以要等 DOM 解析完再找元素
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
