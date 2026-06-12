---
layout: archive
title: "Blog"
permalink: /blog/
author_profile: true
---

<section class="apple-blog-hero">
  <div class="apple-hero-inner">
    <div class="apple-hero-left">
      <div class="apple-hero-text">
        <h1 class="apple-hero-title">Blog</h1>
        <p class="apple-hero-sub">技术、实验与笔记，按时间倒序整理。</p>
      </div>
    </div>
  </div>
</section>

<div class="apple-content">
  <div class="apple-search">
    <input id="blog-search-input"
           class="apple-search-input"
           type="search"
           placeholder="搜索文章标题或标签..."
           aria-label="搜索文章">
  </div>

  <div class="apple-post-list" id="blog-post-list">
    {% for post in site.posts %}
      <a href="{{ post.url | relative_url }}" class="apple-post-card js-search-post" data-search="{{ post.title }} {{ post.tags | join: ' ' }}">
        <span class="apple-card-date">{{ post.date | date: "%B %d, %Y" }}</span>
        <h2 class="apple-card-title">{{ post.title }}</h2>
        {% if post.tags and post.tags.size > 0 %}
          <p class="apple-card-excerpt">#{{ post.tags | join: '  #' }}</p>
        {% endif %}
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
