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

    <form class="weekly-plan-form" data-weekly-plan-form>
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

  <p class="weekly-plan-storage-note">
    <i class="fas fa-lock" aria-hidden="true"></i>
    Plans are saved privately in this browser and stay in their original week.
  </p>
</div>
