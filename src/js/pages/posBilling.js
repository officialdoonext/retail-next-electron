/**
 * RetailNext — POS Billing / New Sales Bill Page
 * Complete retail billing interface with barcode scanning, product search,
 * discount rules, GST calculation, multi-payment modes, hold/resume, and printing.
 */

'use strict';

window.PosBillingPage = (() => {

  let cart = [];
  let heldBills = [];
  let selectedCustomer = null;
  let billDiscount = 0;
  let paymentMode = 'Cash';

  function initDefaultCart() {
    const products = window.RetailStore ? window.RetailStore.getProducts() : [];
    if (products.length >= 2 && cart.length === 0) {
      // Add first two items as an active draft
      addItemToCart(products[0], 2);
      addItemToCart(products[1], 1);
    }
  }

  function addItemToCart(product, qty = 1) {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({
        product,
        qty,
        unitPrice: product.sellingPrice,
        discountPct: 0,
        gstRate: product.gstRate || 0
      });
    }
  }

  function renderPage(outlet) {
    if (!outlet) return;
    outlet.innerHTML = '';
    outlet.className = 'pos-container';

    initDefaultCart();

    const store = window.RetailStore;
    const products = store ? store.getProducts() : [];
    const customers = store ? store.getCustomers() : [];

    if (!selectedCustomer && customers.length > 0) {
      selectedCustomer = customers[0];
    }

    const html = `
      <div class="pos-layout">

        <!-- Left/Main Area: Search & Billing Items Grid -->
        <div class="pos-main">

          <!-- Top Billing Bar -->
          <div class="pos-topbar">
            <div class="pos-barcode-search">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 5v14M8 5v14M12 5v14M17 5v14M21 5v14"/>
              </svg>
              <input 
                type="text" 
                id="pos-item-input" 
                class="pos-input" 
                placeholder="Scan Barcode or Search Item by Name / SKU / Code [Press Enter to Add]..." 
                autocomplete="off"
              />
              <div id="pos-item-dropdown" class="pos-dropdown" style="display:none;"></div>
            </div>

            <div class="pos-quick-add">
              <select id="pos-quick-select" class="pos-select">
                <option value="">-- Quick Pick Popular Item --</option>
                ${products.map(p => `
                  <option value="${p.id}">${p.name} (₹${p.sellingPrice} / ${p.uom})</option>
                `).join('')}
              </select>
            </div>
          </div>

          <!-- Items Table -->
          <div class="pos-table-card">
            <div class="pos-table-header">
              <span class="pos-table-title">Current Bill Items (${cart.length})</span>
              <div class="pos-table-actions">
                <button class="btn btn--xs btn--outline" id="pos-btn-hold">Hold Bill (${heldBills.length})</button>
                <button class="btn btn--xs btn--outline" id="pos-btn-resume" ${heldBills.length === 0 ? 'disabled' : ''}>Resume Bill</button>
                <button class="btn btn--xs btn--danger" id="pos-btn-clear">Clear (Esc)</button>
              </div>
            </div>

            <div class="pos-table-wrap">
              <table class="erp-table pos-table" id="pos-items-table">
                <thead>
                  <tr>
                    <th style="width:40px;">#</th>
                    <th>Product / Description</th>
                    <th>Barcode / SKU</th>
                    <th style="width:80px;text-align:center;">UOM</th>
                    <th style="width:120px;text-align:center;">Qty</th>
                    <th style="width:100px;text-align:right;">Price (₹)</th>
                    <th style="width:80px;text-align:center;">Disc %</th>
                    <th style="width:70px;text-align:center;">GST %</th>
                    <th style="width:110px;text-align:right;">Total (₹)</th>
                    <th style="width:40px;text-align:center;"></th>
                  </tr>
                </thead>
                <tbody id="pos-items-tbody">
                  <!-- Injected via renderItems() -->
                </tbody>
              </table>
            </div>
          </div>

          <!-- Shortcuts Hint Strip -->
          <div class="pos-shortcuts-strip">
            <span><strong>F2:</strong> New Bill</span>
            <span><strong>F3:</strong> Product Search</span>
            <span><strong>F4:</strong> Payment</span>
            <span><strong>F10:</strong> Save Bill</span>
            <span><strong>F12:</strong> Print Invoice</span>
            <span><strong>Esc:</strong> Clear</span>
          </div>

        </div>

        <!-- Right Sidebar: Customer, Calculation & Payment -->
        <div class="pos-sidebar">

          <!-- Customer Selector Box -->
          <div class="pos-box customer-box">
            <div class="pos-box__header">
              <span class="pos-box__title">Customer Details</span>
              <button class="btn-link" id="pos-add-cust-btn">+ Add New</button>
            </div>
            <select id="pos-cust-select" class="pos-select" style="margin-bottom:8px;">
              ${customers.map(c => `
                <option value="${c.id}" ${selectedCustomer && selectedCustomer.id === c.id ? 'selected' : ''}>
                  ${c.name} (${c.mobile})
                </option>
              `).join('')}
            </select>
            <div class="cust-info-strip" id="pos-cust-info">
              <div>Mobile: <span class="font-mono">${selectedCustomer ? selectedCustomer.mobile : '—'}</span></div>
              <div>Dues: <strong style="color:var(--color-error)">₹${selectedCustomer ? selectedCustomer.outstanding.toFixed(2) : '0.00'}</strong></div>
              <div>Points: <strong style="color:var(--color-brand)">${selectedCustomer ? selectedCustomer.loyaltyPoints : '0'}</strong></div>
            </div>
          </div>

          <!-- Bill Summary Calculation -->
          <div class="pos-box summary-box">
            <div class="pos-box__header">
              <span class="pos-box__title">Bill Summary</span>
              <span class="font-mono text-secondary" id="pos-invoice-badge">INV-AUTO</span>
            </div>

            <div class="calc-row">
              <span>Items / Qty:</span>
              <strong id="calc-items-count">0 items / 0 qty</strong>
            </div>

            <div class="calc-row">
              <span>Subtotal:</span>
              <span class="font-mono" id="calc-subtotal">₹0.00</span>
            </div>

            <div class="calc-row">
              <span>Item Discounts:</span>
              <span class="font-mono text-success" id="calc-item-discount">-₹0.00</span>
            </div>

            <div class="calc-row">
              <span>Bill Discount (₹):</span>
              <input type="number" id="pos-bill-disc-input" value="0" min="0" class="pos-inline-input" style="width:70px;text-align:right;" />
            </div>

            <div class="calc-row">
              <span>CGST + SGST (Tax):</span>
              <span class="font-mono" id="calc-gst">₹0.00</span>
            </div>

            <div class="calc-row">
              <span>Round Off:</span>
              <span class="font-mono" id="calc-round">₹0.00</span>
            </div>

            <div class="calc-grand-total">
              <span class="grand-label">Grand Total</span>
              <span class="grand-val" id="calc-grand-total">₹0.00</span>
            </div>
          </div>

          <!-- Payment Mode Selection -->
          <div class="pos-box payment-box">
            <div class="pos-box__header">
              <span class="pos-box__title">Payment Method</span>
            </div>

            <div class="pay-methods-grid">
              <button class="pay-btn active" data-mode="Cash">Cash</button>
              <button class="pay-btn" data-mode="UPI">UPI / QR</button>
              <button class="pay-btn" data-mode="Card">Card</button>
              <button class="pay-btn" data-mode="Credit">Store Credit</button>
            </div>

            <div class="pay-tendered-wrap" id="pay-cash-tender-wrap">
              <div class="calc-row" style="margin-top:8px;">
                <span>Cash Received:</span>
                <input type="number" id="pos-cash-received" placeholder="0.00" class="pos-inline-input font-mono" style="width:90px;text-align:right;" />
              </div>
              <div class="calc-row" style="margin-top:4px;">
                <span>Change Return:</span>
                <strong class="font-mono text-brand" id="pos-change-return">₹0.00</strong>
              </div>
            </div>

            <!-- Complete Bill Button -->
            <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px;">
              <button class="btn btn--primary btn--lg" id="pos-btn-save-print" style="width:100%;font-size:15px;">
                Save & Print Bill (F12)
              </button>
              <button class="btn btn--outline" id="pos-btn-save-only" style="width:100%;">
                Save Transaction (F10)
              </button>
            </div>
          </div>

        </div>

      </div>

      <!-- Thermal / A4 Print Receipt Modal -->
      <div id="receipt-modal" class="retail-modal">
        <div class="retail-modal__backdrop"></div>
        <div class="retail-modal__dialog" style="max-width:440px;">
          <div class="retail-modal__header">
            <strong>Invoice Generated Successfully</strong>
            <button class="retail-modal__close" id="receipt-close-btn">&times;</button>
          </div>
          <div class="retail-modal__body" id="receipt-body" style="padding:16px;"></div>
          <div class="retail-modal__footer">
            <button class="btn btn--outline" id="receipt-thermal-btn">Thermal (80mm)</button>
            <button class="btn btn--primary" id="receipt-a4-btn">A4 Print</button>
          </div>
        </div>
      </div>
    `;

    outlet.innerHTML = html;

    // Attach listeners
    setupEvents(outlet);
    renderItems(outlet);
  }

  function setupEvents(outlet) {
    const input = outlet.querySelector('#pos-item-input');
    const dropdown = outlet.querySelector('#pos-item-dropdown');
    const quickSelect = outlet.querySelector('#pos-quick-select');
    const custSelect = outlet.querySelector('#pos-cust-select');
    const discInput = outlet.querySelector('#pos-bill-disc-input');
    const cashInput = outlet.querySelector('#pos-cash-received');
    const savePrintBtn = outlet.querySelector('#pos-btn-save-print');
    const saveOnlyBtn = outlet.querySelector('#pos-btn-save-only');
    const clearBtn = outlet.querySelector('#pos-btn-clear');
    const holdBtn = outlet.querySelector('#pos-btn-hold');
    const resumeBtn = outlet.querySelector('#pos-btn-resume');

    // Autocomplete on search input
    if (input) {
      input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        if (!q) {
          dropdown.style.display = 'none';
          return;
        }

        const store = window.RetailStore;
        const prods = store ? store.getProducts() : [];
        const matches = prods.filter(p => 
          p.name.toLowerCase().includes(q) ||
          p.barcode.includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
        );

        if (matches.length === 0) {
          dropdown.innerHTML = `<div class="p-2 text-secondary" style="padding:8px;">No matching items found.</div>`;
          dropdown.style.display = 'block';
          return;
        }

        dropdown.innerHTML = matches.map(p => `
          <div class="pos-dropdown-item" data-id="${p.id}">
            <div>
              <strong>${p.name}</strong>
              <div style="font-size:11px;color:var(--color-text-tertiary)">Barcode: ${p.barcode} · Stock: ${p.currentStock} ${p.uom}</div>
            </div>
            <div style="text-align:right;">
              <strong>₹${p.sellingPrice.toFixed(2)}</strong>
              <div style="font-size:11px;color:var(--color-success)">GST ${p.gstRate}%</div>
            </div>
          </div>
        `).join('');

        dropdown.querySelectorAll('.pos-dropdown-item').forEach(el => {
          el.addEventListener('click', () => {
            const id = el.getAttribute('data-id');
            const found = prods.find(p => p.id === id);
            if (found) {
              addItemToCart(found, 1);
              renderItems(outlet);
            }
            input.value = '';
            dropdown.style.display = 'none';
            input.focus();
          });
        });

        dropdown.style.display = 'block';
      });

      // Press Enter to add exact barcode match
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const q = input.value.trim().toLowerCase();
          const store = window.RetailStore;
          const prods = store ? store.getProducts() : [];
          const match = prods.find(p => p.barcode === q || p.code.toLowerCase() === q);
          if (match) {
            addItemToCart(match, 1);
            renderItems(outlet);
            input.value = '';
            dropdown.style.display = 'none';
          }
        }
      });
    }

    if (quickSelect) {
      quickSelect.addEventListener('change', () => {
        const id = quickSelect.value;
        if (id) {
          const store = window.RetailStore;
          const prods = store ? store.getProducts() : [];
          const found = prods.find(p => p.id === id);
          if (found) {
            addItemToCart(found, 1);
            renderItems(outlet);
          }
          quickSelect.value = '';
        }
      });
    }

    if (custSelect) {
      custSelect.addEventListener('change', () => {
        const store = window.RetailStore;
        const custs = store ? store.getCustomers() : [];
        selectedCustomer = custs.find(c => c.id === custSelect.value) || null;
        updateCustomerStrip(outlet);
      });
    }

    if (discInput) {
      discInput.addEventListener('input', () => {
        billDiscount = Math.max(0, Number(discInput.value) || 0);
        calculateTotals(outlet);
      });
    }

    // Payment Mode buttons
    outlet.querySelectorAll('.pay-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        outlet.querySelectorAll('.pay-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        paymentMode = btn.getAttribute('data-mode');
        const tenderWrap = outlet.querySelector('#pay-cash-tender-wrap');
        if (tenderWrap) {
          tenderWrap.style.display = paymentMode === 'Cash' ? 'block' : 'none';
        }
      });
    });

    if (cashInput) {
      cashInput.addEventListener('input', () => {
        const grandTotal = getGrandTotal();
        const tendered = Number(cashInput.value) || 0;
        const changeEl = outlet.querySelector('#pos-change-return');
        if (changeEl) {
          const change = Math.max(0, tendered - grandTotal);
          changeEl.textContent = '₹' + change.toFixed(2);
        }
      });
    }

    if (savePrintBtn) {
      savePrintBtn.addEventListener('click', () => finalizeBill(outlet, true));
    }

    if (saveOnlyBtn) {
      saveOnlyBtn.addEventListener('click', () => finalizeBill(outlet, false));
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        cart = [];
        renderItems(outlet);
      });
    }

    if (holdBtn) {
      holdBtn.addEventListener('click', () => {
        if (cart.length === 0) return;
        heldBills.push({
          cart: [...cart],
          customer: selectedCustomer,
          time: new Date().toLocaleTimeString()
        });
        cart = [];
        renderItems(outlet);
        alert('Current bill held successfully in memory queue.');
      });
    }

    if (resumeBtn) {
      resumeBtn.addEventListener('click', () => {
        if (heldBills.length === 0) return;
        const last = heldBills.pop();
        cart = last.cart;
        selectedCustomer = last.customer;
        renderItems(outlet);
        updateCustomerStrip(outlet);
      });
    }
  }

  function renderItems(outlet) {
    const tbody = outlet.querySelector('#pos-items-tbody');
    if (!tbody) return;

    if (cart.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" class="table-empty">
            <div class="table-empty__text">Bill is currently empty</div>
            <div class="table-empty__sub">Scan a barcode or search products above to start billing.</div>
          </td>
        </tr>
      `;
      calculateTotals(outlet);
      return;
    }

    tbody.innerHTML = cart.map((item, idx) => {
      const p = item.product;
      const subtotal = item.qty * item.unitPrice;
      const discAmt = (subtotal * item.discountPct) / 100;
      const taxable = subtotal - discAmt;
      const gstAmt = (taxable * item.gstRate) / 100;
      const lineTotal = taxable + gstAmt;

      return `
        <tr data-idx="${idx}">
          <td class="font-mono text-secondary">${idx + 1}</td>
          <td>
            <strong>${p.name}</strong>
            <div style="font-size:11px;color:var(--color-text-tertiary)">${p.category}</div>
          </td>
          <td class="font-mono text-secondary">${p.barcode}</td>
          <td style="text-align:center;">${p.uom}</td>
          <td style="text-align:center;">
            <div class="qty-control">
              <button class="qty-btn" onclick="PosBillingPage.changeQty(${idx}, -1)">-</button>
              <input type="number" value="${item.qty}" min="1" class="qty-input" onchange="PosBillingPage.setQty(${idx}, this.value)" />
              <button class="qty-btn" onclick="PosBillingPage.changeQty(${idx}, 1)">+</button>
            </div>
          </td>
          <td style="text-align:right;" class="font-mono">₹${item.unitPrice.toFixed(2)}</td>
          <td style="text-align:center;">
            <input type="number" value="${item.discountPct}" min="0" max="100" class="pos-inline-input" style="width:50px;text-align:center;" onchange="PosBillingPage.setDisc(${idx}, this.value)" />
          </td>
          <td style="text-align:center;" class="font-mono">${item.gstRate}%</td>
          <td style="text-align:right;" class="font-mono font-bold">₹${lineTotal.toFixed(2)}</td>
          <td style="text-align:center;">
            <button class="delete-btn" title="Remove Item" onclick="PosBillingPage.removeItem(${idx})">&times;</button>
          </td>
        </tr>
      `;
    }).join('');

    calculateTotals(outlet);
  }

  function calculateTotals(outlet) {
    let subtotal = 0;
    let totalItemDisc = 0;
    let totalGst = 0;
    let totalQty = 0;

    cart.forEach(item => {
      const lineSub = item.qty * item.unitPrice;
      const disc = (lineSub * item.discountPct) / 100;
      const taxable = lineSub - disc;
      const gst = (taxable * item.gstRate) / 100;

      subtotal += lineSub;
      totalItemDisc += disc;
      totalGst += gst;
      totalQty += item.qty;
    });

    const netBeforeBillDisc = subtotal - totalItemDisc + totalGst;
    const finalBeforeRound = Math.max(0, netBeforeBillDisc - billDiscount);
    const rounded = Math.round(finalBeforeRound);
    const roundOff = rounded - finalBeforeRound;

    const itemsCountEl = outlet.querySelector('#calc-items-count');
    const subtotalEl = outlet.querySelector('#calc-subtotal');
    const itemDiscEl = outlet.querySelector('#calc-item-discount');
    const gstEl = outlet.querySelector('#calc-gst');
    const roundEl = outlet.querySelector('#calc-round');
    const grandEl = outlet.querySelector('#calc-grand-total');

    if (itemsCountEl) itemsCountEl.textContent = `${cart.length} items / ${totalQty} units`;
    if (subtotalEl) subtotalEl.textContent = '₹' + subtotal.toFixed(2);
    if (itemDiscEl) itemDiscEl.textContent = '-₹' + totalItemDisc.toFixed(2);
    if (gstEl) gstEl.textContent = '₹' + totalGst.toFixed(2);
    if (roundEl) roundEl.textContent = (roundOff >= 0 ? '+' : '') + '₹' + roundOff.toFixed(2);
    if (grandEl) grandEl.textContent = '₹' + rounded.toFixed(2);

    window._lastGrandTotal = rounded;
  }

  function getGrandTotal() {
    return window._lastGrandTotal || 0;
  }

  function updateCustomerStrip(outlet) {
    const custInfo = outlet.querySelector('#pos-cust-info');
    if (custInfo && selectedCustomer) {
      custInfo.innerHTML = `
        <div>Mobile: <span class="font-mono">${selectedCustomer.mobile}</span></div>
        <div>Dues: <strong style="color:var(--color-error)">₹${selectedCustomer.outstanding.toFixed(2)}</strong></div>
        <div>Points: <strong style="color:var(--color-brand)">${selectedCustomer.loyaltyPoints}</strong></div>
      `;
    }
  }

  async function finalizeBill(outlet, openPrint) {
    if (cart.length === 0) {
      alert('Please add at least one item to generate a bill.');
      return;
    }

    const store = window.RetailStore;
    const grandTotal = getGrandTotal();

    const invoice = {
      id: 'INV-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000),
      invoiceNo: 'INV-2026-' + Math.floor(10000 + Math.random() * 90000),
      date: new Date().toLocaleString(),
      customerId: selectedCustomer ? selectedCustomer.id : 'WALK-IN',
      customerName: selectedCustomer ? selectedCustomer.name : 'Walk-in Customer',
      itemsCount: cart.length,
      amount: grandTotal,
      paymentMode,
      status: paymentMode === 'Credit' ? 'Due' : 'Paid',
      refNo: 'TXN-' + Math.floor(100000 + Math.random() * 900000)
    };

    if (window.SyncEngine) {
      await window.SyncEngine.saveRecord('invoices', invoice, 'INSERT');
    } else if (store) {
      store.addInvoice(invoice);
    }

    if (openPrint) {
      showReceiptModal(invoice, [...cart]);
    } else {
      alert(`Bill ${invoice.invoiceNo} saved successfully! Amount: ₹${grandTotal.toFixed(2)}`);
    }

    // Reset cart
    cart = [];
    renderItems(outlet);
  }

  function showReceiptModal(invoice, billedItems) {
    const modal = document.getElementById('receipt-modal');
    const body = document.getElementById('receipt-body');
    const closeBtn = document.getElementById('receipt-close-btn');
    if (!modal || !body) return;

    body.innerHTML = `
      <div class="thermal-receipt">
        <div style="text-align:center;border-bottom:1px dashed #cbd5e1;padding-bottom:8px;margin-bottom:8px;">
          <h3 style="font-size:16px;margin:0;">RETAILNEXT SUPERMARKET</h3>
          <div style="font-size:11px;color:#64748b;">Main Store Branch · GSTIN: 36AABCS1429B1Z2</div>
          <div style="font-size:11px;color:#64748b;">Phone: +91 98765 43210</div>
        </div>

        <div style="font-size:11px;display:flex;justify-content:space-between;margin-bottom:4px;">
          <span>Bill: <strong>${invoice.invoiceNo}</strong></span>
          <span>Date: ${invoice.date}</span>
        </div>
        <div style="font-size:11px;margin-bottom:8px;">
          Customer: <strong>${invoice.customerName}</strong>
        </div>

        <table style="width:100%;font-size:11px;border-collapse:collapse;margin-bottom:8px;">
          <thead>
            <tr style="border-bottom:1px solid #000;">
              <th style="text-align:left;padding:2px 0;">Item</th>
              <th style="text-align:center;padding:2px 0;">Qty</th>
              <th style="text-align:right;padding:2px 0;">Rate</th>
              <th style="text-align:right;padding:2px 0;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${billedItems.map(item => `
              <tr>
                <td style="padding:2px 0;">${item.product.name.slice(0, 20)}</td>
                <td style="text-align:center;padding:2px 0;">${item.qty}</td>
                <td style="text-align:right;padding:2px 0;">₹${item.unitPrice.toFixed(2)}</td>
                <td style="text-align:right;padding:2px 0;">₹${(item.qty * item.unitPrice).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="border-top:1px dashed #cbd5e1;padding-top:6px;font-size:12px;">
          <div style="display:flex;justify-content:space-between;">
            <span>Grand Total:</span>
            <strong>₹${invoice.amount.toFixed(2)}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;color:#64748b;font-size:11px;">
            <span>Payment Mode:</span>
            <span>${invoice.paymentMode}</span>
          </div>
        </div>

        <div style="text-align:center;margin-top:12px;font-size:11px;color:#64748b;">
          *** Thank you for shopping with us! ***
        </div>
      </div>
    `;

    closeBtn.onclick = () => modal.classList.remove('open');
    modal.classList.add('open');
  }

  // Public handlers for table rows
  function changeQty(idx, delta) {
    if (cart[idx]) {
      cart[idx].qty = Math.max(1, cart[idx].qty + delta);
      const outlet = document.getElementById('workspace-outlet') || document.getElementById('page-outlet');
      renderItems(outlet);
    }
  }

  function setQty(idx, val) {
    if (cart[idx]) {
      cart[idx].qty = Math.max(1, Number(val) || 1);
      const outlet = document.getElementById('workspace-outlet') || document.getElementById('page-outlet');
      renderItems(outlet);
    }
  }

  function setDisc(idx, val) {
    if (cart[idx]) {
      cart[idx].discountPct = Math.min(100, Math.max(0, Number(val) || 0));
      const outlet = document.getElementById('workspace-outlet') || document.getElementById('page-outlet');
      renderItems(outlet);
    }
  }

  function removeItem(idx) {
    cart.splice(idx, 1);
    const outlet = document.getElementById('workspace-outlet') || document.getElementById('page-outlet');
    renderItems(outlet);
  }

  return {
    renderPage,
    changeQty,
    setQty,
    setDisc,
    removeItem
  };
})();

