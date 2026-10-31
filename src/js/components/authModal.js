/**
 * RetailNext — Authentication & High-Security Tenant Verification View
 *
 * Implements:
 *   1. Supabase Email & Password Login and Sign Up.
 *   2. Tenant details registration (Name, Mobile, City, Address) with status='inactive', expiry_date=null.
 *   3. Strict Security Gatekeeper:
 *      - Checks status === 'active'
 *      - Checks expiry_date != null AND expiry_date >= today
 *      - If not satisfied -> BLOCKS entry and displays Contact Administrator screen.
 *
 * Note: Cloud credentials (Supabase URL & Anon Key) are embedded directly in code/config
 * and are never exposed or requested in the user-facing modal.
 */

'use strict';

window.AuthModal = (() => {

  let containerEl = null;
  let currentView = 'LOGIN'; // 'LOGIN' | 'SIGNUP' | 'TENANT_REG' | 'LOCKED'
  let lockReason = '';
  let pendingUser = null;
  let onAuthenticatedCallback = null;

  function init(callback) {
    onAuthenticatedCallback = callback;

    let el = document.getElementById('auth-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'auth-overlay';
      el.className = 'auth-overlay';
      document.body.appendChild(el);
    }
    containerEl = el;

    // Check existing session
    checkSession();
  }

  async function checkSession() {
    const service = window.SupabaseService;
    const session = service ? service.getSession() : null;
    const user = service ? service.getUser() : null;

    if (!session || !user) {
      renderView('LOGIN');
      show();
      return;
    }

    // User is logged in -> verify tenant
    try {
      showLoading('Verifying store subscription & security clearance...');
      const tenant = await service.fetchUserTenant(user.id);

      if (!tenant) {
        pendingUser = user;
        renderView('TENANT_REG');
        show();
        return;
      }

      service.setActiveTenant(tenant);

      // Verify strict security conditions
      const verification = service.verifyTenantAccess(tenant);
      if (!verification.allowed) {
        lockReason = verification.message;
        renderView('LOCKED');
        show();
        return;
      }

      // Security check passed!
      hide();
      if (onAuthenticatedCallback) {
        onAuthenticatedCallback(tenant, user);
      }
    } catch (err) {
      console.warn('[AuthModal] Verification check error:', err);
      // If offline, check if local cached tenant is active and unexpired
      const cachedTenant = service.getActiveTenant();
      if (cachedTenant) {
        const verification = service.verifyTenantAccess(cachedTenant);
        if (verification.allowed) {
          hide();
          if (onAuthenticatedCallback) onAuthenticatedCallback(cachedTenant, user);
          return;
        } else {
          lockReason = verification.message;
          renderView('LOCKED');
          show();
          return;
        }
      }
      renderView('LOGIN');
      show();
    }
  }

  function show() {
    if (containerEl) containerEl.style.display = 'flex';
  }

  function hide() {
    if (containerEl) containerEl.style.display = 'none';
  }

  function showLoading(msg = 'Authenticating...') {
    if (!containerEl) return;
    containerEl.innerHTML = `
      <div class="auth-card" style="text-align:center;padding:40px 24px;">
        <div class="spinner"></div>
        <div style="font-size:14px;font-weight:600;margin-top:16px;color:#0f172a;">${msg}</div>
        <div style="font-size:12px;color:#64748b;margin-top:4px;">Connecting to Cloud & verifying credentials</div>
      </div>
    `;
    show();
  }

  function renderView(viewName) {
    currentView = viewName;
    if (!containerEl) return;

    if (viewName === 'LOGIN') {
      renderLoginView();
    } else if (viewName === 'SIGNUP') {
      renderSignUpView();
    } else if (viewName === 'TENANT_REG') {
      renderTenantRegView();
    } else if (viewName === 'LOCKED') {
      renderLockedView();
    }
  }

  // ─── 1. Login View ────────────────────────────────────────────────────────
  function renderLoginView() {
    containerEl.innerHTML = `
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-brand">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span>RetailNext</span>
          </div>
          <div class="auth-title">Welcome Back</div>
          <div class="auth-subtitle">Sign in to your retail store account</div>
        </div>

        <form id="auth-login-form">
          <div class="form-group" style="margin-bottom:14px;">
            <label>Email Address</label>
            <input type="email" id="auth-email" class="pos-input" required placeholder="store.owner@example.com" />
          </div>

          <div class="form-group" style="margin-bottom:18px;">
            <label>Password</label>
            <input type="password" id="auth-password" class="pos-input" required placeholder="••••••••" />
          </div>

          <div id="auth-error-msg" class="auth-error-box" style="display:none;"></div>

          <button type="submit" class="btn btn--primary btn--lg" style="width:100%;margin-bottom:12px;" id="auth-submit-btn">
            Sign In to Store
          </button>
        </form>

        <div class="auth-footer-links">
          <span>Don't have an account? <a href="#" id="link-goto-signup">Create Account</a></span>
        </div>
      </div>
    `;

    containerEl.querySelector('#link-goto-signup').onclick = (e) => {
      e.preventDefault();
      renderView('SIGNUP');
    };

    const form = containerEl.querySelector('#auth-login-form');
    form.onsubmit = async (e) => {
      e.preventDefault();
      const email = containerEl.querySelector('#auth-email').value;
      const pass = containerEl.querySelector('#auth-password').value;
      const errBox = containerEl.querySelector('#auth-error-msg');
      const submitBtn = containerEl.querySelector('#auth-submit-btn');

      errBox.style.display = 'none';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Verifying...';

      try {
        await window.SupabaseService.signIn(email, pass);
        await checkSession();
      } catch (err) {
        errBox.textContent = err.message || 'Login failed. Please verify email and password.';
        errBox.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In to Store';
      }
    };
  }

  // ─── 2. Sign Up View (Create Account) ─────────────────────────────────────
  function renderSignUpView() {
    containerEl.innerHTML = `
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-brand">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span>RetailNext</span>
          </div>
          <div class="auth-title">Create Store Account</div>
          <div class="auth-subtitle">Register new login for RetailNext</div>
        </div>

        <form id="auth-signup-form">
          <div class="form-group" style="margin-bottom:12px;">
            <label>Email Address</label>
            <input type="email" id="signup-email" class="pos-input" required placeholder="store.owner@example.com" />
          </div>

          <div class="form-group" style="margin-bottom:12px;">
            <label>Password (Min. 6 chars)</label>
            <input type="password" id="signup-password" class="pos-input" required minlength="6" placeholder="••••••••" />
          </div>

          <div class="form-group" style="margin-bottom:16px;">
            <label>Confirm Password</label>
            <input type="password" id="signup-confirm" class="pos-input" required minlength="6" placeholder="••••••••" />
          </div>

          <div id="signup-error-msg" class="auth-error-box" style="display:none;"></div>

          <button type="submit" class="btn btn--primary btn--lg" style="width:100%;margin-bottom:12px;" id="signup-submit-btn">
            Create Account & Continue
          </button>
        </form>

        <div class="auth-footer-links">
          <span>Already have an account? <a href="#" id="link-goto-login">Sign In</a></span>
        </div>
      </div>
    `;

    containerEl.querySelector('#link-goto-login').onclick = (e) => {
      e.preventDefault();
      renderView('LOGIN');
    };

    const form = containerEl.querySelector('#auth-signup-form');
    form.onsubmit = async (e) => {
      e.preventDefault();
      const email = containerEl.querySelector('#signup-email').value;
      const pass = containerEl.querySelector('#signup-password').value;
      const confirm = containerEl.querySelector('#signup-confirm').value;
      const errBox = containerEl.querySelector('#signup-error-msg');
      const submitBtn = containerEl.querySelector('#signup-submit-btn');

      if (pass !== confirm) {
        errBox.textContent = 'Passwords do not match.';
        errBox.style.display = 'block';
        return;
      }

      errBox.style.display = 'none';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating Account...';

      try {
        const res = await window.SupabaseService.signUp(email, pass);
        pendingUser = res.user || (res.session && res.session.user) || res;

        // Attempt automatic sign-in if token was not in signup response
        if (!window.SupabaseService.getSession()?.access_token) {
          await window.SupabaseService.signIn(email, pass).catch(() => {});
        }

        renderView('TENANT_REG');
      } catch (err) {
        console.error('[AuthModal] Signup error:', err);
        errBox.textContent = err.message || 'Failed to create account.';
        errBox.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account & Continue';
      }
    };
  }

  // ─── 3. Tenant Registration View ──────────────────────────────────────────
  /**
   * Prompt for Tenant Details:
   *   - Name
   *   - Mobile number
   *   - City
   *   - Full Address
   * On save: status = 'inactive', expiry_date = null
   */
  function renderTenantRegView() {
    containerEl.innerHTML = `
      <div class="auth-card" style="max-width:480px;">
        <div class="auth-header">
          <div class="auth-brand">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>Store Registration</span>
          </div>
          <div class="auth-title">Complete Tenant Setup</div>
          <div class="auth-subtitle">Provide your store details to finalize setup</div>
        </div>

        <form id="tenant-reg-form">
          <div class="form-group" style="margin-bottom:12px;">
            <label>Store / Business Name <span class="text-error">*</span></label>
            <input type="text" id="tr-name" class="pos-input" required placeholder="e.g. Hyderabad Supermart" />
          </div>

          <div class="form-group" style="margin-bottom:12px;">
            <label>Mobile Number <span class="text-error">*</span></label>
            <input type="text" id="tr-mobile" class="pos-input" required placeholder="10-digit mobile number" />
          </div>

          <div class="form-group" style="margin-bottom:12px;">
            <label>City <span class="text-error">*</span></label>
            <input type="text" id="tr-city" class="pos-input" required placeholder="e.g. Hyderabad" />
          </div>

          <div class="form-group" style="margin-bottom:16px;">
            <label>Full Address <span class="text-error">*</span></label>
            <textarea id="tr-address" class="pos-input" rows="2" required placeholder="Shop No, Street, Landmark, Pincode"></textarea>
          </div>

          <div class="security-info-box">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>Once saved, your account will be marked <strong>Inactive</strong> pending administrator verification.</span>
          </div>

          <div id="tr-error-msg" class="auth-error-box" style="display:none;margin-top:10px;"></div>

          <button type="submit" class="btn btn--primary btn--lg" style="width:100%;margin-top:14px;" id="tr-submit-btn">
            Save Tenant Details
          </button>
        </form>
      </div>
    `;

    const form = containerEl.querySelector('#tenant-reg-form');
    form.onsubmit = async (e) => {
      e.preventDefault();
      const name = containerEl.querySelector('#tr-name').value;
      const mobile = containerEl.querySelector('#tr-mobile').value;
      const city = containerEl.querySelector('#tr-city').value;
      const address = containerEl.querySelector('#tr-address').value;
      const errBox = containerEl.querySelector('#tr-error-msg');
      const submitBtn = containerEl.querySelector('#tr-submit-btn');

      errBox.style.display = 'none';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving Store Details...';

      try {
        let user = pendingUser || window.SupabaseService.getUser();
        if (!user || !user.id) {
          const sess = window.SupabaseService.getSession();
          if (sess && sess.user) user = sess.user;
        }

        if (!user || !user.id) {
          throw new Error('User account details not found. Please return to login and sign in.');
        }

        const tenant = await window.SupabaseService.registerTenant(user, {
          name,
          mobile,
          city,
          address
        });

        // Newly created tenants are inactive with expiry_date=null
        lockReason = 'Your store registration has been recorded successfully. Your account is currently INACTIVE. Please contact the administrator to activate your subscription and license.';
        renderView('LOCKED');
      } catch (err) {
        errBox.textContent = err.message || 'Failed to save store details.';
        errBox.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Tenant Details';
      }
    };
  }

  // ─── 4. High-Security Locked View (Contact Administrator Screen) ──────────
  /**
   * Shown when:
   *   - status !== 'active' OR
   *   - expiry_date is null OR
   *   - expiry_date < today
   */
  function renderLockedView() {
    const tenant = window.SupabaseService.getActiveTenant() || {};
    const user = window.SupabaseService.getUser() || {};

    containerEl.innerHTML = `
      <div class="auth-card" style="max-width:520px;text-align:center;">
        <div class="lock-shield-icon">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#ef4444" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>

        <h2 style="font-size:20px;font-weight:700;color:#0f172a;margin-top:12px;">Access Restricted</h2>
        <div style="font-size:13px;color:#ef4444;font-weight:600;margin-top:6px;">
          ${escapeHtml(lockReason || 'Tenant status is Inactive or subscription has expired.')}
        </div>

        <div class="tenant-details-card" style="margin-top:16px;text-align:left;">
          <div class="tenant-detail-row">
            <span class="detail-label">Store Name:</span>
            <strong class="detail-val">${escapeHtml(tenant.name || 'Store Account')}</strong>
          </div>
          <div class="tenant-detail-row">
            <span class="detail-label">Account Status:</span>
            <span class="status-chip status-chip--${tenant.status === 'active' ? 'success' : 'warning'}">
              ${escapeHtml(tenant.status || 'inactive')}
            </span>
          </div>
          <div class="tenant-detail-row">
            <span class="detail-label">Expiry Date:</span>
            <span class="font-mono text-secondary">${tenant.expiry_date ? new Date(tenant.expiry_date).toLocaleDateString() : 'Not Assigned (Null)'}</span>
          </div>
          <div class="tenant-detail-row">
            <span class="detail-label">Tenant ID:</span>
            <code class="tenant-id-code">${escapeHtml(tenant.id || 'Pending')}</code>
          </div>
          <div class="tenant-detail-row">
            <span class="detail-label">Registered Email:</span>
            <span>${escapeHtml(user.email || '—')}</span>
          </div>
        </div>

        <div style="margin-top:20px;padding:12px;background:#fef2f2;border:1px solid #fee2e2;border-radius:6px;font-size:12px;color:#991b1b;line-height:1.5;">
          <strong>Action Required:</strong> Please contact your system administrator with your <strong>Tenant ID</strong> above to activate your store subscription.
        </div>

        <div style="margin-top:20px;display:flex;gap:12px;justify-content:center;">
          <button class="btn btn--outline" id="lock-btn-refresh">Check Activation Status</button>
          <button class="btn btn--danger" id="lock-btn-logout">Sign Out</button>
        </div>
      </div>
    `;

    containerEl.querySelector('#lock-btn-refresh').onclick = async () => {
      await checkSession();
    };

    containerEl.querySelector('#lock-btn-logout').onclick = async () => {
      await window.SupabaseService.signOut();
      renderView('LOGIN');
    };
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  return {
    init,
    checkSession,
    show,
    hide,
    renderView
  };
})();

