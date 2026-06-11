// ============================================
// ECE HUB — STOCK MANAGEMENT
// localStorage-based stock tracking
// ============================================

const DEFAULT_STOCK = {
   1: 30,  // Arduino UNO
   2:  3,  // ESP32
   3: 11,  // NodeMCU ESP8266
   4:  5,  // LCD Display
   5:  5,  // OLED Display
   6:  5,  // Smoke Sensor
   7:  5,  // Soil Moisture
   8:  5,  // Flame Sensor
   9:  5,  // IR Sensor
  10:  5,  // Ultrasonic HC-SR04
  11:  5,  // LDR Sensor
  12:  5,  // DHT11/DHT22
  13:  5,  // Rain Sensor
  14:  5,  // Vibration Sensor
  15:  5,  // Tilt Sensor
  16:  5,  // MPU6050
  17:  5,  // Single Relay
  18:  5,  // 2-Ch Relay
  19:  5,  // 4-Ch Relay
  20:  5,  // DC Motor
  21:  5,  // Servo Motor
  22:  5,  // Motor Driver
  23:  5,  // Bluetooth HC-05
  24:  5,  // RFID RC522
  25:  5,  // GSM Module
  26:  5,  // GPS Module
  27:  5,  // DC-DC Booster
  28: 10,  // Batteries
  29:  5,  // Solar Panels
  30:  5,  // Power Adapters
  31: 10,  // Buzzer
  32: 10,  // Breadboard
  33: 20,  // Jumper Wires
  34: 50,  // LEDs
  35: 20,  // Push Buttons
  36:  5,  // Li-Ion 18650
  37:  5,  // Water Pump
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
