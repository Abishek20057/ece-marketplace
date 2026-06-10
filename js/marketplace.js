// ============================================
// ECE HUB — MARKETPLACE JS (Fixed)
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
  const search = document.getElementById('search-input').value.toLowerCase().trim();
  const maxPrice = parseInt(document.getElementById('price-range').value);
  const sortVal = document.getElementById('sort-select').value;
  const types = [...document.querySelectorAll('.filter-check input[value="temporary"],.filter-check input[value="permanent"]')]
    .filter(el => el.checked).map(el => el.value);
  const categories = [...document.querySelectorAll('.filter-check input')]
    .filter(el => el.checked && el.value !== 'temporary' && el.value !== 'permanent').map(el => el.value);
  return { search, maxPrice, sortVal, types, categories };
}

function renderGrid() {
  const { search, maxPrice, sortVal, types, categories } = getFilters();
  const grid = document.getElementById('market-grid');
  const empty = document.getElementById('empty-state');
  const count = document.getElementById('result-count');

  let filtered = COMPONENTS.filter(c => {
    if (!c.type.some(t => types.includes(t))) return false;
    if (categories.length && !categories.includes(c.category)) return false;
    if (search && !c.name.toLowerCase().includes(search) && !c.description.toLowerCase().includes(search)) return false;
    if (c.permPrice !== null && c.permPrice > maxPrice) return false;
    return true;
  });

  if (sortVal === 'price-asc') filtered.sort((a,b)=>(a.permPrice??0)-(b.permPrice??0));
  else if (sortVal === 'price-desc') filtered.sort((a,b)=>(b.permPrice??0)-(a.permPrice??0));
  else if (sortVal === 'name') filtered.sort((a,b)=>a.name.localeCompare(b.name));

  if (filtered.length === 0) {
    grid.innerHTML = ''; empty.style.display = 'block';
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
        card.style.opacity = '0'; card.style.transform = 'translateY(16px)';
        setTimeout(() => {
          card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          card.style.opacity = '1'; card.style.transform = 'translateY(0)';
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

// ── Component images using reliable Wikimedia URLs ──────────
const COMPONENT_IMAGES = {
  1:  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Arduino_Uno_-_R3.jpg/320px-Arduino_Uno_-_R3.jpg',
  2:  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/ESP32_Espressif_ESP-WROOM-32_Dev_Board.jpg/320px-ESP32_Espressif_ESP-WROOM-32_Dev_Board.jpg',
  3:  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/NodeMCU_DEVKIT_1.0.jpg/320px-NodeMCU_DEVKIT_1.0.jpg',
  4:  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/LiquidCrystal_I2C_Backpack.jpg/320px-LiquidCrystal_I2C_Backpack.jpg',
  5:  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/SSD1306_OLED_module_with_0.96_inch_screen.jpg/320px-SSD1306_OLED_module_with_0.96_inch_screen.jpg',
  6:  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/MQ2.jpg/320px-MQ2.jpg',
  7:  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Soil_moisture_sensor.jpg/320px-Soil_moisture_sensor.jpg',
  8:  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Flamesensor.jpg/320px-Flamesensor.jpg',
  9:  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/IR_sensor.jpg/320px-IR_sensor.jpg',
  10: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Ultrasound_Sensor_HC-SR04.jpg/320px-Ultrasound_Sensor_HC-SR04.jpg',
  11: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/LDR_1480405_6_7_HDR_Enhancer.jpg/320px-LDR_1480405_6_7_HDR_Enhancer.jpg',
  12: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/DHT11_Humidity_%26_Temperature_Sensor.jpg/320px-DHT11_Humidity_%26_Temperature_Sensor.jpg',
  13: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Rain_Sensor.jpg/320px-Rain_Sensor.jpg',
  14: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Vibration_sensor.jpg/320px-Vibration_sensor.jpg',
  15: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Tilt_sensor.jpg/320px-Tilt_sensor.jpg',
  16: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/MPU6050_module.jpg/320px-MPU6050_module.jpg',
  17: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Arduino-uno-perspective-transparent.png/320px-Arduino-uno-perspective-transparent.png',
  18: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Arduino-uno-perspective-transparent.png/320px-Arduino-uno-perspective-transparent.png',
  19: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Arduino-uno-perspective-transparent.png/320px-Arduino-uno-perspective-transparent.png',
  20: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Electric_motor.gif/240px-Electric_motor.gif',
  21: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/TowerPro_SG90_servo_motor.jpg/320px-TowerPro_SG90_servo_motor.jpg',
  22: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/L298N_Motor_Driver.jpg/320px-L298N_Motor_Driver.jpg',
  23: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/HC-05_Bluetooth_Module.jpg/320px-HC-05_Bluetooth_Module.jpg',
  24: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/RFID_Module_RC522.jpg/320px-RFID_Module_RC522.jpg',
  25: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/SIM800L.jpg/320px-SIM800L.jpg',
  26: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Ublox_neo_6m_gps.jpg/320px-Ublox_neo_6m_gps.jpg',
  27: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/ESP-01.jpg/320px-ESP-01.jpg',
  28: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Battery_types.jpg/320px-Battery_types.jpg',
  29: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Photovoltaik_Dachanlage_Hannover_-_Schwarze_Heide_-_1_MW.jpg/320px-Photovoltaik_Dachanlage_Hannover_-_Schwarze_Heide_-_1_MW.jpg',
  30: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Ktec_KSAS0151200150HU_ac_adapter.jpg/320px-Ktec_KSAS0151200150HU_ac_adapter.jpg',
  31: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Buzzer.jpg/240px-Buzzer.jpg',
  32: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/400_points_breadboard.jpg/320px-400_points_breadboard.jpg',
  33: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Dupont_connector.jpg/320px-Dupont_connector.jpg',
  34: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/RBG_LED.jpg/240px-RBG_LED.jpg',
  35: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Push_button_on_off.jpg/240px-Push_button_on_off.jpg'
};

// Category emoji fallbacks when image fails
const CAT_EMOJI = {
  microcontroller: '🔲', display: '🖥️', sensor: '📡',
  relay: '⚡', motor: '⚙️', communication: '📶',
  power: '🔋', audio: '🔔', prototyping: '🧩'
};

function buildCard(c) {
  const hasPerm = c.type.includes('permanent');
  const hasTemp = c.type.includes('temporary');
  const priceLabel = hasPerm
    ? `<span class="card-price price-paid">₹${c.permPrice}</span>`
    : `<span class="card-price price-free">Free</span>`;
  const imgSrc = c.image || COMPONENT_IMAGES[c.id] || '';
  const fallback = CAT_EMOJI[c.category] || c.icon || '📦';

  return `
    <div class="component-card">
      <div class="card-img-wrap">
        ${imgSrc
          ? `<img src="${imgSrc}" alt="${c.name}"
               style="width:100%;height:160px;object-fit:cover;display:block;"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
             />
             <div class="card-thumb" style="display:none;">${fallback}</div>`
          : `<div class="card-thumb">${fallback}</div>`
        }
      </div>
      <div class="card-body">
        <div class="card-badges">
          ${hasTemp ? '<span class="badge badge-temp">Temporary</span>' : ''}
          ${hasPerm ? '<span class="badge badge-perm">Permanent</span>' : ''}
          <span class="badge badge-cat">${c.categoryLabel}</span>
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

function openModal(c) {
  const overlay = document.getElementById('modal-overlay');
  const body = document.getElementById('modal-body');
  const hasPerm = c.type.includes('permanent');
  const hasTemp = c.type.includes('temporary');
  const imgSrc = COMPONENT_IMAGES[c.id] || '';
  const fallback = CAT_EMOJI[c.category] || c.icon || '📦';

  body.innerHTML = `
    ${imgSrc
      ? `<img src="${imgSrc}" alt="${c.name}"
           style="width:100%;max-height:200px;object-fit:cover;border-radius:12px;margin-bottom:1rem;"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
         />
         <div class="modal-thumb" style="display:none;">${fallback}</div>`
      : `<div class="modal-thumb">${fallback}</div>`
    }
    <h2>${c.name}</h2>
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
        <div class="modal-price-label">⏱ Temporary — Borrow Free</div>
        <div class="modal-price-val">Free</div>
      </div>
      <button class="btn btn-outline" onclick="handleBorrow(${c.id},'${encodeURIComponent(c.name)}')">Get Temporary Access</button>
    </div>` : ''}
    ${hasPerm ? `
    <div class="modal-price-row">
      <div>
        <div class="modal-price-label">♾️ Permanent — Buy & Keep</div>
        <div class="modal-price-val">₹${c.permPrice}</div>
      </div>
      <button class="btn btn-primary" onclick="handleBuy(${c.id},'${encodeURIComponent(c.name)}',${c.permPrice})">Buy Now ₹${c.permPrice}</button>
    </div>` : ''}
    <p style="font-size:0.78rem;color:var(--slate-dk);margin-top:0.75rem;text-align:center;">
      Purchases support the ECE Department directly.
    </p>`;

  overlay.classList.add('active');
}

// ── TEMPORARY: check login → collect page ──
function handleBorrow(id, name) {
  const loggedIn = localStorage.getItem('ece_logged_in');
  if (loggedIn === 'true') {
    window.location.href = `collect.html?id=${id}&name=${name}&type=temporary`;
  } else {
    localStorage.setItem('ece_after_login', `collect.html?id=${id}&name=${name}&type=temporary`);
    window.location.href = 'login.html';
  }
}

// ── PERMANENT: check login → payment page ──
function handleBuy(id, name, price) {
  const loggedIn = localStorage.getItem('ece_logged_in');
  if (loggedIn === 'true') {
    window.location.href = `payment.html?id=${id}&name=${name}&price=${price}`;
  } else {
    localStorage.setItem('ece_after_login', `payment.html?id=${id}&name=${name}&price=${price}`);
    window.location.href = 'login.html';
  }
}