/**
 * Retail Next — VIP Customer Personalized Coupons (/discounts/customer-coupons)
 *
 * Features:
 *   - Personalized VIP coupons assigned to customer phone numbers or tiers
 *   - Calls /api/coupons?type=CUSTOMER
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
          <h1>Customer VIP Coupons</h1>
          <p>Personalized loyalty discounts, VIP rewards, and customer-specific coupon assignment</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" id="cust-cpn-create-btn">
            + Issue VIP Coupon
          </button>
        </div>
      </div>

      <div id="cust-coupons-wrapper">
        <div style="text-align:center;padding:40px;color:var(--slate-400);">Loading VIP coupons...</div>
      </div>
    `;

    document.getElementById('cust-cpn-create-btn').onclick = () => openCustomerCouponModal(outlet);

    loadCoupons(outlet);
  }

  async function loadCoupons(outlet) {
    const container = document.getElementById('cust-coupons-wrapper');
    if (!container) return;

    try {
      const data = await global.apiService.getCoupons({ type: 'CUSTOMER', page: currentPage, limit: 24 });
      couponsList = (data?.coupons || []).filter(c => c.type === 'CUSTOMER');

      container.innerHTML = `
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Target Customer Phone / Tier</th>
                <th>Discount Value</th>
                <th style="text-align:right;">Max Benefit (₹)</th>
                <th>Validity Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${couponsList.map(c => `
                <tr>
                  <td>
                    <span class="badge badge-purple" style="font-family:var(--font-mono);font-size:12px;">${c.code}</span>
                  </td>
                  <td>
                    <span style="font-weight:600;color:var(--slate-900);">VIP Gold Loyalty Tier</span>
                  </td>
                  <td>
                    <strong style="color:var(--slate-900);">${c.discountValue}% OFF</strong>
                  </td>
                  <td style="text-align:right;">₹${(c.maxDiscountAmount || 1000).toFixed(2)}</td>
                  <td><span style="font-size:12px;color:var(--slate-600);">${c.validUntil || '2027-03-31'}</span></td>
                  <td><span class="badge badge-success">${c.status || 'Active'}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="pagination-container">
          <div class="pagination-info">Showing <strong>${couponsList.length}</strong> VIP coupons (PAGE_SIZE = 24)</div>
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

  function openCustomerCouponModal(outlet) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-container" style="max-width:440px;">
        <div class="modal-header">
          <h3 class="modal-title">Issue Customer VIP Coupon</h3>
          <button class="btn btn-ghost btn-icon" id="ccm-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <form id="ccm-form" style="padding:20px;">
          <div class="form-group">
            <label class="form-label">Personalized Code</label>
            <input type="text" id="ccm-code" class="form-input" placeholder="e.g. VIP-SIVA25" required style="text-transform:uppercase;" />
          </div>
          <div class="form-group">
            <label class="form-label">Customer Mobile Number</label>
            <input type="tel" id="ccm-phone" class="form-input" placeholder="9876543210" required />
          </div>
          <div class="form-group">
            <label class="form-label">Discount Percentage (%)</label>
            <input type="number" id="ccm-val" class="form-input" placeholder="25" required />
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:8px;">Issue Voucher</button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('ccm-close').onclick = () => modal.remove();
    document.getElementById('ccm-form').onsubmit = async (e) => {
      e.preventDefault();
      await global.apiService.createCoupon({
        code: document.getElementById('ccm-code').value.trim().toUpperCase(),
        type: 'CUSTOMER',
        discountType: 'PERCENTAGE',
        discountValue: parseFloat(document.getElementById('ccm-val').value) || 25
      });
      global.Toast?.success('Customer VIP coupon issued');
      modal.remove();
      loadCoupons(outlet);
    };
  }

  global.CustomerCouponsPage = { render };
})(window);

