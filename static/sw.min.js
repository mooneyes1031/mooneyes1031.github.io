/*
 * 旧 Jekyll/Chirpy 站启用了 PWA，它的 Service Worker 是缓存优先，
 * 会让老访客一直看到迁移前的页面。这个脚本是“自毁开关”：
 * 浏览器下次检查 /sw.min.js 时安装它，激活后清空所有缓存、
 * 注销自己，并刷新所有打开的页面。
 *
 * 部署后保留至少几周，等旧访客都来过一次再删。
 */
self.addEventListener("install", function () {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    (async function () {
      await self.clients.claim();

      const keys = await caches.keys();
      await Promise.all(keys.map(function (key) {
        return caches.delete(key);
      }));

      await self.registration.unregister();

      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach(function (client) {
        client.navigate(client.url);
      });
    })()
  );
});
