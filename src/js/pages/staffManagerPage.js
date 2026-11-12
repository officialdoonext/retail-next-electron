/**
 * Retail Next — Staff Terminal Accounts & RBAC Permissions (/staff)
 *
 * Features:
 *   - Cashier & staff POS terminal logins, 4-digit MPIN
 *   - Granular RBAC module permission checkboxes
 *   - Calls /api/staff
 *   - Strict 24-item pagination
 */

'use strict';

(function(global) {

  let currentPage = 1;
  let staffList = [];

  async function render(outlet) {
    outlet.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Staff POS Terminals & RBAC Permissions</h1>
          <p>Cashier login accounts, 4-digit POS MPIN credentials, and granular module access control</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" id="staff-add-btn">
            + Add Cashier / Staff
          </button>
        </div>
      </div>

      <div id="staff-table-wrapper">
        <div style="text-align:center;padding:40px;color:var(--slate-400);">Loading staff accounts from /api/staff...</div>
      </div>
    `;

    document.getElementById('staff-add-btn').onclick = () => openStaffModal(null, outlet);

    loadStaffData(outlet);
  }

  async function loadStaffData(outlet) {
    const container = document.getElementById('staff-table-wrapper');
    if (!container) return;

    try {
      const data = await global.apiService.getStaff({ page: currentPage, limit: 24 });
      staffList = data?.staff || [];
      const pagination = data?.pagination || { page: 1, limit: 24, totalItems: staffList.length, totalPages: 1 };

      container.innerHTML = `
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Terminal Login ID</th>
                <th>Staff Name</th>
                <th>Designated Role</th>
                <th>Granted Module Permissions</th>
                <th>Account Status</th>
                <th style="text-align:center;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${staffList.map(s => `
                <tr>
                  <td>
                    <span style="font-family:var(--font-mono);font-weight:700;color:var(--primary-purple);background:var(--primary-purple-light);padding:3px 8px;border-radius:var(--radius-md);">
                      ${s.loginId}
                    </span>
                  </td>
                  <td>
                    <div style="font-weight:600;color:var(--slate-900);">${s.name}</div>
                  </td>
                  <td>
                    <span style="font-size:12.5px;color:var(--slate-700);">${s.role}</span>
                  </td>
                  <td>
                    <div style="display:flex;flex-wrap:wrap;gap:4px;">
                      ${(s.permissions || []).map(p => `
                        <span class="badge badge-slate" style="font-size:10.5px;">${p.toUpperCase()}</span>
                      `).join('')}
                    </div>
                  </td>
                  <td>
                    <span class="badge ${s.status === 'Active' ? 'badge-success' : 'badge-slate'}">${s.status || 'Active'}</span>
                  </td>
                  <td style="text-align:center;">
                    <button class="btn btn-secondary btn-sm edit-stf-btn" data-id="${s.id}">
                      Edit Permissions
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="pagination-container">
          <div class="pagination-info">Showing <strong>${staffList.length}</strong> staff accounts (PAGE_SIZE = 24)</div>
          <div class="pagination-controls">
            <button class="page-btn" disabled>Prev</button>
            <button class="page-btn active">1</button>
            <button class="page-btn" disabled>Next</button>
          </div>
        </div>
      `;

      container.querySelectorAll('.edit-stf-btn').forEach(b => {
        b.onclick = () => {
          const id = b.getAttribute('data-id');
          const s = staffList.find(x => x.id === id);
          if (s) openStaffModal(s, outlet);
        };
      });

    } catch (err) {
      container.innerHTML = `<div style="color:var(--color-danger);text-align:center;padding:30px;">Failed to load staff: ${err.message}</div>`;
    }
  }

  function openStaffModal(existingStaff = null, outlet) {
    const isEdit = !!existingStaff;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const perms = existingStaff?.permissions || ['pos', 'sales', 'returns', 'customers'];

    modal.innerHTML = `
      <div class="modal-container" style="max-width:500px;">
        <div class="modal-header">
          <h3 class="modal-title">${isEdit ? 'Edit Staff Credentials & RBAC' : 'Add Cashier / Staff Account'}</h3>
          <button class="btn btn-ghost btn-icon" id="stfm-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <form id="stfm-form" style="padding:20px;">
          <div class="form-group">
            <label class="form-label">Staff Member Full Name *</label>
            <input type="text" id="stm-name" class="form-input" placeholder="e.g. Rahul Kumar" value="${existingStaff?.name || ''}" required />
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="form-group">
              <label class="form-label">Terminal Login ID *</label>
              <input type="text" id="stm-id" class="form-input" placeholder="CASHIER01" value="${existingStaff?.loginId || ''}" required style="text-transform:uppercase;" />
            </div>
            <div class="form-group">
              <label class="form-label">4-Digit POS MPIN *</label>
              <input type="password" id="stm-mpin" class="form-input" placeholder="••••" maxlength="6" value="1234" required />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Staff Role</label>
            <select id="stm-role" class="form-select">
              <option value="Head Cashier" ${existingStaff?.role === 'Head Cashier' ? 'selected' : ''}>Head Cashier</option>
              <option value="Junior Cashier" ${existingStaff?.role === 'Junior Cashier' ? 'selected' : ''}>Junior Cashier</option>
              <option value="Store Manager" ${existingStaff?.role === 'Store Manager' ? 'selected' : ''}>Store Manager</option>
            </select>
          </div>

          <!-- Granular Module Permissions -->
          <div class="form-group" style="background:var(--slate-50);border:1px solid var(--border-slate-200);border-radius:var(--radius-xl);padding:14px;">
            <label class="form-label" style="margin-bottom:8px;">Granular Module Permissions</label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;color:var(--slate-800);">
              <label style="display:flex;align-items:center;gap:6px;">
                <input type="checkbox" id="perm-pos" ${perms.includes('pos') ? 'checked' : ''} /> POS Terminal Checkout
              </label>
              <label style="display:flex;align-items:center;gap:6px;">
                <input type="checkbox" id="perm-sales" ${perms.includes('sales') ? 'checked' : ''} /> Sales Invoices History
              </label>
              <label style="display:flex;align-items:center;gap:6px;">
                <input type="checkbox" id="perm-returns" ${perms.includes('returns') ? 'checked' : ''} /> Returns & Exchanges
              </label>
              <label style="display:flex;align-items:center;gap:6px;">
                <input type="checkbox" id="perm-customers" ${perms.includes('customers') ? 'checked' : ''} /> Customer Directory
              </label>
              <label style="display:flex;align-items:center;gap:6px;">
                <input type="checkbox" id="perm-stock" ${perms.includes('stock') ? 'checked' : ''} /> Stock Adjustments
              </label>
              <label style="display:flex;align-items:center;gap:6px;">
                <input type="checkbox" id="perm-discounts" ${perms.includes('discounts') ? 'checked' : ''} /> Apply Manual Discounts
              </label>
            </div>
          </div>

          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:6px;">Save Staff Credentials</button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('stfm-close').onclick = () => modal.remove();
    document.getElementById('stfm-form').onsubmit = async (e) => {
      e.preventDefault();
      const granted = [];
      if (document.getElementById('perm-pos').checked) granted.push('pos');
      if (document.getElementById('perm-sales').checked) granted.push('sales');
      if (document.getElementById('perm-returns').checked) granted.push('returns');
      if (document.getElementById('perm-customers').checked) granted.push('customers');
      if (document.getElementById('perm-stock').checked) granted.push('stock');
      if (document.getElementById('perm-discounts').checked) granted.push('discounts');

      const payload = {
        name: document.getElementById('stm-name').value.trim(),
        loginId: document.getElementById('stm-id').value.trim().toUpperCase(),
        role: document.getElementById('stm-role').value,
        permissions: granted,
        status: 'Active'
      };

      await global.apiService.createStaff(payload);
      global.Toast?.success(`Staff ${payload.name} saved!`);
      modal.remove();
      loadStaffData(outlet);
    };
  }

  global.StaffManagerPage = { render };
})(window);

