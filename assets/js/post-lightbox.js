(function () {
  "use strict";

  function init() {
    var box = document.getElementById("image-lightbox");
    if (!box) return;

    var images = Array.prototype.slice
      .call(document.querySelectorAll(".post-figure img"))
      .filter(function (img) {
        // 图片外面如果已经有链接，保留链接原本的行为
        return !img.closest("a");
      });
    if (!images.length) return;

    var img = document.getElementById("image-lb-img");
    var caption = document.getElementById("image-lb-caption");
    var closeBtn = box.querySelector('[data-action="close"]');
    var prevBtn = box.querySelector('[data-action="prev"]');
    var nextBtn = box.querySelector('[data-action="next"]');
    var index = 0;
    var lastFocus = null;
    var touchStartX = 0;

    function captionFor(image) {
      var figure = image.closest(".post-figure");
      var text = "";
      if (figure) {
        var cap = figure.querySelector(".post-caption");
        if (cap) text = cap.textContent.trim();
      }
      return text || image.getAttribute("alt") || "";
    }

    function render(i) {
      index = (i + images.length) % images.length;
      var source = images[index];
      img.src = source.currentSrc || source.src;
      img.alt = source.getAttribute("alt") || "";
      var text = captionFor(source);
      caption.textContent = text;
      caption.hidden = !text;
    }

    function open(i) {
      lastFocus = document.activeElement;
      render(i);
      box.hidden = false;
      box.classList.add("is-open");
      document.body.classList.add("image-lb-open");
      closeBtn.focus();
    }

    function close() {
      box.classList.remove("is-open");
      box.hidden = true;
      document.body.classList.remove("image-lb-open");
      img.removeAttribute("src");
      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus();
      }
    }

    function step(delta) {
      render(index + delta);
    }

    images.forEach(function (image, i) {
      image.classList.add("is-zoomable");
      image.addEventListener("click", function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        open(i);
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
