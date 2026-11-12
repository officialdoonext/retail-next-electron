/**
 * Retail Next — Order Promo Coupons (/discounts/order-coupons)
 *
 * Features:
 *   - Cart-wide promo codes (e.g. FESTIVE20, FLAT500)
 *   - Percentage or flat rupee discounts with min cart value
 *   - Calls /api/coupons?type=ORDER
 *   - Strict 24-item pagination
 */

'use strict';

(function(global) {

  let currentPage = 1;
  let couponsList = [];

  async function render(outlet) {
    outlet.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Order Promo Coupons</h1>
          <p>Cart-wide promotional promo codes, flat rate discounts, and festive discount campaigns</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" id="cpn-create-btn">
            + Create Order Coupon
          </button>
        </div>
      </div>

      <div id="coupons-table-wrapper">
        <div style="text-align:center;padding:40px;color:var(--slate-400);">Loading promo coupons from /api/coupons...</div>
      </div>
    `;

    document.getElementById('cpn-create-btn').onclick = () => openCouponModal(null, outlet);

    loadCoupons(outlet);
  }

  async function loadCoupons(outlet) {
    const container = document.getElementById('coupons-table-wrapper');
    if (!container) return;

    try {
      const data = await global.apiService.getCoupons({ type: 'ORDER', page: currentPage, limit: 24 });
      couponsList = data?.coupons || [];
      const pagination = data?.pagination || { page: 1, limit: 24, totalItems: couponsList.length, totalPages: 1 };

      container.innerHTML = `
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Discount Type</th>
                <th>Discount Value</th>
                <th style="text-align:right;">Min Cart Spend</th>
                <th style="text-align:right;">Max Cap</th>
                <th>Validity Date</th>
                <th>Status</th>
                <th style="text-align:center;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${couponsList.map(c => `
                <tr>
                  <td>
                    <span class="badge badge-purple" style="font-family:var(--font-mono);font-size:12px;padding:4px 8px;">
                      ${c.code}
                    </span>
                  </td>
                  <td>${c.discountType === 'PERCENTAGE' ? 'Percentage (%)' : 'Flat Rupee (₹)'}</td>
                  <td>
                    <strong style="color:var(--slate-900);font-size:13.5px;">
                      ${c.discountType === 'PERCENTAGE' ? c.discountValue + '%' : '₹' + c.discountValue}
                    </strong>
                  </td>
                  <td style="text-align:right;">₹${(c.minOrderAmount || 0).toLocaleString()}</td>
                  <td style="text-align:right;">${c.maxDiscountAmount ? '₹' + c.maxDiscountAmount : 'No Cap'}</td>
                  <td><span style="font-size:12px;color:var(--slate-600);">${c.validUntil || '2026-12-31'}</span></td>
                  <td><span class="badge badge-success">${c.status || 'Active'}</span></td>
                  <td style="text-align:center;">
                    <button class="btn btn-ghost btn-sm del-cpn-btn" data-id="${c.id}" style="color:var(--color-danger);">
                      Deactivate
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="pagination-container">
          <div class="pagination-info">Showing <strong>${couponsList.length}</strong> order coupons (PAGE_SIZE = 24)</div>
          <div class="pagination-controls">
            <button class="page-btn" disabled>Prev</button>
            <button class="page-btn active">1</button>
            <button class="page-btn" disabled>Next</button>
          </div>
        </div>
      `;

      container.querySelectorAll('.del-cpn-btn').forEach(b => {
        b.onclick = async () => {
          const id = b.getAttribute('data-id');
          await global.apiService.deleteCoupon(id);
          global.Toast?.info('Coupon deactivated');
          loadCoupons(outlet);
        };
      });

    } catch (err) {
      container.innerHTML = `<div style="color:var(--color-danger);text-align:center;padding:30px;">Failed to load coupons: ${err.message}</div>`;
    }
  }

  function openCouponModal(existingCpn = null, outlet) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-container" style="max-width:440px;">
        <div class="modal-header">
          <h3 class="modal-title">Create Order Promo Coupon</h3>
          <button class="btn btn-ghost btn-icon" id="cpnm-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <form id="cpnm-form" style="padding:20px;">
          <div class="form-group">
            <label class="form-label">Promo Code (Uppercase)</label>
            <input type="text" id="cpn-code" class="form-input" placeholder="e.g. DIWALI30" required style="text-transform:uppercase;" />
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="form-group">
              <label class="form-label">Discount Type</label>
              <select id="cpn-type" class="form-select">
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FLAT">Flat Rupee (₹)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Discount Value</label>
              <input type="number" id="cpn-val" class="form-input" placeholder="20" required />
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="form-group">
              <label class="form-label">Min Cart Value (₹)</label>
              <input type="number" id="cpn-min" class="form-input" placeholder="1000" value="1000" />
            </div>
            <div class="form-group">
              <label class="form-label">Max Discount (₹)</label>
              <input type="number" id="cpn-max" class="form-input" placeholder="500" value="500" />
            </div>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:8px;">Activate Coupon</button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('cpnm-close').onclick = () => modal.remove();
    document.getElementById('cpnm-form').onsubmit = async (e) => {
      e.preventDefault();
      const payload = {
        code: document.getElementById('cpn-code').value.trim().toUpperCase(),
        type: 'ORDER',
        discountType: document.getElementById('cpn-type').value,
        discountValue: parseFloat(document.getElementById('cpn-val').value) || 10,
        minOrderAmount: parseFloat(document.getElementById('cpn-min').value) || 0,
        maxDiscountAmount: parseFloat(document.getElementById('cpn-max').value) || 0,
        status: 'Active'
      };

      await global.apiService.createCoupon(payload);
      global.Toast?.success(`Coupon ${payload.code} activated!`);
      modal.remove();
      loadCoupons(outlet);
    };
  }

  global.OrderCouponsPage = { render };
})(window);

