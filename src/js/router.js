/**
 * Client-Side Router — Updated for accordion sidebar + context-aware coming soon pages.
 *
 * Routes are registered by app.js for real pages (dashboard).
 * All sub-page routes from MENU_CONFIG automatically display a rich
 * coming-soon placeholder that shows module + page context.
 */

/* global SidebarManager */

const Router = (() => {

  /** @type {Map<string, function>} */
  const routes = new Map();

  /** @type {string|null} */
  let currentRoute = null;

  /** @type {HTMLElement|null} */
  let outlet = null;

  /**
   * Initialises the router.
   * @param {HTMLElement} outletEl
   */
  function init(outletEl) {
    outlet = outletEl;
  }

  /**
   * Registers a page route with a render function.
   * @param {string} name
   * @param {function} renderFn - Called with (outlet, data)
   */
  function register(name, renderFn) {
    routes.set(name, renderFn);
  }

  /**
   * Navigates to a route with optional context data.
   * @param {string} routeName
   * @param {object} [data]
   */
  function navigate(routeName, data) {
    if (!outlet) {
      console.error('[Router] Outlet not initialised.');
      return;
    }

    currentRoute = routeName;

    // Registered page (e.g. dashboard)
    const renderFn = routes.get(routeName);
    if (renderFn) {
      outlet.innerHTML = '';
      outlet.className = '';
      renderFn(outlet, data);
      return;
    }

    // Coming soon — render context-aware placeholder
    renderComingSoon(routeName, data);
  }

  /**
   * Renders a premium coming-soon placeholder page.
   * Uses route context (module name, color, icon) from MENU_CONFIG / data.
   *
   * @param {string} routeName
   * @param {object} [data]
   */
  function renderComingSoon(routeName, data) {
    outlet.innerHTML = '';
    outlet.className = '';

    const moduleColor = (data && data.moduleColor) || '#3b82f6';
    const moduleLabel = (data && data.moduleLabel) || 'Module';
    const pageLabel   = (data && data.pageLabel)   || routeName;
    const moduleIcon  = (data && data.moduleIcon)  || '';

    // Build a subtle hex-like alpha color for backgrounds
    const colorAlpha10 = moduleColor + '1a';   // ~10% opacity
    const colorAlpha20 = moduleColor + '33';   // ~20% opacity

    outlet.innerHTML = `
      <div class="coming-soon-page">
        <!-- Breadcrumb path -->
        <div class="cs-breadcrumb">
          <span class="cs-breadcrumb__module" style="color:${moduleColor}">${moduleLabel}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:#64748b"><polyline points="9 18 15 12 9 6"/></svg>
          <span class="cs-breadcrumb__page">${pageLabel}</span>
        </div>

        <!-- Main card -->
        <div class="cs-card">

          <!-- Glowing icon -->
          <div class="cs-icon-ring" style="
            background: ${colorAlpha10};
            border: 1.5px solid ${colorAlpha20};
            box-shadow: 0 0 40px ${colorAlpha10};
          ">
            <div class="cs-icon-inner" style="color:${moduleColor}">
              ${moduleIcon}
            </div>
          </div>

          <!-- Labels -->
          <div class="cs-badge" style="background:${colorAlpha20}; color:${moduleColor}; border:1px solid ${colorAlpha20}">
            Coming Soon
          </div>

          <h2 class="cs-title">${pageLabel}</h2>

          <p class="cs-desc">
            The <strong>${pageLabel}</strong> feature is currently under development
            and will be available in a future phase of <strong>Retail Next</strong>.
          </p>

          <!-- Module context row -->
          <div class="cs-module-row">
            <div class="cs-module-dot" style="background:${moduleColor}"></div>
            <span class="cs-module-label">${moduleLabel} Module</span>
          </div>

          <!-- Divider -->
          <div class="cs-divider"></div>

          <!-- Info grid -->
          <div class="cs-info-grid">
            <div class="cs-info-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Offline-first architecture
            </div>
            <div class="cs-info-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
              SQLite local database
            </div>
            <div class="cs-info-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              Secure IPC bridge
            </div>
            <div class="cs-info-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              Cloud sync ready
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /** @returns {string|null} */
  function getCurrent() {
    return currentRoute;
  }

  return { init, register, navigate, getCurrent };

})();
