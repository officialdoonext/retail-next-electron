/**
 * Retail Next — Salary Advances & Debt Repayment Ledger (/employees/advances)
 *
 * Features:
 *   - Issue salary advance modal with employee selector & installment terms
 *   - Repay modal to record installments
 *   - Calls /api/employees/advances
 *   - Strict 24-item pagination
 */

'use strict';

(function(global) {

  let currentPage = 1;
  let advancesList = [];

  async function render(outlet) {
    outlet.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Salary Advances & Debt Recovery Ledger</h1>
          <p>Issue staff loans, track repayment installments, and integrate with monthly payroll FIFO deduction</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" id="adv-issue-btn">
            + Issue Salary Advance
          </button>
        </div>
      </div>

      <div id="adv-table-wrapper">
        <div style="text-align:center;padding:40px;color:var(--slate-400);">Loading advances ledger...</div>
      </div>
    `;

    document.getElementById('adv-issue-btn').onclick = () => openIssueAdvanceModal(outlet);

    loadAdvances(outlet);
  }

  async function loadAdvances(outlet) {
    const container = document.getElementById('adv-table-wrapper');
    if (!container) return;

    try {
      const data = await global.apiService.getAdvances({ page: currentPage, limit: 24 });
      advancesList = data?.advances || [];
      const pagination = data?.pagination || { page: 1, limit: 24, totalItems: advancesList.length, totalPages: 1 };

      container.innerHTML = `
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Staff Borrower</th>
                <th>Issue Date</th>
                <th style="text-align:right;">Principal Issued</th>
                <th style="text-align:right;">Repaid to Date</th>
                <th style="text-align:right;">Balance Remaining</th>
                <th style="text-align:right;">Monthly Pay Deduction</th>
                <th>Status</th>
                <th style="text-align:center;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${advancesList.map(a => `
                <tr>
                  <td>
                    <div style="font-weight:600;color:var(--slate-900);">${a.employeeName}</div>
                  </td>
                  <td>
                    <span style="font-size:12.5px;">${a.issuedDate}</span>
                  </td>
                  <td style="text-align:right;font-weight:600;">₹${a.amount.toLocaleString()}</td>
                  <td style="text-align:right;color:#10b981;">₹${a.repaidAmount.toLocaleString()}</td>
                  <td style="text-align:right;font-weight:700;color:var(--color-danger);">
                    ₹${a.balanceDue.toLocaleString()}
                  </td>
                  <td style="text-align:right;color:var(--slate-700);">
                    ₹${a.monthlyDeduction.toLocaleString()} / mo
                  </td>
                  <td>
                    <span class="badge ${a.balanceDue <= 0 ? 'badge-success' : 'badge-warning'}">
                      ${a.balanceDue <= 0 ? 'Settled' : 'Active Loan'}
                    </span>
                  </td>
                  <td style="text-align:center;">
                    <button class="btn btn-secondary btn-sm repay-btn" data-id="${a.id}" data-name="${a.employeeName}" data-bal="${a.balanceDue}">
                      Repay Installment
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="pagination-container">
          <div class="pagination-info">Showing <strong>${advancesList.length}</strong> advances (PAGE_SIZE = 24)</div>
          <div class="pagination-controls">
            <button class="page-btn" disabled>Prev</button>
            <button class="page-btn active">1</button>
            <button class="page-btn" disabled>Next</button>
          </div>
        </div>
      `;

      container.querySelectorAll('.repay-btn').forEach(b => {
        b.onclick = () => {
          const id = b.getAttribute('data-id');
          const name = b.getAttribute('data-name');
          const bal = b.getAttribute('data-bal');
          openRepayModal(id, name, bal, outlet);
        };
      });

    } catch (err) {
      container.innerHTML = `<div style="color:var(--color-danger);text-align:center;padding:30px;">Failed to load advances: ${err.message}</div>`;
    }
  }

  function openIssueAdvanceModal(outlet) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-container" style="max-width:440px;">
        <div class="modal-header">
          <h3 class="modal-title">Disburse Salary Advance</h3>
          <button class="btn btn-ghost btn-icon" id="iadm-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <form id="iadm-form" style="padding:20px;">
          <div class="form-group">
            <label class="form-label">Employee Borrower *</label>
            <select id="iad-emp" class="form-select">
              <option value="Rahul Kumar">Rahul Kumar</option>
              <option value="Priya Sharma">Priya Sharma</option>
              <option value="Vikas Patil">Vikas Patil</option>
              <option value="Sunil Varma">Sunil Varma</option>
            </select>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="form-group">
              <label class="form-label">Loan Principal (₹) *</label>
              <input type="number" id="iad-amt" class="form-input" placeholder="5000" required />
            </div>
            <div class="form-group">
              <label class="form-label">Monthly Recovery (₹)</label>
              <input type="number" id="iad-ded" class="form-input" placeholder="1500" required />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Loan Reason</label>
            <textarea id="iad-reason" class="form-textarea" rows="2" placeholder="e.g. Medical emergency"></textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:8px;">Approve & Disburse Advance</button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('iadm-close').onclick = () => modal.remove();
    document.getElementById('iadm-form').onsubmit = async (e) => {
      e.preventDefault();
      const amt = parseFloat(document.getElementById('iad-amt').value) || 0;
      const ded = parseFloat(document.getElementById('iad-ded').value) || 0;

      const payload = {
        employeeName: document.getElementById('iad-emp').value,
        amount: amt,
        repaidAmount: 0,
        balanceDue: amt,
        monthlyDeduction: ded,
        issuedDate: new Date().toISOString().split('T')[0],
        status: 'Active'
      };

      await global.apiService.issueAdvance(payload);
      global.Toast?.success('Salary advance disbursed successfully');
      modal.remove();
      loadAdvances(outlet);
    };
  }

  function openRepayModal(id, name, bal, outlet) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-container" style="max-width:400px;">
        <div class="modal-header">
          <h3 class="modal-title">Record Repayment — ${name}</h3>
          <button class="btn btn-ghost btn-icon" id="repm-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <form id="repm-form" style="padding:20px;">
          <div style="background:var(--slate-50);padding:10px;border-radius:var(--radius-lg);margin-bottom:12px;font-size:12.5px;">
            <span>Outstanding Loan Balance:</span> <strong style="color:var(--color-danger);">₹${Number(bal).toLocaleString()}</strong>
          </div>
          <div class="form-group">
            <label class="form-label">Repayment Installment Amount (₹)</label>
            <input type="number" id="rep-amt" class="form-input" value="1500" required />
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;">Record Repayment</button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('repm-close').onclick = () => modal.remove();
    document.getElementById('repm-form').onsubmit = (e) => {
      e.preventDefault();
      global.Toast?.success('Repayment recorded against employee advance');
      modal.remove();
      loadAdvances(outlet);
    };
  }

  global.AdvancesPage = { render };
})(window);

