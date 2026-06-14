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

// ── One-time migration: patch old accounts missing 'roll' field ──
(function migrateUsers() {
  const users = getUsers();
  let changed = false;
  Object.keys(users).forEach(email => {
    if (users[email].roll === undefined) {
      users[email].roll = '';
      changed = true;
    }
  });
  if (changed) saveUsers(users);
})();


document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input    = document.getElementById('email').value.trim().toLowerCase();
      const password = document.getElementById('password').value;

      if (!input || !password) {
        showError(loginForm, 'Please fill in all fields.');
        return;
      }

      const users = getUsers();

      // ── Find user by email key OR by stored roll number ──
      let foundEmail = null;
      if (users[input]) {
        foundEmail = input;
      } else {
        foundEmail = Object.keys(users).find(e => (users[e].roll || '').toLowerCase() === input);
      }

      // ── Fallback: input looks like roll number (no '@') but wasn't saved yet.
      //    Match by password across accounts missing a roll number, then auto-save it. ──
      if (!foundEmail && !input.includes('@')) {
        const candidates = Object.keys(users).filter(e =>
          !users[e].roll && users[e].password === password
        );
        if (candidates.length === 1) {
          foundEmail = candidates[0];
          users[foundEmail].roll = input;   // auto-attach roll for future logins
          saveUsers(users);
        }
      }

      // ── New user trying to log in directly → block ──
      if (!foundEmail) {
        showError(loginForm, 'No account found. Try logging in with your Email instead, or sign up.');
        return;
      }

      // ── Existing user → check password ──
      if (users[foundEmail].password !== password) {
        showError(loginForm, 'Incorrect password. Please try again.');
        return;
      }

      const email = foundEmail;

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
      const name  = document.getElementById('name').value.trim();
      const roll  = (document.getElementById('roll')?.value || '').trim().toLowerCase();
      const email = document.getElementById('email').value.trim().toLowerCase();
      const password = document.getElementById('password').value;
      const confirm = document.getElementById('confirm').value;

      if (!name || !email || !password || !confirm) { showError(registerForm, 'Please fill in all fields.'); return; }
      if (password.length < 8) { showError(registerForm, 'Password must be at least 8 characters.'); return; }
      if (password !== confirm) { showError(registerForm, 'Passwords do not match.'); return; }

      const users = getUsers();

      // ── Already registered ──
      if (users[email]) {
        // Old account missing roll number + same password → patch it (one-time migration)
        if (!users[email].roll && users[email].password === password) {
          users[email].roll = roll;
          saveUsers(users);
          showError(registerForm, '✅ Account updated! You can now log in with your Roll Number or Email.');
          return;
        }
        showError(registerForm, 'An account with this email already exists. Please log in instead.');
        return;
      }

      showLoading(registerForm.querySelector('button'), 'Creating account…');
      setTimeout(() => {
        // Save new user
        users[email] = { name, roll, password };
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