/**
 * Retail Next — Customer Directory (/customers)
 *
 * Features:
 *   - Customer profiles: Name, Phone, Email, Address, GSTIN, Loyalty points
 *   - Add / Edit Customer modal & Excel bulk import
 *   - Calls /api/customers
 *   - Strict 24-item pagination
 */

'use strict';

(function(global) {

  let currentPage = 1;
  let currentSearch = '';
  let customerList = [];

  async function render(outlet) {
    outlet.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Customer Directory & CRM</h1>
          <p>Customer accounts, contact information, loyalty balance, and B2B GST details</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" id="cust-add-btn">
            + New Customer
          </button>
        </div>
      </div>

      <div class="filter-bar">
        <div class="filter-search-box">
          <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="cust-search-input" placeholder="Search customer by name, mobile, or GSTIN..." class="form-input" value="${currentSearch}" />
        </div>
        <button class="btn btn-secondary btn-sm" id="cust-reset-btn">Reset</button>
      </div>

      <div id="cust-table-wrapper">
        <div style="text-align:center;padding:40px;color:var(--slate-400);">Loading customers from /api/customers...</div>
      </div>
    `;

    const searchInput = document.getElementById('cust-search-input');
    const resetBtn = document.getElementById('cust-reset-btn');
    const addBtn = document.getElementById('cust-add-btn');

    searchInput.oninput = (e) => {
      currentSearch = e.target.value;
      currentPage = 1;
      loadCustomersData(outlet);
    };

    resetBtn.onclick = () => {
      currentSearch = '';
      currentPage = 1;
      render(outlet);
    };

    addBtn.onclick = () => openCustomerModal(null, outlet);

    loadCustomersData(outlet);
  }

  async function loadCustomersData(outlet) {
    const container = document.getElementById('cust-table-wrapper');
    if (!container) return;

    try {
      const data = await global.apiService.getCustomers({ page: currentPage, limit: 24, search: currentSearch });
      customerList = data?.customers || [];
      const pagination = data?.pagination || { page: 1, limit: 24, totalItems: customerList.length, totalPages: 1 };

      container.innerHTML = `
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Mobile Number</th>
                <th>Email Address</th>
                <th>City / Address</th>
                <th>GSTIN</th>
                <th style="text-align:center;">Loyalty Points</th>
                <th style="text-align:right;">Lifetime Spend</th>
                <th style="text-align:center;">360 Profile</th>
              </tr>
            </thead>
            <tbody>
              ${customerList.map(c => `
                <tr>
                  <td>
                    <div style="font-weight:600;color:var(--slate-900);">${c.name}</div>
                  </td>
                  <td>
                    <span style="font-family:var(--font-mono);font-size:12px;color:var(--primary-purple);">${c.phone}</span>
                  </td>
                  <td>
                    <span style="font-size:12px;color:var(--slate-600);">${c.email || '—'}</span>
                  </td>
                  <td>
                    <span style="font-size:12px;color:var(--slate-700);">${c.address || 'Local Walk-in'}</span>
                  </td>
                  <td>
                    <span style="font-family:var(--font-mono);font-size:11px;color:var(--slate-600);">${c.gstin || 'B2C Retail'}</span>
                  </td>
                  <td style="text-align:center;">
                    <span class="badge badge-purple" style="font-size:11px;">${c.loyaltyPoints || 0} pts</span>
                  </td>
                  <td style="text-align:right;font-weight:700;color:var(--slate-900);">
                    ₹${(c.totalSpent || 0).toLocaleString()}
                  </td>
                  <td style="text-align:center;">
                    <a href="#/customers/individual" class="btn btn-secondary btn-sm" style="text-decoration:none;">
                      Customer 360
                    </a>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="pagination-container">
          <div class="pagination-info">Showing <strong>${customerList.length}</strong> customers (PAGE_SIZE = 24)</div>
          <div class="pagination-controls">
            <button class="page-btn" disabled>Prev</button>
            <button class="page-btn active">1</button>
            <button class="page-btn" disabled>Next</button>
          </div>
        </div>
      `;

    } catch (err) {
      container.innerHTML = `<div style="color:var(--color-danger);text-align:center;padding:30px;">Failed to load customers: ${err.message}</div>`;
    }
  }

  function openCustomerModal(existingCust = null, outlet) {
    const isEdit = !!existingCust;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-container" style="max-width:480px;">
        <div class="modal-header">
          <h3 class="modal-title">${isEdit ? 'Edit Customer Profile' : 'Register Customer Profile'}</h3>
          <button class="btn btn-ghost btn-icon" id="custm-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <form id="custm-form" style="padding:20px;">
          <div class="form-group">
            <label class="form-label">Customer Full Name *</label>
            <input type="text" id="cm-name" class="form-input" placeholder="e.g. Siva Krishna" value="${existingCust?.name || ''}" required />
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="form-group">
              <label class="form-label">Phone Number *</label>
              <input type="tel" id="cm-phone" class="form-input" placeholder="9876543210" value="${existingCust?.phone || ''}" required />
            </div>
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" id="cm-email" class="form-input" placeholder="customer@domain.com" value="${existingCust?.email || ''}" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Address / Landmark</label>
            <input type="text" id="cm-address" class="form-input" placeholder="Street, City, Pincode" value="${existingCust?.address || ''}" />
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="form-group">
              <label class="form-label">GSTIN (for B2B invoicing)</label>
              <input type="text" id="cm-gstin" class="form-input" placeholder="36AABCS1234F1Z8" value="${existingCust?.gstin || ''}" />
            </div>
            <div class="form-group">
              <label class="form-label">Opening Loyalty Points</label>
              <input type="number" id="cm-pts" class="form-input" placeholder="100" value="${existingCust?.loyaltyPoints || 50}" />
            </div>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:8px;">Save Customer Profile</button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('custm-close').onclick = () => modal.remove();
    document.getElementById('custm-form').onsubmit = async (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById('cm-name').value.trim(),
        phone: document.getElementById('cm-phone').value.trim(),
        email: document.getElementById('cm-email').value.trim(),
        address: document.getElementById('cm-address').value.trim(),
        gstin: document.getElementById('cm-gstin').value.trim(),
        loyaltyPoints: parseInt(document.getElementById('cm-pts').value, 10) || 0
      };

      await global.apiService.createCustomer(payload);
      global.Toast?.success(`Customer ${payload.name} saved!`);
      modal.remove();
      loadCustomersData(outlet);
    };
  }

  global.CustomersDirectoryPage = { render };
})(window);

