/**
 * Retail Next — Dedicated Full-Screen Login & Authentication Page
 * Matches architecture and authentication flow from retail-next-software/app/login/page.tsx
 * Supports:
 *   1. Sign In (Business Admin Email + Password) -> POST /api/auth/login
 *   2. Create Account (Business Name, Mobile, Email, Password) -> POST /api/auth/register
 *   3. Staff Login (Two-Step: Mobile Lookup -> MPIN Verification) -> POST /api/auth/staff-login
 */

'use strict';

(function(global) {

  let activeTab = 'login'; // 'login' | 'register' | 'staff'
  let staffStep = 'mobile'; // 'mobile' | 'mpin'
  let staffFoundName = '';
  let staffMobileNumber = '';
  let isSubmitting = false;
  let errorMessage = '';
  let successMessage = '';
  let showPassword = false;
  let showRegisterPassword = false;

  function render(container) {
    container.innerHTML = `
      <div class="login-view-container" style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at 50% 0%, #2e1065 0%, #0f172a 100%); padding: 24px; font-family: var(--font-sans);">
        
        <div class="login-card" style="width: 100%; max-width: 480px; background: #ffffff; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45); border: 1px solid var(--slate-200); overflow: hidden; animation: fadeIn 0.25s ease-out;">
          
          <!-- Brand Header -->
          <div style="background: linear-gradient(135deg, #5e2b9d 0%, #3b186b 100%); padding: 28px 24px 22px; text-align: center; color: #ffffff; position: relative;">
            <div style="width: 52px; height: 52px; margin: 0 auto 12px; background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 26px; box-shadow: 0 8px 16px rgba(0,0,0,0.15);">
              🛍️
            </div>
            <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">
              Retail Next
            </h1>
            <p style="margin: 4px 0 0; font-size: 12px; color: #e9d5ff;">
              Smart Enterprise Retail ERP & Ultra-Fast POS Platform
            </p>
            <div style="margin-top: 10px; display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: 9999px; background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.2); font-size: 10px; font-weight: 600; color: #f3e8ff;">
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #10b981;"></span>
              <span>API Gateway: retailnext.doonext.app</span>
            </div>
          </div>

          <!-- Tab Navigation Switcher -->
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; background: #f8fafc; border-bottom: 1px solid var(--slate-200); padding: 4px;">
            <button id="tab-btn-login" style="padding: 10px 8px; border: none; background: ${activeTab === 'login' ? '#ffffff' : 'transparent'}; color: ${activeTab === 'login' ? '#5e2b9d' : '#64748b'}; font-weight: ${activeTab === 'login' ? '700' : '600'}; font-size: 12px; border-radius: 10px; cursor: pointer; transition: all 0.15s; box-shadow: ${activeTab === 'login' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'};">
              Sign In
            </button>
            <button id="tab-btn-register" style="padding: 10px 8px; border: none; background: ${activeTab === 'register' ? '#ffffff' : 'transparent'}; color: ${activeTab === 'register' ? '#5e2b9d' : '#64748b'}; font-weight: ${activeTab === 'register' ? '700' : '600'}; font-size: 12px; border-radius: 10px; cursor: pointer; transition: all 0.15s; box-shadow: ${activeTab === 'register' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'};">
              Create Account
            </button>
            <button id="tab-btn-staff" style="padding: 10px 8px; border: none; background: ${activeTab === 'staff' ? '#ffffff' : 'transparent'}; color: ${activeTab === 'staff' ? '#5e2b9d' : '#64748b'}; font-weight: ${activeTab === 'staff' ? '700' : '600'}; font-size: 12px; border-radius: 10px; cursor: pointer; transition: all 0.15s; box-shadow: ${activeTab === 'staff' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'};">
              Staff Login
            </button>
          </div>

          <!-- Form Area -->
          <div style="padding: 24px;">
            
            <!-- Alert Messages -->
            ${errorMessage ? `
              <div style="padding: 12px 14px; border-radius: 10px; background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; font-size: 12px; margin-bottom: 16px; display: flex; align-items: flex-start; gap: 8px;">
                <span style="font-size: 14px;">⚠️</span>
                <span style="flex: 1; line-height: 1.4;">${errorMessage}</span>
              </div>
            ` : ''}

            ${successMessage ? `
              <div style="padding: 12px 14px; border-radius: 10px; background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 12px; margin-bottom: 16px; display: flex; align-items: flex-start; gap: 8px;">
                <span style="font-size: 14px;">✓</span>
                <span style="flex: 1; line-height: 1.4;">${successMessage}</span>
              </div>
            ` : ''}

            <!-- 1. SIGN IN TAB -->
            ${activeTab === 'login' ? `
              <form id="login-form" style="display: flex; flex-direction: column; gap: 14px;">
                <div class="form-group" style="margin: 0;">
                  <label class="form-label" style="font-size: 12px; font-weight: 600; color: var(--slate-700); margin-bottom: 6px; display: block;">
                    Email Address
                  </label>
                  <input type="email" id="login-email-input" class="form-control" placeholder="name@business.com" required style="width: 100%; height: 42px; border-radius: 10px; font-size: 13px;" />
                </div>

                <div class="form-group" style="margin: 0;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <label class="form-label" style="font-size: 12px; font-weight: 600; color: var(--slate-700); margin: 0;">
                      Password
                    </label>
                    <button type="button" id="toggle-login-pwd-btn" style="background: none; border: none; color: #5e2b9d; font-size: 11px; font-weight: 600; cursor: pointer;">
                      ${showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input type="${showPassword ? 'text' : 'password'}" id="login-password-input" class="form-control" placeholder="••••••••" required style="width: 100%; height: 42px; border-radius: 10px; font-size: 13px;" />
                </div>

                <button type="submit" class="btn btn-primary" id="login-submit-btn" style="margin-top: 8px; height: 44px; border-radius: 10px; font-size: 13px; font-weight: 700; background: #5e2b9d; display: flex; align-items: center; justify-content: center; gap: 8px;" ${isSubmitting ? 'disabled' : ''}>
                  ${isSubmitting ? '<span>⏳ Authenticating...</span>' : '<span>Sign In to Dashboard →</span>'}
                </button>
              </form>
            ` : ''}

            <!-- 2. CREATE ACCOUNT TAB -->
            ${activeTab === 'register' ? `
              <form id="register-form" style="display: flex; flex-direction: column; gap: 12px;">
                <div class="form-group" style="margin: 0;">
                  <label class="form-label" style="font-size: 11px; font-weight: 600; color: var(--slate-700); margin-bottom: 4px; display: block;">
                    Business Name
                  </label>
                  <input type="text" id="reg-business-name" class="form-control" placeholder="e.g. Apex Supermarket" required style="width: 100%; height: 38px; border-radius: 8px; font-size: 12px;" />
                </div>

                <div class="form-group" style="margin: 0;">
                  <label class="form-label" style="font-size: 11px; font-weight: 600; color: var(--slate-700); margin-bottom: 4px; display: block;">
                    10-Digit Mobile Number
                  </label>
                  <input type="tel" id="reg-mobile" class="form-control" placeholder="9876543210" maxlength="10" required style="width: 100%; height: 38px; border-radius: 8px; font-size: 12px;" />
                </div>

                <div class="form-group" style="margin: 0;">
                  <label class="form-label" style="font-size: 11px; font-weight: 600; color: var(--slate-700); margin-bottom: 4px; display: block;">
                    Email Address
                  </label>
                  <input type="email" id="reg-email" class="form-control" placeholder="owner@business.com" required style="width: 100%; height: 38px; border-radius: 8px; font-size: 12px;" />
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                  <div class="form-group" style="margin: 0;">
                    <label class="form-label" style="font-size: 11px; font-weight: 600; color: var(--slate-700); margin-bottom: 4px; display: block;">
                      Password
                    </label>
                    <input type="${showRegisterPassword ? 'text' : 'password'}" id="reg-password" class="form-control" placeholder="••••••••" required style="width: 100%; height: 38px; border-radius: 8px; font-size: 12px;" />
                  </div>
                  <div class="form-group" style="margin: 0;">
                    <label class="form-label" style="font-size: 11px; font-weight: 600; color: var(--slate-700); margin-bottom: 4px; display: block;">
                      Confirm Password
                    </label>
                    <input type="${showRegisterPassword ? 'text' : 'password'}" id="reg-confirm-password" class="form-control" placeholder="••••••••" required style="width: 100%; height: 38px; border-radius: 8px; font-size: 12px;" />
                  </div>
                </div>

                <div style="display: flex; align-items: center; justify-content: flex-end;">
                  <button type="button" id="toggle-reg-pwd-btn" style="background: none; border: none; color: #5e2b9d; font-size: 11px; font-weight: 600; cursor: pointer;">
                    ${showRegisterPassword ? 'Hide Passwords' : 'Show Passwords'}
                  </button>
                </div>

                <button type="submit" class="btn btn-primary" id="register-submit-btn" style="margin-top: 6px; height: 42px; border-radius: 10px; font-size: 12px; font-weight: 700; background: #5e2b9d; display: flex; align-items: center; justify-content: center; gap: 8px;" ${isSubmitting ? 'disabled' : ''}>
                  ${isSubmitting ? '<span>⏳ Creating Account...</span>' : '<span>Create Account & Business →</span>'}
                </button>
              </form>
            ` : ''}

            <!-- 3. STAFF LOGIN TAB -->
            ${activeTab === 'staff' ? `
              <div style="display: flex; flex-direction: column; gap: 14px;">
                
                ${staffStep === 'mobile' ? `
                  <form id="staff-mobile-form" style="display: flex; flex-direction: column; gap: 14px;">
                    <div class="form-group" style="margin: 0;">
                      <label class="form-label" style="font-size: 12px; font-weight: 600; color: var(--slate-700); margin-bottom: 6px; display: block;">
                        Registered Staff Mobile Number
                      </label>
                      <input type="tel" id="staff-mobile-input" class="form-control" placeholder="Enter 10-digit mobile" maxlength="10" value="${staffMobileNumber}" required style="width: 100%; height: 42px; border-radius: 10px; font-size: 13px;" />
                      <span style="font-size: 11px; color: var(--slate-500); margin-top: 4px; display: block;">
                        Your terminal cashier access registered by your store manager.
                      </span>
                    </div>

                    <button type="submit" class="btn btn-primary" id="staff-mobile-btn" style="margin-top: 4px; height: 42px; border-radius: 10px; font-size: 13px; font-weight: 700; background: #5e2b9d; display: flex; align-items: center; justify-content: center; gap: 8px;" ${isSubmitting ? 'disabled' : ''}>
                      ${isSubmitting ? '<span>⏳ Verifying Mobile...</span>' : '<span>Check Mobile Number →</span>'}
                    </button>
                  </form>
                ` : `
                  <form id="staff-mpin-form" style="display: flex; flex-direction: column; gap: 14px;">
                    <div style="padding: 10px 12px; border-radius: 10px; background: #f8fafc; border: 1px solid var(--slate-200); display: flex; align-items: center; justify-content: space-between;">
                      <div>
                        <div style="font-size: 11px; color: var(--slate-500);">Staff Member:</div>
                        <div style="font-size: 13px; font-weight: 700; color: #5e2b9d;">${staffFoundName}</div>
                      </div>
                      <button type="button" id="change-staff-mobile-btn" style="background: none; border: none; color: #2563eb; font-size: 11px; font-weight: 600; cursor: pointer;">
                        Change Number
                      </button>
                    </div>

                    <div class="form-group" style="margin: 0;">
                      <label class="form-label" style="font-size: 12px; font-weight: 600; color: var(--slate-700); margin-bottom: 6px; display: block;">
                        Enter 4-Digit Security MPIN
                      </label>
                      <input type="password" id="staff-mpin-input" class="form-control" placeholder="••••" maxlength="6" autofocus required style="width: 100%; height: 46px; border-radius: 10px; font-size: 18px; text-align: center; letter-spacing: 6px; font-family: var(--font-mono);" />
                    </div>

                    <button type="submit" class="btn btn-primary" id="staff-mpin-btn" style="margin-top: 4px; height: 42px; border-radius: 10px; font-size: 13px; font-weight: 700; background: #5e2b9d; display: flex; align-items: center; justify-content: center; gap: 8px;" ${isSubmitting ? 'disabled' : ''}>
                      ${isSubmitting ? '<span>⏳ Verifying MPIN...</span>' : '<span>Authenticate Staff Session →</span>'}
                    </button>
                  </form>
                `}

              </div>
            ` : ''}

          </div>

          <!-- Card Footer -->
          <div style="padding: 12px 24px; background: #f8fafc; border-top: 1px solid var(--slate-200); text-align: center; font-size: 11px; color: var(--slate-500);">
            Protected by 256-bit SSL encryption. All transactions synced to Cloud ERP.
          </div>

        </div>

      </div>
    `;

    bindEvents(container);
  }

  function bindEvents(container) {
    // Tab switching
    const tabLogin = container.querySelector('#tab-btn-login');
    const tabReg = container.querySelector('#tab-btn-register');
    const tabStaff = container.querySelector('#tab-btn-staff');

    if (tabLogin) {
      tabLogin.onclick = () => {
        activeTab = 'login';
        errorMessage = '';
        successMessage = '';
        render(container);
      };
    }
    if (tabReg) {
      tabReg.onclick = () => {
        activeTab = 'register';
        errorMessage = '';
        successMessage = '';
        render(container);
      };
    }
    if (tabStaff) {
      tabStaff.onclick = () => {
        activeTab = 'staff';
        errorMessage = '';
        successMessage = '';
        render(container);
      };
    }

    // Toggle password views
    const toggleLoginPwd = container.querySelector('#toggle-login-pwd-btn');
    if (toggleLoginPwd) {
      toggleLoginPwd.onclick = () => {
        showPassword = !showPassword;
        render(container);
      };
    }

    const toggleRegPwd = container.querySelector('#toggle-reg-pwd-btn');
    if (toggleRegPwd) {
      toggleRegPwd.onclick = () => {
        showRegisterPassword = !showRegisterPassword;
        render(container);
      };
    }

    // 1. Handle Sign In
    const loginForm = container.querySelector('#login-form');
    if (loginForm) {
      loginForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = container.querySelector('#login-email-input').value.trim();
        const password = container.querySelector('#login-password-input').value.trim();

        if (!email || !password) {
          errorMessage = 'Please enter both email address and password.';
          render(container);
          return;
        }

        isSubmitting = true;
        errorMessage = '';
        successMessage = '';
        render(container);

        try {
          const res = await global.apiService.login(email, password);
          if (!res.ok || res.data?.success === false) {
            errorMessage = res.data?.error || res.error || 'Authentication failed. Please verify your credentials.';
            isSubmitting = false;
            render(container);
          } else {
            successMessage = 'Authenticated successfully! Redirecting to dashboard...';
            isSubmitting = false;
            render(container);

            setTimeout(() => {
              finishAuthSuccess();
            }, 500);
          }
        } catch (err) {
          errorMessage = 'Network error connecting to authentication server.';
          isSubmitting = false;
          render(container);
        }
      };
    }

    // 2. Handle Register
    const regForm = container.querySelector('#register-form');
    if (regForm) {
      regForm.onsubmit = async (e) => {
        e.preventDefault();
        const businessName = container.querySelector('#reg-business-name').value.trim();
        const mobile = container.querySelector('#reg-mobile').value.replace(/\D/g, '');
        const email = container.querySelector('#reg-email').value.trim();
        const password = container.querySelector('#reg-password').value;
        const confirmPassword = container.querySelector('#reg-confirm-password').value;

        if (!businessName) {
          errorMessage = 'Business name is required.';
          render(container);
          return;
        }
        if (mobile.length < 10) {
          errorMessage = 'Please enter a valid 10-digit mobile number.';
          render(container);
          return;
        }
        if (!email.includes('@')) {
          errorMessage = 'Please enter a valid email address.';
          render(container);
          return;
        }
        if (password.length < 6) {
          errorMessage = 'Password must be at least 6 characters.';
          render(container);
          return;
        }
        if (password !== confirmPassword) {
          errorMessage = 'Passwords do not match.';
          render(container);
          return;
        }

        isSubmitting = true;
        errorMessage = '';
        successMessage = '';
        render(container);

        try {
          const res = await global.apiService.register({
            businessName,
            mobileNumber: mobile,
            email,
            password,
            confirmPassword
          });

          if (!res.ok || res.data?.success === false) {
            errorMessage = res.data?.error || res.error || 'Account creation failed. Please try again.';
            isSubmitting = false;
            render(container);
          } else {
            successMessage = 'Account created successfully! Loading workspace...';
            isSubmitting = false;
            render(container);

            setTimeout(() => {
              finishAuthSuccess();
            }, 600);
          }
        } catch (err) {
          errorMessage = 'Network error connecting to registration server.';
          isSubmitting = false;
          render(container);
        }
      };
    }

    // 3. Handle Staff Mobile Step
    const staffMobileForm = container.querySelector('#staff-mobile-form');
    if (staffMobileForm) {
      staffMobileForm.onsubmit = async (e) => {
        e.preventDefault();
        const mobile = container.querySelector('#staff-mobile-input').value.replace(/\D/g, '');
        if (mobile.length < 10) {
          errorMessage = 'Please enter a valid 10-digit mobile number.';
          render(container);
          return;
        }

        isSubmitting = true;
        errorMessage = '';
        successMessage = '';
        render(container);

        try {
          const res = await global.apiService.staffCheckMobile(mobile);
          if (!res.ok || res.data?.success === false) {
            errorMessage = res.data?.error || res.error || 'No active staff member found with this mobile number.';
            isSubmitting = false;
            render(container);
          } else {
            staffMobileNumber = mobile;
            staffFoundName = res.data.staffName || 'Staff Member';
            staffStep = 'mpin';
            isSubmitting = false;
            successMessage = `Staff member verified: ${staffFoundName}. Please enter your Security MPIN.`;
            render(container);
          }
        } catch (err) {
          errorMessage = 'Network error verifying staff mobile.';
          isSubmitting = false;
          render(container);
        }
      };
    }

    // 4. Handle Staff MPIN Step
    const staffMpinForm = container.querySelector('#staff-mpin-form');
    if (staffMpinForm) {
      staffMpinForm.onsubmit = async (e) => {
        e.preventDefault();
        const mpin = container.querySelector('#staff-mpin-input').value.trim();
        if (mpin.length < 4) {
          errorMessage = 'Please enter your 4-digit or 6-digit MPIN.';
          render(container);
          return;
        }

        isSubmitting = true;
        errorMessage = '';
        successMessage = '';
        render(container);

        try {
          const res = await global.apiService.staffVerifyMpin(staffMobileNumber, mpin);
          if (!res.ok || res.data?.success === false) {
            errorMessage = res.data?.error || res.error || 'Invalid Security MPIN. Please try again.';
            isSubmitting = false;
            render(container);
          } else {
            successMessage = 'Staff authenticated successfully! Loading terminal...';
            isSubmitting = false;
            render(container);

            setTimeout(() => {
              finishAuthSuccess();
            }, 500);
          }
        } catch (err) {
          errorMessage = 'Network error verifying MPIN.';
          isSubmitting = false;
          render(container);
        }
      };

      const changeMobileBtn = container.querySelector('#change-staff-mobile-btn');
      if (changeMobileBtn) {
        changeMobileBtn.onclick = () => {
          staffStep = 'mobile';
          errorMessage = '';
          successMessage = '';
          render(container);
        };
      }
    }
  }

  function finishAuthSuccess() {
    // Show application chrome
    const sidebar = document.getElementById('app-sidebar');
    const header = document.getElementById('app-header');
    const statusbar = document.getElementById('app-statusbar');

    if (sidebar) sidebar.style.display = 'flex';
    if (header) header.style.display = 'flex';
    if (statusbar) statusbar.style.display = 'flex';

    // Refresh header bar
    if (global.RetailNextHeader && typeof global.RetailNextHeader.render === 'function') {
      global.RetailNextHeader.render();
    }

    // Refresh status bar
    const cashierEl = document.getElementById('statusbar-cashier');
    const storeEl = document.getElementById('statusbar-store');
    const staffName = localStorage.getItem('staff_name') || global.apiService?.user?.name || 'Administrator';
    const storeName = global.apiService?.activeStore?.name || 'Main Retail Store';
    if (cashierEl) cashierEl.textContent = staffName;
    if (storeEl) storeEl.textContent = storeName;

    // Navigate to dashboard
    if (global.RetailNextRouter) {
      global.RetailNextRouter.navigate('/dashboard');
    } else {
      window.location.hash = '#/dashboard';
    }
  }

  global.LoginPage = {
    render
  };

})(window);

