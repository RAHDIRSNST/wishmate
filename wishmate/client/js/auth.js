/* ===========================
   WishMate - Auth Helper
   =========================== */

const TOKEN_KEY = 'wishmate_token';
const USER_KEY = 'wishmate_user';

/* ===== Token & User Storage ===== */
function setAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getUser() {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

function isLoggedIn() {
  return !!getToken();
}

function isAdmin() {
  const user = getUser();
  return user && user.role === 'admin';
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = 'login.html';
}

/* ===== Route Protection ===== */
function protectPage() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
  }
}

function protectAdminPage() {
  if (!isLoggedIn() || !isAdmin()) {
    window.location.href = 'login.html';
  }
}

function redirectIfLoggedIn() {
  if (isLoggedIn()) {
    window.location.href = isAdmin() ? 'admin.html' : 'dashboard.html';
  }
}

/* ===== Navbar Rendering ===== */
function renderNavbar(activePage = '') {
  const navContainer = document.getElementById('wm-navbar-container');
  if (!navContainer) return;

  const loggedIn = isLoggedIn();
  const admin = isAdmin();
  const user = getUser();

  let navLinks = '';

  if (!loggedIn) {
    navLinks = `
      <li class="nav-item"><a class="nav-link ${activePage === 'home' ? 'active' : ''}" href="index.html">Home</a></li>
      <li class="nav-item"><a class="nav-link ${activePage === 'login' ? 'active' : ''}" href="login.html">Login</a></li>
      <li class="nav-item"><a class="btn btn-gradient btn-sm ms-lg-2" href="signup.html">Sign Up</a></li>
    `;
  } else if (admin) {
    navLinks = `
      <li class="nav-item"><a class="nav-link ${activePage === 'dashboard' ? 'active' : ''}" href="dashboard.html">Dashboard</a></li>
      <li class="nav-item"><a class="nav-link ${activePage === 'admin' ? 'active' : ''}" href="admin.html">Admin</a></li>
      <li class="nav-item"><a class="nav-link cursor-pointer" href="#" onclick="logout(); return false;">Logout</a></li>
    `;
  } else {
    navLinks = `
      <li class="nav-item"><a class="nav-link ${activePage === 'dashboard' ? 'active' : ''}" href="dashboard.html">Dashboard</a></li>
      <li class="nav-item"><a class="nav-link ${activePage === 'add-reminder' ? 'active' : ''}" href="add-reminder.html">Add Reminder</a></li>
      <li class="nav-item"><a class="nav-link ${activePage === 'calendar' ? 'active' : ''}" href="calendar.html">Calendar</a></li>
      <li class="nav-item"><a class="nav-link ${activePage === 'wish-templates' ? 'active' : ''}" href="wish-templates.html">Wish Templates</a></li>
      <li class="nav-item"><a class="nav-link ${activePage === 'gift-help' ? 'active' : ''}" href="gift-help.html">Gift Help</a></li>
      <li class="nav-item"><a class="nav-link cursor-pointer" href="#" onclick="logout(); return false;">Logout</a></li>
    `;
  }

  navContainer.innerHTML = `
    <nav class="navbar navbar-expand-lg wm-navbar fixed-top">
      <div class="container">
        <a class="navbar-brand" href="${loggedIn ? (admin ? 'admin.html' : 'dashboard.html') : 'index.html'}">
          <i class="bi bi-gift-fill me-1"></i>WishMate
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#wmNavMenu">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="wmNavMenu">
          <ul class="navbar-nav ms-auto align-items-lg-center">
            ${navLinks}
          </ul>
        </div>
      </div>
    </nav>
  `;
}

/* ===== Toast Notification Helper ===== */
function showToast(message, type = 'success') {
  let toastContainer = document.getElementById('wm-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'wm-toast-container';
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(toastContainer);
  }

  const icon = type === 'success' ? 'bi-check-circle-fill' : (type === 'error' ? 'bi-x-circle-fill' : 'bi-info-circle-fill');
  const bg = type === 'success' ? 'text-bg-success' : (type === 'error' ? 'text-bg-danger' : 'text-bg-primary');

  const toastId = 'toast-' + Date.now();
  const toastHTML = `
    <div id="${toastId}" class="toast align-items-center ${bg} border-0" role="alert">
      <div class="d-flex">
        <div class="toast-body">
          <i class="bi ${icon} me-2"></i>${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>
  `;

  toastContainer.insertAdjacentHTML('beforeend', toastHTML);
  const toastEl = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastEl, { delay: 3500 });
  toast.show();

  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}
