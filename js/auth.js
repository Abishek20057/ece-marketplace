// ============================================
// Kalam Hub — AUTH JS — v2 (Login/Signup separation)
// If you see this comment in DevTools Sources tab,
// the correct file is loaded.
// ============================================
console.log('[Kalam Hub] auth.js v2 loaded — login/signup validation active');

// ── Registered users storage ──────────────────────────────
function getUsers() {
  try { return JSON.parse(localStorage.getItem('ece_users') || '{}'); }
  catch (e) { return {}; }
}
function saveUsers(users) {
  localStorage.setItem('ece_users', JSON.stringify(users));
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim().toLowerCase();
      const password = document.getElementById('password').value;

      if (!email || !password) {
        showError(loginForm, 'Please fill in all fields.');
        return;
      }

      const users = getUsers();

      // ── New user trying to log in directly → block ──
      if (!users[email]) {
        showError(loginForm, 'No account found with this email. Please sign up first.');
        return;
      }

      // ── Existing user → check password ──
      if (users[email].password !== password) {
        showError(loginForm, 'Incorrect password. Please try again.');
        return;
      }

      const btn = loginForm.querySelector('button');
      showLoading(btn, 'Signing in…');

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
      }, 800);
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim().toLowerCase();
      const password = document.getElementById('password').value;
      const confirm = document.getElementById('confirm').value;

      if (!name || !email || !password || !confirm) { showError(registerForm, 'Please fill in all fields.'); return; }
      if (password.length < 8) { showError(registerForm, 'Password must be at least 8 characters.'); return; }
      if (password !== confirm) { showError(registerForm, 'Passwords do not match.'); return; }

      const users = getUsers();

      // ── Already registered → must use Login instead ──
      if (users[email]) {
        showError(registerForm, 'An account with this email already exists. Please log in instead.');
        return;
      }

      showLoading(registerForm.querySelector('button'), 'Creating account…');
      setTimeout(() => {
        // Save new user
        users[email] = { name, password };
        saveUsers(users);

        localStorage.setItem('ece_logged_in', 'true');
        localStorage.setItem('ece_user', email);
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