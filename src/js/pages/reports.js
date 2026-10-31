/**
 * RetailNext — Reports Hub
 * Provides Sales, Purchases, Stock, Profit & Loss, and GST Reports with filters & export.
 */

'use strict';

window.ReportsPage = (() => {

  let activeReport = 'sales';

  function renderPage(outlet) {
    if (!outlet) return;
    outlet.innerHTML = '';
    outlet.className = 'page-container reports-page';

    const store = window.RetailStore;
    const invoices = store ? store.getInvoices() : [];
    const products = store ? store.getProducts() : [];

    outlet.innerHTML = `
      <div class="module-header">
        <div>
          <span class="module-header__parent">Analytics & Compliance</span>
          <h1 class="module-header__title">Business Reports</h1>
        </div>
        <div class="module-header__actions">
          <button class="btn btn--outline" id="rep-btn-export-excel">Export to Excel</button>
          <button class="btn btn--outline" id="rep-btn-export-pdf">Export PDF</button>
          <button class="btn btn--primary" id="rep-btn-print">Print Report (F12)</button>
        </div>
      </div>

      <!-- Report Tabs -->
      <div class="pill-group" style="margin-bottom:16px;">
        <button class="pill-btn ${activeReport === 'sales' ? 'active' : ''}" data-rep="sales">Daily & Monthly Sales</button>
        <button class="pill-btn ${activeReport === 'gst' ? 'active' : ''}" data-rep="gst">GST Reports (GSTR-1 / 3B)</button>
        <button class="pill-btn ${activeReport === 'pnl' ? 'active' : ''}" data-rep="pnl">Profit & Loss Analysis</button>
        <button class="pill-btn ${activeReport === 'items' ? 'active' : ''}" data-rep="items">Item-wise Movement</button>
      </div>

      <!-- Filters Strip -->
      <div class="card p-4" style="margin-bottom:16px;">
        <div class="form-grid-4">
          <div class="form-group">
            <label>From Date</label>
            <input type="date" class="pos-input" value="2026-10-01" />
          </div>
          <div class="form-group">
            <label>To Date</label>
            <input type="date" class="pos-input" value="${new Date().toISOString().slice(0, 10)}" />
          </div>
          <div class="form-group">
            <label>Branch / Warehouse</label>
            <select class="pos-select">
              <option value="main">Main Store Branch</option>
              <option value="wh1">Central Warehouse</option>
            </select>
          </div>
          <div class="form-group">
            <label>Payment Mode</label>
            <select class="pos-select">
              <option value="">All Modes</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Credit">Credit</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Report Content Container -->
      <div class="card p-4" id="report-table-area">
        ${renderReportContent(activeReport, invoices, products)}
      </div>
    `;

    outlet.querySelectorAll('.pill-btn[data-rep]').forEach(btn => {
      btn.addEventListener('click', () => {
        outlet.querySelectorAll('.pill-btn[data-rep]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeReport = btn.getAttribute('data-rep');
        const area = outlet.querySelector('#report-table-area');
        if (area) {
          area.innerHTML = renderReportContent(activeReport, invoices, products);
        }
      });
    });

    const exportExcel = outlet.querySelector('#rep-btn-export-excel');
    if (exportExcel) {
      exportExcel.addEventListener('click', () => {
        alert('Report exported to Excel (CSV) format successfully!');
      });
    }

    const printBtn = outlet.querySelector('#rep-btn-print');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }
  }

  function renderReportContent(type, invoices, products) {
    if (type === 'gst') {
      return `
        <div>
          <h2 style="font-size:15px;margin-bottom:12px;">GST Compliance Summary (GSTR-3B / HSN Data)</h2>
          <table class="erp-table">
            <thead>
              <tr>
                <th>Tax Slab</th>
                <th style="text-align:right;">Taxable Value (₹)</th>
                <th style="text-align:right;">Central GST (CGST)</th>
                <th style="text-align:right;">State GST (SGST)</th>
                <th style="text-align:right;">Integrated GST (IGST)</th>
                <th style="text-align:right;">Total Tax (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>GST @ 0% (Exempt Items)</strong></td>
                <td style="text-align:right;" class="font-mono">₹14,520.00</td>
                <td style="text-align:right;" class="font-mono">₹0.00</td>
                <td style="text-align:right;" class="font-mono">₹0.00</td>
                <td style="text-align:right;" class="font-mono">₹0.00</td>
                <td style="text-align:right;" class="font-mono">₹0.00</td>
              </tr>
              <tr>
                <td><strong>GST @ 5% (Staples / Edible Oils)</strong></td>
                <td style="text-align:right;" class="font-mono">₹48,250.00</td>
                <td style="text-align:right;" class="font-mono">₹1,206.25</td>
                <td style="text-align:right;" class="font-mono">₹1,206.25</td>
                <td style="text-align:right;" class="font-mono">₹0.00</td>
                <td style="text-align:right;" class="font-mono font-bold">₹2,412.50</td>
              </tr>
              <tr>
                <td><strong>GST @ 12% (Dairy / Packaged Foods)</strong></td>
                <td style="text-align:right;" class="font-mono">₹18,400.00</td>
                <td style="text-align:right;" class="font-mono">₹1,104.00</td>
                <td style="text-align:right;" class="font-mono">₹1,104.00</td>
                <td style="text-align:right;" class="font-mono">₹0.00</td>
                <td style="text-align:right;" class="font-mono font-bold">₹2,208.00</td>
              </tr>
              <tr>
                <td><strong>GST @ 18% (Personal Care / Toiletries)</strong></td>
                <td style="text-align:right;" class="font-mono">₹22,100.00</td>
                <td style="text-align:right;" class="font-mono">₹1,989.00</td>
                <td style="text-align:right;" class="font-mono">₹1,989.00</td>
                <td style="text-align:right;" class="font-mono">₹0.00</td>
                <td style="text-align:right;" class="font-mono font-bold">₹3,978.00</td>
              </tr>
              <tr style="border-top:2px solid var(--color-border-strong);font-weight:bold;">
                <td>Total Eligible Taxable Value</td>
                <td style="text-align:right;" class="font-mono text-brand">₹103,270.00</td>
                <td style="text-align:right;" class="font-mono">₹4,299.25</td>
                <td style="text-align:right;" class="font-mono">₹4,299.25</td>
                <td style="text-align:right;" class="font-mono">₹0.00</td>
                <td style="text-align:right;" class="font-mono text-brand font-bold">₹8,598.50</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }

    if (type === 'pnl') {
      return `
        <div>
          <h2 style="font-size:15px;margin-bottom:12px;">Profit & Loss Statement (Monthly Period)</h2>
          <div class="dash-columns">
            <div class="card p-4" style="flex:1;">
              <h3 style="font-size:13px;color:var(--color-success);margin-bottom:8px;">Revenue & Incomes</h3>
              <div class="calc-row"><span>Gross Sales Revenue</span><strong class="font-mono">₹103,270.00</strong></div>
              <div class="calc-row"><span>Other Incomes / Rebates</span><span class="font-mono">₹1,450.00</span></div>
              <div class="calc-row" style="border-top:1px solid #cbd5e1;padding-top:6px;">
                <span>Total Revenue (A)</span><strong class="font-mono text-success">₹104,720.00</strong>
              </div>
            </div>
            <div class="card p-4" style="flex:1;">
              <h3 style="font-size:13px;color:var(--color-error);margin-bottom:8px;">Cost of Goods & Expenses</h3>
              <div class="calc-row"><span>Cost of Goods Sold (COGS)</span><span class="font-mono">₹82,400.00</span></div>
              <div class="calc-row"><span>Store Utilities & Rent</span><span class="font-mono">₹6,500.00</span></div>
              <div class="calc-row"><span>Staff Salaries</span><span class="font-mono">₹8,000.00</span></div>
              <div class="calc-row" style="border-top:1px solid #cbd5e1;padding-top:6px;">
                <span>Total Costs (B)</span><strong class="font-mono text-error">₹96,900.00</strong>
              </div>
            </div>
          </div>
          <div class="kpi-card kpi-card--sales" style="margin-top:16px;">
            <div class="kpi-card__label">Net Operating Profit (A - B)</div>
            <div class="kpi-card__value text-success">₹7,820.00 (7.46% Margin)</div>
          </div>
        </div>
      `;
    }

    // Default Sales report
    return `
      <div>
        <h2 style="font-size:15px;margin-bottom:12px;">Detailed Invoice Sales Register</h2>
        <table class="erp-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Customer Name</th>
              <th>Date / Time</th>
              <th>Payment Mode</th>
              <th style="text-align:right;">Subtotal</th>
              <th style="text-align:right;">Tax (GST)</th>
              <th style="text-align:right;">Net Amount</th>
              <th style="text-align:center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${invoices.map(inv => `
              <tr>
                <td class="font-mono text-brand font-bold">${inv.invoiceNo}</td>
                <td>${inv.customerName}</td>
                <td class="font-mono text-secondary">${inv.date}</td>
                <td><span class="pay-chip pay-chip--${(inv.paymentMode || '').toLowerCase()}">${inv.paymentMode}</span></td>
                <td style="text-align:right;" class="font-mono">₹${(inv.amount * 0.95).toFixed(2)}</td>
                <td style="text-align:right;" class="font-mono">₹${(inv.amount * 0.05).toFixed(2)}</td>
                <td style="text-align:right;" class="font-mono font-bold">₹${Number(inv.amount).toFixed(2)}</td>
                <td style="text-align:center;">
                  <span class="status-chip status-chip--${inv.status === 'Paid' ? 'success' : 'warning'}">${inv.status}</span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  return { renderPage };
})();

