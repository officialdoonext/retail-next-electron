/**
 * Retail Next — Employee Attendance & Muster Roll (/employees/attendance)
 *
 * Features:
 *   - Daily muster roll with date picker
 *   - One-click status toggles (Present, Half Day, Absent, Leave)
 *   - "Mark All Present" shortcut
 *   - Saves muster to POST /api/employees/attendance
 *   - Camera QR scan link launcher
 */

'use strict';

(function(global) {

  let selectedDate = new Date().toISOString().split('T')[0];
  let attendanceState = {};

  async function render(outlet) {
    outlet.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Attendance & Daily Muster Roll</h1>
          <p>Mark daily staff check-ins, record shifts, manage leaves, and camera QR attendance</p>
        </div>
        <div class="page-actions">
          <input type="date" id="att-date-picker" class="form-input" value="${selectedDate}" style="width:160px;padding:6px 10px;" />
          <button class="btn btn-secondary btn-sm" id="att-all-present-btn">
            ✓ Mark All Present
          </button>
          <button class="btn btn-secondary btn-sm" id="att-qr-scan-btn">
            📷 Camera QR Scan
          </button>
          <button class="btn btn-primary btn-sm" id="att-save-btn">
            Save Attendance Register
          </button>
        </div>
      </div>

      <div id="att-table-wrapper">
        <div style="text-align:center;padding:40px;color:var(--slate-400);">Loading muster roll...</div>
      </div>
    `;

    document.getElementById('att-date-picker').onchange = (e) => {
      selectedDate = e.target.value;
      loadAttendance(outlet);
    };

    document.getElementById('att-all-present-btn').onclick = () => {
      Object.keys(attendanceState).forEach(k => {
        attendanceState[k] = { status: 'Present', checkIn: '09:30 AM' };
      });
      global.Toast?.success('All active employees marked Present');
      renderMusterTable(outlet);
    };

    document.getElementById('att-qr-scan-btn').onclick = () => {
      openCameraQrModal();
    };

    document.getElementById('att-save-btn').onclick = async () => {
      await global.apiService.saveAttendance({
        date: selectedDate,
        records: attendanceState
      });
      global.Toast?.success(`Saved attendance register for ${selectedDate}`);
    };

    loadAttendance(outlet);
  }

  async function loadAttendance(outlet) {
    const container = document.getElementById('att-table-wrapper');
    if (!container) return;

    try {
      const empData = await global.apiService.getEmployees({ page: 1, limit: 24, all: true });
      const attData = await global.apiService.getAttendance(selectedDate);

      const employees = empData?.employees || [];
      const records = attData?.records || {};

      attendanceState = {};
      employees.forEach(e => {
        attendanceState[e.id] = records[e.id] || { status: 'Present', checkIn: '09:30 AM' };
      });

      renderMusterTable(outlet, employees);
    } catch (err) {
      container.innerHTML = `<div style="color:var(--color-danger);padding:30px;text-align:center;">${err.message}</div>`;
    }
  }

  function renderMusterTable(outlet, employeesList = null) {
    const container = document.getElementById('att-table-wrapper');
    if (!container) return;

    const employees = employeesList || [
      { id: 'emp-1', employeeCode: 'EMP-001', name: 'Rahul Kumar', designation: 'Head Cashier' },
      { id: 'emp-2', employeeCode: 'EMP-002', name: 'Priya Sharma', designation: 'Store Associate' },
      { id: 'emp-3', employeeCode: 'EMP-003', name: 'Vikas Patil', designation: 'Inventory Manager' },
      { id: 'emp-4', employeeCode: 'EMP-004', name: 'Sunil Varma', designation: 'Sales Executive' }
    ];

    container.innerHTML = `
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Employee Code</th>
              <th>Full Name</th>
              <th>Designation</th>
              <th>Check-in Time</th>
              <th style="text-align:center;">Attendance Status Selector</th>
            </tr>
          </thead>
          <tbody>
            ${employees.map(emp => {
              const current = attendanceState[emp.id] || { status: 'Present', checkIn: '09:30 AM' };
              return `
                <tr>
                  <td>
                    <span style="font-family:var(--font-mono);font-weight:600;color:var(--primary-purple);">${emp.employeeCode}</span>
                  </td>
                  <td>
                    <div style="font-weight:600;color:var(--slate-900);">${emp.name}</div>
                  </td>
                  <td>
                    <span style="font-size:12px;color:var(--slate-600);">${emp.designation}</span>
                  </td>
                  <td>
                    <span style="font-family:var(--font-mono);font-size:12px;">${current.checkIn || '09:30 AM'}</span>
                  </td>
                  <td style="text-align:center;">
                    <div style="display:inline-flex;gap:6px;">
                      <button class="btn btn-sm att-status-btn ${current.status === 'Present' ? 'btn-primary' : 'btn-secondary'}" data-id="${emp.id}" data-status="Present">Present</button>
                      <button class="btn btn-sm att-status-btn ${current.status === 'Half Day' ? 'btn-primary' : 'btn-secondary'}" data-id="${emp.id}" data-status="Half Day">Half Day</button>
                      <button class="btn btn-sm att-status-btn ${current.status === 'Absent' ? 'btn-danger' : 'btn-secondary'}" data-id="${emp.id}" data-status="Absent">Absent</button>
                      <button class="btn btn-sm att-status-btn ${current.status === 'Leave' ? 'btn-primary' : 'btn-secondary'}" data-id="${emp.id}" data-status="Leave">Leave</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    container.querySelectorAll('.att-status-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const st = btn.getAttribute('data-status');
        attendanceState[id] = { ...attendanceState[id], status: st };
        renderMusterTable(outlet, employees);
      };
    });
  }

  function openCameraQrModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-container" style="max-width:440px;">
        <div class="modal-header">
          <h3 class="modal-title">QR Scanner Attendance Check-In</h3>
          <button class="btn btn-ghost btn-icon" id="qrm-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div class="modal-body" style="padding:24px;text-align:center;">
          <div style="width:240px;height:240px;margin:0 auto;border:2px dashed var(--primary-purple);border-radius:var(--radius-xl);display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--slate-50);">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary-purple)" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h.01"/><path d="M17 7h.01"/><path d="M7 17h.01"/><path d="M17 17h.01"/></svg>
            <div style="font-size:12px;color:var(--slate-600);margin-top:10px;">Camera QR Viewfinder Active</div>
            <div style="font-size:11px;color:var(--slate-400);">Hold employee badge up to lens</div>
          </div>
          <button class="btn btn-primary" id="mock-scan-btn" style="margin-top:16px;">
            Simulate Badge Scan (EMP-001)
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('qrm-close').onclick = () => modal.remove();
    document.getElementById('mock-scan-btn').onclick = () => {
      global.Toast?.success('Badge EMP-001 Verified: Rahul Kumar marked Present!');
      modal.remove();
    };
  }

  global.AttendancePage = { render };
})(window);

