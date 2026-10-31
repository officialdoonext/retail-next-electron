/**
 * RetailNext — Session & Screen Lock Page
 * Submenu: File -> Session -> Lock Application, Switch User
 */

'use strict';

window.SessionPage = (() => {

  const USERS = [
    { id: 'usr-1', name: 'Ramesh Chandra', role: 'Store Admin', pin: '1234', avatar: 'RC' },
    { id: 'usr-2', name: 'Sunita Rao', role: 'Head Cashier', pin: '1111', avatar: 'SR' },
    { id: 'usr-3', name: 'Vikram Joshi', role: 'Shift Cashier', pin: '2222', avatar: 'VJ' },
    { id: 'usr-4', name: 'Kiran Kumar', role: 'Inventory Manager', pin: '3333', avatar: 'KK' }
  ];

  let currentUser = USERS[0];

  function getCurrentUser() {
    return currentUser;
  }

  function renderPage(outlet, mode = 'lock') {
    if (!outlet) return;
    outlet.innerHTML = '';
    outlet.className = 'page-container session-page';

    if (mode === 'lock' || mode === 'lock-app') {
      renderLockView(outlet);
    } else {
      renderSwitchView(outlet);
    }
  }

  function renderLockView(outlet) {
    const profile = window.CompanyPage ? window.CompanyPage.getProfile() : { tradeName: 'RetailNext Hypermarket' };

    outlet.innerHTML = `
      <div style="min-height:75vh;display:flex;align-items:center;justify-content:center;">
        <div class="auth-card" style="text-align:center;max-width:440px;">
          <div style="width:72px;height:72px;background:rgba(59,130,246,0.1);color:var(--color-brand);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>

          <h2 style="font-size:20px;margin:0 0 4px;font-weight:700;">Terminal Locked</h2>
          <div style="font-size:12px;color:var(--color-text-secondary);margin-bottom:16px;">${profile.tradeName}</div>

          <div style="padding:12px;background:var(--color-bg-app);border-radius:8px;border:1px solid var(--color-border);margin-bottom:16px;display:flex;align-items:center;gap:12px;text-align:left;">
            <div style="width:40px;height:40px;background:var(--color-brand);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;">
              ${currentUser.avatar}
            </div>
            <div>
              <div style="font-weight:600;font-size:13px;">${currentUser.name}</div>
              <div style="font-size:11px;color:var(--color-text-secondary);">${currentUser.role} · Active Shift</div>
            </div>
          </div>

          <form id="form-unlock">
            <div class="form-group" style="margin-bottom:14px;text-align:left;">
              <label>Enter Unlock PIN / Password</label>
              <input type="password" id="unlock-pin" class="pos-input font-mono" style="text-align:center;letter-spacing:4px;font-size:18px;" placeholder="••••" required autofocus />
            </div>

            <div id="unlock-error" class="auth-error-box" style="display:none;margin-bottom:12px;"></div>

            <button type="submit" class="btn btn--primary btn--lg" style="width:100%;margin-bottom:10px;">
              Unlock Terminal
            </button>
            <button type="button" class="btn btn--outline" id="btn-switch-user-modal" style="width:100%;">
              Switch Cashier / User
            </button>
          </form>
        </div>
      </div>
    `;

    const form = outlet.querySelector('#form-unlock');
    const pinInput = outlet.querySelector('#unlock-pin');
    const errBox = outlet.querySelector('#unlock-error');
    const switchBtn = outlet.querySelector('#btn-switch-user-modal');

    form.onsubmit = (e) => {
      e.preventDefault();
      const val = pinInput.value.trim();
      if (val === currentUser.pin || val === '1234') {
        window.RetailRouter.navigate('pos-billing');
      } else {
        errBox.textContent = 'Invalid PIN. Please try again.';
        errBox.style.display = 'block';
        pinInput.value = '';
        pinInput.focus();
      }
    };

    switchBtn.onclick = () => {
      renderSwitchView(outlet);
    };
  }

  function renderSwitchView(outlet) {
    outlet.innerHTML = `
      <div style="min-height:75vh;display:flex;align-items:center;justify-content:center;">
        <div class="auth-card" style="max-width:540px;">
          <div class="auth-header">
            <div class="auth-title">Switch Active User</div>
            <div class="auth-subtitle">Select an authorized staff member to take over this register</div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
            ${USERS.map(u => `
              <div class="user-switch-card ${u.id === currentUser.id ? 'active-user' : ''}" data-id="${u.id}" style="padding:14px;border:1px solid var(--color-border);border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:12px;transition:all 0.15s;${u.id === currentUser.id ? 'background:rgba(59,130,246,0.06);border-color:var(--color-brand);' : 'background:var(--color-bg-card);'}">
                <div style="width:40px;height:40px;background:${u.id === currentUser.id ? 'var(--color-brand)' : '#64748b'};color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;">
                  ${u.avatar}
                </div>
                <div>
                  <strong style="font-size:13px;display:block;">${u.name}</strong>
                  <span style="font-size:11px;color:var(--color-text-secondary);">${u.role}</span>
                </div>
              </div>
            `).join('')}
          </div>

          <form id="form-user-pin">
            <div class="form-group" style="margin-bottom:14px;">
              <label>Enter Selected User PIN (Default: 1234)</label>
              <input type="password" id="user-switch-pin" class="pos-input font-mono" style="text-align:center;letter-spacing:4px;font-size:18px;" placeholder="••••" required autofocus />
            </div>

            <div id="switch-error" class="auth-error-box" style="display:none;margin-bottom:12px;"></div>

            <div style="display:flex;gap:12px;">
              <button type="button" class="btn btn--outline" id="btn-cancel-switch" style="flex:1;">Cancel</button>
              <button type="submit" class="btn btn--primary" style="flex:1;">Switch Session</button>
            </div>
          </form>
        </div>
      </div>
    `;

    let selectedUserId = currentUser.id;

    outlet.querySelectorAll('.user-switch-card').forEach(card => {
      card.onclick = () => {
        outlet.querySelectorAll('.user-switch-card').forEach(c => {
          c.style.background = 'var(--color-bg-card)';
          c.style.borderColor = 'var(--color-border)';
        });
        card.style.background = 'rgba(59,130,246,0.06)';
        card.style.borderColor = 'var(--color-brand)';
        selectedUserId = card.getAttribute('data-id');
        outlet.querySelector('#user-switch-pin').focus();
      };
    });

    outlet.querySelector('#btn-cancel-switch').onclick = () => {
      window.RetailRouter.navigate('pos-billing');
    };

    outlet.querySelector('#form-user-pin').onsubmit = (e) => {
      e.preventDefault();
      const enteredPin = outlet.querySelector('#user-switch-pin').value.trim();
      const targetUser = USERS.find(u => u.id === selectedUserId);

      if (targetUser && (enteredPin === targetUser.pin || enteredPin === '1234')) {
        currentUser = targetUser;
        const statusCashier = document.getElementById('statusbar-text');
        if (statusCashier) {
          statusCashier.textContent = `Ready · Database connected · Cashier: ${currentUser.name} (${currentUser.role})`;
        }
        alert(`Session switched! Now logged in as: ${currentUser.name}`);
        window.RetailRouter.navigate('pos-billing');
      } else {
        const err = outlet.querySelector('#switch-error');
        err.textContent = 'Incorrect PIN for selected user.';
        err.style.display = 'block';
      }
    };
  }

  return {
    renderPage,
    getCurrentUser
  };
})();

