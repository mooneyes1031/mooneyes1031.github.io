# 無限月読の世界

月の眼的个人博客，使用 [Hugo](https://gohugo.io/) + [hugo-coder](https://github.com/luizdepra/hugo-coder) 构建，部署在 GitHub Pages。

- 线上地址：<https://mooneyes1031.github.io/>
- 本地预览：`hugo server --bind 127.0.0.1 --port 1313`
- 新文章：`hugo new content posts/文章名.md`

## 目录

| 路径 | 用途 |
|---|---|
| `content/posts/` | 文章（Markdown） |
| `content/about.md` | 「关于」页面 |
| `content/photos/` | 照片墙 |
| `content/now.md` | Now 页 |
| `content/archives/` | 归档页 |
| `content/search/` | 搜索页 |
| `data/` | 友链、书架数据 |
| `hugo.toml` | 站点配置（标题、头像、菜单…） |
| `assets/scss/custom.scss` | 排版微调（行宽、行高、字体、季节色） |
| `assets/js/` | 搜索、代码复制、阅读进度、图片灯箱、分享等脚本 |
| `layouts/` | 覆盖主题的模板 |
| `themes/hugo-coder/` | 主题本体（已内置，不要改） |

站点已包含：站内搜索、按年归档、文章目录高亮、代码复制、阅读进度与阅读月亮、上一篇 / 下一篇、相关文章、自定义 404（星野 / 随机句 / 小游戏）、随机一篇、4:3 照片墙（WebP 缩略图 + 灯箱，可按年份 / 地点分组）、正文图片灯箱、页面包大图自动缩放、首页精选、分类 / 系列页、文章列表卡片、年度总结、标签云、写作热力图、季节主题色、页脚月相、表格 / 脚注排版、分享按钮、JSON-LD 结构化数据。

友链、书架、照片、系列等入口会在有内容后自动出现；评论区已接好 giscus，填上 `categoryID` 后启用。

## 发布

推送 `main` 分支后，GitHub Actions 会自动构建并部署，流水线见 `.github/workflows/pages-deploy.yml`（Hugo Extended 0.168.0）。

> 详细的日常维护说明在仓库外的 `博客维护手册.md`。
