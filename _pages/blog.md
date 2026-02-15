---
title: "Blog"
layout: single
permalink: /blog/
author_profile: true
header:
  overlay_color: "#000"
  overlay_filter: "0.5"
---

<div class="apple-content">
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