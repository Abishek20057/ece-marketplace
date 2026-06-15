// ============================================
// Kalam Hub — STOCK MANAGEMENT v5
// Source of truth: Google Sheet (Inventory tab)
// NO cache — always fetches live on page load
// ============================================

const WEB_APP_URL_STOCK =
'https://script.google.com/macros/s/AKfycbwVpo-g5IOPpifC6FUx9h4ysxcc6ZF2nvfwZsSWpuXbRlq3uQIAsIhcTVzWYuGzCLbIvA/exec';

// Fallback stock (used only while fetch is in progress)
const DEFAULT_STOCK = {
   1: 30,  2:  3,  3: 11,  4: 20,  5:  1,  6:  7,  7:  7,  8:  4,  9:  6, 10:  8,
  11:  1, 12: 11, 13:  3, 14:  1, 15:  2, 16:  1, 17:  8, 18:  2, 19:  2, 20:  4,
  21:  5, 22:  6, 23:  2, 24:  1, 25:  3, 26:  3, 27:  5, 28: 11, 29:  3, 30:  8,
  31:  5, 32:  5, 33: 50, 34:  5, 35:  7, 36:  9, 37:  9, 38:  5, 39:  4, 40:  5,
  41:  2, 42:  4, 43:  2, 44:  3
};

let _liveStock  = null; // { id: qty }
let _livePrices = null; // { id: { tempPrice, permPrice, imageUrl } }
let _fetchDone  = false;
let _fetchPromise = null;

// ── Apply live prices + stock + images to COMPONENTS[] ──
function _patchComponents(inv) {
  if (!Array.isArray(inv) || typeof COMPONENTS === 'undefined') return;

  inv.forEach(c => {
    const id   = Number(c.id);
    const comp = COMPONENTS.find(x => x.id === id);

    if (comp) {
      // Update existing component
      if (c.stock !== undefined) comp.stock = Number(c.stock);
      if (c.tempPrice !== undefined && Number(c.tempPrice) > 0) comp.tempPrice = Number(c.tempPrice);
      if (c.permPrice !== undefined && Number(c.permPrice) > 0) comp.permPrice = Number(c.permPrice);
      // Override image if admin provided a URL
      if (c.imageUrl  && c.imageUrl.trim()) {
        comp.image = c.imageUrl.trim();
        // Also update COMPONENT_IMAGES so card/modal both pick it up
        if (typeof COMPONENT_IMAGES !== 'undefined') COMPONENT_IMAGES[id] = c.imageUrl.trim();
      }
    } else {
      // Brand-new component added via admin — inject into COMPONENTS array
      // Map unknown categories to 'common' so sidebar filter always includes them
      const VALID_CATEGORIES = ['microcontroller','sensor','display','relay','motor','communication','power','audio','common'];
      const rawCat = (c.category || 'common').toLowerCase().trim();
      const safeCat = VALID_CATEGORIES.includes(rawCat) ? rawCat : 'common';

      COMPONENTS.push({
        id,
        name:          c.name          || 'Component',
        icon:          c.icon          || '📦',
        category:      safeCat,
        categoryLabel: c.categoryLabel || 'Common',
        tempPrice:     Number(c.tempPrice) > 0 ? Number(c.tempPrice) : 20,
        permPrice:     Number(c.permPrice) > 0 ? Number(c.permPrice) : 50,
        stock:         Number(c.stock)     || 0,
        image:         c.imageUrl || '',
        description:   c.description || '',
        features:      [],
        tech:          [],
        type:          ['temporary', 'permanent'],
        project:       'Kalam Hub Inventory'
      });
      // Register image in COMPONENT_IMAGES so card rendering picks it up
      if (c.imageUrl && c.imageUrl.trim() && typeof COMPONENT_IMAGES !== 'undefined') {
        COMPONENT_IMAGES[id] = c.imageUrl.trim();
      }
    }
  });
}

// ── Fetch all inventory from Sheet ──
function _fetchLive() {
  if (_fetchPromise) return _fetchPromise;

  _fetchPromise = fetch(WEB_APP_URL_STOCK + '?action=getInventory')
    .then(r => r.json())
    .then(inv => {
      _fetchPromise = null;
      _fetchDone    = true;

      if (!Array.isArray(inv) || inv.length === 0) return;

      // Build quick-access maps
      const stockMap  = {};
      const priceMap  = {};
      inv.forEach(c => {
        const id = Number(c.id);
        stockMap[id] = Number(c.stock);
        priceMap[id] = {
          tempPrice: Number(c.tempPrice),
          permPrice: Number(c.permPrice),
          imageUrl:  c.imageUrl || ''
        };
      });
      _liveStock  = stockMap;
      _livePrices = priceMap;

      // Patch COMPONENTS[] with live data
      _patchComponents(inv);

      // Re-render marketplace with updated data
      if (typeof renderGrid === 'function') renderGrid();

      console.log('[Kalam Hub] Live inventory synced ✓', Object.keys(stockMap).length, 'components');
    })
    .catch(err => {
      _fetchPromise = null;
      console.warn('[Kalam Hub] Inventory fetch failed:', err.message);
    });

  return _fetchPromise;
}

// ── Global promise other scripts can await before rendering / navigating ──
window.KALAM_INVENTORY_READY = _fetchLive();


// ── Public API ──────────────────────────────────

function getStock(id) {
  // If live data available, use it; otherwise use DEFAULT_STOCK
  if (_liveStock) {
    const qty = _liveStock[Number(id)];
    return qty !== undefined ? qty : (DEFAULT_STOCK[Number(id)] ?? 5);
  }
  return DEFAULT_STOCK[Number(id)] ?? 5;
}

function decrementStock(id) {
  if (!_liveStock) return false;
  const n = Number(id);
  if (_liveStock[n] === undefined || _liveStock[n] <= 0) return false;
  _liveStock[n]--;
  // Also patch COMPONENTS[]
  if (typeof COMPONENTS !== 'undefined') {
    const comp = COMPONENTS.find(x => x.id === n);
    if (comp) comp.stock = _liveStock[n];
  }
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
  _fetchDone  = false;
  _fetchLive();
}