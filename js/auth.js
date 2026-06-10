// ============================================
// ECE HUB — AUTH JS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      if (!email || !password) {
        showError(loginForm, 'Please fill in all fields.');
        return;
      }

      const btn = loginForm.querySelector('button');
      showLoading(btn, 'Signing in…');

      setTimeout(() => {
        // ✅ Mark user as logged in
        localStorage.setItem('ece_logged_in', 'true');
        localStorage.setItem('ece_user', email);

        // ✅ Check saved redirect destination
        const redirect = localStorage.getItem('ece_after_login');
        if (redirect) {
          localStorage.removeItem('ece_after_login');
          window.location.href = redirect;
        } else {
          window.location.href = 'marketplace.html';
        }
      }, 1000);
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirm = document.getElementById('confirm').value;

      if (!name || !email || !password || !confirm) { showError(registerForm, 'Please fill in all fields.'); return; }
      if (password.length < 8) { showError(registerForm, 'Password must be at least 8 characters.'); return; }
      if (password !== confirm) { showError(registerForm, 'Passwords do not match.'); return; }

      showLoading(registerForm.querySelector('button'), 'Creating account…');
      setTimeout(() => {
        localStorage.setItem('ece_logged_in', 'true');
        localStorage.setItem('ece_user', email);
        const redirect = localStorage.getItem('ece_after_login');
        if (redirect) {
          localStorage.removeItem('ece_after_login');
          window.location.href = redirect;
        } else {
          window.location.href = 'marketplace.html';
        }
      }, 1200);
    });
  }

  function showError(form, msg) {
    let err = form.querySelector('.form-error');
    if (!err) {
      err = document.createElement('div');
      err.className = 'form-error';
      err.style.cssText = 'color:#f87171;font-size:0.85rem;margin-top:0.75rem;padding:0.7rem 1rem;background:rgba(248,113,113,0.1);border-radius:8px;border:1px solid rgba(248,113,113,0.3);text-align:center;';
      form.appendChild(err);
    }
    err.textContent = msg;
  }

  function showLoading(btn, text) {
    btn.disabled = true;
    btn.textContent = text;
    btn.style.opacity = '0.7';
  }
});
