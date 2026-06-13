// ==========================================
// Kalam Hub Admin Login
// ==========================================

// Replace with your Apps Script URL
const WEB_APP_URL =
'https://script.google.com/macros/s/AKfycbwVpo-g5IOPpifC6FUx9h4ysxcc6ZF2nvfwZsSWpuXbRlq3uQIAsIhcTVzWYuGzCLbIvA/exec';

const loginForm =
document.getElementById('loginForm');

const loginBtn =
document.getElementById('loginBtn');

const msg =
document.getElementById('msg');

function showMessage(text, type) {

  msg.textContent = text;

  if (type === 'success') {
    msg.style.color = '#22c55e';
  } else {
    msg.style.color = '#ef4444';
  }
}

loginForm.addEventListener(
  'submit',
  async function (e) {

    e.preventDefault();

    const username =
      document
      .getElementById('username')
      .value
      .trim();

    const password =
      document
      .getElementById('password')
      .value
      .trim();

    if (!username || !password) {

      showMessage(
        'Please enter username and password.',
        'error'
      );

      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Checking...';

    try {

      const response =
        await fetch(
          WEB_APP_URL +
          '?action=verifyAdmin' +
          '&user=' +
          encodeURIComponent(username) +
          '&pass=' +
          encodeURIComponent(password)
        );

      const data =
        await response.json();

      if (data.ok) {

        sessionStorage.setItem(
          'kalam_admin_logged_in',
          '1'
        );

        sessionStorage.setItem(
          'kalam_admin_name',
          data.name || 'Admin'
        );

        showMessage(
          'Login successful.',
          'success'
        );

        setTimeout(() => {

          window.location.href =
            'admin-dashboard.html';

        }, 500);

      } else {

        showMessage(
          'Invalid username or password.',
          'error'
        );
      }

    } catch (err) {

      console.error(err);

      showMessage(
        'Unable to connect to server.',
        'error'
      );

    } finally {

      loginBtn.disabled = false;
      loginBtn.textContent =
        'Login to Dashboard';

    }

  }
);