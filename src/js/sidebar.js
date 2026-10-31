/**
 * SidebarManager — Accordion sidebar with full menu config.
 *
 * Single source of truth for all navigation. Generates both:
 *   1. Icon Rail items (leftmost 56px strip)
 *   2. Sidebar accordion panel (240px expandable panel)
 *
 * Features:
 *   - 12 module groups with accordion expand/collapse
 *   - Smooth max-height animation
 *   - Sidebar panel collapse/expand toggle
 *   - Live search filtering across all items
 *   - Active state synced between rail + sidebar
 *   - Per-module colour coding (used in coming soon pages)
 *
 * Used by: app.js (init), router.js (MENU_CONFIG lookup)
 */

/* global Router */

// ─── Menu Configuration ─────────────────────────────────────────────────────
// Each module has: id, label, description, color, iconSvg, and optional children[].
// Direct modules (no children) navigate immediately on click.
// This object is exposed on window so router.js can look up route metadata.

window.MENU_CONFIG = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Business overview and daily performance',
    color: '#3b82f6',
    direct: true,
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  },
  {
    id: 'sales',
    label: 'Sales',
    description: 'POS billing and sales transactions',
    color: '#10b981',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
    children: [
      { id: 'sales-pos',          label: 'POS / New Bill' },
      { id: 'sales-invoices',     label: 'Sales Invoice List' },
      { id: 'sales-return',       label: 'Sales Return' },
      { id: 'sales-exchange',     label: 'Sales Exchange' },
      { id: 'sales-quotation',    label: 'Quotation' },
      { id: 'sales-order',        label: 'Sales Order' },
      { id: 'sales-challan',      label: 'Delivery Challan' },
      { id: 'sales-hold',         label: 'Suspended / Hold Bills' },
      { id: 'sales-credit-notes', label: 'Sales Credit Notes' },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    description: 'Products, stock and barcode management',
    color: '#f59e0b',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
    children: [
      { id: 'inv-products',        label: 'Product List' },
      { id: 'inv-add-product',     label: 'Add / Edit Product' },
      { id: 'inv-categories',      label: 'Product Categories' },
      { id: 'inv-brands',          label: 'Brands' },
      { id: 'inv-units',           label: 'Units of Measurement' },
      { id: 'inv-variants',        label: 'Product Variants' },
      { id: 'inv-barcodes',        label: 'Barcode Management' },
      { id: 'inv-barcode-print',   label: 'Barcode / Label Printing' },
      { id: 'inv-stock-overview',  label: 'Stock Overview' },
      { id: 'inv-stock-ledger',    label: 'Stock Ledger' },
      { id: 'inv-stock-adj',       label: 'Stock Adjustment' },
      { id: 'inv-stock-transfer',  label: 'Stock Transfer' },
      { id: 'inv-stock-audit',     label: 'Physical Stock Audit' },
      { id: 'inv-low-stock',       label: 'Low Stock / Reorder' },
      { id: 'inv-expiry',          label: 'Expiry Management' },
    ],
  },
  {
    id: 'purchases',
    label: 'Purchases',
    description: 'Supplier orders and incoming stock',
    color: '#8b5cf6',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
    children: [
      { id: 'pur-order',        label: 'Purchase Order' },
      { id: 'pur-entry',        label: 'Purchase Entry' },
      { id: 'pur-invoices',     label: 'Purchase Invoice List' },
      { id: 'pur-return',       label: 'Purchase Return' },
      { id: 'pur-debit-notes',  label: 'Purchase Debit Notes' },
      { id: 'pur-grn',          label: 'Goods Received Note (GRN)' },
      { id: 'pur-payment',      label: 'Purchase Payment' },
      { id: 'pur-history',      label: 'Purchase History' },
    ],
  },
  {
    id: 'parties',
    label: 'Parties',
    description: 'Customer and supplier records',
    color: '#06b6d4',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    children: [
      { id: 'par-customers',           label: 'Customer List' },
      { id: 'par-add-customer',         label: 'Add Customer' },
      { id: 'par-customer-groups',      label: 'Customer Groups' },
      { id: 'par-customer-outstanding', label: 'Customer Outstanding' },
      { id: 'par-customer-ledger',      label: 'Customer Ledger' },
      { id: 'par-suppliers',            label: 'Supplier List' },
      { id: 'par-add-supplier',         label: 'Add Supplier' },
      { id: 'par-supplier-outstanding', label: 'Supplier Outstanding' },
      { id: 'par-supplier-ledger',      label: 'Supplier Ledger' },
      { id: 'par-loyalty',              label: 'Loyalty Members' },
    ],
  },
  {
    id: 'accounts',
    label: 'Accounts',
    description: 'Cash flow, expenses and settlements',
    color: '#f43f5e',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    children: [
      { id: 'acc-cash-bank',        label: 'Cash / Bank Accounts' },
      { id: 'acc-receive-payment',  label: 'Receive Payment' },
      { id: 'acc-pay-supplier',     label: 'Pay Supplier' },
      { id: 'acc-cust-receipts',    label: 'Customer Receipts' },
      { id: 'acc-expense',          label: 'Expense Entry' },
      { id: 'acc-income',           label: 'Income Entry' },
      { id: 'acc-cash-in-out',      label: 'Cash In / Cash Out' },
      { id: 'acc-bank-txns',        label: 'Bank Transactions' },
      { id: 'acc-day-book',         label: 'Day Book' },
      { id: 'acc-ledger',           label: 'Account Ledger' },
      { id: 'acc-payment-methods',  label: 'Payment Methods' },
      { id: 'acc-due-payments',     label: 'Due Payments' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    description: 'Business, stock and financial analysis',
    color: '#6366f1',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    children: [
      { id: 'rep-sales',           label: 'Sales Report' },
      { id: 'rep-item-sales',      label: 'Item-wise Sales' },
      { id: 'rep-category-sales',  label: 'Category-wise Sales' },
      { id: 'rep-purchase',        label: 'Purchase Report' },
      { id: 'rep-pur-return',      label: 'Purchase Return Report' },
      { id: 'rep-sal-return',      label: 'Sales Return Report' },
      { id: 'rep-stock',           label: 'Stock Report' },
      { id: 'rep-stock-val',       label: 'Stock Valuation' },
      { id: 'rep-stock-move',      label: 'Stock Movement' },
      { id: 'rep-pnl',             label: 'Profit & Loss' },
      { id: 'rep-gross-profit',    label: 'Gross Profit Report' },
      { id: 'rep-gst',             label: 'GST Reports' },
      { id: 'rep-customer',        label: 'Customer Report' },
      { id: 'rep-supplier',        label: 'Supplier Report' },
      { id: 'rep-expense',         label: 'Expense Report' },
      { id: 'rep-cash-bank',       label: 'Cash / Bank Report' },
      { id: 'rep-user',            label: 'User / Cashier Report' },
      { id: 'rep-audit',           label: 'Audit Log Report' },
    ],
  },
  {
    id: 'masters',
    label: 'Masters',
    description: 'Reusable business setup data',
    color: '#64748b',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
    children: [
      { id: 'mas-profile',          label: 'Company / Business Profile' },
      { id: 'mas-branches',         label: 'Branches / Stores' },
      { id: 'mas-warehouses',       label: 'Warehouses' },
      { id: 'mas-categories',       label: 'Product Categories' },
      { id: 'mas-brands',           label: 'Brands' },
      { id: 'mas-units',            label: 'Units' },
      { id: 'mas-tax',              label: 'Tax / GST Rates' },
      { id: 'mas-hsn',              label: 'HSN / SAC Codes' },
      { id: 'mas-payment-types',    label: 'Payment Types' },
      { id: 'mas-price-lists',      label: 'Price Lists' },
      { id: 'mas-discount-reasons', label: 'Discount Reasons' },
      { id: 'mas-expense-cats',     label: 'Expense Categories' },
      { id: 'mas-doc-series',       label: 'Document Number Series' },
    ],
  },
  {
    id: 'employees',
    label: 'Employees',
    description: 'Staff, permissions and cashier control',
    color: '#14b8a6',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>`,
    children: [
      { id: 'emp-list',       label: 'Employee List' },
      { id: 'emp-add',        label: 'Add Employee' },
      { id: 'emp-users',      label: 'User Accounts' },
      { id: 'emp-roles',      label: 'Roles & Permissions' },
      { id: 'emp-cashier',    label: 'Cashier Management' },
      { id: 'emp-shift',      label: 'Shift Management' },
      { id: 'emp-attendance', label: 'Attendance' },
      { id: 'emp-activity',   label: 'User Activity Log' },
    ],
  },
  {
    id: 'offers',
    label: 'Offers & Loyalty',
    description: 'Pricing promotions and customer rewards',
    color: '#ec4899',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`,
    children: [
      { id: 'off-discount-rules', label: 'Discount Rules' },
      { id: 'off-product-offers', label: 'Product Offers' },
      { id: 'off-bxgy',           label: 'Buy X Get Y' },
      { id: 'off-combo',          label: 'Combo Offers' },
      { id: 'off-coupons',        label: 'Coupon Management' },
      { id: 'off-loyalty',        label: 'Loyalty Points' },
      { id: 'off-gift-vouchers',  label: 'Gift Vouchers' },
      { id: 'off-membership',     label: 'Membership Benefits' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Application and hardware configuration',
    color: '#94a3b8',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>`,
    children: [
      { id: 'set-general',      label: 'General Settings' },
      { id: 'set-sales',        label: 'Sales / Billing Settings' },
      { id: 'set-purchase',     label: 'Purchase Settings' },
      { id: 'set-inventory',    label: 'Inventory Settings' },
      { id: 'set-tax',          label: 'Tax Settings' },
      { id: 'set-templates',    label: 'Invoice & Print Templates' },
      { id: 'set-barcode',      label: 'Barcode Settings' },
      { id: 'set-printer',      label: 'Thermal Printer Settings' },
      { id: 'set-scanner',      label: 'Barcode Scanner Settings' },
      { id: 'set-backup',       label: 'Backup & Restore' },
      { id: 'set-import-export',label: 'Data Import / Export' },
      { id: 'set-sync',         label: 'Offline / Cloud Sync' },
      { id: 'set-license',      label: 'Subscription & License' },
      { id: 'set-preferences',  label: 'System Preferences' },
    ],
  },
  {
    id: 'help',
    label: 'Help',
    description: 'Support and application information',
    color: '#22c55e',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    children: [
      { id: 'hlp-guide',       label: 'User Guide' },
      { id: 'hlp-shortcuts',   label: 'Keyboard Shortcuts' },
      { id: 'hlp-support',     label: 'Contact Support' },
      { id: 'hlp-report-issue',label: 'Report an Issue' },
      { id: 'hlp-updates',     label: 'Check for Updates' },
      { id: 'hlp-about',       label: 'About RetailNext' },
    ],
  },
];

// ─── Sidebar Manager ─────────────────────────────────────────────────────────

const SidebarManager = (() => {

  'use strict';

  // SVG chevron for accordion headers
  const CHEVRON_SVG = `<svg class="acc-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;

  // ─── Build Icon Rail ────────────────────────────────────────────────────

  /**
   * Clears and re-renders the icon rail from MENU_CONFIG.
   * Keeps the logo element, replaces all rail-icons.
   */
  function renderIconRail() {
    const rail = document.getElementById('icon-rail');
    if (!rail) return;

    // Remove all existing rail-icons (keep logo)
    rail.querySelectorAll('.rail-icon, .rail-divider, .rail-spacer').forEach(el => el.remove());

    const topModules = window.MENU_CONFIG.slice(0, 8);   // Dashboard → Reports
    const botModules = window.MENU_CONFIG.slice(8);      // Masters → Help

    topModules.forEach(module => {
      rail.appendChild(buildRailIcon(module));
    });

    // Separator before bottom group
    const div = document.createElement('div');
    div.className = 'rail-spacer';
    rail.appendChild(div);

    const sep = document.createElement('div');
    sep.className = 'rail-divider';
    rail.appendChild(sep);

    botModules.forEach(module => {
      rail.appendChild(buildRailIcon(module));
    });
  }

  /**
   * Creates a single icon rail button for a module.
   * @param {object} module
   * @returns {HTMLElement}
   */
  function buildRailIcon(module) {
    const el = document.createElement('div');
    el.className = 'rail-icon';
    el.setAttribute('data-module-id', module.id);
    el.setAttribute('title', module.label);
    el.innerHTML = module.iconSvg;

    el.addEventListener('click', () => {
      // Expand sidebar if collapsed
      const app = document.getElementById('app');
      if (app && app.classList.contains('sidebar-collapsed')) {
        app.classList.remove('sidebar-collapsed');
      }
      activateModule(module.id, true);
    });

    return el;
  }

  // ─── Build Sidebar Accordion ─────────────────────────────────────────────

  /**
   * Renders the accordion navigation into #sidebar-nav.
   */
  function renderSidebarAccordion() {
    const nav = document.getElementById('sidebar-nav');
    if (!nav) return;
    nav.innerHTML = '';

    window.MENU_CONFIG.forEach(module => {
      if (module.direct) {
        nav.appendChild(buildDirectItem(module));
      } else {
        nav.appendChild(buildAccordionItem(module));
      }
    });
  }

  /**
   * Builds a direct-navigate item (no children, e.g. Dashboard).
   * @param {object} module
   * @returns {HTMLElement}
   */
  function buildDirectItem(module) {
    const el = document.createElement('div');
    el.className = 'acc-direct-item';
    el.setAttribute('data-module-id', module.id);
    el.innerHTML = `${module.iconSvg}<span>${module.label}</span>`;

    el.addEventListener('click', () => {
      setActiveModule(module.id);
      Router.navigate(module.id, { moduleId: module.id, moduleLabel: module.label });
    });

    return el;
  }

  /**
   * Builds an accordion item for a module with children.
   * @param {object} module
   * @returns {HTMLElement}
   */
  function buildAccordionItem(module) {
    const item = document.createElement('div');
    item.className = 'acc-item';
    item.setAttribute('data-module-id', module.id);

    // Header
    const header = document.createElement('div');
    header.className = 'acc-header';
    header.innerHTML = `
      <div class="acc-header__left">
        ${module.iconSvg}
        <span>${module.label}</span>
      </div>
      ${CHEVRON_SVG}
    `;

    // Body (sub-items)
    const body = document.createElement('div');
    body.className = 'acc-body';
    body.setAttribute('data-module-id', module.id);

    module.children.forEach(child => {
      const subItem = document.createElement('div');
      subItem.className = 'acc-sub-item';
      subItem.setAttribute('data-route', child.id);
      subItem.setAttribute('data-module-id', module.id);
      subItem.setAttribute('title', child.label);
      subItem.textContent = child.label;

      subItem.addEventListener('click', () => {
        setActiveSubItem(child.id, module.id);
        updateBreadcrumb(module.label, child.label);
        Router.navigate(child.id, {
          moduleId:    module.id,
          moduleLabel: module.label,
          pageId:      child.id,
          pageLabel:   child.label,
          moduleColor: module.color,
          moduleIcon:  module.iconSvg,
        });
      });

      body.appendChild(subItem);
    });

    // Toggle accordion on header click
    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      if (isOpen) {
        closeAccordionItem(item);
      } else {
        openAccordionItem(item);
      }
    });

    item.appendChild(header);
    item.appendChild(body);
    return item;
  }

  // ─── Accordion Animation ─────────────────────────────────────────────────

  function openAccordionItem(item) {
    const body = item.querySelector('.acc-body');
    if (!body) return;
    item.classList.add('open');
    body.style.maxHeight = body.scrollHeight + 'px';
  }

  function closeAccordionItem(item) {
    const body = item.querySelector('.acc-body');
    if (!body) return;
    item.classList.remove('open');
    body.style.maxHeight = '0px';
  }

  function closeAllAccordions() {
    document.querySelectorAll('.acc-item.open').forEach(item => closeAccordionItem(item));
  }

  // ─── Active State Management ─────────────────────────────────────────────

  /**
   * Activates a module: highlights rail icon + opens accordion.
   * @param {string} moduleId
   * @param {boolean} [openFirst] - Navigate to first child on activation.
   */
  function activateModule(moduleId, openFirst) {
    setActiveModule(moduleId);

    const module = window.MENU_CONFIG.find(m => m.id === moduleId);
    if (!module) return;

    if (module.direct) {
      Router.navigate(module.id, { moduleId: module.id, moduleLabel: module.label });
      return;
    }

    // Close all, open this one
    closeAllAccordions();
    const item = document.querySelector(`.acc-item[data-module-id="${moduleId}"]`);
    if (item) openAccordionItem(item);

    // Optionally navigate to first child
    if (openFirst && module.children && module.children.length > 0) {
      const firstChild = module.children[0];
      setActiveSubItem(firstChild.id, moduleId);
      updateBreadcrumb(module.label, firstChild.label);
      Router.navigate(firstChild.id, {
        moduleId:    module.id,
        moduleLabel: module.label,
        pageId:      firstChild.id,
        pageLabel:   firstChild.label,
        moduleColor: module.color,
        moduleIcon:  module.iconSvg,
      });
    }
  }

  /**
   * Sets the active CSS class on the correct rail icon and sidebar item.
   * @param {string} moduleId
   */
  function setActiveModule(moduleId) {
    // Rail icons
    document.querySelectorAll('.rail-icon').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-module-id') === moduleId);
    });
    // Direct items
    document.querySelectorAll('.acc-direct-item').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-module-id') === moduleId);
    });
    // Update sidebar module title
    const module = window.MENU_CONFIG.find(m => m.id === moduleId);
    const titleEl = document.getElementById('sidebar-module-title');
    if (titleEl && module) titleEl.textContent = module.label;
  }

  /**
   * Sets the active sub-item highlight.
   * @param {string} routeId
   * @param {string} moduleId
   */
  function setActiveSubItem(routeId, moduleId) {
    setActiveModule(moduleId);
    document.querySelectorAll('.acc-sub-item').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-route') === routeId);
    });
  }

  // ─── Breadcrumb ───────────────────────────────────────────────────────────

  function updateBreadcrumb(moduleLabel, pageLabel) {
    const el = document.getElementById('breadcrumb-current');
    if (el) {
      el.innerHTML = `<span style="color:var(--color-text-tertiary)">${moduleLabel}</span>
        <span style="color:var(--color-border-strong);margin:0 4px">/</span>
        ${pageLabel}`;
    }
    // Update content tab label
    const tab = document.querySelector('.content-bar__tab.active');
    if (tab) {
      // Keep icon, update text node
      const spans = tab.querySelectorAll('span');
      if (spans.length > 0) spans[spans.length - 1].textContent = pageLabel;
      else tab.appendChild(Object.assign(document.createElement('span'), { textContent: pageLabel }));
    }
  }

  // ─── Sidebar Toggle ───────────────────────────────────────────────────────

  function initSidebarToggle() {
    const btn = document.getElementById('sidebar-toggle');
    const app = document.getElementById('app');
    if (!btn || !app) return;

    btn.addEventListener('click', () => {
      app.classList.toggle('sidebar-collapsed');
    });
  }

  // ─── Search Filter ────────────────────────────────────────────────────────

  function initSearch() {
    const input = document.getElementById('sidebar-search');
    if (!input) return;

    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      filterSidebar(query);
    });
  }

  /**
   * Filters sidebar items by query string.
   * - Shows/hides sub-items.
   * - Auto-expands sections with matches.
   * - Shows all if query is empty.
   */
  function filterSidebar(query) {
    const accItems = document.querySelectorAll('.acc-item');
    const directItems = document.querySelectorAll('.acc-direct-item');

    if (!query) {
      // Restore all — close all accordions, show everything
      directItems.forEach(el => el.classList.remove('search-hidden'));
      accItems.forEach(item => {
        item.classList.remove('search-hidden');
        item.querySelectorAll('.acc-sub-item').forEach(sub => sub.classList.remove('search-hidden'));
        // Re-collapse to original state (close all)
        const body = item.querySelector('.acc-body');
        if (body && !item.classList.contains('open')) {
          body.style.maxHeight = '0px';
        }
      });
      return;
    }

    // Filter direct items
    directItems.forEach(el => {
      const label = el.textContent.toLowerCase();
      el.classList.toggle('search-hidden', !label.includes(query));
    });

    // Filter accordion items
    accItems.forEach(item => {
      const moduleId  = item.getAttribute('data-module-id');
      const module    = window.MENU_CONFIG.find(m => m.id === moduleId);
      const subItems  = item.querySelectorAll('.acc-sub-item');

      let anyChildMatch = false;

      subItems.forEach(sub => {
        const label = sub.textContent.toLowerCase();
        const match = label.includes(query);
        sub.classList.toggle('search-hidden', !match);
        if (match) anyChildMatch = true;
      });

      // Module label match — show all children
      const modLabelMatch = module && module.label.toLowerCase().includes(query);
      if (modLabelMatch) {
        subItems.forEach(sub => sub.classList.remove('search-hidden'));
        anyChildMatch = true;
      }

      item.classList.toggle('search-hidden', !anyChildMatch);

      // Auto-expand matched sections
      if (anyChildMatch) {
        item.classList.add('open');
        const body = item.querySelector('.acc-body');
        if (body) body.style.maxHeight = body.scrollHeight + 'px';
      } else {
        item.classList.remove('open');
        const body = item.querySelector('.acc-body');
        if (body) body.style.maxHeight = '0px';
      }
    });
  }

  // ─── Public Init ─────────────────────────────────────────────────────────

  /**
   * Initialises the entire sidebar system.
   * Call this once in app.js after Router.init().
   */
  function init() {
    renderIconRail();
    renderSidebarAccordion();
    initSidebarToggle();
    initSearch();

    // Activate Dashboard by default (no child navigation)
    setActiveModule('dashboard');
  }

  return { init, activateModule, setActiveSubItem };

})();
