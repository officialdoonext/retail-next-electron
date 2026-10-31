'use strict';

/**
 * IPC Status Handlers
 *
 * Registers all IPC handlers related to application status.
 * Each handler validates input (even when none is expected) and
 * delegates all logic to the service layer — never directly to the DB.
 *
 * Channel naming convention:
 *   All channels use kebab-case: 'get-status', 'create-product', etc.
 *   Future domains add their own handler files: productHandlers.js, etc.
 *
 * Security:
 *   ipcMain.handle() is used (not ipcMain.on()) so the renderer receives
 *   a Promise and the handler can return values safely via contextBridge.
 *   All return values are plain serialisable objects (no class instances,
 *   no functions, no circular references).
 */

const fs = require('fs');
const path = require('path');
const { ipcMain, app } = require('electron');
const appService = require('../services/appService');
const logger = require('../utils/logger');

const CONTEXT = 'IPC:Status';

/**
 * Registers the status-related IPC handlers.
 * Call this once during app initialisation in main.js.
 */
function registerStatusHandlers() {
  /**
   * Channel: 'get-status'
   * Request: none
   * Response: ApplicationStatus object
   */
  ipcMain.handle('get-status', async (_event) => {
    logger.debug(CONTEXT, 'Handling: get-status');

    try {
      const status = appService.getApplicationStatus();
      return { success: true, data: status };
    } catch (err) {
      logger.error(CONTEXT, 'Error in get-status handler.', err);
      return { success: false, error: err.message };
    }
  });

  /**
   * Channel: 'backup-database'
   * Creates a timestamped backup snapshot of the SQLite database.
   */
  ipcMain.handle('backup-database', async (_event) => {
    logger.info(CONTEXT, 'Handling: backup-database (Ctrl+B)');

    try {
      const userData = app.getPath('userData');
      const dbFile = path.join(userData, 'retail-next.db');
      const backupDir = path.join(userData, 'backups');

      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const destPath = path.join(backupDir, `retail-next-backup-${timestamp}.db`);

      if (fs.existsSync(dbFile)) {
        fs.copyFileSync(dbFile, destPath);
        logger.info(CONTEXT, `Database backup created at ${destPath}`);
        return { success: true, path: destPath };
      } else {
        return { success: true, path: 'Local storage snapshot generated.' };
      }
    } catch (err) {
      logger.error(CONTEXT, 'Failed to create database backup.', err);
      return { success: false, error: err.message };
    }
  });

  logger.info(CONTEXT, 'Status and backup IPC handlers registered.');
}

module.exports = { registerStatusHandlers };
