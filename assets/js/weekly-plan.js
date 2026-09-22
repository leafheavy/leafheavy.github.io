(function () {
  'use strict';

  var LEGACY_STORAGE_KEY = 'leafheavy.weeklyPlan.v1';
  var SOURCE_ELEMENT_ID = 'weekly-plan-source';
  var SITE_TIME_ZONE = 'Asia/Shanghai';
  var START_DATE_KEY = '2026-09-20';
  var START_DATE = createDate(2026, 8, 20);
  var WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  var githubConfig = null;
  var publishedState = emptyState();
  var activeState = emptyState();
  var legacyState = emptyState();
  var editorMode = false;
  var stateDirty = false;
  var legacyImported = false;
  var githubToken = '';
  var githubFileSha = '';

  function createDate(year, month, day) {
    return new Date(year, month, day, 12, 0, 0, 0);
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
    return { version: 1, startDate: START_DATE_KEY, weeks: {} };
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

    Object.keys(value.weeks).sort().forEach(function (key) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(key) && key >= START_DATE_KEY) {
        state.weeks[key] = normalizePlans(value.weeks[key]);
      }
    });
    return state;
  }

  function serializeState(state) {
    return JSON.stringify(normalizeState(state), null, 2) + '\n';
  }

  function readPublishedState() {
    var source = document.getElementById(SOURCE_ELEMENT_ID);
    if (!source) return emptyState();

    try {
      return normalizeState(JSON.parse(source.textContent || '{}'));
    } catch (error) {
      return emptyState();
    }
  }

  function readGithubConfig() {
    var source = document.getElementById(SOURCE_ELEMENT_ID);
    return {
      owner: source ? source.getAttribute('data-github-owner') || '' : '',
      repo: source ? source.getAttribute('data-github-repo') || '' : '',
      branch: source ? source.getAttribute('data-github-branch') || 'main' : 'main',
      path: source ? source.getAttribute('data-github-path') || '_data/weekly_plans.json' : '_data/weekly_plans.json'
    };
  }

  function readLegacyState() {
    try {
      var raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
      return raw ? normalizeState(JSON.parse(raw)) : emptyState();
    } catch (error) {
      return emptyState();
    }
  }

  function clearLegacyState() {
    try {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (error) {
      // A blocked storage API does not affect the GitHub-backed editor.
    }
  }

  function readState() {
    return normalizeState(activeState);
  }

  function writeDraft(state) {
    if (!editorMode) return false;
    activeState = normalizeState(state);
    stateDirty = true;
    return true;
  }

  function getPlans(state, key) {
    return normalizePlans(state.weeks[key]);
  }

  function countPlans(state) {
    return Object.keys(state.weeks || {}).reduce(function (total, key) {
      return total + getPlans(state, key).length;
    }, 0);
  }

  function mergeStates(baseState, importedState) {
    var merged = normalizeState(baseState);
    var incoming = normalizeState(importedState);

    Object.keys(incoming.weeks).forEach(function (key) {
      var existing = getPlans(merged, key);
      incoming.weeks[key].forEach(function (plan) {
        var duplicate = existing.some(function (candidate) {
          return candidate.id === plan.id || candidate.text === plan.text;
        });
        if (!duplicate) existing.push(plan);
      });
      merged.weeks[key] = existing;
    });
    return merged;
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
        : 'No plans published'
    );
  }

  function renderSidebarProgress() {
    var currentStart = getCurrentWeekStart();
    var plans = getPlans(readState(), dateKey(currentStart));
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
          count.textContent = 'No plans published';
        } else if (progress.completed === progress.total) {
          count.textContent = 'All ' + progress.total + ' completed';
        } else {
          count.textContent = progress.completed + ' of ' + progress.total + ' completed';
        }
      }
      card.classList.toggle('is-complete', progress.total > 0 && progress.completed === progress.total);
    });
  }

  function createPlanItem(plan, editable, selectedKey, onDraftChange) {
    var item = document.createElement('li');
    var control = document.createElement('label');
    var checkbox = document.createElement('input');
    var visual = document.createElement('span');
    var text = document.createElement('span');

    item.className = 'weekly-plan-item' + (plan.completed ? ' is-complete' : '');
    control.className = 'weekly-plan-item__control' + (editable ? '' : ' is-readonly');
    checkbox.className = 'weekly-plan-item__native-check';
    checkbox.type = 'checkbox';
    checkbox.checked = plan.completed;
    checkbox.disabled = !editable;
    checkbox.setAttribute(
      'aria-label',
      (plan.completed ? 'Mark incomplete: ' : 'Mark complete: ') + plan.text
    );
    visual.className = 'weekly-plan-item__check';
    visual.setAttribute('aria-hidden', 'true');

    checkbox.addEventListener('change', function () {
      if (!editable || !editorMode) return;
      var state = readState();
      var plans = getPlans(state, selectedKey);
      plans.forEach(function (candidate) {
        if (candidate.id === plan.id) candidate.completed = checkbox.checked;
      });
      state.weeks[selectedKey] = plans;
      writeDraft(state);
      notifyChange();
      onDraftChange();
    });

    control.appendChild(checkbox);
    control.appendChild(visual);
    text.className = 'weekly-plan-item__text';
    text.textContent = plan.text;

    item.appendChild(control);
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
        writeDraft(state);
        notifyChange();
        onDraftChange();
      });
      item.appendChild(remove);
    } else {
      var spacer = document.createElement('span');
      spacer.setAttribute('aria-hidden', 'true');
      item.appendChild(spacer);
    }

    return item;
  }

  function githubContentEndpoint() {
    var encodedPath = githubConfig.path.split('/').map(encodeURIComponent).join('/');
    return '/repos/' + encodeURIComponent(githubConfig.owner) + '/' +
      encodeURIComponent(githubConfig.repo) + '/contents/' + encodedPath;
  }

  function githubRequest(path, token, options) {
    var request = options || {};
    var headers = {
      Accept: 'application/vnd.github+json',
      Authorization: 'Bearer ' + token,
      'X-GitHub-Api-Version': '2022-11-28'
    };
    if (request.body) headers['Content-Type'] = 'application/json';

    return window.fetch('https://api.github.com' + path, {
      method: request.method || 'GET',
      headers: headers,
      body: request.body || undefined
    }).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (data) {
        if (!response.ok) {
          var message = data && data.message ? data.message : 'GitHub request failed';
          throw new Error(message + ' (' + response.status + ')');
        }
        return data;
      });
    });
  }

  function decodeBase64Utf8(value) {
    var binary = window.atob(String(value || '').replace(/\s/g, ''));
    var bytes = new Uint8Array(binary.length);
    for (var index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    if (window.TextDecoder) return new window.TextDecoder('utf-8').decode(bytes);

    var escaped = '';
    bytes.forEach(function (byte) {
      escaped += '%' + byte.toString(16).padStart(2, '0');
    });
    return decodeURIComponent(escaped);
  }

  function encodeBase64Utf8(value) {
    var bytes;
    if (window.TextEncoder) {
      bytes = new window.TextEncoder().encode(value);
    } else {
      var encoded = unescape(encodeURIComponent(value));
      bytes = new Uint8Array(encoded.length);
      for (var legacyIndex = 0; legacyIndex < encoded.length; legacyIndex += 1) {
        bytes[legacyIndex] = encoded.charCodeAt(legacyIndex);
      }
    }

    var binary = '';
    for (var index = 0; index < bytes.length; index += 1) {
      binary += String.fromCharCode(bytes[index]);
    }
    return window.btoa(binary);
  }

  function initializePlanPage() {
    var root = document.querySelector('[data-weekly-plan-app]');
    if (!root) return null;

    var selectedStart = getCurrentWeekStart();
    var saving = false;
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
      list: root.querySelector('[data-weekly-plan-list]'),
      ownerToggle: root.querySelector('[data-weekly-plan-owner-toggle]'),
      ownerPanel: root.querySelector('[data-weekly-plan-owner]'),
      ownerClose: root.querySelector('[data-weekly-plan-owner-close]'),
      ownerLogin: root.querySelector('[data-weekly-plan-owner-login]'),
      token: root.querySelector('[data-weekly-plan-token]'),
      connect: root.querySelector('[data-weekly-plan-connect]'),
      ownerActions: root.querySelector('[data-weekly-plan-owner-actions]'),
      ownerName: root.querySelector('[data-weekly-plan-owner-name]'),
      importLegacy: root.querySelector('[data-weekly-plan-import]'),
      disconnect: root.querySelector('[data-weekly-plan-disconnect]'),
      save: root.querySelector('[data-weekly-plan-save]'),
      ownerStatus: root.querySelector('[data-weekly-plan-owner-status]')
    };

    function setOwnerStatus(message, state) {
      elements.ownerStatus.textContent = message || '';
      elements.ownerStatus.setAttribute('data-state', state || 'neutral');
    }

    function render() {
      var currentStart = getCurrentWeekStart();
      if (selectedStart < START_DATE) selectedStart = cloneDate(START_DATE);
      if (selectedStart > currentStart) selectedStart = cloneDate(currentStart);

      var selectedKey = dateKey(selectedStart);
      var isCurrent = selectedKey === dateKey(currentStart);
      var editable = isCurrent && editorMode;
      var plans = getPlans(readState(), selectedKey);
      var progress = calculateProgress(plans);
      var isComplete = progress.total > 0 && progress.completed === progress.total;

      elements.range.textContent = fullRange(selectedStart);
      elements.percent.textContent = progress.rounded + '%';
      elements.summary.textContent = !progress.total
        ? (isCurrent ? 'Waiting for this week\'s plans' : 'No plans recorded')
        : (isComplete
          ? 'All ' + progress.total + ' completed'
          : progress.completed + ' of ' + progress.total + ' completed');
      updateProgressBar(elements.progress, elements.progressFill, progress);
      root.classList.toggle('is-complete', isComplete);
      root.classList.toggle('is-owner-mode', editorMode);

      elements.weekNumber.textContent = 'Week ' + weekNumber(selectedStart);
      elements.switcherRange.textContent = friendlyRange(selectedStart);
      elements.currentLabel.textContent = isCurrent ? 'This week' : 'Past week';
      elements.boardKicker.textContent = isCurrent ? 'This week' : 'Archived week';
      elements.boardStatus.textContent = progress.total
        ? progress.completed + '/' + progress.total + ' complete'
        : '0 plans';

      elements.previous.disabled = selectedStart <= START_DATE;
      elements.next.disabled = selectedStart >= currentStart;
      elements.form.hidden = !editable;
      elements.notice.hidden = editable;
      if (!editable) {
        elements.notice.textContent = !isCurrent
          ? 'Past weeks are kept as a read-only record.'
          : 'Published plans are read-only. Owner mode is required to make changes.';
      }

      elements.empty.hidden = progress.total > 0;
      if (!progress.total) {
        var emptyTitle = elements.empty.querySelector('h3');
        var emptyCopy = elements.empty.querySelector('p');
        if (editable) {
          emptyTitle.textContent = 'This week is ready for you.';
          emptyCopy.textContent = 'Add the first plan above. Every completed item contributes an equal share of the progress.';
        } else if (isCurrent) {
          emptyTitle.textContent = 'No plans published yet.';
          emptyCopy.textContent = 'The owner has not published plans for this week.';
        } else {
          emptyTitle.textContent = 'No plans were recorded.';
          emptyCopy.textContent = 'This week remains empty in the archive.';
        }
      }

      elements.list.innerHTML = '';
      plans.forEach(function (plan) {
        elements.list.appendChild(createPlanItem(plan, editable, selectedKey, markDraftChanged));
      });

      elements.ownerLogin.hidden = editorMode;
      elements.ownerActions.hidden = !editorMode;
      elements.save.disabled = !editorMode || !stateDirty || saving;
      elements.save.classList.toggle('is-saving', saving);
      elements.importLegacy.hidden = !editorMode || legacyImported || countPlans(legacyState) === 0;
      if (!elements.importLegacy.hidden) {
        elements.importLegacy.textContent = 'Import browser draft (' + countPlans(legacyState) + ')';
      }
      elements.ownerToggle.classList.toggle('is-active', editorMode);
      elements.ownerToggle.setAttribute('aria-expanded', String(!elements.ownerPanel.hidden));
    }

    function markDraftChanged() {
      setOwnerStatus('Unsaved changes. Save them to GitHub when ready.', 'pending');
      render();
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
      if (!editorMode) return;
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
      writeDraft(state);
      elements.input.value = '';
      notifyChange();
      markDraftChanged();
      elements.input.focus();
    });

    elements.ownerToggle.addEventListener('click', function () {
      elements.ownerPanel.hidden = false;
      render();
      if (!editorMode) elements.token.focus();
    });

    elements.ownerClose.addEventListener('click', function () {
      elements.ownerPanel.hidden = true;
      render();
      elements.ownerToggle.focus();
    });

    elements.connect.addEventListener('click', function () {
      var token = elements.token.value.trim();
      if (!token) {
        setOwnerStatus('Enter a fine-grained GitHub token first.', 'error');
        elements.token.focus();
        return;
      }
      if (!window.fetch || !githubConfig.owner || !githubConfig.repo || !githubConfig.path) {
        setOwnerStatus('Owner mode is not configured for this site.', 'error');
        return;
      }

      elements.connect.disabled = true;
      setOwnerStatus('Verifying with GitHub…', 'working');

      githubRequest('/user', token)
        .then(function (user) {
          if (!user.login || user.login.toLowerCase() !== githubConfig.owner.toLowerCase()) {
            throw new Error('This token does not belong to ' + githubConfig.owner + '.');
          }
          return githubRequest(
            githubContentEndpoint() + '?ref=' + encodeURIComponent(githubConfig.branch),
            token
          ).then(function (file) {
            return { user: user, file: file };
          });
        })
        .then(function (result) {
          var repositoryState = normalizeState(JSON.parse(decodeBase64Utf8(result.file.content)));
          githubToken = token;
          githubFileSha = result.file.sha;
          publishedState = repositoryState;
          activeState = normalizeState(repositoryState);
          editorMode = true;
          stateDirty = false;
          legacyImported = false;
          elements.token.value = '';
          elements.ownerName.textContent = result.user.login;
          setOwnerStatus('Connected. Current-week controls are now unlocked.', 'success');
          notifyChange();
          render();
        })
        .catch(function (error) {
          githubToken = '';
          githubFileSha = '';
          editorMode = false;
          setOwnerStatus(error.message || 'Could not connect to GitHub.', 'error');
          render();
        })
        .then(function () {
          elements.connect.disabled = false;
        });
    });

    elements.token.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        elements.connect.click();
      }
    });

    elements.importLegacy.addEventListener('click', function () {
      if (!editorMode || !countPlans(legacyState)) return;
      activeState = mergeStates(activeState, legacyState);
      legacyImported = true;
      stateDirty = true;
      setOwnerStatus('Browser draft imported. Review it, then save to GitHub.', 'pending');
      notifyChange();
      render();
    });

    elements.disconnect.addEventListener('click', function () {
      if (stateDirty) {
        setOwnerStatus('Save your changes before disconnecting, or reload the page to discard them.', 'error');
        return;
      }
      githubToken = '';
      githubFileSha = '';
      editorMode = false;
      activeState = normalizeState(publishedState);
      elements.ownerName.textContent = '';
      setOwnerStatus('Disconnected. The page is read-only again.', 'neutral');
      notifyChange();
      render();
    });

    elements.save.addEventListener('click', function () {
      if (!editorMode || !stateDirty || saving || !githubToken || !githubFileSha) return;
      saving = true;
      setOwnerStatus('Saving to GitHub…', 'working');
      render();

      var payload = {
        message: 'Update weekly plan (' + dateKey(getCurrentWeekStart()) + ')',
        content: encodeBase64Utf8(serializeState(activeState)),
        sha: githubFileSha,
        branch: githubConfig.branch
      };

      githubRequest(githubContentEndpoint(), githubToken, {
        method: 'PUT',
        body: JSON.stringify(payload)
      }).then(function (result) {
        githubFileSha = result.content && result.content.sha ? result.content.sha : githubFileSha;
        publishedState = normalizeState(activeState);
        stateDirty = false;
        if (legacyImported) {
          clearLegacyState();
          legacyState = emptyState();
          legacyImported = false;
        }
        setOwnerStatus('Saved to GitHub. The public page will update after Pages finishes deploying.', 'success');
        notifyChange();
      }).catch(function (error) {
        setOwnerStatus((error.message || 'Could not save to GitHub.') + ' Reconnect if the file changed elsewhere.', 'error');
      }).then(function () {
        saving = false;
        render();
      });
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
    githubConfig = readGithubConfig();
    publishedState = readPublishedState();
    activeState = normalizeState(publishedState);
    legacyState = readLegacyState();

    var renderPlanPage = initializePlanPage();
    renderSidebarProgress();

    document.addEventListener('weeklyplan:change', renderSidebarProgress);
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
