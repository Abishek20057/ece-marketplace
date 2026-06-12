// ============================================
// Kalam Hub — NAV SESSION JS
// Shows user name + logout when logged in
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const loggedIn = localStorage.getItem('ece_logged_in') === 'true';
  const userName = localStorage.getItem('ece_user_name') || '';

  const navActions = document.querySelector('.nav-actions');
  if (!navActions) return;

  if (loggedIn) {
    // Replace Login/Sign Up buttons with user info + logout
    navActions.innerHTML = `
      <span class="nav-user-name">👤 ${userName}</span>
      <button class="btn btn-ghost" id="logout-btn">Logout</button>
    `;
    document.getElementById('logout-btn').addEventListener('click', () => {
      localStorage.removeItem('ece_logged_in');
      localStorage.removeItem('ece_user_name');
      localStorage.removeItem('ece_user_email');
      window.location.href = 'index.html';
    });
  }
  // else: keep the default Login / Sign Up buttons
});
