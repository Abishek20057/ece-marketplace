// ==========================================
// Kalam Hub Admin Dashboard
// ==========================================

// Replace with your Apps Script URL
const WEB_APP_URL =
'https://script.google.com/macros/s/AKfycbwVpo-g5IOPpifC6FUx9h4ysxcc6ZF2nvfwZsSWpuXbRlq3uQIAsIhcTVzWYuGzCLbIvA/exec';

// Check Login
if (
  sessionStorage.getItem(
    'kalam_admin_logged_in'
  ) !== '1'
) {
  window.location.href =
    'admin-login.html';
}

// Logout
function logout() {

  sessionStorage.clear();

  window.location.href =
    'admin-login.html';
}

// Load Orders
async function loadOrders() {

  try {

    const response =
      await fetch(
        WEB_APP_URL +
        '?action=getOrders'
      );

    const orders =
      await response.json();

    renderOrders(orders);

  } catch (err) {

    console.error(
      'Load Orders Error:',
      err
    );

  }

}

// Render Dashboard Data
function renderOrders(orders) {

  let totalOrders = 0;
  let pendingOrders = 0;
  let verifiedOrders = 0;
  let rejectedOrders = 0;
  let revenue = 0;

  let html = '';

  orders.forEach(order => {

    totalOrders++;

    if (
      order.status ===
      'Pending Verification'
    ) {
      pendingOrders++;
    }

    if (
      order.status ===
      'Verified'
    ) {
      verifiedOrders++;

      revenue += Number(
        order.amount || 0
      );
    }

    if (
      order.status ===
      'Rejected'
    ) {
      rejectedOrders++;
    }

    html += `
      <tr>

        <td>${order.orderId}</td>

        <td>${order.name}</td>

        <td>${order.roll}</td>

        <td>${order.component}</td>

        <td>₹${order.amount}</td>

        <td>${order.utr}</td>

        <td>

          <span class="
            ${
              order.status === 'Verified'
                ? 'verified'
                : order.status === 'Rejected'
                ? 'rejected'
                : 'pending'
            }
          ">
            ${order.status}
          </span>

        </td>

        <td>

          <button
            class="verify-btn"
            onclick="
              updateStatus(
                '${order.orderId}',
                'Verified'
              )
            "
          >
            Verify
          </button>

          <button
            class="reject-btn"
            onclick="
              updateStatus(
                '${order.orderId}',
                'Rejected'
              )
            "
          >
            Reject
          </button>

        </td>

      </tr>
    `;

  });

  document.getElementById(
    'totalOrders'
  ).textContent =
    totalOrders;

  document.getElementById(
    'pendingOrders'
  ).textContent =
    pendingOrders;

  document.getElementById(
    'verifiedOrders'
  ).textContent =
    verifiedOrders;

  document.getElementById(
    'totalRevenue'
  ).textContent =
    '₹' + revenue;

  document.getElementById(
    'ordersTable'
  ).innerHTML =
    html;
}

// Verify / Reject Order
async function updateStatus(
  orderId,
  status
) {

  try {

    await fetch(
      WEB_APP_URL +
      '?action=updateStatus' +
      '&orderId=' +
      encodeURIComponent(orderId) +
      '&status=' +
      encodeURIComponent(status)
    );

   loadOrders();
loadInventory();

  } catch (err) {

    console.error(
      'Status Update Error:',
      err
    );

    alert(
      'Unable to update order status.'
    );

  }

}

// Refresh Every 30 Seconds
setInterval(
  loadOrders,
  30000
);

// Initial Load
loadOrders();
loadInventory();
// ==========================
// Inventory Management
// ==========================

async function loadInventory() {

  const response = await fetch(
    WEB_APP_URL + '?action=getInventory'
  );

  const items = await response.json();

  let html = '';

  items.forEach(item => {

    html += `
    <tr>

      <td>${item.name}</td>

      <td>${item.stock}</td>

      <td>
        <input
          id="temp_${item.id}"
          value="${item.tempPrice}"
        >
      </td>

      <td>
        <input
          id="perm_${item.id}"
          value="${item.permPrice}"
        >
      </td>

      <td>

        <button onclick="adjustStock(${item.id},1)">
          +
        </button>

        <button onclick="adjustStock(${item.id},-1)">
          -
        </button>

        <button onclick="saveItem(${item.id})">
          Save
        </button>

      </td>

    </tr>
    `;

  });

  document.getElementById(
    'inventoryTable'
  ).innerHTML = html;
}

async function adjustStock(id, delta) {

  await fetch(WEB_APP_URL,{
    method:'POST',
    body:JSON.stringify({
      action:'adjustStock',
      id:id,
      delta:delta
    })
  });

  loadInventory();
}

async function saveItem(id){

  const tempPrice =
    document.getElementById(
      'temp_' + id
    ).value;

  const permPrice =
    document.getElementById(
      'perm_' + id
    ).value;

  await fetch(WEB_APP_URL,{
    method:'POST',
    body:JSON.stringify({
      action:'updateStock',
      id:id,
      tempPrice:tempPrice,
      permPrice:permPrice
    })
  });

  alert('Saved');

  loadInventory();
}

async function changeStock(
  component,
  change
) {

  await fetch(
    WEB_APP_URL +
    '?action=adjustStock' +
    '&component=' +
    encodeURIComponent(component) +
    '&change=' +
    change
  );

  loadInventory();

}

async function saveComponent(
  component
) {

  const price =
    document.getElementById(
      `price-${component}`
    ).value;

  await fetch(
    WEB_APP_URL +
    '?action=updatePrice' +
    '&component=' +
    encodeURIComponent(component) +
    '&price=' +
    price
  );

  alert(
    'Updated Successfully'
  );

}

loadInventory();