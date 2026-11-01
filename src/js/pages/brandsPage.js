/**
 * RetailNext — Brands Master Page
 * Submenu: Masters -> Brands -> Add Brand, Edit Brand, Brand List
 */

'use strict';

window.BrandsPage = (() => {

  const STORAGE_KEY = 'retailnext_brands';

  const DEFAULT_BRANDS = [
    { id: 'BRD-01', code: 'FORT', name: 'Fortune', manufacturer: 'Adani Wilmar Ltd', category: 'Grocery & Staples', active: true, count: 24 },
    { id: 'BRD-02', code: 'TATA', name: 'Tata Sampann & Salt', manufacturer: 'Tata Consumer Products Ltd', category: 'Grocery & Staples', active: true, count: 32 },
    { id: 'BRD-03', code: 'AMUL', name: 'Amul (The Taste of India)', manufacturer: 'GCMMF Ltd', category: 'Dairy & Chilled', active: true, count: 45 },
    { id: 'BRD-04', code: 'IGAT', name: 'India Gate Basmati', manufacturer: 'KRBL Limited', category: 'Rice & Grains', active: true, count: 18 },
    { id: 'BRD-05', code: 'NEST', name: 'Nestle (Maggi / Nescafe)', manufacturer: 'Nestle India Ltd', category: 'Packaged Foods', active: true, count: 38 },
    { id: 'BRD-06', code: 'HUL', name: 'Hindustan Unilever (Surf/Dove)', manufacturer: 'Hindustan Unilever Ltd', category: 'Personal & Home Care', active: true, count: 74 },
    { id: 'BRD-07', code: 'BRIT', name: 'Britannia Good Day', manufacturer: 'Britannia Industries Ltd', category: 'Biscuits & Snacks', active: true, count: 29 },
    { id: 'BRD-08', code: 'ITC', name: 'Aashirvaad & Sunfeast', manufacturer: 'ITC Limited', category: 'Flour & Staples', active: true, count: 36 }
  ];

  function getBrands() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse brands:', e);
    }
    return [...DEFAULT_BRANDS];
  }

  function saveBrands(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function renderPage(outlet, subTab = 'list') {
    if (!outlet) return;
    outlet.innerHTML = '';
    outlet.className = 'page-container brands-page';

    const brands = getBrands();

    outlet.innerHTML = `
      <div class="module-header">
        <div>
          <span class="module-header__parent">Masters / Catalog</span>
          <h1 class="module-header__title">Brand Master</h1>
        </div>
        <div class="module-header__actions">
          <button class="btn btn--primary" id="btn-add-brand-modal">+ Add New Brand</button>
        </div>
      </div>

      <div class="card p-4">
        <div class="filter-bar" style="margin-bottom:16px;">
          <input type="text" id="brand-search" class="pos-input" style="max-width:320px;" placeholder="Search brands by name or manufacturer..." />
          <div class="text-secondary font-mono" style="margin-left:auto;font-size:12px;">Total: ${brands.length} Brands</div>
        </div>

        <div class="table-container">
          <table class="erp-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Brand Name</th>
                <th>Manufacturer / Principal Company</th>
                <th>Primary Segment</th>
                <th style="text-align:right;">Catalog Items</th>
                <th style="text-align:center;">Status</th>
                <th style="text-align:center;">Actions</th>
              </tr>
            </thead>
            <tbody id="brand-tbody">
              ${renderRows(brands)}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add Brand Modal -->
      <div id="brand-modal" class="retail-modal">
        <div class="retail-modal__backdrop"></div>
        <div class="retail-modal__dialog" style="max-width:480px;">
          <div class="retail-modal__header">
            <strong>Register New Brand</strong>
            <button class="retail-modal__close" id="brand-modal-close">&times;</button>
          </div>
          <form id="brand-form">
            <div class="retail-modal__body" style="padding:16px;">
              <div class="form-grid-2" style="margin-bottom:12px;">
                <div class="form-group">
                  <label>Brand Name <span class="text-error">*</span></label>
                  <input type="text" id="fb-name" class="pos-input" required placeholder="e.g. Amul" />
                </div>
                <div class="form-group">
                  <label>Brand Code <span class="text-error">*</span></label>
                  <input type="text" id="fb-code" class="pos-input font-mono" required placeholder="e.g. AMUL" />
                </div>
              </div>

              <div class="form-group" style="margin-bottom:12px;">
                <label>Manufacturer / Principal Company <span class="text-error">*</span></label>
                <input type="text" id="fb-manufacturer" class="pos-input" required placeholder="e.g. Gujarat Co-operative Milk Marketing Federation" />
              </div>

              <div class="form-group" style="margin-bottom:12px;">
                <label>Primary Retail Segment</label>
                <input type="text" id="fb-segment" class="pos-input" placeholder="e.g. Dairy & Frozen Foods" />
              </div>

              <div class="form-group">
                <label>Status</label>
                <select id="fb-status" class="pos-select">
                  <option value="true" selected>Active Brand</option>
                  <option value="false">Inactive / Discontinued</option>
                </select>
              </div>
            </div>

            <div class="retail-modal__footer">
              <button type="button" class="btn btn--outline" id="brand-modal-cancel">Cancel</button>
              <button type="submit" class="btn btn--primary">Save Brand</button>
            </div>
          </form>
        </div>
      </div>
    `;

    setupEvents(outlet);

    if (subTab === 'add') {
      const modal = outlet.querySelector('#brand-modal');
      if (modal) modal.classList.add('open');
    }
  }

  function renderRows(list) {
    if (list.length === 0) {
      return `<tr><td colspan="7" class="table-empty"><div class="table-empty__text">No brands found</div></td></tr>`;
    }

    return list.map(b => `
      <tr>
        <td class="font-mono text-brand font-bold">${b.code}</td>
        <td>
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:28px;height:28px;background:rgba(59,130,246,0.1);color:var(--color-brand);border-radius:4px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;">
              ${b.name.charAt(0)}
            </div>
            <strong>${b.name}</strong>
          </div>
        </td>
        <td>${b.manufacturer}</td>
        <td><span class="pay-chip pay-chip--card" style="font-size:11px;">${b.category}</span></td>
        <td style="text-align:right;" class="font-mono font-bold">${b.count} products</td>
        <td style="text-align:center;">
          <span class="status-chip status-chip--${b.active ? 'success' : 'warning'}">${b.active ? 'Active' : 'Inactive'}</span>
        </td>
        <td style="text-align:center;">
          <button class="btn btn--xs btn--outline btn-del-brand" data-id="${b.id}">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  function setupEvents(outlet) {
    const searchInput = outlet.querySelector('#brand-search');
    const tbody = outlet.querySelector('#brand-tbody');

    if (searchInput) {
      searchInput.oninput = () => {
        const q = searchInput.value.trim().toLowerCase();
        const all = getBrands();
        const filtered = all.filter(b => b.name.toLowerCase().includes(q) || b.manufacturer.toLowerCase().includes(q) || b.code.toLowerCase().includes(q));
        tbody.innerHTML = renderRows(filtered);
        attachDeleteEvents(outlet);
      };
    }

    const addBtn = outlet.querySelector('#btn-add-brand-modal');
    const modal = outlet.querySelector('#brand-modal');
    const closeBtn = outlet.querySelector('#brand-modal-close');
    const cancelBtn = outlet.querySelector('#brand-modal-cancel');
    const form = outlet.querySelector('#brand-form');

    if (addBtn && modal) addBtn.onclick = () => modal.classList.add('open');
    if (closeBtn && modal) closeBtn.onclick = () => modal.classList.remove('open');
    if (cancelBtn && modal) cancelBtn.onclick = () => modal.classList.remove('open');

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const list = getBrands();
        const newBrand = {
          id: 'BRD-' + String(list.length + 1).padStart(2, '0'),
          name: outlet.querySelector('#fb-name').value.trim(),
          code: outlet.querySelector('#fb-code').value.trim().toUpperCase(),
          manufacturer: outlet.querySelector('#fb-manufacturer').value.trim(),
          category: outlet.querySelector('#fb-segment').value.trim() || 'General FMCG',
          active: outlet.querySelector('#fb-status').value === 'true',
          count: 0
        };

        list.push(newBrand);
        saveBrands(list);
        modal.classList.remove('open');
        renderPage(outlet);
        alert(`Brand ${newBrand.name} registered successfully!`);
      };
    }

    attachDeleteEvents(outlet);
  }

  function attachDeleteEvents(outlet) {
    outlet.querySelectorAll('.btn-del-brand').forEach(b => {
      b.onclick = () => {
        const id = b.getAttribute('data-id');
        if (confirm(`Remove brand ${id}?`)) {
          let list = getBrands().filter(item => item.id !== id);
          saveBrands(list);
          renderPage(outlet);
        }
      };
    });
  }

  return { renderPage, getBrands };
})();
