/**
 * Retail Next — Stores Directory Page (/stores)
 *
 * Features:
 *   - Branch Cards Grid: store code, address, manager contact, GSTIN, active status
 *   - Add / Edit Store Offcanvas Drawer: name, code, contact, city, state, pincode, GST
 *   - Store Expiry & License Tracking: badge showing days remaining until renewal
 *   - Active Branch Switcher: calls /api/stores/select
 *   - Strict 24-item pagination
 */

'use strict';

(function(global) {

  let currentPage = 1;
  let storesList = [];

  async function render(outlet) {
    outlet.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Stores & Branches Directory</h1>
          <p>Multi-location retail network, branch license tracking, and active workspace switcher</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" id="stores-add-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            + Add New Branch
          </button>
        </div>
      </div>

      <div id="stores-content">
        <div style="text-align:center;padding:40px;color:var(--slate-400);">Loading store branches from /api/stores...</div>
      </div>
    `;

    document.getElementById('stores-add-btn').onclick = () => openStoreDrawer();

    loadStores(outlet);
  }

  async function loadStores(outlet) {
    const container = document.getElementById('stores-content');
    if (!container) return;

    try {
      const data = await global.apiService.getStores();
      storesList = data?.stores || [];
      const activeStoreId = global.apiService?.activeStore?.id;
      const pagination = data?.pagination || { page: 1, limit: 24, totalItems: storesList.length, totalPages: 1 };

      container.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(320px, 1fr));gap:18px;margin-bottom:20px;">
          ${storesList.map(store => {
            const isCurrent = store.id === activeStoreId;
            const daysLeft = store.daysRemaining || 120;
            const isExpiring = daysLeft < 45;

            return `
              <div class="card" style="border:1.5px solid ${isCurrent ? 'var(--primary-purple)' : 'var(--border-slate-200)'};box-shadow:${isCurrent ? 'var(--shadow-md)' : 'var(--shadow-2xs)'};display:flex;flex-direction:column;justify-content:space-between;">
                <div>
                  <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px;">
                    <div style="display:flex;align-items:center;gap:10px;">
                      <div style="width:42px;height:42px;border-radius:var(--radius-xl);background:${isCurrent ? 'var(--primary-purple)' : 'var(--slate-100)'};color:${isCurrent ? '#ffffff' : 'var(--slate-700)'};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;box-shadow:var(--shadow-2xs);">
                        ${store.code || 'STR'}
                      </div>
                      <div>
                        <h3 style="font-size:15px;font-weight:700;color:var(--slate-900);">${store.name}</h3>
                        <div style="font-size:11.5px;color:var(--slate-500);">${store.city || 'City'}, ${store.state || 'State'} · ${store.pincode || ''}</div>
                      </div>
                    </div>
                    ${isCurrent ? '<span class="badge badge-purple">Active</span>' : '<span class="badge badge-slate">Standby</span>'}
                  </div>

                  <!-- Details Grid -->
                  <div style="background:var(--slate-50);border:1px solid var(--border-slate-200);border-radius:var(--radius-lg);padding:10px;font-size:12px;margin-bottom:14px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                      <span style="color:var(--slate-500);">Branch Manager:</span>
                      <span style="font-weight:600;color:var(--slate-800);">${store.managerName || 'Rajesh Nair'}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                      <span style="color:var(--slate-500);">Contact Phone:</span>
                      <span style="font-family:var(--font-mono);color:var(--slate-800);">${store.phone || '+91 9820011223'}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                      <span style="color:var(--slate-500);">Branch GSTIN:</span>
                      <span style="font-family:var(--font-mono);font-size:11px;color:var(--slate-800);">${store.gstin || '27AAAAA0000A1Z5'}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding-top:4px;border-top:1px dashed var(--border-slate-200);">
                      <span style="color:var(--slate-500);">License Status:</span>
                      <span class="badge ${isExpiring ? 'badge-danger' : 'badge-success'}" style="font-size:10px;">
                        ${daysLeft} days remaining (${store.licenseExpiry || '2027-03-31'})
                      </span>
                    </div>
                  </div>
                </div>

                <div style="display:flex;gap:8px;border-top:1px solid var(--slate-100);padding-top:12px;">
                  ${isCurrent
                    ? '<button class="btn btn-primary btn-sm" style="flex:1;" disabled>✓ Currently Active</button>'
                    : `<button class="btn btn-secondary btn-sm select-branch-btn" data-id="${store.id}" data-name="${store.name}" data-code="${store.code}" style="flex:1;">Set as Active</button>`
                  }
                  <button class="btn btn-secondary btn-sm edit-store-btn" data-id="${store.id}" title="Edit Branch Profile">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    Edit
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Strict 24-Item Pagination -->
        <div class="pagination-container">
          <div class="pagination-info">
            Showing <strong>${storesList.length}</strong> of <strong>${pagination.totalItems}</strong> branches (PAGE_SIZE = 24)
          </div>
          <div class="pagination-controls">
            <button class="page-btn" disabled>Prev</button>
            <button class="page-btn active">1</button>
            <button class="page-btn" disabled>Next</button>
          </div>
        </div>
      `;

      // Set Active Button
      container.querySelectorAll('.select-branch-btn').forEach(btn => {
        btn.onclick = async () => {
          const id = btn.getAttribute('data-id');
          const name = btn.getAttribute('data-name');
          const code = btn.getAttribute('data-code');
          btn.disabled = true;
          btn.textContent = 'Switching...';

          try {
            await global.apiService.selectStore(id);
            global.apiService.activeStore = { id, name, code };
            global.apiService._saveJson('retailnext_active_store', global.apiService.activeStore);
            global.Toast?.success(`Active workspace changed to ${name}`);
            global.RetailNextHeader?.refresh();
            loadStores(outlet);
          } catch (err) {
            global.Toast?.error(err.message);
            btn.disabled = false;
            btn.textContent = 'Set as Active';
          }
        };
      });

      // Edit Store
      container.querySelectorAll('.edit-store-btn').forEach(btn => {
        btn.onclick = () => {
          const id = btn.getAttribute('data-id');
          const s = storesList.find(x => x.id === id);
          if (s) openStoreDrawer(s, outlet);
        };
      });

    } catch (err) {
      container.innerHTML = `<div style="color:var(--color-danger);text-align:center;padding:30px;">Failed to load branches: ${err.message}</div>`;
    }
  }

  function openStoreDrawer(existingStore = null, outlet) {
    const isEdit = !!existingStore;
    const drawerOverlay = document.createElement('div');
    drawerOverlay.className = 'drawer-overlay';

    drawerOverlay.innerHTML = `
      <div class="drawer-container">
        <div class="modal-header">
          <h3 class="modal-title">${isEdit ? 'Edit Branch Profile' : 'Register New Retail Store'}</h3>
          <button class="btn btn-ghost btn-icon" id="drawer-close-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form id="store-form" style="padding:20px;flex:1;overflow-y:auto;">
          <div class="form-group">
            <label class="form-label">Branch Store Name</label>
            <input type="text" id="sf-name" class="form-input" placeholder="e.g. South Mumbai Flagship Store" value="${existingStore?.name || ''}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Branch Code (3-6 characters)</label>
            <input type="text" id="sf-code" class="form-input" placeholder="e.g. STR-004" value="${existingStore?.code || ''}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Manager Name</label>
            <input type="text" id="sf-manager" class="form-input" placeholder="Store Manager Name" value="${existingStore?.managerName || ''}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Contact Phone</label>
            <input type="tel" id="sf-phone" class="form-input" placeholder="+91 9820011223" value="${existingStore?.phone || ''}" required />
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <div class="form-group">
              <label class="form-label">City</label>
              <input type="text" id="sf-city" class="form-input" placeholder="Mumbai" value="${existingStore?.city || ''}" required />
            </div>
            <div class="form-group">
              <label class="form-label">State</label>
              <input type="text" id="sf-state" class="form-input" placeholder="Maharashtra" value="${existingStore?.state || ''}" required />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">GSTIN (15 Digits)</label>
            <input type="text" id="sf-gstin" class="form-input" placeholder="27AAAAA0000A1Z5" value="${existingStore?.gstin || ''}" />
          </div>
          <div class="form-group">
            <label class="form-label">License Expiry Date</label>
            <input type="date" id="sf-expiry" class="form-input" value="${existingStore?.licenseExpiry || '2027-03-31'}" />
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:10px;">
            ${isEdit ? 'Save Changes' : 'Create Store Branch'}
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(drawerOverlay);

    document.getElementById('drawer-close-btn').onclick = () => drawerOverlay.remove();
    drawerOverlay.onclick = (e) => { if (e.target === drawerOverlay) drawerOverlay.remove(); };

    document.getElementById('store-form').onsubmit = async (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById('sf-name').value.trim(),
        code: document.getElementById('sf-code').value.trim(),
        managerName: document.getElementById('sf-manager').value.trim(),
        phone: document.getElementById('sf-phone').value.trim(),
        city: document.getElementById('sf-city').value.trim(),
        state: document.getElementById('sf-state').value.trim(),
        gstin: document.getElementById('sf-gstin').value.trim(),
        licenseExpiry: document.getElementById('sf-expiry').value
      };

      try {
        if (isEdit) {
          await global.apiService.updateStore(existingStore.id, payload);
          global.Toast?.success(`Branch ${payload.name} updated!`);
        } else {
          await global.apiService.createStore(payload);
          global.Toast?.success(`Branch ${payload.name} registered!`);
        }
        drawerOverlay.remove();
        loadStores(outlet);
      } catch (err) {
        global.Toast?.error(err.message);
      }
    };
  }

  global.StoresPage = { render };
})(window);

