(function () {
  "use strict";

  function init() {
    var wall = document.getElementById("photo-wall");
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
    var index = 0;
    var lastFocus = null;
    var touchStartX = 0;

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

    function render(i) {
      if (!activeLinks.length) return;
      index = (i + activeLinks.length) % activeLinks.length;
      var link = activeLinks[index];
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
      render(i);
      box.hidden = false;
      box.classList.add("is-open");
      document.body.classList.add("photo-lb-open");
      closeBtn.focus();
    }

    function close() {
      box.classList.remove("is-open");
      box.hidden = true;
      document.body.classList.remove("photo-lb-open");
      img.removeAttribute("src");
      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus();
      }
    }

    function step(delta) {
      render(index + delta);
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
      if (box.hidden) return;
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
      var valid = id === "all";
      if (!valid) {
        valid = filters.some(function (button) {
          return button.getAttribute("data-photo-filter") === id;
        });
      }
      if (!valid) id = "all";

      if (!box.hidden) close();

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
        var count = visibleLinks().length;
        var label = id === "all" ? "全部" : filterLabel(id);
        status.textContent = "正在显示" + label + "的 " + count + " 张照片";
      }

      if (updateURL && window.history && window.history.replaceState) {
        var url = new URL(window.location.href);
        if (id === "all") {
          url.searchParams.delete("album");
        } else {
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
      var initial = "all";
      try {
        initial = new URLSearchParams(window.location.search).get("album") || "all";
      } catch (error) {
        initial = "all";
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
