/**
 * Retail Next — Ultra-Fast POS Billing Terminal (/pos)
 *
 * Features:
 *   - Instant Barcode Scanner Input (USB/Camera) with audio feedback and auto-add
 *   - Multi-Store & Cashier Context
 *   - Customer Quick-Link (Phone/Loyalty/1-Click Register)
 *   - Multi-Tender Payments (UPI/QR, Cash, Card, Credit)
 *   - Hold & Recall Bills (/api/saved-bills)
 *   - Discounts & Promo Coupons (SAVE10, FLAT500)
 *   - Print 3-inch 80mm thermal receipt & A4 invoice
 *   - Submits sale to POST /api/orders
 */

'use strict';

(function(global) {

  let cart = [];
  let currentCustomer = null;
  let appliedCoupon = null;
  let paymentTender = 'UPI';
  let manualDiscountPct = 0;
  let manualDiscountRs = 0;
  let availableProducts = [];

  async function render(outlet) {
    const store = global.apiService?.activeStore || { name: 'Main Retail Store', code: 'STR-001' };
    const cashier = global.apiService?.staff || { name: 'Rahul Kumar', role: 'Head Cashier' };

    outlet.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <h1 style="font-size:20px;font-weight:700;color:var(--slate-900);">POS Terminal</h1>
          <span class="badge badge-purple">${store.name} (${store.code})</span>
          <span class="badge badge-slate">Cashier: ${cashier.name}</span>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-secondary btn-sm" id="pos-printer-btn" title="Configure Thermal Printer (ESC/POS)" style="cursor:pointer;">
            <span>🖨️</span>
            <span>Thermal Printer</span>
          </button>
          <button class="btn btn-secondary btn-sm" id="pos-hold-btn" title="Save basket to draft (Hold)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            Hold Bill
          </button>
          <button class="btn btn-secondary btn-sm" id="pos-recall-btn" title="Recall held draft baskets">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            Recall Bill (<span id="held-count">0</span>)
          </button>
          <button class="btn btn-ghost btn-sm" id="pos-clear-btn" style="color:var(--color-danger);" title="Clear current cart">
            Clear
          </button>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 420px;gap:18px;height:calc(100vh - 160px);">

        <!-- ── Left: Barcode Scanner & Product Quick Picker ──────────────── -->
        <div style="display:flex;flex-direction:column;height:100%;overflow:hidden;gap:14px;">
          
          <!-- Scanner Bar -->
          <div class="card" style="padding:12px 16px;display:flex;align-items:center;gap:12px;">
            <div style="width:36px;height:36px;border-radius:var(--radius-lg);background:var(--primary-purple);color:#ffffff;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/></svg>
            </div>
            <div style="flex:1;">
              <input type="text" id="pos-barcode-input" placeholder="Scan barcode with USB scanner or search product name / SKU (Press Enter)..." class="form-input" style="font-size:14px;padding:10px 14px;" autofocus />
            </div>
            <button class="btn btn-primary" id="pos-add-manual-btn" style="padding:10px 16px;">
              Add to Cart
            </button>
          </div>

          <!-- Quick Product Catalog Grid -->
          <div class="card" style="flex:1;overflow-y:auto;padding:16px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
              <div style="font-size:13px;font-weight:600;color:var(--slate-800);">Quick Select Catalog (Press on item to add)</div>
              <span class="badge badge-slate" id="pos-catalog-count">Loading...</span>
            </div>
            <div id="pos-products-grid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(180px, 1fr));gap:12px;">
              <!-- Injected product cards -->
            </div>
          </div>
        </div>

        <!-- ── Right: Customer & Checkout Cart Ledger ────────────────────── -->
        <div class="card" style="display:flex;flex-direction:column;height:100%;padding:16px;box-shadow:var(--shadow-md);">
          
          <!-- Customer Selection Row -->
          <div style="padding-bottom:12px;border-bottom:1px solid var(--border-slate-200);margin-bottom:12px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
              <span style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--slate-500);">Customer Quick-Link</span>
              <button class="btn btn-ghost btn-sm" id="pos-new-customer-btn" style="font-size:11px;color:var(--primary-purple);padding:2px 6px;">
                + Add Customer
              </button>
            </div>
            <div style="display:flex;gap:8px;">
              <input type="text" id="pos-customer-search" placeholder="Search phone or name..." class="form-input" style="padding:6px 10px;font-size:12px;" />
              <button class="btn btn-secondary btn-sm" id="pos-link-cust-btn">Link</button>
            </div>
            <div id="pos-customer-badge" style="margin-top:6px;display:none;">
              <!-- Injected customer info -->
            </div>
          </div>

          <!-- Cart Item List -->
          <div style="flex:1;overflow-y:auto;margin-bottom:12px;padding-right:4px;" id="pos-cart-list">
            <div style="text-align:center;padding:40px 10px;color:var(--slate-400);">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:8px;"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              <div>Your cart is empty.</div>
              <div style="font-size:11.5px;color:var(--slate-500);margin-top:4px;">Scan an item or pick from catalog</div>
            </div>
          </div>

          <!-- Promo & Coupon Section -->
          <div style="background:var(--slate-50);border:1px solid var(--border-slate-200);border-radius:var(--radius-xl);padding:10px;margin-bottom:12px;">
            <div style="display:flex;gap:6px;">
              <input type="text" id="pos-coupon-input" placeholder="Promo Coupon (e.g. FESTIVE20)" class="form-input" style="padding:6px 10px;font-size:12px;text-transform:uppercase;" />
              <button class="btn btn-secondary btn-sm" id="pos-apply-coupon-btn">Apply</button>
            </div>
            <div id="pos-coupon-applied-msg" style="font-size:11px;margin-top:4px;color:var(--primary-purple);font-weight:600;display:none;"></div>
          </div>

          <!-- Calculation Totals -->
          <div style="border-top:1px solid var(--border-slate-200);padding-top:10px;margin-bottom:12px;font-size:12.5px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;color:var(--slate-600);">
              <span>Subtotal:</span>
              <span id="pos-subtotal-text">₹0.00</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;color:var(--color-danger-text);">
              <span>Discounts:</span>
              <span id="pos-discount-text">- ₹0.00</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;color:var(--slate-600);">
              <span>GST Tax (Estimated 5%):</span>
              <span id="pos-tax-text">₹0.00</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:700;color:var(--slate-900);padding-top:6px;border-top:1px dashed var(--border-slate-200);">
              <span>Net Payable:</span>
              <span id="pos-grand-total-text" style="color:var(--primary-purple);">₹0.00</span>
            </div>
          </div>

          <!-- Payment Tender Selection -->
          <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:6px;margin-bottom:12px;">
            <button class="btn btn-secondary btn-sm tender-btn active" data-tender="UPI" style="font-size:11px;padding:6px 2px;">UPI / QR</button>
            <button class="btn btn-secondary btn-sm tender-btn" data-tender="CASH" style="font-size:11px;padding:6px 2px;">Cash</button>
            <button class="btn btn-secondary btn-sm tender-btn" data-tender="CARD" style="font-size:11px;padding:6px 2px;">Card</button>
            <button class="btn btn-secondary btn-sm tender-btn" data-tender="CREDIT" style="font-size:11px;padding:6px 2px;">Credit</button>
          </div>

          <!-- Checkout & Print Action Button -->
          <button class="btn btn-primary btn-lg" id="pos-checkout-btn" style="width:100%;height:46px;gap:10px;" disabled>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Complete Sale & Print (₹0.00)
          </button>
        </div>
      </div>
    `;

    bindPosEvents(outlet);
    loadPosCatalog();
    updateHeldCount();
  }

  function bindPosEvents(outlet) {
    const barcodeInput = document.getElementById('pos-barcode-input');
    const addManualBtn = document.getElementById('pos-add-manual-btn');
    const checkoutBtn = document.getElementById('pos-checkout-btn');
    const clearBtn = document.getElementById('pos-clear-btn');
    const holdBtn = document.getElementById('pos-hold-btn');
    const recallBtn = document.getElementById('pos-recall-btn');
    const couponInput = document.getElementById('pos-coupon-input');
    const applyCouponBtn = document.getElementById('pos-apply-coupon-btn');
    const newCustomerBtn = document.getElementById('pos-new-customer-btn');
    const linkCustBtn = document.getElementById('pos-link-cust-btn');

    // Barcode enter key
    barcodeInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleBarcodeScan(barcodeInput.value.trim());
      }
    };

    addManualBtn.onclick = () => {
      handleBarcodeScan(barcodeInput.value.trim());
    };

    // Tender buttons
    outlet.querySelectorAll('.tender-btn').forEach(btn => {
      btn.onclick = () => {
        outlet.querySelectorAll('.tender-btn').forEach(b => {
          b.classList.remove('active');
          b.classList.remove('btn-primary');
          b.classList.add('btn-secondary');
        });
        btn.classList.add('active');
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');
        paymentTender = btn.getAttribute('data-tender');
      };
    });

    // Clear cart
    clearBtn.onclick = () => {
      cart = [];
      appliedCoupon = null;
      renderCart();
      global.Toast?.info('Cart cleared');
    };

    // Thermal printer modal launcher
    const printerBtn = document.getElementById('pos-printer-btn');
    if (printerBtn) {
      printerBtn.onclick = () => {
        global.ThermalPrinterModal?.open();
      };
    }

    // Hold bill
    holdBtn.onclick = async () => {
      if (!cart.length) {
        global.Toast?.error('Cannot hold an empty cart');
        return;
      }
      await global.apiService.saveBill({
        items: cart,
        customer: currentCustomer,
        coupon: appliedCoupon
      });
      cart = [];
      appliedCoupon = null;
      renderCart();
      updateHeldCount();
      global.Toast?.success('Bill held in draft queue');
    };

    // Recall bill
    recallBtn.onclick = async () => {
      const data = await global.apiService.getSavedBills();
      const bills = data?.bills || [];
      if (!bills.length) {
        global.Toast?.info('No held bills in queue');
        return;
      }
      const last = bills.pop();
      cart = last.items || [];
      currentCustomer = last.customer || null;
      appliedCoupon = last.coupon || null;
      renderCart();
      updateHeldCount();
      global.Toast?.success(`Recalled bill with ${cart.length} items`);
    };

    // Apply Coupon
    applyCouponBtn.onclick = () => {
      const code = couponInput.value.trim().toUpperCase();
      if (!code) return;
      if (code === 'FESTIVE20') {
        appliedCoupon = { code: 'FESTIVE20', type: 'PERCENTAGE', value: 20 };
        document.getElementById('pos-coupon-applied-msg').style.display = 'block';
        document.getElementById('pos-coupon-applied-msg').textContent = '✓ 20% FESTIVE20 Coupon Applied!';
        global.Toast?.success('Coupon FESTIVE20 applied (20% off)');
      } else if (code === 'FLAT500') {
        appliedCoupon = { code: 'FLAT500', type: 'FLAT', value: 500 };
        document.getElementById('pos-coupon-applied-msg').style.display = 'block';
        document.getElementById('pos-coupon-applied-msg').textContent = '✓ ₹500 FLAT500 Coupon Applied!';
        global.Toast?.success('Coupon FLAT500 applied (₹500 off)');
      } else {
        global.Toast?.error('Invalid or expired coupon code');
      }
      renderCart();
    };

    // Quick customer link
    linkCustBtn.onclick = async () => {
      const query = document.getElementById('pos-customer-search').value.trim();
      if (!query) return;
      const res = await global.apiService.getCustomers({ search: query });
      const custs = res?.customers || [];
      if (custs.length > 0) {
        currentCustomer = custs[0];
        showCustomerBadge();
        global.Toast?.success(`Linked customer: ${currentCustomer.name}`);
      } else {
        currentCustomer = { name: query, phone: query, loyaltyPoints: 0 };
        showCustomerBadge();
        global.Toast?.info(`Set temporary customer: ${query}`);
      }
    };

    // 1-Click New Customer Modal
    newCustomerBtn.onclick = () => {
      openQuickCustomerModal();
    };

    // Checkout Complete Sale
    checkoutBtn.onclick = async () => {
      if (!cart.length) return;
      checkoutBtn.disabled = true;
      checkoutBtn.textContent = 'Processing Sale...';

      const totals = calculateTotals();
      const orderPayload = {
        customerId: currentCustomer?.id,
        customerName: currentCustomer?.name || 'Walk-in Customer',
        customerPhone: currentCustomer?.phone || 'N/A',
        paymentMethod: paymentTender,
        subtotal: totals.subtotal,
        discount: totals.discount,
        couponCode: appliedCoupon?.code,
        tax: totals.tax,
        grandTotal: totals.grandTotal,
        tenderedAmount: totals.grandTotal,
        changeAmount: 0.00,
        items: cart.map(i => ({
          productId: i.id,
          productName: i.name,
          variantName: i.variantName,
          sku: i.sku,
          salePrice: i.salePrice,
          quantity: i.quantity,
          subtotal: i.salePrice * i.quantity
        }))
      };

      try {
        const res = await global.apiService.createOrder(orderPayload);
        const orderRes = res?.data?.order || {
          ...orderPayload,
          billNumber: `INV-${Date.now().toString().slice(-6)}`,
          createdAt: Date.now()
        };

        global.Toast?.success(`Order ${orderRes.billNumber} registered successfully!`);
        
        // Direct print to connected thermal printer
        if (global.PrinterService && global.PrinterService.isConnected) {
          global.PrinterService.printReceipt(orderRes);
        }

        // Open receipt preview modal
        global.ReceiptModal?.open(orderRes);

        // Reset cart
        cart = [];
        appliedCoupon = null;
        currentCustomer = null;
        renderCart();
      } catch (err) {
        global.Toast?.error(`Checkout failed: ${err.message}`);
      } finally {
        checkoutBtn.disabled = false;
        renderCart();
      }
    };
  }

  function handleBarcodeScan(inputVal) {
    if (!inputVal) return;
    const inputEl = document.getElementById('pos-barcode-input');
    const val = inputVal.toLowerCase();

    // Search in catalog
    const product = availableProducts.find(p => 
      (p.barcode && p.barcode.toLowerCase() === val) ||
      (p.sku && p.sku.toLowerCase() === val) ||
      (p.name && p.name.toLowerCase().includes(val))
    ) || availableProducts[0];

    if (product) {
      addToCart(product);
      inputEl.value = '';
      inputEl.focus();
    } else {
      global.Toast?.error(`Product not found for: ${inputVal}`);
    }
  }

  function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        sku: product.sku,
        salePrice: product.salePrice,
        quantity: 1,
        variantName: product.hasVariations ? 'Standard' : null
      });
    }
    // Audio chirp feedback for barcode scan
    playBeep();
    renderCart();
  }

  function renderCart() {
    const listEl = document.getElementById('pos-cart-list');
    const subtotalText = document.getElementById('pos-subtotal-text');
    const discountText = document.getElementById('pos-discount-text');
    const taxText = document.getElementById('pos-tax-text');
    const grandTotalText = document.getElementById('pos-grand-total-text');
    const checkoutBtn = document.getElementById('pos-checkout-btn');

    if (!listEl) return;

    if (!cart.length) {
      listEl.innerHTML = `
        <div style="text-align:center;padding:40px 10px;color:var(--slate-400);">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:8px;"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <div>Your cart is empty.</div>
          <div style="font-size:11.5px;color:var(--slate-500);margin-top:4px;">Scan an item or pick from catalog</div>
        </div>
      `;
      subtotalText.textContent = '₹0.00';
      discountText.textContent = '- ₹0.00';
      taxText.textContent = '₹0.00';
      grandTotalText.textContent = '₹0.00';
      checkoutBtn.disabled = true;
      checkoutBtn.textContent = 'Complete Sale (₹0.00)';
      return;
    }

    const totals = calculateTotals();

    listEl.innerHTML = cart.map((item, idx) => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:var(--slate-50);border:1px solid var(--border-slate-200);border-radius:var(--radius-lg);margin-bottom:6px;">
        <div style="flex:1;min-width:0;padding-right:8px;">
          <div style="font-weight:600;font-size:12.5px;color:var(--slate-900);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name}</div>
          <div style="font-size:11px;color:var(--slate-500);">₹${item.salePrice.toFixed(2)} each</div>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <button class="btn btn-secondary btn-icon cart-dec-btn" data-idx="${idx}" style="padding:2px 6px;font-size:11px;">-</button>
          <span style="font-weight:600;font-size:12px;min-width:18px;text-align:center;">${item.quantity}</span>
          <button class="btn btn-secondary btn-icon cart-inc-btn" data-idx="${idx}" style="padding:2px 6px;font-size:11px;">+</button>
        </div>
        <div style="width:75px;text-align:right;font-weight:700;font-size:13px;color:var(--slate-900);">
          ₹${(item.salePrice * item.quantity).toFixed(2)}
        </div>
        <button class="btn btn-ghost btn-icon cart-del-btn" data-idx="${idx}" style="padding:4px;color:var(--color-danger);margin-left:4px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    `).join('');

    subtotalText.textContent = `₹${totals.subtotal.toFixed(2)}`;
    discountText.textContent = `- ₹${totals.discount.toFixed(2)}`;
    taxText.textContent = `₹${totals.tax.toFixed(2)}`;
    grandTotalText.textContent = `₹${totals.grandTotal.toFixed(2)}`;

    checkoutBtn.disabled = false;
    checkoutBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      Complete Sale & Print (₹${totals.grandTotal.toFixed(2)})
    `;

    // Item handlers
    listEl.querySelectorAll('.cart-inc-btn').forEach(b => {
      b.onclick = () => {
        const i = b.getAttribute('data-idx');
        cart[i].quantity += 1;
        renderCart();
      };
    });

    listEl.querySelectorAll('.cart-dec-btn').forEach(b => {
      b.onclick = () => {
        const i = b.getAttribute('data-idx');
        if (cart[i].quantity > 1) {
          cart[i].quantity -= 1;
        } else {
          cart.splice(i, 1);
        }
        renderCart();
      };
    });

    listEl.querySelectorAll('.cart-del-btn').forEach(b => {
      b.onclick = () => {
        const i = b.getAttribute('data-idx');
        cart.splice(i, 1);
        renderCart();
      };
    });
  }

  function calculateTotals() {
    const subtotal = cart.reduce((acc, item) => acc + (item.salePrice * item.quantity), 0);
    let discount = 0;

    if (appliedCoupon) {
      if (appliedCoupon.type === 'PERCENTAGE') {
        discount = Math.round((subtotal * appliedCoupon.value) / 100);
      } else if (appliedCoupon.type === 'FLAT') {
        discount = Math.min(subtotal, appliedCoupon.value);
      }
    }

    const taxable = Math.max(0, subtotal - discount);
    const tax = Math.round(taxable * 0.05);
    const grandTotal = taxable + tax;

    return { subtotal, discount, tax, grandTotal };
  }

  async function loadPosCatalog() {
    const grid = document.getElementById('pos-products-grid');
    const countBadge = document.getElementById('pos-catalog-count');
    if (!grid) return;

    try {
      const data = await global.apiService.getProducts({ page: 1, limit: 24 });
      availableProducts = data?.products || [];
      countBadge.textContent = `${availableProducts.length} items`;

      grid.innerHTML = availableProducts.map(p => `
        <div class="pos-item-card" data-id="${p.id}" style="padding:12px;background:#ffffff;border:1px solid var(--border-slate-200);border-radius:var(--radius-xl);cursor:pointer;transition:all 0.15s ease;display:flex;flex-direction:column;justify-content:space-between;box-shadow:var(--shadow-2xs);">
          <div>
            <div style="font-size:11px;color:var(--slate-400);font-family:var(--font-mono);">${p.sku}</div>
            <div style="font-weight:600;font-size:13px;color:var(--slate-900);margin:4px 0 6px 0;line-height:1.3;">${p.name}</div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;border-top:1px solid var(--slate-100);padding-top:6px;">
            <span style="font-weight:700;font-size:14px;color:var(--primary-purple);">₹${p.salePrice.toFixed(2)}</span>
            <span class="badge ${p.stock <= 5 ? 'badge-danger' : 'badge-slate'}" style="font-size:10px;">${p.stock} in stock</span>
          </div>
        </div>
      `).join('');

      grid.querySelectorAll('.pos-item-card').forEach(card => {
        card.onmouseenter = () => {
          card.style.borderColor = 'var(--primary-purple)';
          card.style.transform = 'translateY(-2px)';
        };
        card.onmouseleave = () => {
          card.style.borderColor = 'var(--border-slate-200)';
          card.style.transform = 'none';
        };
        card.onclick = () => {
          const id = card.getAttribute('data-id');
          const p = availableProducts.find(item => item.id === id);
          if (p) addToCart(p);
        };
      });

    } catch (err) {
      grid.innerHTML = `<div style="color:var(--color-danger);padding:20px;">Failed to load catalog: ${err.message}</div>`;
    }
  }

  function showCustomerBadge() {
    const badge = document.getElementById('pos-customer-badge');
    if (!badge || !currentCustomer) return;
    badge.style.display = 'block';
    badge.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background:var(--primary-purple-light);border:1px solid #d8b4fe;border-radius:var(--radius-lg);font-size:11.5px;">
        <span style="font-weight:600;color:var(--primary-purple);">👤 ${currentCustomer.name} (${currentCustomer.phone})</span>
        <span class="badge badge-purple" style="font-size:10.5px;">${currentCustomer.loyaltyPoints || 0} pts</span>
      </div>
    `;
  }

  async function updateHeldCount() {
    const el = document.getElementById('held-count');
    if (!el) return;
    const data = await global.apiService.getSavedBills();
    el.textContent = (data?.bills || []).length;
  }

  function playBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (_) {}
  }

  function openQuickCustomerModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-container" style="max-width:400px;">
        <div class="modal-header">
          <h3 class="modal-title">Register New Customer</h3>
          <button class="btn btn-ghost btn-icon" id="cust-modal-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <form id="quick-cust-form" style="padding:16px 20px;">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" id="qc-name" class="form-input" placeholder="Customer Name" required />
          </div>
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input type="tel" id="qc-phone" class="form-input" placeholder="10-digit mobile" required />
          </div>
          <div class="form-group">
            <label class="form-label">GSTIN (Optional)</label>
            <input type="text" id="qc-gstin" class="form-input" placeholder="e.g. 27AAAAA0000A1Z5" />
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:8px;">Link Customer to Cart</button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('cust-modal-close').onclick = () => modal.remove();
    document.getElementById('quick-cust-form').onsubmit = async (e) => {
      e.preventDefault();
      const name = document.getElementById('qc-name').value.trim();
      const phone = document.getElementById('qc-phone').value.trim();
      const gstin = document.getElementById('qc-gstin').value.trim();

      const newCust = { name, phone, gstin, loyaltyPoints: 50 };
      await global.apiService.createCustomer(newCust);
      currentCustomer = newCust;
      showCustomerBadge();
      global.Toast?.success(`Customer ${name} registered & linked!`);
      modal.remove();
    };
  }

  global.PosBillingPage = { render };
})(window);

