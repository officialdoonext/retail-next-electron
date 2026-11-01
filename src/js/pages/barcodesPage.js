/**
 * RetailNext — Barcodes Master Page
 * Submenu: Masters -> Barcodes -> Generate Barcode, Assign Barcode, Multiple Barcodes
 */

'use strict';

window.BarcodesPage = (() => {

  function renderPage(outlet) {
    if (!outlet) return;
    outlet.innerHTML = '';
    outlet.className = 'page-container barcodes-page';

    const store = window.RetailStore;
    const products = store ? store.getProducts() : [];

    outlet.innerHTML = `
      <div class="module-header">
        <div>
          <span class="module-header__parent">Masters / Inventory</span>
          <h1 class="module-header__title">Barcode Generation, Assignment & Label Printing</h1>
        </div>
        <div class="module-header__actions">
          <button class="btn btn--primary" id="btn-print-labels">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;">
              <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Print Barcode Stickers (F12)
          </button>
        </div>
      </div>

      <div class="dash-columns">

        <!-- Left: Barcode Generator & Assignment Form -->
        <div class="dash-box" style="flex:1.2;">
          <div class="dash-box__header">
            <h2 class="dash-box__title">Barcode Generator & Assign to Item</h2>
          </div>

          <div style="padding:16px;">
            <div class="form-group" style="margin-bottom:14px;">
              <label>Select Product from Catalog</label>
              <select id="bc-sel-product" class="pos-select">
                ${products.map(p => `
                  <option value="${p.id}" data-barcode="${p.barcode}" data-name="${p.name}" data-price="${p.sellingPrice}" data-mrp="${p.mrp}">
                    ${p.name} [Barcode: ${p.barcode}]
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="form-grid-2" style="margin-bottom:14px;">
              <div class="form-group">
                <label>Barcode Standard</label>
                <select id="bc-symbology" class="pos-select">
                  <option value="EAN-13">EAN-13 (Retail Standard - 890 Prefix)</option>
                  <option value="CODE-128">Code 128 (Alpha-numeric)</option>
                  <option value="UPC-A">UPC-A (12 Digit)</option>
                  <option value="QR">2D QR Code</option>
                </select>
              </div>
              <div class="form-group">
                <label>Generated Barcode Value</label>
                <div style="display:flex;gap:6px;">
                  <input type="text" id="bc-val-input" class="pos-input font-mono font-bold" value="${products[0] ? products[0].barcode : '8901030012011'}" />
                  <button class="btn btn--outline" id="bc-btn-generate" title="Generate New Barcode">Generate</button>
                </div>
              </div>
            </div>

            <!-- Multiple Barcodes Support -->
            <div class="form-group" style="margin-bottom:16px;">
              <label>Secondary / Alternative Barcodes (e.g. Outer Box / Multi-pack)</label>
              <input type="text" id="bc-alt-barcodes" class="pos-input font-mono" placeholder="Comma separated, e.g. 8901030012999, 18901030012018" />
              <div style="font-size:11px;color:var(--color-text-tertiary);margin-top:2px;">POS cashier scanning any of these barcodes will automatically pick this product.</div>
            </div>

            <!-- Sticker Dimensions -->
            <div class="form-grid-2" style="margin-bottom:16px;">
              <div class="form-group">
                <label>Sticker Paper Layout</label>
                <select id="bc-sticker-layout" class="pos-select">
                  <option value="50x25_2">50mm x 25mm (2 Across - 1 Roll)</option>
                  <option value="38x25_3">38mm x 25mm (3 Across Roll)</option>
                  <option value="a4_24">A4 Sheet (24 Labels per page)</option>
                  <option value="shelf">Shelf Edge Tag (Price & Barcode)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Number of Stickers to Print</label>
                <input type="number" id="bc-print-qty" class="pos-input" value="20" min="1" max="1000" />
              </div>
            </div>

            <button class="btn btn--primary" id="btn-save-barcode" style="width:100%;">
              Assign Barcode to Product Record
            </button>
          </div>
        </div>

        <!-- Right: Real-time Barcode Sticker Preview -->
        <div class="dash-box" style="flex:1;">
          <div class="dash-box__header">
            <h2 class="dash-box__title">Live Barcode Sticker Preview</h2>
          </div>

          <div style="padding:24px;background:var(--color-bg-app);min-height:360px;display:flex;align-items:center;justify-content:center;">
            <!-- Sticker Label -->
            <div id="barcode-sticker" style="width:260px;background:#fff;border:1px dashed #94a3b8;border-radius:4px;padding:12px;text-align:center;color:#000;box-shadow:0 6px 18px rgba(0,0,0,0.06);font-family:sans-serif;">
              <div style="font-weight:700;font-size:11px;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:2px;" id="stk-company">RETAILNEXT SUPERMARKET</div>
              <div style="font-size:12px;font-weight:600;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" id="stk-prod-name">
                ${products[0] ? products[0].name : 'Sample Item'}
              </div>

              <!-- Barcode graphic simulation -->
              <div style="background:#fff;padding:8px 0;">
                <div style="font-family:'Courier New', monospace;font-size:32px;letter-spacing:3px;font-weight:bold;line-height:0.8;" id="stk-barcode-bars">
                  ||| | |||| | ||| | ||
                </div>
                <div class="font-mono" style="font-size:11px;margin-top:4px;font-weight:600;" id="stk-barcode-text">
                  ${products[0] ? products[0].barcode : '8901030012011'}
                </div>
              </div>

              <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #000;padding-top:4px;margin-top:4px;">
                <span style="font-size:10px;text-decoration:line-through;color:#64748b;" id="stk-mrp">MRP: ₹155.00</span>
                <span style="font-size:13px;font-weight:bold;color:#000;" id="stk-price">OUR PRICE: ₹140.00</span>
              </div>
              <div style="font-size:9px;color:#64748b;margin-top:2px;">(Incl. of all taxes)</div>
            </div>
          </div>
        </div>

      </div>
    `;

    setupEvents(outlet, products);
  }

  function setupEvents(outlet, products) {
    const prodSelect = outlet.querySelector('#bc-sel-product');
    const valInput = outlet.querySelector('#bc-val-input');
    const genBtn = outlet.querySelector('#bc-btn-generate');
    const saveBtn = outlet.querySelector('#btn-save-barcode');
    const printBtn = outlet.querySelector('#btn-print-labels');

    const stkName = outlet.querySelector('#stk-prod-name');
    const stkBarcodeText = outlet.querySelector('#stk-barcode-text');
    const stkMrp = outlet.querySelector('#stk-mrp');
    const stkPrice = outlet.querySelector('#stk-price');

    function updateSticker() {
      const opt = prodSelect.options[prodSelect.selectedIndex];
      if (opt) {
        stkName.textContent = opt.getAttribute('data-name');
        stkMrp.textContent = 'MRP: ₹' + Number(opt.getAttribute('data-mrp')).toFixed(2);
        stkPrice.textContent = 'OUR PRICE: ₹' + Number(opt.getAttribute('data-price')).toFixed(2);
      }
      stkBarcodeText.textContent = valInput.value;
    }

    if (prodSelect) {
      prodSelect.onchange = () => {
        const opt = prodSelect.options[prodSelect.selectedIndex];
        if (opt) {
          valInput.value = opt.getAttribute('data-barcode');
          updateSticker();
        }
      };
    }

    if (valInput) {
      valInput.oninput = updateSticker;
    }

    if (genBtn) {
      genBtn.onclick = () => {
        valInput.value = '890' + Math.floor(1000000000 + Math.random() * 9000000000);
        updateSticker();
      };
    }

    if (saveBtn) {
      saveBtn.onclick = () => {
        const pId = prodSelect.value;
        const newBc = valInput.value.trim();
        const store = window.RetailStore;
        if (store) {
          const prod = store.getProducts().find(p => p.id === pId);
          if (prod) {
            prod.barcode = newBc;
            store.updateProduct(pId, prod);
          }
        }
        alert(`Barcode ${newBc} assigned successfully to product!`);
      };
    }

    if (printBtn) {
      printBtn.onclick = () => {
        const qty = outlet.querySelector('#bc-print-qty').value;
        alert(`Printing ${qty} barcode labels to thermal label printer...`);
      };
    }
  }

  return { renderPage };
})();

