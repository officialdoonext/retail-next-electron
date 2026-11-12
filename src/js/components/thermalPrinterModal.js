/**
 * Retail Next — Thermal Printer Center Modal Dialog
 * Matches design system and functionality from retail-next-software/components/ThermalPrinterModal.tsx
 * Allows connecting USB/Bluetooth ESC/POS thermal printers, toggling 80mm/58mm rolls,
 * executing hardware test prints, and opening system print dialogs.
 */

'use strict';

(function(global) {

  let modalElement = null;
  let testPrintSuccessTimeout = null;

  function ensureModal() {
    if (modalElement) return modalElement;

    modalElement = document.createElement('div');
    modalElement.id = 'thermal-printer-modal';
    modalElement.className = 'modal-backdrop';
    modalElement.style.display = 'none';

    document.body.appendChild(modalElement);
    return modalElement;
  }

  function renderModal() {
    const el = ensureModal();
    const service = global.PrinterService;
    const state = service ? service.getState() : {
      isConnected: false,
      printerType: 'None',
      printerName: '',
      paperWidth: '80mm',
      isPrinting: false,
      lastError: null
    };

    const isConnected = state.isConnected;
    const is80 = state.paperWidth === '80mm';

    el.innerHTML = `
      <div class="modal-dialog" style="max-width: 540px; padding: 0; overflow: hidden; border-radius: 16px; border: 1px solid var(--slate-200); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); background:#ffffff;">
        
        <!-- Header -->
        <div style="background:#5e2b9d; color:#ffffff; padding: 16px 20px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #4e2284;">
          <div style="display:flex; align-items:center; gap: 12px;">
            <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; font-size:18px;">
              🖨️
            </div>
            <div>
              <div style="display:flex; align-items:center; gap: 8px;">
                <h3 style="margin:0; font-size: 15px; font-weight: 700; color:#ffffff;">Thermal Printer Center</h3>
                <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 8px; border-radius: 9999px; background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.25); color:#f3e8ff;">
                  ESC/POS
                </span>
              </div>
              <p style="margin:2px 0 0; font-size: 11px; color: #e9d5ff;">
                Connect via Web USB or Bluetooth for instant receipt printing
              </p>
            </div>
          </div>
          <button id="close-printer-modal-btn" style="background:none; border:none; color:#e9d5ff; font-size: 20px; cursor:pointer; width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center;">
            ✕
          </button>
        </div>

        <!-- Body -->
        <div style="padding: 18px 20px; max-height: 80vh; overflow-y: auto; display:flex; flex-direction:column; gap: 14px;">
          
          <!-- Active Status Banner -->
          <div style="padding: 12px 14px; border-radius: 12px; border: 1px solid ${isConnected ? '#a7f3d0' : '#e2e8f0'}; background: ${isConnected ? '#ecfdf5' : '#f8fafc'}; display:flex; align-items:center; justify-content:space-between; gap: 12px;">
            <div style="display:flex; align-items:center; gap: 12px; min-width: 0;">
              <div style="width: 36px; height: 36px; border-radius: 8px; display:flex; align-items:center; justify-content:center; font-size: 18px; shrink: 0; background: ${isConnected ? '#10b981' : '#e2e8f0'}; color: ${isConnected ? '#ffffff' : '#64748b'};">
                ${isConnected ? (state.printerType === 'Bluetooth' ? '📶' : '🔌') : '⏻'}
              </div>
              <div style="min-width: 0;">
                <div style="display:flex; align-items:center; gap: 6px;">
                  <span style="display:inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${isConnected ? '#10b981' : '#94a3b8'};"></span>
                  <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: ${isConnected ? '#065f46' : '#64748b'}; letter-spacing: 0.5px;">
                    ${isConnected ? `Online (${state.printerType})` : 'Disconnected'}
                  </span>
                </div>
                <div style="font-size: 12px; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;">
                  ${isConnected ? state.printerName : 'Choose USB or Bluetooth below to connect printer hardware'}
                </div>
              </div>
            </div>

            ${isConnected ? `
              <button id="disconnect-printer-btn" class="btn btn-secondary" style="font-size: 11px; padding: 4px 10px; border-color: #fca5a5; background: #fef2f2; color: #b91c1c; cursor:pointer;">
                Disconnect
              </button>
            ` : ''}
          </div>

          <!-- Connection Cards Grid -->
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            
            <!-- USB Option -->
            <div style="padding: 14px; border-radius: 12px; border: 1px solid ${state.printerType === 'USB' && isConnected ? '#5e2b9d' : '#e2e8f0'}; background: ${state.printerType === 'USB' && isConnected ? '#faf5ff' : '#ffffff'}; display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 8px;">
                  <div style="width: 32px; height: 32px; border-radius: 8px; background: #f3e8ff; color: #5e2b9d; display:flex; align-items:center; justify-content:center; font-size: 16px;">
                    🔌
                  </div>
                  ${state.printerType === 'USB' && isConnected ? `
                    <span style="font-size: 10px; font-weight: 700; color: #047857; background: #d1fae5; padding: 2px 8px; border-radius: 9999px;">
                      Active
                    </span>
                  ` : ''}
                </div>
                <h4 style="margin:0; font-size: 12px; font-weight: 700; color: #0f172a;">USB Thermal Printer</h4>
                <p style="margin: 4px 0 0; font-size: 11px; color: #64748b; line-height: 1.4;">
                  Connect direct USB POS printer (Epson, TVS, Xprinter, NGX, Posiflex, Rugtek).
                </p>
              </div>

              <div style="margin-top: 14px;">
                <button id="connect-usb-btn" class="btn ${state.printerType === 'USB' && isConnected ? 'btn-secondary' : 'btn-primary'}" style="width: 100%; font-size: 11px; padding: 7px; display:flex; align-items:center; justify-content:center; gap: 6px; cursor:pointer;">
                  <span>🔌</span>
                  <span>${state.printerType === 'USB' && isConnected ? 'Re-pair USB' : 'Connect USB'}</span>
                </button>
              </div>
            </div>

            <!-- Bluetooth Option -->
            <div style="padding: 14px; border-radius: 12px; border: 1px solid ${state.printerType === 'Bluetooth' && isConnected ? '#2563eb' : '#e2e8f0'}; background: ${state.printerType === 'Bluetooth' && isConnected ? '#eff6ff' : '#ffffff'}; display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 8px;">
                  <div style="width: 32px; height: 32px; border-radius: 8px; background: #dbeafe; color: #2563eb; display:flex; align-items:center; justify-content:center; font-size: 16px;">
                    📶
                  </div>
                  ${state.printerType === 'Bluetooth' && isConnected ? `
                    <span style="font-size: 10px; font-weight: 700; color: #047857; background: #d1fae5; padding: 2px 8px; border-radius: 9999px;">
                      Active
                    </span>
                  ` : ''}
                </div>
                <h4 style="margin:0; font-size: 12px; font-weight: 700; color: #0f172a;">Bluetooth Printer</h4>
                <p style="margin: 4px 0 0; font-size: 11px; color: #64748b; line-height: 1.4;">
                  Connect wireless Bluetooth BLE thermal printer for mobile and counter billing.
                </p>
              </div>

              <div style="margin-top: 14px;">
                <button id="connect-bluetooth-btn" class="btn" style="width: 100%; font-size: 11px; padding: 7px; display:flex; align-items:center; justify-content:center; gap: 6px; background:#2563eb; color:#ffffff; border:none; cursor:pointer;">
                  <span>📶</span>
                  <span>${state.printerType === 'Bluetooth' && isConnected ? 'Re-pair Bluetooth' : 'Pair Bluetooth'}</span>
                </button>
              </div>
            </div>

          </div>

          <!-- Paper Roll Width Selector -->
          <div style="padding: 12px 14px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; display:flex; flex-direction:column; gap: 8px;">
            <div style="display:flex; align-items:center; justify-content:space-between;">
              <span style="font-size: 12px; font-weight: 700; color: #0f172a; display:flex; align-items:center; gap: 6px;">
                ⚙️ Paper Roll Width
              </span>
              <span style="font-size: 11px; color: #64748b; font-weight: 500;">
                ${is80 ? '48 Columns (Full 3-Inch)' : '32 Columns (Compact 2-Inch)'}
              </span>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <button id="set-width-80-btn" style="padding: 8px 12px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor:pointer; display:flex; align-items:center; justify-content:space-between; background: #ffffff; border: 1px solid ${is80 ? '#5e2b9d' : '#cbd5e1'}; color: ${is80 ? '#5e2b9d' : '#475569'}; box-shadow: ${is80 ? '0 0 0 1px #5e2b9d' : 'none'};">
                <span>3 Inch / 80mm (Standard POS)</span>
                ${is80 ? '✓' : ''}
              </button>

              <button id="set-width-58-btn" style="padding: 8px 12px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor:pointer; display:flex; align-items:center; justify-content:space-between; background: #ffffff; border: 1px solid ${!is80 ? '#5e2b9d' : '#cbd5e1'}; color: ${!is80 ? '#5e2b9d' : '#475569'}; box-shadow: ${!is80 ? '0 0 0 1px #5e2b9d' : 'none'};">
                <span>2 Inch / 58mm (Portable)</span>
                ${!is80 ? '✓' : ''}
              </button>
            </div>
          </div>

          <!-- Verify Hardware Print -->
          <div style="padding: 12px 14px; border-radius: 12px; border: 1px solid #e2e8f0; background: #ffffff; display:flex; align-items:center; justify-content:space-between; gap: 12px;">
            <div>
              <h4 style="margin:0; font-size: 12px; font-weight: 700; color: #0f172a;">Verify Hardware Print</h4>
              <p style="margin: 2px 0 0; font-size: 11px; color: #64748b;">
                Sends a formatted test slip to verify paper width alignment and cutter.
              </p>
            </div>
            <button id="print-test-slip-btn" class="btn btn-primary" style="font-size: 11px; padding: 6px 12px; display:flex; align-items:center; gap: 6px; cursor:pointer; shrink: 0;" ${state.isPrinting ? 'disabled' : ''}>
              <span>⚡</span>
              <span>${state.isPrinting ? 'Printing...' : 'Print Test Slip'}</span>
            </button>
          </div>

          <!-- Success Alert Placeholder -->
          <div id="test-print-success-banner" style="display:none; padding: 10px 14px; border-radius: 8px; background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 12px; display:flex; align-items:center; gap: 8px;">
            <span>✓</span>
            <span>Test print sent successfully to thermal printer!</span>
          </div>

          <!-- Error Alert Placeholder -->
          ${state.lastError ? `
            <div style="padding: 10px 14px; border-radius: 8px; background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; font-size: 12px; display:flex; align-items:center; justify-content:space-between; gap: 8px;">
              <span>⚠️ ${state.lastError}</span>
              <button id="dismiss-printer-error-btn" style="background:none; border:none; color:#dc2626; cursor:pointer; font-size:11px; font-weight:600;">Dismiss</button>
            </div>
          ` : ''}

          <!-- Browser & Driver Note -->
          <div style="padding: 10px 12px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.4;">
            <strong style="color: #334155;">Hardware Compatibility:</strong> WebUSB, WebSerial and WebBluetooth allow instant direct ESC/POS communication. If no physical printer is connected, standard system printing will automatically open.
          </div>

        </div>

        <!-- Footer -->
        <div style="padding: 12px 20px; background: #f8fafc; border-top: 1px solid #e2e8f0; display:flex; align-items:center; justify-content:space-between;">
          <button id="open-system-print-btn" style="background:none; border:none; color: #64748b; font-size: 12px; cursor:pointer; display:flex; align-items:center; gap: 6px;">
            <span>📄</span>
            <span>Open System Print Dialog</span>
          </button>
          <button id="modal-done-btn" class="btn btn-secondary" style="font-size: 12px; padding: 6px 16px; cursor:pointer;">
            Done
          </button>
        </div>

      </div>
    `;

    // Bind event handlers
    const closeBtn = el.querySelector('#close-printer-modal-btn');
    const doneBtn = el.querySelector('#modal-done-btn');
    const usbBtn = el.querySelector('#connect-usb-btn');
    const bleBtn = el.querySelector('#connect-bluetooth-btn');
    const disconnectBtn = el.querySelector('#disconnect-printer-btn');
    const width80Btn = el.querySelector('#set-width-80-btn');
    const width58Btn = el.querySelector('#set-width-58-btn');
    const testSlipBtn = el.querySelector('#print-test-slip-btn');
    const systemPrintBtn = el.querySelector('#open-system-print-btn');
    const dismissErrBtn = el.querySelector('#dismiss-printer-error-btn');

    if (closeBtn) closeBtn.onclick = () => ThermalPrinterModal.close();
    if (doneBtn) doneBtn.onclick = () => ThermalPrinterModal.close();

    if (usbBtn) {
      usbBtn.onclick = async () => {
        usbBtn.disabled = true;
        usbBtn.innerHTML = '<span>⏳</span><span>Connecting...</span>';
        await service.connectUsbPrinter();
        renderModal();
      };
    }

    if (bleBtn) {
      bleBtn.onclick = async () => {
        bleBtn.disabled = true;
        bleBtn.innerHTML = '<span>⏳</span><span>Pairing...</span>';
        await service.connectBluetoothPrinter();
        renderModal();
      };
    }

    if (disconnectBtn) {
      disconnectBtn.onclick = async () => {
        await service.disconnectPrinter();
        renderModal();
      };
    }

    if (width80Btn) {
      width80Btn.onclick = () => {
        service.setPaperWidth('80mm');
        renderModal();
      };
    }

    if (width58Btn) {
      width58Btn.onclick = () => {
        service.setPaperWidth('58mm');
        renderModal();
      };
    }

    if (testSlipBtn) {
      testSlipBtn.onclick = async () => {
        testSlipBtn.disabled = true;
        testSlipBtn.innerHTML = '<span>⚡</span><span>Printing...</span>';
        const ok = await service.printTestSlip();
        testSlipBtn.disabled = false;
        testSlipBtn.innerHTML = '<span>⚡</span><span>Print Test Slip</span>';

        const successBanner = el.querySelector('#test-print-success-banner');
        if (ok && successBanner) {
          successBanner.style.display = 'flex';
          if (testPrintSuccessTimeout) clearTimeout(testPrintSuccessTimeout);
          testPrintSuccessTimeout = setTimeout(() => {
            if (successBanner) successBanner.style.display = 'none';
          }, 4000);
        }
      };
    }

    if (systemPrintBtn) {
      systemPrintBtn.onclick = () => service.printWindow();
    }

    if (dismissErrBtn) {
      dismissErrBtn.onclick = () => {
        service.clearError();
        renderModal();
      };
    }

    // Close on backdrop click
    el.onclick = (e) => {
      if (e.target === el) ThermalPrinterModal.close();
    };
  }

  const ThermalPrinterModal = {
    open() {
      const el = ensureModal();
      renderModal();
      el.style.display = 'flex';

      // Subscribe to service updates while open
      if (global.PrinterService && !this._unsub) {
        this._unsub = global.PrinterService.subscribe(() => {
          if (el.style.display === 'flex') {
            renderModal();
          }
        });
      }
    },

    close() {
      if (modalElement) {
        modalElement.style.display = 'none';
      }
      if (this._unsub) {
        this._unsub();
        this._unsub = null;
      }
    }
  };

  global.ThermalPrinterModal = ThermalPrinterModal;

})(window);

