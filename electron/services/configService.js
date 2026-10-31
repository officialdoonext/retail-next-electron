'use strict';

/**
 * Config Service — Secure Configuration & Credentials Store
 * Stores Supabase URL, Anon Key, and active session in %APPDATA%/retail-next-desktop/config.json
 */

const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const logger = require('../utils/logger');

const CONTEXT = 'Service:Config';

function getConfigFilePath() {
  const userData = app.getPath('userData');
  return path.join(userData, 'config.json');
}

function loadConfig() {
  try {
    const filePath = getConfigFilePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    logger.error(CONTEXT, 'Failed to load config.json', err);
  }
  return {
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    activeTenant: null,
    activeUser: null,
    lastSyncTimestamp: null
  };
}

function saveConfig(updates) {
  try {
    const current = loadConfig();
    const merged = { ...current, ...updates };
    const filePath = getConfigFilePath();
    fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf8');
    logger.info(CONTEXT, 'Configuration saved successfully.');
    return { success: true, config: merged };
  } catch (err) {
    logger.error(CONTEXT, 'Failed to save config.json', err);
    return { success: false, error: err.message };
  }
}

module.exports = { loadConfig, saveConfig };

