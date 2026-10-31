/**
 * RetailNext — Print Setup & Receipt Customization Page
 * Submenu: File -> Print Setup -> Default Printer, Page Setup
 */

'use strict';

window.PrintSetupPage = (() => {

  const STORAGE_KEY = 'retailnext_print_setup';

  const DEFAULT_SETTINGS = {
    printerType: 'thermal_80', // 'thermal_80' | 'thermal_58' | 'a4_laser' | 'a5_sheet'
    printerName: 'EPSON TM-T82III Receipt (Default)',
    printMode: 'silent', // 'silent' | 'dialog'
    copies: 1,
    autoCut: true,
    cashDrawerPulse: true,
    showLogo: true,
    showGstin: true,
    showAddress: true,
    showPhone: true,
    showCashier: true,
    showCustomerDues: true,
    showLoyaltyPoints: true,
    showHsn: true,
    showGstBreakup: true,
    showUpiQr: true,
    showBarcode: true,
    headerFontSize: '16px',
    footerMessage: 'Thank you for shopping at RetailNext!\nGoods once sold can be exchanged in 7 days.'
  };

  function getSettings() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch (e) {
      console.warn('Failed to parse print settings:', e);
    }
    return { ...DEFAULT_SETTINGS };
  }

  function saveSettings(s) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }

  function renderPage(outlet) {
    if (!outlet) return;
    outlet.innerHTML = '';
    outlet.className = 'page-container print-setup-page';

    const s = getSettings();
    const profile = window.CompanyPage ? window.CompanyPage.getProfile() : { tradeName: 'RETAILNEXT SUPERMARKET', gstin: '36AABCS1429B1Z2', mobile: '+91 98765 43210', address1: 'Hitec City, Hyderabad' };

    outlet.innerHTML = `
      <div class="module-header">
        <div>
          <span class="module-header__parent">File / Print Setup</span>
          <h1 class="module-header__title">Printer Hardware & Invoice Format Setup</h1>
        </div>
        <div class="module-header__actions">
          <button class="btn btn--outline" id="btn-test-print" style="margin-right:8px;">Print Test Receipt</button>
          <button class="btn btn--primary" id="btn-save-print">Save Print Configuration</button>
        </div>
      </div>

      <div class="dash-columns">

        <!-- Left: Print Settings Controls -->
        <div class="dash-box" style="flex:1.5;">
          <div class="dash-box__header">
            <h2 class="dash-box__title">Hardware & Layout Configuration</h2>
          </div>

          <div style="padding:16px;">
            <!-- Printer Type -->
            <div class="form-grid-2" style="margin-bottom:14px;">
              <div class="form-group">
                <label>Printer Format Type</label>
                <select id="ps-type" class="pos-select">
                  <option value="thermal_80" ${s.printerType === 'thermal_80' ? 'selected' : ''}>Thermal Slip Printer (80mm / 3 inch)</option>
                  <option value="thermal_58" ${s.printerType === 'thermal_58' ? 'selected' : ''}>Thermal Slip Printer (58mm / 2 inch)</option>
                  <option value="a4_laser" ${s.printerType === 'a4_laser' ? 'selected' : ''}>Full Page Invoice (A4 Standard)</option>
                  <option value="a5_sheet" ${s.printerType === 'a5_sheet' ? 'selected' : ''}>Half Page Invoice (A5 Sheet)</option>
                </select>
              </div>

              <div class="form-group">
                <label>Assigned Windows Printer Driver</label>
                <select id="ps-driver" class="pos-select">
                  <option value="EPSON TM-T82III Receipt (Default)" ${s.printerName.includes('EPSON') ? 'selected' : ''}>EPSON TM-T82III Receipt (Default)</option>
                  <option value="POS-80 Series Printer">POS-80 Thermal Series</option>
                  <option value="TVS RP-3150 Star">TVS RP-3150 Star Thermal</option>
                  <option value="Microsoft Print to PDF">Microsoft Print to PDF</option>
                </select>
              </div>
            </div>

            <div class="form-grid-2" style="margin-bottom:16px;">
              <div class="form-group">
                <label>Print Execution Mode</label>
                <select id="ps-mode" class="pos-select">
                  <option value="silent" ${s.printMode === 'silent' ? 'selected' : ''}>Direct Silent Print (Fast POS checkout)</option>
                  <option value="dialog" ${s.printMode === 'dialog' ? 'selected' : ''}>Show Windows Print Dialog First</option>
                </select>
              </div>
              <div class="form-group">
                <label>Number of Copies</label>
                <input type="number" id="ps-copies" class="pos-input" value="${s.copies}" min="1" max="5" />
              </div>
            </div>

            <!-- Receipt Content Options -->
            <div class="form-fieldset" style="margin-bottom:16px;">
              <legend>Thermal Ticket Content Elements</legend>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:6px 0;">
                <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;">
                  <input type="checkbox" id="chk-logo" ${s.showLogo ? 'checked' : ''} />
                  <span>Print Store Header & Logo</span>
                </label>
                <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;">
                  <input type="checkbox" id="chk-gstin" ${s.showGstin ? 'checked' : ''} />
                  <span>Print GSTIN & Tax Scheme</span>
                </label>
                <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;">
                  <input type="checkbox" id="chk-address" ${s.showAddress ? 'checked' : ''} />
                  <span>Print Store Address & Phone</span>
                </label>
                <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;">
                  <input type="checkbox" id="chk-cashier" ${s.showCashier ? 'checked' : ''} />
                  <span>Print Cashier / Terminal Name</span>
                </label>
                <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;">
                  <input type="checkbox" id="chk-dues" ${s.showCustomerDues ? 'checked' : ''} />
                  <span>Print Customer Outstanding Balance</span>
                </label>
                <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;">
                  <input type="checkbox" id="chk-loyalty" ${s.showLoyaltyPoints ? 'checked' : ''} />
                  <span>Print Loyalty Points Earned</span>
                </label>
                <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;">
                  <input type="checkbox" id="chk-hsn" ${s.showHsn ? 'checked' : ''} />
                  <span>Print Product HSN Codes</span>
                </label>
                <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;">
                  <input type="checkbox" id="chk-gst" ${s.showGstBreakup ? 'checked' : ''} />
                  <span>Print CGST / SGST Tax Summary</span>
                </label>
                <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;">
                  <input type="checkbox" id="chk-upi" ${s.showUpiQr ? 'checked' : ''} />
                  <span>Print Scan-to-Pay UPI QR Code</span>
                </label>
                <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;">
                  <input type="checkbox" id="chk-barcode" ${s.showBarcode ? 'checked' : ''} />
                  <span>Print Invoice Barcode at Bottom</span>
                </label>
              </div>
            </div>

            <!-- Hardware Triggers -->
            <div style="display:flex;gap:20px;margin-bottom:16px;padding:10px;background:var(--color-bg-app);border-radius:6px;font-size:12px;">
              <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                <input type="checkbox" id="chk-autocut" ${s.autoCut ? 'checked' : ''} />
                <span>Auto-cut Paper (ESC/POS)</span>
              </label>
              <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                <input type="checkbox" id="chk-drawer" ${s.cashDrawerPulse ? 'checked' : ''} />
                <span>Kick Cash Drawer Open</span>
              </label>
            </div>

            <div class="form-group">
              <label>Footer Greetings / Return Policy Notes</label>
              <textarea id="ps-footer" class="pos-input" rows="3">${s.footerMessage}</textarea>
            </div>
          </div>
        </div>

        <!-- Right: Live Interactive Thermal Slip Preview -->
        <div class="dash-box" style="flex:1;">
          <div class="dash-box__header">
            <h2 class="dash-box__title">Live Receipt Simulation</h2>
          </div>

          <div style="padding:20px;display:flex;justify-content:center;background:var(--color-bg-app);min-height:500px;">
            <div id="live-thermal-preview" style="background:#fff;color:#000;width:300px;padding:16px;box-shadow:0 10px 25px rgba(0,0,0,0.15);font-family:'Courier New', Courier, monospace;font-size:11px;line-height:1.4;border-radius:2px;">
              <!-- Generated via updateLivePreview() -->
            </div>
          </div>
        </div>

      </div>
    `;

    setupEvents(outlet, profile);
    updateLivePreview(outlet, profile);
  }

  function updateLivePreview(outlet, profile) {
    const previewEl = outlet.querySelector('#live-thermal-preview');
    if (!previewEl) return;

    const showLogo = outlet.querySelector('#chk-logo')?.checked ?? true;
    const showGstin = outlet.querySelector('#chk-gstin')?.checked ?? true;
    const showAddress = outlet.querySelector('#chk-address')?.checked ?? true;
    const showCashier = outlet.querySelector('#chk-cashier')?.checked ?? true;
    const showDues = outlet.querySelector('#chk-dues')?.checked ?? true;
    const showLoyalty = outlet.querySelector('#chk-loyalty')?.checked ?? true;
    const showHsn = outlet.querySelector('#chk-hsn')?.checked ?? true;
    const showGst = outlet.querySelector('#chk-gst')?.checked ?? true;
    const showUpi = outlet.querySelector('#chk-upi')?.checked ?? true;
    const showBarcode = outlet.querySelector('#chk-barcode')?.checked ?? true;
    const footer = outlet.querySelector('#ps-footer')?.value || 'Thank you! Visit again.';

    previewEl.innerHTML = `
      <div style="text-align:center;border-bottom:1px dashed #000;padding-bottom:8px;margin-bottom:8px;">
        ${showLogo ? `<div style="font-weight:bold;font-size:14px;letter-spacing:0.5px;">${profile.tradeName || 'RETAILNEXT SUPERMARKET'}</div>` : ''}
        ${showAddress ? `<div style="font-size:10px;">${profile.address1 || 'Hitec City, Hyderabad'}</div>` : ''}
        ${showAddress ? `<div style="font-size:10px;">Phone: ${profile.mobile || '+91 98765 43210'}</div>` : ''}
        ${showGstin ? `<div style="font-size:10px;font-weight:bold;">GSTIN: ${profile.gstin || '36AABCS1429B1Z2'}</div>` : ''}
      </div>

      <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:2px;">
        <span>Bill: <strong>INV-2026-00481</strong></span>
        <span>Date: 31/10/26</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:6px;">
        ${showCashier ? '<span>Cashier: Ramesh (POS-01)</span>' : '<span></span>'}
        <span>Time: 18:45</span>
      </div>

      <div style="border-bottom:1px dashed #000;margin-bottom:6px;"></div>

      <table style="width:100%;font-size:10px;border-collapse:collapse;margin-bottom:6px;">
        <thead>
          <tr style="border-bottom:1px solid #000;">
            <th style="text-align:left;">Item</th>
            ${showHsn ? '<th style="text-align:center;">HSN</th>' : ''}
            <th style="text-align:center;">Qty</th>
            <th style="text-align:right;">Rate</th>
            <th style="text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Fortune Oil 1L</td>
            ${showHsn ? '<td style="text-align:center;">1512</td>' : ''}
            <td style="text-align:center;">2</td>
            <td style="text-align:right;">140</td>
            <td style="text-align:right;">280.00</td>
          </tr>
          <tr>
            <td>Basmati Rice 5kg</td>
            ${showHsn ? '<td style="text-align:center;">1006</td>' : ''}
            <td style="text-align:center;">1</td>
            <td style="text-align:right;">445</td>
            <td style="text-align:right;">445.00</td>
          </tr>
          <tr>
            <td>Tata Salt 1kg</td>
            ${showHsn ? '<td style="text-align:center;">2501</td>' : ''}
            <td style="text-align:center;">1</td>
            <td style="text-align:right;">26</td>
            <td style="text-align:right;">26.00</td>
          </tr>
        </tbody>
      </table>

      <div style="border-top:1px dashed #000;padding-top:6px;font-size:11px;">
        <div style="display:flex;justify-content:space-between;">
          <span>Subtotal:</span>
          <span>₹751.00</span>
        </div>
        ${showGst ? `
          <div style="display:flex;justify-content:space-between;font-size:10px;color:#333;">
            <span>CGST (2.5%) + SGST (2.5%):</span>
            <span>₹37.55</span>
          </div>
        ` : ''}
        <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:13px;border-top:1px solid #000;border-bottom:1px solid #000;padding:4px 0;margin:4px 0;">
          <span>GRAND TOTAL:</span>
          <span>₹751.00</span>
        </div>
      </div>

      <div style="font-size:10px;margin-top:4px;">
        <div>Mode of Payment: <strong>CASH (₹1000.00)</strong></div>
        <div>Change Returned: <strong>₹249.00</strong></div>
        ${showLoyalty ? '<div>Loyalty Points Earned: <strong>+15 Pts</strong> (Total: 140)</div>' : ''}
        ${showDues ? '<div style="color:#d97706;">Customer Outstanding: <strong>₹0.00</strong></div>' : ''}
      </div>

      ${showUpi ? `
        <div style="text-align:center;margin:10px 0 6px;">
          <div style="width:72px;height:72px;border:2px solid #000;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:bold;">
            [UPI QR]
          </div>
          <div style="font-size:9px;margin-top:2px;">Scan & Pay via UPI</div>
        </div>
      ` : ''}

      ${showBarcode ? `
        <div style="text-align:center;margin:8px 0 4px;">
          <div style="font-family:'Libre Barcode 39', monospace;font-size:24px;letter-spacing:2px;">*INV-2026-00481*</div>
          <div style="font-size:9px;">INV-2026-00481</div>
        </div>
      ` : ''}

      <div style="text-align:center;margin-top:8px;font-size:9px;border-top:1px dashed #000;padding-top:6px;white-space:pre-line;">
        ${footer}
      </div>
    `;
  }

  function setupEvents(outlet, profile) {
    // Dynamic preview update on any input change
    outlet.querySelectorAll('input, select, textarea').forEach(el => {
      el.addEventListener('input', () => updateLivePreview(outlet, profile));
      el.addEventListener('change', () => updateLivePreview(outlet, profile));
    });

    // Save button
    outlet.querySelector('#btn-save-print').onclick = () => {
      const settings = {
        printerType: outlet.querySelector('#ps-type').value,
        printerName: outlet.querySelector('#ps-driver').value,
        printMode: outlet.querySelector('#ps-mode').value,
        copies: Number(outlet.querySelector('#ps-copies').value) || 1,
        autoCut: outlet.querySelector('#chk-autocut').checked,
        cashDrawerPulse: outlet.querySelector('#chk-drawer').checked,
        showLogo: outlet.querySelector('#chk-logo').checked,
        showGstin: outlet.querySelector('#chk-gstin').checked,
        showAddress: outlet.querySelector('#chk-address').checked,
        showCashier: outlet.querySelector('#chk-cashier').checked,
        showCustomerDues: outlet.querySelector('#chk-dues').checked,
        showLoyaltyPoints: outlet.querySelector('#chk-loyalty').checked,
        showHsn: outlet.querySelector('#chk-hsn').checked,
        showGstBreakup: outlet.querySelector('#chk-gst').checked,
        showUpiQr: outlet.querySelector('#chk-upi').checked,
        showBarcode: outlet.querySelector('#chk-barcode').checked,
        footerMessage: outlet.querySelector('#ps-footer').value
      };

      saveSettings(settings);
      alert('Printer configuration and receipt layout preferences saved successfully!');
    };

    // Test print
    outlet.querySelector('#btn-test-print').onclick = () => {
      alert('Test print signal sent to printer driver: ' + outlet.querySelector('#ps-driver').value);
    };
  }

  return {
    renderPage,
    getSettings,
    saveSettings
  };
})();

