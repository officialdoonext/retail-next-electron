/**
 * Retail Next — Universal Global Search & Fast Navigation (Ctrl+F)
 */

'use strict';

(function(global) {
  let modalEl = null;

  const ALL_PAGES = [
    { title: 'Dashboard', route: '/dashboard', category: 'General', desc: 'Executive control center & real-time store KPIs' },
    { title: 'POS Billing', route: '/pos', category: 'Billing', desc: 'Ultra-fast cash register & barcode checkout' },
    { title: 'Stores Directory', route: '/stores', category: 'Stores', desc: 'Multi-store retail branches & license tracking' },
    
    // Sales Manager
    { title: 'Sales (Invoices History)', route: '/sales', category: 'Sales Manager', desc: 'Completed, held, and refunded invoices ledger' },
    { title: 'Employee Sales Leaderboard', route: '/sales/employee-sales', category: 'Sales Manager', desc: 'Staff revenue attribution & sales performance' },
    { title: 'Counter Sales Reconciliation', route: '/sales/counter-sales', category: 'Sales Manager', desc: 'Cashier register drawer closing & tenders' },
    
    // Product Manager
    { title: 'Categories Directory', route: '/categories', category: 'Product Manager', desc: 'Product category hierarchy and master list' },
    { title: 'Variations & Attributes', route: '/variations', category: 'Product Manager', desc: 'Sizes, colors, materials, and attribute matrices' },
    { title: 'Products Catalog', route: '/products', category: 'Product Manager', desc: 'Master product inventory with SKU, HSN, and prices' },
    { title: 'Barcode & QR Generator', route: '/barcode', category: 'Product Manager', desc: 'Dynamic barcode label roll generator for printers' },
    
    // Return & Exchange Manager
    { title: 'Customer Returns', route: '/returns', category: 'Return & Exchange', desc: 'Process customer product returns & credit notes' },
    { title: 'Product Exchanges', route: '/returns/exchanges', category: 'Return & Exchange', desc: 'Side-by-side replacement & difference calculation' },
    
    // Stock Manager
    { title: 'Warehouse Stocks', route: '/stock/warehouse', category: 'Stock Manager', desc: 'Central warehouse balances, racks, and serials' },
    { title: 'Store Branch Stocks', route: '/stock', category: 'Stock Manager', desc: 'Current store levels & inventory valuation' },
    { title: 'Stock Transfers', route: '/stock/transfers', category: 'Stock Manager', desc: 'Store-to-store & warehouse movement challans' },
    
    // Customer Manager
    { title: 'Customer Directory', route: '/customers', category: 'Customer Manager', desc: 'Customer profiles, contact info, and loyalty points' },
    { title: 'Individual Customer 360', route: '/customers/individual', category: 'Customer Manager', desc: 'Unified customer audit, bills, and returns ledger' },
    
    // Discount Manager
    { title: 'Order Promo Coupons', route: '/discounts/order-coupons', category: 'Discount Manager', desc: 'Cart-wide promo codes & flat/percentage discounts' },
    { title: 'Product Coupons', route: '/discounts/product-coupons', category: 'Discount Manager', desc: 'SKU and category-specific promotional rules' },
    { title: 'Customer VIP Coupons', route: '/discounts/customer-coupons', category: 'Discount Manager', desc: 'Personalized VIP customer tier discount codes' },
    
    // Vendors Manager
    { title: 'Vendors Directory', route: '/vendors', category: 'Vendors Manager', desc: 'Suppliers directory, GSTIN, and payables ledger' },
    { title: 'Purchase Orders', route: '/vendors/orders', category: 'Vendors Manager', desc: 'Create and track procurement purchase orders' },
    { title: 'Vendor Invoices (Bills)', route: '/vendors/invoices', category: 'Vendors Manager', desc: 'Record supplier billing invoices & payments' },
    { title: 'Vendor Dues & Settlements', route: '/vendors/due', category: 'Vendors Manager', desc: 'Outstanding supplier balances & settlement' },
    
    // Staff Manager
    { title: 'Staff Accounts & MPIN', route: '/staff', category: 'Staff Manager', desc: 'Cashier logins, 4-digit MPIN, and module permissions' },
    
    // Employee HR Manager
    { title: 'Employee Directory', route: '/employees', category: 'Employee HR Manager', desc: 'Staff profiles, designations, and salary records' },
    { title: 'Attendance & Muster Roll', route: '/employees/attendance', category: 'Employee HR Manager', desc: 'Daily attendance marking, leave tracking, and QR muster' },
    { title: 'Payroll & Salary Register', route: '/employees/payroll', category: 'Employee HR Manager', desc: 'Monthly salary calculation, deductions, and payslips' },
    { title: 'ID Card Badges', route: '/employees/id-cards', category: 'Employee HR Manager', desc: 'Printable PVC badges with employee attendance QR' },
    { title: 'Staff Leaves Management', route: '/employees/leaves', category: 'Employee HR Manager', desc: 'Leave requests, quota tracking, and approvals' },
    { title: 'Advances & Repayment', route: '/employees/advances', category: 'Employee HR Manager', desc: 'Salary loan advances and installment repayments' }
  ];

  function openSearch() {
    if (document.getElementById('rn-global-search-modal')) return;

    modalEl = document.createElement('div');
    modalEl.id = 'rn-global-search-modal';
    modalEl.className = 'modal-overlay';

    modalEl.innerHTML = `
      <div class="modal-container" style="max-width:620px;max-height:80vh;">
        <div style="padding:16px 20px;border-bottom:1px solid var(--border-slate-200);display:flex;align-items:center;gap:12px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-purple)" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="global-search-input" placeholder="Search pages, commands, or press Esc to close..." style="flex:1;border:none;outline:none;font-size:15px;color:var(--slate-900);background:transparent;" autofocus />
          <span class="kbd-shortcut">ESC</span>
        </div>
        <div class="modal-body" id="global-search-results" style="padding:10px 14px;max-height:480px;overflow-y:auto;">
          <!-- Injected items -->
        </div>
      </div>
    `;

    document.body.appendChild(modalEl);

    const input = document.getElementById('global-search-input');
    const resultsContainer = document.getElementById('global-search-results');

    function renderList(query = '') {
      const q = query.toLowerCase().trim();
      const filtered = q
        ? ALL_PAGES.filter(p => p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.route.toLowerCase().includes(q))
        : ALL_PAGES;

      if (!filtered.length) {
        resultsContainer.innerHTML = '<div style="text-align:center;padding:30px;color:var(--slate-400);">No matching pages or features found.</div>';
        return;
      }

      resultsContainer.innerHTML = filtered.map(item => `
        <div class="search-result-item" data-route="${item.route}" style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-radius:var(--radius-lg);cursor:pointer;transition:all 0.15s ease;margin-bottom:4px;">
          <div>
            <div style="font-weight:600;font-size:13.5px;color:var(--slate-900);display:flex;align-items:center;gap:8px;">
              ${item.title}
              <span class="badge badge-slate" style="font-size:10px;">${item.category}</span>
            </div>
            <div style="font-size:11.5px;color:var(--slate-500);margin-top:2px;">${item.desc}</div>
          </div>
          <div style="font-size:11px;font-family:var(--font-mono);color:var(--primary-purple);font-weight:600;">
            ${item.route}
          </div>
        </div>
      `).join('');

      resultsContainer.querySelectorAll('.search-result-item').forEach(el => {
        el.onmouseenter = () => el.style.backgroundColor = 'var(--slate-100)';
        el.onmouseleave = () => el.style.backgroundColor = 'transparent';
        el.onclick = () => {
          const route = el.getAttribute('data-route');
          modalEl.remove();
          global.RetailNextRouter?.navigate(route);
        };
      });
    }

    renderList();

    input.oninput = (e) => renderList(e.target.value);
    input.focus();

    // Close on escape or outside click
    modalEl.onclick = (e) => {
      if (e.target === modalEl) modalEl.remove();
    };

    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        modalEl.remove();
        document.removeEventListener('keydown', handleKeydown);
      }
    };
    document.addEventListener('keydown', handleKeydown);
  }

  // Register Ctrl+F shortcut
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      openSearch();
    }
  });

  global.GlobalSearch = { open: openSearch, pages: ALL_PAGES };
})(window);
