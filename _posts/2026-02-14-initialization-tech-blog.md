---
title: "基于 Jekyll 的博客搭建心得"
date: 2024-02-14
permalink: /posts/2024/02/my-first-tech-blog/
tags:
  - Jekyll
  - 教程
category: tech
# 关键点：开启 LaTeX 数学公式支持
mathjax: true
---

## 前言

这是我的第一篇技术博客。

## 1. 关于数学公式 (LaTeX)

由于我在文件头设置了 `mathjax: true`，我现在可以写复杂的公式了：

行内公式：$ E = mc^2 $

块级公式：
\begin{align}
J(\theta) = \frac{1}{2m} \sum_{i=1}^m (h_\theta(x^{(i)}) - y^{(i)})^2
\end{align}

$$
J(\theta) = \frac{1}{2m} \sum_{i=1}^m (h_\theta(x^{(i)}) - y^{(i)})^2
$$

## 2. 关于插入图片

图片我已经放入了仓库的 `images/` 文件夹中。

![我的头像](/images/Personal_image1.jpg)

或者使用 HTML 语法控制大小：
<img src="/images/Personal_image1.jpg" width="200">

## 3. 代码高亮

```python
import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))