/**
 * RetailNext — Sample Data & Local Storage Store
 * Provides default data for Products, Customers, Suppliers, Invoices, Purchases & Transactions.
 */

'use strict';

window.RetailStore = (() => {
  const DEFAULT_PRODUCTS = [
    {
      id: 'PRD-1001',
      name: 'Fortune Sunlite Sunflower Oil 1L',
      code: 'OIL-FS-1L',
      sku: 'FS-1001',
      barcode: '8901030012011',
      category: 'Grocery & Staples',
      subcategory: 'Cooking Oil',
      brand: 'Fortune',
      uom: 'Litre',
      altUom: 'Box',
      conversionFactor: 12,
      purchasePrice: 118.00,
      costPrice: 118.00,
      mrp: 155.00,
      sellingPrice: 140.00,
      wholesalePrice: 132.00,
      gstRate: 5,
      hsnCode: '1512',
      openingStock: 85,
      currentStock: 42,
      minStock: 20,
      supplier: 'Metro Wholesale Traders',
      manufacturer: 'Adani Wilmar Ltd',
      location: 'Rack A-02, Shelf 3',
      batchTracking: true,
      expiryTracking: true,
      serialTracking: false,
      batchNo: 'BAT-2026-A1',
      expiryDate: '2027-04-15',
      status: 'Active',
      description: 'Refined sunflower cooking oil with Vitamin A & D'
    },
    {
      id: 'PRD-1002',
      name: 'India Gate Basmati Rice Feast Rozzana 5kg',
      code: 'RICE-IG-5K',
      sku: 'IG-5002',
      barcode: '8901582001429',
      category: 'Grocery & Staples',
      subcategory: 'Rice & Grains',
      brand: 'India Gate',
      uom: 'Packet',
      altUom: 'Bag',
      conversionFactor: 4,
      purchasePrice: 380.00,
      costPrice: 380.00,
      mrp: 495.00,
      sellingPrice: 445.00,
      wholesalePrice: 420.00,
      gstRate: 5,
      hsnCode: '1006',
      openingStock: 50,
      currentStock: 28,
      minStock: 15,
      supplier: 'Sunrise FMCG Dist',
      manufacturer: 'KRBL Limited',
      location: 'Rack B-01, Ground Bay',
      batchTracking: true,
      expiryTracking: true,
      serialTracking: false,
      batchNo: 'IG-OCT26-09',
      expiryDate: '2028-09-30',
      status: 'Active',
      description: 'Aromatic aged long grain basmati rice for daily meals'
    },
    {
      id: 'PRD-1003',
      name: 'Tata Salt Vacuum Evaporated 1kg',
      code: 'SALT-TS-1K',
      sku: 'TS-1003',
      barcode: '8901058000049',
      category: 'Grocery & Staples',
      subcategory: 'Salt & Sugar',
      brand: 'Tata Salt',
      uom: 'Packet',
      altUom: 'Box',
      conversionFactor: 24,
      purchasePrice: 22.00,
      costPrice: 22.00,
      mrp: 28.00,
      sellingPrice: 26.00,
      wholesalePrice: 24.50,
      gstRate: 0,
      hsnCode: '2501',
      openingStock: 200,
      currentStock: 124,
      minStock: 50,
      supplier: 'Metro Wholesale Traders',
      manufacturer: 'Tata Consumer Products',
      location: 'Rack A-05, Shelf 1',
      batchTracking: false,
      expiryTracking: false,
      serialTracking: false,
      batchNo: '',
      expiryDate: '',
      status: 'Active',
      description: 'Desh Ka Namak - iodized vacuum evaporated salt'
    },
    {
      id: 'PRD-1004',
      name: 'Amul Butter Pasteurised 500g',
      code: 'DAIRY-AB-500',
      sku: 'AB-5004',
      barcode: '8901262010052',
      category: 'Dairy & Chilled',
      subcategory: 'Butter & Cheese',
      brand: 'Amul',
      uom: 'Pieces',
      altUom: 'Box',
      conversionFactor: 20,
      purchasePrice: 235.00,
      costPrice: 235.00,
      mrp: 285.00,
      sellingPrice: 275.00,
      wholesalePrice: 260.00,
      gstRate: 12,
      hsnCode: '0405',
      openingStock: 60,
      currentStock: 18,
      minStock: 25,
      supplier: 'Balaji Dairy Distributors',
      manufacturer: 'GCMMF Ltd (Amul)',
      location: 'Chiller Unit #1, Shelf 2',
      batchTracking: true,
      expiryTracking: true,
      serialTracking: false,
      batchNo: 'AMU-500-88',
      expiryDate: '2026-12-15',
      status: 'Active',
      description: 'Utterly butterly delicious salted pasteurised butter'
    },
    {
      id: 'PRD-1005',
      name: 'Colgate MaxFresh Red Gel Toothpaste 150g',
      code: 'ORAL-CMF-150',
      sku: 'CMF-1505',
      barcode: '8901314010332',
      category: 'Personal Care',
      subcategory: 'Oral Care',
      brand: 'Colgate',
      uom: 'Pieces',
      altUom: 'Box',
      conversionFactor: 36,
      purchasePrice: 84.00,
      costPrice: 84.00,
      mrp: 125.00,
      sellingPrice: 115.00,
      wholesalePrice: 100.00,
      gstRate: 18,
      hsnCode: '3306',
      openingStock: 90,
      currentStock: 64,
      minStock: 20,
      supplier: 'Hindustan Consumer Agency',
      manufacturer: 'Colgate-Palmolive Ltd',
      location: 'Rack C-03, Shelf 2',
      batchTracking: true,
      expiryTracking: true,
      serialTracking: false,
      batchNo: 'COL-MF-99',
      expiryDate: '2027-08-30',
      status: 'Active',
      description: 'Cooling crystals spicy fresh gel toothpaste'
    },
    {
      id: 'PRD-1006',
      name: 'Aashirvaad Shudh Chakki Atta 10kg',
      code: 'ATTA-ASH-10K',
      sku: 'ASH-1006',
      barcode: '8901725181223',
      category: 'Grocery & Staples',
      subcategory: 'Flour & Atta',
      brand: 'Aashirvaad',
      uom: 'Packet',
      altUom: 'Bag',
      conversionFactor: 2,
      purchasePrice: 385.00,
      costPrice: 385.00,
      mrp: 475.00,
      sellingPrice: 430.00,
      wholesalePrice: 410.00,
      gstRate: 5,
      hsnCode: '1101',
      openingStock: 75,
      currentStock: 31,
      minStock: 20,
      supplier: 'Sunrise FMCG Dist',
      manufacturer: 'ITC Limited',
      location: 'Rack B-02, Ground Bay',
      batchTracking: true,
      expiryTracking: true,
      serialTracking: false,
      batchNo: 'ITC-ATT-301',
      expiryDate: '2027-03-20',
      status: 'Active',
      description: '100% whole wheat atta with 4-step advantage'
    }
  ];

  const DEFAULT_CUSTOMERS = [
    {
      id: 'CUST-001',
      name: 'Rajesh Kumar Verma',
      mobile: '9876543210',
      email: 'rajesh.verma@example.com',
      city: 'Hyderabad',
      group: 'Retail Regular',
      creditLimit: 15000,
      outstanding: 2450.00,
      loyaltyPoints: 340,
      gstin: ''
    },
    {
      id: 'CUST-002',
      name: 'Priya Sharma',
      mobile: '9848012345',
      email: 'priya.s@example.com',
      city: 'Secunderabad',
      group: 'Privilege Member',
      creditLimit: 25000,
      outstanding: 0.00,
      loyaltyPoints: 1280,
      gstin: ''
    },
    {
      id: 'CUST-003',
      name: 'Sri Sai Ram Supermarket',
      mobile: '9988776655',
      email: 'sairam.retail@example.com',
      city: 'Hyderabad',
      group: 'Wholesale B2B',
      creditLimit: 100000,
      outstanding: 38450.00,
      loyaltyPoints: 5400,
      gstin: '36AABCS1429B1Z2'
    },
    {
      id: 'CUST-004',
      name: 'Anita Desai',
      mobile: '9123456789',
      email: 'anita.desai@example.com',
      city: 'Hyderabad',
      group: 'Retail Regular',
      creditLimit: 5000,
      outstanding: 650.00,
      loyaltyPoints: 120,
      gstin: ''
    }
  ];

  const DEFAULT_SUPPLIERS = [
    {
      id: 'SUP-001',
      name: 'Metro Wholesale Traders Pvt Ltd',
      mobile: '9811223344',
      contactPerson: 'Arun Mehra',
      city: 'Hyderabad',
      gstin: '36AAACM8912C1ZT',
      group: 'FMCG Wholesale',
      outstanding: 45200.00,
      paymentTerms: '30 Days Net'
    },
    {
      id: 'SUP-002',
      name: 'Sunrise FMCG Distributors',
      mobile: '9822334455',
      contactPerson: 'Kalyan Reddy',
      city: 'Hyderabad',
      gstin: '36AABCS6721K1ZW',
      group: 'Staples & Grains',
      outstanding: 28900.00,
      paymentTerms: '15 Days Net'
    },
    {
      id: 'SUP-003',
      name: 'Balaji Dairy Distributors',
      mobile: '9833445566',
      contactPerson: 'Suresh Patel',
      city: 'Hyderabad',
      gstin: '36AAGCB3410L1Z8',
      group: 'Cold Chain & Dairy',
      outstanding: 11400.00,
      paymentTerms: '7 Days Net'
    }
  ];

  const DEFAULT_INVOICES = [
    {
      invoiceNo: 'INV-2026-00812',
      date: '2026-10-31 18:45',
      customerId: 'CUST-001',
      customerName: 'Rajesh Kumar Verma',
      itemsCount: 3,
      amount: 1245.00,
      paymentMode: 'UPI',
      status: 'Paid',
      refNo: 'TXN-UPI-982104'
    },
    {
      invoiceNo: 'INV-2026-00811',
      date: '2026-10-31 17:15',
      customerId: 'CUST-002',
      customerName: 'Priya Sharma',
      itemsCount: 5,
      amount: 2850.00,
      paymentMode: 'Card',
      status: 'Paid',
      refNo: 'TXN-CARD-441209'
    },
    {
      invoiceNo: 'INV-2026-00810',
      date: '2026-10-31 15:30',
      customerId: 'CUST-003',
      customerName: 'Sri Sai Ram Supermarket',
      itemsCount: 14,
      amount: 14850.00,
      paymentMode: 'Credit',
      status: 'Due',
      refNo: 'TXN-CRD-00810'
    },
    {
      invoiceNo: 'INV-2026-00809',
      date: '2026-10-31 14:10',
      customerId: 'CUST-004',
      customerName: 'Anita Desai',
      itemsCount: 2,
      amount: 580.00,
      paymentMode: 'Cash',
      status: 'Paid',
      refNo: 'TXN-CSH-55012'
    },
    {
      invoiceNo: 'INV-2026-00808',
      date: '2026-10-30 19:20',
      customerId: 'CUST-001',
      customerName: 'Rajesh Kumar Verma',
      itemsCount: 4,
      amount: 1890.00,
      paymentMode: 'Cash',
      status: 'Paid',
      refNo: 'TXN-CSH-54890'
    }
  ];

  const DEFAULT_PURCHASES = [
    {
      purchaseNo: 'PUR-2026-00142',
      date: '2026-10-30',
      supplierId: 'SUP-001',
      supplierName: 'Metro Wholesale Traders Pvt Ltd',
      invoiceRef: 'MWT/INV/8841',
      totalAmount: 38400.00,
      status: 'Received',
      paymentStatus: 'Pending',
      refNo: 'TXN-PUR-8841'
    },
    {
      purchaseNo: 'PUR-2026-00141',
      date: '2026-10-28',
      supplierId: 'SUP-002',
      supplierName: 'Sunrise FMCG Distributors',
      invoiceRef: 'SFD/2026/102',
      totalAmount: 24650.00,
      status: 'Received',
      paymentStatus: 'Paid',
      refNo: 'TXN-PUR-10298'
    }
  ];

  // Load from localStorage or initialize with defaults
  function getCollection(key, defaults) {
    try {
      const stored = localStorage.getItem('retailnext_' + key);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    return defaults;
  }

  function saveCollection(key, data) {
    try {
      localStorage.setItem('retailnext_' + key, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  let products = getCollection('products', DEFAULT_PRODUCTS);
  let customers = getCollection('customers', DEFAULT_CUSTOMERS);
  let suppliers = getCollection('suppliers', DEFAULT_SUPPLIERS);
  let invoices = getCollection('invoices', DEFAULT_INVOICES);
  let purchases = getCollection('purchases', DEFAULT_PURCHASES);

  return {
    getProducts: () => [...products],
    addProduct: (p) => {
      p.id = p.id || 'PRD-' + (1000 + products.length + 1);
      products.unshift(p);
      saveCollection('products', products);
      return p;
    },
    updateProduct: (id, p) => {
      const idx = products.findIndex(item => item.id === id);
      if (idx !== -1) {
        products[idx] = { ...products[idx], ...p };
        saveCollection('products', products);
        return products[idx];
      }
      return null;
    },
    getCustomers: () => [...customers],
    addCustomer: (c) => {
      c.id = c.id || 'CUST-' + String(customers.length + 1).padStart(3, '0');
      customers.unshift(c);
      saveCollection('customers', customers);
      return c;
    },
    getSuppliers: () => [...suppliers],
    getInvoices: () => [...invoices],
    addInvoice: (inv) => {
      inv.invoiceNo = inv.invoiceNo || 'INV-2026-' + String(800 + invoices.length + 1).padStart(5, '0');
      inv.date = new Date().toLocaleString();
      invoices.unshift(inv);
      saveCollection('invoices', invoices);
      return inv;
    },
    getPurchases: () => [...purchases],
    addPurchase: (pur) => {
      pur.purchaseNo = pur.purchaseNo || 'PUR-2026-' + String(140 + purchases.length + 1).padStart(5, '0');
      pur.date = pur.date || new Date().toISOString().slice(0, 10);
      purchases.unshift(pur);
      saveCollection('purchases', purchases);
      return pur;
    },

    // Global Search across all entities
    globalSearch: (query) => {
      if (!query || !query.trim()) return [];
      const q = query.trim().toLowerCase();
      const results = [];

      // 1. Products (name, SKU, code, barcode)
      products.forEach(p => {
        if (
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.code && p.code.toLowerCase().includes(q)) ||
          (p.barcode && p.barcode.toLowerCase().includes(q))
        ) {
          results.push({
            type: 'Product',
            title: p.name,
            subtitle: `Barcode: ${p.barcode} · SKU: ${p.sku} · Stock: ${p.currentStock} ${p.uom} · MRP: ₹${p.mrp}`,
            id: p.id,
            route: 'product-list',
            badge: `₹${p.sellingPrice}`,
            color: '#3b82f6'
          });
        }
      });

      // 2. Customers (name, mobile)
      customers.forEach(c => {
        if (
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.mobile && c.mobile.includes(q))
        ) {
          results.push({
            type: 'Customer',
            title: c.name,
            subtitle: `Mobile: ${c.mobile} · Group: ${c.group} · Dues: ₹${c.outstanding.toFixed(2)}`,
            id: c.id,
            route: 'customers',
            badge: `₹${c.outstanding.toFixed(2)} Dues`,
            color: '#10b981'
          });
        }
      });

      // 3. Suppliers (name, mobile)
      suppliers.forEach(s => {
        if (
          (s.name && s.name.toLowerCase().includes(q)) ||
          (s.mobile && s.mobile.includes(q)) ||
          (s.gstin && s.gstin.toLowerCase().includes(q))
        ) {
          results.push({
            type: 'Supplier',
            title: s.name,
            subtitle: `Mobile: ${s.mobile} · GSTIN: ${s.gstin} · Dues: ₹${s.outstanding.toFixed(2)}`,
            id: s.id,
            route: 'supplier-list',
            badge: `Supplier`,
            color: '#8b5cf6'
          });
        }
      });

      // 4. Invoices (invoice number, customer name)
      invoices.forEach(inv => {
        if (
          (inv.invoiceNo && inv.invoiceNo.toLowerCase().includes(q)) ||
          (inv.customerName && inv.customerName.toLowerCase().includes(q)) ||
          (inv.refNo && inv.refNo.toLowerCase().includes(q))
        ) {
          results.push({
            type: 'Invoice',
            title: inv.invoiceNo,
            subtitle: `${inv.customerName} · ${inv.date} · ${inv.paymentMode} · Ref: ${inv.refNo}`,
            id: inv.invoiceNo,
            route: 'sales-list',
            badge: `₹${inv.amount.toFixed(2)}`,
            color: '#f59e0b'
          });
        }
      });

      // 5. Purchase entries (purchase number, supplier name)
      purchases.forEach(pur => {
        if (
          (pur.purchaseNo && pur.purchaseNo.toLowerCase().includes(q)) ||
          (pur.supplierName && pur.supplierName.toLowerCase().includes(q)) ||
          (pur.invoiceRef && pur.invoiceRef.toLowerCase().includes(q))
        ) {
          results.push({
            type: 'Purchase',
            title: pur.purchaseNo,
            subtitle: `${pur.supplierName} · Inv Ref: ${pur.invoiceRef} · Date: ${pur.date}`,
            id: pur.purchaseNo,
            route: 'purchase-list',
            badge: `₹${pur.totalAmount.toFixed(2)}`,
            color: '#ec4899'
          });
        }
      });

      // 6. Transactions (reference number)
      invoices.forEach(inv => {
        if (inv.refNo && inv.refNo.toLowerCase().includes(q) && !results.some(r => r.title === inv.refNo)) {
          results.push({
            type: 'Transaction',
            title: inv.refNo,
            subtitle: `Bill ${inv.invoiceNo} · Amount: ₹${inv.amount.toFixed(2)} · ${inv.paymentMode}`,
            id: inv.refNo,
            route: 'day-book',
            badge: inv.status,
            color: '#06b6d4'
          });
        }
      });

      return results;
    }
  };
})();

