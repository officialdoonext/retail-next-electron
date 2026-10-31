'use strict';

/**
 * Migration: 001 — Application Metadata Table
 *
 * This is the first migration and serves as the foundation for the
 * migration system itself. It creates the `app_metadata` table which
 * stores key-value configuration values for the local installation.
 *
 * Architecture note (future sync):
 *   The `app_metadata` table will store the tenant_id, device_id,
 *   and sync checkpoint tokens in future phases. These will be written
 *   here during tenant registration and updated after each sync cycle.
 */

const MIGRATION_ID = '001_app_metadata';

/**
 * @param {import('better-sqlite3').Database} db
 */
function up(db) {
  // Create the app_metadata key-value store.
  // Using a key-value table rather than fixed columns allows future
  // metadata fields to be added without new migrations.
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_metadata (
      key         TEXT PRIMARY KEY NOT NULL,
      value       TEXT NOT NULL,
      updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
  `);

  // Seed initial metadata values using INSERT OR IGNORE so this
  // migration is safely re-runnable (idempotent).
  const upsert = db.prepare(`
    INSERT OR IGNORE INTO app_metadata (key, value)
    VALUES (@key, @value)
  `);

  const seedMany = db.transaction((rows) => {
    for (const row of rows) {
      upsert.run(row);
    }
  });

  seedMany([
    { key: 'app_name',        value: 'Retail Next' },
    { key: 'app_version',     value: '1.0.0' },
    { key: 'schema_version',  value: '1' },
    { key: 'install_date',    value: new Date().toISOString() },
    // Placeholders for future multi-tenant phase:
    { key: 'tenant_id',       value: '' },
    { key: 'device_id',       value: '' },
    { key: 'sync_enabled',    value: 'false' },
    { key: 'last_sync_at',    value: '' },
  ]);
}

module.exports = { id: MIGRATION_ID, up };
