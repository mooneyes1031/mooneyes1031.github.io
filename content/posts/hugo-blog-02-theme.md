+++
title = "把 Coder 改成自己的样子"
date = 2026-11-04T21:00:00+08:00
lastmod = 2026-11-12T10:00:00+08:00
description = "主题只是起点。记录首页夜空、照片墙、碎碎念和搜索这些地方是怎么一点点改出来的。"
tags = ["Hugo", "设计", "博客"]
categories = ["折腾"]
series = ["这个博客是怎么搭的"]
featuredImage = "images/post-cover.jpg"
+++

Hugo 装好之后，我用了 [Coder](https://github.com/luizdepra/hugo-coder) 这个主题。它干净、字大、适合读长文，但默认样子太像「一个 Hugo 博客」了。接下来做的事情，基本就是把它变成自己的。

## 不要直接改主题

主题放在 `themes/hugo-coder/`，看起来最方便的地方就是直接改它。但这样下次升级主题时，所有改动都会被覆盖。

正确做法是利用 Hugo 的查找顺序：根目录的 `layouts/` 和 `assets/` 优先级更高。需要改哪个文件，就在同名位置建一个。比如首页布局是：

```text
layouts/_partials/home.html
```

想改导航，就覆盖 `layouts/_partials/header.html`。主题本身不动，升级时也轻松。

## 首页的夜空

首页顶部原来是一块普通背景。我把它换成了一张星空照片，上面压一层深蓝渐变，再撒一些缓慢漂移的星点。图片放在 `assets/images/`，构建时自动生成 960、1440、1920 三种宽度：

```go-html-template
{{ $image := resources.Get "images/hero-night.jpg" }}
{{ $resized := $image.Resize "1440x webp q78" }}
<img src="{{ $resized.RelPermalink }}" width="{{ $resized.Width }}" height="{{ $resized.Height }}">
```

首屏图一开始还用了 `<link rel="preload">`，想让它更早开始下载。但 Hugo 的 HTML 压缩器会把 `imagesrcset` 里的空格转成 `%20`，浏览器反而去请求一个不存在的地址。后来干脆去掉 preload，改用 `<img fetchpriority="high">`，让首屏图自己以高优先级加载。

## 照片墙

照片页最初用的是原图缩略图，六张加起来七百多 KB。后来改成 WebP 多尺寸：缩略图生成 360、540、720 三种宽度，灯箱图最长边 1600，浏览器根据屏幕自己挑。

照片按主题放在 `content/photos/` 的子文件夹里，例如 `city-night/`、`forest/`。Hugo 会把整棵目录当成这个页面的资源，模板里用 `.Resources.ByType "image"` 就能取到，文件夹名还可以直接拿来分组。说明文字写在 front matter 里：

```toml
[captions]
"city-night/01-kyoto-dusk.jpg" = "京都 · 黄昏"
```

照片慢慢多到 126 张之后，默认页改成了相册总览：先看四张封面、名称和张数，点进去才展开一个主题。顶部按钮是「相册 / 全部照片 / 各主题」，选中后会写进地址（如 `?album=city-night`；全部照片是 `?view=all`），可以直接把某个相册的链接发给别人。

照片墙用统一的 4:3 网格，手机上两列，桌面上三列。之前试过拍立得式的旋转和错位，单看很活泼，六张排在一起反而乱。最后还是整齐一点更耐看。

## 碎碎念

有些内容不够写成一篇文章，但也不想丢。于是加了 `content/notes/`，每条都是普通页面，列表页按年份排成时间线，首页露出最近三条。

它和文章共用搜索索引，也一起进 RSS。区别只在展示方式：文章有封面、目录、相关推荐，碎碎念只有日期、正文和标签。轻一点，写起来才没有负担。

## 搜索和 RSS

搜索没有用第三方服务。首页额外输出一份 `index.json`，把标题、链接、日期、标签和正文纯文本都放进去，前端加载后做简单的关键词匹配。数据量小的时候，这比搭一个搜索服务省事得多。

RSS 则是另一条线。默认输出只有摘要，点进阅读器还要跳回网站，体验是断的。所以自定义了 `layouts/index.xml`，用 `content:encoded` 输出全文，并把碎碎念也合并进同一个 feed。

## 留白比堆功能难

改到现在，最花时间的不是加功能，而是决定哪些东西不出现：

- 没有照片时不显示「照片」入口
- 没有系列文章时不显示「系列」
- 友链和书架没有真实数据时，页脚不放链接
- 统计默认关闭，不偷偷加载脚本

空页面比没有页面更劝退。宁可少一个入口，也不想让访客点进去只看到「暂无内容」。

下一篇写发布：GitHub Actions、Pages，以及上线之后还要补的那些细节。
