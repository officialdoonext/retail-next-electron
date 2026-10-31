'use strict';

/**
 * Migration Runner
 *
 * Discovers and executes pending database migrations in version order.
 *
 * Strategy:
 *   - Maintains a `schema_migrations` table tracking applied migration IDs.
 *   - On startup, compares the known migration list against the applied list.
 *   - Runs each pending migration inside a transaction so partial failures
 *     leave the database in a known good state.
 *   - Migrations are intentionally sequential (no parallelism) to prevent
 *     dependency issues between schema changes.
 *
 * Adding a new migration:
 *   1. Create `electron/database/migrations/NNN_description.js`
 *   2. Export `{ id: 'NNN_description', up(db) {} }`
 *   3. Import and add it to the MIGRATIONS array below — order matters.
 */

const logger = require('../../utils/logger');

const CONTEXT = 'DB:Migrations';

// ─── Register migrations here, in order ───────────────────────────────────────
const MIGRATIONS = [
  require('./001_app_metadata'),
  require('./002_multi_tenancy_and_sync'),
];

/**
 * Ensures the schema_migrations tracking table exists.
 * @param {import('better-sqlite3').Database} db
 */
function ensureMigrationsTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id          TEXT PRIMARY KEY NOT NULL,
      applied_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
  `);
}

/**
 * Returns the set of already-applied migration IDs.
 * @param {import('better-sqlite3').Database} db
 * @returns {Set<string>}
 */
function getAppliedMigrations(db) {
  const rows = db.prepare('SELECT id FROM schema_migrations').all();
  return new Set(rows.map((r) => r.id));
}

/**
 * Runs all pending migrations against the provided database connection.
 * Each migration runs inside its own transaction.
 *
 * @param {import('better-sqlite3').Database} db
 */
function runMigrations(db) {
  ensureMigrationsTable(db);

  const applied = getAppliedMigrations(db);
  const pending = MIGRATIONS.filter((m) => !applied.has(m.id));

  if (pending.length === 0) {
    logger.info(CONTEXT, 'Database schema is up to date. No migrations needed.');
    return;
  }

  logger.info(CONTEXT, `Running ${pending.length} pending migration(s)...`);

  for (const migration of pending) {
    logger.info(CONTEXT, `Applying migration: ${migration.id}`);

    // Wrap each migration in a transaction.
    // If `migration.up()` throws, the transaction rolls back automatically
    // and the migration ID is NOT recorded — so it will retry on next launch.
    const runMigration = db.transaction(() => {
      migration.up(db);
      db.prepare('INSERT INTO schema_migrations (id) VALUES (?)').run(migration.id);
    });

    try {
      runMigration();
      logger.info(CONTEXT, `Migration applied successfully: ${migration.id}`);
    } catch (err) {
      logger.error(CONTEXT, `Migration FAILED: ${migration.id}`, err);
      // Re-throw so main.js can catch and show an error dialog.
      throw new Error(`Database migration failed [${migration.id}]: ${err.message}`);
    }
  }

  logger.info(CONTEXT, 'All migrations completed successfully.');
}

module.exports = { runMigrations };
