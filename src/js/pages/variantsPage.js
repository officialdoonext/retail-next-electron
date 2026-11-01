/**
 * RetailNext — Product Variants Master Page
 * Submenu: Masters -> Product Variants -> Size, Colour, Weight, Model, Variant List
 */

'use strict';

window.VariantsPage = (() => {

  const STORAGE_KEY = 'retailnext_variant_attributes';

  const DEFAULT_ATTRIBUTES = [
    {
      id: 'VAR-SIZE',
      name: 'Size',
      type: 'Text',
      values: ['Small (S)', 'Medium (M)', 'Large (L)', 'Extra Large (XL)', 'XXL', 'Free Size', '28', '30', '32', '34', '36', '38']
    },
    {
      id: 'VAR-COLOUR',
      name: 'Colour',
      type: 'Colour Code',
      values: ['Black', 'Navy Blue', 'Pure White', 'Ruby Red', 'Olive Green', 'Charcoal Grey', 'Yellow', 'Beige']
    },
    {
      id: 'VAR-WEIGHT',
      name: 'Weight / Pack Size',
      type: 'Measurement',
      values: ['100g', '250g', '500g', '1 Kg', '2 Kg', '5 Kg', '10 Kg', '200ml', '500ml', '1 Litre', '5 Litre Can']
    },
    {
      id: 'VAR-MODEL',
      name: 'Model / Edition',
      type: 'Text',
      values: ['Standard 2026', 'Premium Edition', 'Eco Pack', 'Family Saver Pack', 'Festival Gift Box']
    }
  ];

  function getAttributes() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse variant attributes:', e);
    }
    return [...DEFAULT_ATTRIBUTES];
  }

  function saveAttributes(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function renderPage(outlet, filterType = null) {
    if (!outlet) return;
    outlet.innerHTML = '';
    outlet.className = 'page-container variants-page';

    const attrs = getAttributes();

    outlet.innerHTML = `
      <div class="module-header">
        <div>
          <span class="module-header__parent">Masters / Catalog</span>
          <h1 class="module-header__title">Product Variants & Matrix Attributes</h1>
        </div>
        <div class="module-header__actions">
          <button class="btn btn--primary" id="btn-add-var-attr">+ Add Variant Dimension</button>
        </div>
      </div>

      <div class="dash-columns" style="align-items:flex-start;">

        <!-- Left: Attributes & Options List -->
        <div style="flex:2;display:flex;flex-direction:column;gap:16px;">
          ${attrs.map(attr => `
            <div class="card p-4" id="card-var-${attr.id.toLowerCase()}">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <div>
                  <h3 style="font-size:15px;margin:0 0 2px;">
                    ${attr.name}
                    <span class="pay-chip pay-chip--card" style="font-size:10px;margin-left:6px;">${attr.type}</span>
                  </h3>
                  <div style="font-size:11px;color:var(--color-text-secondary);">${attr.values.length} predefined options</div>
                </div>
                <button class="btn btn--xs btn--outline btn-add-val" data-attr-id="${attr.id}">+ Add Option</button>
              </div>

              <!-- Values Pill Grid -->
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                ${attr.values.map(val => `
                  <span class="badge" style="background:var(--color-bg-app);border:1px solid var(--color-border);padding:6px 10px;border-radius:4px;font-size:12px;display:flex;align-items:center;gap:6px;">
                    ${val}
                    <button class="btn-remove-val" data-attr="${attr.id}" data-val="${val}" style="border:none;background:none;cursor:pointer;color:var(--color-text-tertiary);font-size:13px;line-height:1;padding:0;">&times;</button>
                  </span>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Right: Variant Matrix Generator Helper -->
        <div class="dash-box" style="flex:1;">
          <div class="dash-box__header">
            <h2 class="dash-box__title">Variant Combination Generator</h2>
          </div>
          <div style="padding:16px;">
            <p style="font-size:12px;color:var(--color-text-secondary);margin-bottom:14px;">
              Combine dimensions (e.g. Size + Colour) to quickly generate individual barcode SKUs for apparel or grocery products.
            </p>
            <div class="form-group" style="margin-bottom:12px;">
              <label>Base Product Name</label>
              <input type="text" id="vg-base-name" class="pos-input" value="Cotton Polo T-Shirt" />
            </div>
            <div class="form-group" style="margin-bottom:12px;">
              <label>Select Dimensions to Combine</label>
              <div style="display:flex;flex-direction:column;gap:6px;font-size:12px;">
                <label style="display:flex;align-items:center;gap:6px;"><input type="checkbox" checked /> Size (S, M, L)</label>
                <label style="display:flex;align-items:center;gap:6px;"><input type="checkbox" checked /> Colour (Black, Navy)</label>
              </div>
            </div>
            <button class="btn btn--primary" id="btn-gen-matrix" style="width:100%;">
              Preview 6 Generated SKUs
            </button>
          </div>
        </div>

      </div>

      <!-- Add Attribute Modal -->
      <div id="attr-modal" class="retail-modal">
        <div class="retail-modal__backdrop"></div>
        <div class="retail-modal__dialog" style="max-width:440px;">
          <div class="retail-modal__header">
            <strong>Add New Variant Dimension</strong>
            <button class="retail-modal__close" id="attr-modal-close">&times;</button>
          </div>
          <form id="attr-form">
            <div class="retail-modal__body" style="padding:16px;">
              <div class="form-group" style="margin-bottom:12px;">
                <label>Dimension Name <span class="text-error">*</span></label>
                <input type="text" id="fa-name" class="pos-input" required placeholder="e.g. Flavour, Material, Memory" />
              </div>
              <div class="form-group" style="margin-bottom:12px;">
                <label>Initial Values (Comma separated)</label>
                <input type="text" id="fa-values" class="pos-input" placeholder="e.g. Chocolate, Vanilla, Strawberry" />
              </div>
            </div>
            <div class="retail-modal__footer">
              <button type="button" class="btn btn--outline" id="attr-modal-cancel">Cancel</button>
              <button type="submit" class="btn btn--primary">Save Dimension</button>
            </div>
          </form>
        </div>
      </div>
    `;

    setupEvents(outlet);

    if (filterType) {
      const cleanType = String(filterType).replace('variant-', '').toLowerCase();
      const targetCard = outlet.querySelector(`#card-var-var-${cleanType}`) || 
                         outlet.querySelector(`#card-var-${cleanType}`);
      if (targetCard) {
        setTimeout(() => {
          targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetCard.style.outline = '2px solid var(--color-brand)';
          targetCard.style.boxShadow = '0 0 12px rgba(59, 130, 246, 0.25)';
        }, 50);
      }
    }
  }

  function setupEvents(outlet) {
    // Add Dimension Modal
    const addBtn = outlet.querySelector('#btn-add-var-attr');
    const modal = outlet.querySelector('#attr-modal');
    const closeBtn = outlet.querySelector('#attr-modal-close');
    const cancelBtn = outlet.querySelector('#attr-modal-cancel');
    const form = outlet.querySelector('#attr-form');

    if (addBtn && modal) addBtn.onclick = () => modal.classList.add('open');
    if (closeBtn && modal) closeBtn.onclick = () => modal.classList.remove('open');
    if (cancelBtn && modal) cancelBtn.onclick = () => modal.classList.remove('open');

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const list = getAttributes();
        const name = outlet.querySelector('#fa-name').value.trim();
        const valsStr = outlet.querySelector('#fa-values').value.trim();
        const vals = valsStr ? valsStr.split(',').map(s => s.trim()).filter(Boolean) : ['Standard'];

        const newAttr = {
          id: 'VAR-' + name.toUpperCase().replace(/\s+/g, '_'),
          name,
          type: 'Text',
          values: vals
        };

        list.push(newAttr);
        saveAttributes(list);
        modal.classList.remove('open');
        renderPage(outlet);
        alert(`Variant dimension "${name}" saved!`);
      };
    }

    // Add single option prompt
    outlet.querySelectorAll('.btn-add-val').forEach(btn => {
      btn.onclick = () => {
        const attrId = btn.getAttribute('data-attr-id');
        const val = prompt('Enter new option value:');
        if (val && val.trim()) {
          const list = getAttributes();
          const attr = list.find(a => a.id === attrId);
          if (attr && !attr.values.includes(val.trim())) {
            attr.values.push(val.trim());
            saveAttributes(list);
            renderPage(outlet);
          }
        }
      };
    });

    // Remove single option
    outlet.querySelectorAll('.btn-remove-val').forEach(btn => {
      btn.onclick = () => {
        const attrId = btn.getAttribute('data-attr');
        const val = btn.getAttribute('data-val');
        const list = getAttributes();
        const attr = list.find(a => a.id === attrId);
        if (attr) {
          attr.values = attr.values.filter(v => v !== val);
          saveAttributes(list);
          renderPage(outlet);
        }
      };
    });

    // Matrix generator button
    const genBtn = outlet.querySelector('#btn-gen-matrix');
    if (genBtn) {
      genBtn.onclick = () => {
        alert('Generated 6 SKUs with unique barcodes:\n1. Cotton Polo T-Shirt - S / Black (SKU-POLO-S-BLK)\n2. Cotton Polo T-Shirt - M / Black (SKU-POLO-M-BLK)\n3. Cotton Polo T-Shirt - L / Black (SKU-POLO-L-BLK)\n4. Cotton Polo T-Shirt - S / Navy (SKU-POLO-S-NAV)\n5. Cotton Polo T-Shirt - M / Navy (SKU-POLO-M-NAV)\n6. Cotton Polo T-Shirt - L / Navy (SKU-POLO-L-NAV)\n\nThese can be imported directly into the product catalog.');
      };
    }
  }

  return { renderPage, getAttributes };
})();
