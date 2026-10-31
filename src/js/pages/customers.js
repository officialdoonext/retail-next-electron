/**
 * RetailNext — Customers Master Page
 * Customer listing, outstanding dues, loyalty points, and add customer form.
 */

'use strict';

window.CustomersPage = (() => {

  function renderPage(outlet) {
    if (!outlet) return;
    outlet.innerHTML = '';
    outlet.className = 'page-container customers-page';

    const store = window.RetailStore;
    const customers = store ? store.getCustomers() : [];

    outlet.innerHTML = `
      <div class="module-header">
        <div>
          <span class="module-header__parent">Masters / Parties</span>
          <h1 class="module-header__title">Customer Master (F9)</h1>
        </div>
        <div class="module-header__actions">
          <button class="btn btn--primary" id="cust-btn-add">+ Add Customer</button>
        </div>
      </div>

      <div class="card p-4">
        <div class="filter-bar">
          <input type="text" id="cust-search" class="pos-input" style="max-width:320px;" placeholder="Search customer by name or mobile number..." />
          <div class="text-secondary font-mono" style="margin-left:auto;font-size:12px;">Total: ${customers.length} Customers</div>
        </div>

        <div class="table-container" style="margin-top:16px;">
          <table class="erp-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Customer Name</th>
                <th>Mobile Number</th>
                <th>Customer Group</th>
                <th>City</th>
                <th style="text-align:right;">Credit Limit (₹)</th>
                <th style="text-align:right;">Outstanding Dues (₹)</th>
                <th style="text-align:center;">Loyalty Points</th>
                <th style="text-align:center;">Actions</th>
              </tr>
            </thead>
            <tbody id="cust-tbody">
              ${customers.map(c => `
                <tr>
                  <td class="font-mono text-brand font-bold">${c.id}</td>
                  <td><strong>${c.name}</strong></td>
                  <td class="font-mono">${c.mobile}</td>
                  <td><span class="pay-chip pay-chip--card">${c.group}</span></td>
                  <td>${c.city}</td>
                  <td style="text-align:right;" class="font-mono">₹${Number(c.creditLimit).toFixed(2)}</td>
                  <td style="text-align:right;" class="font-mono ${c.outstanding > 0 ? 'text-error font-bold' : 'text-success'}">
                    ₹${Number(c.outstanding).toFixed(2)}
                  </td>
                  <td style="text-align:center;" class="font-bold text-brand">${c.loyaltyPoints}</td>
                  <td style="text-align:center;">
                    <button class="btn btn--xs btn--outline" onclick="alert('Viewing ledger for ${c.name}')">Ledger</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add Customer Modal -->
      <div id="add-cust-modal" class="retail-modal">
        <div class="retail-modal__backdrop"></div>
        <div class="retail-modal__dialog" style="max-width:480px;">
          <div class="retail-modal__header">
            <strong>Add New Customer</strong>
            <button class="retail-modal__close" id="add-cust-close">&times;</button>
          </div>
          <form id="add-cust-form">
            <div class="retail-modal__body" style="padding:16px;">
              <div class="form-group" style="margin-bottom:12px;">
                <label>Customer Name <span class="text-error">*</span></label>
                <input type="text" id="ac-name" class="pos-input" required placeholder="e.g. Ramesh Chandra" />
              </div>
              <div class="form-group" style="margin-bottom:12px;">
                <label>Mobile Number <span class="text-error">*</span></label>
                <input type="text" id="ac-mobile" class="pos-input" required placeholder="10-digit mobile" />
              </div>
              <div class="form-group" style="margin-bottom:12px;">
                <label>Customer Group</label>
                <select id="ac-group" class="pos-select">
                  <option value="Retail Regular">Retail Regular</option>
                  <option value="Privilege Member">Privilege Member</option>
                  <option value="Wholesale B2B">Wholesale B2B</option>
                </select>
              </div>
              <div class="form-group" style="margin-bottom:12px;">
                <label>City / Area</label>
                <input type="text" id="ac-city" class="pos-input" value="Hyderabad" />
              </div>
              <div class="form-group">
                <label>Credit Limit (₹)</label>
                <input type="number" id="ac-credit" class="pos-input" value="10000" />
              </div>
            </div>
            <div class="retail-modal__footer">
              <button type="button" class="btn btn--outline" id="add-cust-cancel">Cancel</button>
              <button type="submit" class="btn btn--primary">Save Customer</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const addBtn = outlet.querySelector('#cust-btn-add');
    const modal = outlet.querySelector('#add-cust-modal');
    const closeBtn = outlet.querySelector('#add-cust-close');
    const cancelBtn = outlet.querySelector('#add-cust-cancel');
    const form = outlet.querySelector('#add-cust-form');

    if (addBtn && modal) {
      addBtn.addEventListener('click', () => modal.classList.add('open'));
    }
    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    }
    if (cancelBtn && modal) {
      cancelBtn.addEventListener('click', () => modal.classList.remove('open'));
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const newCust = {
          id: 'CUST-' + Date.now() + '-' + Math.floor(100 + Math.random() * 900),
          name: outlet.querySelector('#ac-name').value,
          mobile: outlet.querySelector('#ac-mobile').value,
          group: outlet.querySelector('#ac-group').value,
          city: outlet.querySelector('#ac-city').value,
          creditLimit: Number(outlet.querySelector('#ac-credit').value) || 0,
          outstanding: 0,
          loyaltyPoints: 0
        };
        if (window.SyncEngine) {
          window.SyncEngine.saveRecord('customers', newCust, 'INSERT');
        } else if (store) {
          store.addCustomer(newCust);
        }
        modal.classList.remove('open');
        renderPage(outlet);
      });
    }
  }

  return { renderPage };
})();

