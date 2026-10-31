/**
 * RetailNext — Branch Management Page
 * Submenu: File -> Branch -> Select Branch, Switch Branch, Add/Manage Branches
 */

'use strict';

window.BranchPage = (() => {

  const STORAGE_KEY = 'retailnext_branches';
  const ACTIVE_BRANCH_KEY = 'retailnext_active_branch';

  const DEFAULT_BRANCHES = [
    {
      id: 'BR-01',
      code: 'MAIN-01',
      name: 'Main Store & Supermarket',
      isHeadOffice: true,
      address: 'Plot 42, Commercial Avenue, Sector 3, Hitec City',
      city: 'Hyderabad',
      state: 'Telangana',
      pin: '500081',
      phone: '+91 40 2988 4410',
      manager: 'Ramesh Chandra (Store Manager)',
      gstin: '36AABCS1429B1Z2',
      status: 'Active',
      isCurrent: true,
      counterRegisters: 4,
      totalSalesVolume: 4892400.00
    },
    {
      id: 'BR-02',
      code: 'DEPOT-02',
      name: 'Central Warehouse & Wholesale Depot',
      isHeadOffice: false,
      address: 'Survey 108, Industrial Area, Kukatpally',
      city: 'Hyderabad',
      state: 'Telangana',
      pin: '500072',
      phone: '+91 40 2304 8819',
      manager: 'Kiran Kumar (Warehouse Head)',
      gstin: '36AABCS1429B1Z2',
      status: 'Active',
      isCurrent: false,
      counterRegisters: 1,
      totalSalesVolume: 12450000.00
    },
    {
      id: 'BR-03',
      code: 'EXP-03',
      name: 'RetailNext Express Store',
      isHeadOffice: false,
      address: 'Opp. Inorbit Mall, Madhapur Main Road',
      city: 'Hyderabad',
      state: 'Telangana',
      pin: '500081',
      phone: '+91 98480 22334',
      manager: 'Priya Sharma (Branch Supervisor)',
      gstin: '36AABCS1429B1Z2',
      status: 'Active',
      isCurrent: false,
      counterRegisters: 2,
      totalSalesVolume: 1820500.00
    }
  ];

  function getBranches() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse branches:', e);
    }
    return [...DEFAULT_BRANCHES];
  }

  function saveBranches(branches) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(branches));
  }

  function getActiveBranch() {
    const list = getBranches();
    return list.find(b => b.isCurrent) || list[0];
  }

  function switchActiveBranch(branchId) {
    const list = getBranches();
    let selected = null;
    list.forEach(b => {
      b.isCurrent = (b.id === branchId);
      if (b.isCurrent) selected = b;
    });
    saveBranches(list);
    localStorage.setItem(ACTIVE_BRANCH_KEY, branchId);

    // Update UI Header
    const branchNameEl = document.getElementById('branch-name-text');
    if (branchNameEl && selected) {
      branchNameEl.textContent = `Branch: ${selected.name.split('&')[0].trim()}`;
    }

    return selected;
  }

  function renderPage(outlet, mode = 'list') {
    if (!outlet) return;
    outlet.innerHTML = '';
    outlet.className = 'page-container branch-page';

    const branches = getBranches();
    const activeBranch = getActiveBranch();

    outlet.innerHTML = `
      <div class="module-header">
        <div>
          <span class="module-header__parent">File / Branch</span>
          <h1 class="module-header__title">Branch & Outlet Management</h1>
        </div>
        <div class="module-header__actions">
          <button class="btn btn--primary" id="btn-add-branch-modal">+ Add New Branch</button>
        </div>
      </div>

      <!-- Active Branch Summary Card -->
      <div class="card p-4" style="margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(135deg, rgba(59,130,246,0.06), rgba(99,102,241,0.05));border-color:rgba(59,130,246,0.3);">
        <div style="display:flex;align-items:center;gap:16px;">
          <div style="width:52px;height:52px;background:var(--color-brand);color:#fff;border-radius:10px;display:flex;align-items:center;justify-content:center;">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div>
            <div style="font-size:11px;color:var(--color-text-secondary);text-transform:uppercase;font-weight:600;letter-spacing:0.5px;">Currently Active Branch Session</div>
            <h2 style="font-size:18px;font-weight:700;margin:2px 0 4px;color:var(--color-text-primary);" id="cur-branch-name">${activeBranch.name}</h2>
            <div style="font-size:12px;color:var(--color-text-secondary);display:flex;gap:16px;flex-wrap:wrap;">
              <span>Code: <strong class="font-mono text-brand">${activeBranch.code}</strong></span>
              <span>Manager: <strong>${activeBranch.manager}</strong></span>
              <span>Location: <strong>${activeBranch.city}, ${activeBranch.state}</strong></span>
            </div>
          </div>
        </div>
        <div>
          <span class="pay-chip pay-chip--card font-mono" style="font-size:12px;padding:6px 14px;">Active POS Outlet</span>
        </div>
      </div>

      <!-- Branches List Table -->
      <div class="card p-4">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <div>
            <h3 style="font-size:15px;margin:0 0 4px;">Registered Store Branches (${branches.length})</h3>
            <div style="font-size:12px;color:var(--color-text-secondary);">Click "Switch to This Branch" to immediately operate from a different store location.</div>
          </div>
        </div>

        <div class="table-container">
          <table class="erp-table">
            <thead>
              <tr>
                <th>Branch ID</th>
                <th>Branch / Store Name</th>
                <th>Address & Location</th>
                <th>Store Manager</th>
                <th>Contact</th>
                <th style="text-align:center;">Registers</th>
                <th style="text-align:right;">Sales Turnover (₹)</th>
                <th style="text-align:center;">Status</th>
                <th style="text-align:center;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${branches.map(b => `
                <tr style="${b.isCurrent ? 'background:rgba(59,130,246,0.04);' : ''}">
                  <td class="font-mono text-brand font-bold">${b.code}</td>
                  <td>
                    <strong>${b.name}</strong>
                    ${b.isHeadOffice ? '<span class="status-chip status-chip--success" style="margin-left:6px;font-size:9px;">HEAD OFFICE</span>' : ''}
                    ${b.isCurrent ? '<span class="status-chip status-chip--brand" style="margin-left:4px;font-size:9px;">CURRENT</span>' : ''}
                  </td>
                  <td>
                    <div style="font-size:12px;">${b.address}</div>
                    <div style="font-size:11px;color:var(--color-text-tertiary);">${b.city}, ${b.state} - ${b.pin}</div>
                  </td>
                  <td style="font-size:12px;">${b.manager}</td>
                  <td class="font-mono" style="font-size:12px;">${b.phone}</td>
                  <td style="text-align:center;" class="font-mono font-bold">${b.counterRegisters}</td>
                  <td style="text-align:right;" class="font-mono font-bold">₹${b.totalSalesVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td style="text-align:center;">
                    <span class="status-chip status-chip--success">${b.status}</span>
                  </td>
                  <td style="text-align:center;">
                    ${b.isCurrent
                      ? '<button class="btn btn--xs btn--outline" disabled>Active</button>'
                      : `<button class="btn btn--xs btn--primary btn-switch-branch" data-id="${b.id}">Switch Branch</button>`}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add Branch Modal -->
      <div id="add-branch-modal" class="retail-modal">
        <div class="retail-modal__backdrop"></div>
        <div class="retail-modal__dialog" style="max-width:580px;">
          <div class="retail-modal__header">
            <strong>Register New Branch / Godown</strong>
            <button class="retail-modal__close" id="modal-branch-close">&times;</button>
          </div>
          <form id="form-add-branch">
            <div class="retail-modal__body" style="padding:16px;">
              <div class="form-grid-2" style="margin-bottom:12px;">
                <div class="form-group">
                  <label>Branch Name <span class="text-error">*</span></label>
                  <input type="text" id="nb-name" class="pos-input" required placeholder="e.g. Banjara Hills Store" />
                </div>
                <div class="form-group">
                  <label>Branch Code <span class="text-error">*</span></label>
                  <input type="text" id="nb-code" class="pos-input font-mono" required placeholder="e.g. BH-04" />
                </div>
              </div>

              <div class="form-group" style="margin-bottom:12px;">
                <label>Address <span class="text-error">*</span></label>
                <input type="text" id="nb-address" class="pos-input" required placeholder="Street, Building No..." />
              </div>

              <div class="form-grid-3" style="margin-bottom:12px;">
                <div class="form-group">
                  <label>City</label>
                  <input type="text" id="nb-city" class="pos-input" value="Hyderabad" />
                </div>
                <div class="form-group">
                  <label>State</label>
                  <input type="text" id="nb-state" class="pos-input" value="Telangana" />
                </div>
                <div class="form-group">
                  <label>PIN Code</label>
                  <input type="text" id="nb-pin" class="pos-input font-mono" value="500034" />
                </div>
              </div>

              <div class="form-grid-2" style="margin-bottom:12px;">
                <div class="form-group">
                  <label>Branch Phone</label>
                  <input type="tel" id="nb-phone" class="pos-input font-mono" placeholder="+91 98765 00000" />
                </div>
                <div class="form-group">
                  <label>Store Manager Name</label>
                  <input type="text" id="nb-manager" class="pos-input" placeholder="e.g. Anand Varma" />
                </div>
              </div>

              <div class="form-grid-2">
                <div class="form-group">
                  <label>GSTIN for this Branch</label>
                  <input type="text" id="nb-gstin" class="pos-input font-mono" value="36AABCS1429B1Z2" />
                </div>
                <div class="form-group">
                  <label>Billing Registers</label>
                  <input type="number" id="nb-registers" class="pos-input" value="2" min="1" max="50" />
                </div>
              </div>
            </div>

            <div class="retail-modal__footer">
              <button type="button" class="btn btn--outline" id="modal-branch-cancel">Cancel</button>
              <button type="submit" class="btn btn--primary">Save & Register Branch</button>
            </div>
          </form>
        </div>
      </div>
    `;

    setupEvents(outlet);
  }

  function setupEvents(outlet) {
    // Switch branch button clicks
    outlet.querySelectorAll('.btn-switch-branch').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const switched = switchActiveBranch(id);
        renderPage(outlet);
        alert(`Successfully switched active branch to: ${switched.name}`);
      });
    });

    // Modal controls
    const addBtn = outlet.querySelector('#btn-add-branch-modal');
    const modal = outlet.querySelector('#add-branch-modal');
    const closeBtn = outlet.querySelector('#modal-branch-close');
    const cancelBtn = outlet.querySelector('#modal-branch-cancel');
    const form = outlet.querySelector('#form-add-branch');

    if (addBtn && modal) {
      addBtn.onclick = () => modal.classList.add('open');
    }
    if (closeBtn && modal) {
      closeBtn.onclick = () => modal.classList.remove('open');
    }
    if (cancelBtn && modal) {
      cancelBtn.onclick = () => modal.classList.remove('open');
    }

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const branches = getBranches();
        const newBranch = {
          id: 'BR-' + String(branches.length + 1).padStart(2, '0'),
          name: outlet.querySelector('#nb-name').value.trim(),
          code: outlet.querySelector('#nb-code').value.trim().toUpperCase(),
          address: outlet.querySelector('#nb-address').value.trim(),
          city: outlet.querySelector('#nb-city').value.trim(),
          state: outlet.querySelector('#nb-state').value.trim(),
          pin: outlet.querySelector('#nb-pin').value.trim(),
          phone: outlet.querySelector('#nb-phone').value.trim() || '—',
          manager: outlet.querySelector('#nb-manager').value.trim() || 'Store Supervisor',
          gstin: outlet.querySelector('#nb-gstin').value.trim(),
          counterRegisters: Number(outlet.querySelector('#nb-registers').value) || 1,
          totalSalesVolume: 0.00,
          status: 'Active',
          isHeadOffice: false,
          isCurrent: false
        };

        branches.push(newBranch);
        saveBranches(branches);
        modal.classList.remove('open');
        renderPage(outlet);
        alert(`Branch ${newBranch.name} registered successfully!`);
      };
    }
  }

  return {
    renderPage,
    getBranches,
    getActiveBranch,
    switchActiveBranch
  };
})();

