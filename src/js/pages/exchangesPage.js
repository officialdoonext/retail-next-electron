/**
 * Retail Next — Product Exchanges & Counter Adjustments (/returns/exchanges)
 *
 * Features:
 *   - Side-by-side comparison of returned item vs replacement item
 *   - Net difference computation (additional payable or customer refund)
 *   - Calls /api/returns with type=EXCHANGE
 *   - Strict 24-item pagination
 */

'use strict';

(function(global) {

  let currentPage = 1;
  let exchangeList = [];

  async function render(outlet) {
    outlet.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Product Exchanges</h1>
          <p>Process product swaps, size alterations, and compute net price differences</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" id="exchange-new-btn">
            + New Exchange Swap
          </button>
        </div>
      </div>

      <div id="exchange-table-wrapper">
        <div style="text-align:center;padding:40px;color:var(--slate-400);">Loading exchanges from /api/returns...</div>
      </div>
    `;

    document.getElementById('exchange-new-btn').onclick = () => openNewExchangeModal(outlet);

    loadExchangesData(outlet);
  }

  async function loadExchangesData(outlet) {
    const container = document.getElementById('exchange-table-wrapper');
    if (!container) return;

    try {
      const data = await global.apiService.getReturns({ page: currentPage, limit: 24, type: 'EXCHANGE' });
      exchangeList = (data?.returns || []).filter(r => r.type === 'EXCHANGE');
      const pagination = data?.pagination || { page: 1, limit: 24, totalItems: exchangeList.length, totalPages: 1 };

      container.innerHTML = `
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Exchange ID</th>
                <th>Bill Reference</th>
                <th>Customer</th>
                <th>Returned Product</th>
                <th>Replacement Product</th>
                <th style="text-align:right;">Net Difference</th>
                <th>Payment Tender</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${exchangeList.map(ex => `
                <tr>
                  <td>
                    <span style="font-family:var(--font-mono);font-weight:600;color:var(--primary-purple);">${ex.returnNumber || 'EXC-001'}</span>
                  </td>
                  <td>
                    <span style="font-family:var(--font-mono);color:var(--slate-700);">${ex.orderNumber}</span>
                  </td>
                  <td>
                    <div style="font-weight:600;color:var(--slate-900);">${ex.customerName}</div>
                    <div style="font-size:11px;color:var(--slate-500);">${ex.customerPhone || ''}</div>
                  </td>
                  <td>
                    <span class="badge badge-danger" style="font-size:11.5px;">- ${ex.returnedProduct || 'Item L'}</span>
                  </td>
                  <td>
                    <span class="badge badge-success" style="font-size:11.5px;">+ ${ex.replacementProduct || 'Item XL'}</span>
                  </td>
                  <td style="text-align:right;font-weight:700;color:var(--slate-900);">
                    ₹${(ex.netDifference || 0).toFixed(2)}
                  </td>
                  <td>
                    <span class="badge badge-purple">${ex.paymentMethod || 'NONE'}</span>
                  </td>
                  <td>
                    <span style="font-size:12px;color:var(--slate-600);">${ex.date || '2026-11-10'}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="pagination-container">
          <div class="pagination-info">Showing <strong>${exchangeList.length}</strong> exchange transactions (PAGE_SIZE = 24)</div>
          <div class="pagination-controls">
            <button class="page-btn" disabled>Prev</button>
            <button class="page-btn active">1</button>
            <button class="page-btn" disabled>Next</button>
          </div>
        </div>
      `;

    } catch (err) {
      container.innerHTML = `<div style="color:var(--color-danger);text-align:center;padding:30px;">Failed to load exchanges: ${err.message}</div>`;
    }
  }

  function openNewExchangeModal(outlet) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-container" style="max-width:540px;">
        <div class="modal-header">
          <h3 class="modal-title">Record Product Exchange Swap</h3>
          <button class="btn btn-ghost btn-icon" id="exm-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <form id="exm-form" style="padding:20px;">
          <div class="form-group">
            <label class="form-label">Original Bill Number *</label>
            <input type="text" id="ex-bill" class="form-input" placeholder="INV-202611-0042" required />
          </div>
          <div class="form-group">
            <label class="form-label">Customer Name</label>
            <input type="text" id="ex-cust" class="form-input" placeholder="Customer Name" required />
          </div>
          
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;background:var(--slate-50);border:1px solid var(--border-slate-200);border-radius:var(--radius-xl);padding:14px;margin-bottom:14px;">
            <div>
              <label class="form-label" style="color:var(--color-danger);">Returned Item</label>
              <input type="text" id="ex-ret-item" class="form-input" placeholder="e.g. Shirt L" required style="margin-bottom:6px;" />
              <input type="number" step="0.01" id="ex-ret-price" class="form-input" placeholder="Value (₹750)" required />
            </div>
            <div>
              <label class="form-label" style="color:var(--color-success-text);">Replacement Item</label>
              <input type="text" id="ex-rep-item" class="form-input" placeholder="e.g. Shirt XL" required style="margin-bottom:6px;" />
              <input type="number" step="0.01" id="ex-rep-price" class="form-input" placeholder="Value (₹850)" required />
            </div>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:var(--primary-purple-light);border-radius:var(--radius-lg);margin-bottom:14px;">
            <span style="font-weight:600;font-size:13px;color:var(--primary-purple);">Calculated Net Difference:</span>
            <span id="ex-diff-text" style="font-size:16px;font-weight:700;color:var(--primary-purple);">₹0.00</span>
          </div>

          <div class="form-group">
            <label class="form-label">Difference Tender Mode</label>
            <select id="ex-tender" class="form-select">
              <option value="UPI">UPI</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="NONE">No Difference (₹0)</option>
            </select>
          </div>

          <button type="submit" class="btn btn-primary" style="width:100%;">Finalize Exchange Transaction</button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    const retPriceInput = document.getElementById('ex-ret-price');
    const repPriceInput = document.getElementById('ex-rep-price');
    const diffText = document.getElementById('ex-diff-text');

    function updateDiff() {
      const retP = parseFloat(retPriceInput.value) || 0;
      const repP = parseFloat(repPriceInput.value) || 0;
      const diff = repP - retP;
      diffText.textContent = diff >= 0 ? `+ ₹${diff.toFixed(2)} (Customer Pays)` : `- ₹${Math.abs(diff).toFixed(2)} (Refund to Customer)`;
    }

    retPriceInput.oninput = updateDiff;
    repPriceInput.oninput = updateDiff;

    document.getElementById('exm-close').onclick = () => modal.remove();
    document.getElementById('exm-form').onsubmit = async (e) => {
      e.preventDefault();
      const retP = parseFloat(retPriceInput.value) || 0;
      const repP = parseFloat(repPriceInput.value) || 0;
      const diff = repP - retP;

      const payload = {
        type: 'EXCHANGE',
        orderNumber: document.getElementById('ex-bill').value.trim(),
        customerName: document.getElementById('ex-cust').value.trim(),
        returnedProduct: document.getElementById('ex-ret-item').value.trim(),
        replacementProduct: document.getElementById('ex-rep-item').value.trim(),
        netDifference: diff,
        paymentMethod: document.getElementById('ex-tender').value
      };

      await global.apiService.createReturn(payload);
      global.Toast?.success('Exchange swap processed');
      modal.remove();
      loadExchangesData(outlet);
    };
  }

  global.ExchangesPage = { render };
})(window);

