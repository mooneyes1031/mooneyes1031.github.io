(function () {
  "use strict";

  function initToc() {
    var toc = document.querySelector(".entry__toc");
    if (!toc) return;

    var links = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'));
    if (!links.length) return;

    var headings = [];
    links.forEach(function (link) {
      var id = decodeURIComponent(link.hash.slice(1));
      var heading = id ? document.getElementById(id) : null;
      if (heading) headings.push(heading);
    });
    if (!headings.length) return;

    function update() {
      var offset = window.innerHeight * 0.18 + 80;
      var current = headings[0];

      headings.forEach(function (heading) {
        if (heading.getBoundingClientRect().top <= offset) {
          current = heading;
        }
      });

      links.forEach(function (link) {
        var id = decodeURIComponent(link.hash.slice(1));
        var active = id === current.id;
        link.classList.toggle("is-active", active);
        if (active) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("load", update);
    update();
  }

  function initFootnotes() {
    var refs = Array.prototype.slice.call(
      document.querySelectorAll('a.footnote-ref[href^="#fn:"]')
    );
    if (!refs.length) return;

    var popover = document.createElement("div");
    popover.className = "footnote-popover";
    popover.id = "footnote-popover";
    popover.setAttribute("role", "tooltip");
    popover.hidden = true;
    document.body.appendChild(popover);

    var currentRef = null;

    function hide() {
      popover.hidden = true;
      if (currentRef) {
        currentRef.removeAttribute("aria-describedby");
        currentRef = null;
      }
    }

    function show(ref) {
      var id = decodeURIComponent(ref.hash.slice(1));
      var target = id ? document.getElementById(id) : null;
      if (!target) return;

      var clone = target.cloneNode(true);
      Array.prototype.forEach.call(
        clone.querySelectorAll(".footnote-backref, a[href^=\"#fnref\"]"),
        function (node) {
          node.remove();
        }
      );

      var html = clone.innerHTML.trim();
      if (!html) return;

      popover.innerHTML = html;
      popover.hidden = false;
      currentRef = ref;
      ref.setAttribute("aria-describedby", "footnote-popover");

      var rect = ref.getBoundingClientRect();
      var width = Math.min(360, window.innerWidth - 24);
      popover.style.width = width + "px";

      var left = rect.left + rect.width / 2 - width / 2;
      left = Math.max(12, Math.min(left, window.innerWidth - width - 12));

      var top = rect.bottom + 10;
      var height = popover.offsetHeight;
      if (top + height > window.innerHeight - 12) {
        top = Math.max(12, rect.top - height - 10);
      }

      popover.style.left = left + "px";
      popover.style.top = top + "px";
    }

    refs.forEach(function (ref) {
      ref.addEventListener("mouseenter", function () {
        show(ref);
      });
      ref.addEventListener("mouseleave", hide);
      ref.addEventListener("focus", function () {
        show(ref);
      });
      ref.addEventListener("blur", hide);
      ref.addEventListener("click", hide);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") hide();
    });
  }

  function init() {
    initToc();
    initFootnotes();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
