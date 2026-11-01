/**
 * RetailNext — Product Pricing & Price Lists Master Page
 * Submenu: Masters -> Product Pricing & Price Lists
 */

'use strict';

window.PricingPage = (() => {

  function renderPage(outlet, subTab = 'catalog') {
    if (!outlet) return;
    outlet.innerHTML = '';
    outlet.className = 'page-container pricing-page';

    let activeTab = subTab.includes('bulk') ? 'bulk' : (subTab.includes('customer') ? 'tiers' : 'catalog');

    outlet.innerHTML = `
      <div class="module-header">
        <div>
          <span class="module-header__parent">Masters / Pricing</span>
          <h1 class="module-header__title">Product Pricing & Price Lists Master</h1>
        </div>
        <div class="module-header__actions">
          <div class="pill-group">
            <button class="pill-btn ${activeTab === 'catalog' ? 'active' : ''}" id="price-tab-cat">Pricing Catalog</button>
            <button class="pill-btn ${activeTab === 'bulk' ? 'active' : ''}" id="price-tab-bulk">Bulk Price Update</button>
            <button class="pill-btn ${activeTab === 'tiers' ? 'active' : ''}" id="price-tab-tiers">Customer Tier Price Lists</button>
          </div>
        </div>
      </div>

      <div id="pricing-body-outlet"></div>
    `;

    const body = outlet.querySelector('#pricing-body-outlet');
    const tabCat = outlet.querySelector('#price-tab-cat');
    const tabBulk = outlet.querySelector('#price-tab-bulk');
    const tabTiers = outlet.querySelector('#price-tab-tiers');

    function switchTab(t) {
      activeTab = t;
      tabCat.classList.toggle('active', t === 'catalog');
      tabBulk.classList.toggle('active', t === 'bulk');
      tabTiers.classList.toggle('active', t === 'tiers');

      if (t === 'catalog') renderCatalogView(body, outlet);
      else if (t === 'bulk') renderBulkView(body, outlet);
      else renderTiersView(body, outlet);
    }

    tabCat.onclick = () => switchTab('catalog');
    tabBulk.onclick = () => switchTab('bulk');
    tabTiers.onclick = () => switchTab('tiers');

    switchTab(activeTab);
  }

  function renderCatalogView(container, parentOutlet) {
    const store = window.RetailStore;
    const products = store ? store.getProducts() : [];

    container.innerHTML = `
      <div class="card p-4">
        <div class="filter-bar" style="margin-bottom:16px;">
          <input type="text" id="pr-search" class="pos-input" style="max-width:320px;" placeholder="Search item to review pricing..." />
          <div class="text-secondary font-mono" style="margin-left:auto;font-size:12px;">Total: ${products.length} Products</div>
        </div>

        <div class="table-container">
          <table class="erp-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Barcode</th>
                <th style="text-align:right;">Purchase Price</th>
                <th style="text-align:right;">Cost Price</th>
                <th style="text-align:right;">MRP (₹)</th>
                <th style="text-align:right;">Retail Price (₹)</th>
                <th style="text-align:right;">Wholesale Price (₹)</th>
                <th style="text-align:center;">Gross Margin %</th>
                <th style="text-align:center;">Action</th>
              </tr>
            </thead>
            <tbody id="pr-tbody">
              ${renderCatalogRows(products)}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const searchInput = container.querySelector('#pr-search');
    const tbody = container.querySelector('#pr-tbody');

    if (searchInput) {
      searchInput.oninput = () => {
        const q = searchInput.value.trim().toLowerCase();
        const filtered = products.filter(p => p.name.toLowerCase().includes(q) || p.barcode.includes(q));
        tbody.innerHTML = renderCatalogRows(filtered);
        attachRowEvents(container, products);
      };
    }

    attachRowEvents(container, products);
  }

  function renderCatalogRows(list) {
    return list.map(p => {
      const margin = p.sellingPrice > 0 ? (((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100).toFixed(1) : 0;
      return `
        <tr data-id="${p.id}">
          <td><strong>${p.name}</strong></td>
          <td class="font-mono text-secondary">${p.barcode}</td>
          <td style="text-align:right;" class="font-mono">₹${p.purchasePrice.toFixed(2)}</td>
          <td style="text-align:right;" class="font-mono">₹${p.costPrice.toFixed(2)}</td>
          <td style="text-align:right;">
            <input type="number" step="0.5" class="pos-inline-input font-mono edit-mrp" style="width:75px;text-align:right;" value="${p.mrp.toFixed(2)}" />
          </td>
          <td style="text-align:right;">
            <input type="number" step="0.5" class="pos-inline-input font-mono font-bold edit-sell" style="width:75px;text-align:right;" value="${p.sellingPrice.toFixed(2)}" />
          </td>
          <td style="text-align:right;">
            <input type="number" step="0.5" class="pos-inline-input font-mono edit-ws" style="width:75px;text-align:right;" value="${(p.wholesalePrice || p.sellingPrice * 0.95).toFixed(2)}" />
          </td>
          <td style="text-align:center;" class="font-mono ${Number(margin) >= 15 ? 'text-success font-bold' : 'text-warning'}">
            ${margin}%
          </td>
          <td style="text-align:center;">
            <button class="btn btn--xs btn--primary btn-save-row" data-id="${p.id}">Save</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function attachRowEvents(container, products) {
    container.querySelectorAll('.btn-save-row').forEach(btn => {
      btn.onclick = () => {
        const row = btn.closest('tr');
        const id = btn.getAttribute('data-id');
        const newMrp = Number(row.querySelector('.edit-mrp').value) || 0;
        const newSell = Number(row.querySelector('.edit-sell').value) || 0;
        const newWs = Number(row.querySelector('.edit-ws').value) || 0;

        const store = window.RetailStore;
        const prod = products.find(p => p.id === id);
        if (prod) {
          prod.mrp = newMrp;
          prod.sellingPrice = newSell;
          prod.wholesalePrice = newWs;
          if (window.SyncEngine) {
            window.SyncEngine.saveRecord('products', prod, 'UPDATE');
          } else if (store) {
            store.updateProduct(id, prod);
          }
          alert(`Prices updated for ${prod.name}! Selling Price: ₹${newSell.toFixed(2)}`);
        }
      };
    });
  }

  function renderBulkView(container, parentOutlet) {
    container.innerHTML = `
      <div class="card p-6" style="max-width:720px;margin:0 auto;">
        <h2 style="font-size:16px;margin-bottom:6px;">Bulk Price Update Engine</h2>
        <p style="font-size:12px;color:var(--color-text-secondary);margin-bottom:20px;">
          Adjust retail prices across entire categories or brands simultaneously (e.g. general price revision, festive markup, or discount adjustment).
        </p>

        <form id="form-bulk-price">
          <div class="form-grid-2" style="margin-bottom:14px;">
            <div class="form-group">
              <label>Select Target Products</label>
              <select id="bp-target" class="pos-select">
                <option value="all">All Products in Store</option>
                <option value="Grocery & Staples">Category: Grocery & Staples</option>
                <option value="Dairy & Chilled">Category: Dairy & Chilled</option>
                <option value="Personal Care">Category: Personal Care</option>
              </select>
            </div>
            <div class="form-group">
              <label>Price Adjustment Operation</label>
              <select id="bp-operation" class="pos-select">
                <option value="inc_pct">Increase Selling Price by %</option>
                <option value="dec_pct">Decrease Selling Price by %</option>
                <option value="markup">Set Selling Price to Cost + % Markup</option>
              </select>
            </div>
          </div>

          <div class="form-grid-2" style="margin-bottom:20px;">
            <div class="form-group">
              <label>Adjustment Value (%) <span class="text-error">*</span></label>
              <input type="number" id="bp-val" class="pos-input font-mono" value="5" min="0.1" max="100" step="0.5" required />
            </div>
            <div class="form-group">
              <label>Round Off Rule</label>
              <select id="bp-round" class="pos-select">
                <option value="1">Round to nearest ₹1.00</option>
                <option value="5">Round to nearest ₹5.00</option>
                <option value="none">No rounding (Keep exact paise)</option>
              </select>
            </div>
          </div>

          <div style="display:flex;justify-content:flex-end;gap:12px;">
            <button type="submit" class="btn btn--primary btn--lg">Apply Bulk Price Revision</button>
          </div>
        </form>
      </div>
    `;

    container.querySelector('#form-bulk-price').onsubmit = (e) => {
      e.preventDefault();
      const target = container.querySelector('#bp-target').value;
      const op = container.querySelector('#bp-operation').value;
      const pct = Number(container.querySelector('#bp-val').value) || 0;

      const store = window.RetailStore;
      const products = store ? store.getProducts() : [];
      let updatedCount = 0;

      products.forEach(p => {
        if (target === 'all' || p.category === target) {
          if (op === 'inc_pct') p.sellingPrice = Math.round(p.sellingPrice * (1 + pct / 100));
          else if (op === 'dec_pct') p.sellingPrice = Math.round(p.sellingPrice * (1 - pct / 100));
          else if (op === 'markup') p.sellingPrice = Math.round(p.costPrice * (1 + pct / 100));

          if (store) store.updateProduct(p.id, p);
          updatedCount++;
        }
      });

      alert(`Bulk price revision applied! ${updatedCount} products updated.`);
      renderPage(parentOutlet, 'catalog');
    };
  }

  function renderTiersView(container, parentOutlet) {
    container.innerHTML = `
      <div class="card p-4">
        <h3 style="font-size:15px;margin:0 0 4px;">Customer Tier Price Lists</h3>
        <p style="font-size:12px;color:var(--color-text-secondary);margin-bottom:16px;">
          Tiered pricing rules automatically apply during POS billing depending on customer membership group.
        </p>

        <div class="table-container">
          <table class="erp-table">
            <thead>
              <tr>
                <th>Tier Code</th>
                <th>Price List Name</th>
                <th>Target Customer Group</th>
                <th>Pricing Rule</th>
                <th style="text-align:center;">Status</th>
                <th style="text-align:center;">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="font-mono text-brand font-bold">PL-RETAIL</td>
                <td><strong>Retail Regular Price</strong></td>
                <td>Walk-in & General Regular Customers</td>
                <td class="font-mono">Standard Selling Price</td>
                <td style="text-align:center;"><span class="status-chip status-chip--success">Active</span></td>
                <td style="text-align:center;"><button class="btn btn--xs btn--outline" disabled>Default</button></td>
              </tr>
              <tr>
                <td class="font-mono text-brand font-bold">PL-PRIVILEGE</td>
                <td><strong>Privilege Club Member</strong></td>
                <td>Gold & Privilege Loyalty Members</td>
                <td class="font-mono text-success">Selling Price - 5% Flat Discount</td>
                <td style="text-align:center;"><span class="status-chip status-chip--success">Active</span></td>
                <td style="text-align:center;"><button class="btn btn--xs btn--outline">Edit</button></td>
              </tr>
              <tr>
                <td class="font-mono text-brand font-bold">PL-WHOLESALE</td>
                <td><strong>Wholesale B2B Price</strong></td>
                <td>Institutional & Wholesale Traders</td>
                <td class="font-mono text-brand">Wholesale Price List (Cost + 8%)</td>
                <td style="text-align:center;"><span class="status-chip status-chip--success">Active</span></td>
                <td style="text-align:center;"><button class="btn btn--xs btn--outline">Edit</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  return { renderPage };
})();

