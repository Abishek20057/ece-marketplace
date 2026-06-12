// ============================================
// Kalam Hub — AUTH JS
// Login  → set logged_in → redirect
// Register → NO logged_in → go to login page
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const loginForm    = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  // ─── LOGIN ─────────────────────────────────
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email    = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      if (!email || !password) {
        showError(loginForm, 'Please fill in all fields.');
        return;
      }

      // Check: is this user registered?
      const stored = getUser(email);
      if (!stored) {
        showError(loginForm,
          '❌ No account found. Please Sign Up first.');
        return;
      }
      if (stored.password !== password) {
        showError(loginForm, '❌ Incorrect password. Try again.');
        return;
      }

      const btn = loginForm.querySelector('button[type="submit"]');
      showLoading(btn, 'Signing in…');

      setTimeout(() => {
        // ✅ Mark as logged in ONLY after successful login
        localStorage.setItem('ece_logged_in', 'true');
        localStorage.setItem('ece_user_name', stored.name);
        localStorage.setItem('ece_user_email', stored.email);

        // Redirect to saved destination or marketplace
        const redirect = localStorage.getItem('ece_after_login');
        if (redirect) {
          localStorage.removeItem('ece_after_login');
          window.location.href = redirect;
        } else {
          window.location.href = 'marketplace.html';
        }
      }, 900);
    });
  }

  // ─── REGISTER ──────────────────────────────
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name     = document.getElementById('name').value.trim();
      const roll     = document.getElementById('roll').value.trim();
      const year     = document.getElementById('year').value;
      const email    = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirm  = document.getElementById('confirm').value;

      // Validation
      if (!name || !roll || !email || !password || !confirm) {
        showError(registerForm, 'Please fill in all fields.');
        return;
      }
      if (password.length < 8) {
        showError(registerForm, 'Password must be at least 8 characters.');
        return;
      }
      if (password !== confirm) {
        showError(registerForm, 'Passwords do not match.');
        return;
      }

      // Check duplicate
      if (getUser(email)) {
        showError(registerForm,
          '⚠️ An account with this email already exists. Please Login.');
        return;
      }

      const btn = registerForm.querySelector('button[type="submit"]');
      showLoading(btn, 'Creating account…');

      setTimeout(() => {
        // ✅ Save user to localStorage — but do NOT set logged_in
        saveUser({ name, roll, year, email, password });

        // Show success message, then redirect to LOGIN
        btn.disabled  = false;
        btn.textContent = 'Account Created!';
        btn.style.background = '#22c55e';
        btn.style.opacity = '1';

        showSuccess(registerForm,
          `✅ Account created for ${name}! Please sign in to continue.`);

        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1800);
      }, 1000);
    });
  }

  // ─── HELPERS ───────────────────────────────

  // Save a new user record (keyed by email, lowercase)
  function saveUser(userData) {
    const key   = 'ece_users';
    const users = JSON.parse(localStorage.getItem(key) || '{}');
    users[userData.email.toLowerCase()] = userData;
    localStorage.setItem(key, JSON.stringify(users));
  }

  // Get a user by email OR roll number
  function getUser(identifier) {
    const key   = 'ece_users';
    const users = JSON.parse(localStorage.getItem(key) || '{}');
    const lower = identifier.toLowerCase();

    // Try email match
    if (users[lower]) return users[lower];

    // Try roll number match
    return Object.values(users).find(
      u => u.roll && u.roll.toLowerCase() === lower
    ) || null;
  }

  function showError(form, msg) {
    clearMessages(form);
    const el = document.createElement('div');
    el.className = 'form-error';
    el.style.cssText = `
      color:#f87171; font-size:0.875rem; margin-top:0.9rem;
      padding:0.75rem 1rem;
      background:rgba(248,113,113,0.1);
      border:1px solid rgba(248,113,113,0.3);
      border-radius:8px; text-align:center;`;
    el.textContent = msg;
    form.appendChild(el);
  }

  function showSuccess(form, msg) {
    clearMessages(form);
    const el = document.createElement('div');
    el.className = 'form-success-msg';
    el.style.cssText = `
      color:#4ade80; font-size:0.875rem; margin-top:0.9rem;
      padding:0.75rem 1rem;
      background:rgba(74,222,128,0.1);
      border:1px solid rgba(74,222,128,0.3);
      border-radius:8px; text-align:center;`;
    el.textContent = msg;
    form.appendChild(el);
  }

  function clearMessages(form) {
    form.querySelectorAll('.form-error, .form-success-msg')
        .forEach(el => el.remove());
  }

  function showLoading(btn, text) {
    btn.disabled    = true;
    btn.textContent = text;
    btn.style.opacity = '0.75';
  }
});
