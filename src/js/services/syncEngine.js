/**
 * RetailNext — Offline-First & Cloud-First Synchronization Engine
 *
 * Requirements:
 *   1. If internet is available: save to Supabase cloud directly + update local cache.
 *   2. If offline / network error: save locally + queue in sync_queue.
 *   3. When network is restored: automatically sync pending items in background.
 *   4. Every single operation enforces strict multi-tenancy (tenant_id attached to every payload).
 */

'use strict';

window.SyncEngine = (() => {

  const QUEUE_STORAGE_KEY = 'retailnext_sync_queue';
  let syncQueue = [];
  let isOnline = navigator.onLine;
  let isSyncing = false;
  let statusListeners = [];

  function init() {
    loadQueue();

    // Listen to browser network changes
    window.addEventListener('online', () => {
      isOnline = true;
      notifyStatus();
      flushQueue();
    });

    window.addEventListener('offline', () => {
      isOnline = false;
      notifyStatus();
    });

    // Periodic heartbeat sync every 20 seconds
    setInterval(() => {
      if (isOnline && syncQueue.length > 0 && !isSyncing) {
        flushQueue();
      }
    }, 20000);

    notifyStatus();
  }

  function loadQueue() {
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        syncQueue = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('[SyncEngine] Failed to load sync queue:', e);
      syncQueue = [];
    }
  }

  function saveQueue() {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(syncQueue));
      notifyStatus();
    } catch (e) {
      console.error('[SyncEngine] Failed to persist sync queue:', e);
    }
  }

  function onStatusChange(callback) {
    statusListeners.push(callback);
    callback(getStatus());
  }

  function notifyStatus() {
    const status = getStatus();
    statusListeners.forEach(fn => {
      try { fn(status); } catch (e) {}
    });
  }

  function getStatus() {
    return {
      isOnline,
      isSyncing,
      pendingCount: syncQueue.length,
      mode: isOnline ? (syncQueue.length > 0 ? 'syncing' : 'online') : 'offline'
    };
  }

  // ─── Save Record (Cloud-First + Offline Fallback) ──────────────────────────
  /**
   * Unified save method for Products, Invoices, Customers, Purchases, etc.
   * Enforces tenant_id isolation!
   */
  async function saveRecord(table, record, operation = 'INSERT') {
    const tenant = window.SupabaseService ? window.SupabaseService.getActiveTenant() : null;
    
    // Attach tenant_id for strict multi-tenant isolation
    const tenantId = tenant ? tenant.id : 'TENANT-LOCAL-001';
    const payload = {
      ...record,
      tenant_id: tenantId,
      updated_at: new Date().toISOString()
    };

    let synced = false;

    // 1. Attempt Cloud Direct Save if online and configured
    if (isOnline && window.SupabaseService && window.SupabaseService.isConfigured()) {
      try {
        const method = operation === 'UPDATE' ? 'PATCH' : 'POST';
        const endpoint = operation === 'UPDATE' 
          ? `/rest/v1/${table}?id=eq.${payload.id}&tenant_id=eq.${tenantId}`
          : `/rest/v1/${table}`;

        await window.SupabaseService.apiFetch(endpoint, {
          method,
          headers: {
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(payload)
        });

        synced = true;
      } catch (err) {
        console.warn(`[SyncEngine] Cloud save failed for ${table}, falling back to local queue:`, err);
        synced = false;
      }
    }

    // 2. If not synced (offline or network failure), enqueue for background sync
    if (!synced) {
      syncQueue.push({
        id: 'SQ-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        table,
        operation,
        payload,
        tenant_id: tenantId,
        timestamp: new Date().toISOString()
      });
      saveQueue();
    }

    // 3. Update local store
    if (window.RetailStore) {
      if (table === 'invoices') {
        window.RetailStore.addInvoice(payload);
      } else if (table === 'products') {
        if (operation === 'UPDATE') window.RetailStore.updateProduct(payload.id, payload);
        else window.RetailStore.addProduct(payload);
      } else if (table === 'customers') {
        window.RetailStore.addCustomer(payload);
      } else if (table === 'purchases') {
        if (window.RetailStore.addPurchase) window.RetailStore.addPurchase(payload);
      }
    }

    return {
      success: true,
      synced,
      record: payload
    };
  }

  // ─── Background Sync Queue Worker ─────────────────────────────────────────
  async function flushQueue() {
    if (syncQueue.length === 0 || !isOnline || isSyncing) return;
    if (!window.SupabaseService || !window.SupabaseService.isConfigured()) return;

    isSyncing = true;
    notifyStatus();

    console.info(`[SyncEngine] Starting background sync of ${syncQueue.length} pending items...`);

    const remaining = [];

    for (const item of syncQueue) {
      try {
        const method = item.operation === 'UPDATE' ? 'PATCH' : 'POST';
        const endpoint = item.operation === 'UPDATE'
          ? `/rest/v1/${item.table}?id=eq.${item.payload.id}&tenant_id=eq.${item.tenant_id}`
          : `/rest/v1/${item.table}`;

        await window.SupabaseService.apiFetch(endpoint, {
          method,
          headers: {
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(item.payload)
        });

        console.info(`[SyncEngine] Successfully synced item ${item.id} (${item.table}) to cloud.`);
      } catch (err) {
        console.warn(`[SyncEngine] Failed syncing item ${item.id}, retaining in queue:`, err);
        remaining.push(item);
      }
    }

    syncQueue = remaining;
    isSyncing = false;
    saveQueue();
    notifyStatus();
  }

  return {
    init,
    saveRecord,
    flushQueue,
    getStatus,
    onStatusChange
  };
})();
