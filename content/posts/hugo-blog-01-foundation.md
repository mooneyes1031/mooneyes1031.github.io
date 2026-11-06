+++
title = "从 Jekyll 搬到 Hugo：先把地基铺好"
date = 2026-11-03T21:00:00+08:00
lastmod = 2026-11-03T21:00:00+08:00
description = "旧博客停在 Jekyll，这次换成 Hugo。先弄清楚目录、配置和本地预览，再谈装修。"
tags = ["Hugo", "博客", "建站"]
categories = ["折腾"]
series = ["这个博客是怎么搭的"]
featured = true
featuredImage = "images/hero-night.jpg"
+++

旧博客用的是 Jekyll。它不算难用，但每次改点东西都要等 Ruby 环境慢慢转，时间一长就不想打开。后来想通了一件事：博客首先得让自己愿意写，工具链不能成为阻力。

于是换成了 Hugo。

## 为什么是 Hugo

原因很实际：

- 一个二进制文件就能跑，不需要 Ruby、Node 或复杂的依赖
- 几百篇文章也是秒级构建
- 目录结构清楚，内容就是 Markdown
- GitHub Pages 可以直接托管，不用买服务器

它也不是没有代价。Hugo 的模板语法需要一点时间适应，主题文档通常假设你已经知道它在说什么。但一旦跑通，后面写东西就只剩下 Markdown 了。

## 先看目录

现在这个仓库大致是这样：

```text
blog/
├── content/          # 文章、页面、照片
│   ├── posts/        # 正式文章
│   ├── notes/        # 碎碎念
│   └── photos/       # 照片墙
├── layouts/          # 覆盖主题的模板
├── assets/           # 需要构建处理的图片、SCSS、JS
├── static/           # 原样复制的文件
├── data/             # 友链、书架等数据
├── themes/           # 主题
└── hugo.toml         # 站点配置
```

`content/` 是内容，`layouts/` 是外观，`assets/` 里的东西会被 Hugo 处理，`static/` 里的东西则原样搬到站点根目录。刚开始最容易混的是后两个：需要压缩、生成多尺寸的图片放 `assets/`，favicon 这种不需要处理的放 `static/`。

## 配置里先定几件事

`hugo.toml` 不用一次写完。最先要确定的是地址、语言和内容分区：

```toml
baseURL = "https://mooneyes1031.github.io/"
title = "無限月読の世界"
locale = "zh-cn"
defaultContentLanguage = "zh-cn"

[outputs]
  home = ["HTML", "RSS", "JSON"]

[taxonomies]
  category = "categories"
  tag = "tags"
  series = "series"
```

`JSON` 是给站内搜索用的，`RSS` 是订阅，`series` 则让一组文章能自动串成系列。中文站点最好再打开 `hasCJKLanguage = true`，否则阅读时间会按英文单词数来算，结果会很离谱。

## 内容先跑起来

一篇文章就是一个 Markdown 文件：

```markdown
+++
title = "标题"
date = 2026-11-03T21:00:00+08:00
description = "一句话摘要"
tags = ["Hugo", "博客"]
categories = ["折腾"]
+++

正文从这里开始。
```

文件名会成为网址的一部分，所以尽量用英文短句。写完在本地跑：

```bash
hugo server
```

打开 `http://localhost:1313`，改文件会实时刷新。先确认首页、文章页和归档都能正常打开，再去折腾主题。地基没铺好就装修，后面很容易把问题混在一起。

下一篇再写怎么把现成主题改成自己的样子。
