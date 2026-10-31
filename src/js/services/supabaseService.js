/**
 * RetailNext — Supabase Client & Multi-Tenant Authentication Service
 * Communicates directly with Supabase Cloud Auth & REST APIs.
 * Supports online authentication, tenant lookup, and strict security validation.
 */

'use strict';

window.SupabaseService = (() => {

  const STORAGE_KEY_CONFIG = 'retailnext_supabase_config';
  const STORAGE_KEY_SESSION = 'retailnext_auth_session';
  const STORAGE_KEY_TENANT = 'retailnext_active_tenant';

  // In-memory state with live embedded code configuration
  let config = {
    url: (window.RETAILNEXT_CONFIG && window.RETAILNEXT_CONFIG.supabaseUrl) ? window.RETAILNEXT_CONFIG.supabaseUrl.trim().replace(/\/$/, '') : '',
    anonKey: (window.RETAILNEXT_CONFIG && window.RETAILNEXT_CONFIG.supabaseAnonKey) ? window.RETAILNEXT_CONFIG.supabaseAnonKey.trim() : '',
    serviceKey: (window.RETAILNEXT_CONFIG && window.RETAILNEXT_CONFIG.serviceKey) ? window.RETAILNEXT_CONFIG.serviceKey.trim() : ''
  };

  let currentSession = null;
  let currentTenant = null;

  // Initialize from live code config, native Electron store, or localStorage
  async function init() {
    try {
      if (window.RETAILNEXT_CONFIG && window.RETAILNEXT_CONFIG.supabaseUrl) {
        config.url = window.RETAILNEXT_CONFIG.supabaseUrl.trim().replace(/\/$/, '');
        config.anonKey = (window.RETAILNEXT_CONFIG.supabaseAnonKey || '').trim();
        config.serviceKey = (window.RETAILNEXT_CONFIG.serviceKey || '').trim();
      }

      if ((!config.url || !config.anonKey) && window.retailAPI && window.retailAPI.getConfig) {
        const res = await window.retailAPI.getConfig();
        if (res && res.success && res.data) {
          if (res.data.supabaseUrl) config.url = res.data.supabaseUrl.trim().replace(/\/$/, '');
          if (res.data.supabaseAnonKey) config.anonKey = res.data.supabaseAnonKey.trim();
        }
      }

      const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (stored && (!config.url || !config.anonKey)) {
        const parsed = JSON.parse(stored);
        if (parsed.url) config.url = parsed.url;
        if (parsed.anonKey) config.anonKey = parsed.anonKey;
      }

      const sessionStored = localStorage.getItem(STORAGE_KEY_SESSION);
      if (sessionStored) {
        currentSession = JSON.parse(sessionStored);
      }
      const tenantStored = localStorage.getItem(STORAGE_KEY_TENANT);
      if (tenantStored) {
        currentTenant = JSON.parse(tenantStored);
      }
    } catch (e) {
      console.warn('[SupabaseService] init parse warning:', e);
    }
  }

  init();

  function setCredentials(url, anonKey) {
    config.url = (url || '').trim().replace(/\/$/, '');
    config.anonKey = (anonKey || '').trim();
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));

    if (window.retailAPI && window.retailAPI.saveConfig) {
      window.retailAPI.saveConfig({
        supabaseUrl: config.url,
        supabaseAnonKey: config.anonKey
      }).catch(err => console.warn('[SupabaseService] Could not persist to config.json:', err));
    }
  }

  function getCredentials() {
    return { ...config };
  }

  function isConfigured() {
    return Boolean(config.url && config.anonKey);
  }

  // ─── Direct REST / Auth Fetch Helper ─────────────────────────────────────
  async function apiFetch(endpoint, options = {}) {
    if (!isConfigured()) {
      throw new Error('Supabase URL and Anon Key are not yet configured in code.');
    }

    const headers = {
      'apikey': config.anonKey,
      'Content-Type': 'application/json'
    };

    if (currentSession && currentSession.access_token) {
      headers['Authorization'] = `Bearer ${currentSession.access_token}`;
    }

    // Explicit options.headers (like serviceKey override) ALWAYS take precedence
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    const fullUrl = `${config.url}${endpoint}`;

    // 1. Prefer Electron Main Process IPC bridge (bypasses browser CSP/CORS and sandboxing)
    if (window.retailAPI && typeof window.retailAPI.supabaseRequest === 'function') {
      try {
        const ipcRes = await window.retailAPI.supabaseRequest({
          url: fullUrl,
          options: {
            method: options.method || 'GET',
            headers,
            body: options.body
          }
        });

        if (ipcRes) {
          if (!ipcRes.ok) {
            const errorMsg = ipcRes.data && (ipcRes.data.msg || ipcRes.data.message || ipcRes.data.error_description || ipcRes.data.error)
              ? (ipcRes.data.msg || ipcRes.data.message || ipcRes.data.error_description || ipcRes.data.error)
              : (ipcRes.error || `HTTP error ${ipcRes.status}`);
            throw new Error(errorMsg);
          }
          return ipcRes.data;
        }
      } catch (ipcErr) {
        if (ipcErr.message && !ipcErr.message.includes('IPC') && !ipcErr.message.includes('fetch')) {
          throw ipcErr;
        }
        console.warn('[SupabaseService] IPC request failed, trying browser fetch fallback:', ipcErr);
      }
    }

    // 2. Direct browser fetch fallback
    try {
      const res = await fetch(fullUrl, {
        ...options,
        headers
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const errorMsg = data && (data.msg || data.message || data.error_description || data.error)
          ? (data.msg || data.message || data.error_description || data.error)
          : `HTTP error ${res.status}`;
        throw new Error(errorMsg);
      }

      return data;
    } catch (err) {
      console.error('[SupabaseService] apiFetch error:', err);
      if (err.name === 'TypeError' && err.message.toLowerCase().includes('fetch')) {
        if (!navigator.onLine) {
          throw new Error('Network unavailable. You are currently offline.');
        } else {
          throw new Error(`Unable to reach Supabase cloud (${config.url}). Please check your connection or project status.`);
        }
      }
      throw err;
    }
  }

  // ─── 1. Authentication: Sign Up (Create Account) ──────────────────────────
  async function signUp(email, password) {
    const payload = {
      email: email.trim(),
      password: password
    };

    const res = await apiFetch('/auth/v1/signup', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (res && (res.session || res.access_token)) {
      currentSession = res.session || res;
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(currentSession));
    } else if (res && (res.id || (res.user && res.user.id))) {
      currentSession = { user: res.user || res };
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(currentSession));
    }

    return res;
  }

  // ─── 2. Authentication: Sign In (Login) ───────────────────────────────────
  async function signIn(email, password) {
    const payload = {
      email: email.trim(),
      password: password
    };

    const res = await apiFetch('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (res && res.access_token) {
      currentSession = res;
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(currentSession));
    }

    return res;
  }

  // ─── 3. Sign Out ──────────────────────────────────────────────────────────
  async function signOut() {
    try {
      if (isConfigured() && currentSession && currentSession.access_token) {
        await apiFetch('/auth/v1/logout', { method: 'POST' }).catch(() => {});
      }
    } finally {
      currentSession = null;
      currentTenant = null;
      localStorage.removeItem(STORAGE_KEY_SESSION);
      localStorage.removeItem(STORAGE_KEY_TENANT);
    }
  }

  // ─── 4. Query Tenant Details for Logged In User ───────────────────────────
  async function fetchUserTenant(userId) {
    const authHeaders = {};
    if (config.serviceKey) {
      authHeaders['apikey'] = config.serviceKey;
      authHeaders['Authorization'] = `Bearer ${config.serviceKey}`;
    }

    // Queries tenant_users joined with tenants table
    const endpoint = `/rest/v1/tenant_users?id=eq.${userId}&select=*,tenants(*)`;
    const rows = await apiFetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...authHeaders
      }
    });

    if (rows && rows.length > 0 && rows[0].tenants) {
      return rows[0].tenants;
    }
    return null;
  }

  // ─── 5. Save New Tenant Registration ──────────────────────────────────────
  /**
   * Requirements:
   *   - Name, Mobile Number, City, Full Address
   *   - On save: expiry_date = null
   *   - status = 'inactive'
   */
  async function registerTenant(user, tenantData) {
    const authHeaders = {};
    if (config.serviceKey) {
      authHeaders['apikey'] = config.serviceKey;
      authHeaders['Authorization'] = `Bearer ${config.serviceKey}`;
    }

    // 1. Insert tenant with status = 'inactive' and expiry_date = null
    const tenantPayload = {
      name: tenantData.name.trim(),
      mobile: (tenantData.mobile || '').trim(),
      city: (tenantData.city || '').trim(),
      address: (tenantData.address || '').trim(),
      status: 'inactive',
      expiry_date: null
    };

    const insertTenantRes = await apiFetch('/rest/v1/tenants', {
      method: 'POST',
      headers: {
        'Prefer': 'return=representation',
        ...authHeaders
      },
      body: JSON.stringify(tenantPayload)
    });

    const tenantRecord = Array.isArray(insertTenantRes) ? insertTenantRes[0] : insertTenantRes;

    // 2. Link User to Tenant in tenant_users
    const userLinkPayload = {
      id: user.id,
      tenant_id: tenantRecord.id,
      email: user.email,
      role: 'admin'
    };

    await apiFetch('/rest/v1/tenant_users', {
      method: 'POST',
      headers: {
        'Prefer': 'return=representation',
        ...authHeaders
      },
      body: JSON.stringify(userLinkPayload)
    });

    currentTenant = tenantRecord;
    localStorage.setItem(STORAGE_KEY_TENANT, JSON.stringify(currentTenant));

    return tenantRecord;
  }

  // ─── 6. High Security Tenant Gatekeeper ────────────────────────────────────
  /**
   * Rule:
   *   1. Check tenant status === 'active'
   *   2. Check tenant expiry_date is NOT null AND expiry_date >= today
   * If BOTH satisfied -> enter software.
   * Otherwise -> BLOCK and display message to contact administrator.
   */
  function verifyTenantAccess(tenant) {
    if (!tenant) {
      return {
        allowed: false,
        reason: 'no_tenant',
        message: 'No store or tenant registered for this account. Please complete store registration.'
      };
    }

    // Check Status: MUST be 'active'
    const status = (tenant.status || '').toLowerCase().trim();
    if (status !== 'active') {
      return {
        allowed: false,
        reason: 'inactive',
        message: 'Your store account is currently Inactive. Please contact your system administrator to activate your subscription and assign a license.',
        tenant
      };
    }

    // Check Expiry Date: MUST not be null and MUST not be expired
    if (!tenant.expiry_date) {
      return {
        allowed: false,
        reason: 'no_expiry_date',
        message: 'Your store subscription has not been assigned an expiry date by the administrator. Please contact your system administrator.',
        tenant
      };
    }

    const expiryTime = new Date(tenant.expiry_date).getTime();
    const nowTime = new Date().getTime();

    if (isNaN(expiryTime) || expiryTime < nowTime) {
      const expDateFormatted = new Date(tenant.expiry_date).toLocaleDateString();
      return {
        allowed: false,
        reason: 'expired',
        message: `Your store subscription expired on ${expDateFormatted}. Please contact your system administrator to renew your RetailNext license.`,
        tenant
      };
    }

    // Both conditions satisfied!
    return {
      allowed: true,
      reason: 'valid',
      tenant
    };
  }

  function getSession() {
    return currentSession;
  }

  function getUser() {
    return (currentSession && currentSession.user) || null;
  }

  function getActiveTenant() {
    return currentTenant;
  }

  function setActiveTenant(t) {
    currentTenant = t;
    localStorage.setItem(STORAGE_KEY_TENANT, JSON.stringify(t));
  }

  return {
    init,
    setCredentials,
    getCredentials,
    isConfigured,
    signUp,
    signIn,
    signOut,
    fetchUserTenant,
    registerTenant,
    verifyTenantAccess,
    getSession,
    getUser,
    getActiveTenant,
    setActiveTenant,
    apiFetch
  };
})();
