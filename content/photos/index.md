+++
title = "照片"
date = 2026-10-20T12:00:00+08:00
description = "一些照片。"

# 照片按主题文件夹归档。groupBy = "folder" 会自动按文件夹分组，
# 文件夹名是相册 ID，页面上的中文名在下面 [albums] 里改。
groupBy = "folder"

# 相册显示顺序（不写就按文件夹名排序）
albumOrder = ["city-night", "sea", "forest", "moon"]

# 首页「拾光」固定展示哪几张，按顺序写“文件夹/文件名”。
# 留空则按文件名取前 4 张（数量在 hugo.toml 的 homePhotoCount）。
featured = [
  "city-night/01-kyoto-dusk.jpg",
  "city-night/02-lantern-alley.jpg",
  "sea/03-sea-sunset.jpg",
  "forest/04-forest-stream.jpg",
]

# 相册显示名：文件夹名 -> 页面上的中文名
[albums]
"city-night" = "城市夜色"
"sea" = "海与天"
"forest" = "森林光影"
"moon" = "月与夜空"

# 相册说明（可选）
[albumDescriptions]
"city-night" = "傍晚的京都街道，和巷子里亮起来的灯。"
"sea" = "日落时分的海面。"
"forest" = "林间的溪流和透下来的光。"
"moon" = "夜里抬头看到的那一轮月。"

# 照片说明：key 是“文件夹/文件名”
[captions]
"city-night/01-kyoto-dusk.jpg" = "京都 · 黄昏"
"city-night/02-lantern-alley.jpg" = "巷子里的灯"
"sea/03-sea-sunset.jpg" = "海边的光"
"forest/04-forest-stream.jpg" = "林间溪谷"
"forest/06-forest-light.jpg" = "林间的光"
"moon/05-moon.jpg" = "月"
+++
