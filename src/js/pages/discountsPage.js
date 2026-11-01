/**
 * RetailNext — Discount Master Page
 * Submenu: Masters -> Discount Master -> Discount Rules, Item Discounts, Bill Discounts
 */

'use strict';

window.DiscountsPage = (() => {

  const STORAGE_KEY = 'retailnext_discount_rules';

  const DEFAULT_RULES = [
    {
      id: 'DISC-01',
      title: 'Mega Saver Weekend (Bill Discount)',
      type: 'Bill Discount',
      discountType: 'Percentage',
      value: 5,
      minBillAmount: 2500,
      maxDiscountCap: 250,
      validTill: '2027-03-31',
      status: 'Active',
      couponCode: 'WEEKEND5'
    },
    {
      id: 'DISC-02',
      title: 'Flat ₹100 Off on Supermarket Spend',
      type: 'Bill Discount',
      discountType: 'Flat Amount',
      value: 100,
      minBillAmount: 1500,
      maxDiscountCap: 100,
      validTill: '2026-12-31',
      status: 'Active',
      couponCode: 'FLAT100'
    },
    {
      id: 'DISC-03',
      title: 'Personal Care 10% Clearance',
      type: 'Item Discount',
      discountType: 'Percentage',
      value: 10,
      minBillAmount: 0,
      maxDiscountCap: 500,
      validTill: '2026-11-30',
      status: 'Active',
      couponCode: 'CARE10'
    },
    {
      id: 'DISC-04',
      title: 'Senior Citizen Special (Store Discount)',
      type: 'Bill Discount',
      discountType: 'Percentage',
      value: 5,
      minBillAmount: 500,
      maxDiscountCap: 150,
      validTill: '2027-12-31',
      status: 'Active',
      couponCode: 'SENIOR5'
    }
  ];

  function getRules() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse discount rules:', e);
    }
    return [...DEFAULT_RULES];
  }

  function saveRules(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function renderPage(outlet, subTab = 'all') {
    if (!outlet) return;
    outlet.innerHTML = '';
    outlet.className = 'page-container discounts-page';

    let allRules = getRules();
    let rules = allRules;
    if (subTab === 'items' || subTab === 'discount-items') {
      rules = allRules.filter(r => r.type === 'Item Discount');
    } else if (subTab === 'bill' || subTab === 'discount-bill') {
      rules = allRules.filter(r => r.type === 'Bill Discount');
    }

    outlet.innerHTML = `
      <div class="module-header">
        <div>
          <span class="module-header__parent">Masters / Sales Promotions</span>
          <h1 class="module-header__title">Discount Master & Promotional Schemes</h1>
        </div>
        <div class="module-header__actions">
          <button class="btn btn--primary" id="btn-add-disc-modal">+ Add Promotional Scheme</button>
        </div>
      </div>

      <div class="card p-4">
        <div class="table-container">
          <table class="erp-table">
            <thead>
              <tr>
                <th>Scheme ID</th>
                <th>Promotion Title</th>
                <th>Discount Scope</th>
                <th>Benefit Value</th>
                <th style="text-align:right;">Min Bill Threshold (₹)</th>
                <th style="text-align:right;">Max Cap (₹)</th>
                <th>Coupon Code</th>
                <th>Validity</th>
                <th style="text-align:center;">Status</th>
                <th style="text-align:center;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${rules.map(r => `
                <tr>
                  <td class="font-mono text-brand font-bold">${r.id}</td>
                  <td><strong>${r.title}</strong></td>
                  <td><span class="pay-chip pay-chip--card" style="font-size:10px;">${r.type}</span></td>
                  <td class="font-mono font-bold text-success">
                    ${r.discountType === 'Percentage' ? `${r.value}% Off` : `₹${r.value} Flat`}
                  </td>
                  <td style="text-align:right;" class="font-mono">₹${r.minBillAmount.toFixed(2)}</td>
                  <td style="text-align:right;" class="font-mono">₹${r.maxDiscountCap.toFixed(2)}</td>
                  <td class="font-mono text-brand font-bold">${r.couponCode || '—'}</td>
                  <td class="font-mono text-secondary" style="font-size:11px;">Valid till ${r.validTill}</td>
                  <td style="text-align:center;">
                    <span class="status-chip status-chip--${r.status === 'Active' ? 'success' : 'warning'}">${r.status}</span>
                  </td>
                  <td style="text-align:center;">
                    <button class="btn btn--xs btn--outline btn-del-disc" data-id="${r.id}">Delete</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add Discount Modal -->
      <div id="disc-modal" class="retail-modal">
        <div class="retail-modal__backdrop"></div>
        <div class="retail-modal__dialog" style="max-width:520px;">
          <div class="retail-modal__header">
            <strong>Create Discount Scheme</strong>
            <button class="retail-modal__close" id="disc-modal-close">&times;</button>
          </div>
          <form id="disc-form">
            <div class="retail-modal__body" style="padding:16px;">
              <div class="form-group" style="margin-bottom:12px;">
                <label>Scheme Name <span class="text-error">*</span></label>
                <input type="text" id="fd-name" class="pos-input" required placeholder="e.g. Festive Diwali 10% Off" />
              </div>

              <div class="form-grid-2" style="margin-bottom:12px;">
                <div class="form-group">
                  <label>Scope</label>
                  <select id="fd-scope" class="pos-select">
                    <option value="Bill Discount">Entire Bill Discount</option>
                    <option value="Item Discount">Specific Item Discount</option>
                    <option value="Coupon Code">Coupon / Promo Code</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Discount Type</label>
                  <select id="fd-type" class="pos-select">
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Flat Amount">Flat Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div class="form-grid-3" style="margin-bottom:12px;">
                <div class="form-group">
                  <label>Value (% or ₹) <span class="text-error">*</span></label>
                  <input type="number" id="fd-val" class="pos-input font-mono" required value="5" step="0.5" />
                </div>
                <div class="form-group">
                  <label>Min Bill Amount (₹)</label>
                  <input type="number" id="fd-min" class="pos-input font-mono" value="1000" />
                </div>
                <div class="form-group">
                  <label>Max Cap (₹)</label>
                  <input type="number" id="fd-cap" class="pos-input font-mono" value="200" />
                </div>
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label>Promo / Coupon Code</label>
                  <input type="text" id="fd-coupon" class="pos-input font-mono" placeholder="e.g. DIWALI10" style="text-transform:uppercase;" />
                </div>
                <div class="form-group">
                  <label>Expiry Date</label>
                  <input type="date" id="fd-date" class="pos-input" value="2027-03-31" />
                </div>
              </div>
            </div>

            <div class="retail-modal__footer">
              <button type="button" class="btn btn--outline" id="disc-modal-cancel">Cancel</button>
              <button type="submit" class="btn btn--primary">Save Scheme</button>
            </div>
          </form>
        </div>
      </div>
    `;

    setupEvents(outlet);
  }

  function setupEvents(outlet) {
    const modal = outlet.querySelector('#disc-modal');
    const addBtn = outlet.querySelector('#btn-add-disc-modal');
    const closeBtn = outlet.querySelector('#disc-modal-close');
    const cancelBtn = outlet.querySelector('#disc-modal-cancel');
    const form = outlet.querySelector('#disc-form');

    if (addBtn && modal) addBtn.onclick = () => modal.classList.add('open');
    if (closeBtn && modal) closeBtn.onclick = () => modal.classList.remove('open');
    if (cancelBtn && modal) cancelBtn.onclick = () => modal.classList.remove('open');

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const list = getRules();
        const newRule = {
          id: 'DISC-' + String(list.length + 1).padStart(2, '0'),
          title: outlet.querySelector('#fd-name').value.trim(),
          type: outlet.querySelector('#fd-scope').value,
          discountType: outlet.querySelector('#fd-type').value,
          value: Number(outlet.querySelector('#fd-val').value) || 0,
          minBillAmount: Number(outlet.querySelector('#fd-min').value) || 0,
          maxDiscountCap: Number(outlet.querySelector('#fd-cap').value) || 0,
          couponCode: outlet.querySelector('#fd-coupon').value.trim().toUpperCase(),
          validTill: outlet.querySelector('#fd-date').value,
          status: 'Active'
        };

        list.push(newRule);
        saveRules(list);
        modal.classList.remove('open');
        renderPage(outlet);
        alert(`Discount Scheme "${newRule.title}" created successfully!`);
      };
    }

    outlet.querySelectorAll('.btn-del-disc').forEach(b => {
      b.onclick = () => {
        const id = b.getAttribute('data-id');
        if (confirm(`Remove discount scheme ${id}?`)) {
          let list = getRules().filter(i => i.id !== id);
          saveRules(list);
          renderPage(outlet);
        }
      };
    });
  }

  return { renderPage, getRules };
})();
