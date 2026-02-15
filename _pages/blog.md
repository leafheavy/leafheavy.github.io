---
layout: archive   # 这里的 archive 是原主题为了支持侧边栏而设计的布局
title: "Blog"
permalink: /blog/
author_profile: true  # 关键！这一行保证了左侧头像和导航栏的显示
---

<div class="apple-content">
  <!-- 列表容器 -->
  <div style="margin-top: 20px;">
    {% for post in site.posts %}
      <a href="{{ post.url | relative_url }}" class="apple-post-card">
        <span class="apple-card-date">{{ post.date | date: "%B %d, %Y" }}</span>
        <h2 class="apple-card-title">{{ post.title }}</h2>
        <p class="apple-card-excerpt">
          {{ post.excerpt | strip_html | truncatewords: 30 }}
        </p>
      </a>
    {% endfor %}
  </div>
</div>