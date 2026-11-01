/**
 * RetailNext — Units of Measurement & Unit Conversions Page
 * Submenu: Masters -> Units of Measurement & Unit Conversions
 */

'use strict';

window.UomPage = (() => {

  const STORAGE_KEY_UOM = 'retailnext_uom_list';
  const STORAGE_KEY_CONV = 'retailnext_unit_conversions';

  const DEFAULT_UOM = [
    { id: 'UOM-01', code: 'PCS', name: 'Pieces', uqc: 'PCS - PIECES', decimals: 0, status: 'Active' },
    { id: 'UOM-02', code: 'BOX', name: 'Box / Carton', uqc: 'BOX - BOXES', decimals: 0, status: 'Active' },
    { id: 'UOM-03', code: 'PKT', name: 'Packet', uqc: 'PAC - PACKS', decimals: 0, status: 'Active' },
    { id: 'UOM-04', code: 'KG', name: 'Kilogram', uqc: 'KGS - KILOGRAMS', decimals: 3, status: 'Active' },
    { id: 'UOM-05', code: 'G', name: 'Gram', uqc: 'GRM - GRAMS', decimals: 2, status: 'Active' },
    { id: 'UOM-06', code: 'LTR', name: 'Litre', uqc: 'LTR - LITRES', decimals: 3, status: 'Active' },
    { id: 'UOM-07', code: 'ML', name: 'Millilitre', uqc: 'MLT - MILLILITRE', decimals: 0, status: 'Active' },
    { id: 'UOM-08', code: 'MTR', name: 'Metre', uqc: 'MTR - METRES', decimals: 2, status: 'Active' },
    { id: 'UOM-09', code: 'DOZ', name: 'Dozen', uqc: 'DOZ - DOZENS', decimals: 0, status: 'Active' }
  ];

  const DEFAULT_CONVERSIONS = [
    { id: 'CONV-01', fromUnit: 'Box', toUnit: 'Pieces', factor: 12, desc: '1 Box = 12 Pieces' },
    { id: 'CONV-02', fromUnit: 'Kilogram', toUnit: 'Gram', factor: 1000, desc: '1 Kg = 1,000 Grams' },
    { id: 'CONV-03', fromUnit: 'Litre', toUnit: 'Millilitre', factor: 1000, desc: '1 Litre = 1,000 ml' },
    { id: 'CONV-04', fromUnit: 'Carton', toUnit: 'Packet', factor: 24, desc: '1 Carton = 24 Packets' },
    { id: 'CONV-05', fromUnit: 'Dozen', toUnit: 'Pieces', factor: 12, desc: '1 Dozen = 12 Pieces' }
  ];

  function getUomList() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_UOM);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse UOM list:', e);
    }
    return [...DEFAULT_UOM];
  }

  function saveUomList(list) {
    localStorage.setItem(STORAGE_KEY_UOM, JSON.stringify(list));
  }

  function getConversions() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONV);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse conversions:', e);
    }
    return [...DEFAULT_CONVERSIONS];
  }

  function saveConversions(list) {
    localStorage.setItem(STORAGE_KEY_CONV, JSON.stringify(list));
  }

  function renderPage(outlet, subTab = 'uom') {
    if (!outlet) return;
    outlet.innerHTML = '';
    outlet.className = 'page-container uom-page';

    let activeTab = subTab.startsWith('unit-conv') ? 'conv' : 'uom';

    outlet.innerHTML = `
      <div class="module-header">
        <div>
          <span class="module-header__parent">Masters / Inventory</span>
          <h1 class="module-header__title">Units of Measurement & Conversions</h1>
        </div>
        <div class="module-header__actions">
          <div class="pill-group">
            <button class="pill-btn ${activeTab === 'uom' ? 'active' : ''}" id="uom-tab-base">Units of Measurement (UOM)</button>
            <button class="pill-btn ${activeTab === 'conv' ? 'active' : ''}" id="uom-tab-conv">Unit Conversion Rules</button>
          </div>
          <button class="btn btn--primary" id="btn-add-uom-modal" style="margin-left:12px;">+ Add Unit</button>
        </div>
      </div>

      <div id="uom-content-outlet"></div>
    `;

    const content = outlet.querySelector('#uom-content-outlet');
    const tabBase = outlet.querySelector('#uom-tab-base');
    const tabConv = outlet.querySelector('#uom-tab-conv');
    const addBtn = outlet.querySelector('#btn-add-uom-modal');

    function switchTab(t) {
      activeTab = t;
      tabBase.classList.toggle('active', t === 'uom');
      tabConv.classList.toggle('active', t === 'conv');
      addBtn.textContent = t === 'uom' ? '+ Add Unit' : '+ Add Conversion';

      if (t === 'uom') renderUomView(content, outlet);
      else renderConvView(content, outlet);
    }

    tabBase.onclick = () => switchTab('uom');
    tabConv.onclick = () => switchTab('conv');

    addBtn.onclick = () => {
      if (activeTab === 'uom') {
        const modal = outlet.querySelector('#add-uom-modal');
        if (modal) modal.classList.add('open');
      } else {
        const modal = outlet.querySelector('#add-conv-modal');
        if (modal) modal.classList.add('open');
      }
    };

    switchTab(activeTab);
  }

  function renderUomView(container, parentOutlet) {
    const list = getUomList();

    container.innerHTML = `
      <div class="card p-4">
        <div class="table-container">
          <table class="erp-table">
            <thead>
              <tr>
                <th>Unit Code</th>
                <th>Unit Name</th>
                <th>Statutory GST UQC Code</th>
                <th style="text-align:center;">Decimal Precision</th>
                <th style="text-align:center;">Status</th>
                <th style="text-align:center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(u => `
                <tr>
                  <td class="font-mono text-brand font-bold">${u.code}</td>
                  <td><strong>${u.name}</strong></td>
                  <td class="font-mono text-secondary">${u.uqc}</td>
                  <td style="text-align:center;" class="font-mono">${u.decimals === 0 ? '0 (Whole numbers only)' : `${u.decimals} decimals`}</td>
                  <td style="text-align:center;">
                    <span class="status-chip status-chip--success">${u.status}</span>
                  </td>
                  <td style="text-align:center;">
                    <button class="btn btn--xs btn--outline btn-del-uom" data-id="${u.id}">Remove</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add Unit Modal -->
      <div id="add-uom-modal" class="retail-modal">
        <div class="retail-modal__backdrop"></div>
        <div class="retail-modal__dialog" style="max-width:440px;">
          <div class="retail-modal__header">
            <strong>Add Unit of Measurement</strong>
            <button class="retail-modal__close" id="modal-uom-close">&times;</button>
          </div>
          <form id="form-add-uom">
            <div class="retail-modal__body" style="padding:16px;">
              <div class="form-group" style="margin-bottom:12px;">
                <label>Unit Name <span class="text-error">*</span></label>
                <input type="text" id="fu-name" class="pos-input" required placeholder="e.g. Bundle / Pack" />
              </div>
              <div class="form-group" style="margin-bottom:12px;">
                <label>Unit Symbol / Code <span class="text-error">*</span></label>
                <input type="text" id="fu-code" class="pos-input font-mono" required placeholder="e.g. BDL" />
              </div>
              <div class="form-group" style="margin-bottom:12px;">
                <label>Standard GST UQC Code</label>
                <input type="text" id="fu-uqc" class="pos-input font-mono" placeholder="e.g. BDL - BUNDLES" />
              </div>
              <div class="form-group">
                <label>Allowed Decimals</label>
                <select id="fu-decimals" class="pos-select">
                  <option value="0">0 (Only whole numbers like Pieces, Box)</option>
                  <option value="2">2 (e.g. 1.25 Metres)</option>
                  <option value="3">3 (e.g. 1.250 Kilograms)</option>
                </select>
              </div>
            </div>
            <div class="retail-modal__footer">
              <button type="button" class="btn btn--outline" id="modal-uom-cancel">Cancel</button>
              <button type="submit" class="btn btn--primary">Save Unit</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Modal Events
    const modal = container.querySelector('#add-uom-modal');
    const closeBtn = container.querySelector('#modal-uom-close');
    const cancelBtn = container.querySelector('#modal-uom-cancel');
    const form = container.querySelector('#form-add-uom');

    if (closeBtn && modal) closeBtn.onclick = () => modal.classList.remove('open');
    if (cancelBtn && modal) cancelBtn.onclick = () => modal.classList.remove('open');

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const list = getUomList();
        const newUom = {
          id: 'UOM-' + String(list.length + 1).padStart(2, '0'),
          name: container.querySelector('#fu-name').value.trim(),
          code: container.querySelector('#fu-code').value.trim().toUpperCase(),
          uqc: container.querySelector('#fu-uqc').value.trim() || 'OTH - OTHERS',
          decimals: Number(container.querySelector('#fu-decimals').value) || 0,
          status: 'Active'
        };
        list.push(newUom);
        saveUomList(list);
        modal.classList.remove('open');
        renderPage(parentOutlet, 'uom');
        alert(`Unit ${newUom.name} saved!`);
      };
    }

    container.querySelectorAll('.btn-del-uom').forEach(b => {
      b.onclick = () => {
        const id = b.getAttribute('data-id');
        if (confirm(`Remove unit ${id}?`)) {
          let list = getUomList().filter(i => i.id !== id);
          saveUomList(list);
          renderPage(parentOutlet, 'uom');
        }
      };
    });
  }

  function renderConvView(container, parentOutlet) {
    const convs = getConversions();

    container.innerHTML = `
      <div class="card p-4">
        <div style="margin-bottom:12px;font-size:12px;color:var(--color-text-secondary);">
          Unit conversions allow purchasing products in Cartons/Boxes and automatically billing in individual Pieces.
        </div>
        <div class="table-container">
          <table class="erp-table">
            <thead>
              <tr>
                <th>Conversion ID</th>
                <th>Primary Unit (Purchase)</th>
                <th>Equals (=)</th>
                <th>Alternate Unit (Sale)</th>
                <th>Conversion Factor</th>
                <th>Formula Description</th>
                <th style="text-align:center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${convs.map(c => `
                <tr>
                  <td class="font-mono text-brand font-bold">${c.id}</td>
                  <td><strong>1 ${c.fromUnit}</strong></td>
                  <td style="color:var(--color-text-secondary);">&rarr;</td>
                  <td><strong>${c.toUnit}</strong></td>
                  <td class="font-mono font-bold" style="color:var(--color-brand);">${c.factor}</td>
                  <td class="font-mono text-secondary">${c.desc}</td>
                  <td style="text-align:center;">
                    <button class="btn btn--xs btn--outline btn-del-conv" data-id="${c.id}">Remove</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add Conversion Modal -->
      <div id="add-conv-modal" class="retail-modal">
        <div class="retail-modal__backdrop"></div>
        <div class="retail-modal__dialog" style="max-width:460px;">
          <div class="retail-modal__header">
            <strong>Add Unit Conversion Rule</strong>
            <button class="retail-modal__close" id="modal-conv-close">&times;</button>
          </div>
          <form id="form-add-conv">
            <div class="retail-modal__body" style="padding:16px;">
              <div class="form-grid-2" style="margin-bottom:12px;">
                <div class="form-group">
                  <label>From Primary Unit <span class="text-error">*</span></label>
                  <input type="text" id="fc-from" class="pos-input" required placeholder="e.g. Box" />
                </div>
                <div class="form-group">
                  <label>To Base Unit <span class="text-error">*</span></label>
                  <input type="text" id="fc-to" class="pos-input" required placeholder="e.g. Pieces" />
                </div>
              </div>
              <div class="form-group">
                <label>Multiplier Factor (How many base units in 1 primary unit?) <span class="text-error">*</span></label>
                <input type="number" id="fc-factor" class="pos-input font-mono" required value="12" min="1" step="any" />
              </div>
            </div>
            <div class="retail-modal__footer">
              <button type="button" class="btn btn--outline" id="modal-conv-cancel">Cancel</button>
              <button type="submit" class="btn btn--primary">Save Conversion</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const modal = container.querySelector('#add-conv-modal');
    const closeBtn = container.querySelector('#modal-conv-close');
    const cancelBtn = container.querySelector('#modal-conv-cancel');
    const form = container.querySelector('#form-add-conv');

    if (closeBtn && modal) closeBtn.onclick = () => modal.classList.remove('open');
    if (cancelBtn && modal) cancelBtn.onclick = () => modal.classList.remove('open');

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const list = getConversions();
        const from = container.querySelector('#fc-from').value.trim();
        const to = container.querySelector('#fc-to').value.trim();
        const factor = Number(container.querySelector('#fc-factor').value) || 1;

        const newRule = {
          id: 'CONV-' + String(list.length + 1).padStart(2, '0'),
          fromUnit: from,
          toUnit: to,
          factor,
          desc: `1 ${from} = ${factor} ${to}`
        };

        list.push(newRule);
        saveConversions(list);
        modal.classList.remove('open');
        renderPage(parentOutlet, 'unit-conv');
        alert(`Conversion rule saved: ${newRule.desc}`);
      };
    }

    container.querySelectorAll('.btn-del-conv').forEach(b => {
      b.onclick = () => {
        const id = b.getAttribute('data-id');
        if (confirm(`Remove conversion rule ${id}?`)) {
          let list = getConversions().filter(i => i.id !== id);
          saveConversions(list);
          renderPage(parentOutlet, 'unit-conv');
        }
      };
    });
  }

  return { renderPage, getUomList, getConversions };
})();

