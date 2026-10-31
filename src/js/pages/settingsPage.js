/**
 * RetailNext — Settings Page
 * Controls application settings, company profile, GST tax rules, POS billing, printers & backups.
 */

'use strict';

window.SettingsPage = (() => {

  let activeSection = 'company';

  function renderPage(outlet) {
    if (!outlet) return;
    outlet.innerHTML = '';
    outlet.className = 'page-container settings-page';

    outlet.innerHTML = `
      <div class="module-header">
        <div>
          <span class="module-header__parent">Configuration</span>
          <h1 class="module-header__title">Application & Hardware Settings</h1>
        </div>
        <div class="module-header__actions">
          <button class="btn btn--primary" id="set-btn-save">Save Configuration</button>
        </div>
      </div>

      <div class="settings-layout">
        <!-- Settings Nav Sidebar -->
        <div class="settings-nav">
          <div class="settings-nav-item ${activeSection === 'company' ? 'active' : ''}" data-sec="company">
            <span>Company Profile</span>
          </div>
          <div class="settings-nav-item ${activeSection === 'billing' ? 'active' : ''}" data-sec="billing">
            <span>Billing & POS Rules</span>
          </div>
          <div class="settings-nav-item ${activeSection === 'tax' ? 'active' : ''}" data-sec="tax">
            <span>Tax & GSTIN Setup</span>
          </div>
          <div class="settings-nav-item ${activeSection === 'printers' ? 'active' : ''}" data-sec="printers">
            <span>Thermal & A4 Printers</span>
          </div>
          <div class="settings-nav-item ${activeSection === 'barcode' ? 'active' : ''}" data-sec="barcode">
            <span>Barcode & Scanner</span>
          </div>
          <div class="settings-nav-item ${activeSection === 'backup' ? 'active' : ''}" data-sec="backup">
            <span>Database Backup & Sync</span>
          </div>
        </div>

        <!-- Settings Content Card -->
        <div class="settings-content card p-6" id="settings-body">
          ${renderSectionContent(activeSection)}
        </div>
      </div>
    `;

    outlet.querySelectorAll('.settings-nav-item').forEach(el => {
      el.addEventListener('click', () => {
        outlet.querySelectorAll('.settings-nav-item').forEach(i => i.classList.remove('active'));
        el.classList.add('active');
        activeSection = el.getAttribute('data-sec');
        const body = outlet.querySelector('#settings-body');
        if (body) {
          body.innerHTML = renderSectionContent(activeSection);
          attachSectionEvents(outlet);
        }
      });
    });

    attachSectionEvents(outlet);

    const saveBtn = outlet.querySelector('#set-btn-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        alert('Settings and hardware preferences saved successfully!');
      });
    }
  }

  function renderSectionContent(section) {
    if (section === 'company') {
      return `
        <h2 style="font-size:16px;margin-bottom:16px;">Company Profile & Store Branding</h2>
        <div class="form-grid-2">
          <div class="form-group">
            <label>Legal Business Name</label>
            <input type="text" class="pos-input" value="RetailNext Supermarket Pvt Ltd" />
          </div>
          <div class="form-group">
            <label>Trade / Store Name</label>
            <input type="text" class="pos-input" value="RetailNext — Main Store" />
          </div>
        </div>
        <div class="form-group" style="margin-top:12px;">
          <label>Store Address</label>
          <input type="text" class="pos-input" value="Plot 42, Commercial Avenue, Hitec City, Hyderabad - 500081" />
        </div>
        <div class="form-grid-3" style="margin-top:12px;">
          <div class="form-group">
            <label>Contact Phone</label>
            <input type="text" class="pos-input" value="+91 98765 43210" />
          </div>
          <div class="form-group">
            <label>Store Email</label>
            <input type="email" class="pos-input" value="store.main@retailnext.in" />
          </div>
          <div class="form-group">
            <label>Website</label>
            <input type="text" class="pos-input" value="https://retailnext.in" />
          </div>
        </div>
      `;
    }

    if (section === 'billing') {
      return `
        <h2 style="font-size:16px;margin-bottom:16px;">Billing, Discounts & Return Policies</h2>
        <div class="form-grid-2">
          <div class="form-group">
            <label>Invoice Number Prefix</label>
            <input type="text" class="pos-input font-mono" value="INV-2026-" />
          </div>
          <div class="form-group">
            <label>Bill Rounding Mode</label>
            <select class="pos-select">
              <option value="nearest">Round to Nearest Rupee (Recommended)</option>
              <option value="none">No Rounding (Exact Paise)</option>
            </select>
          </div>
        </div>
        <div style="margin-top:16px;display:flex;flex-direction:column;gap:10px;">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" checked />
            <span>Enable Fast Barcode Auto-Add on Exact Scan</span>
          </label>
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" checked />
            <span>Allow Negative Stock Sales</span>
          </label>
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" checked />
            <span>Enable Multi-Payment mode split per invoice</span>
          </label>
        </div>
      `;
    }

    if (section === 'tax') {
      return `
        <h2 style="font-size:16px;margin-bottom:16px;">Taxation & GST Setup</h2>
        <div class="form-grid-2">
          <div class="form-group">
            <label>GSTIN (15 Digits)</label>
            <input type="text" class="pos-input font-mono" value="36AABCS1429B1Z2" />
          </div>
          <div class="form-group">
            <label>State Code / Place of Supply</label>
            <select class="pos-select">
              <option value="36">36 - Telangana</option>
              <option value="37">37 - Andhra Pradesh</option>
              <option value="29">29 - Karnataka</option>
              <option value="27">27 - Maharashtra</option>
            </select>
          </div>
        </div>
        <div class="form-group" style="margin-top:12px;">
          <label>Price Display Mode</label>
          <select class="pos-select">
            <option value="inclusive">Product Selling Prices are TAX INCLUSIVE (Standard Retail)</option>
            <option value="exclusive">Product Selling Prices are TAX EXCLUSIVE (B2B Wholesale)</option>
          </select>
        </div>
      `;
    }

    if (section === 'printers') {
      return `
        <h2 style="font-size:16px;margin-bottom:16px;">Thermal & Document Printer Configuration</h2>
        <div class="form-grid-2">
          <div class="form-group">
            <label>Default Thermal Receipt Printer (POS)</label>
            <select class="pos-select">
              <option value="t1">POS-80C Thermal Series (USB / Virtual)</option>
              <option value="t2">EPSON TM-T82X Receipt</option>
              <option value="pdf">Microsoft Print to PDF</option>
            </select>
          </div>
          <div class="form-group">
            <label>Paper Width</label>
            <select class="pos-select">
              <option value="80">80mm (3 Inch Standard)</option>
              <option value="58">58mm (2 Inch Compact)</option>
            </select>
          </div>
        </div>
        <div class="form-group" style="margin-top:12px;">
          <label>Office A4 Invoice Printer</label>
          <select class="pos-select">
            <option value="hp">HP LaserJet Pro MFP</option>
            <option value="canon">Canon LBP2900</option>
          </select>
        </div>
        <button type="button" class="btn btn--outline" style="margin-top:12px;" onclick="alert('Sending test print signal to POS-80C...')">Print Test Page</button>
      `;
    }

    if (section === 'barcode') {
      return `
        <h2 style="font-size:16px;margin-bottom:16px;">Barcode & Label Printing Settings</h2>
        <div class="form-grid-2">
          <div class="form-group">
            <label>Default Symbology</label>
            <select class="pos-select">
              <option value="code128">Code 128 (High Density Alphanumeric)</option>
              <option value="ean13">EAN-13 (Standard 13-digit Retail)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Label Paper Size</label>
            <select class="pos-select">
              <option value="50x25">50mm x 25mm (Standard Shelf Label)</option>
              <option value="38x25">38mm x 25mm (2-Up Barcode Roll)</option>
            </select>
          </div>
        </div>
      `;
    }

    if (section === 'backup') {
      return `
        <h2 style="font-size:16px;margin-bottom:16px;">Database Backup & Resilience (Ctrl+B)</h2>
        <div class="dash-box" style="margin-bottom:16px;">
          <div style="font-size:13px;margin-bottom:6px;"><strong>Local SQLite WAL Database</strong></div>
          <div class="font-mono text-secondary" style="font-size:11px;">%APPDATA%\\retail-next-desktop\\retail-next.db</div>
          <div style="margin-top:8px;display:flex;gap:12px;">
            <button type="button" class="btn btn--primary" id="btn-trigger-backup">
              Backup Database Now (Ctrl+B)
            </button>
            <button type="button" class="btn btn--outline" onclick="alert('Choose a .db backup snapshot to restore.')">
              Restore Database
            </button>
          </div>
        </div>
        <div class="form-group">
          <label>Automatic Scheduled Backup</label>
          <select class="pos-select">
            <option value="daily">Daily at Store Closing (Recommended)</option>
            <option value="hourly">Every 4 Hours</option>
            <option value="manual">Manual Only</option>
          </select>
        </div>
      `;
    }

    return '';
  }

  function attachSectionEvents(outlet) {
    const backupBtn = outlet.querySelector('#btn-trigger-backup');
    if (backupBtn) {
      backupBtn.addEventListener('click', () => {
        alert('Database snapshot created successfully in backup directory: retail-next-backup-20261031.db');
      });
    }
  }

  return { renderPage };
})();

