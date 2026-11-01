/**
 * RetailNext — Supplier Master Page
 * Submenu: Masters -> Supplier Master -> Add Supplier, Supplier List, Supplier Groups
 */

'use strict';

window.SuppliersPage = (() => {

  function renderPage(outlet, subTab = 'list') {
    if (!outlet) return;
    outlet.innerHTML = '';
    outlet.className = 'page-container suppliers-page';

    const store = window.RetailStore;
    const suppliers = store ? store.getSuppliers() : [];

    outlet.innerHTML = `
      <div class="module-header">
        <div>
          <span class="module-header__parent">Masters / Vendors</span>
          <h1 class="module-header__title">Supplier & Vendor Master</h1>
        </div>
        <div class="module-header__actions">
          <button class="btn btn--primary" id="btn-add-supp-modal">+ Add New Supplier</button>
        </div>
      </div>

      <div class="card p-4">
        <div class="filter-bar" style="margin-bottom:16px;">
          <input type="text" id="supp-search" class="pos-input" style="max-width:320px;" placeholder="Search vendor by name, GSTIN or mobile..." />
          <div class="text-secondary font-mono" style="margin-left:auto;font-size:12px;">Total: ${suppliers.length} Vendors</div>
        </div>

        <div class="table-container">
          <table class="erp-table">
            <thead>
              <tr>
                <th>Supplier Code</th>
                <th>Supplier / Company Name</th>
                <th>Contact Person</th>
                <th>Mobile Number</th>
                <th>GSTIN</th>
                <th>City</th>
                <th style="text-align:right;">Outstanding Payables (₹)</th>
                <th style="text-align:center;">Payment Terms</th>
                <th style="text-align:center;">Actions</th>
              </tr>
            </thead>
            <tbody id="supp-tbody">
              ${renderRows(suppliers)}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add Supplier Modal -->
      <div id="supp-modal" class="retail-modal">
        <div class="retail-modal__backdrop"></div>
        <div class="retail-modal__dialog" style="max-width:560px;">
          <div class="retail-modal__header">
            <strong>Register New Supplier / Vendor</strong>
            <button class="retail-modal__close" id="supp-modal-close">&times;</button>
          </div>
          <form id="supp-form">
            <div class="retail-modal__body" style="padding:16px;">
              <div class="form-grid-2" style="margin-bottom:12px;">
                <div class="form-group">
                  <label>Supplier / Trade Name <span class="text-error">*</span></label>
                  <input type="text" id="fs-name" class="pos-input" required placeholder="e.g. Metro Wholesale Traders" />
                </div>
                <div class="form-group">
                  <label>Contact Person</label>
                  <input type="text" id="fs-contact" class="pos-input" placeholder="e.g. Rajesh Singhal" />
                </div>
              </div>

              <div class="form-grid-2" style="margin-bottom:12px;">
                <div class="form-group">
                  <label>Mobile Number <span class="text-error">*</span></label>
                  <input type="tel" id="fs-mobile" class="pos-input font-mono" required placeholder="10-digit mobile number" />
                </div>
                <div class="form-group">
                  <label>GSTIN</label>
                  <input type="text" id="fs-gstin" class="pos-input font-mono" placeholder="15-digit GSTIN" style="text-transform:uppercase;" />
                </div>
              </div>

              <div class="form-grid-3" style="margin-bottom:12px;">
                <div class="form-group">
                  <label>City</label>
                  <input type="text" id="fs-city" class="pos-input" value="Hyderabad" />
                </div>
                <div class="form-group">
                  <label>Supplier Group</label>
                  <select id="fs-group" class="pos-select">
                    <option value="FMCG Distributor">FMCG Distributor</option>
                    <option value="Wholesale Trader">Wholesale Trader</option>
                    <option value="Direct Manufacturer">Direct Manufacturer</option>
                    <option value="Agricultural Importer">Agricultural Importer</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Payment Terms</label>
                  <select id="fs-terms" class="pos-select">
                    <option value="Immediate Cash">Immediate Cash</option>
                    <option value="7 Days Credit">7 Days Credit</option>
                    <option value="15 Days Credit" selected>15 Days Credit</option>
                    <option value="30 Days Credit">30 Days Credit</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>Opening Payable Balance (₹)</label>
                <input type="number" id="fs-open-bal" class="pos-input font-mono" value="0.00" step="0.01" />
              </div>
            </div>

            <div class="retail-modal__footer">
              <button type="button" class="btn btn--outline" id="supp-modal-cancel">Cancel</button>
              <button type="submit" class="btn btn--primary">Save Supplier</button>
            </div>
          </form>
        </div>
      </div>
    `;

    setupEvents(outlet);

    if (subTab === 'add') {
      const modal = outlet.querySelector('#supp-modal');
      if (modal) modal.classList.add('open');
    }
  }

  function renderRows(list) {
    if (list.length === 0) {
      return `<tr><td colspan="9" class="table-empty"><div class="table-empty__text">No suppliers registered</div></td></tr>`;
    }

    return list.map(s => `
      <tr>
        <td class="font-mono text-brand font-bold">${s.id}</td>
        <td><strong>${s.name}</strong></td>
        <td>${s.contactPerson || 'Store Manager'}</td>
        <td class="font-mono">${s.mobile}</td>
        <td class="font-mono text-secondary">${s.gstin || '—'}</td>
        <td>${s.city}</td>
        <td style="text-align:right;" class="font-mono ${s.outstanding > 0 ? 'text-error font-bold' : 'text-success'}">
          ₹${Number(s.outstanding || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </td>
        <td style="text-align:center;"><span class="pay-chip pay-chip--card" style="font-size:10px;">${s.paymentTerms || '15 Days'}</span></td>
        <td style="text-align:center;">
          <button class="btn btn--xs btn--outline" onclick="alert('Viewing ledger transactions for ${s.name}')">Ledger</button>
        </td>
      </tr>
    `).join('');
  }

  function setupEvents(outlet) {
    const searchInput = outlet.querySelector('#supp-search');
    const tbody = outlet.querySelector('#supp-tbody');

    if (searchInput) {
      searchInput.oninput = () => {
        const q = searchInput.value.trim().toLowerCase();
        const store = window.RetailStore;
        const all = store ? store.getSuppliers() : [];
        const filtered = all.filter(s => s.name.toLowerCase().includes(q) || s.mobile.includes(q) || (s.gstin && s.gstin.toLowerCase().includes(q)));
        tbody.innerHTML = renderRows(filtered);
      };
    }

    const modal = outlet.querySelector('#supp-modal');
    const addBtn = outlet.querySelector('#btn-add-supp-modal');
    const closeBtn = outlet.querySelector('#supp-modal-close');
    const cancelBtn = outlet.querySelector('#supp-modal-cancel');
    const form = outlet.querySelector('#supp-form');

    if (addBtn && modal) addBtn.onclick = () => modal.classList.add('open');
    if (closeBtn && modal) closeBtn.onclick = () => modal.classList.remove('open');
    if (cancelBtn && modal) cancelBtn.onclick = () => modal.classList.remove('open');

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const store = window.RetailStore;
        const newSupp = {
          id: 'SUP-' + String(100 + (store ? store.getSuppliers().length + 1 : 1)),
          name: outlet.querySelector('#fs-name').value.trim(),
          contactPerson: outlet.querySelector('#fs-contact').value.trim(),
          mobile: outlet.querySelector('#fs-mobile').value.trim(),
          gstin: outlet.querySelector('#fs-gstin').value.trim().toUpperCase(),
          city: outlet.querySelector('#fs-city').value.trim(),
          group: outlet.querySelector('#fs-group').value,
          paymentTerms: outlet.querySelector('#fs-terms').value,
          outstanding: Number(outlet.querySelector('#fs-open-bal').value) || 0
        };

        if (window.SyncEngine) {
          window.SyncEngine.saveRecord('suppliers', newSupp, 'INSERT');
        } else if (store) {
          store.addSupplier(newSupp);
        }

        modal.classList.remove('open');
        renderPage(outlet);
        alert(`Supplier ${newSupp.name} registered successfully!`);
      };
    }
  }

  return { renderPage };
})();
