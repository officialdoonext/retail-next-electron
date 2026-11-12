/**
 * Retail Next — Central Client-Side Router
 *
 * Routes supported:
 *   /dashboard
 *   /pos
 *   /stores
 *   /sales
 *   /sales/employee-sales
 *   /sales/counter-sales
 *   /categories
 *   /variations
 *   /products
 *   /barcode
 *   /returns
 *   /returns/exchanges
 *   /stock/warehouse
 *   /stock
 *   /stock/transfers
 *   /customers
 *   /customers/individual
 *   /discounts/order-coupons
 *   /discounts/product-coupons
 *   /discounts/customer-coupons
 *   /vendors
 *   /vendors/orders
 *   /vendors/invoices
 *   /vendors/due
 *   /staff
 *   /employees
 *   /employees/attendance
 *   /employees/payroll
 *   /employees/id-cards
 *   /employees/leaves
 *   /employees/advances
 */

'use strict';

(function(global) {

  class Router {
    constructor(outletEl, sidebarInstance) {
      this.outlet = outletEl;
      this.sidebar = sidebarInstance;
      this.currentRoute = '/dashboard';

      this.routes = {
        '/login': global.LoginPage,
        '/dashboard': global.DashboardPage,
        '/pos': global.PosBillingPage,
        '/stores': global.StoresPage,
        '/sales': global.SalesInvoicesPage,
        '/sales/employee-sales': global.EmployeeSalesPage,
        '/sales/counter-sales': global.CounterSalesPage,
        '/categories': global.CategoriesPage,
        '/variations': global.VariationsPage,
        '/products': global.ProductsCatalogPage,
        '/barcode': global.BarcodeGeneratorPage,
        '/returns': global.ReturnsPage,
        '/returns/exchanges': global.ExchangesPage,
        '/stock/warehouse': global.WarehouseStockPage,
        '/stock': global.StoreStockPage,
        '/stock/transfers': global.StockTransfersPage,
        '/customers': global.CustomersDirectoryPage,
        '/customers/individual': global.Customer360Page,
        '/discounts/order-coupons': global.OrderCouponsPage,
        '/discounts/product-coupons': global.ProductCouponsPage,
        '/discounts/customer-coupons': global.CustomerCouponsPage,
        '/vendors': global.VendorsDirectoryPage,
        '/vendors/orders': global.PurchaseOrdersPage,
        '/vendors/invoices': global.VendorInvoicesPage,
        '/vendors/due': global.VendorDuesPage,
        '/staff': global.StaffManagerPage,
        '/employees': global.EmployeeDirectoryPage,
        '/employees/attendance': global.AttendancePage,
        '/employees/payroll': global.PayrollPage,
        '/employees/id-cards': global.IdCardsPage,
        '/employees/leaves': global.LeavesPage,
        '/employees/advances': global.AdvancesPage
      };

      // Listen to window hashchange
      window.addEventListener('hashchange', () => this.handleHashChange());
    }

    init() {
      this.handleHashChange();
    }

    handleHashChange() {
      let hash = window.location.hash.replace(/^#/, '');
      if (!hash || hash === '/') {
        const isAuth = global.apiService ? global.apiService.isAuthenticated() : false;
        hash = isAuth ? '/dashboard' : '/login';
      }

      // Normalize
      const cleanPath = hash.split('?')[0];
      this.navigate(cleanPath, false);
    }

    navigate(routePath, updateHash = true) {
      const path = routePath.startsWith('/') ? routePath : `/${routePath}`;
      const isAuth = global.apiService ? global.apiService.isAuthenticated() : false;
      const sidebarEl = document.getElementById('app-sidebar');
      const headerEl = document.getElementById('app-header');
      const statusbarEl = document.getElementById('app-statusbar');

      if (path === '/login') {
        if (sidebarEl) sidebarEl.style.display = 'none';
        if (headerEl) headerEl.style.display = 'none';
        if (statusbarEl) statusbarEl.style.display = 'none';
      } else {
        if (!isAuth) {
          // If not logged in, enforce redirect to /login
          this.currentRoute = '/login';
          window.location.hash = '#/login';
          if (sidebarEl) sidebarEl.style.display = 'none';
          if (headerEl) headerEl.style.display = 'none';
          if (statusbarEl) statusbarEl.style.display = 'none';
          if (this.outlet && global.LoginPage) {
            global.LoginPage.render(this.outlet);
          }
          document.title = 'Retail Next — Sign In';
          return;
        }

        if (sidebarEl) sidebarEl.style.display = 'flex';
        if (headerEl) headerEl.style.display = 'flex';
        if (statusbarEl) statusbarEl.style.display = 'flex';
      }

      const pageHandler = this.routes[path] || (isAuth ? this.routes['/dashboard'] : this.routes['/login']);

      this.currentRoute = path;
      if (updateHash) {
        window.location.hash = `#${path}`;
      }

      if (this.sidebar && typeof this.sidebar.setActiveRoute === 'function') {
        this.sidebar.setActiveRoute(path);
      }

      if (this.outlet) {
        this.outlet.scrollTop = 0;
        if (pageHandler && typeof pageHandler.render === 'function') {
          pageHandler.render(this.outlet);
        } else {
          this.outlet.innerHTML = `<div class="card" style="padding:40px;text-align:center;"><h2>Page Not Found</h2><p style="color:var(--slate-500);margin-top:6px;">Route ${path} could not be resolved.</p></div>`;
        }
      }

      // Update document title
      document.title = `Retail Next — ${path.slice(1).replace(/-/g, ' ').toUpperCase()}`;
    }

    refreshCurrentPage() {
      this.navigate(this.currentRoute, false);
    }
  }

  global.Router = Router;
})(window);
