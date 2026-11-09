(function () {
  "use strict";

  function init() {
    var box = document.querySelector(".search-box");
    if (!box) return;

    var input = document.getElementById("search-input");
    var status = document.getElementById("search-status");
    var list = document.getElementById("search-results");
    var suggestions = document.getElementById("search-suggestions");
    var filters = Array.prototype.slice.call(document.querySelectorAll("[data-search-section]"));
    var indexURL = box.getAttribute("data-index");
    var items = [];
    var loaded = false;
    var loadError = false;
    var timer = null;
    var sectionFilter = "";

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

    function inFilter(item) {
      return !sectionFilter || item.section === sectionFilter;
    }

    function filteredItems() {
      return items.filter(inFilter);
    }

    function sectionLabel(section) {
      if (section === "notes") return "碎碎念";
      return "文章";
    }

    function filterLabel() {
      if (sectionFilter === "notes") return "条碎碎念";
      if (sectionFilter === "posts") return "篇文章";
      return "条内容";
    }

    function baseStatus() {
      var count = filteredItems().length;
      if (!count) return "这个分类下还没有内容。";
      return "共 " + count + " " + filterLabel() + "，输入关键词开始搜索。";
    }

    function syncFilterUI() {
      filters.forEach(function (button) {
        var active = button.getAttribute("data-search-section") === sectionFilter;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }

    function setSectionFilter(value) {
      sectionFilter = value === "posts" || value === "notes" ? value : "";
      syncFilterUI();
      updateURL();
      if (loaded) {
        run();
      }
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
          setStatus(items.length ? baseStatus() : "还没有内容。");
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
      if (item.section) bits.push(sectionLabel(item.section));
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
      if (suggestions) suggestions.hidden = !!raw;

      if (!raw) {
        list.innerHTML = "";
        setStatus(items.length ? baseStatus() : "还没有内容。");
        return;
      }

      var query = normalize(raw);
      var results = [];
      var pool = filteredItems();

      for (var i = 0; i < pool.length; i++) {
        var s = score(pool[i], query);
        if (s >= 0) results.push({ item: pool[i], score: s });
      }

      results.sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return (b.item.date || "").localeCompare(a.item.date || "");
      });

      list.innerHTML = "";

      if (!results.length) {
        setStatus(sectionFilter
          ? "在「" + (sectionFilter === "notes" ? "碎碎念" : "文章") + "」里没有找到「" + raw + "」，可以试试切换到「全部」。"
          : "没有找到「" + raw + "」相关的内容。");
        return;
      }

      setStatus("找到 " + results.length + " 条内容：");
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
      if (sectionFilter) {
        url.searchParams.set("type", sectionFilter);
      } else {
        url.searchParams.delete("type");
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

    filters.forEach(function (button) {
      button.addEventListener("click", function () {
        setSectionFilter(button.getAttribute("data-search-section") || "");
      });
    });

    Array.prototype.forEach.call(document.querySelectorAll("[data-search-query]"), function (button) {
      button.addEventListener("click", function () {
        input.value = button.getAttribute("data-search-query") || "";
        updateURL();
        input.focus();
        run();
      });
    });

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

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    var initialType = params.get("type") || "";
    if (initial) input.value = initial;
    if (initialType === "posts" || initialType === "notes") {
      sectionFilter = initialType;
    }
    syncFilterUI();

    window.addEventListener("popstate", function () {
      var next = new URLSearchParams(window.location.search);
      input.value = next.get("q") || "";
      var nextType = next.get("type") || "";
      sectionFilter = nextType === "posts" || nextType === "notes" ? nextType : "";
      syncFilterUI();
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
