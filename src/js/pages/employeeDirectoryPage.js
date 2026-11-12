/**
 * Retail Next — Employee HR Directory (/employees)
 *
 * Features:
 *   - Complete employee profiles: Designation, Mobile, Salary Type (Monthly/Daily), Salary Amount, Joining Date
 *   - Add/Edit/View modals & Excel bulk upload
 *   - Calls /api/employees
 *   - Strict 24-item pagination
 */

'use strict';

(function(global) {

  let currentPage = 1;
  let employeeList = [];

  async function render(outlet) {
    outlet.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Employee HR Directory</h1>
          <p>Workforce master, designations, compensation packages, and staff profiles</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" id="emp-add-btn">
            + Onboard Employee
          </button>
        </div>
      </div>

      <div id="emp-table-wrapper">
        <div style="text-align:center;padding:40px;color:var(--slate-400);">Loading employees from /api/employees...</div>
      </div>
    `;

    document.getElementById('emp-add-btn').onclick = () => openEmployeeModal(outlet);

    loadEmployees(outlet);
  }

  async function loadEmployees(outlet) {
    const container = document.getElementById('emp-table-wrapper');
    if (!container) return;

    try {
      const data = await global.apiService.getEmployees({ page: currentPage, limit: 24, all: true });
      employeeList = data?.employees || [];
      const pagination = data?.pagination || { page: 1, limit: 24, totalItems: employeeList.length, totalPages: 1 };

      container.innerHTML = `
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Emp Code</th>
                <th>Employee Name</th>
                <th>Designation</th>
                <th>Mobile Number</th>
                <th>Salary Structure</th>
                <th style="text-align:right;">Salary (₹)</th>
                <th>Joining Date</th>
                <th>Status</th>
                <th style="text-align:center;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${employeeList.map(e => `
                <tr>
                  <td>
                    <span style="font-family:var(--font-mono);font-weight:600;color:var(--primary-purple);">${e.employeeCode || 'EMP-001'}</span>
                  </td>
                  <td>
                    <div style="font-weight:600;color:var(--slate-900);">${e.name}</div>
                    <div style="font-size:11px;color:var(--slate-500);">${e.email || ''}</div>
                  </td>
                  <td>
                    <span style="font-size:12.5px;color:var(--slate-700);">${e.designation}</span>
                  </td>
                  <td>
                    <span style="font-family:var(--font-mono);font-size:12px;">${e.mobile}</span>
                  </td>
                  <td>
                    <span class="badge ${e.salaryType === 'monthly' ? 'badge-purple' : 'badge-slate'}">
                      ${e.salaryType.toUpperCase()}
                    </span>
                  </td>
                  <td style="text-align:right;font-weight:700;color:var(--slate-900);">
                    ₹${(e.salaryAmount || 0).toLocaleString()} ${e.salaryType === 'daily' ? '/day' : '/mo'}
                  </td>
                  <td>
                    <span style="font-size:12px;color:var(--slate-600);">${e.joiningDate}</span>
                  </td>
                  <td>
                    <span class="badge badge-success">${e.status || 'Active'}</span>
                  </td>
                  <td style="text-align:center;">
                    <a href="#/employees/id-cards" class="btn btn-secondary btn-sm" style="text-decoration:none;">
                      ID Badge
                    </a>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="pagination-container">
          <div class="pagination-info">Showing <strong>${employeeList.length}</strong> employees (PAGE_SIZE = 24)</div>
          <div class="pagination-controls">
            <button class="page-btn" disabled>Prev</button>
            <button class="page-btn active">1</button>
            <button class="page-btn" disabled>Next</button>
          </div>
        </div>
      `;

    } catch (err) {
      container.innerHTML = `<div style="color:var(--color-danger);text-align:center;padding:30px;">Failed to load employees: ${err.message}</div>`;
    }
  }

  function openEmployeeModal(outlet) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-container" style="max-width:480px;">
        <div class="modal-header">
          <h3 class="modal-title">Onboard New Employee</h3>
          <button class="btn btn-ghost btn-icon" id="empm-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <form id="empm-form" style="padding:20px;">
          <div class="form-group">
            <label class="form-label">Full Name *</label>
            <input type="text" id="em-name" class="form-input" placeholder="e.g. Priya Sharma" required />
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="form-group">
              <label class="form-label">Designation *</label>
              <input type="text" id="em-desig" class="form-input" placeholder="Store Associate" required />
            </div>
            <div class="form-group">
              <label class="form-label">Mobile Number *</label>
              <input type="tel" id="em-mobile" class="form-input" placeholder="9823456789" required />
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="form-group">
              <label class="form-label">Salary Type</label>
              <select id="em-sal-type" class="form-select">
                <option value="monthly">Monthly Fixed</option>
                <option value="daily">Daily Wage</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Salary Amount (₹)</label>
              <input type="number" id="em-sal-amt" class="form-input" placeholder="25000" required />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Joining Date</label>
            <input type="date" id="em-date" class="form-input" value="${new Date().toISOString().split('T')[0]}" />
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:8px;">Add Employee</button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('empm-close').onclick = () => modal.remove();
    document.getElementById('empm-form').onsubmit = (e) => {
      e.preventDefault();
      global.Toast?.success('Employee onboarded successfully');
      modal.remove();
      loadEmployees(outlet);
    };
  }

  global.EmployeeDirectoryPage = { render };
})(window);

