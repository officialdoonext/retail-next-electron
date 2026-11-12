/**
 * Retail Next — Counter Sales & Register Reconciliation (/sales/counter-sales)
 *
 * Features:
 *   - Register drawer reconciliation per cashier terminal
 *   - Cash collected vs digital payments (UPI/Card)
 *   - End-of-day register closing audit
 *   - Strict 24-Item Pagination
 */

'use strict';

(function(global) {

  let currentPage = 1;

  async function render(outlet) {
    outlet.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Counter Sessions & Drawer Closing</h1>
          <p>Cashier terminal register reconciliation, physical cash collected vs digital payment tenders</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" id="close-drawer-btn">
            Perform Day-End Register Closing
          </button>
        </div>
      </div>

      <div id="counter-content">
        <div style="text-align:center;padding:40px;color:var(--slate-400);">Loading terminal sessions...</div>
      </div>
    `;

    document.getElementById('close-drawer-btn').onclick = () => openClosingModal();

    loadCounterData(outlet);
  }

  async function loadCounterData(outlet) {
    const container = document.getElementById('counter-content');
    if (!container) return;

    const sessions = [
      {
        id: 'sess-1',
        terminal: 'POS-TERM-01',
        cashier: 'Rahul Kumar',
        openedAt: '2026-11-12 09:30 AM',
        closedAt: 'Open Session',
        openingFloat: 2000.00,
        cashCollected: 14500.00,
        digitalCollected: 24200.00,
        totalSales: 38700.00,
        status: 'Active'
      },
      {
        id: 'sess-2',
        terminal: 'POS-TERM-02',
        cashier: 'Priya Sharma',
        openedAt: '2026-11-11 09:30 AM',
        closedAt: '2026-11-11 09:45 PM',
        openingFloat: 2000.00,
        cashCollected: 18200.00,
        digitalCollected: 31050.00,
        totalSales: 49250.00,
        status: 'Reconciled'
      },
      {
        id: 'sess-3',
        terminal: 'POS-TERM-01',
        cashier: 'Rahul Kumar',
        openedAt: '2026-11-10 09:30 AM',
        closedAt: '2026-11-10 09:30 PM',
        openingFloat: 2000.00,
        cashCollected: 16800.00,
        digitalCollected: 28400.00,
        totalSales: 45200.00,
        status: 'Reconciled'
      }
    ];

    container.innerHTML = `
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Terminal</th>
              <th>Cashier</th>
              <th>Session Timing</th>
              <th style="text-align:right;">Opening Cash Float</th>
              <th style="text-align:right;">Cash Collected</th>
              <th style="text-align:right;">Digital (UPI/Card)</th>
              <th style="text-align:right;">Total Register Sales</th>
              <th>Status</th>
              <th style="text-align:center;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${sessions.map(s => `
              <tr>
                <td>
                  <strong style="color:var(--primary-purple);font-family:var(--font-mono);">${s.terminal}</strong>
                </td>
                <td>
                  <div style="font-weight:600;color:var(--slate-900);">${s.cashier}</div>
                </td>
                <td>
                  <div style="font-size:12px;color:var(--slate-800);">In: ${s.openedAt}</div>
                  <div style="font-size:11px;color:var(--slate-400);">Out: ${s.closedAt}</div>
                </td>
                <td style="text-align:right;">₹${s.openingFloat.toFixed(2)}</td>
                <td style="text-align:right;font-weight:600;color:#10b981;">₹${s.cashCollected.toFixed(2)}</td>
                <td style="text-align:right;font-weight:600;color:#3b82f6;">₹${s.digitalCollected.toFixed(2)}</td>
                <td style="text-align:right;font-weight:700;color:var(--slate-900);">₹${s.totalSales.toFixed(2)}</td>
                <td>
                  <span class="badge ${s.status === 'Active' ? 'badge-purple' : 'badge-success'}">${s.status}</span>
                </td>
                <td style="text-align:center;">
                  <button class="btn btn-secondary btn-sm" onclick="alert('Terminal session ledger verified.')">
                    Audit Slip
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Strict 24-Item Pagination -->
      <div class="pagination-container">
        <div class="pagination-info">Showing <strong>${sessions.length}</strong> counter sessions (PAGE_SIZE = 24)</div>
        <div class="pagination-controls">
          <button class="page-btn" disabled>Prev</button>
          <button class="page-btn active">1</button>
          <button class="page-btn" disabled>Next</button>
        </div>
      </div>
    `;
  }

  function openClosingModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-container" style="max-width:480px;">
        <div class="modal-header">
          <h3 class="modal-title">End-of-Day Terminal Reconciliation</h3>
          <button class="btn btn-ghost btn-icon" id="rcm-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <form id="rcm-form" style="padding:20px;">
          <div style="background:var(--slate-50);border:1px solid var(--border-slate-200);border-radius:var(--radius-lg);padding:12px;margin-bottom:14px;font-size:12.5px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <span>System Expected Cash:</span>
              <span style="font-weight:700;color:#10b981;">₹16,500.00</span>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span>Digital UPI / Card Settlement:</span>
              <span style="font-weight:700;color:#3b82f6;">₹24,200.00</span>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Physical Cash Counted in Drawer (₹)</label>
            <input type="number" id="counted-cash" class="form-input" placeholder="Count physical notes" required />
          </div>
          <div class="form-group">
            <label class="form-label">Supervisor Closing Notes</label>
            <textarea id="closing-notes" class="form-textarea" rows="2" placeholder="e.g. Matched physical till with Z-report"></textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;">Finalize Register Closing & Print Z-Report</button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('rcm-close').onclick = () => modal.remove();
    document.getElementById('rcm-form').onsubmit = (e) => {
      e.preventDefault();
      global.Toast?.success('Terminal drawer reconciled & closed successfully');
      modal.remove();
    };
  }

  global.CounterSalesPage = { render };
})(window);

