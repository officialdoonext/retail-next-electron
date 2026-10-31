/**
 * RetailNext — Keyboard Shortcuts Manager
 * Handles function keys (F1-F12), Ctrl shortcuts, and Esc dialog cancellation.
 */

'use strict';

window.KeyboardShortcuts = (() => {
  const SHORTCUTS_TABLE = [
    { key: 'F1', action: 'help', description: 'Open Help Center & User Guide' },
    { key: 'F2', action: 'new-bill', description: 'Open POS / New Sales Bill' },
    { key: 'F3', action: 'search-product', description: 'Search Product / Product Master' },
    { key: 'F4', action: 'payment', description: 'Receive Payment / Payment Modes' },
    { key: 'F5', action: 'refresh', description: 'Refresh Active Workspace & Data' },
    { key: 'F6', action: 'purchase-entry', description: 'New Purchase Entry' },
    { key: 'F7', action: 'sales-return', description: 'Sales Return & Credit Notes' },
    { key: 'F8', action: 'purchase-return', description: 'Purchase Return & Debit Notes' },
    { key: 'F9', action: 'customer-search', description: 'Customer Search & Customer Master' },
    { key: 'F10', action: 'save-transaction', description: 'Save Transaction / Record' },
    { key: 'F12', action: 'print-bill', description: 'Print Bill / Invoice' },
    { key: 'Ctrl+B', action: 'backup', description: 'Backup SQLite Database' },
    { key: 'Ctrl+F', action: 'global-search', description: 'Focus Global Search' },
    { key: 'Esc', action: 'cancel', description: 'Close Dialog / Cancel Current Action' }
  ];

  function init(handlers) {
    window.addEventListener('keydown', (e) => {
      // 1. Esc key
      if (e.key === 'Escape') {
        // If a modal is open, close it
        const modal = document.querySelector('.retail-modal.open');
        if (modal) {
          e.preventDefault();
          modal.classList.remove('open');
          return;
        }
        if (handlers.onCancel) {
          handlers.onCancel();
        }
        return;
      }

      // 2. Ctrl+F: Global Search
      if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        if (window.GlobalSearch) {
          window.GlobalSearch.focus();
        }
        return;
      }

      // 3. Ctrl+B: Backup Database
      if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        if (handlers.onBackup) {
          handlers.onBackup();
        }
        return;
      }

      // 4. Function keys (F1 - F12)
      switch (e.key) {
        case 'F1':
          e.preventDefault();
          if (handlers.onHelp) handlers.onHelp();
          else showShortcutsModal();
          break;
        case 'F2':
          e.preventDefault();
          if (handlers.onNewBill) handlers.onNewBill();
          break;
        case 'F3':
          e.preventDefault();
          if (handlers.onSearchProduct) handlers.onSearchProduct();
          break;
        case 'F4':
          e.preventDefault();
          if (handlers.onPayment) handlers.onPayment();
          break;
        case 'F5':
          e.preventDefault();
          if (handlers.onRefresh) handlers.onRefresh();
          break;
        case 'F6':
          e.preventDefault();
          if (handlers.onPurchaseEntry) handlers.onPurchaseEntry();
          break;
        case 'F7':
          e.preventDefault();
          if (handlers.onSalesReturn) handlers.onSalesReturn();
          break;
        case 'F8':
          e.preventDefault();
          if (handlers.onPurchaseReturn) handlers.onPurchaseReturn();
          break;
        case 'F9':
          e.preventDefault();
          if (handlers.onCustomerSearch) handlers.onCustomerSearch();
          break;
        case 'F10':
          e.preventDefault();
          if (handlers.onSaveTransaction) handlers.onSaveTransaction();
          break;
        case 'F12':
          e.preventDefault();
          if (handlers.onPrintBill) handlers.onPrintBill();
          break;
      }
    });
  }

  function showShortcutsModal() {
    let modal = document.getElementById('shortcuts-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'shortcuts-modal';
      modal.className = 'retail-modal';
      document.body.appendChild(modal);
    }

    const rowsHtml = SHORTCUTS_TABLE.map(s => `
      <div class="shortcut-row">
        <span class="shortcut-kbd">${s.key}</span>
        <span class="shortcut-desc">${s.description}</span>
      </div>
    `).join('');

    modal.innerHTML = `
      <div class="retail-modal__backdrop"></div>
      <div class="retail-modal__dialog" style="max-width:540px;">
        <div class="retail-modal__header">
          <div style="display:flex;align-items:center;gap:8px;">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="4" width="20" height="16" rx="2" ry="2"/>
              <line x1="6" y1="8" x2="6" y2="8"/><line x1="10" y1="8" x2="10" y2="8"/>
              <line x1="14" y1="8" x2="14" y2="8"/><line x1="18" y1="8" x2="18" y2="8"/>
              <line x1="6" y1="12" x2="18" y2="12"/>
            </svg>
            <strong>Keyboard Shortcuts Reference</strong>
          </div>
          <button class="retail-modal__close" onclick="document.getElementById('shortcuts-modal').classList.remove('open')">&times;</button>
        </div>
        <div class="retail-modal__body" style="padding:16px;">
          <p style="font-size:12px;color:var(--color-text-secondary);margin-bottom:12px;">
            Speed up your workflow using these standard RetailNext function and accelerator keys:
          </p>
          <div class="shortcuts-grid">
            ${rowsHtml}
          </div>
        </div>
        <div class="retail-modal__footer">
          <button class="btn btn--primary" onclick="document.getElementById('shortcuts-modal').classList.remove('open')">Close (Esc)</button>
        </div>
      </div>
    `;

    modal.querySelector('.retail-modal__backdrop').addEventListener('click', () => {
      modal.classList.remove('open');
    });

    modal.classList.add('open');
  }

  return { init, showShortcutsModal, SHORTCUTS_TABLE };
})();

