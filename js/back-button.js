// ============================================
// Kalam Hub — GLOBAL BACK BUTTON
// Floating back button on every page (except home)
// Uses browser history; falls back to marketplace/index
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Don't show on the home page
  const path = window.location.pathname;
  if (path.endsWith('index.html') || path.endsWith('/') || path === '') return;

  const btn = document.createElement('button');
  btn.id = 'global-back-btn';
  btn.innerHTML = '← Back';
  btn.setAttribute('aria-label', 'Go back');

  btn.addEventListener('click', () => {
    // If there's history to go back to, use it
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback
      window.location.href = 'marketplace.html';
    }
  });

  document.body.appendChild(btn);
});
