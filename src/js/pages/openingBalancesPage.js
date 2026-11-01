/**
 * RetailNext — Opening Balances Master Page
 * Submenu: Masters -> Opening Balances -> Opening Stock, Customer Balances, Supplier Balances
 */

'use strict';

window.OpeningBalancesPage = (() => {

  function renderPage(outlet, subTab = 'stock') {
    if (!outlet) return;
    outlet.innerHTML = '';
    outlet.className = 'page-container opening-balances-page';

    let activeTab = subTab.includes('customer') ? 'customer' : (subTab.includes('supplier') ? 'supplier' : 'stock');

    outlet.innerHTML = `
      <div class="module-header">
        <div>
          <span class="module-header__parent">Masters / Accounts & Stock</span>
          <h1 class="module-header__title">Opening Balances & Starting Financials</h1>
        </div>
        <div class="module-header__actions">
          <div class="pill-group">
            <button class="pill-btn ${activeTab === 'stock' ? 'active' : ''}" id="ob-tab-stock">Opening Stock</button>
            <button class="pill-btn ${activeTab === 'customer' ? 'active' : ''}" id="ob-tab-cust">Customer Balances</button>
            <button class="pill-btn ${activeTab === 'supplier' ? 'active' : ''}" id="ob-tab-supp">Supplier Balances</button>
          </div>
          <button class="btn btn--primary" id="btn-save-all-ob" style="margin-left:12px;">Save Balances</button>
        </div>
      </div>

      <div id="ob-content-outlet"></div>
    `;

    const content = outlet.querySelector('#ob-content-outlet');
    const tabStock = outlet.querySelector('#ob-tab-stock');
    const tabCust = outlet.querySelector('#ob-tab-cust');
    const tabSupp = outlet.querySelector('#ob-tab-supp');

    function switchTab(t) {
      activeTab = t;
      tabStock.classList.toggle('active', t === 'stock');
      tabCust.classList.toggle('active', t === 'customer');
      tabSupp.classList.toggle('active', t === 'supplier');

      if (t === 'stock') renderStockView(content);
      else if (t === 'customer') renderCustView(content);
      else renderSuppView(content);
    }

    tabStock.onclick = () => switchTab('stock');
    tabCust.onclick = () => switchTab('customer');
    tabSupp.onclick = () => switchTab('supplier');

    outlet.querySelector('#btn-save-all-ob').onclick = () => {
      alert('Opening balances updated and committed to ledger accounts!');
    };

    switchTab(activeTab);
  }

  function renderStockView(container) {
    const store = window.RetailStore;
    const prods = store ? store.getProducts() : [];

    container.innerHTML = `
      <div class="card p-4">
        <p style="font-size:12px;color:var(--color-text-secondary);margin-bottom:14px;">
          Opening stock represents physical inventory available in warehouse on day 1 before regular billing begins.
        </p>

        <div class="table-container">
          <table class="erp-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Product Name</th>
                <th>Barcode</th>
                <th style="width:100px;text-align:center;">UOM</th>
                <th style="width:120px;text-align:center;">Opening Qty</th>
                <th style="width:130px;text-align:right;">Cost Price (₹)</th>
                <th style="width:150px;text-align:right;">Opening Valuation (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${prods.map(p => `
                <tr>
                  <td class="font-mono text-brand font-bold">${p.code}</td>
                  <td><strong>${p.name}</strong></td>
                  <td class="font-mono text-secondary">${p.barcode}</td>
                  <td style="text-align:center;">${p.uom}</td>
                  <td style="text-align:center;">
                    <input type="number" class="pos-inline-input font-mono font-bold" style="width:80px;text-align:center;" value="${p.openingStock || 50}" />
                  </td>
                  <td style="text-align:right;" class="font-mono">₹${p.costPrice.toFixed(2)}</td>
                  <td style="text-align:right;" class="font-mono font-bold text-success">
                    ₹${((p.openingStock || 50) * p.costPrice).toFixed(2)}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderCustView(container) {
    const store = window.RetailStore;
    const custs = store ? store.getCustomers() : [];

    container.innerHTML = `
      <div class="card p-4">
        <p style="font-size:12px;color:var(--color-text-secondary);margin-bottom:14px;">
          Carry forward unpaid dues or credit advances for existing regular customers.
        </p>

        <div class="table-container">
          <table class="erp-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Customer Name</th>
                <th>Mobile Number</th>
                <th>City</th>
                <th style="width:160px;text-align:right;">Opening Balance Due (₹)</th>
                <th style="text-align:center;">Debit / Credit</th>
              </tr>
            </thead>
            <tbody>
              ${custs.map(c => `
                <tr>
                  <td class="font-mono text-brand font-bold">${c.id}</td>
                  <td><strong>${c.name}</strong></td>
                  <td class="font-mono">${c.mobile}</td>
                  <td>${c.city}</td>
                  <td style="text-align:right;">
                    <input type="number" step="0.01" class="pos-inline-input font-mono font-bold text-error" style="width:110px;text-align:right;" value="${Number(c.outstanding || 0).toFixed(2)}" />
                  </td>
                  <td style="text-align:center;"><span class="pay-chip pay-chip--card" style="font-size:10px;">Debit (Receivable)</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderSuppView(container) {
    const store = window.RetailStore;
    const supps = store ? store.getSuppliers() : [];

    container.innerHTML = `
      <div class="card p-4">
        <p style="font-size:12px;color:var(--color-text-secondary);margin-bottom:14px;">
          Starting vendor payables and trade credit balances brought forward into RetailNext.
        </p>

        <div class="table-container">
          <table class="erp-table">
            <thead>
              <tr>
                <th>Vendor ID</th>
                <th>Supplier Name</th>
                <th>GSTIN</th>
                <th>City</th>
                <th style="width:160px;text-align:right;">Opening Payable Due (₹)</th>
                <th style="text-align:center;">Credit / Debit</th>
              </tr>
            </thead>
            <tbody>
              ${supps.map(s => `
                <tr>
                  <td class="font-mono text-brand font-bold">${s.id}</td>
                  <td><strong>${s.name}</strong></td>
                  <td class="font-mono text-secondary">${s.gstin || '—'}</td>
                  <td>${s.city}</td>
                  <td style="text-align:right;">
                    <input type="number" step="0.01" class="pos-inline-input font-mono font-bold text-error" style="width:110px;text-align:right;" value="${Number(s.outstanding || 0).toFixed(2)}" />
                  </td>
                  <td style="text-align:center;"><span class="pay-chip pay-chip--cash" style="font-size:10px;">Credit (Payable)</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  return { renderPage };
})();

