/**
 * Retail Next — Hardware Thermal Printer Management Service
 * Supports:
 *   - WebUSB (Direct ESC/POS Bulk Endpoints)
 *   - WebSerial (USB Virtual COM / Windows Spooler Ports)
 *   - WebBluetooth BLE (Thermal POS Wireless Printers)
 *   - Roll widths: 80mm (3-Inch / 48 cols) and 58mm (2-Inch / 32 cols)
 *   - Low-level ESC/POS binary streaming with auto-chunking & window.print() fallback
 */

'use strict';

(function(global) {

  const BLE_SERVICES = [
    '000018f0-0000-1000-8000-00805f9b34fb',
    '49535343-fe7d-4ae5-8fa9-9fafd205e455',
    'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
    '0000ffe0-0000-1000-8000-00805f9b34fb',
    '0000ff00-0000-1000-8000-00805f9b34fb',
    '0000ae00-0000-1000-8000-00805f9b34fb',
    '00001800-0000-1000-8000-00805f9b34fb',
    '00001801-0000-1000-8000-00805f9b34fb'
  ];

  class PrinterService {
    constructor() {
      this.isConnected = false;
      this.printerType = 'None'; // 'USB' | 'Bluetooth' | 'None'
      this.usbSubtype = 'None';  // 'WebUSB' | 'Serial' | 'None'
      this.printerName = '';
      this.paperWidth = localStorage.getItem('retailnext_printer_width') || '80mm';
      this.isPrinting = false;
      this.statusMessage = 'Ready';
      this.lastError = null;

      // Hardware handles
      this.serialPort = null;
      this.bleDevice = null;
      this.bleCharacteristic = null;
      this.usbDevice = null;
      this.usbEndpoint = null;
      this.printQueue = Promise.resolve(true);

      // Listeners
      this.listeners = new Set();
    }

    subscribe(fn) {
      this.listeners.add(fn);
      return () => this.listeners.delete(fn);
    }

    _notify() {
      this.listeners.forEach((fn) => {
        try {
          fn(this.getState());
        } catch (e) {
          console.error('[PrinterService] Listener error:', e);
        }
      });
    }

    getState() {
      return {
        isConnected: this.isConnected,
        printerType: this.printerType,
        usbSubtype: this.usbSubtype,
        printerName: this.printerName,
        paperWidth: this.paperWidth,
        isPrinting: this.isPrinting,
        statusMessage: this.statusMessage,
        lastError: this.lastError
      };
    }

    setPaperWidth(width) {
      if (width === '58mm' || width === '80mm') {
        this.paperWidth = width;
        try {
          localStorage.setItem('retailnext_printer_width', width);
        } catch (_) {}
        this._notify();
      }
    }

    clearError() {
      this.lastError = null;
      this._notify();
    }

    // ── 1. Disconnect Printer ──────────────────────────────────────────────────
    async disconnectPrinter() {
      try {
        if (this.serialPort) {
          try { await this.serialPort.close(); } catch (_) {}
          this.serialPort = null;
        }

        if (this.bleDevice && this.bleDevice.gatt && this.bleDevice.gatt.connected) {
          try { this.bleDevice.gatt.disconnect(); } catch (_) {}
        }
        this.bleDevice = null;
        this.bleCharacteristic = null;

        if (this.usbDevice) {
          try { await this.usbDevice.close(); } catch (_) {}
          this.usbDevice = null;
          this.usbEndpoint = null;
        }

        this.isConnected = false;
        this.printerType = 'None';
        this.usbSubtype = 'None';
        this.printerName = '';
        this.statusMessage = 'Printer Disconnected';
        this.lastError = null;

        if (global.Toast) global.Toast.info('Printer disconnected');
        this._notify();
      } catch (err) {
        console.error('[PrinterService] Disconnect error:', err);
      }
    }

    // ── 2. Connect USB Printer (WebUSB with WebSerial Fallback) ─────────────────
    async connectUsbPrinter() {
      this.statusMessage = 'Searching for USB Thermal Printers...';
      this.lastError = null;
      this._notify();

      // Attempt Pure WebUSB
      if (typeof navigator !== 'undefined' && navigator.usb) {
        try {
          const device = await navigator.usb.requestDevice({ filters: [] });
          this.statusMessage = `Connecting to ${device.productName || 'USB Printer'}...`;
          this._notify();

          await device.open();
          await device.selectConfiguration(1);

          let targetInterface = null;
          let outEndpoint = null;

          for (const iface of device.configuration.interfaces) {
            for (const alt of iface.alternates) {
              const outEp = alt.endpoints.find((ep) => ep.direction === 'out' && ep.type === 'bulk');
              if (outEp) {
                targetInterface = iface;
                outEndpoint = outEp;
                break;
              }
            }
            if (targetInterface) break;
          }

          if (targetInterface && outEndpoint) {
            await device.claimInterface(targetInterface.interfaceNumber);
            this.usbDevice = device;
            this.usbEndpoint = outEndpoint.endpointNumber;

            const devName = device.productName || 'USB Thermal Printer';
            this.printerName = devName;
            this.isConnected = true;
            this.printerType = 'USB';
            this.usbSubtype = 'WebUSB';
            this.statusMessage = `Connected via WebUSB: ${devName}`;

            if (global.Toast) global.Toast.success(`USB Connected: ${devName}`);
            this._notify();
            return true;
          }
        } catch (usbErr) {
          if (usbErr.name === 'NotFoundError') {
            this.statusMessage = 'USB selection cancelled.';
            this._notify();
            return false;
          }
          console.warn('[PrinterService] Pure WebUSB claim failed, trying Serial fallback...', usbErr);
        }
      }

      // Fallback: Web Serial API
      if (typeof navigator !== 'undefined' && navigator.serial) {
        try {
          this.statusMessage = 'Opening via Serial / USB COM...';
          this._notify();

          const port = await navigator.serial.requestPort();
          await port.open({ baudRate: 9600 });

          this.serialPort = port;
          const devName = 'USB Serial Thermal Printer';
          this.printerName = devName;
          this.isConnected = true;
          this.printerType = 'USB';
          this.usbSubtype = 'Serial';
          this.statusMessage = 'Connected via USB Serial (COM)';

          if (global.Toast) global.Toast.success('USB Serial Printer Connected');
          this._notify();
          return true;
        } catch (serialErr) {
          if (serialErr.name === 'NotFoundError') {
            this.statusMessage = 'Serial port selection cancelled.';
            this._notify();
            return false;
          }
          const errMsg = serialErr.message || 'Failed to connect to USB Printer.';
          this.lastError = errMsg;
          if (global.Toast) global.Toast.error(errMsg);
          this._notify();
          return false;
        }
      }

      const unsuppMsg = 'Web USB / Serial is not supported in this environment.';
      this.lastError = unsuppMsg;
      if (global.Toast) global.Toast.warning(unsuppMsg);
      this._notify();
      return false;
    }

    // ── 3. Connect Bluetooth BLE Printer ───────────────────────────────────────
    async connectBluetoothPrinter() {
      this.statusMessage = 'Searching for Bluetooth Thermal Printers...';
      this.lastError = null;
      this._notify();

      if (typeof navigator === 'undefined' || !navigator.bluetooth) {
        const errMsg = 'Web Bluetooth is not supported in this environment.';
        this.lastError = errMsg;
        if (global.Toast) global.Toast.warning(errMsg);
        this._notify();
        return false;
      }

      try {
        const device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: BLE_SERVICES
        });

        this.statusMessage = `Pairing with ${device.name || 'Bluetooth Printer'}...`;
        this._notify();

        device.addEventListener('gattserverdisconnected', () => {
          this.isConnected = false;
          this.printerType = 'None';
          this.printerName = '';
          this.statusMessage = 'Bluetooth printer disconnected';
          if (global.Toast) global.Toast.info('Bluetooth printer disconnected');
          this._notify();
        });

        const server = await device.gatt.connect();

        let targetCharacteristic = null;
        for (const serviceUuid of BLE_SERVICES) {
          try {
            const service = await server.getPrimaryService(serviceUuid);
            const characteristics = await service.getCharacteristics();
            for (const char of characteristics) {
              if (char.properties.write || char.properties.writeWithoutResponse) {
                targetCharacteristic = char;
                break;
              }
            }
            if (targetCharacteristic) break;
          } catch (_) {}
        }

        if (!targetCharacteristic) {
          throw new Error('No writable ESC/POS print characteristic found on this Bluetooth device.');
        }

        this.bleDevice = device;
        this.bleCharacteristic = targetCharacteristic;

        const devName = device.name || 'Bluetooth Thermal Printer';
        this.printerName = devName;
        this.isConnected = true;
        this.printerType = 'Bluetooth';
        this.statusMessage = `Connected via Bluetooth: ${devName}`;

        if (global.Toast) global.Toast.success(`Bluetooth Connected: ${devName}`);
        this._notify();
        return true;
      } catch (err) {
        if (err.name === 'NotFoundError') {
          this.statusMessage = 'Bluetooth pairing cancelled.';
          this._notify();
          return false;
        }
        const msg = err.message || 'Failed to pair Bluetooth printer.';
        this.lastError = msg;
        if (global.Toast) global.Toast.error(msg);
        this._notify();
        return false;
      }
    }

    // ── 4. Low-Level ESC/POS Byte Streamer ─────────────────────────────────────
    async printRaw(data) {
      return (this.printQueue = this.printQueue.then(async () => {
        this.isPrinting = true;
        this.statusMessage = 'Sending print data to hardware...';
        this._notify();

        try {
          // A. Pure WebUSB
          if (this.printerType === 'USB' && this.usbSubtype === 'WebUSB' && this.usbDevice && this.usbEndpoint) {
            await this.usbDevice.transferOut(this.usbEndpoint, data);
            this.statusMessage = 'Print completed via WebUSB';
            return true;
          }

          // B. USB Serial Port
          if (this.printerType === 'USB' && this.usbSubtype === 'Serial' && this.serialPort) {
            const writer = this.serialPort.writable.getWriter();
            await writer.write(data);
            writer.releaseLock();
            this.statusMessage = 'Print completed via Serial';
            return true;
          }

          // C. Bluetooth BLE in chunks
          if (this.printerType === 'Bluetooth' && this.bleCharacteristic) {
            const char = this.bleCharacteristic;
            const CHUNK_SIZE = 100;

            for (let i = 0; i < data.length; i += CHUNK_SIZE) {
              const chunk = data.slice(i, i + CHUNK_SIZE);
              if (char.writeValueWithoutResponse) {
                await char.writeValueWithoutResponse(chunk);
              } else {
                await char.writeValue(chunk);
              }
              await new Promise((r) => setTimeout(r, 20));
            }

            this.statusMessage = 'Print completed via Bluetooth';
            return true;
          }

          // Fallback to browser print if hardware not connected
          window.print();
          return true;
        } catch (err) {
          console.error('[PrinterService] Print stream error:', err);
          this.lastError = err.message || 'Failed to stream print data.';
          window.print();
          return false;
        } finally {
          this.isPrinting = false;
          this._notify();
        }
      }));
    }

    // ── 5. Print Hardware Test Slip ───────────────────────────────────────────
    async printTestSlip() {
      if (global.EscPosService && typeof global.EscPosService.generateTestReceipt === 'function') {
        const bytes = global.EscPosService.generateTestReceipt(this.paperWidth);
        return await this.printRaw(bytes);
      }
      window.print();
      return true;
    }

    // ── 6. Print Formatted Store Receipt ──────────────────────────────────────
    async printReceipt(order, storeSettings = null) {
      if (!order) return false;

      const store = storeSettings || global.apiService?.activeStore || {};
      const receiptData = {
        storeName: store.name || 'Retail Next Store',
        storeAddress: store.address,
        storeCity: store.city,
        storeState: store.state,
        storePincode: store.pincode,
        storePhone: store.phone,
        storeEmail: store.email,
        storeGst: store.gstin || store.gstNumber,
        enableGst: store.enableGst !== false,
        billNumber: order.billNumber || order.orderNumber || 'BILL-001',
        createdAt: order.createdAt || Date.now(),
        customerName: order.customer?.name || order.customerName,
        customerPhone: order.customer?.phone || order.customerPhone,
        customerCity: order.customer?.city,
        cashierName: order.settledBy || order.cashierName || global.apiService?.staff?.name || 'Cashier',
        paymentMethod: order.paymentMethod || 'CASH',
        splitDetails: order.splitDetails,
        items: (order.items || []).map((it) => ({
          name: it.productName || it.name || 'Item',
          variantName: it.variantName,
          quantity: Number(it.quantity) || 1,
          price: Number(it.price) || 0,
          total: Number(it.total) || 0
        })),
        subtotal: Number(order.subtotal) || 0,
        discount: Number(order.discount) || 0,
        cgst: Number(order.cgst) || 0,
        sgst: Number(order.sgst) || 0,
        roundOff: Number(order.roundOff) || 0,
        grandTotal: Number(order.grandTotal) || 0,
        notes: order.notes
      };

      if (this.isConnected && global.EscPosService) {
        const bytes = global.EscPosService.generateReceiptEscPos(receiptData, this.paperWidth);
        const ok = await this.printRaw(bytes);
        if (ok && global.Toast) {
          global.Toast.success(`Receipt Printed (${this.paperWidth})`);
        }
        return ok;
      }

      // If no hardware connected, invoke system print
      window.print();
      return true;
    }

    printWindow() {
      window.print();
    }
  }

  global.PrinterService = new PrinterService();

})(window);

