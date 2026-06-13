// ============================================
// Kalam Hub — STOCK MANAGEMENT (v2)
// Live stock from Google Sheet "Inventory" tab,
// with localStorage cache for instant render.
// ============================================

const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbwVpo-g5IOPpifC6FUx9h4ysxcc6ZF2nvfwZsSWpuXbRlq3uQIAsIhcTVzWYuGzCLbIvA/exec';
const STOCK_CACHE_KEY = 'kalam_stock_cache';
const STOCK_CACHE_TTL = 60 * 1000; // 1 minute

// Fallback defaults (used until first successful fetch, or if offline)
const DEFAULT_STOCK = {
   1: 30,  2:  3,  3: 11,  4: 20,  5:  1,  6:  7,  7:  7,  8:  4,  9:  6, 10:  8,
  11:  1, 12: 11, 13:  3, 14:  1, 15:  2, 16:  1, 17:  8, 18:  2, 19:  2, 20:  4,
  21:  5, 22:  6, 23:  2, 24:  1, 25:  3, 26:  3, 27:  5, 28: 11, 29:  3, 30:  8,
  31:  5, 32:  5, 33: 50, 34:  5, 35:  7, 36:  9, 37:  9, 38:  5, 39:  4, 40:  5,
  41:  2, 42:  4, 43:  2, 44:  3
};

// ── In-memory live stock map (populated on fetch) ──
let LIVE_STOCK = null;

// ── Read cache ──
function readStockCache() {
  try {
    const raw = JSON.parse(localStorage.getItem(STOCK_CACHE_KEY) || 'null');
    if (!raw || !raw.data || !raw.ts) return null;
    return raw;
  } catch (e) { return null; }
}

// ── Write cache ──
function writeStockCache(data) {
  try {
    localStorage.setItem(STOCK_CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch (e) {}
}

// ── Fetch live inventory from Sheet (returns Promise<{id: stock}>) ──
async function fetchLiveStock() {

  try {

    console.log("Fetching inventory...");

    const res = await fetch(
      SHEET_API_URL + '?action=getInventory'
    );

    const inv = await res.json();

    console.log("Inventory received:", inv);
    

    const map = {};

    inv.forEach(c=>{
      map[c.id] = c.stock;
    });

    LIVE_STOCK = map;

console.log("LIVE_STOCK UPDATED:", LIVE_STOCK);

writeStockCache(map);

localStorage.removeItem('kalam_stock_cache');
localStorage.setItem(
  'kalam_stock_cache',
  JSON.stringify({
    data: map,
    ts: Date.now()
  })
);

console.log("CACHE UPDATED");

return map;
  } catch(e){

    console.error("Inventory Error:", e);

    return null;

  }

}

// ── Init: load cache immediately, refresh in background ──
function initStock() {
  if (LIVE_STOCK) return LIVE_STOCK;
  const cache = readStockCache();
  if (cache) {
    LIVE_STOCK = cache.data;
    // Refresh in background if stale
    if (Date.now() - cache.ts > STOCK_CACHE_TTL) {
      fetchLiveStock().then(() => {
        if (typeof renderGrid === 'function') renderGrid();
      });
    }
    return LIVE_STOCK;
  }
  // No cache — use defaults synchronously, fetch live in background
  LIVE_STOCK = { ...DEFAULT_STOCK };
  fetchLiveStock().then(() => {
    if (typeof renderGrid === 'function') renderGrid();
  });
  return LIVE_STOCK;
}

// ── Get stock for one component ──
function getStock(id) {
  const stock = initStock();
  return stock[id] !== undefined ? stock[id] : (DEFAULT_STOCK[id] !== undefined ? DEFAULT_STOCK[id] : 5);
}

// ── Decrement stock by 1 (local optimistic update; Sheet is source of truth) ──
function decrementStock(id) {
  const stock = initStock();
  if (stock[id] === undefined) return false;
  if (stock[id] <= 0) return false;
  stock[id] = stock[id] - 1;
  LIVE_STOCK = stock;
  writeStockCache(stock);
  return true;
}

// ── Force refresh from Sheet (call after a purchase) ──
async function refreshStock() {
  await fetchLiveStock();
  if (typeof renderGrid === 'function') renderGrid();
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

// Kick off initial fetch as soon as this script loads
fetchLiveStock();
