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
| `content/photos/` | 照片墙（按主题子文件夹） |
| `content/archives/`、`content/search/` | 归档页、搜索页 |
| `data/` | 友链、书架数据 |
| `hugo.toml` | 站点配置（标题、菜单、分享图、评论、统计…） |
| `assets/images/` | 构建时处理的图片（头像、首屏图、文章封面、默认分享图） |
| `assets/scss/custom.scss` | 排版和组件样式 |
| `assets/js/` | 搜索、全局 UI、代码复制、阅读进度、图片灯箱、分享等脚本 |
| `layouts/` | 覆盖主题的模板 |
| `themes/hugo-coder/` | 主题本体（已内置，不要改） |

## 内容与功能

### 文章 / 系列

文章放在 `content/posts/`。在 front matter 写 `series = ["系列名"]` 就会自动生成系列盒子和 `/series/` 入口；`featured = true` 会进入首页精选。

### 碎碎念

短内容放在 `content/notes/`，一条一个 Markdown 文件。列表页 `/notes/` 按年份排成时间线，首页露出最近 3 条（`homeNoteCount` 可调）。碎碎念会进入站内搜索和主 RSS，但不会出现在归档和「相关文章」里。

### Now

`content/now.md` 是近况页。首页右侧会取它的摘要，和碎碎念并排展示；更新时记得同时改 `lastmod`。

### 照片墙

照片按主题放在 `content/photos/` 的子文件夹里（如 `city-night/`、`forest/`），图片直接拖进去即可。`index.md` 里的 `groupBy = "folder"` 会按文件夹自动分组，`[albums]` 映射中文名，`albumOrder` 控制顺序。`/photos/` 默认只显示相册总览（封面 + 名称 + 张数），点封面进入相册，网址写进 `?album=`；点「全部照片」会写 `?view=all`。首页「拾光」从 `featured` 取图，路径写 `文件夹/文件名`，点缩略图会进入对应主题相册。

### 留言板

`/guestbook/` 复用 giscus，评论数据存在 GitHub Discussions。现在已经启用（分类 `General`），文章评论和页脚「留言板」入口都会出现；如果以后把 `categoryID` 清空，页面会显示邮件联系方式，不会报错。

### 搜索

`/search/` 同时搜索文章和碎碎念，支持「全部 / 文章 / 碎碎念」类型筛选、热门标签快捷入口，以及 `?q=`、`?type=` 两个可分享的网址参数。搜索完全在浏览器里完成，不会把关键词发给任何服务器。搜索页和 404 页都标记为 `noindex`，`robots.txt` 也禁止抓取 `/search/`。

### 阅读体验与无障碍

- 导航会自动高亮当前栏目；手机菜单支持 `Esc` 关闭，展开时汉堡图标变成叉
- 页面顶部有「跳到正文」链接，键盘焦点有清晰描边
- 手机向下滚动时，左下音乐按钮和右下主题按钮会自动收起，向上滚动或回到顶部时重新出现
- 文章目录可展开，评论区会提示需要 GitHub 登录，页脚提供「回到顶部」
- 打印文章时会自动隐藏导航、悬浮按钮、评论、分享和相关推荐，并展开外链地址
- 浅色模式下辅助文字的对比度更高；`prefers-reduced-motion` 下新过渡全部关闭
- `theme-color` 会跟随系统深浅色和手动切换，手机状态栏不会和页面脱节

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
