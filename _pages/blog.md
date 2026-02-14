---
layout: archive
permalink: /blog/
title: "技术博客"
author_profile: true
header:
  image: "/images/blog-header.jpg"  # 可选：给博客页加个背景图
---

{% include base_path %}

这里记录我的技术学习与生活思考。

{% for post in site.posts %}
  {% include archive-single.html %}
{% endfor %}