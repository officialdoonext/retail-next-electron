/**
 * RetailNext — Company Profile & Store Identity Page
 * Submenu: File -> Company -> Company Profile / Edit Company Details
 * Manages Legal Name, Trade Name, GSTIN, Address, Bank Details & Invoice Notes.
 */

'use strict';

window.CompanyPage = (() => {

  const STORAGE_KEY = 'retailnext_company_profile';

  const DEFAULT_PROFILE = {
    legalName: 'RetailNext Supermarket Pvt Ltd',
    tradeName: 'RetailNext — Hypermarket',
    tagline: 'Freshness & Daily Savings Under One Roof',
    businessType: 'Retail Supermarket & Grocery',
    gstin: '36AABCS1429B1Z2',
    pan: 'AABCS1429B',
    taxScheme: 'Regular GST Registered',
    fssaiLicense: '13624011000248',
    msmeUdyam: 'UDYAM-TS-02-0048192',
    address1: 'Plot 42, Commercial Avenue, Sector 3',
    address2: 'Hitec City Knowledge Park',
    city: 'Hyderabad',
    state: 'Telangana',
    stateCode: '36',
    pinCode: '500081',
    country: 'India',
    phone: '+91 40 2988 4410',
    mobile: '+91 98765 43210',
    email: 'billing@retailnext.in',
    website: 'https://retailnext.in',
    bankName: 'HDFC Bank',
    accountName: 'RetailNext Supermarket Pvt Ltd',
    accountNumber: '50200049281902',
    ifscCode: 'HDFC0001234',
    bankBranch: 'Hitec City Branch',
    upiId: 'retailnext@hdfcbank',
    invoicePrefix: 'INV-2026-',
    authorizedSignatory: 'Store Manager',
    invoiceTerms: '1. Goods once sold can be exchanged within 7 days along with original invoice.\n2. No return or exchange on dairy, frozen items, or fresh fruits & vegetables.\n3. Subject to Hyderabad jurisdiction only.',
    invoiceFooterNote: 'Thank you for shopping with RetailNext! Visit again.'
  };

  function getProfile() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...DEFAULT_PROFILE, ...JSON.parse(stored) };
    } catch (e) {
      console.warn('Failed to parse company profile:', e);
    }
    return { ...DEFAULT_PROFILE };
  }

  function saveProfile(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      // Update app brand in header if available
      const brandTitle = document.querySelector('.app-brand__title');
      if (brandTitle && data.tradeName) {
        brandTitle.textContent = data.tradeName.split('—')[0].trim() || 'RetailNext';
      }
      return true;
    } catch (e) {
      console.error('Failed to save company profile:', e);
      return false;
    }
  }

  let activeTab = 'general'; // 'general' | 'tax' | 'contact' | 'bank' | 'terms'

  function renderPage(outlet, options = {}) {
    if (!outlet) return;
    outlet.innerHTML = '';
    outlet.className = 'page-container company-page';

    const profile = getProfile();

    outlet.innerHTML = `
      <div class="module-header">
        <div>
          <span class="module-header__parent">File / Company</span>
          <h1 class="module-header__title">Company Profile & Store Details</h1>
        </div>
        <div class="module-header__actions">
          <button class="btn btn--primary" id="btn-save-company">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
            </svg>
            Save Company Details (F10)
          </button>
        </div>
      </div>

      <!-- Quick Summary Card -->
      <div class="card p-4" style="margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(135deg, rgba(37,99,235,0.06), rgba(16,185,129,0.04));border-color:rgba(59,130,246,0.3);">
        <div style="display:flex;align-items:center;gap:16px;">
          <div style="width:56px;height:56px;background:var(--color-brand);color:#fff;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;">
            ${(profile.tradeName || 'R')[0]}
          </div>
          <div>
            <h2 style="font-size:18px;font-weight:700;margin:0 0 4px;color:var(--color-text-primary);" id="disp-trade-name">${profile.tradeName}</h2>
            <div style="font-size:12px;color:var(--color-text-secondary);display:flex;gap:16px;flex-wrap:wrap;">
              <span>GSTIN: <strong class="font-mono text-brand">${profile.gstin}</strong></span>
              <span>City: <strong>${profile.city}, ${profile.state}</strong></span>
              <span>Contact: <strong>${profile.mobile}</strong></span>
            </div>
          </div>
        </div>
        <div>
          <span class="pay-chip pay-chip--card font-mono" style="font-size:12px;padding:6px 12px;">Active Store Profile</span>
        </div>
      </div>

      <!-- Settings Layout -->
      <div class="settings-layout">

        <!-- Navigation Tabs -->
        <div class="settings-nav">
          <div class="settings-nav-item ${activeTab === 'general' ? 'active' : ''}" data-tab="general">
            <span>Store Identity & Branding</span>
          </div>
          <div class="settings-nav-item ${activeTab === 'tax' ? 'active' : ''}" data-tab="tax">
            <span>Tax, GSTIN & Registrations</span>
          </div>
          <div class="settings-nav-item ${activeTab === 'contact' ? 'active' : ''}" data-tab="contact">
            <span>Address & Communications</span>
          </div>
          <div class="settings-nav-item ${activeTab === 'bank' ? 'active' : ''}" data-tab="bank">
            <span>Bank Account & UPI Payments</span>
          </div>
          <div class="settings-nav-item ${activeTab === 'terms' ? 'active' : ''}" data-tab="terms">
            <span>Invoice Terms & Disclaimers</span>
          </div>
        </div>

        <!-- Content Card -->
        <div class="settings-content card p-6" id="company-tab-outlet">
          ${renderTabContent(activeTab, profile)}
        </div>

      </div>
    `;

    setupEvents(outlet);
  }

  function renderTabContent(tab, profile) {
    if (tab === 'general') {
      return `
        <h2 style="font-size:16px;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
          <span>Store Identity & Business Details</span>
        </h2>
        <div class="form-grid-2">
          <div class="form-group">
            <label>Legal Entity Name <span class="text-error">*</span></label>
            <input type="text" id="cp-legal-name" class="pos-input" value="${profile.legalName}" placeholder="e.g. RetailNext Supermarket Pvt Ltd" required />
          </div>
          <div class="form-group">
            <label>Trade / Display Name on Bill <span class="text-error">*</span></label>
            <input type="text" id="cp-trade-name" class="pos-input" value="${profile.tradeName}" placeholder="e.g. RetailNext — Main Store" required />
          </div>
        </div>

        <div class="form-grid-2" style="margin-top:16px;">
          <div class="form-group">
            <label>Tagline / Motto</label>
            <input type="text" id="cp-tagline" class="pos-input" value="${profile.tagline}" placeholder="e.g. Freshness & Daily Savings" />
          </div>
          <div class="form-group">
            <label>Business / Retail Category</label>
            <select id="cp-business-type" class="pos-select">
              <option value="Retail Supermarket & Grocery" ${profile.businessType === 'Retail Supermarket & Grocery' ? 'selected' : ''}>Retail Supermarket & Grocery</option>
              <option value="Departmental Store" ${profile.businessType === 'Departmental Store' ? 'selected' : ''}>Departmental Store</option>
              <option value="Apparel & Fashion Store" ${profile.businessType === 'Apparel & Fashion Store' ? 'selected' : ''}>Apparel & Fashion Store</option>
              <option value="Electronics & Appliances" ${profile.businessType === 'Electronics & Appliances' ? 'selected' : ''}>Electronics & Appliances</option>
              <option value="Pharmacy & Healthcare" ${profile.businessType === 'Pharmacy & Healthcare' ? 'selected' : ''}>Pharmacy & Healthcare</option>
              <option value="FMCG & Wholesale Depot" ${profile.businessType === 'FMCG & Wholesale Depot' ? 'selected' : ''}>FMCG & Wholesale Depot</option>
            </select>
          </div>
        </div>

        <div class="form-group" style="margin-top:16px;">
          <label>Default Invoice Prefix</label>
          <input type="text" id="cp-inv-prefix" class="pos-input font-mono" style="max-width:200px;" value="${profile.invoicePrefix}" placeholder="e.g. INV-2026-" />
        </div>
      `;
    }

    if (tab === 'tax') {
      return `
        <h2 style="font-size:16px;margin-bottom:16px;">Taxation, GST & Statutory Licenses</h2>
        <div class="form-grid-2">
          <div class="form-group">
            <label>Goods & Services Tax Identification Number (GSTIN) <span class="text-error">*</span></label>
            <input type="text" id="cp-gstin" class="pos-input font-mono" value="${profile.gstin}" maxlength="15" placeholder="e.g. 36AABCS1429B1Z2" style="text-transform:uppercase;" required />
            <div style="font-size:11px;color:var(--color-text-tertiary);margin-top:4px;">15-digit alphanumeric format with 2-digit State code prefix.</div>
          </div>
          <div class="form-group">
            <label>Permanent Account Number (PAN)</label>
            <input type="text" id="cp-pan" class="pos-input font-mono" value="${profile.pan}" maxlength="10" placeholder="e.g. AABCS1429B" style="text-transform:uppercase;" />
          </div>
        </div>

        <div class="form-grid-3" style="margin-top:16px;">
          <div class="form-group">
            <label>GST Tax Scheme</label>
            <select id="cp-tax-scheme" class="pos-select">
              <option value="Regular GST Registered" ${profile.taxScheme === 'Regular GST Registered' ? 'selected' : ''}>Regular GST Registered (Tax Invoice)</option>
              <option value="Composition Dealer" ${profile.taxScheme === 'Composition Dealer' ? 'selected' : ''}>Composition Dealer (Bill of Supply)</option>
              <option value="Unregistered / Exempt" ${profile.taxScheme === 'Unregistered / Exempt' ? 'selected' : ''}>Unregistered / Exempt</option>
            </select>
          </div>
          <div class="form-group">
            <label>FSSAI License No (Food & Safety)</label>
            <input type="text" id="cp-fssai" class="pos-input font-mono" value="${profile.fssaiLicense}" placeholder="14-digit FSSAI Number" />
          </div>
          <div class="form-group">
            <label>MSME / Udyam Registration No</label>
            <input type="text" id="cp-msme" class="pos-input font-mono" value="${profile.msmeUdyam}" placeholder="e.g. UDYAM-TS-02-0048192" />
          </div>
        </div>
      `;
    }

    if (tab === 'contact') {
      return `
        <h2 style="font-size:16px;margin-bottom:16px;">Physical Store Location & Contacts</h2>
        <div class="form-group">
          <label>Store Address Line 1</label>
          <input type="text" id="cp-addr1" class="pos-input" value="${profile.address1}" placeholder="Street, Building, Door No..." />
        </div>
        <div class="form-group" style="margin-top:12px;">
          <label>Store Address Line 2</label>
          <input type="text" id="cp-addr2" class="pos-input" value="${profile.address2}" placeholder="Area, Landmark, Colony..." />
        </div>

        <div class="form-grid-4" style="margin-top:16px;">
          <div class="form-group">
            <label>City</label>
            <input type="text" id="cp-city" class="pos-input" value="${profile.city}" />
          </div>
          <div class="form-group">
            <label>State</label>
            <input type="text" id="cp-state" class="pos-input" value="${profile.state}" />
          </div>
          <div class="form-group">
            <label>State Code</label>
            <input type="text" id="cp-state-code" class="pos-input font-mono" value="${profile.stateCode}" />
          </div>
          <div class="form-group">
            <label>Postal / PIN Code</label>
            <input type="text" id="cp-pincode" class="pos-input font-mono" value="${profile.pinCode}" />
          </div>
        </div>

        <div class="form-grid-3" style="margin-top:16px;">
          <div class="form-group">
            <label>Mobile Number (SMS & WhatsApp)</label>
            <input type="tel" id="cp-mobile" class="pos-input font-mono" value="${profile.mobile}" />
          </div>
          <div class="form-group">
            <label>Landline Phone</label>
            <input type="tel" id="cp-phone" class="pos-input font-mono" value="${profile.phone}" />
          </div>
          <div class="form-group">
            <label>Official Billing Email</label>
            <input type="email" id="cp-email" class="pos-input" value="${profile.email}" />
          </div>
        </div>
      `;
    }

    if (tab === 'bank') {
      return `
        <h2 style="font-size:16px;margin-bottom:16px;">Bank Account & UPI Payment Details</h2>
        <div class="form-grid-2">
          <div class="form-group">
            <label>Bank Name</label>
            <input type="text" id="cp-bank-name" class="pos-input" value="${profile.bankName}" placeholder="e.g. State Bank of India, HDFC..." />
          </div>
          <div class="form-group">
            <label>Account Holder Name</label>
            <input type="text" id="cp-account-name" class="pos-input" value="${profile.accountName}" />
          </div>
        </div>

        <div class="form-grid-3" style="margin-top:16px;">
          <div class="form-group">
            <label>Account Number</label>
            <input type="text" id="cp-account-num" class="pos-input font-mono" value="${profile.accountNumber}" />
          </div>
          <div class="form-group">
            <label>IFSC Code</label>
            <input type="text" id="cp-ifsc" class="pos-input font-mono" value="${profile.ifscCode}" style="text-transform:uppercase;" />
          </div>
          <div class="form-group">
            <label>Bank Branch</label>
            <input type="text" id="cp-branch" class="pos-input" value="${profile.bankBranch}" />
          </div>
        </div>

        <div class="form-group" style="margin-top:16px;">
          <label>Store UPI VPA (For Dynamic Invoice QR Code)</label>
          <input type="text" id="cp-upi" class="pos-input font-mono" value="${profile.upiId}" placeholder="e.g. yourstore@upi / phonepe" style="max-width:320px;" />
          <div style="font-size:11px;color:var(--color-text-tertiary);margin-top:4px;">When populated, thermal invoices print a scan-and-pay UPI QR code.</div>
        </div>
      `;
    }

    if (tab === 'terms') {
      return `
        <h2 style="font-size:16px;margin-bottom:16px;">Invoice Terms, Conditions & Signatures</h2>
        <div class="form-group">
          <label>Standard Terms & Conditions (Printed at bottom of bill)</label>
          <textarea id="cp-terms" class="pos-input font-mono" rows="4" style="line-height:1.5;">${profile.invoiceTerms}</textarea>
        </div>

        <div class="form-grid-2" style="margin-top:16px;">
          <div class="form-group">
            <label>Authorized Signatory Title</label>
            <input type="text" id="cp-signatory" class="pos-input" value="${profile.authorizedSignatory}" placeholder="e.g. For RetailNext Supermarket" />
          </div>
          <div class="form-group">
            <label>Customer Thank-you Note</label>
            <input type="text" id="cp-footer-note" class="pos-input" value="${profile.invoiceFooterNote}" placeholder="e.g. Thank you! Visit again." />
          </div>
        </div>
      `;
    }

    return '';
  }

  function setupEvents(outlet) {
    // Tab switching
    outlet.querySelectorAll('.settings-nav-item').forEach(el => {
      el.addEventListener('click', () => {
        saveCurrentTabValues(outlet);
        outlet.querySelectorAll('.settings-nav-item').forEach(i => i.classList.remove('active'));
        el.classList.add('active');
        activeTab = el.getAttribute('data-tab');
        const container = outlet.querySelector('#company-tab-outlet');
        if (container) {
          container.innerHTML = renderTabContent(activeTab, getProfile());
        }
      });
    });

    // Save All Profile
    const saveBtn = outlet.querySelector('#btn-save-company');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        saveCurrentTabValues(outlet);
        const updated = getProfile();
        saveProfile(updated);
        renderPage(outlet);
        alert('Company profile and billing details saved successfully!');
      });
    }
  }

  function saveCurrentTabValues(outlet) {
    const current = getProfile();

    const getVal = (id) => {
      const el = outlet.querySelector(id);
      return el ? el.value.trim() : null;
    };

    if (getVal('#cp-legal-name') !== null) current.legalName = getVal('#cp-legal-name');
    if (getVal('#cp-trade-name') !== null) current.tradeName = getVal('#cp-trade-name');
    if (getVal('#cp-tagline') !== null) current.tagline = getVal('#cp-tagline');
    if (getVal('#cp-business-type') !== null) current.businessType = getVal('#cp-business-type');
    if (getVal('#cp-inv-prefix') !== null) current.invoicePrefix = getVal('#cp-inv-prefix');
    if (getVal('#cp-gstin') !== null) current.gstin = getVal('#cp-gstin').toUpperCase();
    if (getVal('#cp-pan') !== null) current.pan = getVal('#cp-pan').toUpperCase();
    if (getVal('#cp-tax-scheme') !== null) current.taxScheme = getVal('#cp-tax-scheme');
    if (getVal('#cp-fssai') !== null) current.fssaiLicense = getVal('#cp-fssai');
    if (getVal('#cp-msme') !== null) current.msmeUdyam = getVal('#cp-msme');
    if (getVal('#cp-addr1') !== null) current.address1 = getVal('#cp-addr1');
    if (getVal('#cp-addr2') !== null) current.address2 = getVal('#cp-addr2');
    if (getVal('#cp-city') !== null) current.city = getVal('#cp-city');
    if (getVal('#cp-state') !== null) current.state = getVal('#cp-state');
    if (getVal('#cp-state-code') !== null) current.stateCode = getVal('#cp-state-code');
    if (getVal('#cp-pincode') !== null) current.pinCode = getVal('#cp-pincode');
    if (getVal('#cp-mobile') !== null) current.mobile = getVal('#cp-mobile');
    if (getVal('#cp-phone') !== null) current.phone = getVal('#cp-phone');
    if (getVal('#cp-email') !== null) current.email = getVal('#cp-email');
    if (getVal('#cp-bank-name') !== null) current.bankName = getVal('#cp-bank-name');
    if (getVal('#cp-account-name') !== null) current.accountName = getVal('#cp-account-name');
    if (getVal('#cp-account-num') !== null) current.accountNumber = getVal('#cp-account-num');
    if (getVal('#cp-ifsc') !== null) current.ifscCode = getVal('#cp-ifsc').toUpperCase();
    if (getVal('#cp-branch') !== null) current.bankBranch = getVal('#cp-branch');
    if (getVal('#cp-upi') !== null) current.upiId = getVal('#cp-upi');
    if (getVal('#cp-terms') !== null) current.invoiceTerms = getVal('#cp-terms');
    if (getVal('#cp-signatory') !== null) current.authorizedSignatory = getVal('#cp-signatory');
    if (getVal('#cp-footer-note') !== null) current.invoiceFooterNote = getVal('#cp-footer-note');

    saveProfile(current);
  }

  return {
    renderPage,
    getProfile,
    saveProfile
  };
})();

