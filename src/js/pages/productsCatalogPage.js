/**
 * Retail Next — Products Master Catalog (/products)
 *
 * Features:
 *   - Master catalog: SKU, Barcode, HSN, MRP, Cost Price, Selling Price
 *   - Bulk Import / Export Excel template (/api/products/bulk)
 *   - Add / Edit Product Multi-Tab Modal (General, Pricing, Variations, Stock, Taxes)
 *   - Strict 24-item pagination (PAGE_SIZE = 24)
 *   - Delete product action
 */

'use strict';

(function(global) {

  let currentPage = 1;
  let currentSearch = '';
  let currentCategory = '';
  let productsList = [];

  async function render(outlet) {
    outlet.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Product Catalog & SKU Master</h1>
          <p>Inventory master with barcode tracking, variant matrices, and multi-tier pricing</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary btn-sm" id="prod-export-btn" title="Download Excel template">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Excel Template
          </button>
          <label class="btn btn-secondary btn-sm" style="cursor:pointer;margin-bottom:0;" title="Bulk Upload Excel">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Bulk Upload
            <input type="file" id="prod-bulk-input" accept=".xlsx,.csv" style="display:none;" />
          </label>
          <button class="btn btn-primary btn-sm" id="prod-add-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            + New Product
          </button>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar">
        <div class="filter-search-box">
          <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="prod-search-input" placeholder="Search product name, SKU, or barcode..." class="form-input" value="${currentSearch}" />
        </div>
        <select id="prod-category-filter" class="form-select" style="width:200px;">
          <option value="">All Categories</option>
          <option value="Menswear & Apparel">Menswear & Apparel</option>
          <option value="Womenswear & Ethnic">Womenswear & Ethnic</option>
          <option value="Footwear & Shoes">Footwear & Shoes</option>
          <option value="Accessories">Accessories</option>
        </select>
        <button class="btn btn-secondary btn-sm" id="prod-reset-btn">Reset</button>
      </div>

      <div id="products-table-wrapper">
        <div style="text-align:center;padding:40px;color:var(--slate-400);">Loading products from /api/products...</div>
      </div>
    `;

    // Filters
    const searchInput = document.getElementById('prod-search-input');
    const catFilter = document.getElementById('prod-category-filter');
    const resetBtn = document.getElementById('prod-reset-btn');
    const addBtn = document.getElementById('prod-add-btn');
    const exportBtn = document.getElementById('prod-export-btn');
    const bulkInput = document.getElementById('prod-bulk-input');

    searchInput.oninput = (e) => {
      currentSearch = e.target.value;
      currentPage = 1;
      loadProductsData(outlet);
    };

    catFilter.onchange = (e) => {
      currentCategory = e.target.value;
      currentPage = 1;
      loadProductsData(outlet);
    };

    resetBtn.onclick = () => {
      currentSearch = '';
      currentCategory = '';
      currentPage = 1;
      render(outlet);
    };

    addBtn.onclick = () => openProductModal(null, outlet);

    exportBtn.onclick = () => {
      downloadExcelTemplate();
    };

    bulkInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      try {
        await global.apiService.bulkUploadProducts(formData);
        global.Toast?.success(`Uploaded and processed ${file.name}`);
        loadProductsData(outlet);
      } catch (err) {
        global.Toast?.error(err.message);
      }
    };

    loadProductsData(outlet);
  }

  async function loadProductsData(outlet) {
    const container = document.getElementById('products-table-wrapper');
    if (!container) return;

    try {
      const data = await global.apiService.getProducts({
        page: currentPage,
        limit: 24,
        search: currentSearch,
        categoryId: currentCategory
      });

      productsList = data?.products || [];
      const pagination = data?.pagination || { page: 1, limit: 24, totalItems: productsList.length, totalPages: 1 };

      container.innerHTML = `
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Product SKU / Barcode</th>
                <th>Item Name</th>
                <th>Category</th>
                <th style="text-align:right;">Cost Price</th>
                <th style="text-align:right;">Selling Price</th>
                <th style="text-align:center;">Current Stock</th>
                <th>Variants</th>
                <th style="text-align:center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${productsList.map(p => `
                <tr>
                  <td>
                    <div style="font-family:var(--font-mono);font-weight:600;color:var(--primary-purple);">${p.sku}</div>
                    <div style="font-family:var(--font-mono);font-size:11px;color:var(--slate-400);">${p.barcode || 'NO-BARCODE'}</div>
                  </td>
                  <td>
                    <div style="font-weight:600;color:var(--slate-900);">${p.name}</div>
                  </td>
                  <td>
                    <span class="badge badge-slate">${p.categoryName || 'Apparel'}</span>
                  </td>
                  <td style="text-align:right;color:var(--slate-600);">₹${(p.costPrice || 0).toFixed(2)}</td>
                  <td style="text-align:right;font-weight:700;color:var(--slate-900);">₹${(p.salePrice || 0).toFixed(2)}</td>
                  <td style="text-align:center;">
                    <span class="badge ${p.stock <= 5 ? 'badge-danger' : 'badge-success'}" style="font-size:11px;">
                      ${p.stock} units
                    </span>
                  </td>
                  <td>
                    ${p.hasVariations ? '<span class="badge badge-purple">Multi-Variant</span>' : '<span style="color:var(--slate-400);font-size:11px;">Simple</span>'}
                  </td>
                  <td style="text-align:center;">
                    <div style="display:inline-flex;gap:4px;">
                      <button class="btn btn-secondary btn-sm edit-prod-btn" data-id="${p.id}">
                        Edit
                      </button>
                      <button class="btn btn-ghost btn-sm del-prod-btn" data-id="${p.id}" style="color:var(--color-danger);">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Strict 24-Item Pagination Controls -->
        <div class="pagination-container">
          <div class="pagination-info">
            Showing <strong>${(pagination.page - 1) * 24 + 1} - ${Math.min(pagination.page * 24, pagination.totalItems)}</strong> of <strong>${pagination.totalItems}</strong> products (PAGE_SIZE = 24)
          </div>
          <div class="pagination-controls">
            <button class="page-btn" id="prod-prev" ${pagination.page <= 1 ? 'disabled' : ''}>Prev</button>
            <button class="page-btn active">${pagination.page}</button>
            ${pagination.totalPages > pagination.page ? `<button class="page-btn" id="prod-next-num">${pagination.page + 1}</button>` : ''}
            <button class="page-btn" id="prod-next" ${pagination.page >= pagination.totalPages ? 'disabled' : ''}>Next</button>
          </div>
        </div>
      `;

      // Actions
      container.querySelectorAll('.edit-prod-btn').forEach(b => {
        b.onclick = () => {
          const id = b.getAttribute('data-id');
          const p = productsList.find(x => x.id === id);
          if (p) openProductModal(p, outlet);
        };
      });

      container.querySelectorAll('.del-prod-btn').forEach(b => {
        b.onclick = async () => {
          const id = b.getAttribute('data-id');
          if (confirm('Are you sure you want to delete this product?')) {
            await global.apiService.deleteProduct(id);
            global.Toast?.success('Product removed from catalog');
            loadProductsData(outlet);
          }
        };
      });

      // Pagination
      const prev = document.getElementById('prod-prev');
      const next = document.getElementById('prod-next');
      const nextNum = document.getElementById('prod-next-num');

      if (prev) prev.onclick = () => { if (currentPage > 1) { currentPage--; loadProductsData(outlet); } };
      if (next) next.onclick = () => { if (currentPage < pagination.totalPages) { currentPage++; loadProductsData(outlet); } };
      if (nextNum) nextNum.onclick = () => { currentPage++; loadProductsData(outlet); };

    } catch (err) {
      container.innerHTML = `<div style="color:var(--color-danger);text-align:center;padding:30px;">Failed to load catalog: ${err.message}</div>`;
    }
  }

  function openProductModal(existingProd = null, outlet) {
    const isEdit = !!existingProd;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';

    modal.innerHTML = `
      <div class="modal-container modal-lg">
        <div class="modal-header">
          <h3 class="modal-title">${isEdit ? 'Edit Product Record' : 'Create New Product'}</h3>
          <button class="btn btn-ghost btn-icon" id="pm-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>

        <!-- Multi-Tab Header -->
        <div style="display:flex;border-bottom:1px solid var(--border-slate-200);background:var(--slate-50);padding:0 20px;">
          <button class="btn btn-ghost ptab-btn active" data-tab="tab-gen" style="border-radius:0;border-bottom:2px solid var(--primary-purple);color:var(--primary-purple);font-weight:600;">General Info</button>
          <button class="btn btn-ghost ptab-btn" data-tab="tab-price" style="border-radius:0;border-bottom:2px solid transparent;color:var(--slate-500);">Pricing & Taxes</button>
          <button class="btn btn-ghost ptab-btn" data-tab="tab-stock" style="border-radius:0;border-bottom:2px solid transparent;color:var(--slate-500);">Inventory & Stock</button>
        </div>

        <form id="product-master-form" style="display:flex;flex-direction:column;flex:1;overflow-y:auto;">
          <div class="modal-body" style="padding:20px;">
            <!-- Tab 1: General -->
            <div id="tab-gen" class="ptab-content">
              <div class="form-group">
                <label class="form-label">Product Name *</label>
                <input type="text" id="pm-name" class="form-input" placeholder="e.g. Mens Cotton Slim Fit Denim" value="${existingProd?.name || ''}" required />
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div class="form-group">
                  <label class="form-label">SKU Identifier *</label>
                  <input type="text" id="pm-sku" class="form-input" placeholder="e.g. JNS-DNM-01" value="${existingProd?.sku || ''}" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Barcode / EAN-13</label>
                  <input type="text" id="pm-barcode" class="form-input" placeholder="e.g. 8901234567890" value="${existingProd?.barcode || ''}" />
                </div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div class="form-group">
                  <label class="form-label">Category</label>
                  <select id="pm-category" class="form-select">
                    <option value="Menswear & Apparel">Menswear & Apparel</option>
                    <option value="Womenswear & Ethnic">Womenswear & Ethnic</option>
                    <option value="Footwear & Shoes">Footwear & Shoes</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">HSN / SAC Code</label>
                  <input type="text" id="pm-hsn" class="form-input" placeholder="e.g. 6203" value="6203" />
                </div>
              </div>
            </div>

            <!-- Tab 2: Pricing -->
            <div id="tab-price" class="ptab-content" style="display:none;">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div class="form-group">
                  <label class="form-label">Cost Price (Purchased ₹)</label>
                  <input type="number" step="0.01" id="pm-cost" class="form-input" placeholder="600.00" value="${existingProd?.costPrice || ''}" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Selling Retail Price (₹) *</label>
                  <input type="number" step="0.01" id="pm-sale" class="form-input" placeholder="1299.00" value="${existingProd?.salePrice || ''}" required />
                </div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div class="form-group">
                  <label class="form-label">MRP (Maximum Retail Price ₹)</label>
                  <input type="number" step="0.01" id="pm-mrp" class="form-input" placeholder="1499.00" value="${existingProd?.salePrice ? existingProd.salePrice * 1.2 : ''}" />
                </div>
                <div class="form-group">
                  <label class="form-label">GST Tax Slab</label>
                  <select id="pm-tax" class="form-select">
                    <option value="5">GST 5% (Apparel below 1000)</option>
                    <option value="12" selected>GST 12% (Apparel above 1000)</option>
                    <option value="18">GST 18% (Standard)</option>
                    <option value="0">GST 0% (Exempt)</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Tab 3: Stock -->
            <div id="tab-stock" class="ptab-content" style="display:none;">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div class="form-group">
                  <label class="form-label">Opening Stock Quantity</label>
                  <input type="number" id="pm-stock" class="form-input" placeholder="25" value="${existingProd?.stock || 20}" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Minimum Reorder Warning Level</label>
                  <input type="number" id="pm-min-stock" class="form-input" placeholder="5" value="5" />
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary btn-sm" id="pm-cancel">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm">${isEdit ? 'Update Product' : 'Save Product'}</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Tab switching
    modal.querySelectorAll('.ptab-btn').forEach(btn => {
      btn.onclick = () => {
        modal.querySelectorAll('.ptab-btn').forEach(b => {
          b.style.borderBottomColor = 'transparent';
          b.style.color = 'var(--slate-500)';
          b.style.fontWeight = '500';
        });
        btn.style.borderBottomColor = 'var(--primary-purple)';
        btn.style.color = 'var(--primary-purple)';
        btn.style.fontWeight = '600';

        const targetTab = btn.getAttribute('data-tab');
        modal.querySelectorAll('.ptab-content').forEach(c => c.style.display = 'none');
        document.getElementById(targetTab).style.display = 'block';
      };
    });

    document.getElementById('pm-close').onclick = () => modal.remove();
    document.getElementById('pm-cancel').onclick = () => modal.remove();

    document.getElementById('product-master-form').onsubmit = async (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById('pm-name').value.trim(),
        sku: document.getElementById('pm-sku').value.trim(),
        barcode: document.getElementById('pm-barcode').value.trim(),
        categoryName: document.getElementById('pm-category').value,
        costPrice: parseFloat(document.getElementById('pm-cost').value) || 0,
        salePrice: parseFloat(document.getElementById('pm-sale').value) || 0,
        stock: parseInt(document.getElementById('pm-stock').value, 10) || 0
      };

      try {
        if (isEdit) {
          await global.apiService.updateProduct({ id: existingProd.id, ...payload });
          global.Toast?.success(`Product "${payload.name}" updated!`);
        } else {
          await global.apiService.createProduct(payload);
          global.Toast?.success(`Product "${payload.name}" created!`);
        }
        modal.remove();
        loadProductsData(outlet);
      } catch (err) {
        global.Toast?.error(err.message);
      }
    };
  }

  function downloadExcelTemplate() {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Name,SKU,Barcode,Category,CostPrice,SalePrice,Stock\n" +
      "Men Cotton Polo T-Shirt,POLO-BLU-L,8901234500001,Menswear,450,899,25\n" +
      "Slim Fit Denim 32,JNS-32,8901234500002,Menswear,650,1499,30\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "retailnext_product_template.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    global.Toast?.success('Downloaded CSV / Excel bulk template');
  }

  global.ProductsCatalogPage = { render };
})(window);

