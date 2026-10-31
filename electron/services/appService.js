'use strict';

/**
 * App Service — Application Business Logic Layer
 *
 * Services sit between IPC handlers and repositories.
 * They contain business logic, data transformation, and validation.
 * They NEVER return raw database row objects to IPC handlers —
 * instead they return clean, typed plain objects safe to serialize over IPC.
 *
 * Architecture note:
 *   In future phases each domain area gets its own service:
 *   productService.js, salesService.js, customerService.js, etc.
 *   All services share the same database connection via getDb().
 */

const { isConnected } = require('../database/connection');
const appMetaRepository = require('../database/repositories/appMetaRepository');
const logger = require('../utils/logger');

const CONTEXT = 'Service:App';

/**
 * Returns the current application and database status.
 * This powers the `get-status` IPC channel and the dashboard status cards.
 *
 * @returns {{
 *   appName: string,
 *   appVersion: string,
 *   appStatus: 'running' | 'error',
 *   dbStatus: 'connected' | 'disconnected',
 *   dbPath: string,
 *   offlineMode: boolean,
 *   schemaVersion: string,
 *   installDate: string,
 *   timestamp: string
 * }}
 */
function getApplicationStatus() {
  try {
    const dbConnected = isConnected();
    let meta = {};

    if (dbConnected) {
      meta = appMetaRepository.getAllMeta();
    }

    const status = {
      appName:       meta.app_name      || 'Retail Next',
      appVersion:    meta.app_version   || '1.0.0',
      appStatus:     'running',
      dbStatus:      dbConnected ? 'connected' : 'disconnected',
      offlineMode:   true,   // Phase 1: always offline. Cloud sync comes later.
      schemaVersion: meta.schema_version || '1',
      installDate:   meta.install_date  || '',
      syncEnabled:   meta.sync_enabled === 'true',
      timestamp:     new Date().toISOString(),
    };

    logger.debug(CONTEXT, `Status queried: db=${status.dbStatus}, app=${status.appStatus}`);
    return status;

  } catch (err) {
    logger.error(CONTEXT, 'Failed to retrieve application status.', err);

    // Return a degraded status object rather than throwing.
    // The renderer will display this as an error state.
    return {
      appName:       'Retail Next',
      appVersion:    '1.0.0',
      appStatus:     'error',
      dbStatus:      'disconnected',
      offlineMode:   true,
      schemaVersion: 'unknown',
      installDate:   '',
      syncEnabled:   false,
      timestamp:     new Date().toISOString(),
      error:         err.message,
    };
  }
}

module.exports = { getApplicationStatus };
