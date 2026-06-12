// ============================================
// Kalam Hub — STOCK MANAGEMENT
// localStorage-based stock tracking
// ============================================

const DEFAULT_STOCK = {
   1: 30,  // Arduino UNO
   2:  3,  // ESP32
   3: 11,  // NodeMCU ESP8266
   4:  20,  // LCD Display
   5:  1,  // OLED Display
   6:  7,  // Smoke Sensor
   7:  7,  // Soil Moisture
   8:  4,  // Flame Sensor
   9:  6,  // IR Sensor
  10:  8,  // Ultrasonic HC-SR04
  11:  1,  // LDR Sensor
  12:  11,  // DHT11/DHT22
  13:  3,  // Rain Sensor
  14:  1,  // Vibration Sensor
  15:  2,  // Tilt Sensor
  16:  1,  // MPU6050
  17:  8,  // Single Relay
  18:  2,  // 2-Ch Relay
  19:  2,  // 4-Ch Relay
  20:  4,  // DC Motor
  21:  5,  // Servo Motor
  22:  6,  // Motor Driver
  23:  2,  // Bluetooth HC-05
  24:  1,  // RFID RC522
  25:  3,  // GSM Module
  26:  3,  // GPS Module
  27:  5,  // DC-DC Booster
  28: 11,  // Batteries
  29:  3,  // Solar Panels
  30:  8,  // Power Adapters
  31: 5,  // Buzzer
  32: 5,  // Breadboard
  33: 50,  // Jumper Wires
  34: 5,  // LEDs
  35: 7,  // Push Buttons
  36:  9,  // Li-Ion 18650
  37:  9,  // Water Pump
  38:  5,  // Mini Breadboard
  39:  4,  // Mini DC Fan
  40:  5,  // 18650 Battery Holder
  41:  2,  // Fingerprint Sensor
  42:  4,  // HW-131 Battery Holder
  43:  2,  // Step-Down Transformer
  44:  3,  // Arduino UNO SMD
};

const STOCK_KEY = 'ece_stock';

// ── Init: load from localStorage OR set defaults ──
function initStock() {
  const saved = localStorage.getItem(STOCK_KEY);
  if (!saved) {
    localStorage.setItem(STOCK_KEY, JSON.stringify(DEFAULT_STOCK));
    return { ...DEFAULT_STOCK };
  }
  // Merge: add any new IDs that aren't in saved
  const current = JSON.parse(saved);
  let changed = false;
  Object.entries(DEFAULT_STOCK).forEach(([id, qty]) => {
    if (current[id] === undefined) { current[id] = qty; changed = true; }
  });
  if (changed) localStorage.setItem(STOCK_KEY, JSON.stringify(current));
  return current;
}

// ── Get stock for one component ──
function getStock(id) {
  const stock = initStock();
  return stock[id] !== undefined ? stock[id] : 5;
}

// ── Decrement stock by 1 ──
function decrementStock(id) {
  const stock = initStock();
  if (stock[id] === undefined) return false;
  if (stock[id] <= 0) return false; // already out of stock
  stock[id] = stock[id] - 1;
  localStorage.setItem(STOCK_KEY, JSON.stringify(stock));
  return true;
}

// ── Reset all to defaults (admin use) ──
function resetStock() {
  localStorage.setItem(STOCK_KEY, JSON.stringify(DEFAULT_STOCK));
}

// ── Stock badge HTML ──
function stockBadgeHTML(id) {
  const qty = getStock(id);
  if (qty <= 0) {
    return `<span class="stock-badge stock-out">SOLD OUT</span>`;
  } else if (qty <= 3) {
    return `<span class="stock-badge stock-low">⚠ Only ${qty} left</span>`;
  } else {
    return `<span class="stock-badge stock-ok">${qty} in stock</span>`;
  }
}
