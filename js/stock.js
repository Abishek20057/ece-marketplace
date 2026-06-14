// ============================================
// Kalam Hub — STOCK MANAGEMENT v3
// Source of truth: Google Sheet (Inventory tab)
// localStorage = 30-second cache only
// ============================================

const WEB_APP_URL_STOCK =
'https://script.google.com/macros/s/AKfycbwVpo-g5IOPpifC6FUx9h4ysxcc6ZF2nvfwZsSWpuXbRlq3uQIAsIhcTVzWYuGzCLbIvA/exec';

const STOCK_KEY    = 'kalam_stock_v3';
const STOCK_TTL_MS = 30 * 1000; // 30 seconds

// Fallback: used only while first fetch loads or if offline
const DEFAULT_STOCK = {
   1: 30,  2:  3,  3: 11,  4: 20,  5:  1,  6:  7,  7:  7,  8:  4,  9:  6, 10:  8,
  11:  1, 12: 11, 13:  3, 14:  1, 15:  2, 16:  1, 17:  8, 18:  2, 19:  2, 20:  4,
  21:  5, 22:  6, 23:  2, 24:  1, 25:  3, 26:  3, 27:  5, 28: 11, 29:  3, 30:  8,
  31:  5, 32:  5, 33: 50, 34:  5, 35:  7, 36:  9, 37:  9, 38:  5, 39:  4, 40:  5,
  41:  2, 42:  4, 43:  2, 44:  3
};

let _liveStock    = null;
let _fetchPromise = null;

function _readCache() {
  try {
    const raw = JSON.parse(localStorage.getItem(STOCK_KEY) || 'null');
    if (!raw || !raw.ts || !raw.data) return null;
    if (Date.now() - raw.ts > STOCK_TTL_MS) return null;
    return raw.data;
  } catch(e) { return null; }
}

function _writeCache(data) {
  try { localStorage.setItem(STOCK_KEY, JSON.stringify({ ts: Date.now(), data })); }
  catch(e) {}
}

function _fetchLive() {
  if (_fetchPromise) return _fetchPromise;
  _fetchPromise = fetch(WEB_APP_URL_STOCK + '?action=getInventory')
    .then(r => r.json())
    .then(inv => {
      const map = {};
      if (Array.isArray(inv)) {
        inv.forEach(c => { map[Number(c.id)] = Number(c.stock); });
      }
      if (Object.keys(map).length > 0) {
        _liveStock = map;
        _writeCache(map);
        console.log('[Kalam Hub] Live stock loaded from Sheet:', map);
        // Re-render marketplace with live data
        if (typeof renderGrid === 'function') renderGrid();
      }
      _fetchPromise = null;
      return map;
    })
    .catch(err => {
      console.warn('[Kalam Hub] Stock fetch failed, using cache/defaults:', err.message);
      _fetchPromise = null;
      return null;
    });
  return _fetchPromise;
}

function _ensureStock() {
  if (_liveStock) return _liveStock;

  const cached = _readCache();
  if (cached) {
    _liveStock = cached;
    _fetchLive(); // refresh in background
    return _liveStock;
  }

  _liveStock = { ...DEFAULT_STOCK };
  _fetchLive(); // fetch real data in background
  return _liveStock;
}

// ── Public API (same signatures as old stock.js) ──

function getStock(id) {
  const s = _ensureStock();
  const qty = s[Number(id)];
  return qty !== undefined ? qty : (DEFAULT_STOCK[Number(id)] ?? 5);
}

function decrementStock(id) {
  const s = _ensureStock();
  const n = Number(id);
  if (s[n] === undefined || s[n] <= 0) return false;
  s[n]--;
  _liveStock = s;
  _writeCache(s);
  return true;
}

function stockBadgeHTML(id) {
  const qty = getStock(id);
  if (qty <= 0) return `<span class="stock-badge stock-out">SOLD OUT</span>`;
  if (qty <= 3) return `<span class="stock-badge stock-low">⚠ Only ${qty} left</span>`;
  return `<span class="stock-badge stock-ok">${qty} in stock</span>`;
}

function resetStock() {
  _liveStock = null;
  try { localStorage.removeItem(STOCK_KEY); } catch(e) {}
  _fetchLive();
}

// Start fetching immediately on script load
_fetchLive();