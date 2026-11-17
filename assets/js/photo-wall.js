(function () {
  "use strict";

  function init() {
    var wall = document.getElementById("photo-wall");
    var overview = document.getElementById("photo-albums");
    var box = document.getElementById("photo-lightbox");
    if (!wall || !box) return;

    var allLinks = Array.prototype.slice.call(wall.querySelectorAll(".photo-link"));
    if (!allLinks.length) return;

    var activeLinks = allLinks.slice();
    var img = document.getElementById("photo-lb-img");
    var caption = document.getElementById("photo-lb-caption");
    var exif = document.getElementById("photo-lb-exif");
    var album = document.getElementById("photo-lb-album");
    var counter = document.getElementById("photo-lb-counter");
    var status = document.getElementById("photo-filter-status");
    var filters = Array.prototype.slice.call(document.querySelectorAll("[data-photo-filter]"));
    var groups = Array.prototype.slice.call(document.querySelectorAll("[data-photo-album]"));
    var closeBtn = box.querySelector('[data-action="close"]');
    var prevBtn = box.querySelector('[data-action="prev"]');
    var nextBtn = box.querySelector('[data-action="next"]');
    var error = document.getElementById("photo-lb-error");
    var index = 0;
    var lastFocus = null;
    var touchStartX = 0;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var preloaded = Object.create(null);
    var swapTimers = [];
    var swapping = false;

    function closestGroup(link) {
      var node = link.parentNode;
      while (node && node !== wall) {
        if (node.hasAttribute && node.hasAttribute("data-photo-album")) {
          return node;
        }
        node = node.parentNode;
      }
      return null;
    }

    function visibleLinks() {
      return allLinks.filter(function (link) {
        var group = closestGroup(link);
        return !group || !group.hidden;
      });
    }

    // 从分开的 data 属性拼 srcset，避开 Hugo 压缩器把空格转成 %20
    function srcsetFor(link) {
      var full = link.getAttribute("data-full");
      var width = parseInt(link.getAttribute("data-full-width"), 10);
      if (!full || !width) return "";
      var parts = [];
      var small = link.getAttribute("data-full-800");
      if (small) parts.push(small + " 800w");
      var medium = link.getAttribute("data-full-1200");
      if (medium) parts.push(medium + " 1200w");
      parts.push(full + " " + width + "w");
      return parts.join(", ");
    }

    function sizesFor(link) {
      var fit = imageSizeFor(link);
      return fit ? fit.width + "px" : "";
    }

    function imageSizeFor(link) {
      var w = parseInt(link.getAttribute("data-full-width"), 10);
      var h = parseInt(link.getAttribute("data-full-height"), 10);
      if (!w || !h) return null;
      var mobile = window.innerWidth <= 768;
      // 和 CSS 对齐：桌面 92vw × 82vh，手机 92vw × 78vh；减去 0.5rem 白边和灯箱内边距
      var maxW = Math.min(window.innerWidth * 0.92, window.innerWidth - (mobile ? 24 : 80)) - 10;
      var maxH = window.innerHeight * (mobile ? 0.78 : 0.82) - 10;
      if (maxW < 1 || maxH < 1) return null;
      var scale = Math.min(maxW / w, maxH / h);
      return {
        width: Math.max(1, Math.round(w * scale)),
        height: Math.max(1, Math.round(h * scale))
      };
    }

    function markLoading(link) {
      var fit = imageSizeFor(link);
      box.classList.add("is-loading");
      box.classList.remove("is-error");
      box.setAttribute("aria-busy", "true");
      if (error) error.hidden = true;
      if (fit) {
        img.style.width = fit.width + "px";
        img.style.height = fit.height + "px";
      } else {
        img.style.width = "";
        img.style.height = "";
      }
    }

    function markLoaded() {
      box.classList.remove("is-loading");
      box.removeAttribute("aria-busy");
    }

    function preload(link) {
      if (!link) return;
      var url = link.getAttribute("data-full");
      if (!url || preloaded[url]) return;
      var image = new Image();
      image.decoding = "async";
      var sizes = sizesFor(link);
      var srcset = srcsetFor(link);
      if (sizes && srcset) {
        image.setAttribute("sizes", sizes);
        image.setAttribute("srcset", srcset);
      }
      image.src = url;
      preloaded[url] = image;
    }

    function preloadAround() {
      if (!activeLinks.length || !box.classList.contains("is-open")) return;
      if (connection && (connection.saveData || /(^|-)2g$/.test(connection.effectiveType || ""))) return;
      preload(activeLinks[(index + 1) % activeLinks.length]);
      preload(activeLinks[(index - 1 + activeLinks.length) % activeLinks.length]);
    }

    // 等当前大图加载完再预取前后两张，避免三张大图抢同一条带宽
    img.addEventListener("load", function () {
      markLoaded();
      preloadAround();
    });

    img.addEventListener("error", function () {
      markLoaded();
      box.classList.add("is-error");
      if (error) error.hidden = false;
    });

    function clearSwap() {
      swapTimers.forEach(function (id) {
        window.clearTimeout(id);
      });
      swapTimers = [];
      swapping = false;
      box.classList.remove("is-swap-next", "is-swap-prev");
    }

    function render(i) {
      if (!activeLinks.length) return;
      index = (i + activeLinks.length) % activeLinks.length;
      var link = activeLinks[index];
      var sizes = sizesFor(link);
      if (sizes) {
        img.setAttribute("sizes", sizes);
      }
      var srcset = srcsetFor(link);
      if (srcset) {
        img.setAttribute("srcset", srcset);
      } else {
        img.removeAttribute("srcset");
      }
      markLoading(link);
      img.src = link.getAttribute("data-full");
      img.alt = link.getAttribute("data-alt") || "";
      var text = link.getAttribute("data-caption") || "";
      caption.textContent = text;
      caption.hidden = !text;
      var exifText = link.getAttribute("data-exif") || "";
      if (exif) {
        exif.textContent = exifText;
        exif.hidden = !exifText;
      }
      if (album) {
        var albumText = link.getAttribute("data-album") || "";
        album.textContent = albumText;
        album.hidden = !albumText;
      }
      if (counter) {
        counter.textContent = (index + 1) + " / " + activeLinks.length;
      }
    }

    function open(i) {
      lastFocus = document.activeElement;
      clearSwap();
      render(i);
      box.hidden = false;
      // 先让浏览器记录关闭状态，再加 is-open，过渡才会真正播放
      void box.offsetWidth;
      box.classList.add("is-open");
      document.body.classList.add("photo-lb-open");
      closeBtn.focus();
    }

    function close() {
      if (box.hidden || !box.classList.contains("is-open")) return;
      clearSwap();
      box.classList.remove("is-open");
      window.setTimeout(function () {
        if (box.classList.contains("is-open")) return;
        box.hidden = true;
        document.body.classList.remove("photo-lb-open");
        box.classList.remove("is-loading", "is-error");
        box.removeAttribute("aria-busy");
        if (error) error.hidden = true;
        img.removeAttribute("src");
        img.removeAttribute("srcset");
        img.alt = "";
        img.style.width = "";
        img.style.height = "";
        if (lastFocus && typeof lastFocus.focus === "function") {
          lastFocus.focus();
        }
      }, reduceMotion.matches ? 0 : 320);
    }

    function step(delta) {
      if (!activeLinks.length || swapping || !box.classList.contains("is-open")) return;

      if (reduceMotion.matches || activeLinks.length < 2) {
        render(index + delta);
        return;
      }

      swapping = true;
      var direction = delta > 0 ? "next" : "prev";
      box.classList.remove("is-swap-next", "is-swap-prev");
      void box.offsetWidth;
      box.classList.add(direction === "next" ? "is-swap-next" : "is-swap-prev");

      // 画面在 42% 处完全隐去，此时换图；动画结束再清理 class
      swapTimers.push(window.setTimeout(function () {
        render(index + delta);
      }, 150));
      swapTimers.push(window.setTimeout(function () {
        box.classList.remove("is-swap-next", "is-swap-prev");
        swapping = false;
        swapTimers = [];
      }, 380));
    }

    allLinks.forEach(function (link) {
      link.addEventListener("click", function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        activeLinks = visibleLinks();
        var target = activeLinks.indexOf(link);
        if (target < 0) {
          activeLinks = allLinks.slice();
          target = allLinks.indexOf(link);
        }
        open(target);
      });
    });

    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", function () { step(-1); });
    nextBtn.addEventListener("click", function () { step(1); });

    box.addEventListener("click", function (e) {
      if (e.target === box) close();
    });

    document.addEventListener("keydown", function (e) {
      if (box.hidden || !box.classList.contains("is-open")) return;
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
      } else if (e.key === "Tab") {
        var focusables = [closeBtn, prevBtn, nextBtn];
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    box.addEventListener("touchstart", function (e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    window.addEventListener("resize", function () {
      if (box.hidden || !box.classList.contains("is-open")) return;
      var link = activeLinks[index];
      var fit = link ? imageSizeFor(link) : null;
      if (!fit) return;
      img.style.width = fit.width + "px";
      img.style.height = fit.height + "px";
      img.setAttribute("sizes", fit.width + "px");
    });

    box.addEventListener("touchend", function (e) {
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) step(dx > 0 ? -1 : 1);
    }, { passive: true });

    function filterLabel(id) {
      for (var i = 0; i < filters.length; i++) {
        if (filters[i].getAttribute("data-photo-filter") === id) {
          return filters[i].getAttribute("data-photo-label") || id;
        }
      }
      return id;
    }

    function applyFilter(id, updateURL) {
      var valid = id === "all" || id === "overview";
      if (!valid) {
        valid = filters.some(function (button) {
          return button.getAttribute("data-photo-filter") === id;
        });
      }
      if (!valid) id = overview ? "overview" : "all";

      if (!box.hidden) close();

      if (overview) {
        overview.hidden = id !== "overview";
      }
      wall.hidden = id === "overview";

      groups.forEach(function (group) {
        group.hidden = id !== "all" && group.getAttribute("data-photo-album") !== id;
      });

      filters.forEach(function (button) {
        var active = button.getAttribute("data-photo-filter") === id;
        if (active) {
          button.classList.add("is-active");
        } else {
          button.classList.remove("is-active");
        }
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });

      if (status) {
        if (id === "overview") {
          status.textContent = "显示 " + groups.length + " 个相册，选择相册查看照片";
        } else if (id === "all") {
          status.textContent = "正在显示全部 " + visibleLinks().length + " 张照片";
        } else {
          status.textContent = "正在显示" + filterLabel(id) + "的 " + visibleLinks().length + " 张照片";
        }
      }

      if (updateURL && window.history && window.history.replaceState) {
        var url = new URL(window.location.href);
        if (id === "overview") {
          url.searchParams.delete("album");
          url.searchParams.delete("view");
        } else if (id === "all") {
          url.searchParams.delete("album");
          url.searchParams.set("view", "all");
        } else {
          url.searchParams.delete("view");
          url.searchParams.set("album", id);
        }
        window.history.replaceState(null, "", url.pathname + url.search + url.hash);
      }
    }

    filters.forEach(function (button) {
      button.addEventListener("click", function () {
        applyFilter(button.getAttribute("data-photo-filter"), true);
      });
    });

    if (filters.length) {
      var initial = overview ? "overview" : "all";
      try {
        var params = new URLSearchParams(window.location.search);
        var albumParam = params.get("album");
        if (albumParam) {
          initial = albumParam;
        } else if (params.get("view") === "all") {
          initial = "all";
        }
      } catch (error) {
        initial = overview ? "overview" : "all";
      }
      applyFilter(initial, false);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
