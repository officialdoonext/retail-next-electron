'use strict';

/**
 * IPC Supabase Handlers
 * Performs HTTPS requests to Supabase from the Electron Main Process.
 * Bypasses Chromium renderer CORS / CSP constraints and provides reliable cloud connectivity.
 */

const { ipcMain } = require('electron');
const logger = require('../utils/logger');

const CONTEXT = 'IPC:Supabase';

function registerSupabaseHandlers() {
  ipcMain.handle('supabase-request', async (_event, payload) => {
    const { url, options = {} } = payload || {};
    if (!url) {
      return { ok: false, status: 400, error: 'No URL provided' };
    }

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: options.headers || {},
        body: options.body || undefined
      });

      const contentType = response.headers.get('content-type') || '';
      let data = null;

      if (contentType.includes('application/json')) {
        data = await response.json().catch(() => null);
      } else {
        const text = await response.text().catch(() => '');
        try {
          data = JSON.parse(text);
        } catch (_) {
          data = text;
        }
      }

      return {
        ok: response.ok,
        status: response.status,
        data,
        error: !response.ok ? (data?.msg || data?.message || data?.error_description || data?.error || `HTTP ${response.status}`) : null
      };
    } catch (err) {
      logger.error(CONTEXT, `Failed request to ${url}: ${err.message}`);
      return {
        ok: false,
        status: 0,
        error: err.message
      };
    }
  });

  logger.info(CONTEXT, 'Supabase network bridge registered.');
}

module.exports = { registerSupabaseHandlers };

