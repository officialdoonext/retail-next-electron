'use strict';

/**
 * Electron Main Process — Entry Point
 *
 * Responsibilities:
 *   1. Create and manage the BrowserWindow (the visible application window).
 *   2. Initialise the SQLite database and run migrations.
 *   3. Register all IPC handlers.
 *   4. Handle application lifecycle events (ready, activate, quit).
 *
 * Security posture:
 *   - contextIsolation: true  → renderer has no direct Node.js access.
 *   - nodeIntegration: false  → renderer cannot require Node modules.
 *   - sandbox: true           → renderer process is OS-sandboxed.
 *   - preload: preload.js     → only whitelisted API exposed to renderer.
 *   - CSP is set via meta tag in index.html for additional XSS protection.
 */

const path = require('path');
const { app, BrowserWindow, dialog, Menu } = require('electron');

const logger            = require('./utils/logger');
const { getDb, closeDb } = require('./database/connection');
const { runMigrations } = require('./database/migrations/index');
const { registerStatusHandlers } = require('./ipc/statusHandlers');
const { registerConfigHandlers } = require('./ipc/configHandlers');
const { registerSupabaseHandlers } = require('./ipc/supabaseHandlers');
const { registerApiHandlers } = require('./ipc/apiHandlers');

const CONTEXT = 'Main';

function setupNativeMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        { label: 'Company Profile' },
        { label: 'Financial Year' },
        { label: 'Branch Management' },
        { type: 'separator' },
        { label: 'Backup Database', accelerator: 'Ctrl+B' },
        { label: 'Restore Database' },
        { type: 'separator' },
        { label: 'Exit Application', accelerator: 'Alt+F4', role: 'quit' }
      ]
    },
    {
      label: 'Masters',
      submenu: [
        { label: 'Add Product', accelerator: 'F3' },
        { label: 'Product List' },
        { label: 'Product Categories' },
        { label: 'Brands' },
        { label: 'Units of Measurement' },
        { type: 'separator' },
        { label: 'Customer Master', accelerator: 'F9' },
        { label: 'Supplier Master' },
        { label: 'Tax Master (GST)' }
      ]
    },
    {
      label: 'Transactions',
      submenu: [
        { label: 'New Sales Bill (POS)', accelerator: 'F2' },
        { label: 'Sales Invoice List' },
        { label: 'Sales Return', accelerator: 'F7' },
        { type: 'separator' },
        { label: 'New Purchase Entry', accelerator: 'F6' },
        { label: 'Purchase Return', accelerator: 'F8' },
        { type: 'separator' },
        { label: 'Receive Payment', accelerator: 'F4' },
        { label: 'Print Bill', accelerator: 'F12' }
      ]
    },
    {
      label: 'Inventory',
      submenu: [
        { label: 'Current Stock' },
        { label: 'Stock Valuation' },
        { label: 'Stock Movement' },
        { label: 'Stock Adjustment' },
        { label: 'Low Stock Alerts' }
      ]
    },
    {
      label: 'Accounts',
      submenu: [
        { label: 'Cash Book' },
        { label: 'Bank Book' },
        { label: 'Expense Management' },
        { label: 'Customer Ledger' },
        { label: 'Supplier Ledger' },
        { label: 'GST Management' }
      ]
    },
    {
      label: 'Reports',
      submenu: [
        { label: 'Daily Sales Report' },
        { label: 'Monthly Sales Report' },
        { label: 'Product Sales Report' },
        { label: 'Inventory Valuation Report' },
        { label: 'GST Reports (GSTR-1 / 3B)' },
        { label: 'Profit & Loss Statement' }
      ]
    },
    {
      label: 'Employees',
      submenu: [
        { label: 'Employee Master' },
        { label: 'User Accounts' },
        { label: 'Roles & Permissions' },
        { label: 'Cashier Management' },
        { label: 'Activity Logs' }
      ]
    },
    {
      label: 'Settings',
      submenu: [
        { label: 'General Settings' },
        { label: 'Company Settings' },
        { label: 'Tax Settings' },
        { label: 'Printer Settings' },
        { label: 'Barcode Settings' },
        { label: 'Backup Settings' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        { label: 'Help Center', accelerator: 'F1' },
        { label: 'Diagnostics & Status' },
        { label: 'Check for Updates' },
        { type: 'separator' },
        { label: 'About RetailNext' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ─── Single Instance Lock ─────────────────────────────────────────────────────
// Prevent multiple instances of the app from running simultaneously.
// This is critical for SQLite WAL integrity — only one writer is allowed.
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  logger.warn(CONTEXT, 'Another instance is already running. Quitting.');
  app.quit();
}

/** @type {BrowserWindow|null} */
let mainWindow = null;

// ─── Window Creation ──────────────────────────────────────────────────────────

/**
 * Creates the main application window with security-hardened webPreferences.
 */
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width:          1500,
    height:         950,
    minWidth:       1200,
    minHeight:      750,
    title:          'Retail Next',
    backgroundColor: '#0f172a',    // Matches sidebar colour — prevents white flash on load.
    show:           false,          // Don't show until ready-to-show fires (avoids blank frame).
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      contextIsolation: true,   // Renderer and preload have separate JS contexts.
      nodeIntegration:  false,  // Renderer cannot use require().
      sandbox:          true,   // OS-level process sandboxing for the renderer.
      devTools:         true,   // Keep DevTools available during development.
    },
  });

  // Load the renderer HTML entry point.
  mainWindow.loadFile(path.join(__dirname, '..', 'src', 'index.html'));

  // Configure hardware device access for WebUSB, WebSerial, and WebBluetooth thermal printers
  const ses = mainWindow.webContents.session;
  ses.setPermissionCheckHandler((_webContents, permission) => {
    if (['usb', 'serial', 'bluetooth'].includes(permission)) return true;
    return true;
  });
  ses.setDevicePermissionHandler(() => true);

  ses.on('select-usb-device', (event, details, callback) => {
    event.preventDefault();
    if (details.deviceList && details.deviceList.length > 0) {
      callback(details.deviceList[0].deviceId);
    } else {
      callback('');
    }
  });

  ses.on('select-serial-port', (event, portList, _webContents, callback) => {
    event.preventDefault();
    if (portList && portList.length > 0) {
      callback(portList[0].portId);
    } else {
      callback('');
    }
  });

  mainWindow.webContents.on('select-bluetooth-device', (event, deviceList, callback) => {
    event.preventDefault();
    if (deviceList && deviceList.length > 0) {
      callback(deviceList[0].deviceId);
    } else {
      callback('');
    }
  });

  // Show the window only once the renderer has fully painted.
  // This prevents the ugly "white flash" on startup.
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    logger.info(CONTEXT, 'Main window displayed.');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ─── Database Initialisation ──────────────────────────────────────────────────

/**
 * Initialises the SQLite database and runs all pending migrations.
 * Throws on failure — the app cannot safely operate without a database.
 */
async function initialiseDatabase() {
  try {
    logger.info(CONTEXT, 'Initialising database...');
    getDb();           // Opens connection, sets WAL + FK.
    runMigrations(getDb());  // Runs any pending schema migrations.
    logger.info(CONTEXT, 'Database initialised successfully.');
  } catch (err) {
    logger.error(CONTEXT, 'Database initialisation failed.', err);
    throw err;
  }
}

// ─── App Lifecycle ────────────────────────────────────────────────────────────

if (gotLock) {
  app.whenReady().then(async () => {
  logger.info(CONTEXT, `Retail Next starting. Electron ${process.versions.electron}, Node ${process.versions.node}`);
  logger.info(CONTEXT, `User data path: ${app.getPath('userData')}`);

  // Step 1: Register IPC handlers BEFORE creating the window.
  // This ensures handlers are ready when the renderer makes its first call.
  registerStatusHandlers();
  registerConfigHandlers();
  registerSupabaseHandlers();
  registerApiHandlers();
  setupNativeMenu();
  logger.info(CONTEXT, 'IPC handlers and native menus registered.');

  // Step 2: Initialise the database if available.
  try {
    await initialiseDatabase();
  } catch (err) {
    logger.warn(CONTEXT, `Local database init warning: ${err.message}. Operating in API-first mode.`);
  }

  // Step 3: Create the application window.
  createMainWindow();

  // macOS: re-create window when dock icon is clicked and no windows are open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});
}

// ─── Graceful Shutdown ────────────────────────────────────────────────────────

app.on('before-quit', () => {
  logger.info(CONTEXT, 'Application quitting — closing database connection...');
  closeDb();
});

// Windows/Linux: quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle second instance — bring existing window to focus instead of opening new one.
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
  }
});
