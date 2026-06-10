// ============================================
// ECE HUB — MARKETPLACE JS
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // Mobile nav
  const hamburger = document.getElementById('hamburger');
  if (hamburger) hamburger.addEventListener('click', () => {
    document.querySelector('.navbar').classList.toggle('nav-mobile-open');
  });

  // Read URL params for pre-filter
  const params = new URLSearchParams(window.location.search);
  const typeParam = params.get('type');

  if (typeParam === 'temporary') {
    document.querySelectorAll('.filter-check input[value="permanent"]').forEach(el => el.checked = false);
  } else if (typeParam === 'permanent') {
    document.querySelectorAll('.filter-check input[value="temporary"]').forEach(el => el.checked = false);
  }

  renderGrid();

  // Events
  document.getElementById('search-input').addEventListener('input', renderGrid);
  document.getElementById('sort-select').addEventListener('change', renderGrid);
  document.getElementById('price-range').addEventListener('input', (e) => {
    document.getElementById('price-max-label').textContent = `₹${e.target.value}`;
    renderGrid();
  });
  document.querySelectorAll('.filter-check input').forEach(el => {
    el.addEventListener('change', renderGrid);
  });
  document.getElementById('reset-filters').addEventListener('click', resetFilters);

  // Modal close
  const overlay = document.getElementById('modal-overlay');
  document.getElementById('modal-close').addEventListener('click', () => overlay.classList.remove('active'));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('active'); });
});

function getFilters() {
  const search = document.getElementById('search-input').value.toLowerCase().trim();
  const maxPrice = parseInt(document.getElementById('price-range').value);
  const sortVal = document.getElementById('sort-select').value;

  const types = [...document.querySelectorAll('.filter-check input[value="temporary"], .filter-check input[value="permanent"]')]
    .filter(el => el.checked).map(el => el.value);

  const categories = [...document.querySelectorAll('.filter-check input')]
    .filter(el => el.checked && el.value !== 'temporary' && el.value !== 'permanent')
    .map(el => el.value);

  return { search, maxPrice, sortVal, types, categories };
}

function renderGrid() {
  const { search, maxPrice, sortVal, types, categories } = getFilters();
  const grid = document.getElementById('market-grid');
  const empty = document.getElementById('empty-state');
  const count = document.getElementById('result-count');

  let filtered = COMPONENTS.filter(c => {
    const hasMatchType = c.type.some(t => types.includes(t));
    if (!hasMatchType) return false;
    if (categories.length && !categories.includes(c.category)) return false;
    if (search && !c.name.toLowerCase().includes(search) && !c.description.toLowerCase().includes(search)) return false;
    if (c.permPrice !== null && c.permPrice > maxPrice) return false;
    return true;
  });

  if (sortVal === 'price-asc') {
    filtered.sort((a, b) => (a.permPrice ?? 0) - (b.permPrice ?? 0));
  } else if (sortVal === 'price-desc') {
    filtered.sort((a, b) => (b.permPrice ?? 0) - (a.permPrice ?? 0));
  } else if (sortVal === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

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

function buildCard(c) {
  const hasPerm = c.type.includes('permanent');
  const hasTemp = c.type.includes('temporary');
  const priceLabel = hasPerm
    ? `<span class="card-price price-paid">₹${c.permPrice}</span>`
    : `<span class="card-price price-free">Free</span>`;

  // Image or icon fallback
  const imgHtml = c.image
    ? `<img src="${c.image}" alt="${c.name}" class="card-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
       <div class="card-thumb" style="display:none">${c.icon}</div>`
    : `<div class="card-thumb">${c.icon}</div>`;

  return `
    <div class="component-card">
      <div class="card-img-wrap">
        ${imgHtml}
      </div>
      <div class="card-body">
        <div class="card-badges">
          ${hasTemp ? '<span class="badge badge-temp">Temporary</span>' : ''}
          ${hasPerm ? '<span class="badge badge-perm">Permanent</span>' : ''}
          <span class="badge badge-cat">${c.categoryLabel}</span>
        </div>
        <h3>${c.name}</h3>
        <p class="card-desc">${c.description.substring(0, 95)}…</p>
        <div class="card-footer">
          ${priceLabel}
          <span class="btn btn-ghost" style="font-size:0.85rem;">Details →</span>
        </div>
      </div>
    </div>
  `;
}

function openModal(c) {
  const overlay = document.getElementById('modal-overlay');
  const body = document.getElementById('modal-body');
  const hasPerm = c.type.includes('permanent');
  const hasTemp = c.type.includes('temporary');

  // Save selected component for post-login redirect
  // These are used by auth.js after login

  const imgSection = c.image
    ? `<img src="${c.image}" alt="${c.name}" class="modal-img" onerror="this.style.display='none'">`
    : `<div class="modal-thumb">${c.icon}</div>`;

  body.innerHTML = `
    ${imgSection}
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
      <strong style="font-family:var(--font-display);font-size:0.85rem;color:var(--slate-dk);display:block;margin-bottom:0.5rem;">WHAT'S INCLUDED</strong>
      <ul style="display:flex;flex-direction:column;gap:0.4rem;">
        ${c.features.map(f => `<li style="color:var(--slate);font-size:0.9rem;">✓ ${f}</li>`).join('')}
      </ul>
    </div>
    ${hasTemp ? `
    <div class="modal-price-row">
      <div>
        <div class="modal-price-label">⏱ Temporary Access — Borrow from Department</div>
        <div class="modal-price-val">Free</div>
      </div>
      <button class="btn btn-outline" onclick="handleBorrow(${c.id}, '${encodeURIComponent(c.name)}')">Get Temporary Access</button>
    </div>` : ''}
    ${hasPerm ? `
    <div class="modal-price-row">
      <div>
        <div class="modal-price-label">♾️ Permanent — Buy & Keep</div>
        <div class="modal-price-val">₹${c.permPrice}</div>
      </div>
      <button class="btn btn-primary" onclick="handleBuy(${c.id}, '${encodeURIComponent(c.name)}', ${c.permPrice})">Buy Now</button>
    </div>` : ''}
    <p style="font-size:0.78rem;color:var(--slate-dk);margin-top:0.75rem;text-align:center;">
      Permanent purchases support the ECE Department directly.
    </p>
  `;

  overlay.classList.add('active');
}

// ── TEMPORARY: Login → Collect page ──────────────────
function handleBorrow(id, name) {
  const isLoggedIn = sessionStorage.getItem('ece_logged_in');
  if (isLoggedIn) {
    // Already logged in → go directly to collect page
    window.location.href = `collect.html?id=${id}&name=${name}&type=temporary`;
  } else {
    // Save intent → login → collect
    sessionStorage.setItem('ece_redirect', `collect.html?id=${id}&name=${name}&type=temporary`);
    window.location.href = 'login.html';
  }
}

// ── PERMANENT: Login → Payment page ──────────────────
function handleBuy(id, name, price) {
  const isLoggedIn = sessionStorage.getItem('ece_logged_in');
  if (isLoggedIn) {
    // Already logged in → go directly to payment
    window.location.href = `payment.html?id=${id}&name=${name}&price=${price}`;
  } else {
    // Save intent → login → payment
    sessionStorage.setItem('ece_redirect', `payment.html?id=${id}&name=${name}&price=${price}`);
    window.location.href = 'login.html';
  }
}
