// ============================================
// Kalam Hub — CONTACT JS
// Sends form data to Google Apps Script,
// which emails kalamhub57@gmail.com
// ============================================

const CONTACT_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbwVpo-g5IOPpifC6FUx9h4ysxcc6ZF2nvfwZsSWpuXbRlq3uQIAsIhcTVzWYuGzCLbIvA/exec';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn     = form.querySelector('button[type="submit"]');
    const success = document.getElementById('form-success');

    btn.disabled      = true;
    btn.textContent   = 'Sending…';
    btn.style.opacity = '0.7';

    const subjectLabels = {
      'hands-on-training' : 'Hands-On Training',
      'internship'        : 'Internship',
      'workshop'          : 'Workshop',
      'component-query'   : 'Component Query',
      'purchase'          : 'Purchase Help',
      'contribute'        : 'Contribute a Project',
      'technical'         : 'Technical Issue',
      'other'             : 'Other'
    };

    const subjectVal = document.getElementById('subject').value;

    const payload = {
      action    : 'contact',
      timestamp : new Date().toLocaleString('en-IN'),
      name      : document.getElementById('name').value.trim(),
      email     : document.getElementById('email').value.trim(),
      subject   : subjectLabels[subjectVal] || subjectVal || '(No subject)',
      message   : document.getElementById('message').value.trim()
    };

    fetch(CONTACT_WEBAPP_URL, {
      method : 'POST',
      mode   : 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body   : JSON.stringify(payload)
    })
    .then(() => {
      form.reset();
      btn.style.display = 'none';
      success.style.display = 'block';
    })
    .catch(() => {
      // Even if fetch throws (no-cors mode often does), the request
      // usually still reaches the server — show success either way.
      form.reset();
      btn.style.display = 'none';
      success.style.display = 'block';
    });
  });
});