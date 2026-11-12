/**
 * Retail Next — Customer Returns & Credit Notes (/returns)
 *
 * Features:
 *   - Process customer return requests against bill numbers
 *   - Record Return Modal: reason, item selection, refund calculation, tender (Cash, UPI, Credit Note)
 *   - Return Slip Modal (printable credit note)
 *   - Strict 24-item pagination
 */

'use strict';

(function(global) {

  let currentPage = 1;
  let returnsList = [];

  async function render(outlet) {
    outlet.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Customer Returns & Credit Notes</h1>
          <p>Process return requests against POS bills, issue credit vouchers or instant refunds</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" id="return-record-btn">
            + Record Customer Return
          </button>
        </div>
      </div>

      <div id="returns-table-wrapper">
        <div style="text-align:center;padding:40px;color:var(--slate-400);">Loading return ledger from /api/returns...</div>
      </div>
    `;

    document.getElementById('return-record-btn').onclick = () => openRecordReturnModal(outlet);

    loadReturnsData(outlet);
  }

  async function loadReturnsData(outlet) {
    const container = document.getElementById('returns-table-wrapper');
    if (!container) return;

    try {
      const data = await global.apiService.getReturns({ page: currentPage, limit: 24, type: 'RETURN' });
      returnsList = data?.returns || [];
      const pagination = data?.pagination || { page: 1, limit: 24, totalItems: returnsList.length, totalPages: 1 };

      container.innerHTML = `
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Return No</th>
                <th>Original Invoice</th>
                <th>Customer</th>
                <th>Returned Product</th>
                <th>Reason</th>
                <th style="text-align:right;">Refund Amount</th>
                <th>Refund Mode</th>
                <th style="text-align:center;">Credit Note Slip</th>
              </tr>
            </thead>
            <tbody>
              ${returnsList.map(ret => `
                <tr>
                  <td>
                    <span style="font-family:var(--font-mono);font-weight:600;color:var(--primary-purple);">${ret.returnNumber || 'RET-01'}</span>
                  </td>
                  <td>
                    <span style="font-family:var(--font-mono);color:var(--slate-700);">${ret.orderNumber}</span>
                  </td>
                  <td>
                    <div style="font-weight:600;color:var(--slate-900);">${ret.customerName}</div>
                    <div style="font-size:11px;color:var(--slate-500);">${ret.customerPhone}</div>
                  </td>
                  <td>
                    <span style="font-size:12.5px;">${ret.items?.[0]?.productName || 'Cotton Polo Shirt'}</span>
                  </td>
                  <td>
                    <span style="font-size:12px;color:var(--slate-600);">${ret.reason}</span>
                  </td>
                  <td style="text-align:right;font-weight:700;color:var(--color-danger);">
                    ₹${(ret.refundAmount || 0).toFixed(2)}
                  </td>
                  <td>
                    <span class="badge ${ret.refundMethod === 'CASH' ? 'badge-success' : 'badge-purple'}">${ret.refundMethod}</span>
                  </td>
                  <td style="text-align:center;">
                    <button class="btn btn-secondary btn-sm print-slip-btn" data-id="${ret.id}">
                      Print Credit Slip
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="pagination-container">
          <div class="pagination-info">Showing <strong>${returnsList.length}</strong> return transactions (PAGE_SIZE = 24)</div>
          <div class="pagination-controls">
            <button class="page-btn" disabled>Prev</button>
            <button class="page-btn active">1</button>
            <button class="page-btn" disabled>Next</button>
          </div>
        </div>
      `;

      container.querySelectorAll('.print-slip-btn').forEach(b => {
        b.onclick = () => {
          const id = b.getAttribute('data-id');
          const r = returnsList.find(x => x.id === id);
          if (r) openCreditSlipModal(r);
        };
      });

    } catch (err) {
      container.innerHTML = `<div style="color:var(--color-danger);text-align:center;padding:30px;">Failed to load returns: ${err.message}</div>`;
    }
  }

  function openRecordReturnModal(outlet) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-container" style="max-width:480px;">
        <div class="modal-header">
          <h3 class="modal-title">Record Product Return</h3>
          <button class="btn btn-ghost btn-icon" id="retm-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <form id="retm-form" style="padding:20px;">
          <div class="form-group">
            <label class="form-label">Original Bill / Invoice Number *</label>
            <input type="text" id="ret-bill-no" class="form-input" placeholder="e.g. INV-202611-0042" required />
          </div>
          <div class="form-group">
            <label class="form-label">Customer Name</label>
            <input type="text" id="ret-cust-name" class="form-input" placeholder="Customer Name" required />
          </div>
          <div class="form-group">
            <label class="form-label">Item Being Returned</label>
            <input type="text" id="ret-item-name" class="form-input" placeholder="e.g. Polo Shirt Navy Blue (L)" required />
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="form-group">
              <label class="form-label">Refund Amount (₹)</label>
              <input type="number" step="0.01" id="ret-amt" class="form-input" placeholder="750.00" required />
            </div>
            <div class="form-group">
              <label class="form-label">Refund Mode</label>
              <select id="ret-mode" class="form-select">
                <option value="CREDIT_NOTE">Credit Note Voucher</option>
                <option value="CASH">Hard Cash</option>
                <option value="UPI">UPI Refund</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Reason for Return</label>
            <select id="ret-reason" class="form-select">
              <option value="Size misfit / alteration required">Size misfit / alteration required</option>
              <option value="Fabric defect / stitching damage">Fabric defect / stitching damage</option>
              <option value="Customer preference changed">Customer preference changed</option>
              <option value="Wrong item billed">Wrong item billed</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:8px;">Process Return & Generate Slip</button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('retm-close').onclick = () => modal.remove();
    document.getElementById('retm-form').onsubmit = async (e) => {
      e.preventDefault();
      const payload = {
        type: 'RETURN',
        orderNumber: document.getElementById('ret-bill-no').value.trim(),
        customerName: document.getElementById('ret-cust-name').value.trim(),
        refundAmount: parseFloat(document.getElementById('ret-amt').value) || 0,
        refundMethod: document.getElementById('ret-mode').value,
        reason: document.getElementById('ret-reason').value,
        items: [{ productName: document.getElementById('ret-item-name').value.trim(), quantity: 1 }]
      };

      await global.apiService.createReturn(payload);
      global.Toast?.success('Return recorded successfully');
      modal.remove();
      loadReturnsData(outlet);
    };
  }

  function openCreditSlipModal(ret) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-container" style="max-width:440px;">
        <div class="modal-header">
          <h3 class="modal-title">Credit Note Voucher</h3>
          <button class="btn btn-ghost btn-icon" id="csm-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <div style="border:2px dashed var(--primary-purple);border-radius:var(--radius-xl);padding:20px;text-align:center;background:var(--slate-50);">
            <div style="font-weight:700;font-size:16px;color:var(--slate-900);">RETAIL NEXT STORE CREDIT</div>
            <div style="font-size:11px;color:var(--slate-500);margin-top:2px;">Voucher No: <strong>${ret.returnNumber || 'CN-001'}</strong></div>
            <div style="margin:16px 0;font-size:28px;font-weight:700;color:var(--primary-purple);">₹${(ret.refundAmount || 0).toFixed(2)}</div>
            <div style="font-size:12px;color:var(--slate-700);">Issued to: <strong>${ret.customerName}</strong></div>
            <div style="font-size:11px;color:var(--slate-500);margin-top:4px;">Against Invoice: ${ret.orderNumber}</div>
            <div style="font-size:10px;color:var(--slate-400);margin-top:12px;">Valid for 90 days across all store branches.</div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm" id="csm-close2">Close</button>
          <button class="btn btn-primary btn-sm" onclick="window.print()">Print Slip</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('csm-close').onclick = () => modal.remove();
    document.getElementById('csm-close2').onclick = () => modal.remove();
  }

  global.ReturnsPage = { render };
})(window);

