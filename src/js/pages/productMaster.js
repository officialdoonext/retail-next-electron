/**
 * RetailNext — Product Master Page
 * Implements full Product Master with all required fields:
 * - Product name & code
 * - SKU & barcode
 * - Category, subcategory & brand
 * - Unit of measurement & alternate units
 * - Purchase price & cost price
 * - MRP, selling price & wholesale price
 * - GST rate & HSN code
 * - Opening stock & minimum stock level
 * - Supplier & manufacturer
 * - Rack, shelf / storage location
 * - Batch & expiry tracking
 * - Serial number tracking
 * - Active / inactive status
 */

'use strict';

window.ProductMasterPage = (() => {

  let activeSubTab = 'list'; // 'list' | 'add'
  let editingProductId = null;

  function renderPage(outlet, options = {}) {
    if (!outlet) return;
    outlet.innerHTML = '';
    outlet.className = 'page-container product-master-page';

    if (options && options.mode === 'add') {
      activeSubTab = 'add';
      editingProductId = null;
    }

    const store = window.RetailStore;
    const products = store ? store.getProducts() : [];

    const html = `
      <div class="module-header">
        <div>
          <span class="module-header__parent">Masters / Inventory</span>
          <h1 class="module-header__title">Product Master</h1>
        </div>
        <div class="module-header__actions">
          <div class="pill-group">
            <button class="pill-btn ${activeSubTab === 'list' ? 'active' : ''}" id="pm-tab-list">Product Catalog (${products.length})</button>
            <button class="pill-btn ${activeSubTab === 'add' ? 'active' : ''}" id="pm-tab-add">+ Add New Product (F3)</button>
          </div>
        </div>
      </div>

      <div id="pm-outlet"></div>
    `;

    outlet.innerHTML = html;

    const pmOutlet = outlet.querySelector('#pm-outlet');
    const tabListBtn = outlet.querySelector('#pm-tab-list');
    const tabAddBtn = outlet.querySelector('#pm-tab-add');

    tabListBtn.addEventListener('click', () => {
      activeSubTab = 'list';
      editingProductId = null;
      tabListBtn.classList.add('active');
      tabAddBtn.classList.remove('active');
      renderList(pmOutlet);
    });

    tabAddBtn.addEventListener('click', () => {
      activeSubTab = 'add';
      editingProductId = null;
      tabAddBtn.classList.add('active');
      tabListBtn.classList.remove('active');
      renderForm(pmOutlet);
    });

    if (activeSubTab === 'list') {
      renderList(pmOutlet);
    } else {
      renderForm(pmOutlet);
    }
  }

  function renderList(container) {
    const store = window.RetailStore;
    const products = store ? store.getProducts() : [];

    container.innerHTML = `
      <div class="card p-4">
        <div class="filter-bar">
          <input type="text" id="pm-search" class="pos-input" style="max-width:320px;" placeholder="Search by name, barcode, SKU or code..." />
          <select id="pm-cat-filter" class="pos-select" style="max-width:200px;">
            <option value="">All Categories</option>
            <option value="Grocery & Staples">Grocery & Staples</option>
            <option value="Dairy & Chilled">Dairy & Chilled</option>
            <option value="Personal Care">Personal Care</option>
          </select>
          <div class="text-secondary font-mono" style="margin-left:auto;font-size:12px;">Total: ${products.length} Products</div>
        </div>

        <div class="table-container" style="margin-top:16px;">
          <table class="erp-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Product Name</th>
                <th>Barcode / SKU</th>
                <th>Category</th>
                <th style="text-align:right;">Purchase Price</th>
                <th style="text-align:right;">Selling Price</th>
                <th style="text-align:right;">MRP</th>
                <th style="text-align:center;">GST</th>
                <th style="text-align:center;">Stock</th>
                <th style="text-align:center;">Location</th>
                <th style="text-align:center;">Status</th>
                <th style="text-align:center;">Actions</th>
              </tr>
            </thead>
            <tbody id="pm-table-body">
              ${renderRows(products)}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const searchInput = container.querySelector('#pm-search');
    const catFilter = container.querySelector('#pm-cat-filter');
    const tbody = container.querySelector('#pm-table-body');

    function filterTable() {
      const q = (searchInput.value || '').toLowerCase().trim();
      const cat = catFilter.value;
      const filtered = products.filter(p => {
        const matchesQ = !q || p.name.toLowerCase().includes(q) || p.barcode.includes(q) || p.sku.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
        const matchesCat = !cat || p.category === cat;
        return matchesQ && matchesCat;
      });
      tbody.innerHTML = renderRows(filtered);
      attachRowEvents(container);
    }

    if (searchInput) searchInput.addEventListener('input', filterTable);
    if (catFilter) catFilter.addEventListener('change', filterTable);

    attachRowEvents(container);
  }

  function renderRows(prods) {
    if (prods.length === 0) {
      return `<tr><td colspan="12" class="table-empty">No products match your criteria.</td></tr>`;
    }

    return prods.map(p => `
      <tr data-id="${p.id}">
        <td class="font-mono text-brand font-bold">${p.code || p.id}</td>
        <td>
          <strong>${p.name}</strong>
          <div style="font-size:11px;color:var(--color-text-tertiary)">Brand: ${p.brand || '—'} · ${p.subcategory || ''}</div>
        </td>
        <td class="font-mono text-secondary">${p.barcode}<br><span style="font-size:11px;">SKU: ${p.sku}</span></td>
        <td>${p.category}</td>
        <td style="text-align:right;" class="font-mono">₹${Number(p.purchasePrice).toFixed(2)}</td>
        <td style="text-align:right;" class="font-mono font-bold">₹${Number(p.sellingPrice).toFixed(2)}</td>
        <td style="text-align:right;" class="font-mono text-secondary">₹${Number(p.mrp).toFixed(2)}</td>
        <td style="text-align:center;" class="font-mono">${p.gstRate}%</td>
        <td style="text-align:center;">
          <span class="status-chip ${p.currentStock <= p.minStock ? 'status-chip--warning' : 'status-chip--success'}">
            ${p.currentStock} ${p.uom}
          </span>
        </td>
        <td style="text-align:center;font-size:11px;" class="text-secondary">${p.location || '—'}</td>
        <td style="text-align:center;">
          <span class="status-chip status-chip--${p.status === 'Active' ? 'success' : 'neutral'}">${p.status}</span>
        </td>
        <td style="text-align:center;">
          <button class="btn btn--xs btn--outline pm-edit-btn" data-id="${p.id}">Edit</button>
        </td>
      </tr>
    `).join('');
  }

  function attachRowEvents(container) {
    container.querySelectorAll('.pm-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        editingProductId = id;
        activeSubTab = 'add';
        const tabAddBtn = document.getElementById('pm-tab-add');
        const tabListBtn = document.getElementById('pm-tab-list');
        if (tabAddBtn) tabAddBtn.classList.add('active');
        if (tabListBtn) tabListBtn.classList.remove('active');
        renderForm(container);
      });
    });
  }

  function renderForm(container) {
    const store = window.RetailStore;
    const products = store ? store.getProducts() : [];
    const editing = editingProductId ? products.find(p => p.id === editingProductId) : null;

    container.innerHTML = `
      <div class="card p-6" style="max-width:1100px;margin:0 auto;">
        <h2 style="font-size:16px;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          ${editing ? 'Edit Product: ' + editing.name : 'Create New Product Record'}
        </h2>

        <form id="pm-form">
          <!-- 1. Identification -->
          <div class="form-fieldset">
            <legend>1. Product Identification</legend>
            <div class="form-grid-3">
              <div class="form-group">
                <label>Product Name <span class="text-error">*</span></label>
                <input type="text" id="f-name" class="pos-input" required value="${editing ? editing.name : ''}" placeholder="e.g. Fortune Sunflower Oil 1L" />
              </div>
              <div class="form-group">
                <label>Product Code <span class="text-error">*</span></label>
                <input type="text" id="f-code" class="pos-input" required value="${editing ? editing.code : 'PRD-' + Math.floor(1000 + Math.random() * 9000)}" />
              </div>
              <div class="form-group">
                <label>Status</label>
                <select id="f-status" class="pos-select">
                  <option value="Active" ${editing && editing.status === 'Active' ? 'selected' : ''}>Active</option>
                  <option value="Inactive" ${editing && editing.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                </select>
              </div>
            </div>

            <div class="form-grid-3" style="margin-top:12px;">
              <div class="form-group">
                <label>Barcode / EAN <span class="text-error">*</span></label>
                <div style="display:flex;gap:6px;">
                  <input type="text" id="f-barcode" class="pos-input" required value="${editing ? editing.barcode : '890' + Math.floor(1000000000 + Math.random() * 9000000000)}" />
                  <button type="button" class="btn btn--outline" id="btn-gen-barcode" title="Generate Random Barcode">Gen</button>
                </div>
              </div>
              <div class="form-group">
                <label>SKU (Stock Keeping Unit)</label>
                <input type="text" id="f-sku" class="pos-input" value="${editing ? editing.sku : 'SKU-' + Math.floor(1000 + Math.random() * 9000)}" />
              </div>
              <div class="form-group">
                <label>HSN / SAC Code</label>
                <input type="text" id="f-hsn" class="pos-input" value="${editing ? editing.hsnCode : '1512'}" placeholder="e.g. 1512" />
              </div>
            </div>
          </div>

          <!-- 2. Classification & Brand -->
          <div class="form-fieldset" style="margin-top:16px;">
            <legend>2. Classification & Branding</legend>
            <div class="form-grid-3">
              <div class="form-group">
                <label>Main Category</label>
                <select id="f-category" class="pos-select">
                  <option value="Grocery & Staples" ${editing && editing.category === 'Grocery & Staples' ? 'selected' : ''}>Grocery & Staples</option>
                  <option value="Dairy & Chilled" ${editing && editing.category === 'Dairy & Chilled' ? 'selected' : ''}>Dairy & Chilled</option>
                  <option value="Personal Care" ${editing && editing.category === 'Personal Care' ? 'selected' : ''}>Personal Care</option>
                  <option value="Beverages" ${editing && editing.category === 'Beverages' ? 'selected' : ''}>Beverages</option>
                  <option value="Snacks & Branded Foods" ${editing && editing.category === 'Snacks & Branded Foods' ? 'selected' : ''}>Snacks & Branded Foods</option>
                </select>
              </div>
              <div class="form-group">
                <label>Subcategory</label>
                <input type="text" id="f-subcategory" class="pos-input" value="${editing ? editing.subcategory : 'Cooking Oil'}" placeholder="e.g. Cooking Oil" />
              </div>
              <div class="form-group">
                <label>Brand</label>
                <input type="text" id="f-brand" class="pos-input" value="${editing ? editing.brand : 'Fortune'}" placeholder="e.g. Fortune" />
              </div>
            </div>
          </div>

          <!-- 3. Units & Packaging -->
          <div class="form-fieldset" style="margin-top:16px;">
            <legend>3. Unit of Measurement & Conversions</legend>
            <div class="form-grid-3">
              <div class="form-group">
                <label>Base UOM</label>
                <select id="f-uom" class="pos-select">
                  <option value="Pieces" ${editing && editing.uom === 'Pieces' ? 'selected' : ''}>Pieces (Pcs)</option>
                  <option value="Box" ${editing && editing.uom === 'Box' ? 'selected' : ''}>Box</option>
                  <option value="Packet" ${editing && editing.uom === 'Packet' ? 'selected' : ''}>Packet</option>
                  <option value="Kilogram" ${editing && editing.uom === 'Kilogram' ? 'selected' : ''}>Kilogram (Kg)</option>
                  <option value="Gram" ${editing && editing.uom === 'Gram' ? 'selected' : ''}>Gram (g)</option>
                  <option value="Litre" ${editing && editing.uom === 'Litre' ? 'selected' : ''}>Litre (L)</option>
                  <option value="Metre" ${editing && editing.uom === 'Metre' ? 'selected' : ''}>Metre (m)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Alternate Unit</label>
                <select id="f-alt-uom" class="pos-select">
                  <option value="Box" ${editing && editing.altUom === 'Box' ? 'selected' : ''}>Box</option>
                  <option value="Bag" ${editing && editing.altUom === 'Bag' ? 'selected' : ''}>Bag / Carton</option>
                  <option value="None">None</option>
                </select>
              </div>
              <div class="form-group">
                <label>Conversion Factor</label>
                <input type="number" id="f-conv" class="pos-input" value="${editing ? editing.conversionFactor : 12}" placeholder="e.g. 1 Box = 12 Pieces" />
              </div>
            </div>
          </div>

          <!-- 4. Pricing & Tax Structure -->
          <div class="form-fieldset" style="margin-top:16px;">
            <legend>4. Pricing & Tax Structure</legend>
            <div class="form-grid-4">
              <div class="form-group">
                <label>Purchase Price (₹)</label>
                <input type="number" step="0.01" id="f-pur-price" class="pos-input" value="${editing ? editing.purchasePrice : '100.00'}" />
              </div>
              <div class="form-group">
                <label>Cost Price (₹)</label>
                <input type="number" step="0.01" id="f-cost-price" class="pos-input" value="${editing ? editing.costPrice : '100.00'}" />
              </div>
              <div class="form-group">
                <label>MRP (₹)</label>
                <input type="number" step="0.01" id="f-mrp" class="pos-input" value="${editing ? editing.mrp : '150.00'}" />
              </div>
              <div class="form-group">
                <label>Selling Price (Retail) (₹)</label>
                <input type="number" step="0.01" id="f-sell-price" class="pos-input" value="${editing ? editing.sellingPrice : '135.00'}" />
              </div>
            </div>

            <div class="form-grid-3" style="margin-top:12px;">
              <div class="form-group">
                <label>Wholesale Price (₹)</label>
                <input type="number" step="0.01" id="f-ws-price" class="pos-input" value="${editing ? editing.wholesalePrice : '125.00'}" />
              </div>
              <div class="form-group">
                <label>GST Rate</label>
                <select id="f-gst" class="pos-select">
                  <option value="0" ${editing && editing.gstRate === 0 ? 'selected' : ''}>0% (Exempt)</option>
                  <option value="5" ${editing && editing.gstRate === 5 ? 'selected' : ''}>5% GST</option>
                  <option value="12" ${editing && editing.gstRate === 12 ? 'selected' : ''}>12% GST</option>
                  <option value="18" ${editing && editing.gstRate === 18 ? 'selected' : ''}>18% GST</option>
                  <option value="28" ${editing && editing.gstRate === 28 ? 'selected' : ''}>28% GST</option>
                </select>
              </div>
              <div class="form-group">
                <label>Rack / Shelf Location</label>
                <input type="text" id="f-location" class="pos-input" value="${editing ? editing.location : 'Rack A-01, Shelf 2'}" placeholder="e.g. Rack B, Shelf 3" />
              </div>
            </div>
          </div>

          <!-- 5. Stock & Supply Details -->
          <div class="form-fieldset" style="margin-top:16px;">
            <legend>5. Stock & Supplier Information</legend>
            <div class="form-grid-4">
              <div class="form-group">
                <label>Opening Stock</label>
                <input type="number" id="f-open-stock" class="pos-input" value="${editing ? editing.openingStock : '50'}" />
              </div>
              <div class="form-group">
                <label>Minimum Stock (Reorder)</label>
                <input type="number" id="f-min-stock" class="pos-input" value="${editing ? editing.minStock : '15'}" />
              </div>
              <div class="form-group">
                <label>Preferred Supplier</label>
                <input type="text" id="f-supplier" class="pos-input" value="${editing ? editing.supplier : 'Metro Wholesale Traders'}" />
              </div>
              <div class="form-group">
                <label>Manufacturer</label>
                <input type="text" id="f-manufacturer" class="pos-input" value="${editing ? editing.manufacturer : 'Adani Wilmar Ltd'}" />
              </div>
            </div>

            <!-- Tracking Checkboxes -->
            <div style="display:flex;gap:24px;margin-top:16px;padding:12px;background:var(--color-bg-app);border-radius:6px;">
              <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                <input type="checkbox" id="f-batch-track" ${editing && editing.batchTracking ? 'checked' : 'checked'} />
                <span>Enable Batch Tracking</span>
              </label>
              <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                <input type="checkbox" id="f-expiry-track" ${editing && editing.expiryTracking ? 'checked' : 'checked'} />
                <span>Enable Expiry Tracking</span>
              </label>
              <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                <input type="checkbox" id="f-serial-track" ${editing && editing.serialTracking ? 'checked' : ''} />
                <span>Enable Serial Number Tracking</span>
              </label>
            </div>

            <div class="form-group" style="margin-top:12px;">
              <label>Description & Notes</label>
              <textarea id="f-desc" class="pos-input" rows="2" placeholder="Product specifications, storage advice, ingredients...">${editing ? editing.description : ''}</textarea>
            </div>
          </div>

          <!-- Buttons -->
          <div style="margin-top:20px;display:flex;gap:12px;justify-content:flex-end;">
            <button type="button" class="btn btn--outline" id="btn-cancel-pm">Cancel (Esc)</button>
            <button type="submit" class="btn btn--primary">${editing ? 'Update Product' : 'Save Product Record (F10)'}</button>
          </div>
        </form>
      </div>
    `;

    // Barcode generator
    const genBcBtn = container.querySelector('#btn-gen-barcode');
    if (genBcBtn) {
      genBcBtn.addEventListener('click', () => {
        container.querySelector('#f-barcode').value = '890' + Math.floor(1000000000 + Math.random() * 9000000000);
      });
    }

    const cancelBtn = container.querySelector('#btn-cancel-pm');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        activeSubTab = 'list';
        editingProductId = null;
        renderList(container);
      });
    }

    // Submit handler
    const form = container.querySelector('#pm-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const pData = {
          name: container.querySelector('#f-name').value,
          code: container.querySelector('#f-code').value,
          status: container.querySelector('#f-status').value,
          barcode: container.querySelector('#f-barcode').value,
          sku: container.querySelector('#f-sku').value,
          hsnCode: container.querySelector('#f-hsn').value,
          category: container.querySelector('#f-category').value,
          subcategory: container.querySelector('#f-subcategory').value,
          brand: container.querySelector('#f-brand').value,
          uom: container.querySelector('#f-uom').value,
          altUom: container.querySelector('#f-alt-uom').value,
          conversionFactor: Number(container.querySelector('#f-conv').value) || 1,
          purchasePrice: Number(container.querySelector('#f-pur-price').value) || 0,
          costPrice: Number(container.querySelector('#f-cost-price').value) || 0,
          mrp: Number(container.querySelector('#f-mrp').value) || 0,
          sellingPrice: Number(container.querySelector('#f-sell-price').value) || 0,
          wholesalePrice: Number(container.querySelector('#f-ws-price').value) || 0,
          gstRate: Number(container.querySelector('#f-gst').value) || 0,
          location: container.querySelector('#f-location').value,
          openingStock: Number(container.querySelector('#f-open-stock').value) || 0,
          currentStock: Number(container.querySelector('#f-open-stock').value) || 0,
          minStock: Number(container.querySelector('#f-min-stock').value) || 0,
          supplier: container.querySelector('#f-supplier').value,
          manufacturer: container.querySelector('#f-manufacturer').value,
          batchTracking: container.querySelector('#f-batch-track').checked,
          expiryTracking: container.querySelector('#f-expiry-track').checked,
          serialTracking: container.querySelector('#f-serial-track').checked,
          description: container.querySelector('#f-desc').value
        };

        if (editingProductId) {
          const updatedRecord = { id: editingProductId, ...pData };
          if (window.SyncEngine) {
            window.SyncEngine.saveRecord('products', updatedRecord, 'UPDATE');
          } else if (store) {
            store.updateProduct(editingProductId, pData);
          }
          alert(`Product ${pData.name} updated successfully!`);
        } else {
          const newProduct = {
            id: 'PRD-' + Date.now() + '-' + Math.floor(100 + Math.random() * 900),
            ...pData
          };
          if (window.SyncEngine) {
            window.SyncEngine.saveRecord('products', newProduct, 'INSERT');
          } else if (store) {
            store.addProduct(newProduct);
          }
          alert(`Product ${pData.name} added to catalog!`);
        }

        activeSubTab = 'list';
        editingProductId = null;
        renderList(container);
      });
    }
  }

  return { renderPage };
})();

