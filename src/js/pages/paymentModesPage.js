/**
 * RetailNext — Payment Modes Master Page
 * Submenu: Masters -> Payment Modes -> Cash, UPI, Card, Bank Transfer, Credit
 */

'use strict';

window.PaymentModesPage = (() => {

  const STORAGE_KEY = 'retailnext_payment_modes';

  const DEFAULT_MODES = [
    {
      id: 'PAY-CASH',
      code: 'CASH',
      name: 'Cash Payment',
      type: 'Immediate Cash',
      active: true,
      requiresCustomer: false,
      chargeSurcharge: 0,
      ledgerAccount: 'Cash-in-Hand Account',
      desc: 'Standard cash tender with change return calculation and drawer pulse.'
    },
    {
      id: 'PAY-UPI',
      code: 'UPI',
      name: 'UPI / QR Code',
      type: 'Digital UPI',
      active: true,
      requiresCustomer: false,
      chargeSurcharge: 0,
      ledgerAccount: 'UPI Settlement Account',
      desc: 'Dynamic Scan-and-Pay QR printed on receipt or shown on cashier screen.'
    },
    {
      id: 'PAY-CARD',
      code: 'CARD',
      name: 'Credit / Debit Card',
      type: 'Card Swiper / EDC',
      active: true,
      requiresCustomer: false,
      chargeSurcharge: 0,
      ledgerAccount: 'Card Merchant Account (HDFC/PineLabs)',
      desc: 'POS terminal swipe / tap with authorization approval code recording.'
    },
    {
      id: 'PAY-BANK',
      code: 'BANK',
      name: 'Bank Transfer / NEFT / RTGS',
      type: 'Direct Bank Wire',
      active: true,
      requiresCustomer: true,
      chargeSurcharge: 0,
      ledgerAccount: 'HDFC Current Account',
      desc: 'Direct electronic transfer for wholesale B2B invoices and bulk orders.'
    },
    {
      id: 'PAY-CREDIT',
      code: 'CREDIT',
      name: 'Store Credit / Customer Dues',
      type: 'Credit Receivable',
      active: true,
      requiresCustomer: true,
      chargeSurcharge: 0,
      ledgerAccount: 'Accounts Receivable (Customer Dues)',
      desc: 'Invoice balance added to customer ledger subject to their credit limit.'
    }
  ];

  function getModes() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse payment modes:', e);
    }
    return [...DEFAULT_MODES];
  }

  function saveModes(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function renderPage(outlet) {
    if (!outlet) return;
    outlet.innerHTML = '';
    outlet.className = 'page-container paymodes-page';

    const modes = getModes();

    outlet.innerHTML = `
      <div class="module-header">
        <div>
          <span class="module-header__parent">Masters / Billing</span>
          <h1 class="module-header__title">Payment Tender Modes Configuration</h1>
        </div>
        <div class="module-header__actions">
          <button class="btn btn--primary" id="btn-save-modes">Save Payment Mode Rules</button>
        </div>
      </div>

      <div class="card p-4">
        <p style="font-size:12px;color:var(--color-text-secondary);margin-bottom:16px;">
          Enable or customize checkout payment options available at POS Billing counters and link them to respective financial ledgers.
        </p>

        <div class="table-container">
          <table class="erp-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Payment Tender Mode</th>
                <th>Category</th>
                <th>Linked Accounting Ledger</th>
                <th style="text-align:center;">Customer Mandatory</th>
                <th style="text-align:center;">POS Availability</th>
                <th style="text-align:center;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${modes.map((m, idx) => `
                <tr>
                  <td class="font-mono text-brand font-bold">${m.code}</td>
                  <td>
                    <strong>${m.name}</strong>
                    <div style="font-size:11px;color:var(--color-text-tertiary);">${m.desc}</div>
                  </td>
                  <td><span class="pay-chip pay-chip--card" style="font-size:10px;">${m.type}</span></td>
                  <td class="font-mono text-secondary" style="font-size:12px;">${m.ledgerAccount}</td>
                  <td style="text-align:center;">
                    ${m.requiresCustomer ? '<span class="status-chip status-chip--brand">YES</span>' : '<span class="status-chip status-chip--neutral">NO</span>'}
                  </td>
                  <td style="text-align:center;">
                    <label style="cursor:pointer;">
                      <input type="checkbox" class="chk-mode-active" data-idx="${idx}" ${m.active ? 'checked' : ''} />
                    </label>
                  </td>
                  <td style="text-align:center;">
                    <button class="btn btn--xs btn--outline" onclick="alert('Configuring settings for ${m.name}')">Configure</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    outlet.querySelectorAll('.chk-mode-active').forEach(chk => {
      chk.onchange = () => {
        const idx = Number(chk.getAttribute('data-idx'));
        modes[idx].active = chk.checked;
        saveModes(modes);
      };
    });

    outlet.querySelector('#btn-save-modes').onclick = () => {
      saveModes(modes);
      alert('Payment mode configurations saved successfully!');
    };
  }

  return { renderPage, getModes };
})();

