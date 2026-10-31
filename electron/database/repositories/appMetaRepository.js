'use strict';

/**
 * App Metadata Repository
 *
 * Provides data access methods for the app_metadata table.
 * All queries use prepared statements for performance and safety.
 *
 * Architecture note:
 *   Repositories are the ONLY layer that writes raw SQL.
 *   Services call repositories; IPC handlers call services.
 *   This separation ensures SQL never reaches the renderer process.
 */

const { getDb } = require('../connection');
const logger = require('../../utils/logger');

const CONTEXT = 'Repo:AppMeta';

/**
 * Retrieves all app metadata as a plain key-value object.
 * @returns {{ [key: string]: string }}
 */
function getAllMeta() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT key, value FROM app_metadata').all();
    // Convert array of {key, value} rows to a plain object for easy consumption.
    return rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
  } catch (err) {
    logger.error(CONTEXT, 'Failed to read app_metadata.', err);
    throw err;
  }
}

/**
 * Gets a single metadata value by key.
 * @param {string} key
 * @returns {string|null}
 */
function getMeta(key) {
  try {
    const db = getDb();
    const row = db.prepare('SELECT value FROM app_metadata WHERE key = ?').get(key);
    return row ? row.value : null;
  } catch (err) {
    logger.error(CONTEXT, `Failed to read app_metadata key: ${key}`, err);
    throw err;
  }
}

/**
 * Sets a metadata value. Inserts or updates (upsert).
 * @param {string} key
 * @param {string} value
 */
function setMeta(key, value) {
  try {
    const db = getDb();
    db.prepare(`
      INSERT INTO app_metadata (key, value, updated_at)
      VALUES (?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at
    `).run(key, String(value));
  } catch (err) {
    logger.error(CONTEXT, `Failed to set app_metadata key: ${key}`, err);
    throw err;
  }
}

module.exports = { getAllMeta, getMeta, setMeta };
