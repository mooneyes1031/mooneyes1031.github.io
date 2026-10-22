(function () {
  "use strict";

  function init() {
    var triggers = document.querySelectorAll("[data-random-post]");
    if (!triggers.length) return;

    function targetFor(item, fallback) {
      var permalink = item && item.permalink ? String(item.permalink) : "";
      if (!permalink) return fallback;

      try {
        var url = new URL(permalink, window.location.origin);
        return url.pathname + url.search + url.hash;
      } catch (error) {
        return fallback;
      }
    }

    function go(trigger) {
      if (trigger.classList.contains("is-loading")) return;

      var indexURL = trigger.getAttribute("data-index") || "/index.json";
      var fallback = trigger.getAttribute("href") || "/posts/";

      trigger.classList.add("is-loading");
      trigger.setAttribute("aria-busy", "true");

      fetch(indexURL, { cache: "no-cache" })
        .then(function (response) {
          if (!response.ok) throw new Error("HTTP " + response.status);
          return response.json();
        })
        .then(function (items) {
          if (!Array.isArray(items) || !items.length) throw new Error("empty");
          var item = items[Math.floor(Math.random() * items.length)];
          window.location.assign(targetFor(item, fallback));
        })
        .catch(function () {
          window.location.assign(fallback);
        });
    }

    Array.prototype.forEach.call(triggers, function (trigger) {
      trigger.addEventListener("click", function (event) {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        go(trigger);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
