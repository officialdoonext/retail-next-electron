'use strict';

/**
 * Logger — Structured console logger for the Electron main process.
 *
 * Provides consistent log formatting with timestamps and log levels.
 * In future phases this can be extended to write to a log file via
 * app.getPath('logs') for crash diagnostics and support tickets.
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

// Set minimum log level. Change to DEBUG during development.
const CURRENT_LEVEL = process.env.NODE_ENV === 'development'
  ? LOG_LEVELS.DEBUG
  : LOG_LEVELS.INFO;

/**
 * Formats a log message with timestamp and level tag.
 * @param {string} level
 * @param {string} context - The module/component emitting the log.
 * @param {string} message
 * @returns {string}
 */
function formatMessage(level, context, message) {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.padEnd(5)}] [${context}] ${message}`;
}

const logger = {
  debug(context, message) {
    if (CURRENT_LEVEL <= LOG_LEVELS.DEBUG) {
      console.debug(formatMessage('DEBUG', context, message));
    }
  },

  info(context, message) {
    if (CURRENT_LEVEL <= LOG_LEVELS.INFO) {
      console.info(formatMessage('INFO ', context, message));
    }
  },

  warn(context, message) {
    if (CURRENT_LEVEL <= LOG_LEVELS.WARN) {
      console.warn(formatMessage('WARN ', context, message));
    }
  },

  error(context, message, err) {
    if (CURRENT_LEVEL <= LOG_LEVELS.ERROR) {
      console.error(formatMessage('ERROR', context, message));
      if (err) {
        console.error(err);
      }
    }
  },
};

module.exports = logger;
