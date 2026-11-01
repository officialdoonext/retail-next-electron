/**
 * RetailNext — Tax Master (GST & HSN/SAC) Page
 * Submenu: Masters -> Tax Master -> GST Rates, HSN/SAC Codes, Tax Categories
 */

'use strict';

window.TaxMasterPage = (() => {

  const STORAGE_KEY_HSN = 'retailnext_hsn_codes';

  const DEFAULT_GST_SLABS = [
    { rate: 0, label: '0% (Nil / Exempt)', cgst: 0, sgst: 0, igst: 0, desc: 'Fresh milk, fruits, salt, unpacked grains' },
    { rate: 5, label: '5% GST (Essentials)', cgst: 2.5, sgst: 2.5, igst: 5, desc: 'Edible cooking oils, branded packaged food, tea, coffee, medicines' },
    { rate: 12, label: '12% GST (Standard Low)', cgst: 6, sgst: 6, igst: 12, desc: 'Butter, ghee, cheese, fruit juices, frozen meat products' },
    { rate: 18, label: '18% GST (Standard High)', cgst: 9, sgst: 9, igst: 18, desc: 'Biscuits, personal hygiene, detergents, hair oils, stationeries' },
    { rate: 28, label: '28% GST (Luxury)', cgst: 14, sgst: 14, igst: 28, desc: 'Aerated soft drinks, air conditioners, chocolates, luxury goods' }
  ];

  const DEFAULT_HSN = [
    { hsn: '1006', desc: 'Rice & Paddy Grains', gst: 5, category: 'Food & Grains' },
    { hsn: '1512', desc: 'Sunflower, Safflower & Cottonseed Oil', gst: 5, category: 'Cooking Oils' },
    { hsn: '2501', desc: 'Salt, Pure Sodium Chloride', gst: 0, category: 'Staples (Exempt)' },
    { hsn: '0401', desc: 'Milk & Dairy Cream, not concentrated', gst: 5, category: 'Dairy' },
    { hsn: '0405', desc: 'Butter, Ghee and Dairy Fats', gst: 12, category: 'Dairy & Fats' },
    { hsn: '1905', desc: 'Biscuits, Bread, Pastries, Cakes', gst: 18, category: 'Bakery & Snacks' },
    { hsn: '2202', desc: 'Waters, Aerated drinks containing sugar', gst: 28, category: 'Beverages' },
    { hsn: '3305', desc: 'Shampoos, Hair Oils & Preparations', gst: 18, category: 'Personal Care' },
    { hsn: '3401', desc: 'Bath Soaps, Organic Surface-active Products', gst: 18, category: 'Personal Care' },
    { hsn: '3402', desc: 'Washing Powders, Detergents & Cleaning Preparations', gst: 18, category: 'Home Care' }
  ];

  function getHsnList() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_HSN);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse HSN list:', e);
    }
    return [...DEFAULT_HSN];
  }

  function saveHsnList(list) {
    localStorage.setItem(STORAGE_KEY_HSN, JSON.stringify(list));
  }

  function renderPage(outlet, subTab = 'gst') {
    if (!outlet) return;
    outlet.innerHTML = '';
    outlet.className = 'page-container tax-page';

    let activeTab = subTab === 'tax-hsn' ? 'hsn' : 'gst';

    outlet.innerHTML = `
      <div class="module-header">
        <div>
          <span class="module-header__parent">Masters / Taxation</span>
          <h1 class="module-header__title">Tax Master (GST Slabs & HSN/SAC Directory)</h1>
        </div>
        <div class="module-header__actions">
          <div class="pill-group">
            <button class="pill-btn ${activeTab === 'gst' ? 'active' : ''}" id="tax-tab-gst">GST Tax Slabs</button>
            <button class="pill-btn ${activeTab === 'hsn' ? 'active' : ''}" id="tax-tab-hsn">HSN / SAC Directory</button>
          </div>
          <button class="btn btn--primary" id="btn-add-hsn-modal" style="margin-left:12px;">+ Add HSN Code</button>
        </div>
      </div>

      <div id="tax-body-outlet"></div>
    `;

    const body = outlet.querySelector('#tax-body-outlet');
    const tabGst = outlet.querySelector('#tax-tab-gst');
    const tabHsn = outlet.querySelector('#tax-tab-hsn');

    function switchTab(t) {
      activeTab = t;
      tabGst.classList.toggle('active', t === 'gst');
      tabHsn.classList.toggle('active', t === 'hsn');

      if (t === 'gst') renderGstView(body);
      else renderHsnView(body, outlet);
    }

    tabGst.onclick = () => switchTab('gst');
    tabHsn.onclick = () => switchTab('hsn');

    outlet.querySelector('#btn-add-hsn-modal').onclick = () => {
      const modal = outlet.querySelector('#add-hsn-modal');
      if (modal) modal.classList.add('open');
    };

    switchTab(activeTab);
  }

  function renderGstView(container) {
    container.innerHTML = `
      <div class="card p-4">
        <h3 style="font-size:15px;margin:0 0 4px;">Indian GST Tax Slabs (Goods & Services Tax)</h3>
        <p style="font-size:12px;color:var(--color-text-secondary);margin-bottom:16px;">
          For Intra-state sales (within state), tax is equally divided into CGST and SGST. For Inter-state sales, full IGST applies.
        </p>

        <div class="table-container">
          <table class="erp-table">
            <thead>
              <tr>
                <th>GST Slab</th>
                <th style="text-align:center;">Total GST Rate</th>
                <th style="text-align:center;">CGST (Central)</th>
                <th style="text-align:center;">SGST (State)</th>
                <th style="text-align:center;">IGST (Inter-state)</th>
                <th>Standard Product Inclusions</th>
                <th style="text-align:center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${DEFAULT_GST_SLABS.map(s => `
                <tr>
                  <td><strong>${s.label}</strong></td>
                  <td style="text-align:center;" class="font-mono font-bold text-brand">${s.rate}%</td>
                  <td style="text-align:center;" class="font-mono">${s.cgst}%</td>
                  <td style="text-align:center;" class="font-mono">${s.sgst}%</td>
                  <td style="text-align:center;" class="font-mono font-bold">${s.igst}%</td>
                  <td style="font-size:12px;color:var(--color-text-secondary);">${s.desc}</td>
                  <td style="text-align:center;"><span class="status-chip status-chip--success">Active</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderHsnView(container, parentOutlet) {
    const list = getHsnList();

    container.innerHTML = `
      <div class="card p-4">
        <div class="filter-bar" style="margin-bottom:16px;">
          <input type="text" id="hsn-search" class="pos-input" style="max-width:320px;" placeholder="Search HSN code or item description..." />
          <div class="text-secondary font-mono" style="margin-left:auto;font-size:12px;">Total: ${list.length} HSN Codes</div>
        </div>

        <div class="table-container">
          <table class="erp-table">
            <thead>
              <tr>
                <th>HSN Code</th>
                <th>Description / Commodity</th>
                <th>Commodity Category</th>
                <th style="text-align:center;">Applicable GST</th>
                <th style="text-align:center;">Action</th>
              </tr>
            </thead>
            <tbody id="hsn-tbody">
              ${renderHsnRows(list)}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add HSN Modal -->
      <div id="add-hsn-modal" class="retail-modal">
        <div class="retail-modal__backdrop"></div>
        <div class="retail-modal__dialog" style="max-width:460px;">
          <div class="retail-modal__header">
            <strong>Register New HSN / SAC Code</strong>
            <button class="retail-modal__close" id="modal-hsn-close">&times;</button>
          </div>
          <form id="form-add-hsn">
            <div class="retail-modal__body" style="padding:16px;">
              <div class="form-grid-2" style="margin-bottom:12px;">
                <div class="form-group">
                  <label>HSN Code (4 to 8 digits) <span class="text-error">*</span></label>
                  <input type="text" id="fh-code" class="pos-input font-mono" required placeholder="e.g. 1006" />
                </div>
                <div class="form-group">
                  <label>GST Rate % <span class="text-error">*</span></label>
                  <select id="fh-gst" class="pos-select">
                    <option value="0">0% (Exempt)</option>
                    <option value="5" selected>5% GST</option>
                    <option value="12">12% GST</option>
                    <option value="18">18% GST</option>
                    <option value="28">28% GST</option>
                  </select>
                </div>
              </div>
              <div class="form-group" style="margin-bottom:12px;">
                <label>Commodity Description <span class="text-error">*</span></label>
                <input type="text" id="fh-desc" class="pos-input" required placeholder="e.g. Basmati Rice & Paddy Grains" />
              </div>
              <div class="form-group">
                <label>Category Group</label>
                <input type="text" id="fh-cat" class="pos-input" placeholder="e.g. Food & Grains" />
              </div>
            </div>
            <div class="retail-modal__footer">
              <button type="button" class="btn btn--outline" id="modal-hsn-cancel">Cancel</button>
              <button type="submit" class="btn btn--primary">Save HSN Code</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const searchInput = container.querySelector('#hsn-search');
    const tbody = container.querySelector('#hsn-tbody');

    if (searchInput) {
      searchInput.oninput = () => {
        const q = searchInput.value.trim().toLowerCase();
        const filtered = list.filter(h => h.hsn.includes(q) || h.desc.toLowerCase().includes(q) || h.category.toLowerCase().includes(q));
        tbody.innerHTML = renderHsnRows(filtered);
      };
    }

    const modal = container.querySelector('#add-hsn-modal');
    const closeBtn = container.querySelector('#modal-hsn-close');
    const cancelBtn = container.querySelector('#modal-hsn-cancel');
    const form = container.querySelector('#form-add-hsn');

    if (closeBtn && modal) closeBtn.onclick = () => modal.classList.remove('open');
    if (cancelBtn && modal) cancelBtn.onclick = () => modal.classList.remove('open');

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const all = getHsnList();
        const newHsn = {
          hsn: container.querySelector('#fh-code').value.trim(),
          desc: container.querySelector('#fh-desc').value.trim(),
          gst: Number(container.querySelector('#fh-gst').value) || 0,
          category: container.querySelector('#fh-cat').value.trim() || 'General'
        };

        all.unshift(newHsn);
        saveHsnList(all);
        modal.classList.remove('open');
        renderPage(parentOutlet, 'tax-hsn');
        alert(`HSN Code ${newHsn.hsn} saved successfully!`);
      };
    }
  }

  function renderHsnRows(list) {
    return list.map(h => `
      <tr>
        <td class="font-mono text-brand font-bold">${h.hsn}</td>
        <td><strong>${h.desc}</strong></td>
        <td><span class="pay-chip pay-chip--card" style="font-size:11px;">${h.category}</span></td>
        <td style="text-align:center;" class="font-mono font-bold">${h.gst}%</td>
        <td style="text-align:center;">
          <button class="btn btn--xs btn--outline" onclick="alert('Viewing linked products for HSN ${h.hsn}')">Products</button>
        </td>
      </tr>
    `).join('');
  }

  return { renderPage, getHsnList };
})();

