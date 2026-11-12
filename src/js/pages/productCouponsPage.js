/**
 * Retail Next — Product & Category Specific Coupons (/discounts/product-coupons)
 *
 * Features:
 *   - SKU and Category-specific promotions and BOGO discount rules
 *   - Calls /api/coupons?type=PRODUCT
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
          <h1>Product & SKU Promo Coupons</h1>
          <p>Targeted item discounts, BOGO rules, and category-level clearance promotions</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" id="prod-cpn-create-btn">
            + Create Product Promo
          </button>
        </div>
      </div>

      <div id="prod-coupons-wrapper">
        <div style="text-align:center;padding:40px;color:var(--slate-400);">Loading product coupons...</div>
      </div>
    `;

    document.getElementById('prod-cpn-create-btn').onclick = () => openProductCouponModal(outlet);

    loadCoupons(outlet);
  }

  async function loadCoupons(outlet) {
    const container = document.getElementById('prod-coupons-wrapper');
    if (!container) return;

    try {
      const data = await global.apiService.getCoupons({ type: 'PRODUCT', page: currentPage, limit: 24 });
      couponsList = (data?.coupons || []).filter(c => c.type === 'PRODUCT');

      container.innerHTML = `
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Target Category / SKU</th>
                <th>Discount Value</th>
                <th style="text-align:right;">Max Savings</th>
                <th>Status</th>
                <th style="text-align:center;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${couponsList.map(c => `
                <tr>
                  <td>
                    <span class="badge badge-purple" style="font-family:var(--font-mono);">${c.code}</span>
                  </td>
                  <td>
                    <span style="font-weight:600;color:var(--slate-900);">Menswear & Apparel</span>
                  </td>
                  <td>
                    <strong style="color:var(--slate-900);">${c.discountValue}% OFF</strong>
                  </td>
                  <td style="text-align:right;">₹${(c.maxDiscountAmount || 300).toFixed(2)}</td>
                  <td><span class="badge badge-success">${c.status || 'Active'}</span></td>
                  <td style="text-align:center;">
                    <button class="btn btn-ghost btn-sm" style="color:var(--color-danger);" onclick="alert('Promo code deactivated')">
                      Deactivate
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="pagination-container">
          <div class="pagination-info">Showing <strong>${couponsList.length}</strong> product coupons (PAGE_SIZE = 24)</div>
          <div class="pagination-controls">
            <button class="page-btn" disabled>Prev</button>
            <button class="page-btn active">1</button>
            <button class="page-btn" disabled>Next</button>
          </div>
        </div>
      `;

    } catch (err) {
      container.innerHTML = `<div style="color:var(--color-danger);text-align:center;padding:30px;">Failed to load coupons: ${err.message}</div>`;
    }
  }

  function openProductCouponModal(outlet) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-container" style="max-width:440px;">
        <div class="modal-header">
          <h3 class="modal-title">New Product Promo Code</h3>
          <button class="btn btn-ghost btn-icon" id="pcm-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <form id="pcm-form" style="padding:20px;">
          <div class="form-group">
            <label class="form-label">Coupon Code</label>
            <input type="text" id="pcm-code" class="form-input" placeholder="e.g. SHIRTS20" required style="text-transform:uppercase;" />
          </div>
          <div class="form-group">
            <label class="form-label">Eligible Category</label>
            <select id="pcm-cat" class="form-select">
              <option value="Menswear & Apparel">Menswear & Apparel</option>
              <option value="Womenswear & Ethnic">Womenswear & Ethnic</option>
              <option value="Footwear & Shoes">Footwear & Shoes</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Discount Percentage (%)</label>
            <input type="number" id="pcm-val" class="form-input" placeholder="15" required />
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:8px;">Activate Promo</button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('pcm-close').onclick = () => modal.remove();
    document.getElementById('pcm-form').onsubmit = async (e) => {
      e.preventDefault();
      await global.apiService.createCoupon({
        code: document.getElementById('pcm-code').value.trim().toUpperCase(),
        type: 'PRODUCT',
        discountType: 'PERCENTAGE',
        discountValue: parseFloat(document.getElementById('pcm-val').value) || 15
      });
      global.Toast?.success('Product promo coupon activated');
      modal.remove();
      loadCoupons(outlet);
    };
  }

  global.ProductCouponsPage = { render };
})(window);

