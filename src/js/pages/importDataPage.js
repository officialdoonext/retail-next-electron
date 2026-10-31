/**
 * RetailNext — Import Data Center Page
 * Submenu: File -> Import Data -> Import Products, Import Customers, Import Suppliers, Import Opening Stock
 */

'use strict';

window.ImportDataPage = (() => {

  const TEMPLATES = {
    products: {
      title: 'Products Master',
      filename: 'retailnext-products-template.csv',
      headers: 'ProductName,ProductCode,Barcode,SKU,Category,PurchasePrice,SellingPrice,MRP,GSTRate,OpeningStock,UOM',
      sampleRow: 'Fortune Sunflower Oil 1L,OIL-FS-1L,8901030012011,FS-1001,Grocery & Staples,118.00,140.00,155.00,5,50,Litre'
    },
    customers: {
      title: 'Customer Master',
      filename: 'retailnext-customers-template.csv',
      headers: 'CustomerName,MobileNumber,CustomerGroup,City,CreditLimit',
      sampleRow: 'Ramesh Chandra,9876543210,Retail Regular,Hyderabad,10000'
    },
    suppliers: {
      title: 'Supplier Master',
      filename: 'retailnext-suppliers-template.csv',
      headers: 'SupplierName,MobileNumber,GSTIN,City,PaymentTerms',
      sampleRow: 'Metro Wholesale Traders Pvt Ltd,9876500001,36AABCS1429B1Z2,Hyderabad,15 Days Credit'
    },
    stock: {
      title: 'Opening Stock',
      filename: 'retailnext-opening-stock-template.csv',
      headers: 'Barcode,ProductCode,OpeningStockQty,BatchNo,ExpiryDate',
      sampleRow: '8901030012011,OIL-FS-1L,100,BAT-2026-A1,2027-04-15'
    }
  };

  function renderPage(outlet, subTab = 'products') {
    if (!outlet) return;
    outlet.innerHTML = '';
    outlet.className = 'page-container import-data-page';

    let currentModule = subTab; // 'products' | 'customers' | 'suppliers' | 'stock'

    outlet.innerHTML = `
      <div class="module-header">
        <div>
          <span class="module-header__parent">File / Import Data</span>
          <h1 class="module-header__title">Bulk Data Import Center</h1>
        </div>
        <div class="module-header__actions">
          <div class="pill-group">
            <button class="pill-btn ${currentModule === 'products' ? 'active' : ''}" id="imp-tab-products">Import Products</button>
            <button class="pill-btn ${currentModule === 'customers' ? 'active' : ''}" id="imp-tab-customers">Import Customers</button>
            <button class="pill-btn ${currentModule === 'suppliers' ? 'active' : ''}" id="imp-tab-suppliers">Import Suppliers</button>
            <button class="pill-btn ${currentModule === 'stock' ? 'active' : ''}" id="imp-tab-stock">Import Opening Stock</button>
          </div>
        </div>
      </div>

      <div id="import-body-outlet"></div>
    `;

    const bodyOutlet = outlet.querySelector('#import-body-outlet');
    const tabProds = outlet.querySelector('#imp-tab-products');
    const tabCusts = outlet.querySelector('#imp-tab-customers');
    const tabSupps = outlet.querySelector('#imp-tab-suppliers');
    const tabStock = outlet.querySelector('#imp-tab-stock');

    function switchModule(m) {
      currentModule = m;
      [tabProds, tabCusts, tabSupps, tabStock].forEach(b => b.classList.remove('active'));
      if (m === 'products') tabProds.classList.add('active');
      if (m === 'customers') tabCusts.classList.add('active');
      if (m === 'suppliers') tabSupps.classList.add('active');
      if (m === 'stock') tabStock.classList.add('active');

      renderModuleView(bodyOutlet, currentModule);
    }

    tabProds.onclick = () => switchModule('products');
    tabCusts.onclick = () => switchModule('customers');
    tabSupps.onclick = () => switchModule('suppliers');
    tabStock.onclick = () => switchModule('stock');

    switchModule(currentModule);
  }

  function renderModuleView(container, modKey) {
    const tmpl = TEMPLATES[modKey] || TEMPLATES.products;
    let parsedRows = [];

    container.innerHTML = `
      <div class="dash-columns">

        <!-- Left: Upload and Options Form -->
        <div class="dash-box" style="flex:1;">
          <div class="dash-box__header">
            <h2 class="dash-box__title">Import ${tmpl.title}</h2>
          </div>

          <div style="padding:16px;">
            <!-- Step 1: Download Template -->
            <div style="margin-bottom:20px;padding:12px;background:var(--color-bg-app);border-radius:6px;border:1px solid var(--color-border);">
              <div style="font-weight:600;font-size:13px;margin-bottom:4px;">Step 1: Download Sample Template</div>
              <div style="font-size:12px;color:var(--color-text-secondary);margin-bottom:10px;">
                Download the standardized CSV file with all required headers.
              </div>
              <button class="btn btn--xs btn--outline" id="btn-download-tmpl">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download ${tmpl.filename}
              </button>
            </div>

            <!-- Step 2: File Upload Dropzone -->
            <div style="margin-bottom:20px;">
              <div style="font-weight:600;font-size:13px;margin-bottom:6px;">Step 2: Choose CSV File to Import</div>
              <input type="file" id="csv-file-input" class="pos-input" accept=".csv" />
            </div>

            <!-- Step 3: Conflict Options -->
            <div style="margin-bottom:20px;">
              <div style="font-weight:600;font-size:13px;margin-bottom:6px;">Step 3: Duplicate Handling</div>
              <div style="display:flex;flex-direction:column;gap:8px;font-size:12px;">
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                  <input type="radio" name="dup-rule" value="update" checked />
                  <span>Update existing records (Match by Barcode / Code)</span>
                </label>
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                  <input type="radio" name="dup-rule" value="skip" />
                  <span>Skip existing records</span>
                </label>
              </div>
            </div>

            <button class="btn btn--primary btn--lg" id="btn-run-import" style="width:100%;" disabled>
              Upload & Process Records
            </button>
          </div>
        </div>

        <!-- Right: Live CSV Preview Table -->
        <div class="dash-box" style="flex:2;">
          <div class="dash-box__header">
            <h2 class="dash-box__title">Data Preview (<span id="preview-row-count">0</span> records loaded)</h2>
          </div>

          <div style="padding:16px;" id="csv-preview-container">
            <div class="table-empty">
              <div class="table-empty__text">No CSV file chosen yet</div>
              <div class="table-empty__sub">Select a .csv file on the left to preview parsed rows before importing.</div>
            </div>
          </div>
        </div>

      </div>
    `;

    // 1. Download Template Button
    container.querySelector('#btn-download-tmpl').onclick = () => {
      const csvData = `${tmpl.headers}\n${tmpl.sampleRow}\n`;
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = tmpl.filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    };

    // 2. CSV File Picker & Parser
    const fileInput = container.querySelector('#csv-file-input');
    const runBtn = container.querySelector('#btn-run-import');
    const previewContainer = container.querySelector('#csv-preview-container');
    const countSpan = container.querySelector('#preview-row-count');

    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target.result;
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length <= 1) {
          alert('Uploaded CSV file appears to be empty or contains only headers.');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        parsedRows = [];

        for (let i = 1; i < lines.length; i++) {
          const vals = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          if (vals.length >= headers.length) {
            const rowObj = {};
            headers.forEach((h, idx) => {
              rowObj[h] = vals[idx];
            });
            parsedRows.push(rowObj);
          }
        }

        countSpan.textContent = parsedRows.length;
        runBtn.disabled = parsedRows.length === 0;

        // Render Preview Table
        previewContainer.innerHTML = `
          <div class="table-container" style="max-height:420px;overflow-y:auto;">
            <table class="erp-table">
              <thead>
                <tr>
                  ${headers.map(h => `<th>${h}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${parsedRows.slice(0, 8).map(row => `
                  <tr>
                    ${headers.map(h => `<td>${row[h] || '—'}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ${parsedRows.length > 8 ? `<div style="font-size:11px;color:var(--color-text-tertiary);margin-top:8px;">Showing first 8 of ${parsedRows.length} rows.</div>` : ''}
        `;
      };
      reader.readAsText(file);
    };

    // 3. Run Import
    runBtn.onclick = async () => {
      if (parsedRows.length === 0) return;

      runBtn.disabled = true;
      runBtn.textContent = 'Importing records...';

      let count = 0;
      const store = window.RetailStore;

      for (const row of parsedRows) {
        if (modKey === 'products') {
          const p = {
            id: 'PRD-' + Date.now() + '-' + count,
            name: row.ProductName || row.name || 'Imported Item',
            code: row.ProductCode || 'CODE-' + count,
            barcode: row.Barcode || String(8901000000000 + count),
            sku: row.SKU || 'SKU-' + count,
            category: row.Category || 'General Goods',
            purchasePrice: Number(row.PurchasePrice) || 0,
            sellingPrice: Number(row.SellingPrice) || 0,
            mrp: Number(row.MRP) || Number(row.SellingPrice) || 0,
            gstRate: Number(row.GSTRate) || 5,
            currentStock: Number(row.OpeningStock) || 0,
            openingStock: Number(row.OpeningStock) || 0,
            uom: row.UOM || 'Pieces',
            status: 'Active'
          };
          if (window.SyncEngine) {
            await window.SyncEngine.saveRecord('products', p, 'INSERT');
          } else if (store) {
            store.addProduct(p);
          }
          count++;
        } else if (modKey === 'customers') {
          const c = {
            id: 'CUST-' + Date.now() + '-' + count,
            name: row.CustomerName || 'Customer ' + count,
            mobile: row.MobileNumber || '—',
            group: row.CustomerGroup || 'Retail Regular',
            city: row.City || 'Hyderabad',
            creditLimit: Number(row.CreditLimit) || 5000,
            outstanding: 0,
            loyaltyPoints: 0
          };
          if (window.SyncEngine) {
            await window.SyncEngine.saveRecord('customers', c, 'INSERT');
          } else if (store) {
            store.addCustomer(c);
          }
          count++;
        }
      }

      alert(`Successfully imported ${count} ${tmpl.title} records into RetailNext!`);
      runBtn.textContent = 'Import Finished';
      runBtn.disabled = true;
    };
  }

  return { renderPage };
})();

