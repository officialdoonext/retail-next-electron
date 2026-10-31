/**
 * RetailNext — Workspace Tab Manager
 * Manages central workspace tabs (Dashboard, New Bill, Add Product, etc.)
 */

'use strict';

window.WorkspaceTabs = (() => {
  const tabs = [];
  let activeTabId = null;

  function init(containerEl, onTabChange) {
    window._tabContainer = containerEl;
    window._onTabChange = onTabChange;

    // Start with Dashboard tab
    openTab({
      id: 'dashboard',
      label: 'Dashboard',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
      closable: false
    });
  }

  function openTab(tabConfig) {
    const existing = tabs.find(t => t.id === tabConfig.id);
    if (existing) {
      activateTab(existing.id);
      return;
    }

    tabs.push({
      id: tabConfig.id,
      label: tabConfig.label || 'Tab',
      icon: tabConfig.icon || `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`,
      closable: tabConfig.closable !== false,
      data: tabConfig.data || {}
    });

    renderTabs();
    activateTab(tabConfig.id);
  }

  function activateTab(tabId) {
    activeTabId = tabId;
    renderTabs();
    if (window._onTabChange) {
      const currentTab = tabs.find(t => t.id === tabId);
      window._onTabChange(tabId, currentTab ? currentTab.data : null);
    }
  }

  function closeTab(tabId, e) {
    if (e) e.stopPropagation();
    const idx = tabs.findIndex(t => t.id === tabId);
    if (idx === -1) return;

    // Do not close unclosable tabs
    if (!tabs[idx].closable) return;

    tabs.splice(idx, 1);

    if (activeTabId === tabId) {
      // Activate previous tab or dashboard
      const nextTab = tabs[Math.max(0, idx - 1)] || tabs[0];
      if (nextTab) {
        activateTab(nextTab.id);
      }
    } else {
      renderTabs();
    }
  }

  function renderTabs() {
    const el = window._tabContainer;
    if (!el) return;

    el.innerHTML = '';
    tabs.forEach(tab => {
      const tabEl = document.createElement('div');
      tabEl.className = 'workspace-tab' + (tab.id === activeTabId ? ' active' : '');
      tabEl.setAttribute('data-tab-id', tab.id);

      const iconWrap = document.createElement('span');
      iconWrap.className = 'workspace-tab__icon';
      iconWrap.innerHTML = tab.icon;

      const titleWrap = document.createElement('span');
      titleWrap.className = 'workspace-tab__title';
      titleWrap.textContent = tab.label;

      tabEl.appendChild(iconWrap);
      tabEl.appendChild(titleWrap);

      if (tab.closable) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'workspace-tab__close';
        closeBtn.innerHTML = '&times;';
        closeBtn.title = 'Close tab (Ctrl+W)';
        closeBtn.addEventListener('click', (e) => closeTab(tab.id, e));
        tabEl.appendChild(closeBtn);
      }

      tabEl.addEventListener('click', () => activateTab(tab.id));
      el.appendChild(tabEl);
    });
  }

  function getActiveTabId() {
    return activeTabId;
  }

  function closeCurrentTab() {
    if (activeTabId && activeTabId !== 'dashboard') {
      closeTab(activeTabId);
    }
  }

  return {
    init,
    openTab,
    activateTab,
    closeTab,
    closeCurrentTab,
    getActiveTabId
  };
})();

