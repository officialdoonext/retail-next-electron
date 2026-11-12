/**
 * Retail Next — Authentication Modal
 * Supports:
 *   1. Business Owner / Admin Login (Email & Password -> /api/auth/login)
 *   2. Cashier & Staff Terminal Login (Login ID & MPIN -> /api/auth/staff-login)
 *   3. Session Status & Logout
 */

'use strict';

(function(global) {
  let modalEl = null;

  function renderModal() {
    if (document.getElementById('rn-auth-modal')) return;

    modalEl = document.createElement('div');
    modalEl.id = 'rn-auth-modal';
    modalEl.className = 'modal-overlay';

    const currentUser = global.apiService?.user;
    const currentStaff = global.apiService?.staff;
    const currentBiz = global.apiService?.activeBusiness;

    modalEl.innerHTML = `
      <div class="modal-container" style="max-width:440px;">
        <div class="modal-header">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:32px;height:32px;border-radius:8px;background:var(--primary-purple);display:flex;align-items:center;justify-content:center;color:#fff;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div>
              <h3 class="modal-title">Account & Terminal Authentication</h3>
              <p style="font-size:11.5px;color:var(--slate-500);">Connected to ${global.apiService?.baseUrl || 'retailnext.doonext.app'}</p>
            </div>
          </div>
          <button class="btn btn-ghost btn-icon" id="auth-modal-close-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="modal-body" style="padding:18px 20px;">
          <!-- Active Session Pill -->
          <div style="background:var(--slate-50);border:1px solid var(--border-slate-200);border-radius:var(--radius-xl);padding:12px;margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
              <span style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--slate-500);">Active Context</span>
              <span class="badge badge-purple">${currentBiz?.name || 'Retail Next'}</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <div class="user-avatar" style="width:36px;height:36px;font-size:14px;">${(currentUser?.name || 'A')[0]}</div>
              <div style="flex:1;">
                <div style="font-weight:600;font-size:13px;color:var(--slate-900);">${currentUser?.name || 'Administrator'}</div>
                <div style="font-size:11.5px;color:var(--slate-500);">${currentUser?.email || 'admin@retailnext.com'} · ${currentStaff?.name ? 'Cashier: ' + currentStaff.name : 'Owner'}</div>
              </div>
              <button class="btn btn-secondary btn-sm" id="auth-logout-btn" style="color:var(--color-danger);border-color:#fecaca;">
                Logout
              </button>
            </div>
          </div>

          <!-- Auth Mode Tabs -->
          <div style="display:flex;border-bottom:1px solid var(--border-slate-200);margin-bottom:16px;">
            <button id="tab-btn-owner" class="btn btn-ghost" style="flex:1;border-bottom:2px solid var(--primary-purple);color:var(--primary-purple);border-radius:0;font-weight:600;">
              Business Owner
            </button>
            <button id="tab-btn-staff" class="btn btn-ghost" style="flex:1;border-bottom:2px solid transparent;color:var(--slate-500);border-radius:0;">
              Cashier / Staff MPIN
            </button>
          </div>

          <!-- Form 1: Business Owner (Email & Password) -->
          <form id="owner-login-form">
            <div class="form-group">
              <label class="form-label">Business Email</label>
              <input type="email" id="owner-email" class="form-input" placeholder="admin@retailnext.com" value="${currentUser?.email || 'admin@retailnext.com'}" required />
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input type="password" id="owner-password" class="form-input" placeholder="••••••••" required />
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;margin-top:4px;" id="owner-submit-btn">
              Authenticate Owner
            </button>
          </form>

          <!-- Form 2: Cashier Staff (Login ID & MPIN) -->
          <form id="staff-login-form" style="display:none;">
            <div class="form-group">
              <label class="form-label">POS Terminal Login ID</label>
              <input type="text" id="staff-login-id" class="form-input" placeholder="e.g. CASHIER01" value="${currentStaff?.loginId || 'CASHIER01'}" required />
            </div>
            <div class="form-group">
              <label class="form-label">4-Digit POS MPIN</label>
              <input type="password" id="staff-mpin" class="form-input" placeholder="••••" maxlength="6" required />
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;margin-top:4px;" id="staff-submit-btn">
              Authorize Terminal Cashier
            </button>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(modalEl);

    // Event Listeners
    const closeBtn = document.getElementById('auth-modal-close-btn');
    closeBtn.onclick = () => modalEl.remove();

    const tabOwner = document.getElementById('tab-btn-owner');
    const tabStaff = document.getElementById('tab-btn-staff');
    const formOwner = document.getElementById('owner-login-form');
    const formStaff = document.getElementById('staff-login-form');

    tabOwner.onclick = () => {
      tabOwner.style.borderBottomColor = 'var(--primary-purple)';
      tabOwner.style.color = 'var(--primary-purple)';
      tabOwner.style.fontWeight = '600';
      tabStaff.style.borderBottomColor = 'transparent';
      tabStaff.style.color = 'var(--slate-500)';
      tabStaff.style.fontWeight = '500';
      formOwner.style.display = 'block';
      formStaff.style.display = 'none';
    };

    tabStaff.onclick = () => {
      tabStaff.style.borderBottomColor = 'var(--primary-purple)';
      tabStaff.style.color = 'var(--primary-purple)';
      tabStaff.style.fontWeight = '600';
      tabOwner.style.borderBottomColor = 'transparent';
      tabOwner.style.color = 'var(--slate-500)';
      tabOwner.style.fontWeight = '500';
      formStaff.style.display = 'block';
      formOwner.style.display = 'none';
    };

    // Owner Login Submit
    formOwner.onsubmit = async (e) => {
      e.preventDefault();
      const email = document.getElementById('owner-email').value.trim();
      const password = document.getElementById('owner-password').value;
      const btn = document.getElementById('owner-submit-btn');
      btn.disabled = true;
      btn.textContent = 'Authenticating...';

      try {
        const res = await global.apiService.login(email, password);
        if (res.ok) {
          global.Toast?.success('Authenticated successfully with Retail Next API');
          modalEl.remove();
          global.RetailNextHeader?.refresh();
        } else {
          global.Toast?.error(res.error || 'Authentication failed. Please check credentials.');
        }
      } catch (err) {
        global.Toast?.error(err.message);
      } finally {
        btn.disabled = false;
        btn.textContent = 'Authenticate Owner';
      }
    };

    // Staff Login Submit
    formStaff.onsubmit = async (e) => {
      e.preventDefault();
      const loginId = document.getElementById('staff-login-id').value.trim();
      const mpin = document.getElementById('staff-mpin').value.trim();
      const btn = document.getElementById('staff-submit-btn');
      btn.disabled = true;
      btn.textContent = 'Verifying MPIN...';

      try {
        const res = await global.apiService.staffLogin(loginId, mpin);
        if (res.ok) {
          global.Toast?.success(`Cashier session opened for ${global.apiService.staff?.name || loginId}`);
          modalEl.remove();
          global.RetailNextHeader?.refresh();
        } else {
          global.Toast?.error(res.error || 'Invalid Terminal ID or MPIN.');
        }
      } catch (err) {
        global.Toast?.error(err.message);
      } finally {
        btn.disabled = false;
        btn.textContent = 'Authorize Terminal Cashier';
      }
    };

    // Logout
    document.getElementById('auth-logout-btn').onclick = async () => {
      await global.apiService.logout();
      global.Toast?.info('Logged out from current session');
      modalEl.remove();
      if (global.RetailNextRouter) {
        global.RetailNextRouter.navigate('/login');
      } else {
        window.location.hash = '#/login';
      }
    };
  }

  global.AuthModal = {
    open: renderModal
  };
})(window);
