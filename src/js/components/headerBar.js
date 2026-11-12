/**
 * Retail Next — Top Header Bar Component
 */

'use strict';

(function(global) {

  class HeaderBar {
    constructor(containerEl) {
      this.container = containerEl;

      // Subscribe to printer service state changes
      if (global.PrinterService) {
        global.PrinterService.subscribe(() => {
          this.updatePrinterPill();
        });
      }
    }

    render() {
      if (!this.container) return;

      const store = global.apiService?.activeStore || { name: 'Main Retail Store', code: 'STR-001' };
      const user = global.apiService?.user || { name: 'Administrator', role: 'Business Owner' };
      const staffRole = localStorage.getItem('staff_role') || 'Admin';
      const staffName = localStorage.getItem('staff_name') || user?.name || 'Administrator';
      const isOnline = global.apiService?.isOnline !== false;

      const pState = global.PrinterService ? global.PrinterService.getState() : { isConnected: false, paperWidth: '80mm' };

      this.container.innerHTML = `
        <div class="header-left">
          <div class="store-select-pill" id="header-store-pill" title="Click to Switch Store Branch">
            <span class="store-dot"></span>
            <span id="header-store-name" style="font-weight:600;color:var(--slate-900);">${store.name || 'Main Retail Store'}</span>
            <span class="badge badge-slate" style="font-size:10px;padding:1px 5px;">${store.code || 'STR-001'}</span>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>

        <div class="header-center">
          <div class="global-search-trigger" id="header-search-trigger" title="Search pages, products, bills (Ctrl+F)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span>Search menus, products, invoices...</span>
            <span class="kbd-shortcut">Ctrl+F</span>
          </div>
        </div>

        <div class="header-right">
          <!-- Thermal Printer Control Pill -->
          <button id="header-printer-pill" class="btn btn-secondary btn-sm" style="gap:6px; cursor:pointer; font-size:11px; padding: 4px 10px; border-radius: 9999px; ${pState.isConnected ? 'border-color:#a7f3d0; background:#ecfdf5; color:#065f46;' : ''}" title="Thermal Printer Center (USB & Bluetooth)">
            <span style="font-size:13px;">🖨️</span>
            <span id="header-printer-status-text" style="font-weight:600;">
              ${pState.isConnected ? `${pState.paperWidth} (${pState.printerType})` : `Thermal: ${pState.paperWidth}`}
            </span>
          </button>

          <!-- Live API Status Pill -->
          <div class="api-status-pill ${isOnline ? '' : 'offline'}" id="header-api-status" title="Connected to https://retailnext.doonext.app">
            <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:currentColor;"></span>
            <span>${isOnline ? 'retailnext.doonext.app' : 'Offline Mode'}</span>
          </div>

          <!-- Fast POS Launcher -->
          <a href="#/pos" class="btn btn-primary btn-sm" style="gap:6px;text-decoration:none;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 3h16a2 2 0 0 1 2 2v6a10 10 0 0 1-10 10A10 10 0 0 1 2 11V5a2 2 0 0 1 2-2z"/><polyline points="8 10 12 14 16 10"/></svg>
            <span>POS Billing</span>
          </a>

          <!-- User / Cashier Pill -->
          <div class="user-profile-pill" id="header-user-pill" title="Cashier & Admin Session (Click for Logout)">
            <div class="user-avatar">${(staffName || 'A')[0]}</div>
            <div class="user-meta">
              <span class="user-name">${staffName}</span>
              <span class="user-role">${staffRole}</span>
            </div>
            <button id="header-logout-btn" title="Sign Out" style="background:none; border:none; color:var(--slate-400); cursor:pointer; padding:2px 4px; font-size:12px; margin-left:4px;">
              🚪
            </button>
          </div>
        </div>
      `;

      this._bindEvents();
    }

    updatePrinterPill() {
      const btn = document.getElementById('header-printer-pill');
      const text = document.getElementById('header-printer-status-text');
      if (!btn || !text || !global.PrinterService) return;

      const pState = global.PrinterService.getState();
      if (pState.isConnected) {
        btn.style.borderColor = '#a7f3d0';
        btn.style.background = '#ecfdf5';
        btn.style.color = '#065f46';
        text.textContent = `${pState.paperWidth} (${pState.printerType})`;
      } else {
        btn.style.borderColor = '';
        btn.style.background = '';
        btn.style.color = '';
        text.textContent = `Thermal: ${pState.paperWidth}`;
      }
    }

    _bindEvents() {
      // Thermal printer trigger
      const printerBtn = document.getElementById('header-printer-pill');
      if (printerBtn) {
        printerBtn.onclick = () => {
          global.ThermalPrinterModal?.open();
        };
      }

      // Store switcher trigger
      const storePill = document.getElementById('header-store-pill');
      if (storePill) {
        storePill.onclick = () => {
          global.StoreSwitcherModal?.open();
        };
      }

      // Universal search trigger
      const searchTrigger = document.getElementById('header-search-trigger');
      if (searchTrigger) {
        searchTrigger.onclick = () => {
          global.GlobalSearch?.open();
        };
      }

      // Logout button
      const logoutBtn = document.getElementById('header-logout-btn');
      if (logoutBtn) {
        logoutBtn.onclick = async (e) => {
          e.stopPropagation();
          if (confirm('Are you sure you want to sign out of Retail Next?')) {
            await global.apiService.logout();
            if (global.Toast) global.Toast.info('Signed out successfully');
            if (global.RetailNextRouter) {
              global.RetailNextRouter.navigate('/login');
            } else {
              window.location.hash = '#/login';
            }
          }
        };
      }

      // User session trigger
      const userPill = document.getElementById('header-user-pill');
      if (userPill) {
        userPill.onclick = () => {
          global.AuthModal?.open();
        };
      }
    }

    refresh() {
      this.render();
    }
  }

  global.HeaderBar = HeaderBar;
})(window);

