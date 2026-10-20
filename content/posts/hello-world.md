+++
title = "你好，世界"
date = 2026-10-19T10:00:00+08:00
description = "这个博客的第一篇文章，顺便演示一下 Hugo Coder 里能用的写法。"
tags = ["开始", "博客"]
categories = ["随笔"]
math = true
+++

这是第一篇文章。写完之后把 `content/posts/` 下的这个文件删掉，就开始写你自己的内容了。

## 标题与文本

这是正文。支持 **加粗**、*斜体*、~~删除线~~、`行内代码`，以及[链接](https://gohugo.io/)。

### 三级标题

再小的标题就是四级、五级，一般用不到。

## 列表

无序列表：

- 第一项
- 第二项
  - 可以嵌套
- 第三项

有序列表：

1. 第一步
2. 第二步
3. 第三步

## 引用

> 这是一段引用。
> 可以换行继续写。

## 代码块

带上语言名就会有语法高亮：

```python
def fib(n: int) -> int:
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a


if __name__ == "__main__":
    print(fib(10))
```

内联代码长这样：`npm run build`。

## 表格

| 功能 | 怎么用 |
|---|---|
| 语法高亮 | 代码块后面写上语言名 |
| 深色模式 | 自动跟随系统，右上角也能手动切 |
| 数学公式 | 文章开头加 `math = true` |
| 流程图 | 用 `mermaid` 短代码 |

## 图片

把图片放进 `static/images/`，然后这样引用：

```markdown
![图片说明](/images/example.png)
```

## 提示框

用 `notice` 短代码，类型有 `note` / `tip` / `info` / `warning` / `error`：

{{< notice tip "小提示" >}}
这里可以写 **Markdown**，列表、链接、代码都支持。
{{< /notice >}}

{{< notice warning "注意" >}}
这是一个警告框。别把类型名拼错了，拼错会显示一个没有图标的框。
{{< /notice >}}

## 流程图

用 `mermaid` 短代码包起来，里面直接写 Mermaid 语法：

{{< mermaid >}}
graph LR
  A[开始] --> B{判断}
  B -->|是| C[干活]
  B -->|否| D[休息]
{{< /mermaid >}}

## 数学公式

这篇文章开头加了 `math = true`，所以下面的公式能正常显示。

行内公式：$E = mc^2$

独立公式：

$$
\frac{a}{b} = c
$$

## 小结

这些语法够用了。忘了怎么写就直接打开这个文件抄。
