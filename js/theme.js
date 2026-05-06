(function () {
  const THEME_KEY = 'theme';
  const docEl = document.documentElement;
  const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');

  function getStoredTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  }

  function getPreferredTheme() {
    return mediaQuery.matches ? 'light' : 'dark';
  }

  function getResolvedTheme() {
    return getStoredTheme() || getPreferredTheme();
  }

  function getCurrentPageName() {
    const path = window.location.pathname || '';
    return path.split('/').pop() || 'index.html';
  }

  function canShowThemeToggle() {
    return ['landing.html', 'settings.html'].includes(getCurrentPageName());
  }

  function setTheme(theme, persist) {
    docEl.dataset.theme = theme;
    if (persist) {
      localStorage.setItem(THEME_KEY, theme);
    }
    syncToggleState(theme);
  }

  function syncToggleState(theme) {
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      const nextTheme = theme === 'dark' ? 'light' : 'dark';
      button.dataset.themeState = theme;
      button.setAttribute('aria-checked', String(theme === 'dark'));
      button.setAttribute('aria-label', `Switch to ${nextTheme} mode`);
      button.setAttribute('title', `Switch to ${nextTheme} mode`);
    });
  }

  function toggleTheme() {
    const nextTheme = getResolvedTheme() === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme, true);
  }

  function createToggleShell() {
    const shell = document.createElement('div');
    shell.className = 'theme-toggle-slot';
    shell.innerHTML = `
      <button
        type="button"
        class="theme-toggle-control"
        data-theme-toggle="true"
        data-theme-state="dark"
        role="switch"
        aria-checked="true"
      >
        <span class="theme-toggle-label theme-toggle-label-light">Light</span>
        <span class="theme-toggle-track" aria-hidden="true">
          <span class="theme-toggle-thumb"></span>
        </span>
        <span class="theme-toggle-label theme-toggle-label-dark">Dark</span>
      </button>
    `;
    shell.querySelector('[data-theme-toggle]').addEventListener('click', toggleTheme);
    return shell;
  }

  function ensureActionsContainer(header) {
    let actions = header.querySelector(':scope > .page-actions');
    if (!actions) {
      actions = document.createElement('div');
      actions.className = 'page-actions';
      header.appendChild(actions);
    }
    return actions;
  }

  function ensureStandaloneHeader(host, variant) {
    let header = host.querySelector(':scope > .theme-page-header');
    if (!header) {
      header = document.createElement('div');
      header.className = `theme-page-header ${variant}`;
      header.innerHTML = `
        <div class="theme-page-header-spacer" aria-hidden="true"></div>
        <div class="theme-page-header-actions"></div>
      `;
      host.insertBefore(header, host.firstChild);
    }
    return header.querySelector('.theme-page-header-actions');
  }

  function getMountTarget() {
    const adminActions = document.querySelector('.ac-topbar-actions');
    if (adminActions) return adminActions;

    const registerActions = document.querySelector('.rt-topbar-right');
    if (registerActions) return registerActions;

    const pageHeader = document.querySelector('.page-header');
    if (pageHeader) return ensureActionsContainer(pageHeader);

    const loginPage = document.querySelector('.login-page');
    if (loginPage) return ensureStandaloneHeader(loginPage, 'theme-login-header');

    const landingPage = document.querySelector('.landing-page');
    if (landingPage) return ensureStandaloneHeader(landingPage, 'theme-landing-header');

    if (document.querySelector('.hero')) {
      return ensureStandaloneHeader(document.body, 'theme-landing-header');
    }

    const mainContent = document.querySelector('.main-content');
    if (mainContent) return ensureStandaloneHeader(mainContent, 'theme-content-header');

    return ensureStandaloneHeader(document.body, 'theme-content-header');
  }

  function mountToggle() {
    if (!canShowThemeToggle()) {
      document.querySelector('.theme-toggle-slot')?.remove();
      return;
    }
    const target = getMountTarget();
    if (!target) return;

    let shell = document.querySelector('.theme-toggle-slot');
    if (!shell) {
      shell = createToggleShell();
    }

    if (shell.parentElement !== target) {
      target.appendChild(shell);
    }

    syncToggleState(getResolvedTheme());
  }

  setTheme(getResolvedTheme(), false);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountToggle);
  } else {
    mountToggle();
  }

  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', function () {
      if (!getStoredTheme()) {
        setTheme(getPreferredTheme(), false);
      }
    });
  }
})();
