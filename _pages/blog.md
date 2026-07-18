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
  <div class="apple-search" role="search">
    <label class="screen-reader-text" for="blog-search-input">搜索文章</label>
    <div class="apple-search-controls">
      <input id="blog-search-input"
             class="apple-search-input"
             type="search"
             placeholder="搜索文章标题或标签…"
             autocomplete="off"
             aria-describedby="blog-search-status">
      <button id="blog-search-clear" class="apple-search-clear" type="button" hidden>清除</button>
    </div>
    <p id="blog-search-status" class="apple-search-status" aria-live="polite">共 {{ site.posts.size }} 篇文章</p>
  </div>

  <div class="apple-post-list" id="blog-post-list">
    {% for post in site.posts %}
      <a href="{{ post.url | relative_url }}" class="apple-post-card js-search-post">
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
  document.addEventListener('DOMContentLoaded', function () {
    var input = document.getElementById('blog-search-input');
    var clearButton = document.getElementById('blog-search-clear');
    var status = document.getElementById('blog-search-status');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.js-search-post'));
    if (!input || !cards.length) return;

    function normalize(value) {
      return String(value || '').toLocaleLowerCase().replace(/\s+/g, ' ').trim();
    }

    function filterPosts() {
      var keyword = normalize(input.value);
      var visibleCount = 0;
      cards.forEach(function (card) {
        var matches = !keyword || normalize(card.textContent).indexOf(keyword) !== -1;
        card.classList.toggle('is-search-hidden', !matches);
        if (matches) {
          card.style.removeProperty('display');
        } else {
          card.style.setProperty('display', 'none', 'important');
        }
        if (matches) visibleCount += 1;
      });
      clearButton.hidden = !keyword;
      status.textContent = keyword ? '找到 ' + visibleCount + ' 篇文章' : '共 ' + cards.length + ' 篇文章';
    }

    input.addEventListener('input', filterPosts);
    clearButton.addEventListener('click', function () {
      input.value = '';
      input.focus();
      filterPosts();
    });
  });
</script>
