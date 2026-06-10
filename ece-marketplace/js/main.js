// ============================================
// ECE HUB — MAIN JS (Homepage)
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // ---- Mobile Nav ----
  const hamburger = document.getElementById('hamburger');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      document.querySelector('.navbar').classList.toggle('nav-mobile-open');
    });
  }

  // ---- Featured Grid ----
  const featuredGrid = document.getElementById('featured-grid');
  if (featuredGrid && typeof COMPONENTS !== 'undefined') {
    const featured = COMPONENTS.slice(0, 6);
    featuredGrid.innerHTML = featured.map(c => buildCard(c)).join('');

    featuredGrid.querySelectorAll('.component-card').forEach((card, i) => {
      card.addEventListener('click', () => openModal(featured[i]));
    });
  }

  // ---- Scroll fade-up ----
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.plan-card, .step-card, .component-card, .section-header')
    .forEach(el => { el.classList.add('fade-up'); observer.observe(el); });

  // ---- Modal ----
  const overlay = document.getElementById('modal-overlay');
  const closeBtn = document.getElementById('modal-close');
  if (overlay && closeBtn) {
    closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
  }
});

// ---- Card Builder ----
function buildCard(c) {
  const hasPerm = c.type.includes('permanent');
  const hasTemp = c.type.includes('temporary');
  const priceLabel = hasPerm
    ? `<span class="card-price price-paid">₹${c.permPrice}</span>`
    : `<span class="card-price price-free">Free</span>`;

  return `
    <div class="component-card">
      <div class="card-thumb">${c.icon}</div>
      <div class="card-body">
        <div class="card-badges">
          ${hasTemp ? '<span class="badge badge-temp">Temporary</span>' : ''}
          ${hasPerm ? '<span class="badge badge-perm">Permanent</span>' : ''}
          <span class="badge badge-cat">${c.categoryLabel}</span>
        </div>
        <h3>${c.name}</h3>
        <p class="card-desc">${c.description.substring(0, 100)}…</p>
        <div class="card-footer">
          ${priceLabel}
          <span class="btn btn-ghost" style="font-size:0.85rem;">View Details →</span>
        </div>
      </div>
    </div>
  `;
}

// ---- Modal ----
function openModal(c) {
  const overlay = document.getElementById('modal-overlay');
  const body = document.getElementById('modal-body');
  if (!overlay || !body) return;

  const hasPerm = c.type.includes('permanent');
  const hasTemp = c.type.includes('temporary');

  body.innerHTML = `
    <div class="modal-thumb">${c.icon}</div>
    <h2>${c.name}</h2>
    <p class="modal-meta">${c.categoryLabel} · ${c.project}</p>
    <p class="modal-desc">${c.description}</p>
    <div style="margin-bottom:1rem;">
      <strong style="font-family:var(--font-display);font-size:0.85rem;color:var(--slate-dk);">TECH STACK</strong>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.5rem;">
        ${c.tech.map(t => `<span class="badge badge-cat">${t}</span>`).join('')}
      </div>
    </div>
    <div style="margin-bottom:1.5rem;">
      <strong style="font-family:var(--font-display);font-size:0.85rem;color:var(--slate-dk);">FEATURES</strong>
      <ul style="margin-top:0.5rem;display:flex;flex-direction:column;gap:0.4rem;">
        ${c.features.map(f => `<li style="color:var(--slate);font-size:0.9rem;">✓ ${f}</li>`).join('')}
      </ul>
    </div>
    ${hasTemp ? `
    <div class="modal-price-row">
      <div>
        <div class="modal-price-label">Temporary Access</div>
        <div class="modal-price-val">Free</div>
      </div>
      <a href="login.html" class="btn btn-outline">Get Temporary Access</a>
    </div>` : ''}
    ${hasPerm ? `
    <div class="modal-price-row">
      <div>
        <div class="modal-price-label">Permanent License</div>
        <div class="modal-price-val">₹${c.permPrice}</div>
      </div>
      <a href="login.html" class="btn btn-primary">Buy Permanent License</a>
    </div>` : ''}
  `;

  overlay.classList.add('active');
}
