/**
 * RetailNext — Product Categories Master Page
 * Submenu: Masters -> Product Categories -> Main Category, Subcategory, Category List
 */

'use strict';

window.CategoriesPage = (() => {

  const STORAGE_KEY = 'retailnext_categories';

  const DEFAULT_CATEGORIES = [
    { id: 'CAT-01', code: 'GROC', name: 'Grocery & Staples', parent: null, gstRate: 5, hsn: '1006', active: true, count: 142 },
    { id: 'CAT-02', code: 'DAIR', name: 'Dairy & Chilled', parent: null, gstRate: 5, hsn: '0401', active: true, count: 48 },
    { id: 'CAT-03', code: 'SNKS', name: 'Snacks & Confectionery', parent: null, gstRate: 12, hsn: '1905', active: true, count: 85 },
    { id: 'CAT-04', code: 'BEVG', name: 'Beverages & Juices', parent: null, gstRate: 18, hsn: '2202', active: true, count: 64 },
    { id: 'CAT-05', code: 'PERS', name: 'Personal Care & Hygiene', parent: null, gstRate: 18, hsn: '3305', active: true, count: 110 },
    { id: 'CAT-06', code: 'HOUS', name: 'Household & Cleaning', parent: null, gstRate: 18, hsn: '3402', active: true, count: 72 },
    // Subcategories
    { id: 'CAT-07', code: 'OIL', name: 'Edible Oils & Ghee', parent: 'Grocery & Staples', gstRate: 5, hsn: '1512', active: true, count: 28 },
    { id: 'CAT-08', code: 'RICE', name: 'Rice & Grains', parent: 'Grocery & Staples', gstRate: 5, hsn: '1006', active: true, count: 35 },
    { id: 'CAT-09', code: 'MILK', name: 'Milk & Paneer', parent: 'Dairy & Chilled', gstRate: 5, hsn: '0401', active: true, count: 18 },
    { id: 'CAT-10', code: 'SOAP', name: 'Soaps & Shampoos', parent: 'Personal Care & Hygiene', gstRate: 18, hsn: '3401', active: true, count: 42 }
  ];

  function getCategories() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse categories:', e);
    }
    return [...DEFAULT_CATEGORIES];
  }

  function saveCategories(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function renderPage(outlet, subTab = 'list') {
    if (!outlet) return;
    outlet.innerHTML = '';
    outlet.className = 'page-container categories-page';

    const categories = getCategories();
    const mainCats = categories.filter(c => !c.parent);
    const subCats = categories.filter(c => c.parent);

    outlet.innerHTML = `
      <div class="module-header">
        <div>
          <span class="module-header__parent">Masters / Catalog</span>
          <h1 class="module-header__title">Product Categories & Subcategories</h1>
        </div>
        <div class="module-header__actions">
          <button class="btn btn--primary" id="btn-add-cat-modal">+ Add Category</button>
        </div>
      </div>

      <!-- Quick Metrics Strip -->
      <div class="dash-metrics" style="margin-bottom:20px;">
        <div class="metric-card">
          <div class="metric-card__label">Total Categories</div>
          <div class="metric-card__value text-brand">${categories.length}</div>
          <div class="metric-card__sub">Catalog classifications</div>
        </div>
        <div class="metric-card">
          <div class="metric-card__label">Main Categories</div>
          <div class="metric-card__value text-success">${mainCats.length}</div>
          <div class="metric-card__sub">Top-level department groups</div>
        </div>
        <div class="metric-card">
          <div class="metric-card__label">Subcategories</div>
          <div class="metric-card__value text-info">${subCats.length}</div>
          <div class="metric-card__sub">Nested item classifications</div>
        </div>
      </div>

      <!-- Categories Table Card -->
      <div class="card p-4">
        <div class="filter-bar" style="margin-bottom:16px;">
          <input type="text" id="cat-search" class="pos-input" style="max-width:320px;" placeholder="Search categories by name or code..." />
          <select id="cat-filter-parent" class="pos-select" style="max-width:220px;">
            <option value="">All Categories & Subcategories</option>
            <option value="main">Main Categories Only</option>
            <option value="sub">Subcategories Only</option>
          </select>
        </div>

        <div class="table-container">
          <table class="erp-table">
            <thead>
              <tr>
                <th>Category Code</th>
                <th>Category Name</th>
                <th>Type / Parent</th>
                <th>Default GST %</th>
                <th>HSN Code</th>
                <th style="text-align:right;">Linked Products</th>
                <th style="text-align:center;">Status</th>
                <th style="text-align:center;">Actions</th>
              </tr>
            </thead>
            <tbody id="cat-tbody">
              ${renderRows(categories)}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Category Modal -->
      <div id="cat-modal" class="retail-modal">
        <div class="retail-modal__backdrop"></div>
        <div class="retail-modal__dialog" style="max-width:500px;">
          <div class="retail-modal__header">
            <strong id="cat-modal-title">Add New Category</strong>
            <button class="retail-modal__close" id="cat-modal-close">&times;</button>
          </div>
          <form id="cat-form">
            <div class="retail-modal__body" style="padding:16px;">
              <div class="form-grid-2" style="margin-bottom:12px;">
                <div class="form-group">
                  <label>Category Name <span class="text-error">*</span></label>
                  <input type="text" id="fc-name" class="pos-input" required placeholder="e.g. Dairy & Chilled" />
                </div>
                <div class="form-group">
                  <label>Category Code <span class="text-error">*</span></label>
                  <input type="text" id="fc-code" class="pos-input font-mono" required placeholder="e.g. DAIRY" />
                </div>
              </div>

              <div class="form-group" style="margin-bottom:12px;">
                <label>Parent Category (Leave empty for Main Category)</label>
                <select id="fc-parent" class="pos-select">
                  <option value="">-- None (Top-Level Main Category) --</option>
                  ${mainCats.map(m => `<option value="${m.name}">${m.name}</option>`).join('')}
                </select>
              </div>

              <div class="form-grid-2" style="margin-bottom:12px;">
                <div class="form-group">
                  <label>Default GST Rate</label>
                  <select id="fc-gst" class="pos-select">
                    <option value="0">0% (Exempt)</option>
                    <option value="5" selected>5% GST</option>
                    <option value="12">12% GST</option>
                    <option value="18">18% GST</option>
                    <option value="28">28% GST</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Default HSN Code</label>
                  <input type="text" id="fc-hsn" class="pos-input font-mono" placeholder="e.g. 1006" />
                </div>
              </div>

              <div class="form-group">
                <label>Description & Notes</label>
                <textarea id="fc-desc" class="pos-input" rows="2" placeholder="Optional notes for this category..."></textarea>
              </div>
            </div>

            <div class="retail-modal__footer">
              <button type="button" class="btn btn--outline" id="cat-modal-cancel">Cancel</button>
              <button type="submit" class="btn btn--primary">Save Category</button>
            </div>
          </form>
        </div>
      </div>
    `;

    setupEvents(outlet);

    if (subTab === 'main') {
      const filterSelect = outlet.querySelector('#cat-filter-parent');
      if (filterSelect) {
        filterSelect.value = 'main';
        filterSelect.dispatchEvent(new Event('change'));
      }
    } else if (subTab === 'sub') {
      const filterSelect = outlet.querySelector('#cat-filter-parent');
      if (filterSelect) {
        filterSelect.value = 'sub';
        filterSelect.dispatchEvent(new Event('change'));
      }
    }
  }

  function renderRows(list) {
    if (list.length === 0) {
      return `<tr><td colspan="8" class="table-empty"><div class="table-empty__text">No matching categories found</div></td></tr>`;
    }

    return list.map(c => `
      <tr>
        <td class="font-mono text-brand font-bold">${c.code}</td>
        <td><strong>${c.name}</strong></td>
        <td>
          ${c.parent 
            ? `<span class="pay-chip pay-chip--card" style="font-size:11px;">Sub &rarr; ${c.parent}</span>`
            : '<span class="status-chip status-chip--success" style="font-size:10px;">MAIN CATEGORY</span>'}
        </td>
        <td class="font-mono">${c.gstRate}%</td>
        <td class="font-mono text-secondary">${c.hsn || '—'}</td>
        <td style="text-align:right;" class="font-mono font-bold">${c.count} items</td>
        <td style="text-align:center;">
          <span class="status-chip status-chip--${c.active ? 'success' : 'warning'}">${c.active ? 'Active' : 'Inactive'}</span>
        </td>
        <td style="text-align:center;">
          <button class="btn btn--xs btn--outline btn-del-cat" data-id="${c.id}">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  function setupEvents(outlet) {
    const searchInput = outlet.querySelector('#cat-search');
    const filterSelect = outlet.querySelector('#cat-filter-parent');
    const tbody = outlet.querySelector('#cat-tbody');

    function applyFilter() {
      const q = (searchInput.value || '').trim().toLowerCase();
      const parentFilter = filterSelect.value;
      const all = getCategories();

      const filtered = all.filter(c => {
        const matchesQ = !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
        const matchesType = !parentFilter || 
          (parentFilter === 'main' && !c.parent) || 
          (parentFilter === 'sub' && c.parent);
        return matchesQ && matchesType;
      });

      tbody.innerHTML = renderRows(filtered);
      attachDeleteEvents(outlet);
    }

    if (searchInput) searchInput.oninput = applyFilter;
    if (filterSelect) filterSelect.onchange = applyFilter;

    // Modal
    const addBtn = outlet.querySelector('#btn-add-cat-modal');
    const modal = outlet.querySelector('#cat-modal');
    const closeBtn = outlet.querySelector('#cat-modal-close');
    const cancelBtn = outlet.querySelector('#cat-modal-cancel');
    const form = outlet.querySelector('#cat-form');

    if (addBtn && modal) addBtn.onclick = () => modal.classList.add('open');
    if (closeBtn && modal) closeBtn.onclick = () => modal.classList.remove('open');
    if (cancelBtn && modal) cancelBtn.onclick = () => modal.classList.remove('open');

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const list = getCategories();
        const newCat = {
          id: 'CAT-' + String(list.length + 1).padStart(2, '0'),
          name: outlet.querySelector('#fc-name').value.trim(),
          code: outlet.querySelector('#fc-code').value.trim().toUpperCase(),
          parent: outlet.querySelector('#fc-parent').value.trim() || null,
          gstRate: Number(outlet.querySelector('#fc-gst').value) || 0,
          hsn: outlet.querySelector('#fc-hsn').value.trim(),
          active: true,
          count: 0
        };

        list.push(newCat);
        saveCategories(list);
        modal.classList.remove('open');
        renderPage(outlet);
        alert(`Category ${newCat.name} created successfully!`);
      };
    }

    attachDeleteEvents(outlet);
  }

  function attachDeleteEvents(outlet) {
    outlet.querySelectorAll('.btn-del-cat').forEach(b => {
      b.onclick = () => {
        const id = b.getAttribute('data-id');
        if (confirm(`Are you sure you want to remove category ${id}?`)) {
          let list = getCategories().filter(c => c.id !== id);
          saveCategories(list);
          renderPage(outlet);
        }
      };
    });
  }

  return { renderPage, getCategories };
})();
