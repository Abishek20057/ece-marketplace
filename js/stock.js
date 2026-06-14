// ============================================
// Kalam Hub — STOCK MANAGEMENT v4
// Source of truth: Google Sheet (Inventory tab)
// Syncs both STOCK and PRICES to marketplace
// ============================================

const WEB_APP_URL_STOCK =
'https://script.google.com/macros/s/AKfycbwVpo-g5IOPpifC6FUx9h4ysxcc6ZF2nvfwZsSWpuXbRlq3uQIAsIhcTVzWYuGzCLbIvA/exec';

const STOCK_KEY    = 'kalam_stock_v4';
const STOCK_TTL_MS = 30 * 1000; // 30 seconds

// Fallback stock (used only while first fetch is loading)
const DEFAULT_STOCK = {
   1: 30,  2:  3,  3: 11,  4: 20,  5:  1,  6:  7,  7:  7,  8:  4,  9:  6, 10:  8,
  11:  1, 12: 11, 13:  3, 14:  1, 15:  2, 16:  1, 17:  8, 18:  2, 19:  2, 20:  4,
  21:  5, 22:  6, 23:  2, 24:  1, 25:  3, 26:  3, 27:  5, 28: 11, 29:  3, 30:  8,
  31:  5, 32:  5, 33: 50, 34:  5, 35:  7, 36:  9, 37:  9, 38:  5, 39:  4, 40:  5,
  41:  2, 42:  4, 43:  2, 44:  3
};

let _liveStock    = null; // { id: qty }
let _livePrices   = null; // { id: { tempPrice, permPrice } }
let _fetchPromise = null;

// ── Cache: stores BOTH stock AND prices ──
function _readCache() {
  try {
    const raw = JSON.parse(localStorage.getItem(STOCK_KEY) || 'null');
    if (!raw || !raw.ts || !raw.stock) return null;
    if (Date.now() - raw.ts > STOCK_TTL_MS) return null; // stale
    return raw;
  } catch(e) { return null; }
}

function _writeCache(stock, prices) {
  try {
    localStorage.setItem(STOCK_KEY, JSON.stringify({
      ts: Date.now(),
      stock,
      prices
    }));
  } catch(e) {}
}

// ── Patch COMPONENTS[] with live prices from Sheet ──
function _patchPrices(prices) {
  if (!prices || typeof COMPONENTS === 'undefined') return;
  Object.entries(prices).forEach(([idStr, p]) => {
    const id   = Number(idStr);
    const comp = COMPONENTS.find(x => x.id === id);
    if (comp) {
      if (p.tempPrice !== undefined) comp.tempPrice = p.tempPrice;
      if (p.permPrice !== undefined) comp.permPrice = p.permPrice;
    }
  });
}

// ── Fetch live inventory from Sheet ──
function _fetchLive() {
  if (_fetchPromise) return _fetchPromise;

  _fetchPromise = fetch(WEB_APP_URL_STOCK + '?action=getInventory')
    .then(r => r.json())
    .then(inv => {
      _fetchPromise = null;

      if (!Array.isArray(inv) || inv.length === 0) return null;

      const stock  = {};
      const prices = {};

      inv.forEach(c => {
        const id = Number(c.id);
        stock[id] = Number(c.stock);
        prices[id] = {
          tempPrice: Number(c.tempPrice),
          permPrice: Number(c.permPrice)
        };
      });

      _liveStock  = stock;
      _livePrices = prices;
      _writeCache(stock, prices);

      // Patch COMPONENTS[] with live prices then re-render
      _patchPrices(prices);
      if (typeof renderGrid === 'function') renderGrid();

      console.log('[Kalam Hub] Stock + Prices synced from Sheet ✓');
      return stock;
    })
    .catch(err => {
      _fetchPromise = null;
      console.warn('[Kalam Hub] Fetch failed, using cache/defaults:', err.message);
      return null;
    });

  return _fetchPromise;
}

// ── Init: load from cache or defaults, then fetch live ──
function _ensureStock() {
  if (_liveStock) return _liveStock;

  const cached = _readCache();
  if (cached) {
    _liveStock  = cached.stock;
    _livePrices = cached.prices || null;
    // Apply cached prices immediately (no wait for fetch)
    _patchPrices(_livePrices);
    // Refresh in background
    _fetchLive();
    return _liveStock;
  }

  // No cache — use defaults, fetch in background
  _liveStock = { ...DEFAULT_STOCK };
  _fetchLive();
  return _liveStock;
}

// ── Public API (identical signatures to old stock.js) ──

function getStock(id) {
  const s   = _ensureStock();
  const qty = s[Number(id)];
  return qty !== undefined ? qty : (DEFAULT_STOCK[Number(id)] ?? 5);
}

function decrementStock(id) {
  const s = _ensureStock();
  const n = Number(id);
  if (s[n] === undefined || s[n] <= 0) return false;
  s[n]--;
  _liveStock = s;
  _writeCache(s, _livePrices);
  return true;
}

function stockBadgeHTML(id) {
  const qty = getStock(id);
  if (qty <= 0) return `<span class="stock-badge stock-out">SOLD OUT</span>`;
  if (qty <= 3) return `<span class="stock-badge stock-low">⚠ Only ${qty} left</span>`;
  return `<span class="stock-badge stock-ok">${qty} in stock</span>`;
}

function resetStock() {
  _liveStock  = null;
  _livePrices = null;
  try { localStorage.removeItem(STOCK_KEY); } catch(e) {}
  _fetchLive();
}

// Start fetching immediately on script load
_fetchLive();