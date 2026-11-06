# 無限月読の世界

月の眼的个人博客，使用 [Hugo](https://gohugo.io/) + [hugo-coder](https://github.com/luizdepra/hugo-coder) 构建，部署在 GitHub Pages。

- 线上地址：<https://mooneyes1031.github.io/>
- 本地预览：`hugo server --bind 127.0.0.1 --port 1313`
- 生产构建：`hugo --gc --minify --cleanDestinationDir`
- 新文章：`hugo new content posts/文章名.md`

## 目录

| 路径 | 用途 |
|---|---|
| `content/posts/` | 文章（Markdown） |
| `content/notes/` | 碎碎念（短内容） |
| `content/about.md` | 「关于」页面 |
| `content/now.md` | Now 近况 |
| `content/guestbook.md` | 留言板 |
| `content/photos/` | 照片墙 |
| `content/archives/`、`content/search/` | 归档页、搜索页 |
| `data/` | 友链、书架数据 |
| `hugo.toml` | 站点配置（标题、菜单、分享图、评论、统计…） |
| `assets/images/` | 构建时处理的图片（头像、首屏图、文章封面、默认分享图） |
| `assets/scss/custom.scss` | 排版和组件样式 |
| `assets/js/` | 搜索、代码复制、阅读进度、图片灯箱、分享等脚本 |
| `layouts/` | 覆盖主题的模板 |
| `themes/hugo-coder/` | 主题本体（已内置，不要改） |

## 内容与功能

### 文章 / 系列

文章放在 `content/posts/`。在 front matter 写 `series = ["系列名"]` 就会自动生成系列盒子和 `/series/` 入口；`featured = true` 会进入首页精选。

### 碎碎念

短内容放在 `content/notes/`，一条一个 Markdown 文件。列表页 `/notes/` 按年份排成时间线，首页露出最近 3 条（`homeNoteCount` 可调）。碎碎念会进入站内搜索和主 RSS，但不会出现在归档和「相关文章」里。

### Now

`content/now.md` 是近况页。首页右侧会取它的摘要，和碎碎念并排展示；更新时记得同时改 `lastmod`。

### 留言板

`/guestbook/` 复用 giscus，评论数据存在 GitHub Discussions。`hugo.toml` 的 `[params.giscus]` 里填好 `categoryID` 后，文章评论和页脚「留言板」入口才会出现；没填时页面会显示邮件联系方式，不会报错。

### 全文 RSS

主 RSS（`/index.xml`）由 `layouts/index.xml` 生成，合并 posts 与 notes，并用 `content:encoded` 输出全文。`hugo.toml` 里的 `[minify] disableXML = true` 必须保留，否则压缩器会把 CDATA 转义，部分阅读器就拿不到全文了。

### 分享封面

优先级：front matter 的 `images` > `featuredImage` > `params.ogImage` > 内置的 `assets/images/og-default.jpg`。图片放 `assets/images/` 时会在构建时裁成 1200×630，并自动输出 `og:image`、`twitter:image`、尺寸和 alt；JSON-LD 也使用同一张。

### 访问统计

默认全部关闭，页面不会加载任何统计脚本。想开启时在 `hugo.toml` 里二选一：

```toml
[params.goatCounter]
  code = "你的站点代码"

# 或者
[params.umami]
  siteID = "你的 Website ID"
  scriptURL = "https://你的 Umami 地址/script.js"
```

## 发布

推送 `main` 分支后，GitHub Actions 会自动构建并部署，流水线见 `.github/workflows/pages-deploy.yml`（Hugo Extended 0.168.0）。

> 详细的日常维护说明在仓库外的 `博客维护手册.md`。
