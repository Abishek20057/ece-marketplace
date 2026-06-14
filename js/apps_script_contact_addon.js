// ============================================================
// ADD THIS TO YOUR EXISTING GOOGLE APPS SCRIPT
// (the one used for orders / stock / admin)
//
// HOW TO ADD:
// 1. Open script.google.com → your existing project
// 2. Find your doPost(e) function
// 3. At the VERY TOP of doPost(e), paste the block below
//    (before your existing order-handling code)
// 4. Save → Deploy → Manage deployments → Edit → New version → Deploy
// ============================================================

function doPost(e) {
  const data = JSON.parse(e.postData.contents);

  // ── Handle Contact Form submissions ──────────────────────
  if (data.action === 'contact') {
    const recipient = 'kalamhub57@gmail.com';

    const subject = `[Kalam Hub Contact] ${data.subject}`;

    const body =
      `New message from Kalam Hub Contact Form\n\n` +
      `Name    : ${data.name}\n` +
      `Email   : ${data.email}\n` +
      `Subject : ${data.subject}\n` +
      `Time    : ${data.timestamp}\n\n` +
      `Message:\n${data.message}\n`;

    MailApp.sendEmail({
      to      : recipient,
      replyTo : data.email,
      subject : subject,
      body    : body
    });

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // ── ⬇️ YOUR EXISTING ORDER / STOCK / ADMIN CODE GOES HERE ⬇️ ──
  // (keep everything that was already in your doPost function below this point)

}
