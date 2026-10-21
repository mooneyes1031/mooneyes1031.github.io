(function () {
  "use strict";

  function init() {
    var box = document.querySelector(".search-box");
    if (!box) return;

    var input = document.getElementById("search-input");
    var status = document.getElementById("search-status");
    var list = document.getElementById("search-results");
    var indexURL = box.getAttribute("data-index");
    var items = [];
    var loaded = false;
    var loadError = false;
    var timer = null;

    if (!input || !status || !list || !indexURL) return;

    function normalize(value) {
      return (value || "").toString().toLowerCase();
    }

    function toList(value) {
      if (Array.isArray(value)) return value;
      if (value === null || value === undefined || value === "") return [];
      return [value];
    }

    function setStatus(text) {
      status.textContent = text;
    }

    function load() {
      fetch(indexURL, { cache: "no-cache" })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.json();
        })
        .then(function (data) {
          items = Array.isArray(data) ? data : [];
          loaded = true;
          setStatus(items.length
            ? "共 " + items.length + " 篇文章，输入关键词开始搜索。"
            : "还没有文章。");
          run();
        })
        .catch(function () {
          loadError = true;
          setStatus("搜索索引加载失败，请刷新重试。");
        });
    }

    function score(item, query) {
      var title = normalize(item.title);
      var tags = normalize(toList(item.tags).join(" "));
      var categories = normalize(toList(item.categories).join(" "));
      var summary = normalize(item.summary);
      var content = normalize(item.content);
      var tokens = query.split(/\s+/).filter(Boolean);
      var total = 0;

      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        var hit = false;

        if (title.indexOf(token) !== -1) {
          total += 100;
          hit = true;
        }
        if (tags.indexOf(token) !== -1) {
          total += 30;
          hit = true;
        }
        if (categories.indexOf(token) !== -1) {
          total += 20;
          hit = true;
        }
        if (summary.indexOf(token) !== -1) {
          total += 15;
          hit = true;
        }
        if (content.indexOf(token) !== -1) {
          total += 5;
          hit = true;
        }

        if (!hit) return -1;
      }

      return total;
    }

    function makeResult(item) {
      var li = document.createElement("li");
      var link = document.createElement("a");
      link.href = item.permalink;
      link.className = "search-result-title";
      link.textContent = item.title || "(无标题)";
      li.appendChild(link);

      var bits = [];
      if (item.date) bits.push(item.date);
      var tags = toList(item.tags);
      if (tags.length) bits.push(tags.join(" / "));

      if (bits.length) {
        var meta = document.createElement("p");
        meta.className = "search-result-meta";
        meta.textContent = bits.join(" · ");
        li.appendChild(meta);
      }

      var summary = (item.summary || "").trim();
      if (summary) {
        var desc = document.createElement("p");
        desc.className = "search-result-summary";
        desc.textContent = summary;
        li.appendChild(desc);
      }

      return li;
    }

    function run() {
      if (!loaded || loadError) return;

      var raw = input.value.trim();
      if (!raw) {
        list.innerHTML = "";
        setStatus(items.length
          ? "共 " + items.length + " 篇文章，输入关键词开始搜索。"
          : "还没有文章。");
        return;
      }

      var query = normalize(raw);
      var results = [];

      for (var i = 0; i < items.length; i++) {
        var s = score(items[i], query);
        if (s >= 0) results.push({ item: items[i], score: s });
      }

      results.sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return (b.item.date || "").localeCompare(a.item.date || "");
      });

      list.innerHTML = "";

      if (!results.length) {
        setStatus("没有找到「" + raw + "」相关的文章。");
        return;
      }

      setStatus("找到 " + results.length + " 篇文章：");
      var frag = document.createDocumentFragment();
      results.forEach(function (result) {
        frag.appendChild(makeResult(result.item));
      });
      list.appendChild(frag);
    }

    function updateURL() {
      var query = input.value.trim();
      var url = new URL(window.location.href);
      if (query) {
        url.searchParams.set("q", query);
      } else {
        url.searchParams.delete("q");
      }
      try {
        history.replaceState(null, "", url);
      } catch (error) {
        // 某些本地文件环境不允许改地址栏，忽略即可
      }
    }

    function onInput() {
      updateURL();
      clearTimeout(timer);
      timer = setTimeout(run, 120);
    }

    input.addEventListener("input", onInput);

    document.addEventListener("keydown", function (event) {
      if (event.key === "/" && document.activeElement !== input) {
        event.preventDefault();
        input.focus();
      }
      if (event.key === "Escape" && document.activeElement === input) {
        input.value = "";
        onInput();
        input.blur();
      }
    });

    var initial = new URLSearchParams(window.location.search).get("q") || "";
    if (initial) input.value = initial;

    window.addEventListener("popstate", function () {
      input.value = new URLSearchParams(window.location.search).get("q") || "";
      run();
    });

    load();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
