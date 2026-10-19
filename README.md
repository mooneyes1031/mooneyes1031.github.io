# 我的博客

基于 [Jekyll](https://jekyllrb.com/) + [Chirpy 主题](https://github.com/cotes2020/jekyll-theme-chirpy) 的个人博客，用 GitHub Actions 构建并部署到 GitHub Pages。

---

## 一、上传到 GitHub（第一次）

### 1. 建仓库

打开 https://github.com/new ：

- **Repository name** 填 `你的用户名.github.io`（**大小写必须和用户名完全一致**）
- 选 **Public**（免费账号的 Pages 只能从公开仓库发布）
- **不要**勾选 "Add a README file"（我们本地已有）
- 点 **Create repository**

### 2. 在本地初始化并推送

先装好 Git 并配置（只做一次）：

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱@example.com"
git config --global init.defaultBranch main
git config --global core.quotepath false
```

然后在**本目录**（`blog/`）里执行：

```bash
git init
git add .
git commit -m "init: 初始化博客"
git branch -M main

# 换成你自己的用户名
git remote add origin git@github.com:你的用户名/你的用户名.github.io.git

git push -u origin main
```

> 推送要求配好 SSH Key，没有的话见教程文档第 2.3 节；也可以用 HTTPS + Personal Access Token。

### 3. 打开 Pages

仓库 → **Settings** → 左侧 **Pages** → **Build and deployment** → **Source** 选 **GitHub Actions**。

⚠️ 这一步是必须的。选错了 `deploy-pages` 会报 "environment not found"。

### 4. 等构建

仓库 → **Actions** 标签，看到 `Build and Deploy` 跑成绿色 ✅，然后访问：

```
https://你的用户名.github.io/
```

---

## 二、必须改的配置

打开 `_config.yml`，把这几项改成你自己的（文件里都标了 `★`）：

| 字段 | 改成 |
| --- | --- |
| `url` | `https://你的用户名.github.io` |
| `github.username` | 你的 GitHub 用户名 |
| `social.name` | 你的名字 |
| `social.email` | 你的邮箱 |
| `social.links` | 你的社交主页链接 |
| `title` / `tagline` / `description` | 你的站点标题和简介 |
| `avatar` | 头像图片路径，如 `/assets/img/avatar.png` |
| `actions.edit_post.url` | 改成你的仓库地址（想用这个功能的话） |

改完 `git commit` + `git push`，等 1~2 分钟。

---

## 三、写文章

在 `_posts/` 下新建文件，文件名格式：`YYYY-MM-DD-英文短标题.md`

```markdown
---
title: 文章标题
date: 2026-03-15 14:30:00 +0800
categories: [技术, 前端]
tags: [JavaScript, 性能]
description: 一句话摘要，用于 SEO 和列表页显示
---

正文用 Markdown 写。
```

示例文章见 `_posts/2026-01-01-hello-world.md`，里面把 Chirpy 支持的各种写法都演示了一遍（提示框、数学公式、Mermaid 流程图、代码高亮、脚注、折叠块等）。

> 文章标题建议用英文，因为标题会出现在 URL 里。用中文也能跑，但 URL 会变成一长串 `%E4%BD%A0%E5%A5%BD` 这样的编码。

### 目录约定

| 目录 | 放什么 |
| --- | --- |
| `_posts/` | 所有文章，文件名必须带日期 |
| `_drafts/` | 草稿，文件名不需要日期，本地用 `--drafts` 预览 |
| `_tabs/` | 顶部导航对应的页面（关于、归档、分类、标签） |
| `_data/` | 联系方式图标、分享按钮等结构化配置 |
| `_plugins/` | 自定义插件（现在是自动推算文章最后修改时间） |
| `assets/img/` | 图片（**需要自己新建这个目录**） |
| `assets/css/` | 自定义样式（见下文） |
| `.github/workflows/` | 自动构建部署的配置 |

---

## 四、本地预览（推荐）

好处：不用等 GitHub 构建，1 秒刷新一次，还能看到报错。

### 1. 装 Ruby

> ✅ **本机已经装好了**：Ruby 3.4.11 在 `C:\Ruby34-x64`（和 GitHub Actions 用的版本一致）。
> ⚠️ 但 Ruby 没被加进系统 PATH，每个新开的终端要先执行一次：
>
> ```powershell
> $env:Path = "C:\Ruby34-x64\bin;" + $env:Path
> ```
>
> 想一劳永逸就把它加到"系统环境变量 → Path"里。

如果以后要在别的机器上装：https://rubyinstaller.org/downloads/ 下载 **Ruby+Devkit 3.4.x (x64)**，安装最后一步输入 `1` 装 MSYS2 工具链。

### 2. 装依赖并启动

> ✅ **本机已经执行过了**。依赖装在 `vendor/bundle`（走的是仓库级配置 `bundle config set --local path vendor/bundle`，不会污染系统 gem 目录，且被 `.gitignore` 挡住不会提交）。

```bash
bundle install

# 启动，默认 http://127.0.0.1:4000
bundle exec jekyll serve --livereload

# 常用参数
bundle exec jekyll serve --livereload --drafts    # 连草稿一起预览
bundle exec jekyll serve --host 0.0.0.0           # 手机同局域网可访问
```

VS Code 用户：按 `Ctrl+Shift+B` 选「本地预览」任务即可（列表里有 Git Bash 和 PowerShell 两个版本）。

### 3. Windows 上跑不了 `tools/test.sh`

`tools/test.sh` 里的 `html-proofer` 依赖 `libcurl.dll` 做外链解析，Windows 上默认没有这个库，一跑就报：

```
Could not open library 'libcurl': Failed with error 126: 找不到指定的模块
```

这是**本地环境限制，不是站点的问题**——CI 跑在 Ubuntu 上，自带 libcurl，所以线上检查正常。
本地想验证链接的话，直接用 VS Code 里的「构建生产版本」任务构建，或者忽略这一步。

---

## 四·五、已验证的内容

这份骨架在交付前跑过真实的 Jekyll 构建，结果：

| 检查项 | 结果 |
| --- | --- |
| `bundle install` | 65 个 gem，含 jekyll 4.4.1、jekyll-theme-chirpy 7.6.0 |
| `JEKYLL_ENV=production bundle exec jekyll b` | 成功，0.6 秒，**零警告零报错** |
| 产物 | `_site/` 34 个文件 0.87 MB，含 `index.html`、`feed.xml`、`sitemap.xml`、`robots.txt`、`404.html`、PWA service worker |
| SCSS 编译 | `assets/css/jekyll-theme-chirpy.css` 108 KB，正常 |
| `lang: zh-CN` | 生效（dayjs 加载的是 `zh.js`） |
| `url` 配置 | 生效（canonical / og:url / sitemap 全是 `https://mooneyes1031.github.io/`） |
| 站内链接 | 10 个页面 439 条链接，**全部有效**（无失效链接 / 图片 / 锚点） |
| shell 脚本 | `bash -n` 语法检查通过，仓库里是 LF 换行（Linux runner 能跑） |

> 唯一没法在本机验证的是 `tools/test.sh` 里的 `html-proofer`（原因见上）。但既然 439 条站内链接都有效，CI 那步应该会通过。

---

## 五、还差这几步（按需）

### 评论（giscus）

1. 仓库 → Settings → General → Features → 勾选 **Discussions**
2. 安装 https://github.com/apps/giscus 并授权 `你的用户名/你的用户名.github.io`
3. 打开 https://giscus.app/zh-CN 填仓库名，把生成的 `repo` / `repo_id` / `category` / `category_id` 填进 `_config.yml` 的 `comments.giscus`
4. 把 `comments.provider` 改成 `giscus`

### 统计

`_config.yml` 的 `analytics` 下面按注释填即可，不填就不会加载任何脚本。

### 自定义样式

想改配色或加自定义 CSS，**不要直接新建** `assets/css/jekyll-theme-chirpy.scss`（会把主题样式覆盖掉）。正确做法是先从主题仓库把同名文件复制过来，再在末尾追加：

```bash
# 从本地 gem 里找到主题源文件
bundle show jekyll-theme-chirpy
```

然后把它 `assets/css/jekyll-theme-chirpy.scss` 的内容复制到你项目的同名路径，再往下追加自己的 CSS。

### 自定义域名

见教程文档 `D:\opcd\GitHub-Pages-个人博客搭建教程.md` 第 8 节（含官方 DNS 记录值）。

记得绑了域名之后把 `_config.yml` 里的 `url` 一并改掉。

---

## 六、日常流程

```bash
git pull                          # 先拉最新
# 写文章 / 改配置
bundle exec jekyll serve --livereload   # 本地看效果
git add .
git commit -m "post: 文章标题"
git push                          # 推上去，Actions 自动部署
```

---

## 七、出问题了看哪里

| 现象 | 去哪看 |
| --- | --- |
| 网站没更新 | 仓库 **Actions** 标签，找红色的 ❌，点进去看日志 |
| 403 / Resource not accessible | workflow 里少了 `pages: write` / `id-token: write` |
| environment not found | Settings → Pages → Source 没选 **GitHub Actions** |
| 本地起不来 | 多半是 `bundle install` 没成功，或 Ruby 没装 Devkit |
| 日期差 8 小时 | `_config.yml` 的 `timezone` 没设，或文章 front matter 的日期没写 `+0800` |
| 中文乱码 | 文件要存成 UTF-8；`git config --global core.quotepath false` |

更完整的排查表在 `D:\opcd\GitHub-Pages-个人博客搭建教程.md` 第 13 节。

---

## 八、说明

- 本骨架基于 [chirpy-starter](https://github.com/cotes2020/chirpy-starter) 官方模板，配置项和目录结构保持一致，方便以后对照主题[官方 Wiki](https://github.com/cotes2020/jekyll-theme-chirpy/wiki) 升级。
- **没有**引入 `assets/lib` 子模块（那是 Chirpy 的"自托管静态资源"功能，默认关闭）。所以 `_config.yml` 里的 `assets.self_host.enabled` 保持为空即可。想开启的话见 Wiki。
- 主题版本锁定在 `jekyll-theme-chirpy ~> 7.6`（当前最新 7.6.0）。
