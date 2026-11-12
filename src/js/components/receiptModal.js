/**
 * Retail Next — Thermal Receipt (3-inch 80mm) & A4 Tax Invoice Modal
 */

'use strict';

(function(global) {
  let modalEl = null;

  function openReceipt(order) {
    if (!order) return;
    if (document.getElementById('rn-receipt-modal')) return;

    modalEl = document.createElement('div');
    modalEl.id = 'rn-receipt-modal';
    modalEl.className = 'modal-overlay';

    const store = global.apiService?.activeStore || { name: 'Main Retail Store', city: 'Mumbai', gstin: '27AAAAA0000A1Z5' };
    const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleString() : new Date().toLocaleString();
    const items = order.items || [];
    const subtotal = order.subtotal || 0;
    const discount = order.discount || 0;
    const tax = order.tax || Math.round((subtotal - discount) * 0.05);
    const grandTotal = order.grandTotal || (subtotal - discount + tax);

    modalEl.innerHTML = `
      <div class="modal-container" style="max-width:520px;">
        <div class="modal-header">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:32px;height:32px;border-radius:8px;background:var(--primary-purple);display:flex;align-items:center;justify-content:center;color:#fff;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            </div>
            <div>
              <h3 class="modal-title">Receipt & Invoice Preview</h3>
              <p style="font-size:11.5px;color:var(--slate-500);">${order.billNumber || 'INV-0000'}</p>
            </div>
          </div>
          <button class="btn btn-ghost btn-icon" id="receipt-modal-close-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="modal-body" style="background:var(--slate-100);display:flex;justify-content:center;padding:24px 16px;">
          <!-- 3-inch 80mm Thermal Receipt Slip -->
          <div class="thermal-receipt" id="printable-receipt">
            <div style="text-align:center;margin-bottom:8px;">
              <div style="font-size:16px;font-weight:700;letter-spacing:0.5px;">RETAIL NEXT</div>
              <div style="font-size:11px;font-weight:600;">${store.name}</div>
              <div style="font-size:10px;color:#555;">${store.city || 'India'} · GSTIN: ${store.gstin || '27AAAAA0000A1Z5'}</div>
              <div style="font-size:10px;color:#555;">Ph: +91 98765 43210</div>
            </div>

            <div class="thermal-receipt-divider"></div>

            <div style="display:flex;justify-content:space-between;font-size:11px;">
              <span>Bill: <strong>${order.billNumber || 'INV-001'}</strong></span>
              <span>${dateStr}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:11px;margin-top:2px;">
              <span>Cust: ${order.customerName || 'Cash Customer'}</span>
              <span>Tender: <strong>${order.paymentMethod || 'UPI'}</strong></span>
            </div>

            <div class="thermal-receipt-divider"></div>

            <table style="width:100%;font-size:11px;border-collapse:collapse;margin:4px 0;">
              <thead>
                <tr style="border-bottom:1px solid #000;text-align:left;">
                  <th style="padding:4px 0;">Item</th>
                  <th style="text-align:center;">Qty</th>
                  <th style="text-align:right;">Rate</th>
                  <th style="text-align:right;">Amt</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(item => `
                  <tr>
                    <td style="padding:4px 0;max-width:130px;word-break:break-word;">
                      ${item.productName}
                      ${item.variantName ? `<br><small style="color:#666;">(${item.variantName})</small>` : ''}
                    </td>
                    <td style="text-align:center;vertical-align:top;">${item.quantity || 1}</td>
                    <td style="text-align:right;vertical-align:top;">₹${(item.salePrice || 0).toFixed(2)}</td>
                    <td style="text-align:right;vertical-align:top;">₹${((item.salePrice || 0) * (item.quantity || 1)).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="thermal-receipt-divider"></div>

            <div style="display:flex;justify-content:space-between;font-size:11px;">
              <span>Subtotal:</span>
              <span>₹${subtotal.toFixed(2)}</span>
            </div>
            ${discount > 0 ? `
              <div style="display:flex;justify-content:space-between;font-size:11px;color:#000;">
                <span>Discount / Promo:</span>
                <span>- ₹${discount.toFixed(2)}</span>
              </div>
            ` : ''}
            <div style="display:flex;justify-content:space-between;font-size:11px;">
              <span>Taxes (CGST + SGST):</span>
              <span>₹${tax.toFixed(2)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:700;margin-top:6px;border-top:1px solid #000;padding-top:4px;">
              <span>GRAND TOTAL:</span>
              <span>₹${grandTotal.toFixed(2)}</span>
            </div>

            <div class="thermal-receipt-divider"></div>

            <div style="text-align:center;font-size:10px;margin-top:10px;color:#333;">
              <div>Thank you for shopping with us!</div>
              <div>Exchange within 7 days with bill.</div>
              <div style="margin-top:6px;font-family:monospace;letter-spacing:2px;font-size:12px;">*${order.billNumber || 'RETAILNEXT'}*</div>
            </div>
          </div>
        </div>

        <div class="modal-footer" style="display:flex;justify-content:space-between;align-items:center;">
          <button class="btn btn-ghost btn-sm" id="receipt-connect-printer-btn" style="color:#5e2b9d;font-weight:600;">
            🖨️ Thermal Printer Center
          </button>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-secondary btn-sm" id="receipt-modal-close-btn2">Close</button>
            <button class="btn btn-primary btn-sm" id="receipt-print-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              <span>${global.PrinterService?.isConnected ? `Print Thermal (${global.PrinterService.paperWidth})` : 'Print Receipt'}</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modalEl);

    document.getElementById('receipt-modal-close-btn').onclick = () => modalEl.remove();
    document.getElementById('receipt-modal-close-btn2').onclick = () => modalEl.remove();
    
    const connectPrinterBtn = document.getElementById('receipt-connect-printer-btn');
    if (connectPrinterBtn) {
      connectPrinterBtn.onclick = () => {
        global.ThermalPrinterModal?.open();
      };
    }

    document.getElementById('receipt-print-btn').onclick = async () => {
      if (global.PrinterService && global.PrinterService.isConnected) {
        await global.PrinterService.printReceipt(order);
      } else {
        window.print();
      }
    };
  }

  global.ReceiptModal = { open: openReceipt };
})(window);

