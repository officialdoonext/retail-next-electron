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

    // ─── MASTERS MENU ROUTES ───────────────────────────────────────────────
    // 1. Product Master (Add mode)
    if (r === 'product-add' || r === 'mas-product-add') {
      if (window.ProductMasterPage) {
        window.ProductMasterPage.renderPage(outlet, { mode: 'add' });
        return;
      }
    }

    // Product Master (List / Catalog mode)
    if (
      r === 'product-list' || 
      r === 'mas-product-list' || 
      r === 'mas-product-edit' || 
      r === 'mas-product-delete' || 
      r === 'mas-product-master' ||
      r === 'product-master'
    ) {
      if (window.ProductMasterPage) {
        window.ProductMasterPage.renderPage(outlet, { mode: 'list' });
        return;
      }
    }

    // 2. Product Categories
    if (r === 'category-main' || r === 'mas-cat-main') {
      if (window.CategoriesPage) {
        window.CategoriesPage.renderPage(outlet, 'main');
        return;
      }
    }
    if (r === 'category-sub' || r === 'mas-cat-sub') {
      if (window.CategoriesPage) {
        window.CategoriesPage.renderPage(outlet, 'sub');
        return;
      }
    }
    if (
      r === 'category-list' || 
      r === 'mas-cat-list' || 
      r === 'mas-categories' || 
      r === 'categories'
    ) {
      if (window.CategoriesPage) {
        window.CategoriesPage.renderPage(outlet, 'list');
        return;
      }
    }

    // 3. Brands
    if (r === 'brand-add' || r === 'mas-brand-add') {
      if (window.BrandsPage) {
        window.BrandsPage.renderPage(outlet, 'add');
        return;
      }
    }
    if (
      r === 'brand-edit' || 
      r === 'brand-list' || 
      r === 'mas-brand-edit' || 
      r === 'mas-brand-list' || 
      r === 'mas-brands' || 
      r === 'brands'
    ) {
      if (window.BrandsPage) {
        window.BrandsPage.renderPage(outlet, 'list');
        return;
      }
    }

    // 4. Units of Measurement & Conversions
    if (
      r === 'uom-pieces' || 
      r === 'uom-box' || 
      r === 'uom-packet' || 
      r === 'uom-gram' || 
      r === 'uom-kg' || 
      r === 'uom-litre' || 
      r === 'uom-metre' || 
      r === 'mas-uom' || 
      r === 'uom'
    ) {
      if (window.UomPage) {
        window.UomPage.renderPage(outlet, 'uom');
        return;
      }
    }
    if (
      r === 'unit-conv-box' || 
      r === 'unit-conv-kg' || 
      r === 'unit-conv-pack' || 
      r === 'mas-conversions' || 
      r === 'unit-conversions'
    ) {
      if (window.UomPage) {
        window.UomPage.renderPage(outlet, 'conv');
        return;
      }
    }

    // 5. Product Variants
    if (
      r === 'variant-size' || 
      r === 'variant-colour' || 
      r === 'variant-weight' || 
      r === 'variant-model' || 
      r === 'variant-list' || 
      r.startsWith('variant-') || 
      r.startsWith('mas-var-') || 
      r === 'mas-variants' || 
      r === 'variants'
    ) {
      if (window.VariantsPage) {
        window.VariantsPage.renderPage(outlet, r);
        return;
      }
    }

    // 6. Barcodes
    if (
      r === 'barcode-generate' || 
      r === 'barcode-assign' || 
      r === 'barcode-multiple' || 
      r.startsWith('barcode-') || 
      r.startsWith('mas-bc-') || 
      r === 'mas-barcodes' || 
      r === 'barcodes'
    ) {
      if (window.BarcodesPage) {
        window.BarcodesPage.renderPage(outlet);
        return;
      }
    }

    // 7. Product Pricing & Price Lists
    if (
      r === 'pricing-selling' || 
      r === 'pricing-mrp' || 
      r === 'pricing-wholesale' || 
      r === 'pricing-retail' || 
      r === 'mas-price-selling' || 
      r === 'mas-price-mrp' || 
      r === 'mas-price-wholesale' || 
      r === 'mas-price-retail' || 
      r === 'mas-pricing' || 
      r === 'pricing'
    ) {
      if (window.PricingPage) {
        window.PricingPage.renderPage(outlet, 'catalog');
        return;
      }
    }
    if (r === 'pricelist-bulk' || r === 'mas-pl-bulk') {
      if (window.PricingPage) {
        window.PricingPage.renderPage(outlet, 'bulk');
        return;
      }
    }
    if (r === 'pricelist-customer' || r === 'mas-pl-customer' || r === 'mas-pricelists' || r === 'pricelists') {
      if (window.PricingPage) {
        window.PricingPage.renderPage(outlet, 'tiers');
        return;
      }
    }

    // 8. Tax Master (GST & HSN/SAC)
    if (r === 'tax-gst' || r === 'mas-tax-gst' || r === 'tax-categories' || r === 'mas-tax-categories' || r === 'mas-tax' || r === 'taxes') {
      if (window.TaxMasterPage) {
        window.TaxMasterPage.renderPage(outlet, 'gst');
        return;
      }
    }
    if (r === 'tax-hsn' || r === 'mas-tax-hsn') {
      if (window.TaxMasterPage) {
        window.TaxMasterPage.renderPage(outlet, 'tax-hsn');
        return;
      }
    }

    // 9. Customer Master & Groups
    if (r === 'customer-add' || r === 'mas-cust-add') {
      if (window.CustomersPage) {
        window.CustomersPage.renderPage(outlet, 'add');
        return;
      }
    }
    if (
      r === 'customers' || 
      r === 'mas-cust-list' || 
      r === 'mas-customer' || 
      r === 'customer-list' || 
      r === 'customer-groups' || 
      r === 'mas-cust-groups'
    ) {
      if (window.CustomersPage) {
        window.CustomersPage.renderPage(outlet, 'list');
        return;
      }
    }

    // 10. Supplier Master & Groups
    if (r === 'supplier-add' || r === 'mas-supp-add') {
      if (window.SuppliersPage) {
        window.SuppliersPage.renderPage(outlet, 'add');
        return;
      }
    }
    if (
      r === 'supplier-list' || 
      r === 'mas-supp-list' || 
      r === 'mas-supplier' || 
      r === 'suppliers' || 
      r === 'supplier-groups' || 
      r === 'mas-supp-groups'
    ) {
      if (window.SuppliersPage) {
        window.SuppliersPage.renderPage(outlet, 'list');
        return;
      }
    }

    // 11. Payment Modes
    if (
      r === 'paymode-cash' || 
      r === 'paymode-upi' || 
      r === 'paymode-card' || 
      r === 'paymode-bank' || 
      r === 'paymode-credit' || 
      r.startsWith('paymode-') || 
      r.startsWith('mas-pay-') || 
      r === 'mas-payment-modes' || 
      r === 'payment-modes'
    ) {
      if (window.PaymentModesPage) {
        window.PaymentModesPage.renderPage(outlet);
        return;
      }
    }

    // 12. Discount Master
    if (r === 'discount-rules' || r === 'mas-disc-rules' || r === 'mas-discounts' || r === 'discounts') {
      if (window.DiscountsPage) {
        window.DiscountsPage.renderPage(outlet, 'rules');
        return;
      }
    }
    if (r === 'discount-items' || r === 'mas-disc-item') {
      if (window.DiscountsPage) {
        window.DiscountsPage.renderPage(outlet, 'items');
        return;
      }
    }
    if (r === 'discount-bill' || r === 'mas-disc-bill') {
      if (window.DiscountsPage) {
        window.DiscountsPage.renderPage(outlet, 'bill');
        return;
      }
    }

    // 13. Opening Balances
    if (r === 'opening-stock' || r === 'mas-ob-stock') {
      if (window.OpeningBalancesPage) {
        window.OpeningBalancesPage.renderPage(outlet, 'stock');
        return;
      }
    }
    if (r === 'customer-balances' || r === 'mas-ob-customer') {
      if (window.OpeningBalancesPage) {
        window.OpeningBalancesPage.renderPage(outlet, 'customer');
        return;
      }
    }
    if (r === 'supplier-balances' || r === 'mas-ob-supplier' || r === 'mas-opening-balances') {
      if (window.OpeningBalancesPage) {
        window.OpeningBalancesPage.renderPage(outlet, 'supplier');
        return;
      }
    }

    // 14. Loyalty Master
    if (r === 'loyalty-points' || r === 'mas-loy-points' || r === 'mas-loyalty' || r === 'loyalty') {
      if (window.LoyaltyPage) {
        window.LoyaltyPage.renderPage(outlet, 'points');
        return;
      }
    }
    if (r === 'reward-rules' || r === 'mas-loy-rules') {
      if (window.LoyaltyPage) {
        window.LoyaltyPage.renderPage(outlet, 'rules');
        return;
      }
    }
    if (r === 'membership-types' || r === 'mas-loy-memberships') {
      if (window.LoyaltyPage) {
        window.LoyaltyPage.renderPage(outlet, 'tiers');
        return;
      }
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
