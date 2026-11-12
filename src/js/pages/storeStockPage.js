/**
 * Retail Next — Store Branch Stocks & Stock Adjustment (/stock)
 *
 * Features:
 *   - Current store stock levels per retail branch
 *   - Minimum reorder warnings
 *   - Inventory valuation (MRP vs Cost)
 *   - Stock adjustment modal: /api/stock/adjust (Damaged, Theft, Expired, Recount)
 *   - Strict 24-item pagination
 */

'use strict';

(function(global) {

  let currentPage = 1;
  let currentSearch = '';
  let stockItems = [];

  async function render(outlet) {
    const store = global.apiService?.activeStore || { name: 'Main Retail Store', code: 'STR-001' };

    outlet.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Store Inventory & Valuation</h1>
          <p>Real-time retail shelf balances, low reorder alerts, and shrinkage adjustments for <strong>${store.name}</strong></p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" id="stock-adjust-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            + Adjust Stock (Damage/Shrinkage)
          </button>
        </div>
      </div>

      <div class="filter-bar">
        <div class="filter-search-box">
          <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="stock-search-input" placeholder="Search by SKU or item name..." class="form-input" value="${currentSearch}" />
        </div>
        <button class="btn btn-secondary btn-sm" id="stock-reset-btn">Reset</button>
      </div>

      <div id="store-stock-wrapper">
        <div style="text-align:center;padding:40px;color:var(--slate-400);">Loading branch inventory...</div>
      </div>
    `;

    const searchInput = document.getElementById('stock-search-input');
    const resetBtn = document.getElementById('stock-reset-btn');
    const adjustBtn = document.getElementById('stock-adjust-btn');

    searchInput.oninput = (e) => {
      currentSearch = e.target.value;
      currentPage = 1;
      loadStoreStockData(outlet);
    };

    resetBtn.onclick = () => {
      currentSearch = '';
      currentPage = 1;
      render(outlet);
    };

    adjustBtn.onclick = () => openAdjustModal(outlet);

    loadStoreStockData(outlet);
  }

  async function loadStoreStockData(outlet) {
    const container = document.getElementById('store-stock-wrapper');
    if (!container) return;

    try {
      const data = await global.apiService.getProducts({ page: currentPage, limit: 24, search: currentSearch });
      stockItems = data?.products || [];
      const pagination = data?.pagination || { page: 1, limit: 24, totalItems: stockItems.length, totalPages: 1 };

      const totalCost = stockItems.reduce((acc, i) => acc + (i.stock * (i.costPrice || 0)), 0);
      const totalMRP = stockItems.reduce((acc, i) => acc + (i.stock * (i.salePrice || 0)), 0);
      const lowStockCount = stockItems.filter(i => i.stock <= 5).length;

      container.innerHTML = `
        <!-- Valuation Metrics -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:16px;margin-bottom:20px;">
          <div class="card">
            <div class="card-subtitle">Inventory at Cost Price</div>
            <div style="font-size:22px;font-weight:700;color:var(--slate-900);margin:4px 0;">₹${totalCost.toLocaleString()}</div>
            <div style="font-size:11px;color:var(--slate-500);">Actual purchase valuation</div>
          </div>
          <div class="card">
            <div class="card-subtitle">Retail Selling Value</div>
            <div style="font-size:22px;font-weight:700;color:var(--primary-purple);margin:4px 0;">₹${totalMRP.toLocaleString()}</div>
            <div style="font-size:11px;color:var(--color-success-text);">Expected gross sales</div>
          </div>
          <div class="card">
            <div class="card-subtitle">Low Stock Warning Items</div>
            <div style="font-size:22px;font-weight:700;color:${lowStockCount > 0 ? 'var(--color-danger)' : 'var(--slate-900)'};margin:4px 0;">${lowStockCount}</div>
            <div style="font-size:11px;color:var(--slate-500);">Items below threshold (5 units)</div>
          </div>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Product SKU</th>
                <th>Item Description</th>
                <th>Category</th>
                <th style="text-align:right;">Cost Rate</th>
                <th style="text-align:right;">Selling Rate</th>
                <th style="text-align:center;">Current Units</th>
                <th style="text-align:right;">Total Asset Value</th>
                <th style="text-align:center;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${stockItems.map(p => {
                const isLow = p.stock <= 5;
                const itemValuation = p.stock * p.costPrice;

                return `
                  <tr>
                    <td>
                      <span style="font-family:var(--font-mono);font-weight:600;color:var(--primary-purple);">${p.sku}</span>
                    </td>
                    <td>
                      <div style="font-weight:600;color:var(--slate-900);">${p.name}</div>
                    </td>
                    <td><span class="badge badge-slate">${p.categoryName || 'Apparel'}</span></td>
                    <td style="text-align:right;color:var(--slate-600);">₹${p.costPrice.toFixed(2)}</td>
                    <td style="text-align:right;font-weight:600;color:var(--slate-900);">₹${p.salePrice.toFixed(2)}</td>
                    <td style="text-align:center;">
                      <span class="badge ${isLow ? 'badge-danger' : 'badge-success'}" style="font-size:11.5px;">
                        ${p.stock} units
                      </span>
                    </td>
                    <td style="text-align:right;font-weight:700;color:var(--slate-900);">
                      ₹${itemValuation.toLocaleString()}
                    </td>
                    <td style="text-align:center;">
                      <button class="btn btn-secondary btn-sm row-adjust-btn" data-id="${p.id}" data-name="${p.name}">
                        Adjust
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Strict 24-Item Pagination Controls -->
        <div class="pagination-container">
          <div class="pagination-info">
            Showing <strong>${(pagination.page - 1) * 24 + 1} - ${Math.min(pagination.page * 24, pagination.totalItems)}</strong> of <strong>${pagination.totalItems}</strong> items (PAGE_SIZE = 24)
          </div>
          <div class="pagination-controls">
            <button class="page-btn" id="stk-prev" ${pagination.page <= 1 ? 'disabled' : ''}>Prev</button>
            <button class="page-btn active">${pagination.page}</button>
            ${pagination.totalPages > pagination.page ? `<button class="page-btn" id="stk-next-num">${pagination.page + 1}</button>` : ''}
            <button class="page-btn" id="stk-next" ${pagination.page >= pagination.totalPages ? 'disabled' : ''}>Next</button>
          </div>
        </div>
      `;

      // Row Adjust
      container.querySelectorAll('.row-adjust-btn').forEach(b => {
        b.onclick = () => {
          const name = b.getAttribute('data-name');
          openAdjustModal(outlet, name);
        };
      });

      const prev = document.getElementById('stk-prev');
      const next = document.getElementById('stk-next');
      const nextNum = document.getElementById('stk-next-num');

      if (prev) prev.onclick = () => { if (currentPage > 1) { currentPage--; loadStoreStockData(outlet); } };
      if (next) next.onclick = () => { if (currentPage < pagination.totalPages) { currentPage++; loadStoreStockData(outlet); } };
      if (nextNum) nextNum.onclick = () => { currentPage++; loadStoreStockData(outlet); };

    } catch (err) {
      container.innerHTML = `<div style="color:var(--color-danger);text-align:center;padding:30px;">Failed to load stock: ${err.message}</div>`;
    }
  }

  function openAdjustModal(outlet, defaultItemName = '') {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-container" style="max-width:440px;">
        <div class="modal-header">
          <h3 class="modal-title">Inventory Adjustment</h3>
          <button class="btn btn-ghost btn-icon" id="adjm-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <form id="adjm-form" style="padding:20px;">
          <div class="form-group">
            <label class="form-label">Product Name or SKU *</label>
            <input type="text" id="adj-item" class="form-input" placeholder="e.g. Polo Shirt Navy Blue" value="${defaultItemName}" required />
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div class="form-group">
              <label class="form-label">Quantity (+ / -)</label>
              <input type="number" id="adj-qty" class="form-input" placeholder="-2" required />
            </div>
            <div class="form-group">
              <label class="form-label">Adjustment Reason</label>
              <select id="adj-reason" class="form-select">
                <option value="Damaged">Damaged Goods</option>
                <option value="Theft">Shrinkage / Theft</option>
                <option value="Expired">Expired Stock</option>
                <option value="Recount">Audit Recount</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Remarks</label>
            <textarea id="adj-notes" class="form-textarea" rows="2" placeholder="Audit note..."></textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:8px;">Post Stock Adjustment</button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('adjm-close').onclick = () => modal.remove();
    document.getElementById('adjm-form').onsubmit = async (e) => {
      e.preventDefault();
      const payload = {
        product: document.getElementById('adj-item').value.trim(),
        quantity: parseInt(document.getElementById('adj-qty').value, 10) || 0,
        reason: document.getElementById('adj-reason').value,
        notes: document.getElementById('adj-notes').value.trim()
      };

      await global.apiService.adjustStock(payload);
      global.Toast?.success(`Stock adjustment posted for ${payload.product}`);
      modal.remove();
      loadStoreStockData(outlet);
    };
  }

  global.StoreStockPage = { render };
})(window);

