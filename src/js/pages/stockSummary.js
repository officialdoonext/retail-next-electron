/**
 * RetailNext — Stock Summary & Inventory Management Page
 * Displays live inventory counts, stock valuation, reorder levels, and low-stock alerts.
 */

'use strict';

window.StockSummaryPage = (() => {

  function renderPage(outlet) {
    if (!outlet) return;
    outlet.innerHTML = '';
    outlet.className = 'page-container stock-page';

    const store = window.RetailStore;
    const products = store ? store.getProducts() : [];

    // Calculate inventory valuation
    let totalStockUnits = 0;
    let totalPurchaseValuation = 0;
    let totalRetailValuation = 0;
    let lowStockCount = 0;

    products.forEach(p => {
      totalStockUnits += p.currentStock;
      totalPurchaseValuation += (p.currentStock * p.purchasePrice);
      totalRetailValuation += (p.currentStock * p.sellingPrice);
      if (p.currentStock <= p.minStock) lowStockCount++;
    });

    outlet.innerHTML = `
      <div class="module-header">
        <div>
          <span class="module-header__parent">Inventory</span>
          <h1 class="module-header__title">Stock Summary & Valuation</h1>
        </div>
        <div class="module-header__actions">
          <button class="btn btn--outline" id="stock-btn-reorder">Reorder Report (${lowStockCount})</button>
          <button class="btn btn--primary" id="stock-btn-adjust">+ Stock Adjustment</button>
        </div>
      </div>

      <!-- Valuation KPI Cards -->
      <div class="dash-kpi-grid" style="margin-bottom:20px;">
        <div class="kpi-card kpi-card--stock">
          <div class="kpi-card__label">Total On-Hand Units</div>
          <div class="kpi-card__value">${totalStockUnits.toLocaleString()} Units</div>
          <div class="kpi-card__sub">${products.length} distinct catalog items</div>
        </div>
        <div class="kpi-card kpi-card--purchase">
          <div class="kpi-card__label">Stock Valuation (Cost Basis)</div>
          <div class="kpi-card__value">₹${totalPurchaseValuation.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div class="kpi-card__sub">Based on average purchase rates</div>
        </div>
        <div class="kpi-card kpi-card--sales">
          <div class="kpi-card__label">Stock Valuation (Retail MRP)</div>
          <div class="kpi-card__value">₹${totalRetailValuation.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div class="kpi-card__sub">Expected revenue potential</div>
        </div>
        <div class="kpi-card ${lowStockCount > 0 ? 'kpi-card--outstanding' : 'kpi-card--stock'}">
          <div class="kpi-card__label">Low Stock Alerts</div>
          <div class="kpi-card__value" style="${lowStockCount > 0 ? 'color:var(--color-error)' : ''}">${lowStockCount} Items</div>
          <div class="kpi-card__sub">At or below reorder threshold</div>
        </div>
      </div>

      <!-- Inventory Table -->
      <div class="card p-4">
        <div class="filter-bar">
          <input type="text" id="stock-search" class="pos-input" style="max-width:320px;" placeholder="Filter inventory by item, barcode or rack..." />
          <select id="stock-status-filter" class="pos-select" style="max-width:200px;">
            <option value="">All Stock Levels</option>
            <option value="low">Low Stock (Needs Reorder)</option>
            <option value="healthy">Healthy Stock</option>
          </select>
        </div>

        <div class="table-container" style="margin-top:16px;">
          <table class="erp-table">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Product Description</th>
                <th>Barcode</th>
                <th>Storage Location</th>
                <th style="text-align:center;">Current Stock</th>
                <th style="text-align:center;">Min / Reorder</th>
                <th style="text-align:right;">Purchase Cost</th>
                <th style="text-align:right;">Selling Rate</th>
                <th style="text-align:right;">Total Valuation</th>
                <th style="text-align:center;">Stock Status</th>
              </tr>
            </thead>
            <tbody id="stock-tbody">
              ${products.map(p => {
                const isLow = p.currentStock <= p.minStock;
                return `
                  <tr>
                    <td class="font-mono text-brand font-bold">${p.code}</td>
                    <td>
                      <strong>${p.name}</strong>
                      <div style="font-size:11px;color:var(--color-text-tertiary)">${p.category} · ${p.brand}</div>
                    </td>
                    <td class="font-mono text-secondary">${p.barcode}</td>
                    <td class="text-secondary font-mono" style="font-size:11px;">${p.location || 'Warehouse Main'}</td>
                    <td style="text-align:center;" class="font-mono font-bold">${p.currentStock} ${p.uom}</td>
                    <td style="text-align:center;" class="font-mono text-secondary">${p.minStock} ${p.uom}</td>
                    <td style="text-align:right;" class="font-mono">₹${p.purchasePrice.toFixed(2)}</td>
                    <td style="text-align:right;" class="font-mono">₹${p.sellingPrice.toFixed(2)}</td>
                    <td style="text-align:right;" class="font-mono font-bold">₹${(p.currentStock * p.purchasePrice).toFixed(2)}</td>
                    <td style="text-align:center;">
                      <span class="status-chip status-chip--${isLow ? 'warning' : 'success'}">
                        ${isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  return { renderPage };
})();

