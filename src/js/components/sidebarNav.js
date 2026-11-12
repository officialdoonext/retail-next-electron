/**
 * Retail Next — Collapsible Sidebar Accordion Navigation
 *
 * Implements the full business manager navigation hierarchy:
 * 1. Dashboard (/dashboard)
 * 2. POS Billing (/pos)
 * 3. Stores Directory (/stores)
 * 4. Sales Manager (/sales, /sales/employee-sales, /sales/counter-sales)
 * 5. Product Manager (/categories, /variations, /products, /barcode)
 * 6. Return & Exchange Manager (/returns, /returns/exchanges)
 * 7. Stock Manager (/stock/warehouse, /stock, /stock/transfers)
 * 8. Customer Manager (/customers, /customers/individual)
 * 9. Discount Manager (/discounts/order-coupons, /discounts/product-coupons, /discounts/customer-coupons)
 * 10. Vendors Manager (/vendors, /vendors/orders, /vendors/invoices, /vendors/due)
 * 11. Staff Manager (/staff)
 * 12. Employee HR Manager (/employees, /employees/attendance, /employees/payroll, /employees/id-cards, /employees/leaves, /employees/advances)
 */

'use strict';

(function(global) {

  const MENU_STRUCTURE = [
    // Standalone direct launchers
    {
      type: 'item',
      title: 'Dashboard',
      route: '/dashboard',
      icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>`
    },
    {
      type: 'item',
      title: 'POS Billing',
      route: '/pos',
      badge: 'FAST',
      badgeClass: 'badge-purple',
      icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 3h16a2 2 0 0 1 2 2v6a10 10 0 0 1-10 10A10 10 0 0 1 2 11V5a2 2 0 0 1 2-2z"/><polyline points="8 10 12 14 16 10"/></svg>`
    },
    {
      type: 'item',
      title: 'Stores Directory',
      route: '/stores',
      icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
    },

    // Accordion Managers
    {
      type: 'accordion',
      id: 'acc-sales',
      title: 'Sales Manager',
      icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
      subitems: [
        { title: 'Sales (Invoices)', route: '/sales' },
        { title: 'Employee Sales', route: '/sales/employee-sales' },
        { title: 'Counter Sales', route: '/sales/counter-sales' }
      ]
    },
    {
      type: 'accordion',
      id: 'acc-product',
      title: 'Product Manager',
      icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
      subitems: [
        { title: 'Categories', route: '/categories' },
        { title: 'Variations', route: '/variations' },
        { title: 'Products Catalog', route: '/products' },
        { title: 'Barcode Generator', route: '/barcode' }
      ]
    },
    {
      type: 'accordion',
      id: 'acc-return',
      title: 'Return & Exchange',
      icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>`,
      subitems: [
        { title: 'Returns', route: '/returns' },
        { title: 'Exchanges', route: '/returns/exchanges' }
      ]
    },
    {
      type: 'accordion',
      id: 'acc-stock',
      title: 'Stock Manager',
      icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M16.5 9.4 7.55 4.24a1.78 1.78 0 0 0-2.5 1.55v12.42a1.78 1.78 0 0 0 2.5 1.55L16.5 14.6a1.78 1.78 0 0 0 0-3.2z"/><path d="M21 6v12"/></svg>`,
      subitems: [
        { title: 'Warehouse Stocks', route: '/stock/warehouse' },
        { title: 'Store Stocks', route: '/stock' },
        { title: 'Stock Transfers', route: '/stock/transfers' }
      ]
    },
    {
      type: 'accordion',
      id: 'acc-customer',
      title: 'Customer Manager',
      icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      subitems: [
        { title: 'Customer Directory', route: '/customers' },
        { title: 'Individual Customer 360', route: '/customers/individual' }
      ]
    },
    {
      type: 'accordion',
      id: 'acc-discount',
      title: 'Discount Manager',
      icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="2"/><circle cx="15" cy="15" r="2"/><line x1="8" y1="16" x2="16" y2="8"/><rect width="20" height="14" x="2" y="5" rx="2"/></svg>`,
      subitems: [
        { title: 'Order Coupons', route: '/discounts/order-coupons' },
        { title: 'Product Coupons', route: '/discounts/product-coupons' },
        { title: 'Customer Coupons', route: '/discounts/customer-coupons' }
      ]
    },
    {
      type: 'accordion',
      id: 'acc-vendors',
      title: 'Vendors Manager',
      icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
      subitems: [
        { title: 'Vendors Directory', route: '/vendors' },
        { title: 'Purchase Orders', route: '/vendors/orders' },
        { title: 'Vendor Invoices', route: '/vendors/invoices' },
        { title: 'Vendor Dues', route: '/vendors/due' }
      ]
    },
    {
      type: 'item',
      title: 'Staff Manager',
      route: '/staff',
      icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`
    },
    {
      type: 'accordion',
      id: 'acc-hr',
      title: 'Employee HR Manager',
      icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      subitems: [
        { title: 'Employee Directory', route: '/employees' },
        { title: 'Attendance & Holidays', route: '/employees/attendance' },
        { title: 'Payroll & Salary', route: '/employees/payroll' },
        { title: 'ID Card Badges', route: '/employees/id-cards' },
        { title: 'Leaves Management', route: '/employees/leaves' },
        { title: 'Advances & Repayment', route: '/employees/advances' }
      ]
    }
  ];

  class SidebarNav {
    constructor(containerEl) {
      this.container = containerEl;
      this.isCollapsed = false;
      this.activeRoute = '/dashboard';
      this.openAccordions = new Set(['acc-sales', 'acc-product']);
    }

    render() {
      if (!this.container) return;

      this.container.innerHTML = `
        <div class="sidebar-header">
          <a href="#/dashboard" class="sidebar-brand">
            <div class="sidebar-brand-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <span class="sidebar-brand-text">Retail Next</span>
          </a>
          <button class="sidebar-toggle-btn" id="sidebar-collapse-toggle" title="Toggle Sidebar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
        </div>

        <nav class="sidebar-nav" id="sidebar-nav-list">
          ${this._renderMenuItems()}
        </nav>
      `;

      this._bindEvents();
    }

    _renderMenuItems() {
      return MENU_STRUCTURE.map(item => {
        if (item.type === 'item') {
          const isActive = this.activeRoute === item.route;
          return `
            <a href="#${item.route}" class="nav-item ${isActive ? 'active' : ''}" data-route="${item.route}">
              <span class="nav-icon">${item.icon}</span>
              <span class="nav-label">${item.title}</span>
              ${item.badge ? `<span class="nav-badge ${item.badgeClass || ''}">${item.badge}</span>` : ''}
            </a>
          `;
        }

        if (item.type === 'accordion') {
          const isOpen = this.openAccordions.has(item.id) || item.subitems.some(s => s.route === this.activeRoute);
          const hasActiveChild = item.subitems.some(s => s.route === this.activeRoute);

          return `
            <div class="accordion-group" data-id="${item.id}">
              <div class="accordion-header ${isOpen ? 'open' : ''} ${hasActiveChild ? 'has-active' : ''}">
                <span class="nav-icon">${item.icon}</span>
                <span class="nav-label">${item.title}</span>
                <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
              <div class="accordion-body ${isOpen ? 'open' : ''}">
                ${item.subitems.map(sub => {
                  const isSubActive = this.activeRoute === sub.route;
                  return `
                    <a href="#${sub.route}" class="accordion-subitem ${isSubActive ? 'active' : ''}" data-route="${sub.route}">
                      <span>${sub.title}</span>
                    </a>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }
        return '';
      }).join('');
    }

    _bindEvents() {
      // Toggle collapse/expand sidebar
      const toggleBtn = document.getElementById('sidebar-collapse-toggle');
      if (toggleBtn) {
        toggleBtn.onclick = () => {
          this.isCollapsed = !this.isCollapsed;
          this.container.classList.toggle('collapsed', this.isCollapsed);
        };
      }

      // Accordion click handlers
      this.container.querySelectorAll('.accordion-header').forEach(header => {
        header.onclick = (e) => {
          e.stopPropagation();
          const group = header.closest('.accordion-group');
          const id = group.getAttribute('data-id');
          const body = group.querySelector('.accordion-body');

          if (this.openAccordions.has(id)) {
            this.openAccordions.delete(id);
            header.classList.remove('open');
            body.classList.remove('open');
          } else {
            this.openAccordions.add(id);
            header.classList.add('open');
            body.classList.add('open');
          }
        };
      });
    }

    setActiveRoute(route) {
      this.activeRoute = route;

      // Automatically open the parent accordion if the subitem matches
      MENU_STRUCTURE.forEach(item => {
        if (item.type === 'accordion' && item.subitems.some(s => s.route === route)) {
          this.openAccordions.add(item.id);
        }
      });

      // Update active classes
      const navList = document.getElementById('sidebar-nav-list');
      if (navList) {
        navList.innerHTML = this._renderMenuItems();
        this._bindEvents();
      }
    }
  }

  global.SidebarNav = SidebarNav;
})(window);

