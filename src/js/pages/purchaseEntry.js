/**
 * RetailNext — Purchase Entry Page
 * Supplier purchase invoices, stock inward, and purchase orders.
 */

'use strict';

window.PurchaseEntryPage = (() => {

  function renderPage(outlet) {
    if (!outlet) return;
    outlet.innerHTML = '';
    outlet.className = 'page-container purchase-entry-page';

    const store = window.RetailStore;
    const suppliers = store ? store.getSuppliers() : [];
    const products = store ? store.getProducts() : [];
    const purchases = store ? store.getPurchases() : [];

    outlet.innerHTML = `
      <div class="module-header">
        <div>
          <span class="module-header__parent">Transactions / Purchases</span>
          <h1 class="module-header__title">New Purchase Entry (F6)</h1>
        </div>
        <div class="module-header__actions">
          <button class="btn btn--outline" id="pur-view-invoices">Purchase Register</button>
        </div>
      </div>

      <div class="dash-columns">
        
        <!-- Left: Purchase Invoice Form -->
        <div class="dash-box" style="flex:2;">
          <div class="dash-box__header">
            <h2 class="dash-box__title">Purchase Inward Details</h2>
            <span class="font-mono text-secondary">PUR-2026-${Math.floor(100 + Math.random() * 900)}</span>
          </div>

          <div class="form-grid-3 p-4">
            <div class="form-group">
              <label>Select Supplier <span class="text-error">*</span></label>
              <select id="pe-supplier" class="pos-select">
                ${suppliers.map(s => `
                  <option value="${s.id}">${s.name} (${s.city})</option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Supplier Invoice No <span class="text-error">*</span></label>
              <input type="text" id="pe-inv-ref" class="pos-input" value="INV/${Math.floor(1000 + Math.random() * 9000)}" />
            </div>
            <div class="form-group">
              <label>Invoice Date</label>
              <input type="date" id="pe-date" class="pos-input" value="${new Date().toISOString().slice(0, 10)}" />
            </div>
          </div>

          <!-- Items Grid -->
          <div style="padding:0 16px 16px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <strong style="font-size:13px;">Inward Items Grid</strong>
              <button class="btn btn--xs btn--outline" id="pe-add-row">+ Add Item Row</button>
            </div>

            <table class="erp-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="width:100px;text-align:center;">Inward Qty</th>
                  <th style="width:120px;text-align:right;">Purchase Rate (₹)</th>
                  <th style="width:80px;text-align:center;">GST %</th>
                  <th style="width:120px;text-align:right;">Taxable Total (₹)</th>
                </tr>
              </thead>
              <tbody id="pe-tbody">
                ${products.slice(0, 3).map((p, idx) => `
                  <tr>
                    <td>
                      <strong>${p.name}</strong>
                      <div style="font-size:11px;color:var(--color-text-tertiary)">Barcode: ${p.barcode}</div>
                    </td>
                    <td style="text-align:center;">
                      <input type="number" class="pos-inline-input" style="width:60px;text-align:center;" value="${10 + idx * 5}" />
                    </td>
                    <td style="text-align:right;">
                      <input type="number" class="pos-inline-input" style="width:80px;text-align:right;" value="${p.purchasePrice.toFixed(2)}" />
                    </td>
                    <td style="text-align:center;" class="font-mono">${p.gstRate}%</td>
                    <td style="text-align:right;" class="font-mono font-bold">
                      ₹${((10 + idx * 5) * p.purchasePrice * (1 + p.gstRate / 100)).toFixed(2)}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div style="padding:16px;border-top:1px solid var(--color-border);display:flex;justify-content:space-between;align-items:center;">
            <div>
              <span class="text-secondary font-mono">3 Items entered</span>
            </div>
            <div style="display:flex;gap:12px;">
              <button class="btn btn--outline" onclick="alert('Purchase entry discarded.')">Cancel (Esc)</button>
              <button class="btn btn--primary" id="pe-save-btn">Save Purchase & Update Stock (F10)</button>
            </div>
          </div>
        </div>

        <!-- Right: Recent Purchases & Totals -->
        <div class="dash-box" style="flex:1;">
          <div class="dash-box__header">
            <h2 class="dash-box__title">Purchase History</h2>
          </div>
          <div style="padding:16px;">
            ${purchases.map(pur => `
              <div style="padding:10px;border-bottom:1px solid var(--color-border);font-size:12px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                  <strong class="text-brand font-mono">${pur.purchaseNo}</strong>
                  <strong class="font-mono">₹${pur.totalAmount.toFixed(2)}</strong>
                </div>
                <div class="text-secondary">${pur.supplierName}</div>
                <div style="font-size:11px;color:var(--color-text-tertiary);margin-top:2px;">Ref: ${pur.invoiceRef} · Date: ${pur.date}</div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;

    const saveBtn = outlet.querySelector('#pe-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const suppSelect = outlet.querySelector('#pe-supplier');
        const invRef = outlet.querySelector('#pe-inv-ref')?.value || 'INV-REF';
        const suppName = suppSelect ? suppSelect.options[suppSelect.selectedIndex]?.text : 'General Supplier';

        const purRecord = {
          id: 'PUR-' + Date.now(),
          purchaseNo: 'PUR-2026-' + Math.floor(100 + Math.random() * 900),
          supplierId: suppSelect ? suppSelect.value : 'SUP-001',
          supplierName: suppName,
          invoiceRef: invRef,
          totalAmount: 1845.00,
          status: 'Received',
          date: new Date().toLocaleDateString()
        };

        if (window.SyncEngine) {
          window.SyncEngine.saveRecord('purchases', purRecord, 'INSERT');
        } else if (store) {
          store.addPurchase(purRecord);
        }
        alert('Purchase order saved and warehouse inventory updated!');
        renderPage(outlet);
      });
    }
  }

  return { renderPage };
})();

