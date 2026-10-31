'use strict';

/**
 * Database Connection Manager
 *
 * Manages a singleton SQLite connection for the entire main process lifetime.
 * Using a singleton ensures:
 *   - Only one WAL writer at a time (SQLite WAL best practice).
 *   - Consistent prepared statement caching.
 *   - Controlled shutdown on app quit.
 *
 * Architecture note (future sync):
 *   In the cloud sync phase, this module will remain unchanged.
 *   The outbox queue and sync engine will use this same connection
 *   instance via getDb(), wrapped in their own transactions.
 */

const path = require('path');
const { app } = require('electron');
const logger = require('../utils/logger');

const CONTEXT = 'DB:Connection';

/** @type {import('better-sqlite3').Database|null} */
let db = null;

/**
 * Initialises and returns the SQLite database connection.
 * Safe to call multiple times — returns the existing connection after first call.
 *
 * @returns {import('better-sqlite3').Database}
 * @throws {Error} If the database cannot be opened or configured.
 */
function getDb() {
  if (db) {
    return db;
  }

  // Resolve database path inside Electron's userData directory.
  // This is the OS-appropriate app data folder:
  //   Windows: %APPDATA%\retail-next-desktop\
  //   macOS:   ~/Library/Application Support/retail-next-desktop/
  //   Linux:   ~/.config/retail-next-desktop/
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'retail-next.db');

  logger.info(CONTEXT, `Opening database at: ${dbPath}`);

  try {
    // Load better-sqlite3 — a synchronous SQLite binding.
    // Synchronous I/O is intentional here: Electron's main process
    // handles DB calls via IPC handlers, which are async from the
    // renderer's perspective even though the DB operations are sync.
    const Database = require('better-sqlite3');

    db = new Database(dbPath, {
      // verbose: (msg) => logger.debug(CONTEXT, msg), // Uncomment for SQL trace
    });

    // Enable Write-Ahead Logging for better concurrent read performance
    // and crash resilience. WAL is the recommended mode for desktop apps.
    db.pragma('journal_mode = WAL');

    // Enforce foreign key constraints — SQLite disables them by default.
    // Must be set per-connection, not stored in the database file.
    db.pragma('foreign_keys = ON');

    // Optimise synchronisation — NORMAL is safe with WAL mode and
    // provides a good balance between durability and performance.
    db.pragma('synchronous = NORMAL');

    logger.info(CONTEXT, 'Database connection established. WAL mode active. Foreign keys ON.');
    return db;

  } catch (err) {
    logger.error(CONTEXT, 'Failed to open database connection.', err);
    throw err;
  }
}

/**
 * Closes the database connection cleanly.
 * Called during the 'before-quit' event to flush WAL and release the file lock.
 */
function closeDb() {
  if (db) {
    try {
      db.close();
      db = null;
      logger.info(CONTEXT, 'Database connection closed.');
    } catch (err) {
      logger.error(CONTEXT, 'Error closing database connection.', err);
    }
  }
}

/**
 * Returns true if the database connection is currently open.
 * @returns {boolean}
 */
function isConnected() {
  return db !== null && db.open;
}

module.exports = { getDb, closeDb, isConnected };
