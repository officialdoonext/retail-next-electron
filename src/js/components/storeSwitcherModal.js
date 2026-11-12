/**
 * Retail Next — Store Branch Switcher Modal
 * Calls /api/stores and /api/stores/select
 */

'use strict';

(function(global) {
  let modalEl = null;

  async function open() {
    if (document.getElementById('rn-store-modal')) return;

    modalEl = document.createElement('div');
    modalEl.id = 'rn-store-modal';
    modalEl.className = 'modal-overlay';

    modalEl.innerHTML = `
      <div class="modal-container" style="max-width:580px;">
        <div class="modal-header">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:32px;height:32px;border-radius:8px;background:var(--primary-purple);display:flex;align-items:center;justify-content:center;color:#fff;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div>
              <h3 class="modal-title">Switch Active Store Branch</h3>
              <p style="font-size:11.5px;color:var(--slate-500);">Change active context for POS billing, stock, and sales</p>
            </div>
          </div>
          <button class="btn btn-ghost btn-icon" id="store-modal-close-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="modal-body" id="store-modal-list" style="padding:16px 20px;">
          <div style="text-align:center;padding:24px;color:var(--slate-400);">Loading registered branches...</div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm" id="store-modal-manage-btn">
            Open Stores Directory (/stores)
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modalEl);

    document.getElementById('store-modal-close-btn').onclick = () => modalEl.remove();
    document.getElementById('store-modal-manage-btn').onclick = () => {
      modalEl.remove();
      global.RetailNextRouter?.navigate('/stores');
    };

    // Load stores
    try {
      const data = await global.apiService.getStores();
      const stores = data?.stores || [];
      const listEl = document.getElementById('store-modal-list');
      const activeStoreId = global.apiService.activeStore?.id;

      if (!stores.length) {
        listEl.innerHTML = '<div style="text-align:center;padding:20px;color:var(--slate-500);">No branches registered yet.</div>';
        return;
      }

      listEl.innerHTML = stores.map(store => {
        const isCurrent = store.id === activeStoreId;
        return `
          <div class="store-branch-card" style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border:1px solid ${isCurrent ? 'var(--primary-purple)' : 'var(--border-slate-200)'};background:${isCurrent ? 'var(--primary-purple-light)' : '#ffffff'};border-radius:var(--radius-xl);margin-bottom:10px;box-shadow:var(--shadow-2xs);transition:all 0.15s ease;">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="width:36px;height:36px;border-radius:10px;background:${isCurrent ? 'var(--primary-purple)' : 'var(--slate-100)'};color:${isCurrent ? '#ffffff' : 'var(--slate-600)'};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;">
                ${store.code || 'STR'}
              </div>
              <div>
                <div style="font-weight:600;font-size:13.5px;color:var(--slate-900);display:flex;align-items:center;gap:8px;">
                  ${store.name}
                  ${isCurrent ? '<span class="badge badge-purple" style="font-size:10px;">Active Store</span>' : ''}
                </div>
                <div style="font-size:11.5px;color:var(--slate-500);margin-top:2px;">
                  ${store.city || 'Headquarters'} · GSTIN: ${store.gstin || 'N/A'} · License: <span style="font-weight:600;color:${(store.daysRemaining || 100) < 40 ? 'var(--color-danger)' : 'var(--color-success)'};">${store.daysRemaining || 120} days left</span>
                </div>
              </div>
            </div>
            <div>
              ${isCurrent
                ? '<button class="btn btn-primary btn-sm" disabled style="opacity:0.85;">Selected</button>'
                : `<button class="btn btn-secondary btn-sm switch-btn" data-id="${store.id}" data-name="${store.name}" data-code="${store.code}">Switch</button>`
              }
            </div>
          </div>
        `;
      }).join('');

      // Add switch click handlers
      listEl.querySelectorAll('.switch-btn').forEach(btn => {
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
            global.Toast?.success(`Switched active branch to ${name}`);
            modalEl.remove();
            global.RetailNextHeader?.refresh();
            global.RetailNextRouter?.refreshCurrentPage();
          } catch (err) {
            global.Toast?.error(err.message);
            btn.disabled = false;
            btn.textContent = 'Switch';
          }
        };
      });

    } catch (err) {
      document.getElementById('store-modal-list').innerHTML = `<div style="color:var(--color-danger);text-align:center;padding:20px;">Failed to load branches: ${err.message}</div>`;
    }
  }

  global.StoreSwitcherModal = { open };
})(window);

