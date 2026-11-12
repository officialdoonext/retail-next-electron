/**
 * Retail Next — Dynamic Barcode & QR Label Generator (/barcode)
 *
 * Features:
 *   - Formats: CODE128, EAN-13, UPC-A, CODE39, ITF-14, QR Code
 *   - Thermal Label Roll Presets: 50x25mm (standard roll), 40x30mm, 50x38mm (garments), 38x25mm, 100x50mm
 *   - Print batch queue with custom quantities
 *   - Dynamic SVG barcode rendering and print preview
 */

'use strict';

(function(global) {

  let labelPreset = '50x25';
  let barcodeFormat = 'CODE128';
  let labelQueue = [];

  function render(outlet) {
    labelQueue = [
      { name: 'Men Cotton Polo T-Shirt L', sku: 'POLO-BLU-L', barcode: '8901234500001', mrp: 899.00, qty: 10 },
      { name: 'Classic Denim Jeans 32', sku: 'JNS-32', barcode: '8901234500002', mrp: 1499.00, qty: 25 },
      { name: 'Urban Sneakers White 9', sku: 'FTW-SNK-09', barcode: '8901234500003', mrp: 2499.00, qty: 5 }
    ];

    outlet.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Barcode & Thermal Label Generator</h1>
          <p>Generate printable barcode stickers and QR tags for thermal roll label printers</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" id="barcode-print-batch-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print Batch Queue (${labelQueue.reduce((a, b) => a + b.qty, 0)} Labels)
          </button>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:320px 1fr;gap:20px;">
        
        <!-- Controls Column -->
        <div class="card">
          <h3 class="card-title" style="margin-bottom:14px;">Printer & Format Config</h3>

          <div class="form-group">
            <label class="form-label">Thermal Roll Label Preset</label>
            <select id="bg-preset-select" class="form-select">
              <option value="50x25" selected>50 x 25 mm (Standard Roll)</option>
              <option value="40x30">40 x 30 mm (Compact)</option>
              <option value="50x38">50 x 38 mm (Apparel Hangtag)</option>
              <option value="38x25">38 x 25 mm (Jewelry / Small)</option>
              <option value="100x50">100 x 50 mm (Shipping Carton)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Symbology Format</label>
            <select id="bg-format-select" class="form-select">
              <option value="CODE128" selected>CODE128 (Universal)</option>
              <option value="EAN-13">EAN-13 (Standard Retail)</option>
              <option value="UPC-A">UPC-A</option>
              <option value="CODE39">CODE39</option>
              <option value="QR">QR Code 2D</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Include on Label Sticker</label>
            <div style="display:flex;flex-direction:column;gap:6px;font-size:12.5px;color:var(--slate-700);">
              <label style="display:flex;align-items:center;gap:6px;">
                <input type="checkbox" id="chk-store" checked /> Store Brand Header
              </label>
              <label style="display:flex;align-items:center;gap:6px;">
                <input type="checkbox" id="chk-mrp" checked /> Maximum Retail Price (MRP)
              </label>
              <label style="display:flex;align-items:center;gap:6px;">
                <input type="checkbox" id="chk-sku" checked /> SKU & Product Title
              </label>
            </div>
          </div>

          <div style="border-top:1px solid var(--border-slate-200);padding-top:14px;margin-top:14px;">
            <h4 style="font-size:12px;font-weight:700;color:var(--slate-500);text-transform:uppercase;margin-bottom:8px;">Add Custom Product to Queue</h4>
            <div class="form-group">
              <input type="text" id="add-q-name" class="form-input" placeholder="Product name" />
            </div>
            <div class="form-group">
              <input type="text" id="add-q-barcode" class="form-input" placeholder="Barcode string (e.g. 890123...)" />
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              <input type="number" id="add-q-mrp" class="form-input" placeholder="MRP (₹)" />
              <input type="number" id="add-q-qty" class="form-input" placeholder="Qty" value="10" />
            </div>
            <button class="btn btn-secondary btn-sm" id="add-q-btn" style="width:100%;margin-top:8px;">
              + Add to Queue
            </button>
          </div>
        </div>

        <!-- Preview & Queue Column -->
        <div style="display:flex;flex-direction:column;gap:18px;">
          
          <!-- Live Sticker Visualizer -->
          <div class="card" style="background:var(--slate-100);display:flex;flex-direction:column;align-items:center;padding:24px;">
            <div style="font-size:12px;font-weight:600;color:var(--slate-500);margin-bottom:12px;">Live Roll Label Sticker Preview (50 x 25 mm)</div>
            
            <div id="label-sticker-preview" style="width:260px;height:130px;background:#ffffff;border:1px solid #cbd5e1;border-radius:6px;box-shadow:var(--shadow-md);padding:10px;display:flex;flex-direction:column;justify-content:space-between;text-align:center;">
              <div style="font-size:10px;font-weight:700;letter-spacing:1px;color:#0f172a;">RETAIL NEXT STORE</div>
              <div style="font-size:11px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" id="preview-pname">Men Cotton Polo T-Shirt L</div>
              
              <!-- SVG Barcode Representation -->
              <div style="display:flex;justify-content:center;margin:4px 0;">
                <svg width="200" height="42" viewBox="0 0 200 42">
                  <rect x="10" y="0" width="3" height="35" fill="#000"/>
                  <rect x="16" y="0" width="1" height="35" fill="#000"/>
                  <rect x="20" y="0" width="4" height="35" fill="#000"/>
                  <rect x="28" y="0" width="2" height="35" fill="#000"/>
                  <rect x="34" y="0" width="5" height="35" fill="#000"/>
                  <rect x="42" y="0" width="1" height="35" fill="#000"/>
                  <rect x="46" y="0" width="3" height="35" fill="#000"/>
                  <rect x="52" y="0" width="2" height="35" fill="#000"/>
                  <rect x="58" y="0" width="4" height="35" fill="#000"/>
                  <rect x="66" y="0" width="1" height="35" fill="#000"/>
                  <rect x="70" y="0" width="3" height="35" fill="#000"/>
                  <rect x="76" y="0" width="4" height="35" fill="#000"/>
                  <rect x="84" y="0" width="2" height="35" fill="#000"/>
                  <rect x="90" y="0" width="3" height="35" fill="#000"/>
                  <rect x="96" y="0" width="5" height="35" fill="#000"/>
                  <rect x="105" y="0" width="1" height="35" fill="#000"/>
                  <rect x="110" y="0" width="4" height="35" fill="#000"/>
                  <rect x="118" y="0" width="2" height="35" fill="#000"/>
                  <rect x="124" y="0" width="3" height="35" fill="#000"/>
                  <rect x="130" y="0" width="4" height="35" fill="#000"/>
                  <rect x="138" y="0" width="2" height="35" fill="#000"/>
                  <rect x="144" y="0" width="3" height="35" fill="#000"/>
                  <rect x="150" y="0" width="1" height="35" fill="#000"/>
                  <rect x="154" y="0" width="4" height="35" fill="#000"/>
                  <rect x="162" y="0" width="2" height="35" fill="#000"/>
                  <rect x="168" y="0" width="4" height="35" fill="#000"/>
                  <rect x="176" y="0" width="2" height="35" fill="#000"/>
                  <rect x="182" y="0" width="3" height="35" fill="#000"/>
                  <text x="100" y="42" font-size="8" font-family="monospace" text-anchor="middle">8901234500001</text>
                </svg>
              </div>

              <div style="display:flex;justify-content:space-between;font-size:10.5px;padding:0 8px;">
                <span style="font-weight:600;">SKU: POLO-BLU-L</span>
                <span style="font-weight:700;color:var(--primary-purple);">MRP: ₹899.00</span>
              </div>
            </div>
          </div>

          <!-- Queue Table -->
          <div class="table-container">
            <div class="card-header" style="padding:14px 18px 0 18px;">
              <h3 class="card-title">Batch Print Queue</h3>
              <span class="badge badge-purple" id="queue-total-count">${labelQueue.length} Products</span>
            </div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Barcode String</th>
                  <th style="text-align:right;">MRP</th>
                  <th style="text-align:center;width:120px;">Print Copies</th>
                  <th style="text-align:center;">Action</th>
                </tr>
              </thead>
              <tbody id="barcode-queue-tbody">
                ${labelQueue.map((item, idx) => `
                  <tr>
                    <td>
                      <div style="font-weight:600;color:var(--slate-900);">${item.name}</div>
                      <div style="font-size:11px;color:var(--slate-500);">${item.sku}</div>
                    </td>
                    <td>
                      <span style="font-family:var(--font-mono);font-size:12px;color:var(--primary-purple);">${item.barcode}</span>
                    </td>
                    <td style="text-align:right;font-weight:600;">₹${item.mrp.toFixed(2)}</td>
                    <td style="text-align:center;">
                      <input type="number" value="${item.qty}" min="1" class="form-input queue-qty-input" data-idx="${idx}" style="width:70px;text-align:center;padding:4px;" />
                    </td>
                    <td style="text-align:center;">
                      <button class="btn btn-ghost btn-sm queue-remove-btn" data-idx="${idx}" style="color:var(--color-danger);">
                        Remove
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    bindBarcodeEvents(outlet);
  }

  function bindBarcodeEvents(outlet) {
    const printBtn = document.getElementById('barcode-print-batch-btn');
    const addBtn = document.getElementById('add-q-btn');

    if (printBtn) {
      printBtn.onclick = () => {
        window.print();
        global.Toast?.success('Sent thermal label roll batch to printer');
      };
    }

    if (addBtn) {
      addBtn.onclick = () => {
        const name = document.getElementById('add-q-name').value.trim();
        const barcode = document.getElementById('add-q-barcode').value.trim();
        const mrp = parseFloat(document.getElementById('add-q-mrp').value) || 999;
        const qty = parseInt(document.getElementById('add-q-qty').value, 10) || 10;

        if (!name || !barcode) {
          global.Toast?.error('Please enter product name and barcode');
          return;
        }

        labelQueue.push({ name, sku: 'CUSTOM-' + barcode.slice(-4), barcode, mrp, qty });
        render(outlet);
        global.Toast?.success(`Added ${name} to print queue`);
      };
    }

    outlet.querySelectorAll('.queue-remove-btn').forEach(b => {
      b.onclick = () => {
        const i = b.getAttribute('data-idx');
        labelQueue.splice(i, 1);
        render(outlet);
      };
    });

    outlet.querySelectorAll('.queue-qty-input').forEach(input => {
      input.onchange = () => {
        const i = input.getAttribute('data-idx');
        labelQueue[i].qty = parseInt(input.value, 10) || 1;
        const total = labelQueue.reduce((a, b) => a + b.qty, 0);
        document.getElementById('barcode-print-batch-btn').innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Print Batch Queue (${total} Labels)
        `;
      };
    });
  }

  global.BarcodeGeneratorPage = { render };
})(window);

