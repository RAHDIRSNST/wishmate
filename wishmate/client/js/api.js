/* ===========================
   WishMate - API Helper
   =========================== */

// Change this if your backend runs on a different host/port
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Generic API request handler with JWT Bearer auth
 * @param {string} endpoint - e.g. '/auth/login'
 * @param {string} method - GET, POST, PUT, DELETE
 * @param {object|null} body - request body
 * @param {boolean} useAuth - whether to attach Bearer token
 */
async function apiRequest(endpoint, method = 'GET', body = null, useAuth = true) {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (useAuth) {
    const token = localStorage.getItem('wishmate_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config = {
    method,
    headers
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong. Please try again.');
    }

    return data;
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to server. Please check your connection and try again.');
    }
    throw error;
  }
}

/* ===== Auth API ===== */
const AuthAPI = {
  signup: (data) => apiRequest('/auth/signup', 'POST', data, false),
  login: (data) => apiRequest('/auth/login', 'POST', data, false),
  getProfile: () => apiRequest('/auth/profile', 'GET')
};

/* ===== Reminder API ===== */
const ReminderAPI = {
  getAll: () => apiRequest('/reminders', 'GET'),
  getById: (id) => apiRequest(`/reminders/${id}`, 'GET'),
  create: (data) => apiRequest('/reminders', 'POST', data),
  update: (id, data) => apiRequest(`/reminders/${id}`, 'PUT', data),
  delete: (id) => apiRequest(`/reminders/${id}`, 'DELETE')
};

/* ===== Gift API ===== */
const GiftAPI = {
  getAll: () => apiRequest('/gifts', 'GET'),
  create: (data) => apiRequest('/gifts', 'POST', data),
  updateStatus: (id, status) => apiRequest(`/gifts/${id}/status`, 'PUT', { status })
};

/* ===== Payment API ===== */
const PaymentAPI = {
  createDemo: (data) => apiRequest('/payments/demo', 'POST', data),
  getAll: () => apiRequest('/payments', 'GET')
};

/* ===== Demo Communication API ===== */
const CommunicationAPI = {
  sendSms: (data) => apiRequest('/demo/send-sms', 'POST', data),
  sendWhatsapp: (data) => apiRequest('/demo/send-whatsapp', 'POST', data),
  createCallRequest: (data) => apiRequest('/demo/create-call-request', 'POST', data)
};

/* ===== Admin API ===== */
const AdminAPI = {
  getDashboard: () => apiRequest('/admin/dashboard', 'GET'),
  getUsers: () => apiRequest('/admin/users', 'GET'),
  getReminders: () => apiRequest('/admin/reminders', 'GET'),
  getGifts: () => apiRequest('/admin/gifts', 'GET'),
  getPayments: () => apiRequest('/admin/payments', 'GET'),
  getCommunications: () => apiRequest('/admin/communications', 'GET')
};
