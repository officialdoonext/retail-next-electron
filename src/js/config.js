/**
 * Retail Next — Central Application & API Configuration
 *
 * Theme & Design System:
 *   - Primary Purple: #5e2b9d (Hover: #4d2282)
 *   - Crisp slate borders: border-slate-200 (#e2e8f0)
 *   - Containers: rounded-xl with shadow-2xs
 *   - Strict Pagination: PAGE_SIZE = 24 for fast, server-light rendering
 *
 * Endpoint:
 *   - https://retailnext.doonext.app/
 */

'use strict';

window.RETAILNEXT_CONFIG = {
  // Live API Base URL
  apiBaseUrl: 'https://retailnext.doonext.app',

  // Pagination standard
  pageSize: 24,

  // Theme constants
  theme: {
    primaryPurple: '#5e2b9d',
    primaryHover: '#4d2282',
    primaryLight: '#f3e8ff',
    slateBorder: '#e2e8f0',
    slateBg: '#f8fafc',
    textDark: '#0f172a',
    textMuted: '#64748b'
  },

  // Active Storage keys for multi-tenant context
  storageKeys: {
    session: 'retailnext_session',
    user: 'retailnext_user',
    staff: 'retailnext_staff',
    activeStore: 'retailnext_active_store',
    activeBusiness: 'retailnext_active_business',
    authToken: 'retailnext_auth_token'
  }
};
