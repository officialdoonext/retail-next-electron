/**
 * RetailNext — Main Menu and Navigation Configuration
 * 
 * Defines the complete menu hierarchy according to the RetailNext desktop application specification:
 * 1. File
 * 2. Masters
 * 3. Transactions
 * 4. Inventory
 * 5. Accounts
 * 6. Reports
 * 7. Employees
 * 8. Settings
 * 9. Help
 */

'use strict';

window.RETAIL_MENUS = [
  // ─── 1. FILE ─────────────────────────────────────────────────────────────
  {
    id: 'file',
    label: 'File',
    mnemonic: 'F',
    items: [
      {
        id: 'file-company',
        label: 'Company',
        children: [
          { id: 'file-company-profile', label: 'Company Profile', route: 'company-profile' },
          { id: 'file-company-edit', label: 'Edit Company Details', route: 'company-edit' }
        ]
      },
      {
        id: 'file-financial-year',
        label: 'Financial Year',
        children: [
          { id: 'file-fy-select', label: 'Select Year', route: 'financial-year-select' },
          { id: 'file-fy-create', label: 'Create Year', route: 'financial-year-create' },
          { id: 'file-fy-close', label: 'Year-End Closing', route: 'financial-year-close' }
        ]
      },
      {
        id: 'file-branch',
        label: 'Branch',
        children: [
          { id: 'file-branch-select', label: 'Select Branch', route: 'branch-select' },
          { id: 'file-branch-switch', label: 'Switch Branch', route: 'branch-switch' }
        ]
      },
      { type: 'separator' },
      {
        id: 'file-data-mgmt',
        label: 'Data Management',
        children: [
          { id: 'file-backup', label: 'Backup Database', shortcut: 'Ctrl+B', route: 'backup-database' },
          { id: 'file-restore', label: 'Restore Database', route: 'restore-database' },
          { id: 'file-export', label: 'Export Data', route: 'export-data' }
        ]
      },
      {
        id: 'file-import-data',
        label: 'Import Data',
        children: [
          { id: 'file-import-products', label: 'Import Products', route: 'import-products' },
          { id: 'file-import-customers', label: 'Import Customers', route: 'import-customers' },
          { id: 'file-import-suppliers', label: 'Import Suppliers', route: 'import-suppliers' },
          { id: 'file-import-stock', label: 'Import Opening Stock', route: 'import-opening-stock' }
        ]
      },
      { type: 'separator' },
      {
        id: 'file-session',
        label: 'Session',
        children: [
          { id: 'file-lock-app', label: 'Lock Application', route: 'lock-app' },
          { id: 'file-switch-user', label: 'Switch User', route: 'switch-user' }
        ]
      },
      {
        id: 'file-print-setup',
        label: 'Print Setup',
        children: [
          { id: 'file-printer-default', label: 'Default Printer', route: 'print-setup' },
          { id: 'file-page-setup', label: 'Page Setup', route: 'page-setup' }
        ]
      },
      { type: 'separator' },
      { id: 'file-exit', label: 'Exit Application', shortcut: 'Alt+F4', route: 'exit-app' }
    ]
  },

  // ─── 2. MASTERS ──────────────────────────────────────────────────────────
  {
    id: 'masters',
    label: 'Masters',
    mnemonic: 'M',
    items: [
      {
        id: 'mas-product-master',
        label: 'Product Master',
        children: [
          { id: 'mas-product-add', label: 'Add Product', shortcut: 'F3', route: 'product-add' },
          { id: 'mas-product-edit', label: 'Edit Product', route: 'product-list' },
          { id: 'mas-product-delete', label: 'Delete / Deactivate Product', route: 'product-list' },
          { id: 'mas-product-list', label: 'Product List', route: 'product-list' }
        ]
      },
      {
        id: 'mas-categories',
        label: 'Product Categories',
        children: [
          { id: 'mas-cat-main', label: 'Main Category', route: 'category-main' },
          { id: 'mas-cat-sub', label: 'Subcategory', route: 'category-sub' },
          { id: 'mas-cat-list', label: 'Category List', route: 'category-list' }
        ]
      },
      {
        id: 'mas-brands',
        label: 'Brands',
        children: [
          { id: 'mas-brand-add', label: 'Add Brand', route: 'brand-add' },
          { id: 'mas-brand-edit', label: 'Edit Brand', route: 'brand-edit' },
          { id: 'mas-brand-list', label: 'Brand List', route: 'brand-list' }
        ]
      },
      {
        id: 'mas-uom',
        label: 'Units of Measurement',
        children: [
          { id: 'mas-uom-pieces', label: 'Pieces (Pcs)', route: 'uom-pieces' },
          { id: 'mas-uom-box', label: 'Box', route: 'uom-box' },
          { id: 'mas-uom-packet', label: 'Packet (Pkt)', route: 'uom-packet' },
          { id: 'mas-uom-gram', label: 'Gram (g)', route: 'uom-gram' },
          { id: 'mas-uom-kg', label: 'Kilogram (Kg)', route: 'uom-kg' },
          { id: 'mas-uom-litre', label: 'Litre (L)', route: 'uom-litre' },
          { id: 'mas-uom-metre', label: 'Metre (m)', route: 'uom-metre' }
        ]
      },
      {
        id: 'mas-conversions',
        label: 'Unit Conversions',
        children: [
          { id: 'mas-conv-box-pcs', label: 'Box-to-Pieces', route: 'unit-conv-box' },
          { id: 'mas-conv-kg-g', label: 'Kilogram-to-Grams', route: 'unit-conv-kg' },
          { id: 'mas-conv-pack', label: 'Pack Conversions', route: 'unit-conv-pack' }
        ]
      },
      {
        id: 'mas-variants',
        label: 'Product Variants',
        children: [
          { id: 'mas-var-size', label: 'Size', route: 'variant-size' },
          { id: 'mas-var-colour', label: 'Colour', route: 'variant-colour' },
          { id: 'mas-var-weight', label: 'Weight', route: 'variant-weight' },
          { id: 'mas-var-model', label: 'Model', route: 'variant-model' },
          { id: 'mas-var-list', label: 'Variant List', route: 'variant-list' }
        ]
      },
      {
        id: 'mas-barcodes',
        label: 'Barcodes',
        children: [
          { id: 'mas-bc-gen', label: 'Generate Barcode', route: 'barcode-generate' },
          { id: 'mas-bc-assign', label: 'Assign Barcode', route: 'barcode-assign' },
          { id: 'mas-bc-multiple', label: 'Multiple Barcodes', route: 'barcode-multiple' }
        ]
      },
      {
        id: 'mas-pricing',
        label: 'Product Pricing',
        children: [
          { id: 'mas-price-selling', label: 'Selling Price', route: 'pricing-selling' },
          { id: 'mas-price-mrp', label: 'MRP', route: 'pricing-mrp' },
          { id: 'mas-price-wholesale', label: 'Wholesale Price', route: 'pricing-wholesale' },
          { id: 'mas-price-retail', label: 'Retail Price', route: 'pricing-retail' }
        ]
      },
      {
        id: 'mas-pricelists',
        label: 'Price Lists',
        children: [
          { id: 'mas-pl-customer', label: 'Customer Price List', route: 'pricelist-customer' },
          { id: 'mas-pl-bulk', label: 'Bulk Price Update', route: 'pricelist-bulk' }
        ]
      },
      { type: 'separator' },
      {
        id: 'mas-tax',
        label: 'Tax Master',
        children: [
          { id: 'mas-tax-gst', label: 'GST Rates (0%, 5%, 12%, 18%, 28%)', route: 'tax-gst' },
          { id: 'mas-tax-hsn', label: 'HSN / SAC Codes', route: 'tax-hsn' },
          { id: 'mas-tax-categories', label: 'Tax Categories', route: 'tax-categories' }
        ]
      },
      {
        id: 'mas-customer',
        label: 'Customer Master',
        children: [
          { id: 'mas-cust-add', label: 'Add Customer', route: 'customer-add' },
          { id: 'mas-cust-list', label: 'Customer List', shortcut: 'F9', route: 'customers' },
          { id: 'mas-cust-groups', label: 'Customer Groups', route: 'customer-groups' }
        ]
      },
      {
        id: 'mas-supplier',
        label: 'Supplier Master',
        children: [
          { id: 'mas-supp-add', label: 'Add Supplier', route: 'supplier-add' },
          { id: 'mas-supp-list', label: 'Supplier List', route: 'supplier-list' },
          { id: 'mas-supp-groups', label: 'Supplier Groups', route: 'supplier-groups' }
        ]
      },
      {
        id: 'mas-payment-modes',
        label: 'Payment Modes',
        children: [
          { id: 'mas-pay-cash', label: 'Cash', route: 'paymode-cash' },
          { id: 'mas-pay-upi', label: 'UPI / QR Code', route: 'paymode-upi' },
          { id: 'mas-pay-card', label: 'Credit / Debit Card', route: 'paymode-card' },
          { id: 'mas-pay-bank', label: 'Bank Transfer / NEFT', route: 'paymode-bank' },
          { id: 'mas-pay-credit', label: 'Store Credit / Dues', route: 'paymode-credit' }
        ]
      },
      {
        id: 'mas-discounts',
        label: 'Discount Master',
        children: [
          { id: 'mas-disc-rules', label: 'Discount Rules', route: 'discount-rules' },
          { id: 'mas-disc-item', label: 'Item Discounts', route: 'discount-items' },
          { id: 'mas-disc-bill', label: 'Bill Discounts', route: 'discount-bill' }
        ]
      },
      {
        id: 'mas-opening-balances',
        label: 'Opening Balances',
        children: [
          { id: 'mas-ob-stock', label: 'Opening Stock', route: 'opening-stock' },
          { id: 'mas-ob-customer', label: 'Customer Balances', route: 'customer-balances' },
          { id: 'mas-ob-supplier', label: 'Supplier Balances', route: 'supplier-balances' }
        ]
      },
      {
        id: 'mas-loyalty',
        label: 'Loyalty Master',
        children: [
          { id: 'mas-loy-points', label: 'Loyalty Points', route: 'loyalty-points' },
          { id: 'mas-loy-rules', label: 'Reward Rules', route: 'reward-rules' },
          { id: 'mas-loy-memberships', label: 'Membership Types', route: 'membership-types' }
        ]
      }
    ]
  },

  // ─── 3. TRANSACTIONS ─────────────────────────────────────────────────────
  {
    id: 'transactions',
    label: 'Transactions',
    mnemonic: 'T',
    items: [
      {
        id: 'txn-sales',
        label: 'Sales',
        children: [
          { id: 'txn-sales-new', label: 'New Sales Bill', shortcut: 'F2', route: 'pos-billing' },
          { id: 'txn-sales-list', label: 'Sales Invoice List', route: 'sales-list' },
          { id: 'txn-sales-edit', label: 'Edit / Duplicate Bill', route: 'sales-edit' }
        ]
      },
      {
        id: 'txn-pos',
        label: 'POS Billing',
        children: [
          { id: 'txn-pos-open', label: 'Open POS', shortcut: 'F2', route: 'pos-billing' },
          { id: 'txn-pos-quick', label: 'Quick Billing', route: 'pos-billing' },
          { id: 'txn-pos-barcode', label: 'Barcode Billing', route: 'pos-billing' }
        ]
      },
      {
        id: 'txn-quotation',
        label: 'Quotation',
        children: [
          { id: 'txn-quot-create', label: 'Create Quotation', route: 'quotation-create' },
          { id: 'txn-quot-list', label: 'Quotation List', route: 'quotation-list' },
          { id: 'txn-quot-convert', label: 'Convert to Invoice', route: 'quotation-convert' }
        ]
      },
      {
        id: 'txn-sales-order',
        label: 'Sales Order',
        children: [
          { id: 'txn-so-create', label: 'Create Order', route: 'so-create' },
          { id: 'txn-so-list', label: 'Order List', route: 'so-list' },
          { id: 'txn-so-convert', label: 'Convert to Invoice', route: 'so-convert' }
        ]
      },
      {
        id: 'txn-delivery-challan',
        label: 'Delivery Challan',
        children: [
          { id: 'txn-dc-create', label: 'Create Challan', route: 'dc-create' },
          { id: 'txn-dc-list', label: 'Challan List', route: 'dc-list' }
        ]
      },
      {
        id: 'txn-sales-return',
        label: 'Sales Return',
        children: [
          { id: 'txn-sr-items', label: 'Return Items', shortcut: 'F7', route: 'sales-return' },
          { id: 'txn-sr-creditnote', label: 'Credit Note', route: 'credit-note' },
          { id: 'txn-sr-refund', label: 'Refund', route: 'sales-refund' }
        ]
      },
      { type: 'separator' },
      {
        id: 'txn-purchase',
        label: 'Purchase',
        children: [
          { id: 'txn-pur-new', label: 'New Purchase Entry', shortcut: 'F6', route: 'purchase-entry' },
          { id: 'txn-pur-list', label: 'Purchase Invoice List', route: 'purchase-list' }
        ]
      },
      {
        id: 'txn-purchase-order',
        label: 'Purchase Order',
        children: [
          { id: 'txn-po-create', label: 'Create Order', route: 'po-create' },
          { id: 'txn-po-list', label: 'Order List', route: 'po-list' },
          { id: 'txn-po-convert', label: 'Convert to Purchase', route: 'po-convert' }
        ]
      },
      {
        id: 'txn-purchase-return',
        label: 'Purchase Return',
        children: [
          { id: 'txn-pr-return', label: 'Return to Supplier', shortcut: 'F8', route: 'purchase-return' },
          { id: 'txn-pr-debitnote', label: 'Debit Note', route: 'debit-note' }
        ]
      },
      { type: 'separator' },
      {
        id: 'txn-sales-payments',
        label: 'Sales Payments',
        children: [
          { id: 'txn-sp-receive', label: 'Receive Payment', shortcut: 'F4', route: 'receive-payment' },
          { id: 'txn-sp-cust-outstanding', label: 'Customer Outstanding', route: 'customer-outstanding' }
        ]
      },
      {
        id: 'txn-supplier-payments',
        label: 'Supplier Payments',
        children: [
          { id: 'txn-sup-pay', label: 'Pay Supplier', route: 'pay-supplier' },
          { id: 'txn-sup-outstanding', label: 'Supplier Outstanding', route: 'supplier-outstanding' }
        ]
      },
      {
        id: 'txn-receipts',
        label: 'Receipts',
        children: [
          { id: 'txn-rec-cust', label: 'Customer Receipt', route: 'customer-receipt' },
          { id: 'txn-rec-advance', label: 'Advance Receipt', route: 'advance-receipt' }
        ]
      },
      {
        id: 'txn-payments',
        label: 'Payments',
        children: [
          { id: 'txn-pay-sup', label: 'Supplier Payment', route: 'supplier-payment' },
          { id: 'txn-pay-other', label: 'Other Payment', route: 'other-payment' }
        ]
      },
      { type: 'separator' },
      {
        id: 'txn-stock-inward',
        label: 'Stock Inward',
        children: [
          { id: 'txn-si-receipt', label: 'Goods Receipt', route: 'goods-receipt' },
          { id: 'txn-si-purchase', label: 'Purchase Inward', route: 'purchase-inward' }
        ]
      },
      {
        id: 'txn-stock-outward',
        label: 'Stock Outward',
        children: [
          { id: 'txn-so-issue', label: 'Goods Issue', route: 'goods-issue' },
          { id: 'txn-so-delivery', label: 'Delivery Outward', route: 'delivery-outward' }
        ]
      },
      {
        id: 'txn-credit-debit-notes',
        label: 'Credit / Debit Notes',
        children: [
          { id: 'txn-cdn-create', label: 'Create Note', route: 'create-note' },
          { id: 'txn-cdn-register', label: 'Note Register', route: 'note-register' }
        ]
      },
      {
        id: 'txn-cancelled',
        label: 'Cancelled Transactions',
        children: [
          { id: 'txn-can-bills', label: 'Cancelled Bills', route: 'cancelled-bills' },
          { id: 'txn-can-void', label: 'Voided Invoices', route: 'voided-invoices' }
        ]
      }
    ]
  },

  // ─── 4. INVENTORY ────────────────────────────────────────────────────────
  {
    id: 'inventory',
    label: 'Inventory',
    mnemonic: 'I',
    items: [
      {
        id: 'inv-stock-summary',
        label: 'Stock Summary',
        children: [
          { id: 'inv-ss-current', label: 'Current Stock', route: 'stock-summary' },
          { id: 'inv-ss-valuation', label: 'Stock Valuation', route: 'stock-valuation' }
        ]
      },
      {
        id: 'inv-stock-ledger',
        label: 'Stock Ledger',
        children: [
          { id: 'inv-sl-movement', label: 'Product-wise Stock Movement', route: 'stock-ledger' }
        ]
      },
      {
        id: 'inv-stock-inward',
        label: 'Stock Inward',
        children: [
          { id: 'inv-si-register', label: 'Inward Register', route: 'stock-inward-reg' }
        ]
      },
      {
        id: 'inv-stock-outward',
        label: 'Stock Outward',
        children: [
          { id: 'inv-so-register', label: 'Outward Register', route: 'stock-outward-reg' }
        ]
      },
      {
        id: 'inv-stock-transfer',
        label: 'Stock Transfer',
        children: [
          { id: 'inv-st-branch', label: 'Branch Transfer', route: 'branch-transfer' },
          { id: 'inv-st-warehouse', label: 'Warehouse Transfer', route: 'warehouse-transfer' }
        ]
      },
      {
        id: 'inv-stock-adjustment',
        label: 'Stock Adjustment',
        children: [
          { id: 'inv-sa-increase', label: 'Increase Stock', route: 'stock-adj-increase' },
          { id: 'inv-sa-decrease', label: 'Decrease Stock', route: 'stock-adj-decrease' },
          { id: 'inv-sa-damage', label: 'Damage / Loss', route: 'stock-adj-damage' }
        ]
      },
      {
        id: 'inv-physical-stock',
        label: 'Physical Stock',
        children: [
          { id: 'inv-ps-count', label: 'Stock Count', route: 'physical-stock-count' },
          { id: 'inv-ps-reconcile', label: 'Stock Reconciliation', route: 'physical-stock-recon' }
        ]
      },
      {
        id: 'inv-opening-stock',
        label: 'Opening Stock',
        children: [
          { id: 'inv-os-enter', label: 'Enter and Import Opening Stock', route: 'opening-stock' }
        ]
      },
      { type: 'separator' },
      {
        id: 'inv-reorder',
        label: 'Reorder Management',
        children: [
          { id: 'inv-ro-min', label: 'Minimum Stock', route: 'reorder-minimum' },
          { id: 'inv-ro-suggestions', label: 'Reorder Suggestions', route: 'reorder-suggestions' }
        ]
      },
      {
        id: 'inv-low-stock',
        label: 'Low Stock',
        children: [
          { id: 'inv-ls-items', label: 'Low Stock Items', route: 'low-stock' },
          { id: 'inv-ls-oos', label: 'Out-of-Stock Items', route: 'out-of-stock' }
        ]
      },
      {
        id: 'inv-batches',
        label: 'Batch Management',
        children: [
          { id: 'inv-bm-list', label: 'Batch List', route: 'batch-list' },
          { id: 'inv-bm-stock', label: 'Batch Stock', route: 'batch-stock' },
          { id: 'inv-bm-expiry', label: 'Expiry Tracking', route: 'batch-expiry' }
        ]
      },
      {
        id: 'inv-serials',
        label: 'Serial Number Management',
        children: [
          { id: 'inv-sn-register', label: 'Serial Number Register', route: 'serial-register' },
          { id: 'inv-sn-tracking', label: 'Serial Tracking', route: 'serial-tracking' }
        ]
      },
      {
        id: 'inv-barcode-print',
        label: 'Barcode Printing',
        children: [
          { id: 'inv-bp-single', label: 'Single Label', route: 'barcode-label-single' },
          { id: 'inv-bp-bulk', label: 'Bulk Labels', route: 'barcode-label-bulk' },
          { id: 'inv-bp-shelf', label: 'Shelf Labels', route: 'barcode-label-shelf' }
        ]
      },
      {
        id: 'inv-stock-audit',
        label: 'Stock Audit',
        children: [
          { id: 'inv-sa-verification', label: 'Stock Verification', route: 'stock-audit-verify' },
          { id: 'inv-sa-variance', label: 'Variance Report', route: 'stock-audit-variance' }
        ]
      },
      {
        id: 'inv-expiry-mgmt',
        label: 'Expiry Management',
        children: [
          { id: 'inv-em-expiring', label: 'Expiring Products', route: 'expiry-expiring' },
          { id: 'inv-em-expired', label: 'Expired Products', route: 'expiry-expired' }
        ]
      },
      {
        id: 'inv-warehouse-rack',
        label: 'Warehouse / Rack',
        children: [
          { id: 'inv-wr-warehouses', label: 'Warehouses', route: 'warehouses' },
          { id: 'inv-wr-racks', label: 'Racks', route: 'racks' },
          { id: 'inv-wr-shelves', label: 'Shelves', route: 'shelves' },
          { id: 'inv-wr-locations', label: 'Locations', route: 'storage-locations' }
        ]
      }
    ]
  },

  // ─── 5. ACCOUNTS ─────────────────────────────────────────────────────────
  {
    id: 'accounts',
    label: 'Accounts',
    mnemonic: 'A',
    items: [
      {
        id: 'acc-dashboard',
        label: 'Dashboard',
        children: [
          { id: 'acc-dash-cash', label: 'Cash Position', route: 'cash-position' },
          { id: 'acc-dash-receivables', label: 'Receivables', route: 'receivables-summary' },
          { id: 'acc-dash-payables', label: 'Payables', route: 'payables-summary' }
        ]
      },
      {
        id: 'acc-cash-book',
        label: 'Cash Book',
        children: [
          { id: 'acc-cb-receipts', label: 'Cash Receipts', route: 'cash-receipts' },
          { id: 'acc-cb-payments', label: 'Cash Payments', route: 'cash-payments' },
          { id: 'acc-cb-balance', label: 'Cash Balance', route: 'cash-balance' }
        ]
      },
      {
        id: 'acc-bank-book',
        label: 'Bank Book',
        children: [
          { id: 'acc-bb-txns', label: 'Bank Transactions', route: 'bank-transactions' },
          { id: 'acc-bb-deposits', label: 'Deposits', route: 'bank-deposits' },
          { id: 'acc-bb-withdrawals', label: 'Withdrawals', route: 'bank-withdrawals' }
        ]
      },
      {
        id: 'acc-expense',
        label: 'Expense Management',
        children: [
          { id: 'acc-exp-add', label: 'Add Expense', route: 'expense-add' },
          { id: 'acc-exp-categories', label: 'Expense Categories', route: 'expense-categories' },
          { id: 'acc-exp-register', label: 'Expense Register', route: 'expense-register' }
        ]
      },
      {
        id: 'acc-income',
        label: 'Income Management',
        children: [
          { id: 'acc-inc-other', label: 'Other Income', route: 'income-other' },
          { id: 'acc-inc-register', label: 'Income Register', route: 'income-register' }
        ]
      },
      {
        id: 'acc-customer-ledger',
        label: 'Customer Ledger',
        children: [
          { id: 'acc-cl-txns', label: 'Customer Transactions', route: 'customer-ledger-txns' },
          { id: 'acc-cl-outstanding', label: 'Outstanding Balance', route: 'customer-ledger-balance' }
        ]
      },
      {
        id: 'acc-supplier-ledger',
        label: 'Supplier Ledger',
        children: [
          { id: 'acc-sl-txns', label: 'Supplier Transactions', route: 'supplier-ledger-txns' },
          { id: 'acc-sl-outstanding', label: 'Outstanding Balance', route: 'supplier-ledger-balance' }
        ]
      },
      {
        id: 'acc-day-book',
        label: 'Day Book',
        children: [
          { id: 'acc-db-daily', label: 'All Daily Financial Transactions', route: 'day-book' }
        ]
      },
      { type: 'separator' },
      {
        id: 'acc-journal',
        label: 'Journal Entries',
        children: [
          { id: 'acc-je-voucher', label: 'Journal Voucher', route: 'journal-voucher' },
          { id: 'acc-je-register', label: 'Journal Register', route: 'journal-register' }
        ]
      },
      {
        id: 'acc-contra',
        label: 'Contra Entries',
        children: [
          { id: 'acc-ce-c2b', label: 'Cash-to-Bank', route: 'contra-cash-to-bank' },
          { id: 'acc-ce-b2c', label: 'Bank-to-Cash', route: 'contra-bank-to-cash' }
        ]
      },
      {
        id: 'acc-receivable',
        label: 'Accounts Receivable',
        children: [
          { id: 'acc-ar-dues', label: 'Customer Dues', route: 'ar-dues' },
          { id: 'acc-ar-ageing', label: 'Ageing Analysis', route: 'ar-ageing' },
          { id: 'acc-ar-collection', label: 'Collection Schedule', route: 'ar-collection' }
        ]
      },
      {
        id: 'acc-payable',
        label: 'Accounts Payable',
        children: [
          { id: 'acc-ap-dues', label: 'Supplier Dues', route: 'ap-dues' },
          { id: 'acc-ap-ageing', label: 'Ageing Analysis', route: 'ap-ageing' },
          { id: 'acc-ap-schedule', label: 'Payment Schedule', route: 'ap-schedule' }
        ]
      },
      { type: 'separator' },
      {
        id: 'acc-gst',
        label: 'GST Management',
        children: [
          { id: 'acc-gst-summary', label: 'GST Summary', route: 'gst-summary' },
          { id: 'acc-gst-itc', label: 'Input Tax Credit (ITC)', route: 'gst-input-tax' },
          { id: 'acc-gst-output', label: 'Output Tax', route: 'gst-output-tax' }
        ]
      },
      {
        id: 'acc-gst-reports',
        label: 'GST Reports',
        children: [
          { id: 'acc-gstr-1', label: 'GSTR-1 Data', route: 'gstr1-report' },
          { id: 'acc-gstr-3b', label: 'GSTR-3B Summary', route: 'gstr3b-report' },
          { id: 'acc-gstr-hsn', label: 'HSN Summary', route: 'hsn-summary' }
        ]
      },
      {
        id: 'acc-pnl',
        label: 'Profit & Loss',
        children: [
          { id: 'acc-pnl-overview', label: 'Revenue, COGS, Expenses, Net Profit', route: 'profit-loss' }
        ]
      },
      {
        id: 'acc-balance-sheet',
        label: 'Balance Sheet',
        children: [
          { id: 'acc-bs-overview', label: 'Assets, Liabilities, Capital', route: 'balance-sheet' }
        ]
      },
      {
        id: 'acc-trial-balance',
        label: 'Trial Balance',
        children: [
          { id: 'acc-tb-overview', label: 'Account Balances', route: 'trial-balance' }
        ]
      },
      {
        id: 'acc-day-closing',
        label: 'Day Closing',
        children: [
          { id: 'acc-dc-reconcile', label: 'Cash Reconciliation', route: 'day-closing-cash' },
          { id: 'acc-dc-summary', label: 'Day-End Summary', route: 'day-closing-summary' }
        ]
      }
    ]
  },

  // ─── 6. REPORTS ──────────────────────────────────────────────────────────
  {
    id: 'reports',
    label: 'Reports',
    mnemonic: 'R',
    items: [
      {
        id: 'rep-dashboard',
        label: 'Dashboard Reports',
        children: [
          { id: 'rep-dash-daily', label: 'Daily Summary', route: 'rep-daily-summary' },
          { id: 'rep-dash-monthly', label: 'Monthly Summary', route: 'rep-monthly-summary' },
          { id: 'rep-dash-kpi', label: 'KPI Overview', route: 'rep-kpi-overview' }
        ]
      },
      {
        id: 'rep-sales',
        label: 'Sales Reports',
        children: [
          { id: 'rep-sl-daily', label: 'Daily Sales', route: 'rep-sales-daily' },
          { id: 'rep-sl-monthly', label: 'Monthly Sales', route: 'rep-sales-monthly' },
          { id: 'rep-sl-register', label: 'Invoice Register', route: 'rep-invoice-register' }
        ]
      },
      {
        id: 'rep-product-sales',
        label: 'Product Sales',
        children: [
          { id: 'rep-ps-item', label: 'Item-wise Sales', route: 'rep-item-sales' },
          { id: 'rep-ps-category', label: 'Category-wise Sales', route: 'rep-category-sales' },
          { id: 'rep-ps-brand', label: 'Brand-wise Sales', route: 'rep-brand-sales' }
        ]
      },
      {
        id: 'rep-customer',
        label: 'Customer Reports',
        children: [
          { id: 'rep-cr-wise', label: 'Customer-wise Sales', route: 'rep-customer-sales' },
          { id: 'rep-cr-top', label: 'Top Customers', route: 'rep-top-customers' },
          { id: 'rep-cr-outstanding', label: 'Outstanding Report', route: 'rep-cust-outstanding' }
        ]
      },
      {
        id: 'rep-purchase',
        label: 'Purchase Reports',
        children: [
          { id: 'rep-pr-register', label: 'Purchase Register', route: 'rep-purchase-register' },
          { id: 'rep-pr-supplier', label: 'Supplier-wise Purchases', route: 'rep-supplier-purchases' }
        ]
      },
      {
        id: 'rep-purchase-analysis',
        label: 'Purchase Analysis',
        children: [
          { id: 'rep-pa-history', label: 'Product Purchase History', route: 'rep-purchase-history' },
          { id: 'rep-pa-changes', label: 'Purchase Price Changes', route: 'rep-price-changes' }
        ]
      },
      {
        id: 'rep-inventory',
        label: 'Inventory Reports',
        children: [
          { id: 'rep-ir-current', label: 'Current Stock', route: 'rep-current-stock' },
          { id: 'rep-ir-valuation', label: 'Stock Valuation', route: 'rep-stock-valuation' },
          { id: 'rep-ir-ledger', label: 'Stock Ledger', route: 'rep-stock-ledger' }
        ]
      },
      {
        id: 'rep-stock-alerts',
        label: 'Stock Alerts',
        children: [
          { id: 'rep-sa-low', label: 'Low Stock Report', route: 'rep-low-stock' },
          { id: 'rep-sa-oos', label: 'Out of Stock Report', route: 'rep-out-of-stock' },
          { id: 'rep-sa-expiring', label: 'Expiring Stock Report', route: 'rep-expiring-stock' }
        ]
      },
      {
        id: 'rep-profit',
        label: 'Profit Reports',
        children: [
          { id: 'rep-pf-gross', label: 'Gross Profit', route: 'rep-gross-profit' },
          { id: 'rep-pf-product', label: 'Product-wise Profit', route: 'rep-product-profit' },
          { id: 'rep-pf-margin', label: 'Margin Analysis', route: 'rep-margin-analysis' }
        ]
      },
      {
        id: 'rep-discounts',
        label: 'Discount Reports',
        children: [
          { id: 'rep-dc-register', label: 'Discount Register', route: 'rep-discount-register' },
          { id: 'rep-dc-emp', label: 'Discount by Employee', route: 'rep-discount-employee' }
        ]
      },
      {
        id: 'rep-payments',
        label: 'Payment Reports',
        children: [
          { id: 'rep-pay-cash', label: 'Cash, UPI, Card, Bank, Credit Sales', route: 'rep-payment-summary' }
        ]
      },
      {
        id: 'rep-returns',
        label: 'Returns Reports',
        children: [
          { id: 'rep-rt-sales', label: 'Sales Returns', route: 'rep-sales-returns' },
          { id: 'rep-rt-purchase', label: 'Purchase Returns', route: 'rep-purchase-returns' },
          { id: 'rep-rt-refunds', label: 'Refunds Report', route: 'rep-refunds' }
        ]
      },
      {
        id: 'rep-tax',
        label: 'Tax Reports',
        children: [
          { id: 'rep-tx-gst', label: 'GST Summary', route: 'rep-tax-gst' },
          { id: 'rep-tx-hsn', label: 'HSN Summary', route: 'rep-tax-hsn' },
          { id: 'rep-tx-taxable', label: 'Taxable Sales', route: 'rep-taxable-sales' }
        ]
      },
      {
        id: 'rep-expenses',
        label: 'Expense Reports',
        children: [
          { id: 'rep-ex-daily', label: 'Daily Expenses', route: 'rep-expense-daily' },
          { id: 'rep-ex-monthly', label: 'Monthly Expenses', route: 'rep-expense-monthly' },
          { id: 'rep-ex-category', label: 'Category-wise Expenses', route: 'rep-expense-category' }
        ]
      },
      {
        id: 'rep-employees',
        label: 'Employee Reports',
        children: [
          { id: 'rep-em-sales', label: 'Employee-wise Sales', route: 'rep-employee-sales' },
          { id: 'rep-em-void', label: 'Voided Bills', route: 'rep-voided-bills' },
          { id: 'rep-em-disc', label: 'Employee Discounts', route: 'rep-employee-discounts' }
        ]
      },
      {
        id: 'rep-branch',
        label: 'Branch Reports',
        children: [
          { id: 'rep-br-sales', label: 'Branch-wise Sales', route: 'rep-branch-sales' },
          { id: 'rep-br-stock', label: 'Branch-wise Stock', route: 'rep-branch-stock' },
          { id: 'rep-br-profit', label: 'Branch-wise Profit', route: 'rep-branch-profit' }
        ]
      },
      {
        id: 'rep-audit',
        label: 'Audit Reports',
        children: [
          { id: 'rep-au-login', label: 'Login History', route: 'rep-login-history' },
          { id: 'rep-au-changes', label: 'System Changes', route: 'rep-changes-history' },
          { id: 'rep-au-activity', label: 'Transaction Activity Log', route: 'rep-activity-log' }
        ]
      }
    ]
  },

  // ─── 7. EMPLOYEES ────────────────────────────────────────────────────────
  {
    id: 'employees',
    label: 'Employees',
    mnemonic: 'E',
    items: [
      {
        id: 'emp-master',
        label: 'Employee Master',
        children: [
          { id: 'emp-em-add', label: 'Add Employee', route: 'employee-add' },
          { id: 'emp-em-edit', label: 'Edit Employee', route: 'employee-edit' },
          { id: 'emp-em-list', label: 'Employee List', route: 'employee-list' }
        ]
      },
      {
        id: 'emp-users',
        label: 'User Accounts',
        children: [
          { id: 'emp-ua-create', label: 'Create Login', route: 'user-create' },
          { id: 'emp-ua-reset', label: 'Reset Password', route: 'user-reset-pwd' },
          { id: 'emp-ua-status', label: 'Activate / Deactivate', route: 'user-status' }
        ]
      },
      {
        id: 'emp-roles',
        label: 'Roles',
        children: [
          { id: 'emp-ro-admin', label: 'Admin', route: 'role-admin' },
          { id: 'emp-ro-manager', label: 'Manager', route: 'role-manager' },
          { id: 'emp-ro-cashier', label: 'Cashier', route: 'role-cashier' },
          { id: 'emp-ro-inv', label: 'Inventory Operator', route: 'role-inventory' },
          { id: 'emp-ro-accountant', label: 'Accountant', route: 'role-accountant' }
        ]
      },
      {
        id: 'emp-permissions',
        label: 'Permissions',
        children: [
          { id: 'emp-pm-menu', label: 'Menu Access', route: 'permission-menu' },
          { id: 'emp-pm-crud', label: 'View / Edit / Delete Permissions', route: 'permission-crud' }
        ]
      },
      {
        id: 'emp-attendance',
        label: 'Attendance',
        children: [
          { id: 'emp-att-in', label: 'Check-In', route: 'attendance-checkin' },
          { id: 'emp-att-out', label: 'Check-Out', route: 'attendance-checkout' },
          { id: 'emp-att-reg', label: 'Attendance Register', route: 'attendance-register' }
        ]
      },
      {
        id: 'emp-shift',
        label: 'Shift Management',
        children: [
          { id: 'emp-sm-create', label: 'Create Shift', route: 'shift-create' },
          { id: 'emp-sm-assign', label: 'Assign Shift', route: 'shift-assign' },
          { id: 'emp-sm-reg', label: 'Shift Register', route: 'shift-register' }
        ]
      },
      {
        id: 'emp-cashier-mgmt',
        label: 'Cashier Management',
        children: [
          { id: 'emp-cm-register', label: 'Assign Register', route: 'cashier-register' },
          { id: 'emp-cm-open', label: 'Opening Cash', route: 'cashier-open-cash' },
          { id: 'emp-cm-close', label: 'Closing Cash', route: 'cashier-close-cash' }
        ]
      },
      {
        id: 'emp-reconcile',
        label: 'Cash Reconciliation',
        children: [
          { id: 'emp-cr-summary', label: 'Expected Cash, Actual Cash, Cash Difference', route: 'cashier-reconciliation' }
        ]
      },
      {
        id: 'emp-activity-logs',
        label: 'Activity Logs',
        children: [
          { id: 'emp-al-history', label: 'Login History, Changes, Transaction Logs', route: 'employee-activity-logs' }
        ]
      }
    ]
  },

  // ─── 8. SETTINGS ─────────────────────────────────────────────────────────
  {
    id: 'settings',
    label: 'Settings',
    mnemonic: 'S',
    items: [
      {
        id: 'set-general',
        label: 'General Settings',
        children: [
          { id: 'set-gen-lang', label: 'Language', route: 'settings-general' },
          { id: 'set-gen-date', label: 'Date Format (DD/MM/YYYY)', route: 'settings-general' },
          { id: 'set-gen-num', label: 'Number & Currency Format (₹)', route: 'settings-general' }
        ]
      },
      {
        id: 'set-company',
        label: 'Company Settings',
        children: [
          { id: 'set-co-details', label: 'Company Name, Address, Logo, Contact Details', route: 'settings-company' }
        ]
      },
      {
        id: 'set-tax',
        label: 'Tax Settings',
        children: [
          { id: 'set-tx-gstin', label: 'GSTIN Registration', route: 'settings-tax' },
          { id: 'set-tx-inclusive', label: 'Tax Inclusive / Exclusive', route: 'settings-tax' },
          { id: 'set-tx-defaults', label: 'GST Defaults', route: 'settings-tax' }
        ]
      },
      {
        id: 'set-invoice',
        label: 'Invoice Settings',
        children: [
          { id: 'set-inv-num', label: 'Invoice Numbering', route: 'settings-invoice' },
          { id: 'set-inv-prefix', label: 'Prefix & Suffix Series', route: 'settings-invoice' },
          { id: 'set-inv-formats', label: 'Formats & Terms', route: 'settings-invoice' }
        ]
      },
      {
        id: 'set-billing',
        label: 'Billing Settings',
        children: [
          { id: 'set-bil-rules', label: 'Discounts, Returns, Credit Sales, Rounding', route: 'settings-billing' }
        ]
      },
      {
        id: 'set-pos',
        label: 'POS Settings',
        children: [
          { id: 'set-pos-config', label: 'Barcode Input, Quick Keys, Product Grid', route: 'settings-pos' }
        ]
      },
      {
        id: 'set-printers',
        label: 'Printer Settings',
        children: [
          { id: 'set-pr-thermal', label: 'Thermal Printer (80mm / 58mm)', route: 'settings-printer' },
          { id: 'set-pr-a4', label: 'A4 / Standard Printer', route: 'settings-printer' },
          { id: 'set-pr-default', label: 'Default Printer Selection', route: 'settings-printer' }
        ]
      },
      {
        id: 'set-barcodes',
        label: 'Barcode Settings',
        children: [
          { id: 'set-bc-config', label: 'Label Size, Barcode Format (Code128/EAN-13), Layout', route: 'settings-barcode' }
        ]
      },
      {
        id: 'set-payment',
        label: 'Payment Settings',
        children: [
          { id: 'set-pay-config', label: 'Payment Modes, UPI Details, Payment Integration', route: 'settings-payment' }
        ]
      },
      {
        id: 'set-inventory',
        label: 'Inventory Settings',
        children: [
          { id: 'set-inv-rules', label: 'Negative Stock, Reorder Levels, Stock Valuation (FIFO/Weighted)', route: 'settings-inventory' }
        ]
      },
      {
        id: 'set-product',
        label: 'Product Settings',
        children: [
          { id: 'set-prod-rules', label: 'SKU Rules, Duplicate Barcode Rules, Required Fields', route: 'settings-products' }
        ]
      },
      {
        id: 'set-customer',
        label: 'Customer Settings',
        children: [
          { id: 'set-cust-rules', label: 'Credit Limits, Loyalty Rules, Customer Fields', route: 'settings-customers' }
        ]
      },
      {
        id: 'set-supplier',
        label: 'Supplier Settings',
        children: [
          { id: 'set-sup-rules', label: 'Supplier Fields, Payment Terms', route: 'settings-suppliers' }
        ]
      },
      {
        id: 'set-branch',
        label: 'Branch Settings',
        children: [
          { id: 'set-br-rules', label: 'Branch Details, Warehouse Mapping', route: 'settings-branches' }
        ]
      },
      {
        id: 'set-backup',
        label: 'Backup Settings',
        children: [
          { id: 'set-bk-auto', label: 'Automatic Backup, Backup Location, Restore', route: 'settings-backup' }
        ]
      },
      {
        id: 'set-datasync',
        label: 'Data Sync',
        children: [
          { id: 'set-ds-config', label: 'Offline Mode, Cloud Sync, Sync Status', route: 'settings-sync' }
        ]
      },
      {
        id: 'set-notifications',
        label: 'Notification Settings',
        children: [
          { id: 'set-nt-config', label: 'Low Stock, Expiry, Backup Alerts', route: 'settings-notifications' }
        ]
      },
      {
        id: 'set-security',
        label: 'Security Settings',
        children: [
          { id: 'set-sec-config', label: 'Password Policy, Auto Lock, Audit Logging', route: 'settings-security' }
        ]
      },
      {
        id: 'set-integrations',
        label: 'Integrations',
        children: [
          { id: 'set-int-config', label: 'Accounting, Payment Gateway, E-commerce', route: 'settings-integrations' }
        ]
      },
      {
        id: 'set-subscription',
        label: 'Subscription & License',
        children: [
          { id: 'set-sub-config', label: 'Plan, License, Renewal, Device Activation', route: 'settings-subscription' }
        ]
      }
    ]
  },

  // ─── 9. HELP ─────────────────────────────────────────────────────────────
  {
    id: 'help',
    label: 'Help',
    mnemonic: 'H',
    items: [
      {
        id: 'hlp-center',
        label: 'Help Center',
        children: [
          { id: 'hlp-guide', label: 'User Guide', shortcut: 'F1', route: 'help-user-guide' },
          { id: 'hlp-faqs', label: 'Frequently Asked Questions (FAQs)', route: 'help-faqs' }
        ]
      },
      {
        id: 'hlp-tutorials',
        label: 'Tutorials',
        children: [
          { id: 'hlp-tut-setup', label: 'Setup Guide', route: 'help-setup-guide' },
          { id: 'hlp-tut-billing', label: 'Billing Tutorials', route: 'help-billing-tutorials' }
        ]
      },
      {
        id: 'hlp-support',
        label: 'Support',
        children: [
          { id: 'hlp-sup-ticket', label: 'Create Support Ticket', route: 'help-ticket' },
          { id: 'hlp-sup-contact', label: 'Contact Support', route: 'help-contact' }
        ]
      },
      {
        id: 'hlp-diagnostics',
        label: 'Diagnostics',
        children: [
          { id: 'hlp-diag-db', label: 'Database Status (SQLite WAL)', route: 'help-diag-db' },
          { id: 'hlp-diag-printer', label: 'Printer Test Page', route: 'help-diag-printer' },
          { id: 'hlp-diag-sync', label: 'Sync Status', route: 'help-diag-sync' }
        ]
      },
      {
        id: 'hlp-updates',
        label: 'Check for Updates',
        children: [
          { id: 'hlp-up-version', label: 'Check Version', route: 'help-check-version' },
          { id: 'hlp-up-download', label: 'Download Update', route: 'help-download-update' }
        ]
      },
      {
        id: 'hlp-license',
        label: 'License Information',
        children: [
          { id: 'hlp-lic-status', label: 'License Status', route: 'help-license-status' },
          { id: 'hlp-lic-device', label: 'Device Details', route: 'help-device-details' }
        ]
      },
      { type: 'separator' },
      {
        id: 'hlp-about',
        label: 'About RetailNext',
        children: [
          { id: 'hlp-ab-version', label: 'Version & Build Info', route: 'help-about' },
          { id: 'hlp-ab-company', label: 'Company Information', route: 'help-about' }
        ]
      }
    ]
  }
];

// Helper to look up any route by ID
window.findMenuRoute = function(routeId) {
  for (const menu of window.RETAIL_MENUS) {
    for (const item of menu.items) {
      if (item.children) {
        for (const sub of item.children) {
          if (sub.route === routeId || sub.id === routeId) {
            return {
              menu: menu.label,
              parent: item.label,
              item: sub.label,
              shortcut: sub.shortcut,
              route: sub.route || sub.id
            };
          }
        }
      } else if (item.route === routeId || item.id === routeId) {
        return {
          menu: menu.label,
          parent: menu.label,
          item: item.label,
          shortcut: item.shortcut,
          route: item.route || item.id
        };
      }
    }
  }
  return null;
};

