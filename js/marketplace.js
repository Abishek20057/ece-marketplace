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
  console.log("Total Components:", COMPONENTS.length);  
  console.log("Filtered Components:", filtered.length);
  console.log(filtered.map(c => c.id));

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
   1: 'https://www.flyrobo.in/image/cache/wp/gj/arduino-uno-r3-smd-board-cable-for-arduino-uno-1/arduino-uno-r3-smd-board-cable-for-arduino-uno-14-550x550h.webp',
   2: 'https://upload.wikimedia.org/wikipedia/commons/2/20/ESP32_Espressif_ESP-WROOM-32_Dev_Board.jpg',
   3: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/NodeMCU_DEVKIT_1.0.jpg',
   4: 'https://m.media-amazon.com/images/I/61n1PamWbTL._AC_UF1000,1000_QL80_.jpg',
   5: 'https://majestronicz.in/cdn/shop/files/OLED0.96.avif?v=1752499508',
   6: 'https://cdn.shopify.com/s/files/1/0300/6424/6919/files/MQ2_Gas_Sensor_600x600.jpg?v=1586598425',
   7: 'https://static.wixstatic.com/media/a5ba95_3817066cf30c4b7696dd62927708b9f1~mv2.jpg/v1/fit/w_500,h_500,q_90/file.jpg',
   8: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ89Gc1Q0wydiTx35y06YSGHGsv8mkBJSJ6ZQ&s',
   9: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJFqqrJEkQDCv6AnGuWGbhGWsIB4fJa7hirg&s',
  10: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrRu2Upmh_TQP5Ysf78qyJWFxTf6kYR8yssA&s',
  11: 'https://harishprojects.com/cdn/shop/files/LDRSensorModuleLightDependentResistorModulePhotosensitive_Free1LED_harishprojects_1.webp?v=1735478983',
  12: 'https://probots.co.in/pub/media/catalog/product/cache/d8ddd0f9b0cd008b57085cd218b48832/d/h/dht11_humidity_and_temperature_sensor_module_for_arduino-5.jpg',
  13: 'https://majestronicz.in/cdn/shop/files/SE-126.webp?v=1721381093',
  14: 'https://probots.co.in/pub/media/catalog/product/cache/d8ddd0f9b0cd008b57085cd218b48832/6/1/61iofguif_l._sl1200__1.jpg',
  15: 'https://majestronicz.in/cdn/shop/files/TILT.jpg?v=1741780282',
  16: 'https://www.kitkraft.in/cdn/shop/files/mpu6050_4.png?v=1751176395&width=2500',
  17: 'https://m.media-amazon.com/images/I/41aanUGc7nL._AC_UF1000,1000_QL80_.jpg',
  18: 'https://m.media-amazon.com/images/I/71c6GC3FrQL._AC_UF1000,1000_QL80_.jpg',
  19: 'https://5.imimg.com/data5/SELLER/Default/2021/9/NZ/WF/AU/84973740/24v-4-channel-relay-module-with-light-coupling--500x500.png',
  20: 'https://in.element14.com/productimages/large/en_GB/599104-40.jpg',
  21: 'https://www.electronicwings.com/storage/PlatformSection/TopicContent/134/icon/Servo%20Motor.jpg',
  22: 'https://majestronicz.in/cdn/shop/files/CM-104.jpg?v=1721379183',
  23: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSa_fBHpwfzMP25ceWlNBHO8NMz39gXLkIsnA&s',
  24: 'https://ielectrony.com/wp-content/uploads/2024/05/NA1441.jpg',
  25: 'https://robocomp.in/wp-content/uploads/2022/03/SIM800L-V2.0-5V-Wireless-GSM-GPRS-MODULE-Quad-Band-with-Antenna-3.webp',
  26: 'https://www.flyrobo.in/image/cache/catalog/neo-m8n-gps-module-with-ceramic-active-antenna/neo-m8n-gps-module-with-ceramic-active-antenna1-1024x1024.JPG',
  27: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUO1QefsKrrAZq3lZZBUpFtS59YpPqt0d2TQ&s',
  28: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmexvqpIZl1TTazJqCEICKj8rl5ITmbaqQTw&s',
  29: 'https://paperquirks.in/cdn/shop/files/SOLORPENEL2.jpg?v=1721473861&width=1024',
  30: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRl42YjGsZOgvfSOQGYIjLKlQx5zH-oeG3CKg&s',
  31: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTR5o5WPZBnJJQp_uoQKSOR9v1XTCoEZ2syxw&s',
  32: 'https://upload.wikimedia.org/wikipedia/commons/7/73/400_points_breadboard.jpg',
  33: 'https://components101.com/sites/default/files/component_pin/Jumper-Wire-Pinout.jpg',
  34: 'https://5.imimg.com/data5/DN/SE/MY-3299289/5mm-led-light-emitting-diode.jpg',
  35: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTl7vgGfjoolrIF7Wce_OECU5wjeNfqWuSh7w&s',
  36: 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Li-Ion_18650_Battery.jpg',
  37: 'https://5.imimg.com/data5/SELLER/Default/2021/10/OL/QS/DF/79642174/mini-water-dc-submersible-pump-motor.jpg',
  38: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTix5Nsyw4Cf5VCxhrUeuEXYdflybQBqDHkFw&s',
  39: 'https://components101.com/sites/default/files/component_pin/DC-Fan-Motor-Pinout.jpg',
  40: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHFspFqSJsrCUbQjcH40qy2iqREGOj2EWHKA&s',
  41: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIGA5D0z_cDfMCxYi_oAx48BPSIz6tSCftbQ&s',
  42: 'https://components101.com/sites/default/files/component_pin/18650-Battery-Holder-Pinout.jpg',
  43: 'https://components101.com/sites/default/files/component_pin/LM2596-Buck-Converter-Pinout.jpg',
  44: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Arduino_Uno_-_R3.jpg',
  
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
  const imgSrc = c.image || COMPONENT_IMAGES[c.id] || '';
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
  const imgSrc = c.image || COMPONENT_IMAGES[c.id] || '';
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