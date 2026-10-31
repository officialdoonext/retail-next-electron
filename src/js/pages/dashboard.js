/**
 * RetailNext — Dashboard Page
 * Implements the recommended desktop layout with 4 KPI cards, Recent Transactions, and Quick Actions.
 */

'use strict';

window.DashboardPage = (() => {

  function renderPage(outlet, statusData) {
    if (!outlet) return;
    outlet.innerHTML = '';
    outlet.className = 'dashboard-container';

    // Retrieve data from RetailStore
    const store = window.RetailStore;
    const products = store ? store.getProducts() : [];
    const invoices = store ? store.getInvoices() : [];
    const purchases = store ? store.getPurchases() : [];
    const customers = store ? store.getCustomers() : [];

    // Calculate live aggregates or placeholders
    const todaySales = invoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
    const purchaseTotal = purchases.reduce((sum, pur) => sum + (Number(pur.totalAmount) || 0), 0);
    const stockItemsCount = products.length;
    const totalOutstanding = customers.reduce((sum, c) => sum + (Number(c.outstanding) || 0), 0);

    const formatCurrency = (val) => '₹' + Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const html = `
      <div class="desktop-dashboard">

        <!-- Top Title Bar -->
        <div class="dash-header">
          <div>
            <div class="dash-header__badge">Branch: Main Store</div>
            <h1 class="dash-header__title">RetailNext Dashboard</h1>
          </div>
          <div class="dash-header__actions">
            <button class="btn btn--outline" id="dash-btn-refresh">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              Refresh (F5)
            </button>
            <button class="btn btn--primary" id="dash-btn-new-bill">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Bill (F2)
            </button>
          </div>
        </div>

        <!-- 4 KPI Cards (As Specified in Section 5) -->
        <div class="dash-kpi-grid">
          
          <!-- Card 1: Today's Sales -->
          <div class="kpi-card kpi-card--sales">
            <div class="kpi-card__header">
              <span class="kpi-card__label">Today's Sales</span>
              <div class="kpi-card__icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
            </div>
            <div class="kpi-card__value">${todaySales > 0 ? formatCurrency(todaySales) : '₹—'}</div>
            <div class="kpi-card__sub">${invoices.length} invoices generated today</div>
          </div>

          <!-- Card 2: Purchase Total -->
          <div class="kpi-card kpi-card--purchase">
            <div class="kpi-card__header">
              <span class="kpi-card__label">Purchase Total</span>
              <div class="kpi-card__icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </div>
            </div>
            <div class="kpi-card__value">${purchaseTotal > 0 ? formatCurrency(purchaseTotal) : '₹—'}</div>
            <div class="kpi-card__sub">${purchases.length} supplier orders received</div>
          </div>

          <!-- Card 3: Stock Items -->
          <div class="kpi-card kpi-card--stock">
            <div class="kpi-card__header">
              <span class="kpi-card__label">Stock Items</span>
              <div class="kpi-card__icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
            </div>
            <div class="kpi-card__value">${stockItemsCount > 0 ? stockItemsCount + ' Items' : '—'}</div>
            <div class="kpi-card__sub">Cataloged across active categories</div>
          </div>

          <!-- Card 4: Outstanding -->
          <div class="kpi-card kpi-card--outstanding">
            <div class="kpi-card__header">
              <span class="kpi-card__label">Outstanding</span>
              <div class="kpi-card__icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                </svg>
              </div>
            </div>
            <div class="kpi-card__value">${totalOutstanding > 0 ? formatCurrency(totalOutstanding) : '₹—'}</div>
            <div class="kpi-card__sub">Total customer receivables due</div>
          </div>

        </div>

        <!-- Middle Section: Recent Transactions & Quick Navigation -->
        <div class="dash-columns">

          <!-- Left Column: Recent Transactions (Specified in Section 5) -->
          <div class="dash-box dash-box--transactions">
            <div class="dash-box__header">
              <div class="dash-box__title-group">
                <h2 class="dash-box__title">Recent Transactions</h2>
                <span class="dash-box__subtitle">Live invoice and sales log</span>
              </div>
              <button class="dash-box__action-btn" id="dash-view-all-sales">View All Invoices &rarr;</button>
            </div>

            <div class="table-container">
              <table class="erp-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Customer</th>
                    <th>Date / Time</th>
                    <th>Payment Mode</th>
                    <th style="text-align:right;">Amount</th>
                    <th style="text-align:center;">Status</th>
                  </tr>
                </thead>
                <tbody id="dash-recent-tbody">
                  ${invoices.length > 0 ? invoices.slice(0, 6).map(inv => `
                    <tr>
                      <td class="font-mono font-bold text-brand">${inv.invoiceNo}</td>
                      <td>${inv.customerName || 'Walk-in Customer'}</td>
                      <td class="text-secondary font-mono">${inv.date}</td>
                      <td>
                        <span class="pay-chip pay-chip--${(inv.paymentMode || '').toLowerCase()}">${inv.paymentMode}</span>
                      </td>
                      <td style="text-align:right;" class="font-bold">₹${Number(inv.amount).toFixed(2)}</td>
                      <td style="text-align:center;">
                        <span class="status-chip status-chip--${inv.status === 'Paid' ? 'success' : 'warning'}">${inv.status}</span>
                      </td>
                    </tr>
                  `).join('') : `
                    <tr>
                      <td colspan="6" class="table-empty">
                        <div class="table-empty__text">Recent invoices appear here.</div>
                        <div class="table-empty__sub">Press F2 to create your first sales bill.</div>
                      </td>
                    </tr>
                  `}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Right Column: Quick Launch Actions -->
          <div class="dash-box dash-box--actions">
            <div class="dash-box__header">
              <h2 class="dash-box__title">Quick Operations</h2>
            </div>
            <div class="quick-actions-list">
              <div class="action-tile" data-route="pos-billing">
                <div class="action-tile__icon bg-blue">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </div>
                <div class="action-tile__info">
                  <div class="action-tile__name">New Sales Bill</div>
                  <div class="action-tile__desc">Barcode POS billing & invoice generation</div>
                </div>
                <span class="action-tile__kbd">F2</span>
              </div>

              <div class="action-tile" data-route="product-add">
                <div class="action-tile__icon bg-emerald">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  </svg>
                </div>
                <div class="action-tile__info">
                  <div class="action-tile__name">Add Product</div>
                  <div class="action-tile__desc">SKU, Barcode, Pricing & GST Setup</div>
                </div>
                <span class="action-tile__kbd">F3</span>
              </div>

              <div class="action-tile" data-route="purchase-entry">
                <div class="action-tile__icon bg-violet">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
                  </svg>
                </div>
                <div class="action-tile__info">
                  <div class="action-tile__name">Purchase Entry</div>
                  <div class="action-tile__desc">Supplier invoices & inward inventory</div>
                </div>
                <span class="action-tile__kbd">F6</span>
              </div>

              <div class="action-tile" data-route="customers">
                <div class="action-tile__icon bg-cyan">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  </svg>
                </div>
                <div class="action-tile__info">
                  <div class="action-tile__name">Customer Master</div>
                  <div class="action-tile__desc">Manage balances, dues & loyalty points</div>
                </div>
                <span class="action-tile__kbd">F9</span>
              </div>

              <div class="action-tile" data-route="reports">
                <div class="action-tile__icon bg-amber">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                </div>
                <div class="action-tile__info">
                  <div class="action-tile__name">Business Reports</div>
                  <div class="action-tile__desc">Daily Sales, Stock Valuation & GST summary</div>
                </div>
                <span class="action-tile__arrow">&rarr;</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    `;

    outlet.innerHTML = html;

    // Attach event listeners
    const refreshBtn = outlet.querySelector('#dash-btn-refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        renderPage(outlet, statusData);
      });
    }

    const newBillBtn = outlet.querySelector('#dash-btn-new-bill');
    if (newBillBtn) {
      newBillBtn.addEventListener('click', () => {
        if (window.RetailRouter) window.RetailRouter.navigate('pos-billing', 'New Sales Bill (POS)');
      });
    }

    const viewAllBtn = outlet.querySelector('#dash-view-all-sales');
    if (viewAllBtn) {
      viewAllBtn.addEventListener('click', () => {
        if (window.RetailRouter) window.RetailRouter.navigate('sales-list', 'Sales Invoices');
      });
    }

    outlet.querySelectorAll('.action-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        const route = tile.getAttribute('data-route');
        const title = tile.querySelector('.action-tile__name').textContent;
        if (route && window.RetailRouter) {
          window.RetailRouter.navigate(route, title);
        }
      });
    });
  }

  return { renderPage };
})();
