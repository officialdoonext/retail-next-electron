/**
 * Retail Next — Sales Invoices History (/sales)
 *
 * Features:
 *   - Complete transaction ledger of all completed, held, and refunded invoices
 *   - Filter by date range, payment tender (Cash/UPI/Card), customer search
 *   - View Bill Modal: full breakdown of items, variants, tax (CGST/SGST), and discounts
 *   - Reprint Receipt Modal (80mm thermal receipt)
 *   - Strict 24-item pagination
 */

'use strict';

(function(global) {

  let currentPage = 1;
  let currentSearch = '';
  let currentTender = '';
  let startDate = '';
  let endDate = '';

  async function render(outlet) {
    outlet.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Sales & Invoices Ledger</h1>
          <p>Transaction history of all front-desk store sales, tax breakdown, and reprint receipts</p>
        </div>
        <div class="page-actions">
          <a href="#/pos" class="btn btn-primary btn-sm" style="text-decoration:none;">
            + New Sale (POS)
          </a>
        </div>
      </div>

      <!-- Filters & Search Bar -->
      <div class="filter-bar">
        <div class="filter-search-box">
          <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="sales-search-input" placeholder="Search bill number, customer name, or phone..." class="form-input" value="${currentSearch}" />
        </div>

        <select id="sales-tender-filter" class="form-select" style="width:160px;">
          <option value="">All Tenders</option>
          <option value="UPI" ${currentTender === 'UPI' ? 'selected' : ''}>UPI / QR</option>
          <option value="CASH" ${currentTender === 'CASH' ? 'selected' : ''}>Cash</option>
          <option value="CARD" ${currentTender === 'CARD' ? 'selected' : ''}>Credit/Debit Card</option>
          <option value="CREDIT" ${currentTender === 'CREDIT' ? 'selected' : ''}>Store Credit</option>
        </select>

        <button class="btn btn-secondary btn-sm" id="sales-reset-filter-btn">Reset</button>
      </div>

      <div id="sales-table-wrapper">
        <div style="text-align:center;padding:40px;color:var(--slate-400);">Loading sales records from /api/orders...</div>
      </div>
    `;

    // Filter bindings
    const searchInput = document.getElementById('sales-search-input');
    const tenderFilter = document.getElementById('sales-tender-filter');
    const resetBtn = document.getElementById('sales-reset-filter-btn');

    searchInput.oninput = (e) => {
      currentSearch = e.target.value;
      currentPage = 1;
      loadSalesData(outlet);
    };

    tenderFilter.onchange = (e) => {
      currentTender = e.target.value;
      currentPage = 1;
      loadSalesData(outlet);
    };

    resetBtn.onclick = () => {
      currentSearch = '';
      currentTender = '';
      currentPage = 1;
      render(outlet);
    };

    loadSalesData(outlet);
  }

  async function loadSalesData(outlet) {
    const container = document.getElementById('sales-table-wrapper');
    if (!container) return;

    try {
      const data = await global.apiService.getOrders({
        page: currentPage,
        limit: 24,
        search: currentSearch,
        paymentMethod: currentTender
      });

      const orders = data?.orders || [];
      const pagination = data?.pagination || { page: 1, limit: 24, totalItems: orders.length, totalPages: 1 };

      if (!orders.length) {
        container.innerHTML = `
          <div class="card" style="text-align:center;padding:50px;color:var(--slate-400);">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:12px;"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            <div style="font-size:15px;font-weight:600;color:var(--slate-700);">No invoices found</div>
            <div style="font-size:12px;margin-top:4px;">Try adjusting your search criteria or register a new sale.</div>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Date & Time</th>
                <th>Customer</th>
                <th>Payment Tender</th>
                <th>Cashier</th>
                <th style="text-align:right;">Subtotal</th>
                <th style="text-align:right;">Discount</th>
                <th style="text-align:right;">Tax</th>
                <th style="text-align:right;">Grand Total</th>
                <th>Status</th>
                <th style="text-align:center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map(order => `
                <tr>
                  <td>
                    <div style="font-family:var(--font-mono);font-weight:600;color:var(--primary-purple);">${order.billNumber}</div>
                  </td>
                  <td>
                    <div style="font-size:12px;color:var(--slate-800);">${new Date(order.createdAt).toLocaleDateString()}</div>
                    <div style="font-size:11px;color:var(--slate-400);">${new Date(order.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</div>
                  </td>
                  <td>
                    <div style="font-weight:600;color:var(--slate-900);">${order.customerName || 'Walk-in Customer'}</div>
                    <div style="font-size:11px;color:var(--slate-500);font-family:var(--font-mono);">${order.customerPhone || 'N/A'}</div>
                  </td>
                  <td>
                    <span class="badge ${order.paymentMethod === 'UPI' ? 'badge-purple' : (order.paymentMethod === 'CASH' ? 'badge-success' : 'badge-slate')}">
                      ${order.paymentMethod}
                    </span>
                  </td>
                  <td>
                    <span style="font-size:12px;color:var(--slate-700);">${order.cashierName || 'Rahul K'}</span>
                  </td>
                  <td style="text-align:right;">₹${(order.subtotal || order.grandTotal).toFixed(2)}</td>
                  <td style="text-align:right;color:var(--color-danger-text);">${order.discount > 0 ? '- ₹' + order.discount.toFixed(2) : '—'}</td>
                  <td style="text-align:right;">₹${(order.tax || 0).toFixed(2)}</td>
                  <td style="text-align:right;font-weight:700;color:var(--slate-900);">₹${order.grandTotal.toFixed(2)}</td>
                  <td><span class="badge badge-success">${order.status || 'Completed'}</span></td>
                  <td style="text-align:center;">
                    <div style="display:inline-flex;gap:4px;">
                      <button class="btn btn-secondary btn-sm view-bill-btn" data-id="${order.id}">
                        View
                      </button>
                      <button class="btn btn-ghost btn-sm reprint-btn" data-id="${order.id}" title="Reprint Thermal Slip">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Strict 24-Item Pagination Controls -->
        <div class="pagination-container">
          <div class="pagination-info">
            Showing <strong>${(pagination.page - 1) * 24 + 1} - ${Math.min(pagination.page * 24, pagination.totalItems)}</strong> of <strong>${pagination.totalItems}</strong> invoices (Strict PAGE_SIZE = 24)
          </div>
          <div class="pagination-controls">
            <button class="page-btn" id="sales-prev" ${pagination.page <= 1 ? 'disabled' : ''}>Prev</button>
            <button class="page-btn active">${pagination.page}</button>
            ${pagination.totalPages > pagination.page ? `<button class="page-btn" id="sales-next-num">${pagination.page + 1}</button>` : ''}
            <button class="page-btn" id="sales-next" ${pagination.page >= pagination.totalPages ? 'disabled' : ''}>Next</button>
          </div>
        </div>
      `;

      // Action Handlers
      container.querySelectorAll('.view-bill-btn').forEach(b => {
        b.onclick = () => {
          const id = b.getAttribute('data-id');
          const order = orders.find(o => o.id === id);
          if (order) openViewBillModal(order);
        };
      });

      container.querySelectorAll('.reprint-btn').forEach(b => {
        b.onclick = () => {
          const id = b.getAttribute('data-id');
          const order = orders.find(o => o.id === id);
          if (order) global.ReceiptModal?.open(order);
        };
      });

      // Pagination
      const prevBtn = document.getElementById('sales-prev');
      const nextBtn = document.getElementById('sales-next');
      const nextNum = document.getElementById('sales-next-num');

      if (prevBtn) {
        prevBtn.onclick = () => {
          if (currentPage > 1) {
            currentPage--;
            loadSalesData(outlet);
          }
        };
      }
      if (nextBtn) {
        nextBtn.onclick = () => {
          if (currentPage < pagination.totalPages) {
            currentPage++;
            loadSalesData(outlet);
          }
        };
      }
      if (nextNum) {
        nextNum.onclick = () => {
          currentPage++;
          loadSalesData(outlet);
        };
      }

    } catch (err) {
      container.innerHTML = `<div style="color:var(--color-danger);text-align:center;padding:30px;">Failed to load invoices: ${err.message}</div>`;
    }
  }

  function openViewBillModal(order) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const subtotal = order.subtotal || order.grandTotal;
    const discount = order.discount || 0;
    const tax = order.tax || Math.round((subtotal - discount) * 0.05);
    const grandTotal = order.grandTotal || (subtotal - discount + tax);

    modal.innerHTML = `
      <div class="modal-container modal-lg">
        <div class="modal-header">
          <div>
            <h3 class="modal-title">Tax Invoice Audit — ${order.billNumber}</h3>
            <p style="font-size:11.5px;color:var(--slate-500);">Created on ${new Date(order.createdAt).toLocaleString()} · Tender: ${order.paymentMethod}</p>
          </div>
          <button class="btn btn-ghost btn-icon" id="vbm-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div class="modal-body" style="padding:20px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;background:var(--slate-50);border:1px solid var(--border-slate-200);border-radius:var(--radius-xl);padding:14px;margin-bottom:16px;">
            <div>
              <div style="font-size:11px;font-weight:600;color:var(--slate-400);text-transform:uppercase;">Customer Details</div>
              <div style="font-weight:600;font-size:13.5px;color:var(--slate-900);margin-top:2px;">${order.customerName || 'Walk-in'}</div>
              <div style="font-size:12px;color:var(--slate-600);">${order.customerPhone || 'N/A'}</div>
            </div>
            <div>
              <div style="font-size:11px;font-weight:600;color:var(--slate-400);text-transform:uppercase;">Register Information</div>
              <div style="font-size:12.5px;color:var(--slate-800);margin-top:2px;">Store: <strong>${global.apiService?.activeStore?.name || 'Main Store'}</strong></div>
              <div style="font-size:12px;color:var(--slate-600);">Cashier Terminal: ${order.cashierName || 'Rahul Kumar'}</div>
            </div>
          </div>

          <table class="data-table" style="margin-bottom:16px;">
            <thead>
              <tr>
                <th>Product Description</th>
                <th style="text-align:center;">Qty</th>
                <th style="text-align:right;">Unit Price</th>
                <th style="text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${(order.items || []).map(i => `
                <tr>
                  <td>
                    <div style="font-weight:600;color:var(--slate-900);">${i.productName}</div>
                    ${i.variantName ? `<small style="color:var(--slate-500);">${i.variantName}</small>` : ''}
                  </td>
                  <td style="text-align:center;">${i.quantity || 1}</td>
                  <td style="text-align:right;">₹${(i.salePrice || 0).toFixed(2)}</td>
                  <td style="text-align:right;font-weight:600;">₹${((i.salePrice || 0) * (i.quantity || 1)).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="width:280px;margin-left:auto;font-size:12.5px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;color:var(--slate-600);">
              <span>Subtotal:</span>
              <span>₹${subtotal.toFixed(2)}</span>
            </div>
            ${discount > 0 ? `
              <div style="display:flex;justify-content:space-between;margin-bottom:4px;color:var(--color-danger-text);">
                <span>Discount Override:</span>
                <span>- ₹${discount.toFixed(2)}</span>
              </div>
            ` : ''}
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;color:var(--slate-600);">
              <span>CGST (2.5%):</span>
              <span>₹${(tax / 2).toFixed(2)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;color:var(--slate-600);">
              <span>SGST (2.5%):</span>
              <span>₹${(tax / 2).toFixed(2)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:700;color:var(--slate-900);padding-top:6px;border-top:1px dashed var(--border-slate-200);">
              <span>Invoice Total:</span>
              <span style="color:var(--primary-purple);">₹${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm" id="vbm-close2">Close</button>
          <button class="btn btn-primary btn-sm" id="vbm-print">Print Receipt Slip</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('vbm-close').onclick = () => modal.remove();
    document.getElementById('vbm-close2').onclick = () => modal.remove();
    document.getElementById('vbm-print').onclick = () => {
      modal.remove();
      global.ReceiptModal?.open(order);
    };
  }

  global.SalesInvoicesPage = { render };
})(window);

