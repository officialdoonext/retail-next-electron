/**
 * RetailNext — Dynamic Module Page Renderer
 * Renders dedicated workspaces for any submenu item from the 9 desktop menus.
 */

'use strict';

window.ModulePage = (() => {

  function renderPage(outlet, routeId, title, meta = {}) {
    if (!outlet) return;
    outlet.innerHTML = '';
    outlet.className = 'page-container module-view-page';

    const menuInfo = window.findMenuRoute ? window.findMenuRoute(routeId) : null;
    const menuName = (menuInfo && menuInfo.menu) || (meta && meta.menu) || 'RetailNext';
    const parentName = (menuInfo && menuInfo.parent) || (meta && meta.parent) || 'Operations';
    const itemName = title || (menuInfo && menuInfo.item) || routeId;
    const shortcut = (menuInfo && menuInfo.shortcut) || (meta && meta.shortcut) || '';

    outlet.innerHTML = `
      <div class="module-header">
        <div>
          <span class="module-header__parent">${menuName} › ${parentName}</span>
          <h1 class="module-header__title">${itemName} ${shortcut ? `<span class="shortcut-kbd" style="font-size:12px;vertical-align:middle;margin-left:8px;">${shortcut}</span>` : ''}</h1>
        </div>
        <div class="module-header__actions">
          <button class="btn btn--outline" id="mod-btn-export">Export</button>
          <button class="btn btn--primary" id="mod-btn-action">+ New ${itemName} Entry</button>
        </div>
      </div>

      <div class="card p-4">
        <!-- Control strip -->
        <div class="filter-bar">
          <input type="text" class="pos-input" style="max-width:320px;" placeholder="Search records in ${itemName}..." />
          <select class="pos-select" style="max-width:180px;">
            <option value="all">All Records</option>
            <option value="today">Today</option>
            <option value="month">This Month</option>
          </select>
          <div class="text-secondary font-mono" style="margin-left:auto;font-size:12px;">Branch: Main Store</div>
        </div>

        <!-- Sample Records Table -->
        <div class="table-container" style="margin-top:16px;">
          <table class="erp-table">
            <thead>
              <tr>
                <th>Reference #</th>
                <th>Title / Description</th>
                <th>Category / Entity</th>
                <th>Date & Time</th>
                <th style="text-align:right;">Amount / Value</th>
                <th style="text-align:center;">Status</th>
                <th style="text-align:center;">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="font-mono text-brand font-bold">${routeId.toUpperCase().slice(0, 3)}-2026-001</td>
                <td><strong>Primary ${itemName} Transaction</strong></td>
                <td>Standard Operational Record</td>
                <td class="font-mono text-secondary">2026-10-31 16:30</td>
                <td style="text-align:right;" class="font-mono">₹4,250.00</td>
                <td style="text-align:center;"><span class="status-chip status-chip--success">Verified</span></td>
                <td style="text-align:center;"><button class="btn btn--xs btn--outline" onclick="alert('Viewing record details.')">View</button></td>
              </tr>
              <tr>
                <td class="font-mono text-brand font-bold">${routeId.toUpperCase().slice(0, 3)}-2026-002</td>
                <td><strong>Secondary ${itemName} Audit Entry</strong></td>
                <td>Branch Adjustment</td>
                <td class="font-mono text-secondary">2026-10-31 14:15</td>
                <td style="text-align:right;" class="font-mono">₹1,180.00</td>
                <td style="text-align:center;"><span class="status-chip status-chip--warning">Pending</span></td>
                <td style="text-align:center;"><button class="btn btn--xs btn--outline" onclick="alert('Viewing record details.')">View</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    const actionBtn = outlet.querySelector('#mod-btn-action');
    if (actionBtn) {
      actionBtn.addEventListener('click', () => {
        alert(`Opening creation dialog for ${itemName}...`);
      });
    }

    const exportBtn = outlet.querySelector('#mod-btn-export');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        alert(`Exporting ${itemName} records to CSV/Excel...`);
      });
    }
  }

  return { renderPage };
})();

