---
layout: default
title: "技术博客"
permalink: /blog/
---

# 技术博客

这里记录我的技术学习与生活思考。

<ul>
  {% for post in site.posts %}
    <li>
      <span style="font-size: 0.8em; color: #666;">{{ post.date | date: "%Y-%m-%d" }}</span>
      &raquo; 
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
    </li>
  {% endfor %}
</ul>