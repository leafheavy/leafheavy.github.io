---
layout: default
title: "技术博客"
permalink: /blog/
---

<div class="container">
  <h1 class="page-title">Blog</h1>

  <div class="post-list">
    {% for post in site.posts %}
      <a href="{{ post.url | relative_url }}" class="post-card">
        <span class="post-card-date">{{ post.date | date: "%B %d, %Y" }}</span>
        <h2 class="post-card-title">{{ post.title }}</h2>
        <p class="post-card-excerpt">
          {{ post.excerpt | strip_html | truncatewords: 30 }}
        </p>
      </a>
    {% endfor %}
  </div>
</div>