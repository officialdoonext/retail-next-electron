'use strict';

/**
 * Electron Preload Script
 *
 * This is the ONLY bridge between the renderer process (browser context)
 * and the Electron main process. It runs with Node.js access but in an
 * isolated context, then selectively exposes a safe API via contextBridge.
 *
 * Security model:
 *   - contextIsolation: true  → renderer cannot access Node.js globals.
 *   - nodeIntegration: false  → renderer cannot require() Node modules.
 *   - This script runs BEFORE the renderer, then its scope is destroyed.
 *   - Only the `window.retailAPI` object survives, via contextBridge.
 *
 * Extending the API:
 *   When adding new modules (products, sales, etc.), add new method
 *   groups here. Never expose ipcRenderer.invoke directly — always wrap
 *   each channel in a named function with a clear contract.
 */

const { contextBridge, ipcRenderer } = require('electron');

/**
 * retailAPI — The complete public interface between UI and main process.
 *
 * All methods return Promises. The renderer awaits them.
 * All channel strings are defined ONLY here — never in the renderer.
 */
const retailAPI = {

  // ─── Application Status & Operations ────────────────────────────────────
  /**
   * Retrieves current application and database status.
   * @returns {Promise<{ success: boolean, data: object, error?: string }>}
   */
  getStatus: () => ipcRenderer.invoke('get-status'),

  /**
   * Performs a snapshot backup of the SQLite database.
   * @returns {Promise<{ success: boolean, path: string, error?: string }>}
   */
  backupDatabase: () => ipcRenderer.invoke('backup-database'),

  // ─── Configuration & Credentials ─────────────────────────────────────────
  /**
   * Loads config (Supabase URL, Anon Key, Active Tenant) from userData config.json
   */
  getConfig: () => ipcRenderer.invoke('get-config'),

  /**
   * Saves config updates to userData config.json
   */
  saveConfig: (updates) => ipcRenderer.invoke('save-config', updates),

  // ─── Cloud & Network Bridge ───────────────────────────────────────────────
  /**
   * Performs cloud REST / Auth requests via Main process (bypasses browser sandbox/CORS/CSP limits)
   */
  supabaseRequest: (args) => ipcRenderer.invoke('supabase-request', args),

  /**
   * Performs live API requests to Retail Next API endpoint (https://retailnext.doonext.app)
   * @param {{ endpoint: string, method?: string, headers?: object, body?: any, params?: object }} options
   * @returns {Promise<{ ok: boolean, status: number, data: any, error?: string }>}
   */
  apiRequest: (options) => ipcRenderer.invoke('api-request', options),

  // ─── Future API groups (to be implemented in later phases) ───────────────
  // products:   { getAll, getById, create, update, delete }
  // categories: { getAll, create, update, delete }
  // inventory:  { getStock, adjustStock }
  // sales:      { createBill, getBills, getBillById }
  // customers:  { getAll, create, update }
  // suppliers:  { getAll, create, update }
  // expenses:   { getAll, create }
  // reports:    { getSalesSummary, getInventoryReport }
  // sync:       { triggerSync, getSyncStatus }
  // auth:       { login, logout, getCurrentUser }
};

// Expose the API on window.retailAPI — accessible in the renderer as:
//   window.retailAPI.getStatus()
// or simply:
//   retailAPI.getStatus()  (if you destructure in app.js)
contextBridge.exposeInMainWorld('retailAPI', retailAPI);
