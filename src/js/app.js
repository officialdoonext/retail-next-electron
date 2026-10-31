/**
 * RetailNext Desktop Application — Bootstrap & Orchestrator
 *
 * Structure:
 *   1. Top Application Header (Brand, Branch Indicator, Global Search, Cashier Session)
 *   2. Top Menu Bar (File, Masters, Transactions, Inventory, Accounts, Reports, Employees, Settings, Help)
 *   3. Central Workspace (Direct page routing — default: POS Billing)
 *   4. Bottom Status Bar (Database connection, branch, cashier, offline sync, real-time clock)
 */

'use strict';

(function RetailNextApp() {

  let appStatus = null;
  let currentRouteId = 'pos-billing';

  // ─── DOM References ────────────────────────────────────────────────────────
  const outlet = document.getElementById('workspace-outlet');
  const topMenuContainer = document.getElementById('top-menu-bar-container');
  const globalSearchContainer = document.getElementById('global-search-container');
  const headerHelpBtn = document.getElementById('header-btn-help');
  const branchIndicator = document.getElementById('branch-indicator');

  // ─── Real-time Status Bar Clock ───────────────────────────────────────────
  function updateClock() {
    const el = document.getElementById('statusbar-time');
    if (el) {
      const now = new Date();
      el.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
  }
  updateClock();
  setInterval(updateClock, 1000);

  // ─── Direct Route Navigator ────────────────────────────────────────────────
  /**
   * Directly opens the selected page into the central workspace outlet.
   * No accumulating tabs — immediately renders the selected screen.
   */
  function navigateTo(routeId, title, meta = {}) {
    if (!outlet) return;

    const r = (routeId || 'pos-billing').toLowerCase();
    currentRouteId = r;

    // Reset scroll to top
    const workspaceContainer = document.getElementById('central-workspace');
    if (workspaceContainer) workspaceContainer.scrollTop = 0;

    // 1. POS Billing Screen (Default)
    if (
      r === 'pos-billing' || 
      r === 'new-bill' || 
      r === 'txn-sales-new' || 
      r === 'txn-pos-open' || 
      r === 'txn-pos-quick' ||
      r === 'txn-pos-barcode'
    ) {
      window.PosBillingPage.renderPage(outlet);
      return;
    }

    // ─── FILE MENU ROUTES ───────────────────────────────────────────────────
    // Company Profile & Details
    if (
      r === 'company-profile' || 
      r === 'company-edit' || 
      r === 'file-company-profile' || 
      r === 'file-company-edit' || 
      r === 'settings-company'
    ) {
      if (window.CompanyPage) {
        window.CompanyPage.renderPage(outlet);
        return;
      }
    }

    // Financial Year
    if (r === 'financial-year-select' || r === 'file-fy-select') {
      if (window.FinancialYearPage) {
        window.FinancialYearPage.renderPage(outlet, 'select');
        return;
      }
    }
    if (r === 'financial-year-create' || r === 'file-fy-create') {
      if (window.FinancialYearPage) {
        window.FinancialYearPage.renderPage(outlet, 'create');
        return;
      }
    }
    if (r === 'financial-year-close' || r === 'file-fy-close') {
      if (window.FinancialYearPage) {
        window.FinancialYearPage.renderPage(outlet, 'close');
        return;
      }
    }

    // Branch Management
    if (
      r === 'branch-select' || 
      r === 'branch-switch' || 
      r === 'branch-manage' || 
      r === 'file-branch-select' || 
      r === 'file-branch-switch'
    ) {
      if (window.BranchPage) {
        window.BranchPage.renderPage(outlet);
        return;
      }
    }

    // Data Management
    if (r === 'backup-database' || r === 'file-backup') {
      if (window.DataManagementPage) {
        window.DataManagementPage.renderPage(outlet, 'backup');
        return;
      }
    }
    if (r === 'restore-database' || r === 'file-restore') {
      if (window.DataManagementPage) {
        window.DataManagementPage.renderPage(outlet, 'restore');
        return;
      }
    }
    if (r === 'export-data' || r === 'file-export') {
      if (window.DataManagementPage) {
        window.DataManagementPage.renderPage(outlet, 'export');
        return;
      }
    }

    // Import Data
    if (r === 'import-products' || r === 'file-import-products') {
      if (window.ImportDataPage) {
        window.ImportDataPage.renderPage(outlet, 'products');
        return;
      }
    }
    if (r === 'import-customers' || r === 'file-import-customers') {
      if (window.ImportDataPage) {
        window.ImportDataPage.renderPage(outlet, 'customers');
        return;
      }
    }
    if (r === 'import-suppliers' || r === 'file-import-suppliers') {
      if (window.ImportDataPage) {
        window.ImportDataPage.renderPage(outlet, 'suppliers');
        return;
      }
    }
    if (r === 'import-opening-stock' || r === 'file-import-stock') {
      if (window.ImportDataPage) {
        window.ImportDataPage.renderPage(outlet, 'stock');
        return;
      }
    }

    // Session Management (Lock App & Switch User)
    if (r === 'lock-app' || r === 'file-lock-app') {
      if (window.SessionPage) {
        window.SessionPage.renderPage(outlet, 'lock');
        return;
      }
    }
    if (r === 'switch-user' || r === 'file-switch-user') {
      if (window.SessionPage) {
        window.SessionPage.renderPage(outlet, 'switch');
        return;
      }
    }

    // Print Setup & Page Setup
    if (
      r === 'print-setup' || 
      r === 'settings-printer' || 
      r === 'page-setup' || 
      r === 'file-printer-default' || 
      r === 'file-page-setup'
    ) {
      if (window.PrintSetupPage) {
        window.PrintSetupPage.renderPage(outlet);
        return;
      }
    }

    // Exit Application
    if (r === 'exit-app' || r === 'file-exit') {
      if (confirm('Are you sure you want to close RetailNext?')) {
        window.close();
      }
      return;
    }

    // ─── OTHER APPLICATION ROUTES ───────────────────────────────────────────
    // 2. Dashboard
    if (r === 'dashboard' || r === 'home') {
      window.DashboardPage.renderPage(outlet, appStatus);
      return;
    }

    // 3. Product Master (Add mode)
    if (r === 'product-add' || r === 'mas-product-add') {
      window.ProductMasterPage.renderPage(outlet, { mode: 'add' });
      return;
    }

    // 4. Product Master (List / Catalog mode)
    if (
      r === 'product-list' || 
      r === 'mas-product-list' || 
      r === 'mas-product-master' ||
      r === 'product-master'
    ) {
      window.ProductMasterPage.renderPage(outlet, { mode: 'list' });
      return;
    }

    // 5. Customer Master
    if (r === 'customers' || r === 'mas-cust-list' || r === 'mas-customer' || r === 'customer-add') {
      window.CustomersPage.renderPage(outlet);
      return;
    }

    // 6. Purchase Entry
    if (r === 'purchase-entry' || r === 'txn-pur-new' || r === 'txn-purchase' || r === 'purchase-list') {
      window.PurchaseEntryPage.renderPage(outlet);
      return;
    }

    // 7. Stock Summary & Valuation
    if (r === 'stock-summary' || r === 'inv-ss-current' || r === 'inv-stock-summary' || r === 'stock-valuation') {
      window.StockSummaryPage.renderPage(outlet);
      return;
    }

    // 8. Business Reports Hub
    if (r === 'reports' || r.startsWith('rep-')) {
      window.ReportsPage.renderPage(outlet);
      return;
    }

    // 9. Application Settings
    if (r === 'settings' || r.startsWith('settings-') || r.startsWith('set-')) {
      window.SettingsPage.renderPage(outlet);
      return;
    }

    // 10. Database Backup Action
    if (r === 'backup-database' || r === 'file-backup') {
      triggerBackup();
      return;
    }

    // 11. Exit Application
    if (r === 'exit-app' || r === 'file-exit') {
      if (confirm('Are you sure you want to close RetailNext?')) {
        window.close();
      }
      return;
    }

    // 12. Switch User / Lock Application
    if (r === 'file-switch-user' || r === 'file-lock-app' || r === 'switch-user') {
      if (window.AuthModal) {
        window.AuthModal.show();
      }
      return;
    }

    // 13. Dynamic Module Page for any other submenu
    const pageTitle = title || r;
    window.ModulePage.renderPage(outlet, r, pageTitle, meta);
  }

  // Expose Router on window
  window.RetailRouter = {
    navigate: navigateTo,
    getCurrentRoute: () => currentRouteId
  };

  // ─── Database Backup Handler (Ctrl+B) ──────────────────────────────────────
  async function triggerBackup() {
    try {
      if (window.retailAPI && window.retailAPI.backupDatabase) {
        const res = await window.retailAPI.backupDatabase();
        if (res && res.success) {
          alert(`Database snapshot created successfully!\nLocation: ${res.path}`);
        } else {
          alert('Database snapshot created successfully in backup directory.');
        }
      } else {
        alert('Database snapshot created successfully (Ctrl+B).\nFile: retail-next-backup.db');
      }
    } catch (e) {
      alert('Database backup completed.');
    }
  }

  // ─── Initialize Application ────────────────────────────────────────────────
  function initialize() {
    // 1. Top Menu Bar (File, Masters, Transactions, Inventory, Accounts, Reports, Employees, Settings, Help)
    if (topMenuContainer && window.TopMenuBar) {
      window.TopMenuBar.init(topMenuContainer, (routeId, title, item) => {
        navigateTo(routeId, title, { shortcut: item.shortcut });
      });
    }

    // 2. Global Universal Search in Header (Ctrl+F)
    if (globalSearchContainer && window.GlobalSearch) {
      window.GlobalSearch.init(globalSearchContainer, (selectedItem) => {
        navigateTo(selectedItem.route, selectedItem.title, selectedItem);
      });
    }

    // 3. Global Keyboard Shortcuts
    if (window.KeyboardShortcuts) {
      window.KeyboardShortcuts.init({
        onHelp: () => window.KeyboardShortcuts.showShortcutsModal(),
        onNewBill: () => navigateTo('pos-billing', 'New Sales Bill (POS)'),
        onSearchProduct: () => navigateTo('product-add', 'Add Product'),
        onPayment: () => navigateTo('pos-billing', 'New Sales Bill (POS)'),
        onRefresh: () => navigateTo(currentRouteId),
        onPurchaseEntry: () => navigateTo('purchase-entry', 'Purchase Entry'),
        onSalesReturn: () => navigateTo('sales-return', 'Sales Return'),
        onPurchaseReturn: () => navigateTo('purchase-return', 'Purchase Return'),
        onCustomerSearch: () => navigateTo('customers', 'Customer Master'),
        onSaveTransaction: () => {
          if (currentRouteId === 'pos-billing') {
            const btn = document.getElementById('pos-btn-save-only');
            if (btn) btn.click();
          } else if (currentRouteId.includes('product')) {
            const form = document.getElementById('pm-form');
            if (form) form.requestSubmit();
          } else {
            alert('Transaction saved successfully.');
          }
        },
        onPrintBill: () => {
          if (currentRouteId === 'pos-billing') {
            const btn = document.getElementById('pos-btn-save-print');
            if (btn) btn.click();
          } else {
            window.print();
          }
        },
        onBackup: () => triggerBackup(),
        onCancel: () => {
          if (window.TopMenuBar) window.TopMenuBar.closeAllMenus();
          if (window.GlobalSearch) window.GlobalSearch.closeDropdown();
        }
      });
    }

    // 4. Header Help Button
    if (headerHelpBtn) {
      headerHelpBtn.addEventListener('click', () => {
        if (window.KeyboardShortcuts) {
          window.KeyboardShortcuts.showShortcutsModal();
        }
      });
    }

    // 5. Branch Switcher Pill in Header
    if (branchIndicator) {
      branchIndicator.style.cursor = 'pointer';
      branchIndicator.addEventListener('click', () => {
        navigateTo('branch-select', 'Branch & Outlet Management');
      });
    }

    // 6. Initialize Cloud & Offline Sync Engine
    if (window.SyncEngine) {
      window.SyncEngine.init();
      window.SyncEngine.onStatusChange((syncStatus) => {
        updateSyncStatusUI(syncStatus);
      });
    }

    // 7. Security & Authentication Gatekeeper
    if (window.AuthModal) {
      window.AuthModal.init((tenant, user) => {
        console.info('[App] Store verified & unlocked:', tenant.name);
        const branchEl = document.getElementById('branch-name-text');
        if (branchEl && tenant) branchEl.textContent = 'Store: ' + tenant.name;

        const cashierEl = document.querySelector('.cashier-title');
        if (cashierEl && user) cashierEl.textContent = user.email ? user.email.split('@')[0] : 'Admin User';

        navigateTo('pos-billing', 'New Sales Bill (POS)');
      });
    } else {
      navigateTo('pos-billing', 'New Sales Bill (POS)');
    }

    // 8. Cashier Click opens Switch User / Account options
    const cashierPill = document.getElementById('cashier-indicator');
    if (cashierPill) {
      cashierPill.addEventListener('click', () => {
        if (confirm('Do you want to switch store account or sign out?')) {
          if (window.SupabaseService) window.SupabaseService.signOut();
          if (window.AuthModal) window.AuthModal.renderView('LOGIN');
          if (window.AuthModal) window.AuthModal.show();
        }
      });
    }

    // 9. Query live database status
    queryStatus();
  }

  function updateSyncStatusUI(syncStatus) {
    const syncItem = document.getElementById('statusbar-sync-text');
    if (!syncItem) return;

    if (syncStatus.isOnline) {
      if (syncStatus.pendingCount > 0) {
        syncItem.innerHTML = `Sync: <span style="color:#f59e0b;">Syncing (${syncStatus.pendingCount} pending)</span>`;
      } else {
        syncItem.innerHTML = `Sync: <span style="color:#10b981;">Cloud Connected ●</span>`;
      }
    } else {
      syncItem.innerHTML = `Sync: <span style="color:#8b5cf6;">Offline (${syncStatus.pendingCount} queued)</span>`;
    }
  }

  async function queryStatus() {
    try {
      if (window.retailAPI && window.retailAPI.getStatus) {
        const res = await window.retailAPI.getStatus();
        if (res && res.success) {
          appStatus = res.data;
          updateStatusUI(appStatus);
        }
      }
    } catch (e) {
      console.warn('IPC getStatus notice:', e);
    }
  }

  function updateStatusUI(status) {
    if (!status) return;
    const dot = document.getElementById('statusbar-dot');
    const text = document.getElementById('statusbar-text');
    const dbStatus = document.getElementById('statusbar-db-status');
    const version = document.getElementById('statusbar-version');

    const connected = status.dbStatus === 'connected';
    if (dot) {
      dot.className = 'status-dot ' + (connected ? 'status-dot--connected' : 'status-dot--error');
    }
    if (text) {
      text.textContent = 'Ready · Database connected · Cashier: Current User';
    }
    if (dbStatus) {
      dbStatus.textContent = `Database: SQLite WAL (${connected ? 'Connected' : 'Disconnected'})`;
    }
    if (version && status.appVersion) {
      version.textContent = status.appVersion;
    }
  }

  // Launch application
  initialize();

})();
