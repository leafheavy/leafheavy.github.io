---
title: "Blog"
layout: archive
permalink: /blog/
author_profile: true
---

<div class="apple-content">
  <div style="margin-top: 30px;">
    {% for post in site.posts %}
      <a href="{{ post.url | relative_url }}" class="apple-post-card">
        <span class="apple-card-date">{{ post.date | date: "%B %d, %Y" }}</span>
        <h2 class="apple-card-title">{{ post.title }}</h2>
        <p class="apple-card-excerpt">
          {{ post.excerpt | strip_html | truncatewords: 25 }}
        </p>
      </a>
    {% endfor %}
  </div>
</div>