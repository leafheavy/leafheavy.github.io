---
layout: archive
title: "Blog"
permalink: /blog/
# author_profile: true
---

<!-- Hero 区 -->
<section class="apple-blog-hero">
  <div class="apple-hero-inner">
    <div class="apple-hero-left">
      <img src="{{ '/images/Personal_image1.jpg' | relative_url }}"
           alt="Personal image"
           class="apple-hero-avatar"
           loading="lazy">
      <div class="apple-hero-text">
        <h1 class="apple-hero-title">Blog 主页</h1>
        <p class="apple-hero-sub">技术·实验·笔记 — 精选文章按时间倒序排列</p>
      </div>
    </div>
  </div>
</section>

<div class="apple-content">
  <!-- 列表容器：使用 .apple-post-list 以便在大屏显示两列（CSS 已提供） -->
  <div class="apple-post-list">
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
