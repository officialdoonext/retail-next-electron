/**
 * Retail Next — Vendor Invoices & Supplier Bills (/vendors/invoices)
 *
 * Features:
 *   - Record vendor bills, track paid amount vs due balance
 *   - Record Payment modal with mode and UTR/cheque reference
 *   - Calls /api/vendors/invoices
 *   - Strict 24-item pagination
 */

'use strict';

(function(global) {

  let currentPage = 1;
  let invoicesList = [];

  async function render(outlet) {
    outlet.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Vendor Invoices & Supplier Payables</h1>
          <p>Track supplier bills, record partial/full disbursements, and settle outstanding liabilities</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" id="vi-add-btn">
            + Record Supplier Invoice
          </button>
        </div>
      </div>

      <div id="vi-table-wrapper">
        <div style="text-align:center;padding:40px;color:var(--slate-400);">Loading vendor invoices...</div>
      </div>
    `;

    document.getElementById('vi-add-btn').onclick = () => openRecordInvoiceModal(outlet);

    loadInvoicesData(outlet);
  }

  async function loadInvoicesData(outlet) {
    const container = document.getElementById('vi-table-wrapper');
    if (!container) return;

    try {
      const data = await global.apiService.getVendorInvoices({ page: currentPage, limit: 24 });
      invoicesList = data?.invoices || [];
      const pagination = data?.pagination || { page: 1, limit: 24, totalItems: invoicesList.length, totalPages: 1 };

      container.innerHTML = `
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Supplier Company</th>
                <th>Billing Date</th>
                <th style="text-align:right;">Billed Amount</th>
                <th style="text-align:right;">Paid to Date</th>
                <th style="text-align:right;">Balance Payable</th>
                <th>Payment Status</th>
                <th style="text-align:center;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${invoicesList.map(inv => `
                <tr>
                  <td>
                    <span style="font-family:var(--font-mono);font-weight:600;color:var(--primary-purple);">${inv.invoiceNumber}</span>
                  </td>
                  <td>
                    <div style="font-weight:600;color:var(--slate-900);">${inv.vendorName}</div>
                  </td>
                  <td>
                    <span style="font-size:12.5px;">${inv.invoiceDate}</span>
                  </td>
                  <td style="text-align:right;font-weight:600;">₹${(inv.totalAmount || 0).toLocaleString()}</td>
                  <td style="text-align:right;color:#10b981;">₹${(inv.paidAmount || 0).toLocaleString()}</td>
                  <td style="text-align:right;font-weight:700;color:${inv.dueAmount > 0 ? 'var(--color-danger)' : 'var(--slate-800)'};">
                    ₹${(inv.dueAmount || 0).toLocaleString()}
                  </td>
                  <td>
                    <span class="badge ${inv.status === 'Paid' ? 'badge-success' : 'badge-warning'}">${inv.status}</span>
                  </td>
                  <td style="text-align:center;">
                    <button class="btn btn-primary btn-sm pay-inv-btn" data-id="${inv.id}" data-due="${inv.dueAmount}" data-inv="${inv.invoiceNumber}">
                      Record Payment
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="pagination-container">
          <div class="pagination-info">Showing <strong>${invoicesList.length}</strong> invoices (PAGE_SIZE = 24)</div>
          <div class="pagination-controls">
            <button class="page-btn" disabled>Prev</button>
            <button class="page-btn active">1</button>
            <button class="page-btn" disabled>Next</button>
          </div>
        </div>
      `;

      container.querySelectorAll('.pay-inv-btn').forEach(b => {
        b.onclick = () => {
          const id = b.getAttribute('data-id');
          const due = b.getAttribute('data-due');
          const invNo = b.getAttribute('data-inv');
          openRecordPaymentModal(id, due, invNo, outlet);
        };
      });

    } catch (err) {
      container.innerHTML = `<div style="color:var(--color-danger);text-align:center;padding:30px;">Failed to load invoices: ${err.message}</div>`;
    }
  }

  function openRecordInvoiceModal(outlet) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-container" style="max-width:480px;">
        <div class="modal-header">
          <h3 class="modal-title">Record Vendor Billing Invoice</h3>
          <button class="btn btn-ghost btn-icon" id="vim-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <form id="vim-form" style="padding:20px;">
          <div class="form-group">
            <label class="form-label">Vendor Invoice Number *</label>
            <input type="text" id="vi-no" class="form-input" placeholder="e.g. INV-APX-9001" required />
          </div>
          <div class="form-group">
            <label class="form-label">Vendor Company *</label>
            <select id="vi-vendor" class="form-select">
              <option value="Apex Apparel Mills Ltd">Apex Apparel Mills Ltd</option>
              <option value="Zenith Footwear Importers">Zenith Footwear Importers</option>
              <option value="Prime Packaging & Thermal Rolls">Prime Packaging & Thermal Rolls</option>
            </select>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="form-group">
              <label class="form-label">Total Invoice Amount (₹)</label>
              <input type="number" step="0.01" id="vi-total" class="form-input" placeholder="50000" required />
            </div>
            <div class="form-group">
              <label class="form-label">Initial Paid Amount (₹)</label>
              <input type="number" step="0.01" id="vi-paid" class="form-input" placeholder="0" value="0" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Invoice Date</label>
            <input type="date" id="vi-date" class="form-input" value="${new Date().toISOString().split('T')[0]}" />
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:8px;">Record Supplier Invoice</button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('vim-close').onclick = () => modal.remove();
    document.getElementById('vim-form').onsubmit = async (e) => {
      e.preventDefault();
      const total = parseFloat(document.getElementById('vi-total').value) || 0;
      const paid = parseFloat(document.getElementById('vi-paid').value) || 0;
      const payload = {
        invoiceNumber: document.getElementById('vi-no').value.trim(),
        vendorName: document.getElementById('vi-vendor').value,
        totalAmount: total,
        paidAmount: paid,
        dueAmount: Math.max(0, total - paid),
        invoiceDate: document.getElementById('vi-date').value,
        status: paid >= total ? 'Paid' : (paid > 0 ? 'Partial' : 'Pending')
      };

      await global.apiService.createVendorInvoice(payload);
      global.Toast?.success('Vendor invoice recorded');
      modal.remove();
      loadInvoicesData(outlet);
    };
  }

  function openRecordPaymentModal(id, due, invNo, outlet) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-container" style="max-width:440px;">
        <div class="modal-header">
          <h3 class="modal-title">Disburse Payment — ${invNo}</h3>
          <button class="btn btn-ghost btn-icon" id="rpm-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <form id="rpm-form" style="padding:20px;">
          <div style="background:var(--slate-50);border:1px solid var(--border-slate-200);border-radius:var(--radius-lg);padding:12px;margin-bottom:14px;font-size:12.5px;">
            <span>Outstanding Due on Bill:</span> <strong style="color:var(--color-danger);font-size:14px;margin-left:4px;">₹${Number(due).toLocaleString()}</strong>
          </div>
          <div class="form-group">
            <label class="form-label">Payment Amount (₹)</label>
            <input type="number" step="0.01" id="rpm-amt" class="form-input" value="${due}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Disbursement Mode</label>
            <select id="rpm-mode" class="form-select">
              <option value="BANK_NEFT">Bank Transfer (NEFT / RTGS)</option>
              <option value="UPI">Company UPI</option>
              <option value="CHEQUE">Bank Cheque</option>
              <option value="CASH">Cash</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">UTR / Cheque Reference Number</label>
            <input type="text" id="rpm-utr" class="form-input" placeholder="e.g. UTR-202611-99881" required />
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:8px;">Confirm Disbursement</button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('rpm-close').onclick = () => modal.remove();
    document.getElementById('rpm-form').onsubmit = async (e) => {
      e.preventDefault();
      await global.apiService.recordVendorPayment({
        invoiceId: id,
        paymentAmount: parseFloat(document.getElementById('rpm-amt').value) || 0,
        paymentMode: document.getElementById('rpm-mode').value,
        utrReference: document.getElementById('rpm-utr').value.trim()
      });
      global.Toast?.success('Payment recorded and vendor balance decremented');
      modal.remove();
      loadInvoicesData(outlet);
    };
  }

  global.VendorInvoicesPage = { render };
})(window);

