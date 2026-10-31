'use strict';

/**
 * IPC Config Handlers
 * Allows renderer process to read and update Supabase configuration securely
 * in the Electron userData config.json store.
 */

const { ipcMain } = require('electron');
const { loadConfig, saveConfig } = require('../services/configService');
const logger = require('../utils/logger');

const CONTEXT = 'IPC:Config';

function registerConfigHandlers() {
  /**
   * Channel: 'get-config'
   * Returns current stored configuration (Supabase URL, Anon Key, etc.)
   */
  ipcMain.handle('get-config', async (_event) => {
    logger.debug(CONTEXT, 'Handling: get-config');
    try {
      const config = loadConfig();
      return { success: true, data: config };
    } catch (err) {
      logger.error(CONTEXT, 'Error in get-config handler', err);
      return { success: false, error: err.message };
    }
  });

  /**
   * Channel: 'save-config'
   * Saves updates to config.json
   */
  ipcMain.handle('save-config', async (_event, updates) => {
    logger.info(CONTEXT, 'Handling: save-config');
    try {
      const res = saveConfig(updates || {});
      return res;
    } catch (err) {
      logger.error(CONTEXT, 'Error in save-config handler', err);
      return { success: false, error: err.message };
    }
  });

  logger.info(CONTEXT, 'Config IPC handlers registered.');
}

module.exports = { registerConfigHandlers };

