/**
 * RetailNext — Financial Year Management Page
 * Submenu: File -> Financial Year -> Select Year, Create Year, Year-End Closing
 */

'use strict';

window.FinancialYearPage = (() => {

  const STORAGE_KEY = 'retailnext_financial_years';
  const ACTIVE_FY_KEY = 'retailnext_active_fy';

  const DEFAULT_FY_LIST = [
    {
      id: 'FY-2026-27',
      title: 'FY 2026 - 2027',
      startDate: '2026-04-01',
      endDate: '2027-03-31',
      status: 'Active',
      isCurrent: true,
      invoicesCount: 1420,
      totalTurnover: 4892400.00,
      locked: false
    },
    {
      id: 'FY-2025-26',
      title: 'FY 2025 - 2026',
      startDate: '2025-04-01',
      endDate: '2026-03-31',
      status: 'Closed',
      isCurrent: false,
      invoicesCount: 9840,
      totalTurnover: 28450100.00,
      locked: true
    }
  ];

  function getYears() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse financial years:', e);
    }
    return [...DEFAULT_FY_LIST];
  }

  function saveYears(years) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(years));
  }

  function getActiveYear() {
    const list = getYears();
    return list.find(y => y.isCurrent) || list[0];
  }

  function setActiveYear(fyId) {
    const list = getYears();
    list.forEach(y => {
      y.isCurrent = (y.id === fyId);
    });
    saveYears(list);
    localStorage.setItem(ACTIVE_FY_KEY, fyId);
  }

  function renderPage(outlet, subSection = 'select') {
    if (!outlet) return;
    outlet.innerHTML = '';
    outlet.className = 'page-container fy-page';

    let activeTab = subSection; // 'select' | 'create' | 'close'

    const years = getYears();
    const currentFY = getActiveYear();

    outlet.innerHTML = `
      <div class="module-header">
        <div>
          <span class="module-header__parent">File / Financial Year</span>
          <h1 class="module-header__title">Financial Year Management</h1>
        </div>
        <div class="module-header__actions">
          <div class="pill-group">
            <button class="pill-btn ${activeTab === 'select' ? 'active' : ''}" id="fy-tab-select">Select Year</button>
            <button class="pill-btn ${activeTab === 'create' ? 'active' : ''}" id="fy-tab-create">+ Create New Year</button>
            <button class="pill-btn ${activeTab === 'close' ? 'active' : ''}" id="fy-tab-close">Year-End Closing</button>
          </div>
        </div>
      </div>

      <!-- Current Active Financial Year Banner -->
      <div class="card p-4" style="margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(135deg, rgba(16,185,129,0.06), rgba(59,130,246,0.05));border-color:rgba(16,185,129,0.3);">
        <div style="display:flex;align-items:center;gap:16px;">
          <div style="width:48px;height:48px;background:var(--color-success);color:#fff;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div>
            <div style="font-size:11px;color:var(--color-text-secondary);text-transform:uppercase;font-weight:600;letter-spacing:0.5px;">Current Operating Financial Year</div>
            <h2 style="font-size:18px;font-weight:700;margin:2px 0 4px;color:var(--color-text-primary);">${currentFY.title}</h2>
            <div style="font-size:12px;color:var(--color-text-secondary);" class="font-mono">
              Period: ${new Date(currentFY.startDate).toLocaleDateString()} to ${new Date(currentFY.endDate).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div style="text-align:right;">
          <span class="pay-chip pay-chip--cash font-mono" style="font-size:12px;padding:6px 14px;">Active Books</span>
        </div>
      </div>

      <div id="fy-content-outlet"></div>
    `;

    const contentOutlet = outlet.querySelector('#fy-content-outlet');

    const tabSelectBtn = outlet.querySelector('#fy-tab-select');
    const tabCreateBtn = outlet.querySelector('#fy-tab-create');
    const tabCloseBtn = outlet.querySelector('#fy-tab-close');

    function switchSubTab(tab) {
      activeTab = tab;
      [tabSelectBtn, tabCreateBtn, tabCloseBtn].forEach(b => b.classList.remove('active'));
      if (tab === 'select') tabSelectBtn.classList.add('active');
      if (tab === 'create') tabCreateBtn.classList.add('active');
      if (tab === 'close') tabCloseBtn.classList.add('active');

      if (tab === 'select') renderSelectView(contentOutlet, outlet);
      else if (tab === 'create') renderCreateView(contentOutlet, outlet);
      else if (tab === 'close') renderCloseView(contentOutlet, outlet);
    }

    tabSelectBtn.onclick = () => switchSubTab('select');
    tabCreateBtn.onclick = () => switchSubTab('create');
    tabCloseBtn.onclick = () => switchSubTab('close');

    switchSubTab(activeTab);
  }

  // ─── 1. Select Financial Year View ─────────────────────────────────────────
  function renderSelectView(container, parentOutlet) {
    const years = getYears();

    container.innerHTML = `
      <div class="card p-4">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <div>
            <h3 style="font-size:15px;margin:0 0 4px;">Available Financial Years</h3>
            <div style="font-size:12px;color:var(--color-text-secondary);">Select a financial year to switch billing and accounting periods.</div>
          </div>
        </div>

        <div class="table-container">
          <table class="erp-table">
            <thead>
              <tr>
                <th>Year Code</th>
                <th>Financial Year Title</th>
                <th>Period (From - To)</th>
                <th style="text-align:right;">Recorded Invoices</th>
                <th style="text-align:right;">Total Turnover (₹)</th>
                <th style="text-align:center;">Status</th>
                <th style="text-align:center;">Lock State</th>
                <th style="text-align:center;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${years.map(y => `
                <tr style="${y.isCurrent ? 'background:rgba(59,130,246,0.04);' : ''}">
                  <td class="font-mono text-brand font-bold">${y.id}</td>
                  <td>
                    <strong>${y.title}</strong>
                    ${y.isCurrent ? '<span class="status-chip status-chip--success" style="margin-left:8px;font-size:10px;">CURRENT</span>' : ''}
                  </td>
                  <td class="font-mono text-secondary">${y.startDate} &rarr; ${y.endDate}</td>
                  <td style="text-align:right;" class="font-mono">${y.invoicesCount.toLocaleString()}</td>
                  <td style="text-align:right;" class="font-mono font-bold">₹${y.totalTurnover.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td style="text-align:center;">
                    <span class="status-chip status-chip--${y.status === 'Active' ? 'success' : 'warning'}">${y.status}</span>
                  </td>
                  <td style="text-align:center;">
                    ${y.locked ? '<span style="color:var(--color-error);font-size:11px;">🔒 Locked</span>' : '<span style="color:var(--color-success);font-size:11px;">🔓 Unlocked</span>'}
                  </td>
                  <td style="text-align:center;">
                    ${y.isCurrent 
                      ? '<button class="btn btn--xs btn--outline" disabled>Active</button>' 
                      : `<button class="btn btn--xs btn--primary btn-set-active" data-id="${y.id}">Set as Active Year</button>`}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.querySelectorAll('.btn-set-active').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        setActiveYear(id);
        renderPage(parentOutlet, 'select');
        alert(`Financial Year ${id} is now set as the active operating period.`);
      });
    });
  }

  // ─── 2. Create Financial Year View ─────────────────────────────────────────
  function renderCreateView(container, parentOutlet) {
    container.innerHTML = `
      <div class="card p-6" style="max-width:720px;margin:0 auto;">
        <h2 style="font-size:16px;margin-bottom:6px;">Create New Financial Year</h2>
        <p style="font-size:12px;color:var(--color-text-secondary);margin-bottom:20px;">
          Configure a new accounting period. Opening balances for stock, customers, and suppliers can be automatically carried forward.
        </p>

        <form id="form-create-fy">
          <div class="form-group" style="margin-bottom:14px;">
            <label>Financial Year Code / Title <span class="text-error">*</span></label>
            <input type="text" id="new-fy-title" class="pos-input" value="FY 2027 - 2028" required placeholder="e.g. FY 2027 - 2028" />
          </div>

          <div class="form-grid-2" style="margin-bottom:16px;">
            <div class="form-group">
              <label>Period Beginning (Start Date) <span class="text-error">*</span></label>
              <input type="date" id="new-fy-start" class="pos-input" value="2027-04-01" required />
            </div>
            <div class="form-group">
              <label>Period Ending (End Date) <span class="text-error">*</span></label>
              <input type="date" id="new-fy-end" class="pos-input" value="2028-03-31" required />
            </div>
          </div>

          <!-- Carry Forward Configuration Checkboxes -->
          <div class="form-fieldset" style="margin-bottom:20px;">
            <legend>Opening Balance Carry-Forward Rules</legend>
            <div style="display:flex;flex-direction:column;gap:10px;padding:8px 0;">
              <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;">
                <input type="checkbox" id="cf-stock" checked />
                <span>Carry forward current stock quantities and valuation as <strong>Opening Stock</strong></span>
              </label>
              <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;">
                <input type="checkbox" id="cf-cust" checked />
                <span>Carry forward Customer ledgers and outstanding dues</span>
              </label>
              <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;">
                <input type="checkbox" id="cf-supp" checked />
                <span>Carry forward Supplier ledgers and pending payables</span>
              </label>
              <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;">
                <input type="checkbox" id="cf-tax" checked />
                <span>Transfer Input Tax Credit (ITC) closing balance as opening balance</span>
              </label>
              <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;">
                <input type="checkbox" id="lock-old" />
                <span>Lock previous financial year books after creating new period</span>
              </label>
            </div>
          </div>

          <div style="display:flex;justify-content:flex-end;gap:12px;">
            <button type="button" class="btn btn--outline" id="btn-cancel-create">Cancel</button>
            <button type="submit" class="btn btn--primary">Create & Register Financial Year</button>
          </div>
        </form>
      </div>
    `;

    container.querySelector('#btn-cancel-create').onclick = () => {
      renderPage(parentOutlet, 'select');
    };

    container.querySelector('#form-create-fy').onsubmit = (e) => {
      e.preventDefault();
      const title = container.querySelector('#new-fy-title').value.trim();
      const startDate = container.querySelector('#new-fy-start').value;
      const endDate = container.querySelector('#new-fy-end').value;

      const years = getYears();
      const code = 'FY-' + startDate.slice(0, 4) + '-' + endDate.slice(2, 4);

      if (years.some(y => y.id === code || y.title.toLowerCase() === title.toLowerCase())) {
        alert('A financial year with this period or title already exists.');
        return;
      }

      const newFY = {
        id: code,
        title,
        startDate,
        endDate,
        status: 'Active',
        isCurrent: false,
        invoicesCount: 0,
        totalTurnover: 0.00,
        locked: false
      };

      years.unshift(newFY);
      saveYears(years);
      alert(`Financial Year ${title} created successfully! You can switch to it from the Select Year tab.`);
      renderPage(parentOutlet, 'select');
    };
  }

  // ─── 3. Year-End Closing View ──────────────────────────────────────────────
  function renderCloseView(container, parentOutlet) {
    const currentFY = getActiveYear();

    container.innerHTML = `
      <div class="card p-6" style="max-width:760px;margin:0 auto;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
          <div style="width:40px;height:40px;background:#fef2f2;color:#dc2626;border-radius:8px;display:flex;align-items:center;justify-content:center;">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div>
            <h2 style="font-size:16px;margin:0;">Year-End Closing Wizard (${currentFY.title})</h2>
            <div style="font-size:12px;color:var(--color-text-secondary);">Finalize annual audit, freeze books and close the current financial year.</div>
          </div>
        </div>

        <!-- Checklist -->
        <div style="background:var(--color-bg-app);border:1px solid var(--color-border);border-radius:8px;padding:16px;margin-top:16px;">
          <h4 style="font-size:13px;margin:0 0 12px;">Pre-Closing Verification Checklist</h4>
          
          <div style="display:flex;flex-direction:column;gap:10px;font-size:12px;">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span>1. All Sales Bills & Invoices Reconciled</span>
              <strong style="color:var(--color-success)">✓ Passed (1,420 Bills Verified)</strong>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span>2. Physical Stock Count vs Book Stock Discrepancy</span>
              <strong style="color:var(--color-success)">✓ 0 Variances Found</strong>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span>3. Cash Drawer & Bank Reconciliation</span>
              <strong style="color:var(--color-success)">✓ Fully Balanced</strong>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span>4. GST Returns (GSTR-1 & 3B) Reconciled</span>
              <strong style="color:var(--color-brand)">✓ Tax Accounts Verified</strong>
            </div>
          </div>
        </div>

        <div style="margin-top:20px;padding:12px;background:#fffbeb;border:1px solid #fef3c7;border-radius:6px;font-size:12px;color:#92400e;">
          <strong>Warning:</strong> Closing a financial year will freeze all transactions (invoices, returns, payments) for <strong>${currentFY.title}</strong> to prevent retrospective tampering. This action cannot be reversed without administrative authorization.
        </div>

        <div style="margin-top:24px;display:flex;justify-content:flex-end;gap:12px;">
          <button class="btn btn--outline" id="btn-cancel-close">Cancel</button>
          <button class="btn btn--danger" id="btn-execute-close">Execute Year-End Closing & Freeze Books</button>
        </div>
      </div>
    `;

    container.querySelector('#btn-cancel-close').onclick = () => {
      renderPage(parentOutlet, 'select');
    };

    container.querySelector('#btn-execute-close').onclick = () => {
      if (confirm(`Are you sure you want to CLOSE and FREEZE ${currentFY.title}?\n\nTransactions for this period will become read-only.`)) {
        const years = getYears();
        const found = years.find(y => y.id === currentFY.id);
        if (found) {
          found.status = 'Closed';
          found.locked = true;
          saveYears(years);
        }
        alert(`Year-End closing completed! ${currentFY.title} is now finalized and locked.`);
        renderPage(parentOutlet, 'select');
      }
    };
  }

  return {
    renderPage,
    getYears,
    getActiveYear,
    setActiveYear
  };
})();

