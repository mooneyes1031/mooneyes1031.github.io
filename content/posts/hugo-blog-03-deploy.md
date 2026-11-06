+++
title = "把发布交给 GitHub Actions"
date = 2026-11-05T10:20:00+08:00
lastmod = 2026-11-05T10:20:00+08:00
description = "本地能跑只是开始。用 GitHub Actions 构建、部署到 Pages，再把分享封面和评论这些收尾工作做完。"
tags = ["GitHub Actions", "自动化", "博客"]
categories = ["折腾"]
series = ["这个博客是怎么搭的"]
+++

本地 `hugo server` 能看到页面，不代表线上就能用。静态站点最后一步是构建和部署，这一步最好也交给机器。

## 一条流水线要做什么

GitHub Actions 的流程其实很短：

1. 检出代码
2. 安装指定版本的 Hugo
3. 执行生产构建
4. 把 `public/` 上传为 Pages 产物
5. 部署

仓库里的 workflow 大致是这样：

```yaml
name: Deploy Hugo site to Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive
      - uses: peaceiris/actions-hugo@v3
        with:
          hugo-version: "0.168.0"
          extended: true
      - run: hugo --gc --minify --cleanDestinationDir
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./public
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

几个容易踩的点：

- `baseURL` 必须和实际访问地址一致，结尾要有斜杠
- 主题如果是 git submodule，检出时要加 `submodules: recursive`
- 生产构建用 `--minify`，但本地预览不需要
- Pages 的 Source 要选 GitHub Actions，不是从分支直接发布

## 分享封面

链接发到聊天软件或社交平台时，如果没有 `og:image`，预览就会很单调。Hugo 内置的 OpenGraph 模板不会自动读 `featuredImage`，所以需要自己写一段。

现在的优先级是：

1. 文章 front matter 里的 `images`
2. `featuredImage`
3. 站点默认的 `ogImage`

找到图片后统一裁成 1200 × 630，再输出 `og:image`、`twitter:image` 和尺寸信息。JSON-LD 里的 `image` 也用同一张，避免搜索引擎和社交平台看到两个版本。

## 评论与统计

评论接的是 giscus，数据存在 GitHub Discussions 里。它需要仓库开启 Discussions、安装 giscus App，再填一个 `categoryID`。在拿到这个 ID 之前，评论区不会显示，也不会报错；页脚的「留言板」入口同样会隐藏。

访问统计则默认全部关闭。想开的时候，在 `hugo.toml` 里填 GoatCounter 的站点代码，或者 Umami 的 Website ID 和脚本地址即可。这个顺序很重要：先让站点能跑，再决定要不要统计，而不是反过来。

## 上线之后

部署成功只是「能访问」，后面还有一堆小事情：

- 用手机看一遍导航、照片墙和灯箱
- 切换深色模式，检查对比度
- 打开系统的「减少动态效果」，确认动画会停
- 看 RSS 阅读器里的全文和图片地址
- 检查 404 页面和搜索
- 用 Lighthouse 看首屏图片有没有拖慢加载

这个博客现在仍然很轻：没有广告，没有跟踪脚本，评论要登录 GitHub，统计默认关闭。它不是功能最多的那种站点，但每个部分都知道自己为什么存在。

系列到这里就结束了。接下来要做的，是少改一点代码，多写一点东西。
