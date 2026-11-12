/**
 * Retail Next — Desktop Application Orchestrator & Entry Point
 *
 * Architecture:
 *   - Sidebar: Collapsible Accordion with 12 Business Managers
 *   - Header: Active Store Switcher, Universal Search (Ctrl+F), Cashier/User Profile & Login
 *   - Main: Workspace Outlet driven by client Router
 *   - Status Bar: API online status, Active branch, PAGE_SIZE = 24 indicator, Live Clock
 *   - API Endpoint: https://retailnext.doonext.app
 */

'use strict';

(function() {

  function updateClock() {
    const el = document.getElementById('statusbar-clock');
    if (el) {
      const now = new Date();
      el.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
  }

  function updateStatusBar() {
    const storeEl = document.getElementById('statusbar-store');
    const cashierEl = document.getElementById('statusbar-cashier');
    const apiEl = document.getElementById('statusbar-api');

    const store = window.apiService?.activeStore;
    const staffName = localStorage.getItem('staff_name') || window.apiService?.user?.name || 'Administrator';
    const isOnline = window.apiService?.isOnline !== false;

    if (storeEl) storeEl.textContent = store?.name || 'Main Retail Store';
    if (cashierEl) cashierEl.textContent = staffName;
    if (apiEl) {
      apiEl.innerHTML = isOnline
        ? '<span style="color:#10b981;">● Online: retailnext.doonext.app</span>'
        : '<span style="color:#ef4444;">● Offline Mode</span>';
    }
  }

  window.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialise clock
    updateClock();
    setInterval(updateClock, 1000);

    // 2. Fetch session context if token/session available
    try {
      await window.apiService.getMe();
    } catch (_) {}

    // 3. Mount Sidebar Navigation
    const sidebarContainer = document.getElementById('app-sidebar');
    const sidebarNav = new window.SidebarNav(sidebarContainer);
    sidebarNav.render();
    window.RetailNextSidebar = sidebarNav;

    // 4. Mount Top Header Bar
    const headerContainer = document.getElementById('app-header');
    const headerBar = new window.HeaderBar(headerContainer);
    headerBar.render();
    window.RetailNextHeader = headerBar;

    // 5. Mount Router
    const outletContainer = document.getElementById('workspace-outlet');
    const router = new window.Router(outletContainer, sidebarNav);
    window.RetailNextRouter = router;
    router.init();

    // 6. Refresh Status Bar
    updateStatusBar();

    console.log('[RetailNext] Bootstrapped successfully with API endpoint https://retailnext.doonext.app');
  });

})();
