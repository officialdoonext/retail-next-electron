/**
 * Retail Next — Staff Leaves Management (/employees/leaves)
 *
 * Features:
 *   - Apply Staff Leave modal with auto-calculated duration in days
 *   - Quick Approve / Reject action buttons
 *   - Calls /api/employees/leaves
 *   - Strict 24-item pagination
 */

'use strict';

(function(global) {

  let currentPage = 1;
  let leavesList = [];

  async function render(outlet) {
    outlet.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Staff Leaves Management</h1>
          <p>Apply staff time off, monitor annual leave quotas, and approve/reject leave requests</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" id="leave-apply-btn">
            + Apply Staff Leave
          </button>
        </div>
      </div>

      <div id="leaves-table-wrapper">
        <div style="text-align:center;padding:40px;color:var(--slate-400);">Loading leaves from /api/employees/leaves...</div>
      </div>
    `;

    document.getElementById('leave-apply-btn').onclick = () => openApplyLeaveModal(outlet);

    loadLeaves(outlet);
  }

  async function loadLeaves(outlet) {
    const container = document.getElementById('leaves-table-wrapper');
    if (!container) return;

    try {
      const data = await global.apiService.getLeaves({ page: currentPage, limit: 24 });
      leavesList = data?.leaves || [];
      const pagination = data?.pagination || { page: 1, limit: 24, totalItems: leavesList.length, totalPages: 1 };

      container.innerHTML = `
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Leave Category</th>
                <th>Dates Duration</th>
                <th style="text-align:center;">Days</th>
                <th>Reason / Justification</th>
                <th>Status</th>
                <th style="text-align:center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${leavesList.map(lv => `
                <tr>
                  <td>
                    <div style="font-weight:600;color:var(--slate-900);">${lv.employeeName}</div>
                  </td>
                  <td>
                    <span class="badge badge-purple">${lv.leaveType}</span>
                  </td>
                  <td>
                    <span style="font-size:12.5px;">${lv.startDate} to ${lv.endDate}</span>
                  </td>
                  <td style="text-align:center;">
                    <strong>${lv.days} days</strong>
                  </td>
                  <td>
                    <span style="font-size:12px;color:var(--slate-600);">${lv.reason}</span>
                  </td>
                  <td>
                    <span class="badge ${lv.status === 'Approved' ? 'badge-success' : (lv.status === 'Rejected' ? 'badge-danger' : 'badge-warning')}">
                      ${lv.status}
                    </span>
                  </td>
                  <td style="text-align:center;">
                    ${lv.status === 'Pending' ? `
                      <div style="display:inline-flex;gap:4px;">
                        <button class="btn btn-primary btn-sm app-leave-btn" data-id="${lv.id}">Approve</button>
                        <button class="btn btn-secondary btn-sm rej-leave-btn" data-id="${lv.id}" style="color:var(--color-danger);">Reject</button>
                      </div>
                    ` : '<span style="color:var(--slate-400);font-size:12px;">Processed</span>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="pagination-container">
          <div class="pagination-info">Showing <strong>${leavesList.length}</strong> leave applications (PAGE_SIZE = 24)</div>
          <div class="pagination-controls">
            <button class="page-btn" disabled>Prev</button>
            <button class="page-btn active">1</button>
            <button class="page-btn" disabled>Next</button>
          </div>
        </div>
      `;

      container.querySelectorAll('.app-leave-btn').forEach(b => {
        b.onclick = async () => {
          const id = b.getAttribute('data-id');
          await global.apiService.updateLeave(id, 'Approved');
          global.Toast?.success('Leave request approved');
          loadLeaves(outlet);
        };
      });

      container.querySelectorAll('.rej-leave-btn').forEach(b => {
        b.onclick = async () => {
          const id = b.getAttribute('data-id');
          await global.apiService.updateLeave(id, 'Rejected');
          global.Toast?.info('Leave request rejected');
          loadLeaves(outlet);
        };
      });

    } catch (err) {
      container.innerHTML = `<div style="color:var(--color-danger);text-align:center;padding:30px;">Failed to load leaves: ${err.message}</div>`;
    }
  }

  function openApplyLeaveModal(outlet) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-container" style="max-width:440px;">
        <div class="modal-header">
          <h3 class="modal-title">Apply Staff Leave</h3>
          <button class="btn btn-ghost btn-icon" id="lvm-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <form id="lvm-form" style="padding:20px;">
          <div class="form-group">
            <label class="form-label">Employee *</label>
            <select id="lv-emp" class="form-select">
              <option value="Rahul Kumar">Rahul Kumar</option>
              <option value="Priya Sharma">Priya Sharma</option>
              <option value="Vikas Patil">Vikas Patil</option>
              <option value="Sunil Varma">Sunil Varma</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Leave Type</label>
            <select id="lv-type" class="form-select">
              <option value="Casual Leave">Casual Leave (CL)</option>
              <option value="Sick Leave">Sick Leave (SL)</option>
              <option value="Paid Leave">Paid Annual Leave (PL)</option>
            </select>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="form-group">
              <label class="form-label">Start Date</label>
              <input type="date" id="lv-start" class="form-input" value="${new Date().toISOString().split('T')[0]}" required />
            </div>
            <div class="form-group">
              <label class="form-label">End Date</label>
              <input type="date" id="lv-end" class="form-input" value="${new Date().toISOString().split('T')[0]}" required />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Reason</label>
            <textarea id="lv-reason" class="form-textarea" rows="2" placeholder="e.g. Personal travel" required></textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:8px;">Submit Leave Request</button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('lvm-close').onclick = () => modal.remove();
    document.getElementById('lvm-form').onsubmit = async (e) => {
      e.preventDefault();
      const s = new Date(document.getElementById('lv-start').value);
      const end = new Date(document.getElementById('lv-end').value);
      const diffTime = Math.abs(end - s);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const payload = {
        employeeName: document.getElementById('lv-emp').value,
        leaveType: document.getElementById('lv-type').value,
        startDate: document.getElementById('lv-start').value,
        endDate: document.getElementById('lv-end').value,
        days: diffDays,
        reason: document.getElementById('lv-reason').value.trim(),
        status: 'Pending'
      };

      await global.apiService.applyLeave(payload);
      global.Toast?.success('Leave request submitted');
      modal.remove();
      loadLeaves(outlet);
    };
  }

  global.LeavesPage = { render };
})(window);

