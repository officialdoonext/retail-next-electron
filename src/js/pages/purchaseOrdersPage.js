/**
 * Retail Next — Vendor Purchase Orders (/vendors/orders)
 *
 * Features:
 *   - Create PO modal with dynamic vendor selector & multi-item inputs
 *   - Status lifecycle: Pending -> Approved -> Shipped -> Received -> Cancelled
 *   - Calls /api/vendors/orders
 *   - Strict 24-item pagination
 */

'use strict';

(function(global) {

  let currentPage = 1;
  let poList = [];

  async function render(outlet) {
    outlet.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Purchase Orders & Inward Procurement</h1>
          <p>Issue supplier POs, track factory shipments, and manage inward delivery lifecycle</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" id="po-create-btn">
            + Generate Purchase Order
          </button>
        </div>
      </div>

      <div id="po-table-wrapper">
        <div style="text-align:center;padding:40px;color:var(--slate-400);">Loading purchase orders...</div>
      </div>
    `;

    document.getElementById('po-create-btn').onclick = () => openCreatePoModal(outlet);

    loadPoData(outlet);
  }

  async function loadPoData(outlet) {
    const container = document.getElementById('po-table-wrapper');
    if (!container) return;

    try {
      const data = await global.apiService.getPurchaseOrders({ page: currentPage, limit: 24 });
      poList = data?.orders || [];
      const pagination = data?.pagination || { page: 1, limit: 24, totalItems: poList.length, totalPages: 1 };

      container.innerHTML = `
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Supplier Company</th>
                <th>Order Date</th>
                <th style="text-align:center;">Items Quantity</th>
                <th style="text-align:right;">Total Order Value</th>
                <th>Procurement Status</th>
                <th style="text-align:center;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${poList.map(po => {
                let badgeClass = 'badge-slate';
                if (po.status === 'Received') badgeClass = 'badge-success';
                else if (po.status === 'Shipped') badgeClass = 'badge-purple';
                else if (po.status === 'Approved') badgeClass = 'badge-info';
                else if (po.status === 'Pending') badgeClass = 'badge-warning';

                return `
                  <tr>
                    <td>
                      <span style="font-family:var(--font-mono);font-weight:600;color:var(--primary-purple);">${po.orderNumber}</span>
                    </td>
                    <td>
                      <div style="font-weight:600;color:var(--slate-900);">${po.vendorName}</div>
                    </td>
                    <td>
                      <span style="font-size:12.5px;">${po.orderDate}</span>
                    </td>
                    <td style="text-align:center;">
                      <strong>${po.itemsCount} units</strong>
                    </td>
                    <td style="text-align:right;font-weight:700;color:var(--slate-900);">
                      ₹${(po.totalAmount || 0).toLocaleString()}
                    </td>
                    <td>
                      <span class="badge ${badgeClass}">${po.status}</span>
                    </td>
                    <td style="text-align:center;">
                      <button class="btn btn-secondary btn-sm" onclick="alert('Viewing Purchase Order manifest #'+'${po.orderNumber}')">
                        View PO
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div class="pagination-container">
          <div class="pagination-info">Showing <strong>${poList.length}</strong> purchase orders (PAGE_SIZE = 24)</div>
          <div class="pagination-controls">
            <button class="page-btn" disabled>Prev</button>
            <button class="page-btn active">1</button>
            <button class="page-btn" disabled>Next</button>
          </div>
        </div>
      `;

    } catch (err) {
      container.innerHTML = `<div style="color:var(--color-danger);text-align:center;padding:30px;">Failed to load purchase orders: ${err.message}</div>`;
    }
  }

  function openCreatePoModal(outlet) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-container modal-lg">
        <div class="modal-header">
          <h3 class="modal-title">Generate Supplier Purchase Order</h3>
          <button class="btn btn-ghost btn-icon" id="pom-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <form id="pom-form" style="padding:20px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">
            <div class="form-group">
              <label class="form-label">Vendor Supplier *</label>
              <select id="pom-vendor" class="form-select">
                <option value="Apex Apparel Mills Ltd">Apex Apparel Mills Ltd (Surat)</option>
                <option value="Zenith Footwear Importers">Zenith Footwear Importers (Agra)</option>
                <option value="Prime Packaging & Thermal Rolls">Prime Packaging & Thermal Rolls (Mumbai)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Expected Delivery Target Date</label>
              <input type="date" id="pom-date" class="form-input" value="2026-11-25" />
            </div>
          </div>

          <div style="background:var(--slate-50);border:1px solid var(--border-slate-200);border-radius:var(--radius-xl);padding:14px;margin-bottom:14px;">
            <div style="font-size:12px;font-weight:700;color:var(--slate-700);margin-bottom:8px;">Line Item Requirements</div>
            <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:10px;">
              <input type="text" id="pom-item" class="form-input" placeholder="Item description / fabric" value="Cotton Polo T-Shirt Fabrics" required />
              <input type="number" id="pom-qty" class="form-input" placeholder="Quantity" value="250" required />
              <input type="number" id="pom-rate" class="form-input" placeholder="Unit Rate (₹)" value="320" required />
            </div>
          </div>

          <button type="submit" class="btn btn-primary" style="width:100%;">Create PO & Dispatch to Supplier</button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('pom-close').onclick = () => modal.remove();
    document.getElementById('pom-form').onsubmit = async (e) => {
      e.preventDefault();
      const qty = parseInt(document.getElementById('pom-qty').value, 10) || 1;
      const rate = parseFloat(document.getElementById('pom-rate').value) || 1;
      const payload = {
        vendorName: document.getElementById('pom-vendor').value,
        orderDate: document.getElementById('pom-date').value,
        status: 'Pending',
        itemsCount: qty,
        totalAmount: qty * rate
      };

      await global.apiService.createPurchaseOrder(payload);
      global.Toast?.success('Purchase order created successfully');
      modal.remove();
      loadPoData(outlet);
    };
  }

  global.PurchaseOrdersPage = { render };
})(window);

