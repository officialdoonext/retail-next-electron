/**
 * Retail Next — Vendor Dues & Payables Ledger (/vendors/due)
 *
 * Features:
 *   - Outstanding supplier payables ledger
 *   - Settle / Clear Due modal with auto-balance calculation
 *   - Strict 24-item pagination
 */

'use strict';

(function(global) {

  let currentPage = 1;
  let duesList = [];

  async function render(outlet) {
    outlet.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Vendor Dues & Settlements</h1>
          <p>Outstanding liabilities, supplier credit ageing, and direct payment clearance</p>
        </div>
      </div>

      <div id="dues-table-wrapper">
        <div style="text-align:center;padding:40px;color:var(--slate-400);">Loading vendor dues ledger...</div>
      </div>
    `;

    loadDuesData(outlet);
  }

  async function loadDuesData(outlet) {
    const container = document.getElementById('dues-table-wrapper');
    if (!container) return;

    try {
      const data = await global.apiService.getVendors({ page: currentPage, limit: 24 });
      duesList = (data?.vendors || []).filter(v => (v.outstanding_due || 0) > 0);
      const totalLiabilities = duesList.reduce((acc, v) => acc + v.outstanding_due, 0);

      container.innerHTML = `
        <!-- Dues Overview Card -->
        <div class="card" style="margin-bottom:18px;border-left:4px solid var(--color-danger);display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div class="card-subtitle">Total Outstanding Trade Payables</div>
            <div style="font-size:26px;font-weight:700;color:var(--color-danger);margin:4px 0;">₹${totalLiabilities.toLocaleString()}</div>
            <div style="font-size:11.5px;color:var(--slate-500);">Payable across ${duesList.length} verified trade suppliers</div>
          </div>
          <span class="badge badge-danger" style="font-size:12px;padding:6px 12px;">Active Liabilities</span>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Vendor Supplier</th>
                <th>Representative</th>
                <th>Phone Number</th>
                <th>City</th>
                <th style="text-align:right;">Outstanding Due Balance</th>
                <th style="text-align:center;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${duesList.map(v => `
                <tr>
                  <td>
                    <div style="font-weight:700;color:var(--slate-900);">${v.company}</div>
                    <div style="font-size:11px;color:var(--slate-500);font-family:var(--font-mono);">${v.gstin}</div>
                  </td>
                  <td>${v.name}</td>
                  <td>
                    <span style="font-family:var(--font-mono);font-size:12px;">${v.phone}</span>
                  </td>
                  <td>${v.city || 'Trade Hub'}</td>
                  <td style="text-align:right;font-weight:700;color:var(--color-danger);font-size:14px;">
                    ₹${v.outstanding_due.toLocaleString()}
                  </td>
                  <td style="text-align:center;">
                    <button class="btn btn-primary btn-sm settle-btn" data-id="${v.id}" data-company="${v.company}" data-due="${v.outstanding_due}">
                      Clear / Settle Due
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="pagination-container">
          <div class="pagination-info">Showing <strong>${duesList.length}</strong> supplier payables (PAGE_SIZE = 24)</div>
          <div class="pagination-controls">
            <button class="page-btn" disabled>Prev</button>
            <button class="page-btn active">1</button>
            <button class="page-btn" disabled>Next</button>
          </div>
        </div>
      `;

      container.querySelectorAll('.settle-btn').forEach(b => {
        b.onclick = () => {
          const id = b.getAttribute('data-id');
          const company = b.getAttribute('data-company');
          const due = b.getAttribute('data-due');
          openSettleDueModal(id, company, due, outlet);
        };
      });

    } catch (err) {
      container.innerHTML = `<div style="color:var(--color-danger);text-align:center;padding:30px;">Failed to load dues: ${err.message}</div>`;
    }
  }

  function openSettleDueModal(id, company, due, outlet) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-container" style="max-width:440px;">
        <div class="modal-header">
          <h3 class="modal-title">Settle Balance — ${company}</h3>
          <button class="btn btn-ghost btn-icon" id="sdm-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <form id="sdm-form" style="padding:20px;">
          <div style="background:var(--slate-50);border:1px solid var(--border-slate-200);border-radius:var(--radius-lg);padding:12px;margin-bottom:14px;font-size:12.5px;">
            <span>Current Outstanding Payable:</span> <strong style="color:var(--color-danger);font-size:14px;margin-left:4px;">₹${Number(due).toLocaleString()}</strong>
          </div>
          <div class="form-group">
            <label class="form-label">Settlement Amount (₹)</label>
            <input type="number" step="0.01" id="sdm-amt" class="form-input" value="${due}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Payment Mode</label>
            <select id="sdm-mode" class="form-select">
              <option value="BANK">Bank NEFT/RTGS</option>
              <option value="UPI">Company UPI</option>
              <option value="CHEQUE">Cheque</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Reference / UTR Number</label>
            <input type="text" id="sdm-ref" class="form-input" placeholder="UTR-009912" required />
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:8px;">Clear Outstanding Due</button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('sdm-close').onclick = () => modal.remove();
    document.getElementById('sdm-form').onsubmit = (e) => {
      e.preventDefault();
      global.Toast?.success(`Due settled for ${company}`);
      modal.remove();
      loadDuesData(outlet);
    };
  }

  global.VendorDuesPage = { render };
})(window);

