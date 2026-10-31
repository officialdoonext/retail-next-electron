'use strict';

/**
 * Migration: 002 — Multi-Tenancy & Offline Sync Queue
 * Creates local SQLite tables partitioned by tenant_id, plus the sync_queue for offline-first replication.
 */

const MIGRATION_ID = '002_multi_tenancy_and_sync';

/**
 * @param {import('better-sqlite3').Database} db
 */
function up(db) {
  // 1. Tenants Table (Local Cache)
  db.exec(`
    CREATE TABLE IF NOT EXISTS tenants (
      id           TEXT PRIMARY KEY NOT NULL,
      name         TEXT NOT NULL,
      mobile       TEXT,
      city         TEXT,
      address      TEXT,
      status       TEXT NOT NULL DEFAULT 'inactive',
      expiry_date  TEXT,
      created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updated_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
  `);

  // 2. Tenant Users (Local Cache)
  db.exec(`
    CREATE TABLE IF NOT EXISTS tenant_users (
      id          TEXT PRIMARY KEY NOT NULL,
      tenant_id   TEXT NOT NULL,
      email       TEXT NOT NULL,
      role        TEXT NOT NULL DEFAULT 'cashier',
      created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    )
  `);

  // 3. Offline Sync Queue (Stores pending changes made while offline)
  db.exec(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id      TEXT NOT NULL,
      entity_type    TEXT NOT NULL,  -- 'products', 'customers', 'invoices', 'purchases'
      entity_id      TEXT NOT NULL,
      operation      TEXT NOT NULL,  -- 'INSERT', 'UPDATE', 'DELETE'
      payload        TEXT NOT NULL,  -- JSON serialized data
      status         TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'syncing', 'failed', 'synced'
      retry_count    INTEGER NOT NULL DEFAULT 0,
      error_message  TEXT,
      created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      synced_at      TEXT
    )
  `);

  // Indexes for fast lookup
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status, created_at);
    CREATE INDEX IF NOT EXISTS idx_sync_queue_tenant ON sync_queue(tenant_id);
  `);

  // 4. Products Table (Tenant-specific)
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id              TEXT PRIMARY KEY NOT NULL,
      tenant_id       TEXT NOT NULL,
      name            TEXT NOT NULL,
      code            TEXT,
      sku             TEXT,
      barcode         TEXT,
      category        TEXT,
      subcategory     TEXT,
      brand           TEXT,
      uom             TEXT DEFAULT 'Pieces',
      purchase_price  REAL DEFAULT 0,
      selling_price   REAL DEFAULT 0,
      mrp             REAL DEFAULT 0,
      gst_rate        REAL DEFAULT 0,
      current_stock   REAL DEFAULT 0,
      min_stock       REAL DEFAULT 0,
      location        TEXT,
      status          TEXT DEFAULT 'Active',
      sync_status     TEXT DEFAULT 'synced',
      updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
  `);

  // 5. Customers Table (Tenant-specific)
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id              TEXT PRIMARY KEY NOT NULL,
      tenant_id       TEXT NOT NULL,
      name            TEXT NOT NULL,
      mobile          TEXT,
      email           TEXT,
      city            TEXT,
      customer_group  TEXT,
      credit_limit    REAL DEFAULT 0,
      outstanding     REAL DEFAULT 0,
      loyalty_points  INTEGER DEFAULT 0,
      sync_status     TEXT DEFAULT 'synced',
      updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_customers_mobile ON customers(mobile);
  `);

  // 6. Invoices Table (Tenant-specific)
  db.exec(`
    CREATE TABLE IF NOT EXISTS invoices (
      id            TEXT PRIMARY KEY NOT NULL,
      tenant_id     TEXT NOT NULL,
      invoice_no    TEXT NOT NULL,
      customer_id   TEXT,
      customer_name TEXT,
      amount        REAL NOT NULL DEFAULT 0,
      payment_mode  TEXT NOT NULL DEFAULT 'Cash',
      status        TEXT NOT NULL DEFAULT 'Paid',
      ref_no        TEXT,
      items_json    TEXT,
      sync_status   TEXT DEFAULT 'synced',
      created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_invoices_tenant ON invoices(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_invoices_no ON invoices(invoice_no);
  `);
}

module.exports = { id: MIGRATION_ID, up };

