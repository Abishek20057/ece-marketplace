// ============================================
// ECE HUB — CONTACT JS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const success = document.getElementById('form-success');

    btn.disabled = true;
    btn.textContent = 'Sending…';
    btn.style.opacity = '0.7';

    // Simulate send — replace with backend/EmailJS/etc.
    setTimeout(() => {
      form.reset();
      btn.style.display = 'none';
      success.style.display = 'block';
    }, 1200);
  });
});
