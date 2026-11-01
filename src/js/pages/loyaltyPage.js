/**
 * RetailNext — Loyalty Master Page
 * Submenu: Masters -> Loyalty Master -> Loyalty Points, Reward Rules, Membership Types
 */

'use strict';

window.LoyaltyPage = (() => {

  const STORAGE_KEY_CONFIG = 'retailnext_loyalty_config';
  const STORAGE_KEY_TIERS = 'retailnext_membership_tiers';
  const STORAGE_KEY_RULES = 'retailnext_reward_rules';

  const DEFAULT_CONFIG = {
    enabled: true,
    spendPerPoint: 100,      // Spend ₹100 = 1 Point
    pointValueRupees: 0.50,  // 1 Point = ₹0.50
    minRedeemPoints: 100,    // Min points required to redeem
    maxRedeemPercent: 50,    // Max 50% of invoice can be paid with points
    expiryDays: 365,         // Points valid for 365 days
    allowPartialRedemption: true
  };

  const DEFAULT_TIERS = [
    {
      id: 'TIER-BRONZE',
      name: 'Bronze (Regular)',
      minAnnualSpend: 0,
      pointMultiplier: 1.0,
      extraDiscountPercent: 0,
      perks: 'Standard points earning, SMS order receipts',
      badgeColor: '#78909c',
      activeMembers: 1420
    },
    {
      id: 'TIER-SILVER',
      name: 'Silver Club',
      minAnnualSpend: 15000,
      pointMultiplier: 1.25,
      extraDiscountPercent: 2,
      perks: '1.25x points, 2% off on grocery bills > ₹1,000, seasonal coupon pack',
      badgeColor: '#90a4ae',
      activeMembers: 480
    },
    {
      id: 'TIER-GOLD',
      name: 'Gold Elite',
      minAnnualSpend: 35000,
      pointMultiplier: 1.5,
      extraDiscountPercent: 5,
      perks: '1.5x points, 5% store discount, zero delivery fee, birthday special 2x bonus',
      badgeColor: '#f59e0b',
      activeMembers: 215
    },
    {
      id: 'TIER-PLATINUM',
      name: 'Platinum VIP',
      minAnnualSpend: 75000,
      pointMultiplier: 2.0,
      extraDiscountPercent: 8,
      perks: '2x points, 8% storewide discount, dedicated phone support, priority billing counter',
      badgeColor: '#6366f1',
      activeMembers: 68
    }
  ];

  const DEFAULT_RULES = [
    {
      id: 'RULE-01',
      name: 'Weekend Super Saver',
      type: 'Multiplier',
      criteria: 'Saturday & Sunday purchases above ₹2,000',
      bonusMultiplier: 1.5,
      minBill: 2000,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      active: true
    },
    {
      id: 'RULE-02',
      name: 'Customer Birthday Special',
      type: 'Double Points',
      criteria: 'Valid during birthday month on all purchases',
      bonusMultiplier: 2.0,
      minBill: 500,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      active: true
    },
    {
      id: 'RULE-03',
      name: 'First Purchase Welcome Bonus',
      type: 'Fixed Points',
      criteria: 'One-time 150 bonus points on registration first bill',
      bonusMultiplier: 1.0,
      minBill: 1000,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      active: true
    },
    {
      id: 'RULE-04',
      name: 'Festive Season Grocery Splash',
      type: 'Multiplier',
      criteria: 'All FMCG & Grocery baskets exceeding ₹5,000',
      bonusMultiplier: 2.0,
      minBill: 5000,
      startDate: '2026-10-01',
      endDate: '2026-11-15',
      active: false
    }
  ];

  function getConfig() {
    try {
      const s = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (s) return JSON.parse(s);
    } catch (e) {}
    return { ...DEFAULT_CONFIG };
  }

  function saveConfig(cfg) {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(cfg));
    if (window.SyncEngine) {
      window.SyncEngine.recordChange('loyalty_config', 'update', 'GLOBAL', cfg);
    }
  }

  function getTiers() {
    try {
      const s = localStorage.getItem(STORAGE_KEY_TIERS);
      if (s) return JSON.parse(s);
    } catch (e) {}
    return [...DEFAULT_TIERS];
  }

  function saveTiers(tiers) {
    localStorage.setItem(STORAGE_KEY_TIERS, JSON.stringify(tiers));
    if (window.SyncEngine) {
      window.SyncEngine.recordChange('membership_tiers', 'update', 'ALL', tiers);
    }
  }

  function getRules() {
    try {
      const s = localStorage.getItem(STORAGE_KEY_RULES);
      if (s) return JSON.parse(s);
    } catch (e) {}
    return [...DEFAULT_RULES];
  }

  function saveRules(rules) {
    localStorage.setItem(STORAGE_KEY_RULES, JSON.stringify(rules));
    if (window.SyncEngine) {
      window.SyncEngine.recordChange('reward_rules', 'update', 'ALL', rules);
    }
  }

  function renderPage(outlet, subTab = 'points') {
    if (!outlet) return;
    outlet.innerHTML = '';
    outlet.className = 'page-container loyalty-page';

    let activeTab = 'points';
    if (subTab.includes('reward') || subTab.includes('rule')) activeTab = 'rules';
    if (subTab.includes('member') || subTab.includes('tier')) activeTab = 'tiers';

    const cfg = getConfig();
    const tiers = getTiers();
    const rules = getRules();

    outlet.innerHTML = `
      <div class="module-header">
        <div>
          <span class="module-header__parent">Masters / Marketing & CRM</span>
          <h1 class="module-header__title">Loyalty Master</h1>
        </div>
        <div class="module-header__actions">
          <div class="pill-group">
            <button class="pill-btn ${activeTab === 'points' ? 'active' : ''}" id="loy-tab-points">Loyalty Points & Setup</button>
            <button class="pill-btn ${activeTab === 'rules' ? 'active' : ''}" id="loy-tab-rules">Reward Rules (${rules.length})</button>
            <button class="pill-btn ${activeTab === 'tiers' ? 'active' : ''}" id="loy-tab-tiers">Membership Tiers (${tiers.length})</button>
          </div>
        </div>
      </div>

      <!-- Quick Metrics Strip -->
      <div class="stats-row mb-4">
        <div class="stat-card">
          <span class="stat-card__label">Spend Per Point</span>
          <span class="stat-card__value text-brand">₹${cfg.spendPerPoint}</span>
          <span class="stat-card__sub">Earn 1 pt per ₹${cfg.spendPerPoint} spend</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__label">Redemption Value</span>
          <span class="stat-card__value text-success">₹${Number(cfg.pointValueRupees).toFixed(2)}</span>
          <span class="stat-card__sub">1 pt = ₹${Number(cfg.pointValueRupees).toFixed(2)} at POS</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__label">Min Points to Redeem</span>
          <span class="stat-card__value font-mono">${cfg.minRedeemPoints} Pts</span>
          <span class="stat-card__sub">Worth ₹${(cfg.minRedeemPoints * cfg.pointValueRupees).toFixed(2)} cash value</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__label">Total Enrolled Members</span>
          <span class="stat-card__value font-bold text-accent">${tiers.reduce((acc, t) => acc + (t.activeMembers || 0), 0)}</span>
          <span class="stat-card__sub">Across ${tiers.length} membership tiers</span>
        </div>
      </div>

      <div id="loyalty-tab-content"></div>
    `;

    const contentDiv = outlet.querySelector('#loyalty-tab-content');
    const tabPointsBtn = outlet.querySelector('#loy-tab-points');
    const tabRulesBtn = outlet.querySelector('#loy-tab-rules');
    const tabTiersBtn = outlet.querySelector('#loy-tab-tiers');

    function switchTab(newTab) {
      activeTab = newTab;
      tabPointsBtn.classList.toggle('active', newTab === 'points');
      tabRulesBtn.classList.toggle('active', newTab === 'rules');
      tabTiersBtn.classList.toggle('active', newTab === 'tiers');

      if (newTab === 'points') renderPointsTab(contentDiv, outlet);
      else if (newTab === 'rules') renderRulesTab(contentDiv, outlet);
      else if (newTab === 'tiers') renderTiersTab(contentDiv, outlet);
    }

    tabPointsBtn.addEventListener('click', () => switchTab('points'));
    tabRulesBtn.addEventListener('click', () => switchTab('rules'));
    tabTiersBtn.addEventListener('click', () => switchTab('tiers'));

    switchTab(activeTab);
  }

  // ── 1. POINTS TAB ──────────────────────────────────────────────────────────
  function renderPointsTab(container, parentOutlet) {
    const cfg = getConfig();

    container.innerHTML = `
      <div class="grid grid-2 gap-4">
        <!-- Configuration Card -->
        <div class="card p-4">
          <div class="card__title font-bold mb-3" style="font-size:16px;">⚙️ Loyalty Points Rules & Valuation</div>
          <form id="loyalty-config-form">
            <div class="form-row mb-3">
              <label class="form-label" style="display:flex;align-items:center;gap:8px;font-weight:600;">
                <input type="checkbox" id="cfg-enabled" ${cfg.enabled ? 'checked' : ''} style="width:16px;height:16px;">
                Enable Customer Loyalty Program at POS Checkout
              </label>
              <div class="form-hint">When active, customers will automatically accrue reward points during POS billing.</div>
            </div>

            <div class="grid grid-2 gap-3 mb-3">
              <div class="form-group">
                <label class="form-label">Spend Amount per 1 Point (₹) *</label>
                <input type="number" id="cfg-spend-per-point" class="pos-input" value="${cfg.spendPerPoint}" min="1" step="1" required />
                <span class="form-hint">E.g., 100 means customer earns 1 pt for every ₹100 spent.</span>
              </div>
              <div class="form-group">
                <label class="form-label">Redemption Cash Value per Point (₹) *</label>
                <input type="number" id="cfg-point-val" class="pos-input" value="${cfg.pointValueRupees}" min="0.01" step="0.05" required />
                <span class="form-hint">E.g., 0.50 means 100 points = ₹50 discount.</span>
              </div>
            </div>

            <div class="grid grid-2 gap-3 mb-3">
              <div class="form-group">
                <label class="form-label">Minimum Points for Redemption *</label>
                <input type="number" id="cfg-min-redeem" class="pos-input" value="${cfg.minRedeemPoints}" min="0" step="10" required />
                <span class="form-hint">Customer must have at least this many points.</span>
              </div>
              <div class="form-group">
                <label class="form-label">Max Invoice % Redeemable (%) *</label>
                <input type="number" id="cfg-max-percent" class="pos-input" value="${cfg.maxRedeemPercent}" min="1" max="100" step="5" required />
                <span class="form-hint">Limit points discount to a maximum % of bill.</span>
              </div>
            </div>

            <div class="grid grid-2 gap-3 mb-4">
              <div class="form-group">
                <label class="form-label">Points Expiry (Days)</label>
                <input type="number" id="cfg-expiry" class="pos-input" value="${cfg.expiryDays}" min="0" step="30" />
                <span class="form-hint">0 = Points never expire. Default: 365 days.</span>
              </div>
              <div class="form-group">
                <label class="form-label">Allow Partial Redemption?</label>
                <select id="cfg-partial" class="pos-input">
                  <option value="true" ${cfg.allowPartialRedemption ? 'selected' : ''}>Yes (Customer chooses how many points to use)</option>
                  <option value="false" ${!cfg.allowPartialRedemption ? 'selected' : ''}>No (Redeem all available or none)</option>
                </select>
              </div>
            </div>

            <div style="display:flex;justify-content:flex-end;gap:10px;">
              <button type="submit" class="btn btn--primary">💾 Save Loyalty Settings</button>
            </div>
          </form>
        </div>

        <!-- Interactive Calculator & Customer Points Lookup -->
        <div style="display:flex;flex-direction:column;gap:16px;">
          <!-- Live Interactive Calculator Card -->
          <div class="card p-4">
            <div class="card__title font-bold mb-2">🧮 Live Earning & Redemption Simulator</div>
            <p class="text-secondary mb-3" style="font-size:13px;">Test the points math based on your current settings.</p>
            
            <div class="form-group mb-3">
              <label class="form-label">Simulated Bill Amount (₹)</label>
              <input type="number" id="sim-bill-amount" class="pos-input font-mono" value="2500" min="0" step="100" style="font-size:16px;font-weight:bold;" />
            </div>

            <div style="background:var(--bg-tertiary, #f8fafc);border:1px solid var(--border-color, #e2e8f0);border-radius:6px;padding:12px;" id="sim-results">
              <!-- Dynamically populated -->
            </div>
          </div>

          <!-- Customer Loyalty Quick Lookup & Adjustment -->
          <div class="card p-4">
            <div class="card__title font-bold mb-2">🔍 Customer Points Adjustment</div>
            <p class="text-secondary mb-3" style="font-size:13px;">Manual balance credit or debit with audit logging.</p>

            <div class="form-group mb-3">
              <label class="form-label">Select Customer</label>
              <select id="adj-cust-select" class="pos-input font-mono">
                ${(() => {
                  const customers = window.RetailStore ? window.RetailStore.getCustomers() : [];
                  if (customers.length === 0) return '<option value="">No customers found</option>';
                  return customers.map(c => `<option value="${c.id}">${c.name} (${c.mobile}) — Balance: ${c.loyaltyPoints || 0} Pts</option>`).join('');
                })()}
              </select>
            </div>

            <div class="grid grid-2 gap-3 mb-3">
              <div class="form-group">
                <label class="form-label">Points to Adjust (+ / -)</label>
                <input type="number" id="adj-points" class="pos-input font-mono" value="50" step="10" placeholder="+50 or -50" />
              </div>
              <div class="form-group">
                <label class="form-label">Reason / Reference</label>
                <input type="text" id="adj-reason" class="pos-input" placeholder="e.g. Goodwill credit, Promo event" />
              </div>
            </div>

            <button type="button" id="btn-adj-apply" class="btn btn--secondary" style="width:100%;">Apply Balance Adjustment</button>
          </div>
        </div>
      </div>
    `;

    // Live Simulator Update
    const billInput = container.querySelector('#sim-bill-amount');
    const simResults = container.querySelector('#sim-results');

    function updateSimulator() {
      const bill = parseFloat(billInput.value) || 0;
      const spendPerPt = parseFloat(container.querySelector('#cfg-spend-per-point').value) || 100;
      const ptVal = parseFloat(container.querySelector('#cfg-point-val').value) || 0.50;
      const minPts = parseInt(container.querySelector('#cfg-min-redeem').value, 10) || 100;

      const earnedPts = Math.floor(bill / spendPerPt);
      const cashValEarned = (earnedPts * ptVal).toFixed(2);
      const isRedeemEligible = earnedPts >= minPts;

      simResults.innerHTML = `
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:13px;">
          <span>Points Earned on this Bill:</span>
          <strong class="text-brand font-mono" style="font-size:14px;">+${earnedPts} Pts</strong>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:13px;">
          <span>Equivalent Cash Discount Value:</span>
          <strong class="text-success font-mono">₹${cashValEarned}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:13px;">
          <span>Effective Cash-back Return:</span>
          <strong class="font-mono">${bill > 0 ? ((cashValEarned / bill) * 100).toFixed(1) : 0}%</strong>
        </div>
        <div style="font-size:12px;color:var(--text-muted);border-top:1px solid #e2e8f0;padding-top:6px;margin-top:4px;">
          ${isRedeemEligible ? '<span class="text-success font-bold">✓ Qualifies for instant redemption</span>' : `<span class="text-warning">Need ${minPts - earnedPts} more points to unlock redemption</span>`}
        </div>
      `;
    }

    billInput.addEventListener('input', updateSimulator);
    container.querySelector('#cfg-spend-per-point').addEventListener('input', updateSimulator);
    container.querySelector('#cfg-point-val').addEventListener('input', updateSimulator);
    container.querySelector('#cfg-min-redeem').addEventListener('input', updateSimulator);
    updateSimulator();

    // Form Submit
    container.querySelector('#loyalty-config-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const updated = {
        enabled: container.querySelector('#cfg-enabled').checked,
        spendPerPoint: parseFloat(container.querySelector('#cfg-spend-per-point').value) || 100,
        pointValueRupees: parseFloat(container.querySelector('#cfg-point-val').value) || 0.50,
        minRedeemPoints: parseInt(container.querySelector('#cfg-min-redeem').value, 10) || 100,
        maxRedeemPercent: parseFloat(container.querySelector('#cfg-max-percent').value) || 50,
        expiryDays: parseInt(container.querySelector('#cfg-expiry').value, 10) || 0,
        allowPartialRedemption: container.querySelector('#cfg-partial').value === 'true'
      };
      saveConfig(updated);
      alert('✓ Loyalty Points configuration saved successfully!');
      renderPage(parentOutlet, 'points');
    });

    // Customer Points Adjustment
    container.querySelector('#btn-adj-apply').addEventListener('click', () => {
      const custSelect = container.querySelector('#adj-cust-select');
      const ptsInput = container.querySelector('#adj-points');
      const reasonInput = container.querySelector('#adj-reason');

      const custId = custSelect.value;
      const pts = parseInt(ptsInput.value, 10);
      const reason = reasonInput.value.trim() || 'Manual adjustment';

      if (!custId) {
        alert('Please select a customer first.');
        return;
      }
      if (isNaN(pts) || pts === 0) {
        alert('Please enter a valid points adjustment value.');
        return;
      }

      if (window.RetailStore) {
        const customers = window.RetailStore.getCustomers();
        const c = customers.find(x => x.id === custId);
        if (c) {
          c.loyaltyPoints = Math.max(0, (c.loyaltyPoints || 0) + pts);
          window.RetailStore.saveCustomers(customers);
          alert(`✓ Successfully updated ${c.name}'s balance by ${pts > 0 ? '+' + pts : pts} points!\nNew balance: ${c.loyaltyPoints} Pts.`);
          renderPage(parentOutlet, 'points');
        }
      }
    });
  }

  // ── 2. REWARD RULES TAB ───────────────────────────────────────────────────
  function renderRulesTab(container, parentOutlet) {
    const rules = getRules();

    container.innerHTML = `
      <div class="card p-4">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <div>
            <h3 class="font-bold" style="font-size:16px;margin:0;">Active Reward Rules & Multipliers</h3>
            <span class="text-secondary" style="font-size:13px;">Automatically trigger bonus points based on basket criteria, special events, or calendar dates.</span>
          </div>
          <button class="btn btn--primary" id="btn-add-rule">+ Create Reward Rule</button>
        </div>

        <div class="table-container">
          <table class="erp-table">
            <thead>
              <tr>
                <th>Rule Name</th>
                <th>Rule Type</th>
                <th>Trigger Criteria</th>
                <th>Bonus / Multiplier</th>
                <th>Min Bill (₹)</th>
                <th>Validity Window</th>
                <th style="text-align:center;">Status</th>
                <th style="text-align:center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${rules.map(r => `
                <tr>
                  <td><strong>${r.name}</strong></td>
                  <td><span class="pay-chip pay-chip--card">${r.type}</span></td>
                  <td class="text-secondary" style="font-size:12px;">${r.criteria}</td>
                  <td><strong class="text-brand font-mono">${r.bonusMultiplier}x Multiplier</strong></td>
                  <td class="font-mono">₹${r.minBill}</td>
                  <td class="font-mono" style="font-size:12px;">${r.startDate} to ${r.endDate}</td>
                  <td style="text-align:center;">
                    <span class="status-badge status-badge--${r.active ? 'success' : 'inactive'}">
                      ${r.active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td style="text-align:center;">
                    <div style="display:inline-flex;gap:6px;">
                      <button class="btn btn--icon btn-toggle-rule" data-id="${r.id}" title="Toggle active status">
                        ${r.active ? '⏸' : '▶'}
                      </button>
                      <button class="btn btn--icon btn-delete-rule" data-id="${r.id}" title="Delete rule" style="color:var(--text-error);">🗑</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Toggle rule
    container.querySelectorAll('.btn-toggle-rule').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const rList = getRules();
        const r = rList.find(x => x.id === id);
        if (r) {
          r.active = !r.active;
          saveRules(rList);
          renderRulesTab(container, parentOutlet);
        }
      });
    });

    // Delete rule
    container.querySelectorAll('.btn-delete-rule').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Delete this reward rule?')) {
          const rList = getRules().filter(x => x.id !== id);
          saveRules(rList);
          renderRulesTab(container, parentOutlet);
        }
      });
    });

    // Add Rule Modal
    container.querySelector('#btn-add-rule').addEventListener('click', () => {
      openAddRuleModal(parentOutlet);
    });
  }

  function openAddRuleModal(parentOutlet) {
    const modal = document.createElement('div');
    modal.className = 'pos-modal-overlay';
    modal.innerHTML = `
      <div class="pos-modal card p-4" style="max-width:540px;width:100%;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 class="font-bold" style="font-size:16px;margin:0;">➕ Add Promotional Reward Rule</h3>
          <button class="btn btn--icon" id="modal-close-btn">✕</button>
        </div>
        <form id="add-rule-form">
          <div class="form-group mb-3">
            <label class="form-label">Rule Name *</label>
            <input type="text" id="rule-name" class="pos-input" placeholder="e.g. Diwali Triple Points Rush" required />
          </div>
          <div class="grid grid-2 gap-3 mb-3">
            <div class="form-group">
              <label class="form-label">Reward Type</label>
              <select id="rule-type" class="pos-input">
                <option value="Multiplier">Point Multiplier (e.g. 2x, 3x)</option>
                <option value="Fixed Points">Fixed Bonus Points</option>
                <option value="Double Points">Double Points Special</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Multiplier Value / Points *</label>
              <input type="number" id="rule-multiplier" class="pos-input font-mono" value="2.0" step="0.5" min="1" required />
            </div>
          </div>
          <div class="form-group mb-3">
            <label class="form-label">Trigger Condition / Description *</label>
            <input type="text" id="rule-criteria" class="pos-input" placeholder="e.g. Applicable on all purchases exceeding ₹3,000 on Saturdays" required />
          </div>
          <div class="grid grid-2 gap-3 mb-4">
            <div class="form-group">
              <label class="form-label">Minimum Bill Threshold (₹)</label>
              <input type="number" id="rule-minbill" class="pos-input font-mono" value="1500" step="100" />
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select id="rule-status" class="pos-input">
                <option value="true">Active Immediately</option>
                <option value="false">Inactive / Draft</option>
              </select>
            </div>
          </div>
          <div style="display:flex;justify-content:flex-end;gap:10px;">
            <button type="button" class="btn btn--secondary" id="modal-cancel-btn">Cancel</button>
            <button type="submit" class="btn btn--primary">Save Rule</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => modal.remove();
    modal.querySelector('#modal-close-btn').addEventListener('click', closeModal);
    modal.querySelector('#modal-cancel-btn').addEventListener('click', closeModal);

    modal.querySelector('#add-rule-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const newRule = {
        id: 'RULE-' + Date.now().toString().slice(-4),
        name: modal.querySelector('#rule-name').value.trim(),
        type: modal.querySelector('#rule-type').value,
        criteria: modal.querySelector('#rule-criteria').value.trim(),
        bonusMultiplier: parseFloat(modal.querySelector('#rule-multiplier').value) || 1.0,
        minBill: parseFloat(modal.querySelector('#rule-minbill').value) || 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '2026-12-31',
        active: modal.querySelector('#rule-status').value === 'true'
      };

      const rules = getRules();
      rules.push(newRule);
      saveRules(rules);
      closeModal();
      renderPage(parentOutlet, 'rules');
    });
  }

  // ── 3. MEMBERSHIP TIERS TAB ───────────────────────────────────────────────
  function renderTiersTab(container, parentOutlet) {
    const tiers = getTiers();

    container.innerHTML = `
      <div class="card p-4">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <div>
            <h3 class="font-bold" style="font-size:16px;margin:0;">Customer Membership Tiers & Privileges</h3>
            <span class="text-secondary" style="font-size:13px;">Manage qualification spend tiers, multiplier boosts, and member-exclusive discount rates.</span>
          </div>
          <button class="btn btn--primary" id="btn-save-tiers">💾 Save Tier Settings</button>
        </div>

        <div class="grid grid-4 gap-4 mb-4">
          ${tiers.map((t, idx) => `
            <div class="card p-3" style="border-top:4px solid ${t.badgeColor};display:flex;flex-direction:column;justify-content:space-between;">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                  <span class="font-bold" style="font-size:15px;color:${t.badgeColor};">${t.name}</span>
                  <span class="pay-chip pay-chip--card" style="font-size:11px;">${t.activeMembers || 0} Members</span>
                </div>

                <div class="form-group mb-2">
                  <label class="form-label" style="font-size:12px;">Min Annual Spend (₹)</label>
                  <input type="number" class="pos-input font-mono tier-min-spend" data-idx="${idx}" value="${t.minAnnualSpend}" min="0" step="1000" />
                </div>

                <div class="form-group mb-2">
                  <label class="form-label" style="font-size:12px;">Point Multiplier</label>
                  <input type="number" class="pos-input font-mono tier-multiplier" data-idx="${idx}" value="${t.pointMultiplier}" min="1" step="0.25" />
                </div>

                <div class="form-group mb-2">
                  <label class="form-label" style="font-size:12px;">Bill Discount (%)</label>
                  <input type="number" class="pos-input font-mono tier-discount" data-idx="${idx}" value="${t.extraDiscountPercent}" min="0" max="50" step="1" />
                </div>

                <div class="form-group mb-3">
                  <label class="form-label" style="font-size:12px;">Perks & Benefits</label>
                  <textarea class="pos-input tier-perks" data-idx="${idx}" rows="2" style="font-size:12px;resize:vertical;">${t.perks}</textarea>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <div style="background:var(--bg-tertiary, #f8fafc);border:1px solid var(--border-color, #e2e8f0);border-radius:6px;padding:12px;font-size:13px;display:flex;align-items:center;gap:12px;">
          <span style="font-size:20px;">💡</span>
          <div>
            <strong>Tier Progression Engine:</strong> When enabled, RetailNext automatically upgrades customer accounts when cumulative 12-month billing crosses the qualification spend threshold.
          </div>
        </div>
      </div>
    `;

    container.querySelector('#btn-save-tiers').addEventListener('click', () => {
      const updatedTiers = [...tiers];
      container.querySelectorAll('.tier-min-spend').forEach(el => {
        const idx = parseInt(el.getAttribute('data-idx'), 10);
        updatedTiers[idx].minAnnualSpend = parseFloat(el.value) || 0;
      });
      container.querySelectorAll('.tier-multiplier').forEach(el => {
        const idx = parseInt(el.getAttribute('data-idx'), 10);
        updatedTiers[idx].pointMultiplier = parseFloat(el.value) || 1.0;
      });
      container.querySelectorAll('.tier-discount').forEach(el => {
        const idx = parseInt(el.getAttribute('data-idx'), 10);
        updatedTiers[idx].extraDiscountPercent = parseFloat(el.value) || 0;
      });
      container.querySelectorAll('.tier-perks').forEach(el => {
        const idx = parseInt(el.getAttribute('data-idx'), 10);
        updatedTiers[idx].perks = el.value.trim();
      });

      saveTiers(updatedTiers);
      alert('✓ Membership tier specifications updated successfully!');
      renderPage(parentOutlet, 'tiers');
    });
  }

  return {
    renderPage
  };

})();

