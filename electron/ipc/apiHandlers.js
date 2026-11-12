'use strict';

/**
 * IPC API Handlers
 * Direct communication bridge between Electron and Retail Next Next.js API:
 * Endpoint: https://retailnext.doonext.app
 *
 * Uses Electron net.fetch to preserve cookies, bypass CORS, and provide secure HTTPS connectivity.
 */

const { ipcMain, net } = require('electron');
const logger = require('../utils/logger');

const CONTEXT = 'IPC:API';
const DEFAULT_API_BASE = 'https://retailnext.doonext.app';

// Persistent memory cookie jar to guarantee session retention across all API calls
const cookieJar = new Map();

function getCookieString() {
  const parts = [];
  for (const [k, v] of cookieJar.entries()) {
    parts.push(`${k}=${v}`);
  }
  return parts.join('; ');
}

function parseSetCookie(setCookieHeader) {
  if (!setCookieHeader) return;
  const cookieHeaders = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
  for (const raw of cookieHeaders) {
    const parts = raw.split(';');
    if (parts.length > 0) {
      const [name, ...valParts] = parts[0].split('=');
      const cookieName = name.trim();
      const cookieVal = valParts.join('=').trim();
      if (cookieVal === '' || parts.some(p => p.trim().toLowerCase().startsWith('max-age=0'))) {
        cookieJar.delete(cookieName);
      } else {
        cookieJar.set(cookieName, cookieVal);
      }
    }
  }
}

function registerApiHandlers() {
  ipcMain.handle('api-request', async (_event, payload = {}) => {
    const {
      endpoint = '',
      method = 'GET',
      headers = {},
      body,
      params,
      baseUrl
    } = payload;

    const base = baseUrl || DEFAULT_API_BASE;
    let url = endpoint.startsWith('http://') || endpoint.startsWith('https://')
      ? endpoint
      : `${base.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

    if (params && typeof params === 'object') {
      const urlObj = new URL(url);
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          urlObj.searchParams.append(key, String(val));
        }
      });
      url = urlObj.toString();
    }

    const savedCookies = getCookieString();
    const requestHeaders = {
      'Accept': 'application/json',
      ...(savedCookies ? { 'Cookie': savedCookies } : {}),
      ...headers
    };

    let requestBody = undefined;
    if (body !== undefined && body !== null) {
      if (typeof body === 'object' && !(body instanceof ArrayBuffer) && !ArrayBuffer.isView(body)) {
        requestHeaders['Content-Type'] = requestHeaders['Content-Type'] || 'application/json';
        requestBody = JSON.stringify(body);
      } else {
        requestBody = body;
      }
    }

    logger.debug(CONTEXT, `Dispatching ${method} ${url}`);

    try {
      const fetchFn = (net && typeof net.fetch === 'function') ? net.fetch : fetch;
      const res = await fetchFn(url, {
        method,
        headers: requestHeaders,
        body: requestBody,
        credentials: 'include'
      });

      const rawSetCookie = res.headers.get('set-cookie');
      if (rawSetCookie) {
        parseSetCookie(rawSetCookie);
      }

      const contentType = res.headers.get('content-type') || '';
      let data = null;

      if (contentType.includes('application/json')) {
        data = await res.json().catch(() => null);
      } else {
        const text = await res.text().catch(() => '');
        try {
          data = JSON.parse(text);
        } catch (_) {
          data = text;
        }
      }

      const isSuccess = res.ok;
      const errorMessage = !isSuccess
        ? (data?.error || data?.message || data?.msg || `HTTP ${res.status}`)
        : null;

      return {
        ok: isSuccess,
        status: res.status,
        data,
        error: errorMessage,
        cookies: Object.fromEntries(cookieJar.entries())
      };
    } catch (err) {
      logger.error(CONTEXT, `API Request Failed [${method} ${url}]: ${err.message}`);
      return {
        ok: false,
        status: 0,
        data: null,
        error: err.message
      };
    }
  });

  logger.info(CONTEXT, 'API IPC handler registered for https://retailnext.doonext.app');
}

module.exports = { registerApiHandlers };

