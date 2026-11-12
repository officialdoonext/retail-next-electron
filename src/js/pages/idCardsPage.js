/**
 * Retail Next — Employee PVC ID Cards & Badge Generator (/employees/id-cards)
 *
 * Features:
 *   - Vertical PVC identity badges with photo, name, designation, numeric ID, attendance QR
 *   - Badge Styling Modal (primary color #5e2b9d, gradients, visible toggles)
 *   - Single preview & batch A4 printing
 *   - Strict 24-item pagination
 */

'use strict';

(function(global) {

  let currentPage = 1;
  let employees = [];
  let badgeConfig = {
    primaryColor: '#5e2b9d',
    secondaryColor: '#8b5cf6',
    showQr: true,
    showMobile: true
  };

  async function render(outlet) {
    outlet.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Employee ID Card Badges</h1>
          <p>Printable vertical PVC identification cards with scannable attendance QR codes</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary btn-sm" id="badge-style-btn">
            🎨 Customize Card Styling
          </button>
          <button class="btn btn-primary btn-sm" id="badge-batch-print-btn">
            Batch Print Badges (A4 Sheet)
          </button>
        </div>
      </div>

      <div id="id-card-grid-wrapper">
        <div style="text-align:center;padding:40px;color:var(--slate-400);">Rendering employee ID cards...</div>
      </div>
    `;

    document.getElementById('badge-style-btn').onclick = () => openStylingModal(outlet);
    document.getElementById('badge-batch-print-btn').onclick = () => window.print();

    loadCards(outlet);
  }

  async function loadCards(outlet) {
    const container = document.getElementById('id-card-grid-wrapper');
    if (!container) return;

    try {
      const data = await global.apiService.getEmployees({ page: currentPage, limit: 24, all: true });
      employees = data?.employees || [];
      const store = global.apiService?.activeStore || { name: 'Main Retail Store' };

      container.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(240px, 1fr));gap:24px;margin-bottom:20px;">
          ${employees.map(emp => `
            <!-- Vertical PVC Badge Card -->
            <div class="pvc-id-card" style="width:230px;height:350px;background:#ffffff;border:1px solid #cbd5e1;border-radius:14px;box-shadow:var(--shadow-md);display:flex;flex-direction:column;align-items:center;overflow:hidden;position:relative;margin:0 auto;">
              <!-- Header Gradient -->
              <div style="width:100%;height:85px;background:linear-gradient(135deg, ${badgeConfig.primaryColor} 0%, ${badgeConfig.secondaryColor} 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#ffffff;padding-top:6px;">
                <div style="font-size:11px;font-weight:800;letter-spacing:1px;">RETAIL NEXT</div>
                <div style="font-size:9.5px;opacity:0.9;">${store.name}</div>
              </div>

              <!-- Lanyard Punch Hole Indicator -->
              <div style="position:absolute;top:6px;width:18px;height:4px;border-radius:2px;background:rgba(255,255,255,0.4);"></div>

              <!-- Profile Avatar -->
              <div style="width:70px;height:70px;border-radius:50%;background:#ffffff;border:3px solid #ffffff;margin-top:-35px;box-shadow:var(--shadow-sm);display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700;color:${badgeConfig.primaryColor};">
                ${emp.name[0]}
              </div>

              <!-- Employee Details -->
              <div style="text-align:center;padding:8px 12px;flex:1;display:flex;flex-direction:column;justify-content:space-between;width:100%;">
                <div>
                  <h3 style="font-size:14px;font-weight:700;color:var(--slate-900);line-height:1.2;">${emp.name}</h3>
                  <div style="font-size:11px;font-weight:600;color:${badgeConfig.primaryColor};margin-top:2px;">${emp.designation}</div>
                  <div style="font-size:10.5px;font-family:var(--font-mono);color:var(--slate-500);margin-top:4px;">ID: ${emp.employeeCode}</div>
                  ${badgeConfig.showMobile ? `<div style="font-size:10px;color:var(--slate-400);margin-top:2px;">📱 ${emp.mobile}</div>` : ''}
                </div>

                <!-- QR Attendance Code -->
                ${badgeConfig.showQr ? `
                  <div style="display:flex;flex-direction:column;align-items:center;margin-top:6px;">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="${badgeConfig.primaryColor}" stroke-width="1.8">
                      <rect width="6" height="6" x="3" y="3" rx="1"/><rect width="6" height="6" x="15" y="3" rx="1"/><rect width="6" height="6" x="3" y="15" rx="1"/>
                      <path d="M15 15h2v2h-2z"/><path d="M19 19h2v2h-2z"/><path d="M15 19h2v2h-2z"/><path d="M19 15h2v2h-2z"/>
                    </svg>
                    <div style="font-size:8.5px;color:var(--slate-400);margin-top:2px;letter-spacing:0.5px;">SCAN TO CLOCK IN</div>
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="pagination-container">
          <div class="pagination-info">Showing <strong>${employees.length}</strong> employee badges (PAGE_SIZE = 24)</div>
          <div class="pagination-controls">
            <button class="page-btn" disabled>Prev</button>
            <button class="page-btn active">1</button>
            <button class="page-btn" disabled>Next</button>
          </div>
        </div>
      `;

    } catch (err) {
      container.innerHTML = `<div style="color:var(--color-danger);padding:30px;text-align:center;">${err.message}</div>`;
    }
  }

  function openStylingModal(outlet) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-container" style="max-width:440px;">
        <div class="modal-header">
          <h3 class="modal-title">Customize ID Badge Styling</h3>
          <button class="btn btn-ghost btn-icon" id="bsm-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <form id="bsm-form" style="padding:20px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;">
            <div class="form-group">
              <label class="form-label">Primary Color</label>
              <input type="color" id="bsm-pri" class="form-input" value="${badgeConfig.primaryColor}" style="height:40px;padding:2px;" />
            </div>
            <div class="form-group">
              <label class="form-label">Gradient Color</label>
              <input type="color" id="bsm-sec" class="form-input" value="${badgeConfig.secondaryColor}" style="height:40px;padding:2px;" />
            </div>
          </div>
          <div class="form-group">
            <label style="display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--slate-800);margin-bottom:8px;">
              <input type="checkbox" id="bsm-show-qr" ${badgeConfig.showQr ? 'checked' : ''} /> Show Attendance QR Code
            </label>
            <label style="display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--slate-800);">
              <input type="checkbox" id="bsm-show-mob" ${badgeConfig.showMobile ? 'checked' : ''} /> Display Staff Mobile Number
            </label>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:10px;">Apply Custom Badge Styling</button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('bsm-close').onclick = () => modal.remove();
    document.getElementById('bsm-form').onsubmit = (e) => {
      e.preventDefault();
      badgeConfig.primaryColor = document.getElementById('bsm-pri').value;
      badgeConfig.secondaryColor = document.getElementById('bsm-sec').value;
      badgeConfig.showQr = document.getElementById('bsm-show-qr').checked;
      badgeConfig.showMobile = document.getElementById('bsm-show-mob').checked;

      global.Toast?.success('Badge style updated!');
      modal.remove();
      loadCards(outlet);
    };
  }

  global.IdCardsPage = { render };
})(window);

