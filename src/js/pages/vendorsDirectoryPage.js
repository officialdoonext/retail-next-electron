/**
 * Retail Next — Vendors & Suppliers Directory (/vendors)
 *
 * Features:
 *   - Supplier directory: Contact person, company, GSTIN, phone, address, outstanding dues
 *   - Add/Edit Vendor modal
 *   - Calls /api/vendors
 *   - Strict 24-item pagination
 */

'use strict';

(function(global) {

  let currentPage = 1;
  let currentSearch = '';
  let vendorsList = [];

  async function render(outlet) {
    outlet.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Vendors & Suppliers Directory</h1>
          <p>Wholesale manufacturers, trade distributors, contact directory, and payables ledger</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" id="vnd-add-btn">
            + Register Vendor
          </button>
        </div>
      </div>

      <div class="filter-bar">
        <div class="filter-search-box">
          <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="vnd-search-input" placeholder="Search by vendor company, contact, or GSTIN..." class="form-input" value="${currentSearch}" />
        </div>
        <button class="btn btn-secondary btn-sm" id="vnd-reset-btn">Reset</button>
      </div>

      <div id="vendors-table-wrapper">
        <div style="text-align:center;padding:40px;color:var(--slate-400);">Loading suppliers from /api/vendors...</div>
      </div>
    `;

    const searchInput = document.getElementById('vnd-search-input');
    const resetBtn = document.getElementById('vnd-reset-btn');
    const addBtn = document.getElementById('vnd-add-btn');

    searchInput.oninput = (e) => {
      currentSearch = e.target.value;
      currentPage = 1;
      loadVendorsData(outlet);
    };

    resetBtn.onclick = () => {
      currentSearch = '';
      currentPage = 1;
      render(outlet);
    };

    addBtn.onclick = () => openVendorModal(null, outlet);

    loadVendorsData(outlet);
  }

  async function loadVendorsData(outlet) {
    const container = document.getElementById('vendors-table-wrapper');
    if (!container) return;

    try {
      const data = await global.apiService.getVendors({ page: currentPage, limit: 24, search: currentSearch });
      vendorsList = data?.vendors || [];
      const pagination = data?.pagination || { page: 1, limit: 24, totalItems: vendorsList.length, totalPages: 1 };

      container.innerHTML = `
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Contact Representative</th>
                <th>Phone Number</th>
                <th>City / Origin</th>
                <th>Supplier GSTIN</th>
                <th style="text-align:right;">Outstanding Due (₹)</th>
                <th>Status</th>
                <th style="text-align:center;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${vendorsList.map(v => `
                <tr>
                  <td>
                    <div style="font-weight:700;color:var(--slate-900);">${v.company}</div>
                  </td>
                  <td>
                    <div style="font-weight:500;color:var(--slate-800);">${v.name}</div>
                    <div style="font-size:11px;color:var(--slate-500);">${v.email || ''}</div>
                  </td>
                  <td>
                    <span style="font-family:var(--font-mono);font-size:12px;color:var(--primary-purple);">${v.phone}</span>
                  </td>
                  <td>
                    <span style="font-size:12px;color:var(--slate-700);">${v.city || 'Hub'}</span>
                  </td>
                  <td>
                    <span style="font-family:var(--font-mono);font-size:11px;color:var(--slate-600);">${v.gstin}</span>
                  </td>
                  <td style="text-align:right;font-weight:700;color:${v.outstanding_due > 0 ? 'var(--color-danger)' : 'var(--slate-800)'};">
                    ₹${(v.outstanding_due || 0).toLocaleString()}
                  </td>
                  <td>
                    <span class="badge badge-success">${v.status || 'Active'}</span>
                  </td>
                  <td style="text-align:center;">
                    <button class="btn btn-secondary btn-sm edit-vnd-btn" data-id="${v.id}">
                      Edit
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="pagination-container">
          <div class="pagination-info">Showing <strong>${vendorsList.length}</strong> suppliers (PAGE_SIZE = 24)</div>
          <div class="pagination-controls">
            <button class="page-btn" disabled>Prev</button>
            <button class="page-btn active">1</button>
            <button class="page-btn" disabled>Next</button>
          </div>
        </div>
      `;

      container.querySelectorAll('.edit-vnd-btn').forEach(b => {
        b.onclick = () => {
          const id = b.getAttribute('data-id');
          const v = vendorsList.find(x => x.id === id);
          if (v) openVendorModal(v, outlet);
        };
      });

    } catch (err) {
      container.innerHTML = `<div style="color:var(--color-danger);text-align:center;padding:30px;">Failed to load vendors: ${err.message}</div>`;
    }
  }

  function openVendorModal(existingVnd = null, outlet) {
    const isEdit = !!existingVnd;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-container" style="max-width:480px;">
        <div class="modal-header">
          <h3 class="modal-title">${isEdit ? 'Edit Supplier Profile' : 'Register New Vendor'}</h3>
          <button class="btn btn-ghost btn-icon" id="vndm-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <form id="vndm-form" style="padding:20px;">
          <div class="form-group">
            <label class="form-label">Vendor Company Name *</label>
            <input type="text" id="vm-company" class="form-input" placeholder="e.g. Apex Apparel Mills Ltd" value="${existingVnd?.company || ''}" required />
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="form-group">
              <label class="form-label">Contact Person</label>
              <input type="text" id="vm-name" class="form-input" placeholder="Sales Manager Name" value="${existingVnd?.name || ''}" required />
            </div>
            <div class="form-group">
              <label class="form-label">Phone Number</label>
              <input type="tel" id="vm-phone" class="form-input" placeholder="9819283746" value="${existingVnd?.phone || ''}" required />
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="form-group">
              <label class="form-label">Supplier GSTIN</label>
              <input type="text" id="vm-gstin" class="form-input" placeholder="27AABCA1234F1Z9" value="${existingVnd?.gstin || ''}" required />
            </div>
            <div class="form-group">
              <label class="form-label">City</label>
              <input type="text" id="vm-city" class="form-input" placeholder="Surat" value="${existingVnd?.city || ''}" required />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Opening Payables Due (₹)</label>
            <input type="number" id="vm-due" class="form-input" placeholder="0" value="${existingVnd?.outstanding_due || 0}" />
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:8px;">Save Vendor Profile</button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('vndm-close').onclick = () => modal.remove();
    document.getElementById('vndm-form').onsubmit = async (e) => {
      e.preventDefault();
      const payload = {
        company: document.getElementById('vm-company').value.trim(),
        name: document.getElementById('vm-name').value.trim(),
        phone: document.getElementById('vm-phone').value.trim(),
        gstin: document.getElementById('vm-gstin').value.trim(),
        city: document.getElementById('vm-city').value.trim(),
        outstanding_due: parseFloat(document.getElementById('vm-due').value) || 0,
        status: 'Active'
      };

      await global.apiService.createVendor(payload);
      global.Toast?.success(`Vendor ${payload.company} registered!`);
      modal.remove();
      loadVendorsData(outlet);
    };
  }

  global.VendorsDirectoryPage = { render };
})(window);

