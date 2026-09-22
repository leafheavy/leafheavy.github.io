(function () {
  'use strict';

  var STORAGE_KEY = 'leafheavy.weeklyPlan.v1';
  var SITE_TIME_ZONE = 'Asia/Shanghai';
  var START_DATE = createDate(2026, 8, 20);
  var WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var storageEnabled = true;
  var memoryState = null;

  function createDate(year, month, day) {
    var date = new Date(year, month, day, 12, 0, 0, 0);
    return date;
  }

  function cloneDate(date) {
    return createDate(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function addDays(date, amount) {
    var result = cloneDate(date);
    result.setDate(result.getDate() + amount);
    return result;
  }

  function startOfWeek(date) {
    var result = cloneDate(date);
    result.setDate(result.getDate() - result.getDay());
    return result;
  }

  function todayInSiteTimeZone() {
    try {
      var parts = new Intl.DateTimeFormat('en-US', {
        timeZone: SITE_TIME_ZONE,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      }).formatToParts(new Date());
      var values = {};
      parts.forEach(function (part) {
        if (part.type !== 'literal') values[part.type] = Number(part.value);
      });
      return createDate(values.year, values.month - 1, values.day);
    } catch (error) {
      return new Date();
    }
  }

  function getCurrentWeekStart() {
    var current = startOfWeek(todayInSiteTimeZone());
    return current < START_DATE ? cloneDate(START_DATE) : current;
  }

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function dateKey(date) {
    return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-');
  }

  function dateFromKey(key) {
    var parts = String(key || '').split('-').map(Number);
    if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return cloneDate(START_DATE);
    return createDate(parts[0], parts[1] - 1, parts[2]);
  }

  function fullDate(date) {
    return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('.');
  }

  function fullRange(start) {
    return fullDate(start) + '–' + fullDate(addDays(start, 6));
  }

  function compactRange(start) {
    var end = addDays(start, 6);
    return fullDate(start) + '–' + pad(end.getMonth() + 1) + '.' + pad(end.getDate());
  }

  function friendlyRange(start) {
    var end = addDays(start, 6);
    var startLabel = MONTHS[start.getMonth()] + ' ' + pad(start.getDate());
    var endLabel = end.getMonth() === start.getMonth()
      ? pad(end.getDate())
      : MONTHS[end.getMonth()] + ' ' + pad(end.getDate());

    if (end.getFullYear() !== start.getFullYear()) {
      startLabel += ', ' + start.getFullYear();
    }
    return startLabel + '–' + endLabel + ', ' + end.getFullYear();
  }

  function weekNumber(start) {
    var startUtc = Date.UTC(START_DATE.getFullYear(), START_DATE.getMonth(), START_DATE.getDate());
    var selectedUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    return Math.round((selectedUtc - startUtc) / WEEK_MS) + 1;
  }

  function makeId() {
    return 'plan-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
  }

  function emptyState() {
    return { version: 1, weeks: {} };
  }

  function normalizePlans(plans) {
    if (!Array.isArray(plans)) return [];

    return plans.reduce(function (result, item) {
      if (!item || typeof item.text !== 'string') return result;
      var text = item.text.trim().slice(0, 180);
      if (!text) return result;

      result.push({
        id: typeof item.id === 'string' && item.id ? item.id : makeId(),
        text: text,
        completed: item.completed === true,
        createdAt: typeof item.createdAt === 'string' ? item.createdAt : ''
      });
      return result;
    }, []);
  }

  function normalizeState(value) {
    var state = emptyState();
    if (!value || typeof value !== 'object' || !value.weeks || typeof value.weeks !== 'object') {
      return state;
    }

    Object.keys(value.weeks).forEach(function (key) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
        state.weeks[key] = normalizePlans(value.weeks[key]);
      }
    });
    return state;
  }

  function readState() {
    var raw = memoryState;

    if (storageEnabled) {
      try {
        raw = window.localStorage.getItem(STORAGE_KEY);
      } catch (error) {
        storageEnabled = false;
      }
    }

    if (!raw) return emptyState();

    try {
      return normalizeState(JSON.parse(raw));
    } catch (error) {
      return emptyState();
    }
  }

  function writeState(state) {
    var serialized = JSON.stringify(normalizeState(state));
    memoryState = serialized;

    if (storageEnabled) {
      try {
        window.localStorage.setItem(STORAGE_KEY, serialized);
      } catch (error) {
        storageEnabled = false;
      }
    }
  }

  function getPlans(state, key) {
    return normalizePlans(state.weeks[key]);
  }

  function calculateProgress(plans) {
    var total = plans.length;
    var completed = plans.filter(function (plan) { return plan.completed; }).length;
    var exact = total ? (completed / total) * 100 : 0;

    return {
      total: total,
      completed: completed,
      exact: exact,
      rounded: Math.round(exact)
    };
  }

  function updateProgressBar(bar, fill, progress) {
    if (!bar || !fill) return;
    fill.style.width = progress.exact.toFixed(4) + '%';
    bar.setAttribute('aria-valuenow', String(progress.rounded));
    bar.setAttribute(
      'aria-valuetext',
      progress.total
        ? progress.completed + ' of ' + progress.total + ' plans completed'
        : 'No plans added'
    );
  }

  function renderSidebarProgress() {
    var currentStart = getCurrentWeekStart();
    var currentKey = dateKey(currentStart);
    var plans = getPlans(readState(), currentKey);
    var progress = calculateProgress(plans);

    Array.prototype.forEach.call(document.querySelectorAll('[data-weekly-progress-card]'), function (card) {
      var bar = card.querySelector('[data-weekly-progress]');
      var fill = card.querySelector('[data-weekly-progress-fill]');
      var value = card.querySelector('[data-weekly-progress-value]');
      var count = card.querySelector('[data-weekly-progress-count]');
      var range = card.querySelector('[data-weekly-progress-range]');

      updateProgressBar(bar, fill, progress);
      if (value) value.textContent = progress.rounded + '%';
      if (range) range.textContent = compactRange(currentStart);
      if (count) {
        if (!progress.total) {
          count.textContent = 'Add this week\'s plans';
        } else if (progress.completed === progress.total) {
          count.textContent = 'All ' + progress.total + ' completed';
        } else {
          count.textContent = progress.completed + ' of ' + progress.total + ' completed';
        }
      }
      card.classList.toggle('is-complete', progress.total > 0 && progress.completed === progress.total);
    });
  }

  function createPlanItem(plan, editable, selectedKey, rerender) {
    var item = document.createElement('li');
    var checkbox = document.createElement('input');
    var text = document.createElement('span');

    item.className = 'weekly-plan-item' + (plan.completed ? ' is-complete' : '');
    checkbox.className = 'weekly-plan-item__check';
    checkbox.type = 'checkbox';
    checkbox.checked = plan.completed;
    checkbox.disabled = !editable;
    checkbox.setAttribute(
      'aria-label',
      (plan.completed ? 'Mark incomplete: ' : 'Mark complete: ') + plan.text
    );

    checkbox.addEventListener('change', function () {
      var state = readState();
      var plans = getPlans(state, selectedKey);
      plans.forEach(function (candidate) {
        if (candidate.id === plan.id) candidate.completed = checkbox.checked;
      });
      state.weeks[selectedKey] = plans;
      writeState(state);
      notifyChange();
      rerender();
    });

    text.className = 'weekly-plan-item__text';
    text.textContent = plan.text;

    item.appendChild(checkbox);
    item.appendChild(text);

    if (editable) {
      var remove = document.createElement('button');
      remove.className = 'weekly-plan-item__remove';
      remove.type = 'button';
      remove.title = 'Remove plan';
      remove.setAttribute('aria-label', 'Remove plan: ' + plan.text);
      remove.innerHTML = '<i class="fas fa-trash-alt" aria-hidden="true"></i>';
      remove.addEventListener('click', function () {
        var state = readState();
        state.weeks[selectedKey] = getPlans(state, selectedKey).filter(function (candidate) {
          return candidate.id !== plan.id;
        });
        writeState(state);
        notifyChange();
        rerender();
      });
      item.appendChild(remove);
    } else {
      var spacer = document.createElement('span');
      spacer.setAttribute('aria-hidden', 'true');
      item.appendChild(spacer);
    }

    return item;
  }

  function initializePlanPage() {
    var root = document.querySelector('[data-weekly-plan-app]');
    if (!root) return null;

    var selectedStart = getCurrentWeekStart();
    var elements = {
      range: root.querySelector('[data-weekly-plan-range]'),
      percent: root.querySelector('[data-weekly-plan-percent]'),
      summary: root.querySelector('[data-weekly-plan-summary]'),
      progress: root.querySelector('[data-weekly-plan-progress]'),
      progressFill: root.querySelector('[data-weekly-plan-progress-fill]'),
      previous: root.querySelector('[data-weekly-plan-previous]'),
      next: root.querySelector('[data-weekly-plan-next]'),
      weekNumber: root.querySelector('[data-weekly-plan-week-number]'),
      switcherRange: root.querySelector('[data-weekly-plan-switcher-range]'),
      currentLabel: root.querySelector('[data-weekly-plan-current-label]'),
      boardKicker: root.querySelector('[data-weekly-plan-board-kicker]'),
      boardStatus: root.querySelector('[data-weekly-plan-board-status]'),
      form: root.querySelector('[data-weekly-plan-form]'),
      input: root.querySelector('[data-weekly-plan-input]'),
      notice: root.querySelector('[data-weekly-plan-notice]'),
      empty: root.querySelector('[data-weekly-plan-empty]'),
      list: root.querySelector('[data-weekly-plan-list]')
    };

    function render() {
      var currentStart = getCurrentWeekStart();
      if (selectedStart < START_DATE) selectedStart = cloneDate(START_DATE);
      if (selectedStart > currentStart) selectedStart = cloneDate(currentStart);

      var selectedKey = dateKey(selectedStart);
      var isCurrent = selectedKey === dateKey(currentStart);
      var plans = getPlans(readState(), selectedKey);
      var progress = calculateProgress(plans);
      var isComplete = progress.total > 0 && progress.completed === progress.total;

      elements.range.textContent = fullRange(selectedStart);
      elements.percent.textContent = progress.rounded + '%';
      elements.summary.textContent = !progress.total
        ? (isCurrent ? 'Ready for your plans' : 'No plans recorded')
        : (isComplete
          ? 'All ' + progress.total + ' completed'
          : progress.completed + ' of ' + progress.total + ' completed');
      updateProgressBar(elements.progress, elements.progressFill, progress);
      root.classList.toggle('is-complete', isComplete);

      elements.weekNumber.textContent = 'Week ' + weekNumber(selectedStart);
      elements.switcherRange.textContent = friendlyRange(selectedStart);
      elements.currentLabel.textContent = isCurrent ? 'This week' : 'Past week';
      elements.boardKicker.textContent = isCurrent ? 'This week' : 'Archived week';
      elements.boardStatus.textContent = progress.total
        ? progress.completed + '/' + progress.total + ' complete'
        : '0 plans';

      elements.previous.disabled = selectedStart <= START_DATE;
      elements.next.disabled = selectedStart >= currentStart;
      elements.form.hidden = !isCurrent;
      elements.notice.hidden = isCurrent;
      if (!isCurrent) {
        elements.notice.textContent = 'Past weeks are kept as a read-only record.';
      }

      elements.empty.hidden = progress.total > 0;
      if (!progress.total) {
        var emptyTitle = elements.empty.querySelector('h3');
        var emptyCopy = elements.empty.querySelector('p');
        emptyTitle.textContent = isCurrent ? 'This week is ready for you.' : 'No plans were recorded.';
        emptyCopy.textContent = isCurrent
          ? 'Add the first plan above. Every completed item contributes an equal share of the progress.'
          : 'This week remains empty in your archive.';
      }

      elements.list.innerHTML = '';
      plans.forEach(function (plan) {
        elements.list.appendChild(createPlanItem(plan, isCurrent, selectedKey, render));
      });
    }

    elements.previous.addEventListener('click', function () {
      if (selectedStart <= START_DATE) return;
      selectedStart = addDays(selectedStart, -7);
      render();
    });

    elements.next.addEventListener('click', function () {
      var currentStart = getCurrentWeekStart();
      if (selectedStart >= currentStart) return;
      selectedStart = addDays(selectedStart, 7);
      render();
    });

    elements.form.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = elements.input.value.trim();
      if (!value) {
        elements.input.focus();
        return;
      }

      var key = dateKey(getCurrentWeekStart());
      var state = readState();
      var plans = getPlans(state, key);
      plans.push({
        id: makeId(),
        text: value.slice(0, 180),
        completed: false,
        createdAt: new Date().toISOString()
      });
      state.weeks[key] = plans;
      writeState(state);
      elements.input.value = '';
      notifyChange();
      render();
      elements.input.focus();
    });

    render();
    return render;
  }

  function notifyChange() {
    var event;
    if (typeof window.CustomEvent === 'function') {
      event = new CustomEvent('weeklyplan:change');
    } else {
      event = document.createEvent('Event');
      event.initEvent('weeklyplan:change', true, true);
    }
    document.dispatchEvent(event);
  }

  function initialize() {
    var renderPlanPage = initializePlanPage();
    renderSidebarProgress();

    document.addEventListener('weeklyplan:change', function () {
      renderSidebarProgress();
    });

    window.addEventListener('storage', function (event) {
      if (event.key !== STORAGE_KEY) return;
      renderSidebarProgress();
      if (renderPlanPage) renderPlanPage();
    });

    window.addEventListener('focus', function () {
      renderSidebarProgress();
      if (renderPlanPage) renderPlanPage();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
