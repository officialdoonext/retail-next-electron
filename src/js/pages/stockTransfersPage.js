/**
 * Retail Next — Stock Transfers & Inward Manifests (/stock/transfers)
 *
 * Features:
 *   - Movement of goods: Store <-> Store or Warehouse <-> Store
 *   - New Transfer Modal (/api/stock/transfers)
 *   - Lifecycle status updates (Pending -> In-Transit -> Received)
 *   - Manifest Details Modal (delivery challan)
 *   - Strict 24-item pagination
 */

'use strict';

(function(global) {

  let currentPage = 1;
  let transfersList = [];

  async function render(outlet) {
    outlet.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Stock Transfers & Delivery Challans</h1>
          <p>Inter-branch transfers, warehouse inward goods receipts, and transit tracking</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" id="trf-new-btn">
            + New Stock Transfer
          </button>
        </div>
      </div>

      <div id="transfers-table-wrapper">
        <div style="text-align:center;padding:40px;color:var(--slate-400);">Loading stock transfers from /api/stock/transfers...</div>
      </div>
    `;

    document.getElementById('trf-new-btn').onclick = () => openNewTransferModal(outlet);

    loadTransfersData(outlet);
  }

  async function loadTransfersData(outlet) {
    const container = document.getElementById('transfers-table-wrapper');
    if (!container) return;

    try {
      const data = await global.apiService.getTransfers({ page: currentPage, limit: 24 });
      transfersList = data?.transfers || [];
      const pagination = data?.pagination || { page: 1, limit: 24, totalItems: transfersList.length, totalPages: 1 };

      container.innerHTML = `
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Manifest No</th>
                <th>Dispatch Date</th>
                <th>Source Origin</th>
                <th>Destination Target</th>
                <th style="text-align:center;">Items Quantity</th>
                <th>Transfer Status</th>
                <th>Notes / Remarks</th>
                <th style="text-align:center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${transfersList.map(t => {
                let badgeClass = 'badge-slate';
                if (t.status === 'Received') badgeClass = 'badge-success';
                else if (t.status === 'In-Transit') badgeClass = 'badge-purple';
                else if (t.status === 'Pending') badgeClass = 'badge-warning';

                return `
                  <tr>
                    <td>
                      <span style="font-family:var(--font-mono);font-weight:600;color:var(--primary-purple);">${t.transferNumber}</span>
                    </td>
                    <td>
                      <span style="font-size:12.5px;">${t.date}</span>
                    </td>
                    <td>
                      <div style="font-weight:600;color:var(--slate-900);">${t.fromName}</div>
                      <div style="font-size:11px;color:var(--slate-500);">${t.fromType}</div>
                    </td>
                    <td>
                      <div style="font-weight:600;color:var(--slate-900);">${t.toName}</div>
                      <div style="font-size:11px;color:var(--slate-500);">${t.toType}</div>
                    </td>
                    <td style="text-align:center;">
                      <strong style="color:var(--slate-900);">${t.itemsCount} units</strong>
                    </td>
                    <td>
                      <span class="badge ${badgeClass}">${t.status}</span>
                    </td>
                    <td>
                      <span style="font-size:12px;color:var(--slate-600);">${t.notes || 'Replenishment'}</span>
                    </td>
                    <td style="text-align:center;">
                      <div style="display:inline-flex;gap:4px;">
                        <button class="btn btn-secondary btn-sm manifest-view-btn" data-id="${t.id}">
                          Challan
                        </button>
                        ${t.status === 'In-Transit' ? `
                          <button class="btn btn-primary btn-sm status-recv-btn" data-id="${t.id}">
                            Receive Stock
                          </button>
                        ` : ''}
                        ${t.status === 'Pending' ? `
                          <button class="btn btn-secondary btn-sm status-disp-btn" data-id="${t.id}">
                            Dispatch
                          </button>
                        ` : ''}
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div class="pagination-container">
          <div class="pagination-info">Showing <strong>${transfersList.length}</strong> transfers (PAGE_SIZE = 24)</div>
          <div class="pagination-controls">
            <button class="page-btn" disabled>Prev</button>
            <button class="page-btn active">1</button>
            <button class="page-btn" disabled>Next</button>
          </div>
        </div>
      `;

      // Handlers
      container.querySelectorAll('.manifest-view-btn').forEach(b => {
        b.onclick = () => {
          const id = b.getAttribute('data-id');
          const t = transfersList.find(x => x.id === id);
          if (t) openManifestModal(t);
        };
      });

      container.querySelectorAll('.status-recv-btn').forEach(b => {
        b.onclick = async () => {
          const id = b.getAttribute('data-id');
          await global.apiService.updateTransfer(id, 'Received');
          global.Toast?.success('Stock marked Received and added to store balance!');
          loadTransfersData(outlet);
        };
      });

      container.querySelectorAll('.status-disp-btn').forEach(b => {
        b.onclick = async () => {
          const id = b.getAttribute('data-id');
          await global.apiService.updateTransfer(id, 'In-Transit');
          global.Toast?.success('Manifest dispatched (In-Transit)');
          loadTransfersData(outlet);
        };
      });

    } catch (err) {
      container.innerHTML = `<div style="color:var(--color-danger);text-align:center;padding:30px;">Failed to load transfers: ${err.message}</div>`;
    }
  }

  function openNewTransferModal(outlet) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-container modal-lg">
        <div class="modal-header">
          <h3 class="modal-title">Initiate Stock Transfer Manifest</h3>
          <button class="btn btn-ghost btn-icon" id="trfm-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <form id="trfm-form" style="padding:20px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">
            <div class="form-group">
              <label class="form-label">Source Origin *</label>
              <select id="trf-from" class="form-select">
                <option value="Central Godown Bhiwandi">Central Godown Bhiwandi (Warehouse)</option>
                <option value="Main Retail Store Mumbai">Main Retail Store Mumbai (Store)</option>
                <option value="South Mumbai Flagship Store">South Mumbai Flagship Store (Store)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Destination Facility *</label>
              <select id="trf-to" class="form-select">
                <option value="Main Retail Store Mumbai">Main Retail Store Mumbai (Store)</option>
                <option value="South Mumbai Flagship Store">South Mumbai Flagship Store (Store)</option>
                <option value="Thane West Express Mall">Thane West Express Mall (Store)</option>
                <option value="Central Godown Bhiwandi">Central Godown Bhiwandi (Warehouse)</option>
              </select>
            </div>
          </div>

          <div style="background:var(--slate-50);border:1px solid var(--border-slate-200);border-radius:var(--radius-xl);padding:14px;margin-bottom:14px;">
            <div style="font-size:12px;font-weight:700;color:var(--slate-700);margin-bottom:8px;">Transfer Item Line</div>
            <div style="display:grid;grid-template-columns:2fr 1fr;gap:10px;">
              <input type="text" id="trf-pname" class="form-input" placeholder="Product name or SKU..." value="Classic Crewneck T-Shirt" required />
              <input type="number" id="trf-qty" class="form-input" placeholder="Quantity" value="50" required />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Transfer Notes / E-Way Bill Number</label>
            <textarea id="trf-notes" class="form-textarea" rows="2" placeholder="e.g. Weekly replenishment challan #9921"></textarea>
          </div>

          <button type="submit" class="btn btn-primary" style="width:100%;">Create Transfer Challan</button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('trfm-close').onclick = () => modal.remove();
    document.getElementById('trfm-form').onsubmit = async (e) => {
      e.preventDefault();
      const payload = {
        fromName: document.getElementById('trf-from').value,
        toName: document.getElementById('trf-to').value,
        itemsCount: parseInt(document.getElementById('trf-qty').value, 10) || 1,
        notes: document.getElementById('trf-notes').value.trim()
      };

      await global.apiService.createTransfer(payload);
      global.Toast?.success('Stock transfer manifest created');
      modal.remove();
      loadTransfersData(outlet);
    };
  }

  function openManifestModal(t) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-container modal-lg">
        <div class="modal-header">
          <div>
            <h3 class="modal-title">Delivery Challan — ${t.transferNumber}</h3>
            <p style="font-size:11.5px;color:var(--slate-500);">${t.fromName} ➔ ${t.toName}</p>
          </div>
          <button class="btn btn-ghost btn-icon" id="mf-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <div style="border:1px solid var(--border-slate-200);border-radius:var(--radius-xl);padding:16px;background:var(--slate-50);margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span>Status: <strong class="badge badge-purple">${t.status}</strong></span>
              <span>Dispatched on: <strong>${t.date}</strong></span>
            </div>
            <div style="font-size:12px;color:var(--slate-700);">Remarks: ${t.notes || 'Goods in transit via company logistics'}</div>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align:center;">Dispatched Units</th>
                <th style="text-align:center;">Received Units</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Stock Replenishment Batch (General Garments)</td>
                <td style="text-align:center;"><strong>${t.itemsCount}</strong></td>
                <td style="text-align:center;">${t.status === 'Received' ? t.itemsCount : 'Pending'}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm" id="mf-close2">Close</button>
          <button class="btn btn-primary btn-sm" onclick="window.print()">Print Challan Slip</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('mf-close').onclick = () => modal.remove();
    document.getElementById('mf-close2').onclick = () => modal.remove();
  }

  global.StockTransfersPage = { render };
})(window);

