// ==========================================
// Kalam Hub API Service
// ==========================================

// Replace with your deployed Apps Script URL
const WEB_APP_URL =
'https://script.google.com/macros/s/AKfycbwVpo-g5IOPpifC6FUx9h4ysxcc6ZF2nvfwZsSWpuXbRlq3uQIAsIhcTVzWYuGzCLbIvA/exec';

// ==========================================
// Generic GET Request
// ==========================================

async function apiGet(action, params = {}) {

  try {

    const query =
      new URLSearchParams({
        action,
        ...params
      });

    const response =
      await fetch(
        `${WEB_APP_URL}?${query}`
      );

    return await response.json();

  } catch (error) {

    console.error(
      'API GET Error:',
      error
    );

    return {
      success: false,
      message: error.message
    };
  }
}

// ==========================================
// Generic POST Request
// ==========================================

async function apiPost(data = {}) {

  try {

    const response =
      await fetch(
        WEB_APP_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type':
            'application/json'
          },
          body: JSON.stringify(data)
        }
      );

    return await response.json();

  } catch (error) {

    console.error(
      'API POST Error:',
      error
    );

    return {
      success: false,
      message: error.message
    };
  }
}

// ==========================================
// Admin Login
// ==========================================

async function verifyAdmin(
  username,
  password
) {

  return await apiGet(
    'verifyAdmin',
    {
      user: username,
      pass: password
    }
  );
}

// ==========================================
// Get All Orders
// ==========================================

async function getOrders() {

  return await apiGet(
    'getOrders'
  );

}

// ==========================================
// Update Order Status
// ==========================================

async function updateOrderStatus(
  orderId,
  status
) {

  return await apiGet(
    'updateStatus',
    {
      orderId,
      status
    }
  );

}

// ==========================================
// Get Dashboard Stats
// ==========================================

async function getDashboardStats() {

  return await apiGet(
    'dashboardStats'
  );

}

// ==========================================
// Future Features
// ==========================================

// Stock Management

async function getStock() {

  return await apiGet(
    'getStock'
  );

}

async function updateStock(
  componentId,
  quantity
) {

  return await apiGet(
    'updateStock',
    {
      componentId,
      quantity
    }
  );

}

// Price Management

async function getPrices() {

  return await apiGet(
    'getPrices'
  );

}

async function updatePrice(
  componentId,
  price
) {

  return await apiGet(
    'updatePrice',
    {
      componentId,
      price
    }
  );

}

// Component Management

async function addComponent(
  componentData
) {

  return await apiPost({
    action: 'addComponent',
    ...componentData
  });

}

async function deleteComponent(
  componentId
) {

  return await apiGet(
    'deleteComponent',
    {
      componentId
    }
  );

}