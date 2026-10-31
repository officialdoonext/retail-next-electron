/**
 * RetailNext — Desktop Top Menu Bar
 * Traditional desktop cascading menu system (File, Masters, Transactions, etc.)
 */

'use strict';

window.TopMenuBar = (() => {
  let isAnyMenuOpen = false;
  let activeMenuId = null;

  function init(containerEl, onSelectRoute) {
    if (!containerEl) return;
    containerEl.innerHTML = '';

    const menuBarEl = document.createElement('div');
    menuBarEl.className = 'top-menubar';

    window.RETAIL_MENUS.forEach(menu => {
      const topBtn = document.createElement('div');
      topBtn.className = 'menubar-item';
      topBtn.setAttribute('data-menu-id', menu.id);

      // Render mnemonic underline if applicable (e.g. <u>F</u>ile)
      const label = menu.label;
      const mIdx = label.indexOf(menu.mnemonic);
      if (mIdx !== -1) {
        topBtn.innerHTML = `${label.slice(0, mIdx)}<u>${menu.mnemonic}</u>${label.slice(mIdx + 1)}`;
      } else {
        topBtn.textContent = label;
      }

      // Dropdown Container
      const dropdown = buildDropdown(menu.items, onSelectRoute);
      topBtn.appendChild(dropdown);

      // Click toggles menu
      topBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (activeMenuId === menu.id) {
          closeAllMenus();
        } else {
          openMenu(menu.id);
        }
      });

      // Hover when another menu is open automatically switches
      topBtn.addEventListener('mouseenter', () => {
        if (isAnyMenuOpen && activeMenuId !== menu.id) {
          openMenu(menu.id);
        }
      });

      menuBarEl.appendChild(topBtn);
    });

    containerEl.appendChild(menuBarEl);

    // Global click outside closes menus
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.menubar-item')) {
        closeAllMenus();
      }
    });

    // Esc closes menus
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isAnyMenuOpen) {
        closeAllMenus();
      }
    });
  }

  function openMenu(menuId) {
    closeAllMenus();
    const btn = document.querySelector(`.menubar-item[data-menu-id="${menuId}"]`);
    if (btn) {
      btn.classList.add('open');
      isAnyMenuOpen = true;
      activeMenuId = menuId;
    }
  }

  function closeAllMenus() {
    document.querySelectorAll('.menubar-item.open').forEach(el => el.classList.remove('open'));
    document.querySelectorAll('.menubar-submenu.show').forEach(el => el.classList.remove('show'));
    isAnyMenuOpen = false;
    activeMenuId = null;
  }

  function buildDropdown(items, onSelectRoute) {
    const dropdown = document.createElement('div');
    dropdown.className = 'menubar-dropdown';

    items.forEach(item => {
      if (item.type === 'separator') {
        const sep = document.createElement('div');
        sep.className = 'dropdown-separator';
        dropdown.appendChild(sep);
        return;
      }

      const row = document.createElement('div');
      row.className = 'dropdown-item' + (item.children ? ' has-submenu' : '');

      const labelSpan = document.createElement('span');
      labelSpan.className = 'dropdown-item__label';
      labelSpan.textContent = item.label;
      row.appendChild(labelSpan);

      if (item.shortcut) {
        const scSpan = document.createElement('span');
        scSpan.className = 'dropdown-item__shortcut';
        scSpan.textContent = item.shortcut;
        row.appendChild(scSpan);
      }

      if (item.children) {
        const chevron = document.createElement('span');
        chevron.className = 'dropdown-item__arrow';
        chevron.innerHTML = `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>`;
        row.appendChild(chevron);

        // Submenu
        const submenu = buildSubmenu(item.children, onSelectRoute);
        row.appendChild(submenu);

        // Click on parent with children also toggles submenu popover
        row.addEventListener('click', (e) => {
          e.stopPropagation();
          const isShow = submenu.classList.contains('show');
          dropdown.querySelectorAll('.menubar-submenu').forEach(s => s.classList.remove('show'));
          if (!isShow) submenu.classList.add('show');
        });
      } else {
        row.addEventListener('click', (e) => {
          e.stopPropagation();
          closeAllMenus();
          if (onSelectRoute) {
            onSelectRoute(item.route || item.id, item.label, item);
          }
        });
      }

      dropdown.appendChild(row);
    });

    return dropdown;
  }

  function buildSubmenu(subItems, onSelectRoute) {
    const subDropdown = document.createElement('div');
    subDropdown.className = 'menubar-submenu';

    subItems.forEach(sub => {
      if (sub.type === 'separator') {
        const sep = document.createElement('div');
        sep.className = 'dropdown-separator';
        subDropdown.appendChild(sep);
        return;
      }

      const row = document.createElement('div');
      row.className = 'dropdown-item';

      const labelSpan = document.createElement('span');
      labelSpan.className = 'dropdown-item__label';
      labelSpan.textContent = sub.label;
      row.appendChild(labelSpan);

      if (sub.shortcut) {
        const scSpan = document.createElement('span');
        scSpan.className = 'dropdown-item__shortcut';
        scSpan.textContent = sub.shortcut;
        row.appendChild(scSpan);
      }

      row.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllMenus();
        if (onSelectRoute) {
          onSelectRoute(sub.route || sub.id, sub.label, sub);
        }
      });

      subDropdown.appendChild(row);
    });

    return subDropdown;
  }

  return { init, closeAllMenus, openMenu };
})();

