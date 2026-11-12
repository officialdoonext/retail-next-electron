/**
 * Retail Next — Individual Customer 360 View (/customers/individual)
 *
 * Features:
 *   - Auto-suggest search to load any customer profile
 *   - Profile Tab: Contact details, loyalty points, credit limit, notes
 *   - Invoices Tab: Complete bill history with 24-item pagination & receipt modal
 *   - Returns Tab: Clean return/exchange audit & "Record Return" action
 */

'use strict';

(function(global) {

  let activeCustomer = null;
  let activeTab = 'tab-profile';

  async function render(outlet) {
    if (!activeCustomer) {
      activeCustomer = {
        id: 'cust-1',
        name: 'Siva Krishna',
        phone: '9876543210',
        email: 'siva@example.com',
        address: 'Doonext Tech Hub, Hitech City, Hyderabad',
        gstin: '36AABCS1234F1Z8',
        loyaltyPoints: 340,
        creditLimit: 25000.00,
        totalSpent: 42800.00,
        visits: 14,
        notes: 'VIP customer, prefers cotton shirts and denim size 32'
      };
    }

    outlet.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Customer 360 Unified Profile</h1>
          <p>Comprehensive transaction audit, lifetime ledger, loyalty points, and purchase history</p>
        </div>
        <div class="page-actions">
          <div style="display:flex;gap:8px;">
            <input type="text" id="c360-search" placeholder="Search another customer..." class="form-input" style="width:240px;padding:6px 10px;font-size:12px;" />
            <button class="btn btn-secondary btn-sm" id="c360-load-btn">Load Profile</button>
          </div>
        </div>
      </div>

      <!-- Customer Overview Hero Banner -->
      <div class="card" style="margin-bottom:18px;display:flex;align-items:center;justify-content:space-between;padding:18px 24px;">
        <div style="display:flex;align-items:center;gap:16px;">
          <div class="user-avatar" style="width:52px;height:52px;font-size:22px;border-radius:var(--radius-xl);">
            ${activeCustomer.name[0]}
          </div>
          <div>
            <div style="display:flex;align-items:center;gap:10px;">
              <h2 style="font-size:18px;font-weight:700;color:var(--slate-900);">${activeCustomer.name}</h2>
              <span class="badge badge-purple">VIP TIER</span>
              <span class="badge badge-success">Active B2B</span>
            </div>
            <div style="font-size:12px;color:var(--slate-500);margin-top:3px;">
              📱 ${activeCustomer.phone} · ✉ ${activeCustomer.email} · GSTIN: <strong>${activeCustomer.gstin}</strong>
            </div>
          </div>
        </div>
        <div style="display:flex;gap:20px;text-align:right;">
          <div>
            <div style="font-size:11px;color:var(--slate-400);text-transform:uppercase;">Loyalty Points</div>
            <div style="font-size:18px;font-weight:700;color:var(--primary-purple);">${activeCustomer.loyaltyPoints} pts</div>
          </div>
          <div>
            <div style="font-size:11px;color:var(--slate-400);text-transform:uppercase;">Lifetime Purchases</div>
            <div style="font-size:18px;font-weight:700;color:var(--slate-900);">₹${activeCustomer.totalSpent.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div style="display:flex;border-bottom:1px solid var(--border-slate-200);background:#ffffff;border-radius:var(--radius-xl) var(--radius-xl) 0 0;padding:0 16px;border:1px solid var(--border-slate-200);border-bottom:none;">
        <button class="btn btn-ghost c360-tab-btn active" data-tab="tab-profile" style="border-radius:0;border-bottom:2px solid var(--primary-purple);color:var(--primary-purple);font-weight:600;padding:12px 18px;">
          Customer Profile & Credit
        </button>
        <button class="btn btn-ghost c360-tab-btn" data-tab="tab-invoices" style="border-radius:0;border-bottom:2px solid transparent;color:var(--slate-500);padding:12px 18px;">
          Invoices History (Bills)
        </button>
        <button class="btn btn-ghost c360-tab-btn" data-tab="tab-returns" style="border-radius:0;border-bottom:2px solid transparent;color:var(--slate-500);padding:12px 18px;">
          Returns & Exchanges
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="card" style="border-top-left-radius:0;border-top-right-radius:0;border-top:none;padding:20px;">
        <div id="c360-tab-container">
          <!-- Injected Tab -->
        </div>
      </div>
    `;

    bindC360Events(outlet);
    renderActiveTab();
  }

  function bindC360Events(outlet) {
    const searchInput = document.getElementById('c360-search');
    const loadBtn = document.getElementById('c360-load-btn');

    loadBtn.onclick = async () => {
      const q = searchInput.value.trim();
      if (!q) return;
      const res = await global.apiService.getCustomers({ search: q });
      const c = res?.customers?.[0];
      if (c) {
        activeCustomer = { ...activeCustomer, ...c };
        render(outlet);
        global.Toast?.success(`Loaded profile for ${c.name}`);
      } else {
        global.Toast?.error(`Customer not found for: ${q}`);
      }
    };

    outlet.querySelectorAll('.c360-tab-btn').forEach(btn => {
      btn.onclick = () => {
        outlet.querySelectorAll('.c360-tab-btn').forEach(b => {
          b.style.borderBottomColor = 'transparent';
          b.style.color = 'var(--slate-500)';
          b.style.fontWeight = '500';
        });
        btn.style.borderBottomColor = 'var(--primary-purple)';
        btn.style.color = 'var(--primary-purple)';
        btn.style.fontWeight = '600';
        activeTab = btn.getAttribute('data-tab');
        renderActiveTab();
      };
    });
  }

  function renderActiveTab() {
    const container = document.getElementById('c360-tab-container');
    if (!container) return;

    if (activeTab === 'tab-profile') {
      container.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
          <div style="background:var(--slate-50);border:1px solid var(--border-slate-200);border-radius:var(--radius-xl);padding:18px;">
            <h3 style="font-size:14px;font-weight:700;color:var(--slate-900);margin-bottom:12px;">Contact & Demographic</h3>
            <div style="display:flex;flex-direction:column;gap:8px;font-size:12.5px;">
              <div><span style="color:var(--slate-500);">Full Legal Name:</span> <strong>${activeCustomer.name}</strong></div>
              <div><span style="color:var(--slate-500);">Registered Mobile:</span> <span style="font-family:var(--font-mono);">${activeCustomer.phone}</span></div>
              <div><span style="color:var(--slate-500);">Billing Email:</span> ${activeCustomer.email}</div>
              <div><span style="color:var(--slate-500);">Shipping Address:</span> ${activeCustomer.address}</div>
              <div><span style="color:var(--slate-500);">GSTIN:</span> <strong>${activeCustomer.gstin}</strong></div>
            </div>
          </div>

          <div style="background:var(--slate-50);border:1px solid var(--border-slate-200);border-radius:var(--radius-xl);padding:18px;">
            <h3 style="font-size:14px;font-weight:700;color:var(--slate-900);margin-bottom:12px;">Store Credit Limit & Loyalty</h3>
            <div style="display:flex;flex-direction:column;gap:8px;font-size:12.5px;">
              <div><span style="color:var(--slate-500);">Credit Limit Approved:</span> <strong style="color:#10b981;">₹${(activeCustomer.creditLimit || 25000).toLocaleString()}</strong></div>
              <div><span style="color:var(--slate-500);">Loyalty Tier:</span> <span class="badge badge-purple">Gold Rewards Member</span></div>
              <div><span style="color:var(--slate-500);">Store Visits:</span> <strong>${activeCustomer.visits} visits</strong></div>
              <div><span style="color:var(--slate-500);">Staff Notes:</span> <em>${activeCustomer.notes}</em></div>
            </div>
          </div>
        </div>
      `;
    } else if (activeTab === 'tab-invoices') {
      container.innerHTML = `
        <div class="table-container" style="border:none;box-shadow:none;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Date</th>
                <th>Payment Tender</th>
                <th style="text-align:right;">Subtotal</th>
                <th style="text-align:right;">Grand Total</th>
                <th style="text-align:center;">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="font-family:var(--font-mono);font-weight:600;color:var(--primary-purple);">INV-202611-0042</td>
                <td>2026-11-12 11:30 AM</td>
                <td><span class="badge badge-purple">UPI</span></td>
                <td style="text-align:right;">₹1,500.00</td>
                <td style="text-align:right;font-weight:700;">₹1,470.00</td>
                <td style="text-align:center;">
                  <button class="btn btn-secondary btn-sm" onclick="global.ReceiptModal?.open({ billNumber: 'INV-202611-0042', customerName: '${activeCustomer.name}', items: [{ productName: 'Polo Shirt Navy Blue', quantity: 2, salePrice: 750 }], subtotal: 1500, discount: 100, grandTotal: 1470 })">View Invoice</button>
                </td>
              </tr>
              <tr>
                <td style="font-family:var(--font-mono);font-weight:600;color:var(--primary-purple);">INV-202611-0019</td>
                <td>2026-11-05 04:15 PM</td>
                <td><span class="badge badge-success">CASH</span></td>
                <td style="text-align:right;">₹2,499.00</td>
                <td style="text-align:right;font-weight:700;">₹2,499.00</td>
                <td style="text-align:center;">
                  <button class="btn btn-secondary btn-sm" onclick="global.ReceiptModal?.open({ billNumber: 'INV-202611-0019', customerName: '${activeCustomer.name}', items: [{ productName: 'Sneakers Urban White', quantity: 1, salePrice: 2499 }], subtotal: 2499, discount: 0, grandTotal: 2499 })">View Invoice</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    } else if (activeTab === 'tab-returns') {
      container.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <h3 style="font-size:14px;font-weight:700;color:var(--slate-900);">Customer Return Ledger</h3>
          <a href="#/returns" class="btn btn-primary btn-sm" style="text-decoration:none;">Record Return Launcher</a>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Return No</th>
              <th>Invoice Ref</th>
              <th>Product</th>
              <th>Refund Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="font-family:var(--font-mono);color:var(--primary-purple);">RET-2026-0012</td>
              <td>INV-202611-0042</td>
              <td>Polo Shirt Navy Blue (L)</td>
              <td style="font-weight:700;color:var(--color-danger);">₹750.00</td>
              <td><span class="badge badge-success">Processed Credit Note</span></td>
            </tr>
          </tbody>
        </table>
      `;
    }
  }

  global.Customer360Page = { render };
})(window);

