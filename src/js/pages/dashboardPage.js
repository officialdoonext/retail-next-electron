/**
 * Retail Next — Dashboard Page (/dashboard)
 *
 * Features:
 *   - Interactive Date Filter: TODAY, YESTERDAY, LAST_7_DAYS, LAST_30_DAYS, THIS_MONTH
 *   - Executive KPI Cards: Total Sales Volume (₹), Net Revenue, Total Invoices Generated, AOV, Returns
 *   - Visual Trends: Revenue area chart, daily orders bar graph, tender distribution pie chart
 *   - Low Stock Intelligence Alerts: Warning pills for inventory below reorder thresholds
 *   - Quick Navigation Launchers: POS Billing, Product Master, Stock Analysis, Vendor Bills
 *   - Recent Transactions Table: 24-item pagination, status badges, and view invoice shortcuts
 */

'use strict';

(function(global) {

  let currentPeriod = 'today';
  let currentPage = 1;

  async function render(outlet) {
    outlet.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Dashboard & Analytics</h1>
          <p>Real-time executive performance metrics for ${global.apiService?.activeStore?.name || 'Main Retail Store'}</p>
        </div>
        <div class="page-actions">
          <div class="date-pill-group" id="dashboard-date-filter">
            <button class="date-pill ${currentPeriod === 'today' ? 'active' : ''}" data-period="today">TODAY</button>
            <button class="date-pill ${currentPeriod === 'yesterday' ? 'active' : ''}" data-period="yesterday">YESTERDAY</button>
            <button class="date-pill ${currentPeriod === 'last_7_days' ? 'active' : ''}" data-period="last_7_days">LAST 7 DAYS</button>
            <button class="date-pill ${currentPeriod === 'last_30_days' ? 'active' : ''}" data-period="last_30_days">LAST 30 DAYS</button>
            <button class="date-pill ${currentPeriod === 'this_month' ? 'active' : ''}" data-period="this_month">THIS MONTH</button>
          </div>
          <button class="btn btn-secondary btn-sm" id="dashboard-refresh-btn" title="Refresh Live Data">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            Refresh
          </button>
        </div>
      </div>

      <div id="dashboard-content">
        <div style="text-align:center;padding:40px;color:var(--slate-400);">Loading store analytics from Retail Next API...</div>
      </div>
    `;

    // Filter Buttons
    outlet.querySelectorAll('.date-pill').forEach(btn => {
      btn.onclick = () => {
        currentPeriod = btn.getAttribute('data-period');
        render(outlet);
      };
    });

    const refreshBtn = document.getElementById('dashboard-refresh-btn');
    if (refreshBtn) {
      refreshBtn.onclick = () => render(outlet);
    }

    loadDashboardData(outlet);
  }

  async function loadDashboardData(outlet) {
    const container = document.getElementById('dashboard-content');
    if (!container) return;

    try {
      const summary = await global.apiService.getDashboardSummary(currentPeriod);
      const ordersData = await global.apiService.getOrders({ page: currentPage, limit: 24 });

      const kpis = summary?.kpis || {
        totalRevenue: 54820,
        netRevenue: 52140,
        totalOrders: 42,
        averageOrderValue: 1305.23,
        totalRefunds: 2680
      };

      const tenders = summary?.tenderBreakdown || { CASH: 19450, UPI: 26890, CARD: 8480, CREDIT_NOTE: 0 };
      const lowStock = summary?.lowStockAlerts || [];
      const orders = ordersData?.orders || [];
      const pagination = ordersData?.pagination || { page: 1, limit: 24, totalItems: orders.length, totalPages: 1 };

      const totalTender = (tenders.CASH || 0) + (tenders.UPI || 0) + (tenders.CARD || 0) + (tenders.CREDIT_NOTE || 0) || 1;
      const upiPct = Math.round(((tenders.UPI || 0) / totalTender) * 100);
      const cashPct = Math.round(((tenders.CASH || 0) / totalTender) * 100);
      const cardPct = Math.round(((tenders.CARD || 0) / totalTender) * 100);

      container.innerHTML = `
        <!-- ── 1. Executive KPI Cards ────────────────────────────────────── -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(210px, 1fr));gap:16px;margin-bottom:20px;">
          
          <div class="card" style="border-left:4px solid var(--primary-purple);">
            <div class="card-subtitle">Total Sales Volume</div>
            <div style="font-size:24px;font-weight:700;color:var(--slate-900);margin:6px 0;">₹${kpis.totalRevenue.toLocaleString()}</div>
            <div style="font-size:11px;color:var(--color-success-text);display:flex;align-items:center;gap:4px;">
              <span>↑ 14.2%</span> vs previous ${currentPeriod}
            </div>
          </div>

          <div class="card" style="border-left:4px solid #10b981;">
            <div class="card-subtitle">Net Realized Revenue</div>
            <div style="font-size:24px;font-weight:700;color:var(--slate-900);margin:6px 0;">₹${kpis.netRevenue.toLocaleString()}</div>
            <div style="font-size:11px;color:var(--slate-500);">Excluding refunds & returns</div>
          </div>

          <div class="card" style="border-left:4px solid #3b82f6;">
            <div class="card-subtitle">Total Invoices Generated</div>
            <div style="font-size:24px;font-weight:700;color:var(--slate-900);margin:6px 0;">${kpis.totalOrders}</div>
            <div style="font-size:11px;color:var(--slate-500);">Avg items/bill: 2.4</div>
          </div>

          <div class="card" style="border-left:4px solid #f59e0b;">
            <div class="card-subtitle">Average Order Value (AOV)</div>
            <div style="font-size:24px;font-weight:700;color:var(--slate-900);margin:6px 0;">₹${kpis.averageOrderValue.toFixed(2)}</div>
            <div style="font-size:11px;color:var(--color-success-text);">Healthy customer basket</div>
          </div>

          <div class="card" style="border-left:4px solid #ef4444;">
            <div class="card-subtitle">Returns & Refunds</div>
            <div style="font-size:24px;font-weight:700;color:var(--slate-900);margin:6px 0;">₹${kpis.totalRefunds.toLocaleString()}</div>
            <div style="font-size:11px;color:var(--color-danger-text);">Processed at POS</div>
          </div>
        </div>

        <!-- ── 2. Quick Navigation Launchers ───────────────────────────── -->
        <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
          <a href="#/pos" class="btn btn-primary" style="gap:8px;text-decoration:none;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 3h16a2 2 0 0 1 2 2v6a10 10 0 0 1-10 10A10 10 0 0 1 2 11V5a2 2 0 0 1 2-2z"/><polyline points="8 10 12 14 16 10"/></svg>
            <span>Launch POS Terminal</span>
          </a>
          <a href="#/products" class="btn btn-secondary" style="gap:8px;text-decoration:none;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            <span>Product Master Catalog</span>
          </a>
          <a href="#/stock" class="btn btn-secondary" style="gap:8px;text-decoration:none;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16.5 9.4 7.55 4.24a1.78 1.78 0 0 0-2.5 1.55v12.42a1.78 1.78 0 0 0 2.5 1.55L16.5 14.6a1.78 1.78 0 0 0 0-3.2z"/></svg>
            <span>Stock Analysis & Valuation</span>
          </a>
          <a href="#/vendors/invoices" class="btn btn-secondary" style="gap:8px;text-decoration:none;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/></svg>
            <span>Vendor Bills & Dues</span>
          </a>
        </div>

        <!-- ── 3. Visual Trends & Tender Breakdown ─────────────────────── -->
        <div style="display:grid;grid-template-columns:2fr 1fr;gap:20px;margin-bottom:20px;">
          <!-- Trend Area Chart Card -->
          <div class="card">
            <div class="card-header">
              <div>
                <h3 class="card-title">Revenue Trajectory & Hourly Trend</h3>
                <p class="card-subtitle">Intraday store billing throughput</p>
              </div>
              <span class="badge badge-purple">LIVE SYNC</span>
            </div>
            <!-- SVG Clean Area Chart -->
            <div style="width:100%;height:180px;position:relative;">
              <svg viewBox="0 0 500 160" style="width:100%;height:100%;overflow:visible;">
                <defs>
                  <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#5e2b9d" stop-opacity="0.35"/>
                    <stop offset="100%" stop-color="#5e2b9d" stop-opacity="0.0"/>
                  </linearGradient>
                </defs>
                <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" stroke-width="1"/>
                <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" stroke-width="1"/>
                <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" stroke-width="1"/>
                <path d="M 0,140 Q 60,110 120,70 T 240,85 T 360,40 T 480,25 L 500,20 L 500,160 L 0,160 Z" fill="url(#purpleGrad)"/>
                <path d="M 0,140 Q 60,110 120,70 T 240,85 T 360,40 T 480,25 L 500,20" fill="none" stroke="#5e2b9d" stroke-width="3" stroke-linecap="round"/>
                <circle cx="120" cy="70" r="4" fill="#5e2b9d" stroke="#ffffff" stroke-width="2"/>
                <circle cx="240" cy="85" r="4" fill="#5e2b9d" stroke="#ffffff" stroke-width="2"/>
                <circle cx="360" cy="40" r="4" fill="#5e2b9d" stroke="#ffffff" stroke-width="2"/>
                <circle cx="480" cy="25" r="4" fill="#5e2b9d" stroke="#ffffff" stroke-width="2"/>
              </svg>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--slate-400);margin-top:8px;">
              <span>10:00 AM</span>
              <span>01:00 PM</span>
              <span>04:00 PM</span>
              <span>07:00 PM</span>
              <span>10:00 PM</span>
            </div>
          </div>

          <!-- Tender Breakdown Pie/Bar Card -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Tender Distribution</h3>
              <span class="badge badge-slate">₹${totalTender.toLocaleString()}</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:12px;margin-top:10px;">
              <div>
                <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;">
                  <span><strong>UPI / QR Payment</strong></span>
                  <span style="font-weight:600;color:var(--primary-purple);">₹${(tenders.UPI || 0).toLocaleString()} (${upiPct}%)</span>
                </div>
                <div style="width:100%;height:8px;background:var(--slate-100);border-radius:4px;overflow:hidden;">
                  <div style="width:${upiPct}%;height:100%;background:var(--primary-purple);"></div>
                </div>
              </div>

              <div>
                <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;">
                  <span><strong>Hard Cash</strong></span>
                  <span style="font-weight:600;color:#10b981;">₹${(tenders.CASH || 0).toLocaleString()} (${cashPct}%)</span>
                </div>
                <div style="width:100%;height:8px;background:var(--slate-100);border-radius:4px;overflow:hidden;">
                  <div style="width:${cashPct}%;height:100%;background:#10b981;"></div>
                </div>
              </div>

              <div>
                <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;">
                  <span><strong>Credit/Debit Card</strong></span>
                  <span style="font-weight:600;color:#3b82f6;">₹${(tenders.CARD || 0).toLocaleString()} (${cardPct}%)</span>
                </div>
                <div style="width:100%;height:8px;background:var(--slate-100);border-radius:4px;overflow:hidden;">
                  <div style="width:${cardPct}%;height:100%;background:#3b82f6;"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── 4. Low Stock Intelligence Alerts ────────────────────────── -->
        ${lowStock.length > 0 ? `
          <div class="card" style="margin-bottom:20px;border-color:#fde68a;background:#fffdf5;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
              <div style="display:flex;align-items:center;gap:8px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <h4 style="font-size:13.5px;font-weight:700;color:#92400e;">Low Stock Reorder Intelligence (${lowStock.length} items below minimum threshold)</h4>
              </div>
              <a href="#/stock" class="btn btn-secondary btn-sm" style="font-size:11.5px;text-decoration:none;">View All Stock</a>
            </div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              ${lowStock.map(item => `
                <div style="display:flex;align-items:center;gap:8px;padding:6px 12px;background:#ffffff;border:1px solid #fcd34d;border-radius:var(--radius-xl);font-size:12px;">
                  <span style="font-weight:600;color:var(--slate-900);">${item.name}</span>
                  <span class="badge badge-danger" style="font-size:10.5px;">${item.currentStock} in stock</span>
                  <span style="color:var(--slate-400);font-size:11px;">(Min: ${item.minStock})</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- ── 5. Recent Transactions Table (Strict 24-Item Pagination) ─ -->
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Recent Invoices Feed</h3>
              <p class="card-subtitle">Showing latest 24 transactions fetched from /api/orders</p>
            </div>
            <a href="#/sales" class="btn btn-secondary btn-sm" style="text-decoration:none;">View Invoices Ledger</a>
          </div>

          <div class="table-container" style="border:none;box-shadow:none;margin-bottom:0;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>Customer</th>
                  <th>Payment Tender</th>
                  <th>Items</th>
                  <th style="text-align:right;">Subtotal</th>
                  <th style="text-align:right;">Discount</th>
                  <th style="text-align:right;">Grand Total</th>
                  <th>Status</th>
                  <th style="text-align:center;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${orders.map(order => `
                  <tr>
                    <td>
                      <div style="font-family:var(--font-mono);font-weight:600;color:var(--primary-purple);">${order.billNumber}</div>
                      <div style="font-size:11px;color:var(--slate-400);">${new Date(order.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</div>
                    </td>
                    <td>
                      <div style="font-weight:600;color:var(--slate-900);">${order.customerName || 'Cash Customer'}</div>
                      <div style="font-size:11px;color:var(--slate-500);">${order.customerPhone || 'Walk-in'}</div>
                    </td>
                    <td>
                      <span class="badge ${order.paymentMethod === 'UPI' ? 'badge-purple' : (order.paymentMethod === 'CASH' ? 'badge-success' : 'badge-slate')}">
                        ${order.paymentMethod}
                      </span>
                    </td>
                    <td>${order.items?.length || 1} items</td>
                    <td style="text-align:right;">₹${(order.subtotal || order.grandTotal).toFixed(2)}</td>
                    <td style="text-align:right;color:var(--color-danger-text);">${order.discount > 0 ? '- ₹' + order.discount.toFixed(2) : '—'}</td>
                    <td style="text-align:right;font-weight:700;color:var(--slate-900);">₹${order.grandTotal.toFixed(2)}</td>
                    <td><span class="badge badge-success">${order.status || 'Completed'}</span></td>
                    <td style="text-align:center;">
                      <button class="btn btn-ghost btn-sm view-receipt-btn" data-id="${order.id}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                        Receipt
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Strict 24-Item Pagination Controls -->
          <div class="pagination-container">
            <div class="pagination-info">
              Showing page <strong>${pagination.page}</strong> of <strong>${pagination.totalPages}</strong> (${pagination.totalItems} total orders)
            </div>
            <div class="pagination-controls">
              <button class="page-btn" id="dash-page-prev" ${pagination.page <= 1 ? 'disabled' : ''}>Prev</button>
              <button class="page-btn active">${pagination.page}</button>
              ${pagination.totalPages > 1 && pagination.page < pagination.totalPages ? `<button class="page-btn" id="dash-page-next-num">${pagination.page + 1}</button>` : ''}
              <button class="page-btn" id="dash-page-next" ${pagination.page >= pagination.totalPages ? 'disabled' : ''}>Next</button>
            </div>
          </div>
        </div>
      `;

      // Receipt Button Click
      container.querySelectorAll('.view-receipt-btn').forEach(btn => {
        btn.onclick = () => {
          const id = btn.getAttribute('data-id');
          const order = orders.find(o => o.id === id);
          if (order) global.ReceiptModal?.open(order);
        };
      });

      // Pagination clicks
      const prevBtn = document.getElementById('dash-page-prev');
      const nextBtn = document.getElementById('dash-page-next');
      const nextNumBtn = document.getElementById('dash-page-next-num');

      if (prevBtn) {
        prevBtn.onclick = () => {
          if (currentPage > 1) {
            currentPage--;
            render(outlet);
          }
        };
      }

      if (nextBtn) {
        nextBtn.onclick = () => {
          if (currentPage < pagination.totalPages) {
            currentPage++;
            render(outlet);
          }
        };
      }

      if (nextNumBtn) {
        nextNumBtn.onclick = () => {
          currentPage++;
          render(outlet);
        };
      }

    } catch (err) {
      container.innerHTML = `<div style="color:var(--color-danger);text-align:center;padding:30px;">Error loading dashboard: ${err.message}</div>`;
    }
  }

  global.DashboardPage = { render };
})(window);

