(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var body = document.body;

    // 手机浏览器的状态栏颜色：跟随站内主题（含手动切换）。
    var colorMeta = document.getElementById("theme-color-meta");
    var themeToggle = document.getElementById("dark-mode-toggle");
    var darkMedia = window.matchMedia("(prefers-color-scheme: dark)");

    function syncThemeColor() {
      var isDark = body.classList.contains("colorscheme-dark") ||
        (body.classList.contains("colorscheme-auto") && darkMedia.matches);
      if (colorMeta) {
        colorMeta.setAttribute("content", isDark ? "#212121" : "#fafafa");
      }
      if (themeToggle) {
        var label = isDark ? "切换到浅色模式" : "切换到深色模式";
        themeToggle.setAttribute("aria-label", label);
        themeToggle.setAttribute("title", label);
      }
    }

    syncThemeColor();
    // 主题脚本只切换 body 的 class，不抛事件；监听 class 变化即可同步状态栏颜色。
    if (window.MutationObserver) {
      new MutationObserver(syncThemeColor).observe(body, {
        attributes: true,
        attributeFilter: ["class"]
      });
    }
    if (darkMedia.addEventListener) {
      darkMedia.addEventListener("change", syncThemeColor);
    } else if (darkMedia.addListener) {
      darkMedia.addListener(syncThemeColor);
    }

    // 移动端菜单：全屏抽屉 + 遮罩，支持 Esc、点击外部关闭、键盘 Tab 循环。
    var menuToggle = document.getElementById("menu-toggle");
    var menuButton = document.querySelector(".menu-button");
    var menuList = document.querySelector(".navigation-list");
    var navigation = document.querySelector(".navigation");

    if (menuToggle && menuButton && menuList) {
      var menuLinks = Array.prototype.slice.call(menuList.querySelectorAll("a[href]"));

      menuList.id = menuList.id || "site-menu";
      menuToggle.setAttribute("aria-controls", menuList.id);

      function menuTop() {
        if (!navigation) return 60;
        var rect = navigation.getBoundingClientRect();
        return Math.max(0, Math.round(rect.bottom));
      }

      function setMenuTop() {
        document.documentElement.style.setProperty("--mobile-menu-top", menuTop() + "px");
      }

      function syncMenuState(restoreFocus) {
        var open = menuToggle.checked;
        menuButton.setAttribute("aria-expanded", open ? "true" : "false");
        menuButton.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
        menuToggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
        menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
        document.documentElement.classList.toggle("menu-open", open);
        body.classList.toggle("menu-open", open);

        if (open) {
          setMenuTop();
          // 等抽屉的 visibility 过渡结束，再把焦点送进去
          window.setTimeout(function () {
            if (menuToggle.checked && menuLinks.length) menuLinks[0].focus();
          }, 260);
        } else if (restoreFocus) {
          menuToggle.focus();
        }
      }

      menuToggle.addEventListener("change", function () {
        syncMenuState(true);
      });

      // 原生 checkbox 只吃空格；补上回车，让按钮语义完整
      menuToggle.addEventListener("keydown", function (event) {
        if (event.key !== "Enter") return;
        event.preventDefault();
        menuToggle.checked = !menuToggle.checked;
        syncMenuState(true);
      });

      syncMenuState(false);

      document.addEventListener("keydown", function (event) {
        if (!menuToggle.checked) return;

        if (event.key === "Escape") {
          event.preventDefault();
          menuToggle.checked = false;
          syncMenuState(true);
          return;
        }

        if (event.key === "Tab" && menuLinks.length) {
          var first = menuLinks[0];
          var last = menuLinks[menuLinks.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      });

      // 点遮罩或正文空白处关闭；导航栏和抽屉内部的点击不算
      document.addEventListener("click", function (event) {
        if (!menuToggle.checked) return;
        if (navigation && navigation.contains(event.target)) return;
        menuToggle.checked = false;
        syncMenuState(true);
      });

      menuLinks.forEach(function (link) {
        link.addEventListener("click", function () {
          menuToggle.checked = false;
          syncMenuState(false);
        });
      });

      window.addEventListener("resize", function () {
        if (menuToggle.checked) setMenuTop();
      });

      var desktopMedia = window.matchMedia("(min-width: 769px)");
      function closeOnDesktop() {
        if (!desktopMedia.matches || !menuToggle.checked) return;
        var active = document.activeElement;
        var title = document.querySelector(".navigation-title");
        menuToggle.checked = false;
        if (menuList.contains(active) && title) title.focus();
        syncMenuState(false);
      }
      if (desktopMedia.addEventListener) {
        desktopMedia.addEventListener("change", closeOnDesktop);
      } else if (desktopMedia.addListener) {
        desktopMedia.addListener(closeOnDesktop);
      }
    }

    // 小屏阅读时，左下角音乐按钮和右下角主题按钮会盖住正文。
    // 向下滚动时收起，向上滚动或回到顶部时重新出现。
    var lastY = window.pageYOffset;
    var ticking = false;
    var musicPanel = document.getElementById("music-panel");
    var progress = document.querySelector("[data-reading-progress]");
    var progressBar = progress ? progress.querySelector(".reading-progress__bar") : null;
    var progressContent = document.querySelector(".post-content");

    function updateReadingProgress() {
      if (!progress || !progressBar || !progressContent) return;

      var rect = progressContent.getBoundingClientRect();
      var top = rect.top + window.pageYOffset;
      var start = top - 80;
      var end = top + progressContent.offsetHeight - window.innerHeight + 140;
      var ratio = end > start ? (window.pageYOffset - start) / (end - start) : 1;

      ratio = Math.max(0, Math.min(1, ratio));
      progressBar.style.width = (ratio * 100).toFixed(2) + "%";
      progress.classList.toggle("is-active", ratio > 0.005);
    }

    function showControls() {
      body.classList.remove("ui-hidden");
    }

    function hideControls() {
      body.classList.add("ui-hidden");
    }

    function updateControls() {
      ticking = false;
      var y = window.pageYOffset;
      var delta = y - lastY;

      updateReadingProgress();

      if (y <= 80 || (menuToggle && menuToggle.checked) || (musicPanel && !musicPanel.hidden)) {
        showControls();
      } else if (delta > 6 && y > 120) {
        hideControls();
      } else if (delta < -6) {
        showControls();
      }

      lastY = y;
    }

    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(updateControls);
      } else {
        updateControls();
      }
    }, { passive: true });

    var wideMedia = window.matchMedia("(min-width: 901px)");
    function showOnDesktop() {
      if (wideMedia.matches) showControls();
    }
    if (wideMedia.addEventListener) {
      wideMedia.addEventListener("change", showOnDesktop);
    } else if (wideMedia.addListener) {
      wideMedia.addListener(showOnDesktop);
    }

    // 页脚「回到顶部」：不把 # 写进地址栏，尊重系统的减少动态效果设置。
    Array.prototype.forEach.call(document.querySelectorAll(".back-to-top"), function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
        var title = document.querySelector(".navigation-title");
        if (title) title.focus({ preventScroll: true });
      });
    });

    updateReadingProgress();
    window.addEventListener("resize", updateReadingProgress, { passive: true });

    // Konami 彩蛋：↑↑↓↓←→←→BA
    var konami = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
    var konamiPos = 0;

    document.addEventListener("keydown", function (event) {
      var target = event.target;
      var tag = target && target.tagName ? target.tagName.toLowerCase() : "";

      if (tag === "input" || tag === "textarea" || tag === "select" || (target && target.isContentEditable)) {
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      var key = (event.key || "").toLowerCase();

      if (key === konami[konamiPos]) {
        konamiPos += 1;

        if (konamiPos === konami.length) {
          konamiPos = 0;
          document.dispatchEvent(new CustomEvent("konami"));
          body.classList.add("konami-active");
          window.setTimeout(function () {
            body.classList.remove("konami-active");
          }, 8000);
        }
      } else {
        konamiPos = key === konami[0] ? 1 : 0;
      }
    });
  });
})();
