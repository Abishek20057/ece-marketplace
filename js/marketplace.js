// ============================================
// ECE HUB — MARKETPLACE JS
// Stock-aware: reads from stock.js getStock()
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  if (hamburger) hamburger.addEventListener('click', () => {
    document.querySelector('.navbar').classList.toggle('nav-mobile-open');
  });

  const params = new URLSearchParams(window.location.search);
  const typeParam = params.get('type');
  if (typeParam === 'temporary') {
    document.querySelectorAll('.filter-check input[value="permanent"]').forEach(el => el.checked = false);
  } else if (typeParam === 'permanent') {
    document.querySelectorAll('.filter-check input[value="temporary"]').forEach(el => el.checked = false);
  }

  renderGrid();

  document.getElementById('search-input').addEventListener('input', renderGrid);
  document.getElementById('sort-select').addEventListener('change', renderGrid);
  document.getElementById('price-range').addEventListener('input', (e) => {
    document.getElementById('price-max-label').textContent = `₹${e.target.value}`;
    renderGrid();
  });
  document.querySelectorAll('.filter-check input').forEach(el => el.addEventListener('change', renderGrid));
  document.getElementById('reset-filters').addEventListener('click', resetFilters);

  const overlay = document.getElementById('modal-overlay');
  document.getElementById('modal-close').addEventListener('click', () => overlay.classList.remove('active'));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('active'); });
});

function getFilters() {
  const search    = document.getElementById('search-input').value.toLowerCase().trim();
  const maxPrice  = parseInt(document.getElementById('price-range').value);
  const sortVal   = document.getElementById('sort-select').value;
  const types     = [...document.querySelectorAll('.filter-check input[value="temporary"],.filter-check input[value="permanent"]')]
                      .filter(el => el.checked).map(el => el.value);
  const categories = [...document.querySelectorAll('.filter-check input')]
                      .filter(el => el.checked && el.value !== 'temporary' && el.value !== 'permanent')
                      .map(el => el.value);
  return { search, maxPrice, sortVal, types, categories };
}

function renderGrid() {
  const { search, maxPrice, sortVal, types, categories } = getFilters();
  const grid  = document.getElementById('market-grid');
  const empty = document.getElementById('empty-state');
  const count = document.getElementById('result-count');

  let filtered = COMPONENTS.filter(c => {
    if (!c.type || !c.type.some(t => types.includes(t))) return false;
    if (categories.length && !categories.includes(c.category)) return false;
    if (search && !c.name.toLowerCase().includes(search) && !c.description.toLowerCase().includes(search)) return false;
    if (c.permPrice !== null && c.permPrice > maxPrice) return false;
    return true;
  });

  if (sortVal === 'price-asc')  filtered.sort((a,b) => (a.permPrice??0)-(b.permPrice??0));
  else if (sortVal === 'price-desc') filtered.sort((a,b) => (b.permPrice??0)-(a.permPrice??0));
  else if (sortVal === 'name')  filtered.sort((a,b) => a.name.localeCompare(b.name));

  if (filtered.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    count.textContent = 'No components found';
  } else {
    empty.style.display = 'none';
    grid.innerHTML = filtered.map(c => buildCard(c)).join('');
    count.textContent = `Showing ${filtered.length} component${filtered.length !== 1 ? 's' : ''}`;

    grid.querySelectorAll('.component-card').forEach((card, i) => {
      card.addEventListener('click', () => openModal(filtered[i]));
    });

    requestAnimationFrame(() => {
      grid.querySelectorAll('.component-card').forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(16px)';
        setTimeout(() => {
          card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, i * 40);
      });
    });
  }
}

function resetFilters() {
  document.getElementById('search-input').value = '';
  document.getElementById('price-range').value = 500;
  document.getElementById('price-max-label').textContent = '₹500';
  document.getElementById('sort-select').value = 'default';
  document.querySelectorAll('.filter-check input').forEach(el => el.checked = true);
  renderGrid();
}

// ── Image map ──────────────────────────────────────────────
const COMPONENT_IMAGES = {
   1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Arduino_Uno_-_R3.jpg/320px-Arduino_Uno_-_R3.jpg',
   2: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/ESP32_Espressif_ESP-WROOM-32_Dev_Board.jpg/320px-ESP32_Espressif_ESP-WROOM-32_Dev_Board.jpg',
   3: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/NodeMCU_DEVKIT_1.0.jpg/320px-NodeMCU_DEVKIT_1.0.jpg',
   6: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/MQ2.jpg/320px-MQ2.jpg',
   9: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/IR_sensor.jpg/320px-IR_sensor.jpg',
  10: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Ultrasound_Sensor_HC-SR04.jpg/320px-Ultrasound_Sensor_HC-SR04.jpg',
  12: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/DHT11_Humidity_%26_Temperature_Sensor.jpg/320px-DHT11_Humidity_%26_Temperature_Sensor.jpg',
  14: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Vibration_sensor.jpg/320px-Vibration_sensor.jpg',
  15: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Tilt_sensor.jpg/320px-Tilt_sensor.jpg',
  21: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/TowerPro_SG90_servo_motor.jpg/320px-TowerPro_SG90_servo_motor.jpg',
  32: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/400_points_breadboard.jpg/320px-400_points_breadboard.jpg',
};
const CAT_EMOJI = {
  microcontroller:'🔲', display:'🖥️', sensor:'📡',
  relay:'⚡', motor:'⚙️', communication:'📶',
  power:'🔋', audio:'🔔', common:'🧩'
};

// ── Build card HTML ────────────────────────────────────────
function buildCard(c) {
  const qty        = getStock(c.id);
  const outOfStock = qty <= 0;
  const hasPerm    = c.type.includes('permanent');
  const hasTemp    = c.type.includes('temporary');
  const imgSrc     = COMPONENT_IMAGES[c.id] || c.image || '';
  const fallback   = CAT_EMOJI[c.category] || c.icon || '📦';

  // Stock badge
  let stockBadge;
  if (outOfStock) {
    stockBadge = `<span class="stock-badge stock-out">SOLD OUT</span>`;
  } else if (qty <= 3) {
    stockBadge = `<span class="stock-badge stock-low">⚠ ${qty} left</span>`;
  } else {
    stockBadge = `<span class="stock-badge stock-ok">${qty} in stock</span>`;
  }

  const priceLabel = hasPerm
    ? `<span class="card-price price-paid">₹${c.permPrice}</span>`
    : `<span class="card-price price-free">Free</span>`;

  return `
    <div class="component-card ${outOfStock ? 'card-sold-out' : ''}">
      ${hasTemp ? `<div class="temp-fee-badge">₹${c.tempPrice} Temporary Access Fee</div>` : ''}
      <div class="card-img-wrap">
        ${imgSrc
          ? `<img src="${imgSrc}" alt="${c.name}"
               style="width:100%;height:160px;object-fit:cover;display:block;"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
             <div class="card-thumb" style="display:none;">${fallback}</div>`
          : `<div class="card-thumb">${fallback}</div>`
        }
        ${outOfStock ? '<div class="sold-out-overlay">SOLD OUT</div>' : ''}
      </div>
      <div class="card-body">
        <div class="card-badges">
          ${hasTemp  ? '<span class="badge badge-temp">Temporary</span>' : ''}
          ${hasPerm  ? '<span class="badge badge-perm">Permanent</span>' : ''}
          <span class="badge badge-cat">${c.categoryLabel}</span>
          ${stockBadge}
        </div>
        <h3>${c.name}</h3>
        <p class="card-desc">${c.description.substring(0, 90)}…</p>
        <div class="card-footer">
          ${priceLabel}
          <span class="btn btn-ghost" style="font-size:0.85rem;">Details →</span>
        </div>
      </div>
    </div>`;
}

// ── Modal ──────────────────────────────────────────────────
function openModal(c) {
  const overlay    = document.getElementById('modal-overlay');
  const body       = document.getElementById('modal-body');
  const hasPerm    = c.type.includes('permanent');
  const hasTemp    = c.type.includes('temporary');
  const imgSrc     = COMPONENT_IMAGES[c.id] || c.image || '';
  const fallback   = CAT_EMOJI[c.category] || c.icon || '📦';
  const qty        = getStock(c.id);
  const outOfStock = qty <= 0;

  let stockLine;
  if (outOfStock) {
    stockLine = `<span style="color:#f87171;font-weight:700;">⛔ Out of Stock</span>`;
  } else if (qty <= 3) {
    stockLine = `<span style="color:#fbbf24;font-weight:700;">⚠ Only ${qty} left!</span>`;
  } else {
    stockLine = `<span style="color:#4ade80;font-weight:700;">✅ ${qty} in stock</span>`;
  }

  body.innerHTML = `
    ${imgSrc
      ? `<img src="${imgSrc}" alt="${c.name}"
           style="width:100%;max-height:200px;object-fit:cover;border-radius:12px;margin-bottom:1rem;"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
         <div class="modal-thumb" style="display:none;">${fallback}</div>`
      : `<div class="modal-thumb">${fallback}</div>`
    }
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.25rem;">
      <h2 style="margin:0;">${c.name}</h2>
      <div style="font-size:0.9rem;padding:0.3rem 0.8rem;background:rgba(255,255,255,0.05);border-radius:8px;border:1px solid var(--border);">
        ${stockLine}
      </div>
    </div>
    <p class="modal-meta">${c.categoryLabel} · ${c.project}</p>
    <p class="modal-desc">${c.description}</p>
    <div style="margin-bottom:1rem;">
      <strong style="font-family:var(--font-display);font-size:0.85rem;color:var(--slate-dk);display:block;margin-bottom:0.5rem;">TECH STACK</strong>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
        ${c.tech.map(t => `<span class="badge badge-cat">${t}</span>`).join('')}
      </div>
    </div>
    <div style="margin-bottom:1.5rem;">
      <strong style="font-family:var(--font-display);font-size:0.85rem;color:var(--slate-dk);display:block;margin-bottom:0.5rem;">FEATURES</strong>
      <ul style="display:flex;flex-direction:column;gap:0.4rem;">
        ${c.features.map(f => `<li style="color:var(--slate);font-size:0.9rem;">✓ ${f}</li>`).join('')}
      </ul>
    </div>
    ${hasTemp ? `
    <div class="modal-price-row">
      <div>
        <div class="modal-price-label">⏱ Temporary — Borrow &amp; Return</div>
        <div class="modal-price-val">₹${c.tempPrice}</div>
      </div>
      <button class="btn btn-outline" onclick="handleBorrow(${c.id},'${encodeURIComponent(c.name)}',${c.tempPrice})"
        ${outOfStock ? 'disabled style="opacity:0.45;cursor:not-allowed;"' : ''}>
        ${outOfStock ? 'Out of Stock' : 'Borrow for ₹' + c.tempPrice}
      </button>
    </div>` : ''}
    ${hasPerm ? `
    <div class="modal-price-row">
      <div>
        <div class="modal-price-label">♾️ Permanent — Buy &amp; Keep</div>
        <div class="modal-price-val">₹${c.permPrice}</div>
      </div>
      <button class="btn btn-primary" onclick="handleBuy(${c.id},'${encodeURIComponent(c.name)}',${c.permPrice})"
        ${outOfStock ? 'disabled style="opacity:0.45;cursor:not-allowed;"' : ''}>
        ${outOfStock ? 'Out of Stock' : 'Buy Now ₹' + c.permPrice}
      </button>
    </div>` : ''}
    <p style="font-size:0.78rem;color:var(--slate-dk);margin-top:0.75rem;text-align:center;">
      Purchases support the ECE Department directly.
    </p>`;

  overlay.classList.add('active');
}

// ── Borrow (Temporary) ─────────────────────────────────────
function handleBorrow(id, name, amount) {
  const loggedIn = localStorage.getItem('ece_logged_in') === 'true';
  // Must go through payment first — same as Buy flow
  const dest = `payment.html?id=${id}&name=${name}&price=${amount}&type=temporary`;
  if (loggedIn) {
    window.location.href = dest;
  } else {
    localStorage.setItem('ece_after_login', dest);
    window.location.href = 'login.html';
  }
}

// ── Buy (Permanent) ────────────────────────────────────────
function handleBuy(id, name, price) {
  const loggedIn = localStorage.getItem('ece_logged_in') === 'true';
  const dest = `payment.html?id=${id}&name=${name}&price=${price}`;
  if (loggedIn) {
    window.location.href = dest;   // decrement on payment success
  } else {
    localStorage.setItem('ece_after_login', dest);
    window.location.href = 'login.html';
  }
}