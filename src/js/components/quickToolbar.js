/**
 * RetailNext — Quick-Access Toolbar
 * Placed directly below the traditional top menu bar.
 * Contains frequently used action buttons with keyboard shortcuts.
 */

'use strict';

window.QuickToolbar = (() => {
  const TOOLBAR_BUTTONS = [
    {
      id: 'tb-dashboard',
      label: 'Dashboard',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
      route: 'dashboard',
      badge: 'Home'
    },
    {
      id: 'tb-new-bill',
      label: 'New Bill',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
      route: 'pos-billing',
      shortcut: 'F2',
      primary: true
    },
    {
      id: 'tb-add-product',
      label: 'Add Product',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
      route: 'product-add',
      shortcut: 'F3'
    },
    {
      id: 'tb-customers',
      label: 'Customers',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      route: 'customers',
      shortcut: 'F9'
    },
    {
      id: 'tb-purchase',
      label: 'Purchase',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
      route: 'purchase-entry',
      shortcut: 'F6'
    },
    {
      id: 'tb-stock',
      label: 'Stock',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
      route: 'stock-summary'
    },
    {
      id: 'tb-reports',
      label: 'Reports',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
      route: 'reports'
    },
    {
      id: 'tb-settings',
      label: 'Settings',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
      route: 'settings'
    }
  ];

  const SECONDARY_ACTIONS = [
    {
      id: 'tb-refresh',
      label: 'Refresh',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
      shortcut: 'F5',
      action: 'refresh'
    },
    {
      id: 'tb-backup',
      label: 'Backup',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
      shortcut: 'Ctrl+B',
      action: 'backup'
    },
    {
      id: 'tb-print',
      label: 'Print Bill',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`,
      shortcut: 'F12',
      action: 'print'
    }
  ];

  function init(containerEl, onNavigate, onAction) {
    if (!containerEl) return;
    containerEl.innerHTML = '';

    const toolbarEl = document.createElement('div');
    toolbarEl.className = 'quick-toolbar';

    const mainGroup = document.createElement('div');
    mainGroup.className = 'toolbar-group main-group';

    TOOLBAR_BUTTONS.forEach(btn => {
      const buttonEl = document.createElement('button');
      buttonEl.className = 'toolbar-btn' + (btn.primary ? ' toolbar-btn--primary' : '');
      buttonEl.setAttribute('data-id', btn.id);
      buttonEl.title = `${btn.label}${btn.shortcut ? ' (' + btn.shortcut + ')' : ''}`;

      buttonEl.innerHTML = `
        <span class="toolbar-btn__icon">${btn.icon}</span>
        <span class="toolbar-btn__label">${btn.label}</span>
        ${btn.shortcut ? `<span class="toolbar-btn__shortcut">${btn.shortcut}</span>` : ''}
      `;

      buttonEl.addEventListener('click', () => {
        if (onNavigate) {
          onNavigate(btn.route, btn.label);
        }
      });

      mainGroup.appendChild(buttonEl);
    });

    const divider = document.createElement('div');
    divider.className = 'toolbar-divider';

    const actionGroup = document.createElement('div');
    actionGroup.className = 'toolbar-group action-group';

    SECONDARY_ACTIONS.forEach(btn => {
      const buttonEl = document.createElement('button');
      buttonEl.className = 'toolbar-btn toolbar-btn--secondary';
      buttonEl.setAttribute('data-id', btn.id);
      buttonEl.title = `${btn.label} (${btn.shortcut})`;

      buttonEl.innerHTML = `
        <span class="toolbar-btn__icon">${btn.icon}</span>
        <span class="toolbar-btn__label">${btn.label}</span>
        <span class="toolbar-btn__shortcut">${btn.shortcut}</span>
      `;

      buttonEl.addEventListener('click', () => {
        if (onAction) {
          onAction(btn.action);
        }
      });

      actionGroup.appendChild(buttonEl);
    });

    toolbarEl.appendChild(mainGroup);
    toolbarEl.appendChild(divider);
    toolbarEl.appendChild(actionGroup);

    containerEl.appendChild(toolbarEl);
  }

  return { init };
})();

