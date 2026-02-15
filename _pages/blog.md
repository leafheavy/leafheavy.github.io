---
layout: archive
title: "Blog"
permalink: /blog/
author_profile: true
---

<!-- Hero 区 -->
<section class="apple-blog-hero">
  <div class="apple-hero-inner">
    <div class="apple-hero-left">
      <div class="apple-hero-text">
        <h1 class="apple-hero-title">Blog 主页</h1>
        <p class="apple-hero-sub">技术·实验·笔记 — 精选文章按时间倒序排列</p>
      </div>
    </div>
  </div>
</section>

<div class="apple-content">
  <div class="apple-search">
    <input id="blog-search-input"
           class="apple-search-input"
           type="search"
           placeholder="搜索文章标题或摘要..."
           aria-label="搜索文章">
  </div>
  <!-- 列表容器：使用 .apple-post-list 以便在大屏显示两列（CSS 已提供） -->
  <div class="apple-post-list" id="blog-post-list">
    {% for post in site.posts %}
      <a href="{{ post.url | relative_url }}" class="apple-post-card js-search-post" data-search="{{ post.title }} {{ post.excerpt | strip_html }}">
        <span class="apple-card-date">{{ post.date | date: "%B %d, %Y" }}</span>
        <h2 class="apple-card-title">{{ post.title }}</h2>
        <p class="apple-card-excerpt">
          {{ post.excerpt | strip_html | truncatewords: 30 }}
        </p>
      </a>
    {% endfor %}
  </div>
</div>

<script>
  (function () {
    var input = document.getElementById('blog-search-input');
    var cards = document.querySelectorAll('.js-search-post');
    if (!input || !cards.length) return;

    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        card.style.display = text.indexOf(keyword) !== -1 ? '' : 'none';
      });
    });
  })();
</script>