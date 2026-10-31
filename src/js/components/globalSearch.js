/**
 * RetailNext — Global Search Bar & Modal
 * Searches across Products, Customers, Suppliers, Invoices, Purchases, and Transactions.
 */

'use strict';

window.GlobalSearch = (() => {
  let searchInput = null;
  let resultsContainer = null;
  let selectedIndex = -1;
  let currentResults = [];

  function init(containerEl, onSelectResult) {
    if (!containerEl) return;
    containerEl.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.className = 'global-search';

    wrap.innerHTML = `
      <div class="global-search__box">
        <svg class="global-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input 
          type="text" 
          id="global-search-input" 
          class="global-search__input" 
          placeholder="Global Search (Products, Customers, Invoices...) [Ctrl+F]" 
          autocomplete="off" 
          spellcheck="false" 
        />
        <span class="global-search__kbd">Ctrl+F</span>
        <button id="global-search-clear" class="global-search__clear" title="Clear search" style="display:none;">&times;</button>
      </div>
      <div id="global-search-dropdown" class="global-search__dropdown" style="display:none;"></div>
    `;

    containerEl.appendChild(wrap);

    searchInput = wrap.querySelector('#global-search-input');
    resultsContainer = wrap.querySelector('#global-search-dropdown');
    const clearBtn = wrap.querySelector('#global-search-clear');

    searchInput.addEventListener('input', () => {
      const q = searchInput.value;
      if (q.trim()) {
        clearBtn.style.display = 'block';
        performSearch(q, onSelectResult);
      } else {
        clearBtn.style.display = 'none';
        closeDropdown();
      }
    });

    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearBtn.style.display = 'none';
      closeDropdown();
      searchInput.focus();
    });

    // Keyboard navigation in dropdown
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentResults.length > 0) {
          selectedIndex = (selectedIndex + 1) % currentResults.length;
          updateHighlight();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentResults.length > 0) {
          selectedIndex = (selectedIndex - 1 + currentResults.length) % currentResults.length;
          updateHighlight();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < currentResults.length) {
          selectItem(currentResults[selectedIndex], onSelectResult);
        } else if (currentResults.length > 0) {
          selectItem(currentResults[0], onSelectResult);
        }
      } else if (e.key === 'Escape') {
        closeDropdown();
      }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) {
        closeDropdown();
      }
    });
  }

  function performSearch(query, onSelectResult) {
    if (!window.RetailStore) return;
    const results = window.RetailStore.globalSearch(query);
    currentResults = results;
    selectedIndex = -1;

    if (results.length === 0) {
      resultsContainer.innerHTML = `
        <div class="search-empty">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <div>No matching products, customers, suppliers or transactions found.</div>
          <div style="font-size:11px;color:var(--color-text-tertiary);margin-top:4px;">Try searching by Name, Barcode, SKU, Mobile No, or Invoice #</div>
        </div>
      `;
      resultsContainer.style.display = 'block';
      return;
    }

    resultsContainer.innerHTML = '';
    const header = document.createElement('div');
    header.className = 'search-dropdown-header';
    header.innerHTML = `<span>Results (${results.length})</span><span>Use ↑↓ arrows to navigate, Enter to open</span>`;
    resultsContainer.appendChild(header);

    results.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = 'search-result-item';
      row.setAttribute('data-idx', idx);

      row.innerHTML = `
        <div class="search-item__tag" style="background:${item.color}22; color:${item.color}; border:1px solid ${item.color}44;">
          ${item.type}
        </div>
        <div class="search-item__content">
          <div class="search-item__title">${escapeHtml(item.title)}</div>
          <div class="search-item__subtitle">${escapeHtml(item.subtitle)}</div>
        </div>
        ${item.badge ? `<div class="search-item__badge">${escapeHtml(item.badge)}</div>` : ''}
      `;

      row.addEventListener('click', () => {
        selectItem(item, onSelectResult);
      });

      row.addEventListener('mouseenter', () => {
        selectedIndex = idx;
        updateHighlight();
      });

      resultsContainer.appendChild(row);
    });

    resultsContainer.style.display = 'block';
  }

  function updateHighlight() {
    const items = resultsContainer.querySelectorAll('.search-result-item');
    items.forEach((el, idx) => {
      el.classList.toggle('active', idx === selectedIndex);
      if (idx === selectedIndex) {
        el.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  function selectItem(item, onSelectResult) {
    closeDropdown();
    if (onSelectResult) {
      onSelectResult(item);
    }
  }

  function closeDropdown() {
    if (resultsContainer) {
      resultsContainer.style.display = 'none';
      selectedIndex = -1;
    }
  }

  function focus() {
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return { init, focus, closeDropdown };
})();

