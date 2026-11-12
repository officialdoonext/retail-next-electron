/**
 * Retail Next — Core REST API Client Service
 * Endpoint: https://retailnext.doonext.app
 *
 * Implements all endpoints according to Retail Next API Documentation:
 * - Multi-tenant context (active business & active store headers/cookies)
 * - Strict PAGE_SIZE = 24
 * - Electron IPC bridge integration with browser fetch fallback
 * - Graceful fallback / demo data for unauthorized / cold states
 */

'use strict';

(function(global) {
  const BASE_URL = (global.RETAILNEXT_CONFIG && global.RETAILNEXT_CONFIG.apiBaseUrl) || 'https://retailnext.doonext.app';
  const PAGE_SIZE = (global.RETAILNEXT_CONFIG && global.RETAILNEXT_CONFIG.pageSize) || 24;

  class ApiService {
    constructor() {
      this.baseUrl = BASE_URL;
      this.pageSize = PAGE_SIZE;

      // In-memory & localStorage session state
      this.user = this._loadJson('retailnext_user', null);
      this.staff = this._loadJson('retailnext_staff', null);
      this.activeStore = this._loadJson('retailnext_active_store', null);
      this.activeBusiness = this._loadJson('retailnext_active_business', null);
      this.staffRole = localStorage.getItem('staff_role') || null;
      this.staffName = localStorage.getItem('staff_name') || null;
      this.authToken = localStorage.getItem('retailnext_auth_token') || null;
      this.isOnline = true;
    }

    isAuthenticated() {
      return !!(
        this.user ||
        this.authToken ||
        this.staffRole ||
        localStorage.getItem('staff_role') ||
        localStorage.getItem('retailnext_user')
      );
    }

    _loadJson(key, defaultValue) {
      try {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : defaultValue;
      } catch (_) {
        return defaultValue;
      }
    }

    _saveJson(key, value) {
      try {
        if (value === null || value === undefined) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, JSON.stringify(value));
        }
      } catch (_) {}
    }

    // ── Low-Level HTTP Request Dispatcher ──────────────────────────────────────
    async request(endpoint, options = {}) {
      const method = (options.method || 'GET').toUpperCase();
      const headers = {
        'Accept': 'application/json',
        ...(this.activeStore?.id ? { 'X-Store-Id': this.activeStore.id } : {}),
        ...(this.activeBusiness?.id ? { 'X-Business-Id': this.activeBusiness.id } : {}),
        ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {}),
        ...(options.headers || {})
      };

      // 1. If running inside Electron desktop shell, use retailAPI bridge for seamless cookie/CORS handling
      if (global.retailAPI && typeof global.retailAPI.apiRequest === 'function') {
        try {
          const res = await global.retailAPI.apiRequest({
            endpoint,
            method,
            headers,
            body: options.body,
            params: options.params,
            baseUrl: this.baseUrl
          });
          this.isOnline = true;
          return res;
        } catch (err) {
          console.warn('[ApiService] Bridge error:', err.message);
        }
      }

      // 2. Direct fetch fallback (for browser preview or direct HTTPS)
      try {
        let url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
        if (options.params) {
          const urlObj = new URL(url);
          Object.entries(options.params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') {
              urlObj.searchParams.append(k, String(v));
            }
          });
          url = urlObj.toString();
        }

        let body = options.body;
        if (body && typeof body === 'object' && !(body instanceof FormData)) {
          headers['Content-Type'] = 'application/json';
          body = JSON.stringify(body);
        }

        const response = await fetch(url, {
          method,
          headers,
          body,
          credentials: 'include'
        });

        const contentType = response.headers.get('content-type') || '';
        let data = null;
        if (contentType.includes('application/json')) {
          data = await response.json().catch(() => null);
        } else {
          data = await response.text().catch(() => '');
        }

        this.isOnline = true;
        return {
          ok: response.ok,
          status: response.status,
          data,
          error: !response.ok ? (data?.error || data?.message || `HTTP ${response.status}`) : null
        };
      } catch (err) {
        this.isOnline = false;
        console.warn(`[ApiService] Network error on ${method} ${endpoint}:`, err.message);
        return {
          ok: false,
          status: 0,
          data: null,
          error: err.message
        };
      }
    }

    // ── 1. Authentication APIs ─────────────────────────────────────────────────
    async login(email, password) {
      const res = await this.request('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      });
      if (res.ok && res.data && res.data.success !== false) {
        if (res.data.user) {
          this.user = res.data.user;
          this._saveJson('retailnext_user', this.user);
        }
        if (res.data.business) {
          this.activeBusiness = res.data.business;
          this._saveJson('retailnext_active_business', this.activeBusiness);
        }
        const sessionToken = res.data.token || res.cookies?.auth_session;
        if (sessionToken) {
          this.authToken = sessionToken;
          localStorage.setItem('retailnext_auth_token', sessionToken);
        }
        localStorage.setItem('staff_role', 'Admin');
        localStorage.removeItem('staff_access');
        localStorage.removeItem('staff_name');
        this.staffRole = 'Admin';
      }
      return res;
    }

    async register(payload) {
      const res = await this.request('/api/auth/register', {
        method: 'POST',
        body: payload
      });
      if (res.ok && res.data && res.data.success !== false) {
        if (res.data.user) {
          this.user = res.data.user;
          this._saveJson('retailnext_user', this.user);
        }
        if (res.data.business) {
          this.activeBusiness = res.data.business;
          this._saveJson('retailnext_active_business', this.activeBusiness);
        }
        const sessionToken = res.data.token || res.cookies?.auth_session;
        if (sessionToken) {
          this.authToken = sessionToken;
          localStorage.setItem('retailnext_auth_token', sessionToken);
        }
        localStorage.setItem('staff_role', 'Admin');
        localStorage.removeItem('staff_access');
        localStorage.removeItem('staff_name');
        this.staffRole = 'Admin';
      }
      return res;
    }

    async staffCheckMobile(mobile) {
      const cleanMobile = String(mobile).replace(/\D/g, '');
      return await this.request('/api/auth/staff-login', {
        method: 'POST',
        body: { action: 'check-mobile', mobile: cleanMobile }
      });
    }

    async staffVerifyMpin(mobile, mpin) {
      const cleanMobile = String(mobile).replace(/\D/g, '');
      const res = await this.request('/api/auth/staff-login', {
        method: 'POST',
        body: { action: 'verify-mpin', mobile: cleanMobile, mpin: String(mpin).trim() }
      });
      if (res.ok && res.data && res.data.success !== false) {
        localStorage.setItem('staff_role', 'Staff');
        this.staffRole = 'Staff';
        if (res.data.staffName) {
          localStorage.setItem('staff_name', res.data.staffName);
          this.staffName = res.data.staffName;
        }
        const sessionToken = res.data.token || res.cookies?.auth_session;
        if (sessionToken) {
          this.authToken = sessionToken;
          localStorage.setItem('retailnext_auth_token', sessionToken);
        }
      }
      return res;
    }

    async getMe() {
      const res = await this.request('/api/auth/me');
      if (res.ok && res.data) {
        if (res.data.user) {
          this.user = res.data.user;
          this._saveJson('retailnext_user', this.user);
        }
        if (res.data.staff) {
          this.staff = res.data.staff;
          this._saveJson('retailnext_staff', this.staff);
        }
        if (res.data.store) {
          this.activeStore = res.data.store;
          this._saveJson('retailnext_active_store', this.activeStore);
        }
        if (res.data.business) {
          this.activeBusiness = res.data.business;
          this._saveJson('retailnext_active_business', this.activeBusiness);
        }
      }
      return res;
    }

    async logout() {
      try {
        await this.request('/api/auth/logout', { method: 'POST' });
      } catch (_) {}
      this.user = null;
      this.staff = null;
      this.activeBusiness = null;
      this.activeStore = null;
      this.authToken = null;
      this.staffRole = null;
      this.staffName = null;

      localStorage.removeItem('retailnext_user');
      localStorage.removeItem('retailnext_staff');
      localStorage.removeItem('retailnext_active_business');
      localStorage.removeItem('retailnext_active_store');
      localStorage.removeItem('retailnext_auth_token');
      localStorage.removeItem('staff_role');
      localStorage.removeItem('staff_name');
      localStorage.removeItem('staff_access');

      return { ok: true };
    }

    // ── 2. Dashboard APIs ──────────────────────────────────────────────────────
    async getDashboardSummary(period = 'today', storeId = null) {
      const sId = storeId || this.activeStore?.id;
      const res = await this.request('/api/dashboard/summary', {
        params: { period, ...(sId ? { storeId: sId } : {}) }
      });
      if (res.ok && res.data) return res.data;

      // Realistic Fallback Data when unauthorized or no records yet
      return {
        success: true,
        period: period,
        kpis: {
          totalRevenue: 54820.00,
          netRevenue: 52140.00,
          totalOrders: 42,
          averageOrderValue: 1305.23,
          totalRefunds: 2680.00
        },
        tenderBreakdown: {
          CASH: 19450.00,
          UPI: 26890.00,
          CARD: 8480.00,
          CREDIT_NOTE: 0.00
        },
        lowStockAlerts: [
          { id: 'p1', name: 'Men Cotton Polo T-Shirt (Navy)', sku: 'POLO-BLU-L', currentStock: 3, minStock: 10 },
          { id: 'p2', name: 'Slim Fit Chino Trousers 32', sku: 'CHN-BEI-32', currentStock: 2, minStock: 8 },
          { id: 'p3', name: 'Wireless Barcode Scanner 2.4G', sku: 'ACC-WLS-01', currentStock: 1, minStock: 5 },
          { id: 'p4', name: 'Thermal Billing Rolls 80mm', sku: 'STN-ROL-80', currentStock: 4, minStock: 20 }
        ]
      };
    }

    // ── 3. Sales & POS Billing APIs ────────────────────────────────────────────
    async getOrders(params = {}) {
      const query = {
        page: params.page || 1,
        limit: params.limit || this.pageSize,
        ...(params.search ? { search: params.search } : {}),
        ...(params.paymentMethod ? { paymentMethod: params.paymentMethod } : {}),
        ...(params.startDate ? { startDate: params.startDate } : {}),
        ...(params.endDate ? { endDate: params.endDate } : {})
      };
      const res = await this.request('/api/orders', { params: query });
      if (res.ok && res.data && res.data.orders) return res.data;

      // Fallback 24 orders demo
      return this._generateMockOrders(query.page, query.limit, query.search);
    }

    async createOrder(orderData) {
      return await this.request('/api/orders', {
        method: 'POST',
        body: orderData
      });
    }

    async getSavedBills() {
      const res = await this.request('/api/saved-bills');
      if (res.ok && res.data) return res.data;
      const stored = this._loadJson('retailnext_saved_bills', []);
      return { success: true, bills: stored };
    }

    async saveBill(billData) {
      const res = await this.request('/api/saved-bills', {
        method: 'POST',
        body: billData
      });
      if (res.ok) return res;
      // Local fallback for offline carts
      const bills = this._loadJson('retailnext_saved_bills', []);
      bills.push({ ...billData, id: 'sb_' + Date.now(), createdAt: Date.now() });
      this._saveJson('retailnext_saved_bills', bills);
      return { ok: true, success: true };
    }

    // ── 4. Products, Categories & Variations APIs ──────────────────────────────
    async getProducts(params = {}) {
      const query = {
        page: params.page || 1,
        limit: params.limit || this.pageSize,
        ...(params.search ? { search: params.search } : {}),
        ...(params.categoryId ? { categoryId: params.categoryId } : {})
      };
      const res = await this.request('/api/products', { params: query });
      if (res.ok && res.data && res.data.products) return res.data;

      return this._generateMockProducts(query.page, query.limit, query.search);
    }

    async createProduct(productData) {
      return await this.request('/api/products', {
        method: 'POST',
        body: productData
      });
    }

    async updateProduct(productData) {
      return await this.request('/api/products', {
        method: 'PUT',
        body: productData
      });
    }

    async deleteProduct(id) {
      return await this.request(`/api/products?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    }

    async bulkUploadProducts(formData) {
      return await this.request('/api/products/bulk', {
        method: 'POST',
        body: formData
      });
    }

    async getCategories() {
      const res = await this.request('/api/categories');
      if (res.ok && res.data) return res.data;
      return {
        success: true,
        categories: [
          { id: 'cat-1', name: 'Menswear & Apparel', code: 'APP-M', parentId: null, productCount: 45, status: 'Active' },
          { id: 'cat-2', name: 'Womenswear & Ethnic', code: 'APP-W', parentId: null, productCount: 38, status: 'Active' },
          { id: 'cat-3', name: 'Footwear & Shoes', code: 'FTW', parentId: null, productCount: 22, status: 'Active' },
          { id: 'cat-4', name: 'Accessories & Watches', code: 'ACC', parentId: null, productCount: 19, status: 'Active' },
          { id: 'cat-5', name: 'Home Essentials', code: 'HME', parentId: null, productCount: 14, status: 'Active' },
          { id: 'cat-6', name: 'Personal Care & Cosmetics', code: 'COS', parentId: null, productCount: 16, status: 'Active' }
        ]
      };
    }

    async createCategory(categoryData) {
      return await this.request('/api/categories', {
        method: 'POST',
        body: categoryData
      });
    }

    async getVariations() {
      const res = await this.request('/api/variations');
      if (res.ok && res.data) return res.data;
      return {
        success: true,
        variations: [
          { id: 'var-1', name: 'Garment Sizes', values: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'] },
          { id: 'var-2', name: 'Waist Measurements', values: ['28', '30', '32', '34', '36', '38', '40'] },
          { id: 'var-3', name: 'Standard Colors', values: ['Black', 'White', 'Navy Blue', 'Olive Green', 'Crimson Red', 'Beige'] },
          { id: 'var-4', name: 'Fabric Material', values: ['100% Pure Cotton', 'Linen Blend', 'Denim Cotton', 'Polyester Terry'] }
        ]
      };
    }

    async createVariation(variationData) {
      return await this.request('/api/variations', {
        method: 'POST',
        body: variationData
      });
    }

    // ── 5. Stock & Inventory Management APIs ───────────────────────────────────
    async getTransfers(params = {}) {
      const query = {
        page: params.page || 1,
        limit: params.limit || this.pageSize,
        ...(params.search ? { search: params.search } : {}),
        ...(params.status ? { status: params.status } : {})
      };
      const res = await this.request('/api/stock/transfers', { params: query });
      if (res.ok && res.data) return res.data;

      return {
        success: true,
        transfers: [
          {
            id: 'trf-101',
            transferNumber: 'TRF-2026-089',
            fromType: 'Warehouse',
            fromName: 'Central Godown Bhiwandi',
            toType: 'Store',
            toName: 'Main Retail Store Mumbai',
            status: 'Received',
            itemsCount: 140,
            date: '2026-11-10',
            notes: 'Weekly apparel replenishment'
          },
          {
            id: 'trf-102',
            transferNumber: 'TRF-2026-090',
            fromType: 'Store',
            fromName: 'Main Retail Store Mumbai',
            toType: 'Store',
            toName: 'South Mumbai Flagship Store',
            status: 'In-Transit',
            itemsCount: 45,
            date: '2026-11-11',
            notes: 'Inter-store size reallocation'
          },
          {
            id: 'trf-103',
            transferNumber: 'TRF-2026-091',
            fromType: 'Warehouse',
            fromName: 'Central Godown Bhiwandi',
            toType: 'Store',
            toName: 'Thane West Express Mall',
            status: 'Pending',
            itemsCount: 85,
            date: '2026-11-12',
            notes: 'Festival weekend stock batch'
          }
        ],
        pagination: { page: 1, limit: this.pageSize, totalItems: 3, totalPages: 1 }
      };
    }

    async createTransfer(transferData) {
      return await this.request('/api/stock/transfers', {
        method: 'POST',
        body: transferData
      });
    }

    async updateTransfer(transferId, status) {
      return await this.request('/api/stock/transfers', {
        method: 'PATCH',
        body: { id: transferId, status }
      });
    }

    async adjustStock(adjustmentData) {
      return await this.request('/api/stock/adjust', {
        method: 'POST',
        body: adjustmentData
      });
    }

    // ── 6. Returns & Exchanges APIs ───────────────────────────────────────────
    async getReturns(params = {}) {
      const query = {
        page: params.page || 1,
        limit: params.limit || this.pageSize,
        ...(params.type ? { type: params.type } : {}),
        ...(params.search ? { search: params.search } : {})
      };
      const res = await this.request('/api/returns', { params: query });
      if (res.ok && res.data) return res.data;

      return {
        success: true,
        returns: [
          {
            id: 'ret-01',
            returnNumber: 'RET-2026-0012',
            type: 'RETURN',
            orderNumber: 'INV-202611-0042',
            customerName: 'Siva Krishna',
            customerPhone: '9876543210',
            refundAmount: 750.00,
            refundMethod: 'CASH',
            reason: 'Size misfit / alteration required',
            date: '2026-11-11',
            items: [{ productName: 'Polo Shirt Navy Blue (L)', quantity: 1, refundAmount: 750.00 }]
          },
          {
            id: 'ret-02',
            returnNumber: 'EXC-2026-0008',
            type: 'EXCHANGE',
            orderNumber: 'INV-202611-0038',
            customerName: 'Ananya Sharma',
            customerPhone: '9822334455',
            returnedProduct: 'Slim Fit Denim 32',
            replacementProduct: 'Slim Fit Denim 34',
            netDifference: 0.00,
            paymentMethod: 'NONE',
            date: '2026-11-10'
          }
        ],
        pagination: { page: 1, limit: this.pageSize, totalItems: 2, totalPages: 1 }
      };
    }

    async createReturn(returnData) {
      return await this.request('/api/returns', {
        method: 'POST',
        body: returnData
      });
    }

    // ── 7. Discounts & Coupons APIs ───────────────────────────────────────────
    async getCoupons(params = {}) {
      const query = {
        page: params.page || 1,
        limit: params.limit || this.pageSize,
        ...(params.type ? { type: params.type } : {})
      };
      const res = await this.request('/api/coupons', { params: query });
      if (res.ok && res.data) return res.data;

      return {
        success: true,
        coupons: [
          {
            id: 'cpn-1',
            code: 'FESTIVE20',
            type: 'ORDER',
            discountType: 'PERCENTAGE',
            discountValue: 20,
            minOrderAmount: 1000,
            maxDiscountAmount: 500,
            status: 'Active',
            validUntil: '2026-12-31'
          },
          {
            id: 'cpn-2',
            code: 'FLAT500',
            type: 'ORDER',
            discountType: 'FLAT',
            discountValue: 500,
            minOrderAmount: 2500,
            maxDiscountAmount: 500,
            status: 'Active',
            validUntil: '2026-11-30'
          },
          {
            id: 'cpn-3',
            code: 'SHIRT15',
            type: 'PRODUCT',
            discountType: 'PERCENTAGE',
            discountValue: 15,
            minOrderAmount: 500,
            maxDiscountAmount: 300,
            status: 'Active',
            validUntil: '2026-11-20'
          },
          {
            id: 'cpn-4',
            code: 'VIPGOLD',
            type: 'CUSTOMER',
            discountType: 'PERCENTAGE',
            discountValue: 25,
            minOrderAmount: 1500,
            maxDiscountAmount: 1000,
            status: 'Active',
            validUntil: '2027-03-31'
          }
        ],
        pagination: { page: 1, limit: this.pageSize, totalItems: 4, totalPages: 1 }
      };
    }

    async createCoupon(couponData) {
      return await this.request('/api/coupons', {
        method: 'POST',
        body: couponData
      });
    }

    async updateCoupon(couponData) {
      return await this.request('/api/coupons', {
        method: 'PUT',
        body: couponData
      });
    }

    async deleteCoupon(id) {
      return await this.request(`/api/coupons?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    }

    // ── 8. Vendors & Procurement APIs ──────────────────────────────────────────
    async getVendors(params = {}) {
      const query = {
        page: params.page || 1,
        limit: params.limit || this.pageSize,
        ...(params.search ? { search: params.search } : {}),
        ...(params.status ? { status: params.status } : {})
      };
      const res = await this.request('/api/vendors', { params: query });
      if (res.ok && res.data) return res.data;

      return {
        success: true,
        vendors: [
          {
            id: 'vnd-1',
            company: 'Apex Apparel Mills Ltd',
            name: 'Sunil Mehta',
            phone: '9819283746',
            email: 'sales@apexmills.in',
            gstin: '27AABCA1234F1Z9',
            city: 'Surat',
            outstanding_due: 45000.00,
            status: 'Active'
          },
          {
            id: 'vnd-2',
            company: 'Zenith Footwear Importers',
            name: 'Vikram Seth',
            phone: '9820192837',
            email: 'orders@zenithfootwear.com',
            gstin: '27AAECZ5678G1ZQ',
            city: 'Agra',
            outstanding_due: 18500.00,
            status: 'Active'
          },
          {
            id: 'vnd-3',
            company: 'Prime Packaging & Thermal Rolls',
            name: 'Karan Dave',
            phone: '9845123456',
            email: 'primepack@gmail.com',
            gstin: '27AABCP9012K1Z3',
            city: 'Mumbai',
            outstanding_due: 6200.00,
            status: 'Active'
          }
        ],
        pagination: { page: 1, limit: this.pageSize, totalItems: 3, totalPages: 1 }
      };
    }

    async createVendor(vendorData) {
      return await this.request('/api/vendors', {
        method: 'POST',
        body: vendorData
      });
    }

    async getPurchaseOrders(params = {}) {
      const query = {
        page: params.page || 1,
        limit: params.limit || this.pageSize
      };
      const res = await this.request('/api/vendors/orders', { params: query });
      if (res.ok && res.data) return res.data;

      return {
        success: true,
        orders: [
          {
            id: 'po-1',
            orderNumber: 'PO-2026-0041',
            vendorName: 'Apex Apparel Mills Ltd',
            orderDate: '2026-11-05',
            status: 'Approved',
            totalAmount: 95000.00,
            itemsCount: 300
          },
          {
            id: 'po-2',
            orderNumber: 'PO-2026-0042',
            vendorName: 'Zenith Footwear Importers',
            orderDate: '2026-11-08',
            status: 'Shipped',
            totalAmount: 64000.00,
            itemsCount: 80
          }
        ],
        pagination: { page: 1, limit: this.pageSize, totalItems: 2, totalPages: 1 }
      };
    }

    async createPurchaseOrder(poData) {
      return await this.request('/api/vendors/orders', {
        method: 'POST',
        body: poData
      });
    }

    async getVendorInvoices(params = {}) {
      const query = {
        page: params.page || 1,
        limit: params.limit || this.pageSize
      };
      const res = await this.request('/api/vendors/invoices', { params: query });
      if (res.ok && res.data) return res.data;

      return {
        success: true,
        invoices: [
          {
            id: 'vi-1',
            invoiceNumber: 'INV-APX-8902',
            vendorName: 'Apex Apparel Mills Ltd',
            invoiceDate: '2026-11-02',
            totalAmount: 95000.00,
            paidAmount: 50000.00,
            dueAmount: 45000.00,
            status: 'Partial'
          },
          {
            id: 'vi-2',
            invoiceNumber: 'INV-ZNT-1044',
            vendorName: 'Zenith Footwear Importers',
            invoiceDate: '2026-11-04',
            totalAmount: 38500.00,
            paidAmount: 20000.00,
            dueAmount: 18500.00,
            status: 'Partial'
          }
        ],
        pagination: { page: 1, limit: this.pageSize, totalItems: 2, totalPages: 1 }
      };
    }

    async createVendorInvoice(invoiceData) {
      return await this.request('/api/vendors/invoices', {
        method: 'POST',
        body: invoiceData
      });
    }

    async recordVendorPayment(paymentData) {
      return await this.request('/api/vendors/invoices', {
        method: 'PATCH',
        body: paymentData
      });
    }

    // ── 9. Employees & HR Management APIs ──────────────────────────────────────
    async getEmployees(params = {}) {
      const query = {
        page: params.page || 1,
        limit: params.limit || this.pageSize,
        ...(params.search ? { search: params.search } : {}),
        all: params.all || true
      };
      const res = await this.request('/api/employees', { params: query });
      if (res.ok && res.data) return res.data;

      return {
        success: true,
        employees: [
          {
            id: 'emp-1',
            employeeCode: 'EMP-001',
            name: 'Rahul Kumar',
            designation: 'Senior Cashier & POS Lead',
            mobile: '9876501234',
            email: 'rahul.k@retailnext.com',
            salaryType: 'monthly',
            salaryAmount: 26000,
            joiningDate: '2024-03-15',
            status: 'Active'
          },
          {
            id: 'emp-2',
            employeeCode: 'EMP-002',
            name: 'Priya Sharma',
            designation: 'Store Sales Associate',
            mobile: '9823456789',
            email: 'priya.s@retailnext.com',
            salaryType: 'monthly',
            salaryAmount: 22000,
            joiningDate: '2024-06-01',
            status: 'Active'
          },
          {
            id: 'emp-3',
            employeeCode: 'EMP-003',
            name: 'Vikas Patil',
            designation: 'Inventory & Godown Manager',
            mobile: '9890123456',
            email: 'vikas.p@retailnext.com',
            salaryType: 'monthly',
            salaryAmount: 30000,
            joiningDate: '2023-11-10',
            status: 'Active'
          },
          {
            id: 'emp-4',
            employeeCode: 'EMP-004',
            name: 'Sunil Varma',
            designation: 'Retail Sales Executive',
            mobile: '9811223344',
            email: 'sunil.v@retailnext.com',
            salaryType: 'daily',
            salaryAmount: 900,
            joiningDate: '2025-01-20',
            status: 'Active'
          }
        ],
        pagination: { page: 1, limit: this.pageSize, totalItems: 4, totalPages: 1 }
      };
    }

    async getAttendance(date) {
      const d = date || new Date().toISOString().split('T')[0];
      const res = await this.request('/api/employees/attendance', { params: { date: d } });
      if (res.ok && res.data) return res.data;

      return {
        success: true,
        date: d,
        records: {
          'emp-1': { status: 'Present', checkIn: '09:45 AM' },
          'emp-2': { status: 'Present', checkIn: '09:50 AM' },
          'emp-3': { status: 'Present', checkIn: '09:30 AM' },
          'emp-4': { status: 'Half Day', checkIn: '01:30 PM' }
        }
      };
    }

    async saveAttendance(attendanceData) {
      return await this.request('/api/employees/attendance', {
        method: 'POST',
        body: attendanceData
      });
    }

    async getPayroll(month) {
      const m = month || new Date().toISOString().slice(0, 7);
      const res = await this.request('/api/employees/payroll', { params: { month: m } });
      if (res.ok && res.data) return res.data;

      return {
        success: true,
        month: m,
        records: [
          {
            employeeId: 'emp-1',
            employeeName: 'Rahul Kumar',
            salaryType: 'monthly',
            baseSalary: 26000,
            presentDays: 26,
            halfDays: 0,
            absentDays: 0,
            bonusAmount: 1500,
            grossEarnings: 27500,
            advanceDeduction: 0,
            netSalary: 27500,
            status: 'Draft'
          },
          {
            employeeId: 'emp-2',
            employeeName: 'Priya Sharma',
            salaryType: 'monthly',
            baseSalary: 22000,
            presentDays: 24,
            halfDays: 1,
            absentDays: 1,
            bonusAmount: 1000,
            grossEarnings: 21700,
            advanceDeduction: 1500,
            netSalary: 20200,
            status: 'Draft'
          },
          {
            employeeId: 'emp-3',
            employeeName: 'Vikas Patil',
            salaryType: 'monthly',
            baseSalary: 30000,
            presentDays: 25,
            halfDays: 0,
            absentDays: 1,
            bonusAmount: 1200,
            grossEarnings: 30050,
            advanceDeduction: 2000,
            netSalary: 28050,
            status: 'Draft'
          }
        ]
      };
    }

    async finalizePayroll(payrollData) {
      return await this.request('/api/employees/payroll', {
        method: 'POST',
        body: payrollData
      });
    }

    async getIdCardConfig() {
      const res = await this.request('/api/employees/id-card');
      if (res.ok && res.data) return res.data;
      return {
        success: true,
        primaryColor: '#5e2b9d',
        secondaryColor: '#8b5cf6',
        showQr: true,
        showMobile: true,
        showBloodGroup: false
      };
    }

    async saveIdCardConfig(configData) {
      return await this.request('/api/employees/id-card', {
        method: 'POST',
        body: configData
      });
    }

    async getLeaves(params = {}) {
      const query = {
        page: params.page || 1,
        limit: params.limit || this.pageSize
      };
      const res = await this.request('/api/employees/leaves', { params: query });
      if (res.ok && res.data) return res.data;

      return {
        success: true,
        leaves: [
          {
            id: 'lv-1',
            employeeName: 'Priya Sharma',
            leaveType: 'Casual Leave',
            startDate: '2026-11-15',
            endDate: '2026-11-16',
            days: 2,
            reason: 'Family function in hometown',
            status: 'Pending'
          },
          {
            id: 'lv-2',
            employeeName: 'Vikas Patil',
            leaveType: 'Sick Leave',
            startDate: '2026-11-08',
            endDate: '2026-11-08',
            days: 1,
            reason: 'Medical consultation',
            status: 'Approved'
          }
        ],
        pagination: { page: 1, limit: this.pageSize, totalItems: 2, totalPages: 1 }
      };
    }

    async applyLeave(leaveData) {
      return await this.request('/api/employees/leaves', {
        method: 'POST',
        body: leaveData
      });
    }

    async updateLeave(id, status) {
      return await this.request('/api/employees/leaves', {
        method: 'PATCH',
        body: { id, status }
      });
    }

    async getAdvances(params = {}) {
      const query = {
        page: params.page || 1,
        limit: params.limit || this.pageSize
      };
      const res = await this.request('/api/employees/advances', { params: query });
      if (res.ok && res.data) return res.data;

      return {
        success: true,
        advances: [
          {
            id: 'adv-1',
            employeeName: 'Priya Sharma',
            amount: 5000,
            repaidAmount: 1500,
            balanceDue: 3500,
            monthlyDeduction: 1500,
            issuedDate: '2026-10-15',
            status: 'Active'
          },
          {
            id: 'adv-2',
            employeeName: 'Vikas Patil',
            amount: 8000,
            repaidAmount: 4000,
            balanceDue: 4000,
            monthlyDeduction: 2000,
            issuedDate: '2026-09-01',
            status: 'Active'
          }
        ],
        pagination: { page: 1, limit: this.pageSize, totalItems: 2, totalPages: 1 }
      };
    }

    async issueAdvance(advanceData) {
      return await this.request('/api/employees/advances', {
        method: 'POST',
        body: advanceData
      });
    }

    // ── 10. Stores Directory & Management APIs ─────────────────────────────────
    async getStores() {
      const res = await this.request('/api/stores');
      if (res.ok && res.data) return res.data;

      return {
        success: true,
        stores: [
          {
            id: 'str-01',
            name: 'Main Retail Store',
            code: 'STR-001',
            managerName: 'Rajesh Nair',
            phone: '9820011223',
            email: 'main@retailnext.com',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            gstin: '27AAAAA0000A1Z5',
            licenseExpiry: '2027-03-31',
            daysRemaining: 139,
            isActive: true
          },
          {
            id: 'str-02',
            name: 'South Mumbai Flagship Store',
            code: 'STR-002',
            managerName: 'Kunal Singhania',
            phone: '9820022334',
            email: 'southmumbai@retailnext.com',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400021',
            gstin: '27AAAAA0000A1Z5',
            licenseExpiry: '2027-04-30',
            daysRemaining: 169,
            isActive: false
          },
          {
            id: 'str-03',
            name: 'Thane West Express Mall',
            code: 'STR-003',
            managerName: 'Neha Kapoor',
            phone: '9820033445',
            email: 'thane@retailnext.com',
            city: 'Thane',
            state: 'Maharashtra',
            pincode: '400601',
            gstin: '27AAAAA0000A1Z5',
            licenseExpiry: '2026-12-15',
            daysRemaining: 33,
            isActive: false
          }
        ],
        pagination: { page: 1, limit: this.pageSize, totalItems: 3, totalPages: 1 }
      };
    }

    async createStore(storeData) {
      return await this.request('/api/stores', {
        method: 'POST',
        body: storeData
      });
    }

    async updateStore(id, storeData) {
      return await this.request(`/api/stores/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: storeData
      });
    }

    async deleteStore(id) {
      return await this.request(`/api/stores/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    }

    async selectStore(storeId) {
      const res = await this.request('/api/stores/select', {
        method: 'POST',
        body: { storeId }
      });
      return res;
    }

    // ── 11. Customers APIs ─────────────────────────────────────────────────────
    async getCustomers(params = {}) {
      const query = {
        page: params.page || 1,
        limit: params.limit || this.pageSize,
        ...(params.search ? { search: params.search } : {})
      };
      const res = await this.request('/api/customers', { params: query });
      if (res.ok && res.data) return res.data;

      return {
        success: true,
        customers: [
          {
            id: 'cust-1',
            name: 'Siva Krishna',
            phone: '9876543210',
            email: 'siva@example.com',
            address: 'Doonext Tech Hub, Hitech City',
            gstin: '36AABCS1234F1Z8',
            loyaltyPoints: 340,
            totalSpent: 42800.00,
            visits: 14
          },
          {
            id: 'cust-2',
            name: 'Ananya Sharma',
            phone: '9822334455',
            email: 'ananya.s@gmail.com',
            address: 'Bandra West, Mumbai',
            gstin: '',
            loyaltyPoints: 120,
            totalSpent: 16500.00,
            visits: 6
          },
          {
            id: 'cust-3',
            name: 'Vikram Malhotra',
            phone: '9845012345',
            email: 'v.malhotra@corp.in',
            address: 'Jubilee Hills, Hyderabad',
            gstin: '36AAECM9012K1ZQ',
            loyaltyPoints: 580,
            totalSpent: 89400.00,
            visits: 28
          }
        ],
        pagination: { page: 1, limit: this.pageSize, totalItems: 3, totalPages: 1 }
      };
    }

    async createCustomer(customerData) {
      return await this.request('/api/customers', {
        method: 'POST',
        body: customerData
      });
    }

    // ── 12. Staff & Permissions APIs ───────────────────────────────────────────
    async getStaff(params = {}) {
      const query = {
        page: params.page || 1,
        limit: params.limit || this.pageSize
      };
      const res = await this.request('/api/staff', { params: query });
      if (res.ok && res.data) return res.data;

      return {
        success: true,
        staff: [
          {
            id: 'stf-1',
            name: 'Rahul Kumar',
            loginId: 'CASHIER01',
            role: 'Head Cashier',
            status: 'Active',
            permissions: ['pos', 'sales', 'returns', 'customers']
          },
          {
            id: 'stf-2',
            name: 'Priya Sharma',
            loginId: 'CASHIER02',
            role: 'Junior Cashier',
            status: 'Active',
            permissions: ['pos', 'sales']
          },
          {
            id: 'stf-3',
            name: 'Vikas Patil',
            loginId: 'MGR01',
            role: 'Store Manager',
            status: 'Active',
            permissions: ['pos', 'sales', 'returns', 'customers', 'stock', 'discounts', 'settings']
          }
        ],
        pagination: { page: 1, limit: this.pageSize, totalItems: 3, totalPages: 1 }
      };
    }

    async createStaff(staffData) {
      return await this.request('/api/staff', {
        method: 'POST',
        body: staffData
      });
    }

    // ── Helper Mock Generators (Strictly 24 items per page) ────────────────────
    _generateMockOrders(page = 1, limit = 24, search = '') {
      const items = [];
      const paymentMethods = ['UPI', 'CASH', 'CARD', 'UPI', 'CARD', 'CASH'];
      const names = ['Siva Krishna', 'Ananya Sharma', 'Vikram Malhotra', 'Rohan Verma', 'Kavita Pillai', 'Deepak Mehta', 'Pooja Iyer', 'Arun Kumar'];

      for (let i = 1; i <= limit; i++) {
        const idx = (page - 1) * limit + i;
        const custName = names[(idx - 1) % names.length];
        const tender = paymentMethods[(idx - 1) % paymentMethods.length];
        const subtotal = 800 + (idx * 110) % 2400;
        const discount = (idx % 3 === 0) ? 100 : 0;
        const grandTotal = subtotal - discount;

        items.push({
          id: `ord-${idx}`,
          billNumber: `INV-202611-${String(idx).padStart(4, '0')}`,
          createdAt: Date.now() - (idx * 3600000 * 2),
          customerName: custName,
          customerPhone: `98${String(10000000 + idx * 777).slice(0, 8)}`,
          subtotal,
          discount,
          tax: Math.round(grandTotal * 0.05),
          grandTotal,
          paymentMethod: tender,
          cashierName: (idx % 2 === 0) ? 'Rahul K' : 'Priya S',
          status: 'Completed',
          items: [
            {
              productId: `p-${idx}`,
              productName: (idx % 2 === 0) ? 'Polo Shirt Navy Blue' : 'Slim Fit Denim Jeans',
              variantName: 'Size L',
              salePrice: grandTotal,
              quantity: 1,
              subtotal: grandTotal
            }
          ]
        });
      }

      return {
        success: true,
        orders: items,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalItems: 144,
          totalPages: 6
        }
      };
    }

    _generateMockProducts(page = 1, limit = 24, search = '') {
      const categories = ['Menswear & Apparel', 'Womenswear & Ethnic', 'Footwear & Shoes', 'Accessories'];
      const products = [];

      const baseNames = [
        'Classic Crewneck T-Shirt', 'Polo Collar Navy Shirt', 'Slim Fit Denim 32',
        'Formal Cotton Trousers', 'Linen Casual Shirt Beige', 'Sneakers Urban White',
        'Running Performance Shoes', 'Leather Reversible Belt', 'Stainless Steel Wristwatch',
        'Ethnic Silk Kurta Maroon', 'Designer Embroidered Dupatta', 'Chino Shorts Khaki',
        'Track Pants Charcoal', 'Winter Bomber Jacket', 'Graphic Printed Hoodie',
        'Solid Oxford Cotton Shirt', 'Formal Derby Shoes Tan', 'Ankle Length Sports Socks',
        'Canvas Backpack 25L', 'Wayfarer UV Sunglasses', 'Checked Flannel Shirt Red',
        'V-Neck Merino Wool Sweater', 'Denim Denim Jacket Blue', 'Cargo Utility Trousers'
      ];

      for (let i = 1; i <= limit; i++) {
        const idx = (page - 1) * limit + i;
        const name = baseNames[(idx - 1) % baseNames.length] + (idx > 24 ? ` v${Math.ceil(idx / 24)}` : '');
        const costPrice = 350 + (idx * 45) % 800;
        const salePrice = Math.round(costPrice * 1.6);
        const stock = 10 + (idx * 7) % 60;

        products.push({
          id: `prod-${idx}`,
          name,
          sku: `SKU-${String(idx).padStart(4, '0')}`,
          barcode: `89012345${String(idx).padStart(5, '0')}`,
          categoryName: categories[(idx - 1) % categories.length],
          costPrice,
          salePrice,
          stock,
          hasVariations: (idx % 2 === 0),
          variants: (idx % 2 === 0) ? [
            { id: `v-${idx}-1`, name: 'Size M', sku: `SKU-${idx}-M`, stock: Math.floor(stock / 2) },
            { id: `v-${idx}-2`, name: 'Size L', sku: `SKU-${idx}-L`, stock: Math.ceil(stock / 2) }
          ] : []
        });
      }

      return {
        success: true,
        products,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalItems: 168,
          totalPages: 7
        }
      };
    }
  }

  global.apiService = new ApiService();
})(window);

