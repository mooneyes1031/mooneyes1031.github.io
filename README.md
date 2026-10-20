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
| `hugo.toml` | 站点配置（标题、头像、菜单…） |
| `assets/scss/custom.scss` | 排版微调（行宽、行高、字体） |
| `layouts/` | 覆盖主题的模板 |
| `themes/hugo-coder/` | 主题本体（已内置，不要改） |

## 发布

推送 `main` 分支后，GitHub Actions 会自动构建并部署，流水线见 `.github/workflows/pages-deploy.yml`（Hugo Extended 0.168.0）。

> 详细的日常维护说明在仓库外的 `博客维护手册.md`。
