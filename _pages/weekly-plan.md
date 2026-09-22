---
layout: default
title: "Weekly Plan"
permalink: /weekly-plan/
author_profile: true
---

<div class="weekly-plan-app" data-weekly-plan-app>
  <header class="weekly-plan-hero">
    <div class="weekly-plan-hero__copy">
      <p class="weekly-plan-eyebrow">Weekly Plan</p>
      <h1>Small steps, clearly kept.</h1>
      <p class="weekly-plan-hero__range" data-weekly-plan-range>2026.09.20–2026.09.26</p>
    </div>
    <div class="weekly-plan-hero__summary">
      <div class="weekly-plan-hero__score">
        <strong data-weekly-plan-percent>0%</strong>
        <span data-weekly-plan-summary>Ready for your plans</span>
      </div>
      <div class="weekly-progress weekly-progress--large" data-weekly-plan-progress role="progressbar" aria-label="Selected week completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
        <span class="weekly-progress__fill" data-weekly-plan-progress-fill></span>
      </div>
    </div>
  </header>

  <nav class="weekly-plan-switcher" aria-label="Choose a week">
    <button class="weekly-plan-switcher__button" type="button" data-weekly-plan-previous aria-label="Previous week">
      <i class="fas fa-chevron-left" aria-hidden="true"></i>
      <span>Previous</span>
    </button>
    <div class="weekly-plan-switcher__current" aria-live="polite">
      <span data-weekly-plan-week-number>Week 1</span>
      <strong data-weekly-plan-switcher-range>Sep 20–26, 2026</strong>
      <small data-weekly-plan-current-label>This week</small>
    </div>
    <button class="weekly-plan-switcher__button" type="button" data-weekly-plan-next aria-label="Next week">
      <span>Next</span>
      <i class="fas fa-chevron-right" aria-hidden="true"></i>
    </button>
  </nav>

  <section class="weekly-plan-board" aria-labelledby="weekly-plan-board-title">
    <div class="weekly-plan-board__heading">
      <div>
        <p class="weekly-plan-board__kicker" data-weekly-plan-board-kicker>This week</p>
        <h2 id="weekly-plan-board-title">Plans</h2>
      </div>
      <p class="weekly-plan-board__status" data-weekly-plan-board-status>0 plans</p>
    </div>

    <form class="weekly-plan-form" data-weekly-plan-form hidden>
      <label class="screen-reader-text" for="weekly-plan-input">Add a plan for this week</label>
      <input id="weekly-plan-input" name="plan" type="text" maxlength="180" autocomplete="off" placeholder="Add a plan for this week…" data-weekly-plan-input required>
      <button type="submit">Add plan</button>
    </form>

    <div class="weekly-plan-notice" data-weekly-plan-notice hidden></div>

    <div class="weekly-plan-empty" data-weekly-plan-empty>
      <span class="weekly-plan-empty__icon" aria-hidden="true"><i class="fas fa-calendar-check"></i></span>
      <h3>This week is ready for you.</h3>
      <p>Add the first plan above. Every completed item contributes an equal share of the progress.</p>
    </div>

    <ul class="weekly-plan-list" data-weekly-plan-list aria-live="polite"></ul>
  </section>

  <div class="weekly-plan-access">
    <p class="weekly-plan-storage-note">
      <i class="fab fa-github" aria-hidden="true"></i>
      Published from GitHub. Public visitors have read-only access.
    </p>
    <button class="weekly-plan-owner-toggle" type="button" data-weekly-plan-owner-toggle aria-controls="weekly-plan-owner-panel" aria-expanded="false">
      <i class="fas fa-lock" aria-hidden="true"></i>
      Owner mode
    </button>
  </div>

  <section id="weekly-plan-owner-panel" class="weekly-plan-owner" data-weekly-plan-owner hidden aria-labelledby="weekly-plan-owner-title">
    <div class="weekly-plan-owner__heading">
      <div>
        <p class="weekly-plan-board__kicker">Private editor</p>
        <h2 id="weekly-plan-owner-title">Owner mode</h2>
      </div>
      <button class="weekly-plan-owner__close" type="button" data-weekly-plan-owner-close aria-label="Close owner mode">
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>
    </div>

    <div data-weekly-plan-owner-login>
      <p class="weekly-plan-owner__copy">
        Use a fine-grained GitHub token limited to this repository with
        <strong>Contents: Read and write</strong>. The token stays in memory only and is sent directly to GitHub.
      </p>
      <div class="weekly-plan-owner__login-row">
        <label class="screen-reader-text" for="weekly-plan-token">Fine-grained GitHub token</label>
        <input id="weekly-plan-token" type="password" autocomplete="off" spellcheck="false" placeholder="github_pat_…" data-weekly-plan-token>
        <button type="button" data-weekly-plan-connect>Connect</button>
      </div>
      <p class="weekly-plan-owner__links">
        <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener noreferrer">Create a fine-grained token</a>
        <span aria-hidden="true">·</span>
        <a href="https://github.com/{{ site.weekly_plan.github_owner }}/{{ site.weekly_plan.github_repo }}/edit/{{ site.weekly_plan.github_branch }}/{{ site.weekly_plan.github_data_path }}" target="_blank" rel="noopener noreferrer">Edit the data file on GitHub</a>
      </p>
    </div>

    <div class="weekly-plan-owner__actions" data-weekly-plan-owner-actions hidden>
      <p class="weekly-plan-owner__identity">
        <i class="fas fa-user-check" aria-hidden="true"></i>
        Connected as <strong data-weekly-plan-owner-name></strong>
      </p>
      <div class="weekly-plan-owner__buttons">
        <button type="button" class="weekly-plan-owner__import" data-weekly-plan-import hidden>Import browser draft</button>
        <button type="button" class="weekly-plan-owner__disconnect" data-weekly-plan-disconnect>Disconnect</button>
        <button type="button" class="weekly-plan-owner__save" data-weekly-plan-save disabled>
          <i class="fab fa-github" aria-hidden="true"></i>
          Save to GitHub
        </button>
      </div>
    </div>

    <p class="weekly-plan-owner__status" data-weekly-plan-owner-status aria-live="polite"></p>
  </section>
</div>
