/* ===========================
   WishMate - App Logic
   =========================== */

/* ===== Utility Helpers ===== */
function formatDateDisplay(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateInput(dateStr) {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDaysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diffTime = target - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getOccasionIcon(occasion) {
  const icons = {
    'Birthday': 'bi-balloon-fill',
    'Anniversary': 'bi-heart-fill',
    'Wedding Day': 'bi-gem',
    'Festival': 'bi-stars',
    'Custom': 'bi-bookmark-star-fill'
  };
  return icons[occasion] || 'bi-calendar-event';
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ============================================================
   DASHBOARD PAGE
   ============================================================ */
let allReminders = [];
let reminderToDelete = null;

async function initDashboard() {
  const user = getUser();
  const welcomeHeading = document.getElementById('welcomeHeading');
  if (welcomeHeading && user) {
    welcomeHeading.innerHTML = `Welcome back, ${escapeHtml(user.name)}! <i class="bi bi-emoji-smile-fill text-gradient"></i>`;
  }

  const loadingSpinner = document.getElementById('loadingSpinner');
  const remindersContainer = document.getElementById('remindersContainer');
  const emptyState = document.getElementById('emptyState');

  try {
    const res = await ReminderAPI.getAll();
    allReminders = res.reminders || [];

    loadingSpinner.classList.add('d-none');

    // Stats
    const total = allReminders.length;
    const oneWeekFromNow = 7;
    const upcomingThisWeek = allReminders.filter(r => {
      const days = getDaysUntil(r.date);
      return days >= 0 && days <= oneWeekFromNow;
    }).length;
    const completed = allReminders.filter(r => r.status === 'Completed').length;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statWeek').textContent = upcomingThisWeek;
    document.getElementById('statCompleted').textContent = completed;

    try {
      const giftRes = await GiftAPI.getAll();
      document.getElementById('statGifts').textContent = (giftRes.gifts || []).length;
    } catch (e) {
      document.getElementById('statGifts').textContent = '0';
    }

    // Sort by nearest date first
    const sortedReminders = [...allReminders].sort((a, b) => new Date(a.date) - new Date(b.date));

    if (sortedReminders.length === 0) {
      emptyState.classList.remove('d-none');
    } else {
      renderReminderCards(sortedReminders);
    }
  } catch (error) {
    loadingSpinner.classList.add('d-none');
    showToast(error.message, 'error');
  }
}

function renderReminderCards(reminders) {
  const container = document.getElementById('remindersContainer');
  container.innerHTML = reminders.map(r => {
    const days = getDaysUntil(r.date);
    let countdownText = '';
    if (days < 0) countdownText = 'Past';
    else if (days === 0) countdownText = 'Today!';
    else if (days === 1) countdownText = 'Tomorrow';
    else countdownText = `${days} days left`;

    const occasionLabel = r.occasion === 'Custom' && r.customOccasion ? r.customOccasion : r.occasion;

    return `
      <div class="col-md-6 col-lg-4">
        <div class="reminder-card fade-in-up h-100">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <i class="bi ${getOccasionIcon(r.occasion)} text-gradient me-1"></i>
              <span class="fw-semibold">${escapeHtml(occasionLabel)}</span>
            </div>
            <span class="countdown-badge">${countdownText}</span>
          </div>
          <h5 class="mb-1">${escapeHtml(r.personName)}</h5>
          <p class="text-muted small mb-2">${escapeHtml(r.relationship)} &bull; ${formatDateDisplay(r.date)}</p>
          ${r.notes ? `<p class="small text-muted mb-2"><i class="bi bi-sticky me-1"></i>${escapeHtml(r.notes)}</p>` : ''}
          <div class="d-flex gap-2 mt-3 flex-wrap">
            <button class="btn btn-sm btn-outline-gradient" onclick="editReminder('${r._id}')"><i class="bi bi-pencil"></i> Edit</button>
            <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteReminder('${r._id}')"><i class="bi bi-trash"></i> Delete</button>
            ${r.giftHelp ? `<a href="gift-help.html" class="btn btn-sm btn-gradient"><i class="bi bi-box2-heart"></i> Gift Help</a>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function editReminder(id) {
  window.location.href = `add-reminder.html?id=${id}`;
}

function confirmDeleteReminder(id) {
  reminderToDelete = id;
  const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
  modal.show();
}

document.addEventListener('click', async (e) => {
  if (e.target && e.target.id === 'confirmDeleteBtn') {
    if (!reminderToDelete) return;
    try {
      await ReminderAPI.delete(reminderToDelete);
      showToast('Reminder deleted successfully', 'success');
      bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal')).hide();
      setTimeout(() => initDashboard(), 500);
    } catch (error) {
      showToast(error.message, 'error');
    }
  }
});

document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'enableNotifBtn') {
    const modal = new bootstrap.Modal(document.getElementById('demoNotifModal'));
    modal.show();
  }
});

/* ============================================================
   ADD / EDIT REMINDER PAGE
   ============================================================ */
function initAddReminderPage() {
  const occasionSelect = document.getElementById('occasion');
  const customWrapper = document.getElementById('customOccasionWrapper');
  const customInput = document.getElementById('customOccasion');

  occasionSelect.addEventListener('change', () => {
    if (occasionSelect.value === 'Custom') {
      customWrapper.classList.remove('d-none');
      customInput.setAttribute('required', 'required');
    } else {
      customWrapper.classList.add('d-none');
      customInput.removeAttribute('required');
    }
  });

  // Check if editing
  const params = new URLSearchParams(window.location.search);
  const editId = params.get('id');

  if (editId) {
    document.getElementById('formTitle').innerHTML = '<i class="bi bi-pencil-square text-gradient me-2"></i>Edit Reminder';
    document.getElementById('saveBtnText').innerHTML = '<i class="bi bi-check-circle me-2"></i>Update Reminder';
    loadReminderForEdit(editId);
  }

  const form = document.getElementById('reminderForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertBox = document.getElementById('reminder-alert');
    alertBox.classList.add('d-none');

    if (!form.checkValidity()) {
      e.stopPropagation();
      form.classList.add('was-validated');
      return;
    }

    const methods = Array.from(document.querySelectorAll('.reminder-method:checked')).map(cb => cb.value);
    if (methods.length === 0) {
      alertBox.textContent = 'Please select at least one reminder method.';
      alertBox.classList.remove('d-none');
      return;
    }

    const reminderData = {
      personName: document.getElementById('personName').value.trim(),
      relationship: document.getElementById('relationship').value.trim(),
      occasion: document.getElementById('occasion').value,
      customOccasion: document.getElementById('customOccasion').value.trim(),
      date: document.getElementById('date').value,
      time: document.getElementById('time').value,
      reminderBefore: document.getElementById('reminderBefore').value,
      reminderMethods: methods,
      giftHelp: document.getElementById('giftHelp').checked,
      notes: document.getElementById('notes').value.trim()
    };

    const saveBtn = document.getElementById('saveReminderBtn');
    const saveBtnText = document.getElementById('saveBtnText');
    const saveSpinner = document.getElementById('saveSpinner');

    saveBtn.disabled = true;
    saveBtnText.classList.add('d-none');
    saveSpinner.classList.remove('d-none');

    try {
      const id = document.getElementById('reminderId').value;
      if (id) {
        await ReminderAPI.update(id, reminderData);
        showToast('Reminder updated successfully!', 'success');
      } else {
        await ReminderAPI.create(reminderData);
        showToast('Reminder added successfully!', 'success');

        // Trigger demo communication logs for selected methods (other than App)
        for (const method of methods) {
          if (method === 'SMS Demo') {
            CommunicationAPI.sendSms({ recipientName: reminderData.personName }).catch(() => {});
          } else if (method === 'WhatsApp Demo') {
            CommunicationAPI.sendWhatsapp({ recipientName: reminderData.personName }).catch(() => {});
          } else if (method === 'Call Demo') {
            CommunicationAPI.createCallRequest({ recipientName: reminderData.personName }).catch(() => {});
          }
        }
      }
      setTimeout(() => window.location.href = 'dashboard.html', 800);
    } catch (error) {
      alertBox.textContent = error.message;
      alertBox.classList.remove('d-none');
      saveBtn.disabled = false;
      saveBtnText.classList.remove('d-none');
      saveSpinner.classList.add('d-none');
    }
  });
}

async function loadReminderForEdit(id) {
  try {
    const res = await ReminderAPI.getById(id);
    const r = res.reminder;

    document.getElementById('reminderId').value = r._id;
    document.getElementById('personName').value = r.personName;
    document.getElementById('relationship').value = r.relationship;
    document.getElementById('occasion').value = r.occasion;

    if (r.occasion === 'Custom') {
      document.getElementById('customOccasionWrapper').classList.remove('d-none');
      document.getElementById('customOccasion').value = r.customOccasion;
    }

    document.getElementById('date').value = formatDateInput(r.date);
    document.getElementById('time').value = r.time || '09:00';
    document.getElementById('reminderBefore').value = r.reminderBefore;
    document.getElementById('giftHelp').checked = r.giftHelp;
    document.getElementById('notes').value = r.notes || '';

    document.querySelectorAll('.reminder-method').forEach(cb => {
      cb.checked = r.reminderMethods.includes(cb.value);
    });
  } catch (error) {
    showToast(error.message, 'error');
  }
}

/* ============================================================
   CALENDAR PAGE
   ============================================================ */
let calendarCurrentDate = new Date();
let calendarReminders = [];

async function initCalendarPage() {
  const loadingSpinner = document.getElementById('loadingSpinner');
  const calendarWrapper = document.getElementById('calendarWrapper');

  try {
    const res = await ReminderAPI.getAll();
    calendarReminders = res.reminders || [];
    loadingSpinner.classList.add('d-none');
    calendarWrapper.classList.remove('d-none');
    renderCalendar();
  } catch (error) {
    loadingSpinner.classList.add('d-none');
    showToast(error.message, 'error');
  }

  document.getElementById('prevMonthBtn').addEventListener('click', () => {
    calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() - 1);
    renderCalendar();
  });

  document.getElementById('nextMonthBtn').addEventListener('click', () => {
    calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() + 1);
    renderCalendar();
  });
}

function renderCalendar() {
  const year = calendarCurrentDate.getFullYear();
  const month = calendarCurrentDate.getMonth();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  document.getElementById('calendarMonthLabel').textContent = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  // Group reminders by day of this month
  const remindersByDay = {};
  calendarReminders.forEach(r => {
    const rDate = new Date(r.date);
    if (rDate.getFullYear() === year && rDate.getMonth() === month) {
      const day = rDate.getDate();
      if (!remindersByDay[day]) remindersByDay[day] = [];
      remindersByDay[day].push(r);
    }
  });

  let html = '';

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    html += `<div class="calendar-cell empty"></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const hasEvent = remindersByDay[day] && remindersByDay[day].length > 0;
    const isToday = isCurrentMonth && today.getDate() === day;

    html += `
      <div class="calendar-cell ${hasEvent ? 'has-event' : ''} ${isToday ? 'today' : ''}" ${hasEvent ? `onclick="showDayDetail(${day}, ${year}, ${month})"` : ''}>
        <div class="day-num">${day}</div>
        ${hasEvent ? `<div class="mt-1">${remindersByDay[day].map(() => '<span class="calendar-event-dot"></span>').join('')}</div>` : ''}
      </div>
    `;
  }

  document.getElementById('calendarGrid').innerHTML = html;
  window._calendarRemindersByDay = remindersByDay;
}

function showDayDetail(day, year, month) {
  const remindersByDay = window._calendarRemindersByDay;
  const reminders = remindersByDay[day] || [];

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  document.getElementById('dayDetailTitle').textContent = `${monthNames[month]} ${day}, ${year}`;

  const body = document.getElementById('dayDetailBody');
  body.innerHTML = reminders.map(r => {
    const occasionLabel = r.occasion === 'Custom' && r.customOccasion ? r.customOccasion : r.occasion;
    return `
      <div class="reminder-card mb-2">
        <div class="d-flex align-items-center mb-1">
          <i class="bi ${getOccasionIcon(r.occasion)} text-gradient me-2"></i>
          <h6 class="mb-0">${escapeHtml(r.personName)}</h6>
        </div>
        <p class="small text-muted mb-1">${escapeHtml(occasionLabel)} &bull; ${escapeHtml(r.relationship)}</p>
        ${r.notes ? `<p class="small mb-0">${escapeHtml(r.notes)}</p>` : ''}
      </div>
    `;
  }).join('');

  const modal = new bootstrap.Modal(document.getElementById('dayDetailModal'));
  modal.show();
}

/* ============================================================
   WISH TEMPLATES PAGE
   ============================================================ */
const wishTemplatesData = {
  Birthday: [
    "Happy Birthday! Wishing you a day filled with love, laughter, and all your favorite things. May this new year of your life bring you endless joy and success.",
    "Another year older, another year wiser, and another year more amazing! Happy Birthday to someone truly special.",
    "May your birthday be the start of a year filled with good luck, good health, and much happiness. Have a fantastic day!",
    "Wishing you a wonderful birthday filled with sweet moments, great food, and the people you love most. Cheers to you!",
    "Happy Birthday! May all your dreams and wishes come true this year. Enjoy your special day to the fullest!",
    "On your special day, I wish you all the happiness your heart can hold. Happy Birthday, have an amazing celebration!"
  ],
  Anniversary: [
    "Happy Anniversary! Wishing you both many more years of love, laughter, and beautiful memories together.",
    "Congratulations on another year of love and togetherness. May your bond grow stronger with each passing year.",
    "Happy Anniversary to a couple who continues to inspire everyone around them with their beautiful relationship.",
    "Cheers to love that grows stronger every year! Wishing you both a very Happy Anniversary filled with joy.",
    "May your love story continue to be one for the ages. Happy Anniversary — here's to many more wonderful years!",
    "Wishing you a beautiful anniversary celebration and many more years of happiness together."
  ],
  Wedding: [
    "Wishing you a lifetime of love, laughter, and happiness as you begin this beautiful journey together. Congratulations!",
    "May your wedding day be the beginning of a wonderful life filled with love and adventure. Congratulations to the happy couple!",
    "Heartiest congratulations on your wedding! May your married life be filled with endless love and joy.",
    "Two hearts, one beautiful journey ahead. Congratulations on your wedding and best wishes for a joyful married life!",
    "Wishing you both a marriage filled with love, trust, and togetherness. Congratulations on your special day!",
    "May your wedding day mark the start of a lifetime of happiness. Congratulations and best wishes always!"
  ],
  Festival: [
    "Wishing you and your family a joyous festival filled with happiness, prosperity, and togetherness!",
    "May this festive season bring brightness and happiness in your life and may your life be filled with fun, fortune and frolic.",
    "Sending you warm wishes on this festival. May it bring peace, prosperity, and good health to you and your loved ones.",
    "Wishing you all the joys of the season — happiness, harmony, and good fortune. Happy Festival!",
    "May the spirit of this festival fill your home with happiness and your heart with love. Wishing you a wonderful celebration!",
    "Here's wishing you a festival full of sweet moments, bright lights, and cherished memories with family."
  ],
  Custom: [
    "Wishing you all the happiness and success on this special occasion. Congratulations and best wishes!",
    "May this special day bring you joy, peace, and wonderful memories to cherish forever.",
    "Sending you warm wishes and lots of love on this memorable occasion. Congratulations!",
    "Here's to celebrating you and this special moment. Wishing you nothing but happiness ahead!",
    "May this occasion be filled with love, laughter, and beautiful moments worth remembering.",
    "Congratulations on this special milestone! Wishing you continued success and happiness."
  ]
};

let currentTemplateCategory = 'Birthday';

function initWishTemplatesPage() {
  renderTemplates(currentTemplateCategory);

  document.querySelectorAll('#templateTabs .nav-link').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#templateTabs .nav-link').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTemplateCategory = btn.dataset.category;
      renderTemplates(currentTemplateCategory);
    });
  });
}

function renderTemplates(category) {
  const templates = wishTemplatesData[category] || [];
  const container = document.getElementById('templatesContainer');

  container.innerHTML = templates.map((text, idx) => `
    <div class="col-md-6 col-lg-4">
      <div class="template-card fade-in-up">
        <div>
          <i class="bi bi-quote text-gradient mb-2" style="font-size: 1.5rem;"></i>
          <p class="template-text">${escapeHtml(text)}</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-gradient flex-fill" onclick="copyTemplate(${idx}, '${category}')">
            <i class="bi bi-clipboard me-1"></i>Copy
          </button>
          <a href="add-reminder.html" class="btn btn-sm btn-gradient flex-fill">
            <i class="bi bi-calendar-plus me-1"></i>Use for Reminder
          </a>
        </div>
      </div>
    </div>
  `).join('');
}

function copyTemplate(idx, category) {
  const text = wishTemplatesData[category][idx];
  navigator.clipboard.writeText(text).then(() => {
    showToast('Wish template copied to clipboard!', 'success');
  }).catch(() => {
    showToast('Unable to copy. Please copy manually.', 'error');
  });
}

/* ============================================================
   GIFT HELP PAGE
   ============================================================ */
function initGiftHelpPage() {
  const user = getUser();
  if (user) {
    document.getElementById('customerName').value = user.name;
  }

  const form = document.getElementById('giftForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertBox = document.getElementById('gift-alert');
    alertBox.classList.add('d-none');

    if (!form.checkValidity()) {
      e.stopPropagation();
      form.classList.add('was-validated');
      return;
    }

    const giftData = {
      customerName: document.getElementById('customerName').value.trim(),
      recipientName: document.getElementById('recipientName').value.trim(),
      occasion: document.getElementById('occasion').value.trim(),
      occasionDate: document.getElementById('occasionDate').value,
      budget: document.getElementById('budget').value,
      giftCategory: document.getElementById('giftCategory').value,
      deliveryAddress: document.getElementById('deliveryAddress').value.trim(),
      phoneNumber: document.getElementById('phoneNumber').value.trim(),
      notes: document.getElementById('notes').value.trim()
    };

    const btn = document.getElementById('giftSubmitBtn');
    const btnText = document.getElementById('giftBtnText');
    const spinner = document.getElementById('giftSpinner');

    btn.disabled = true;
    btnText.classList.add('d-none');
    spinner.classList.remove('d-none');

    try {
      await GiftAPI.create(giftData);
      const modal = new bootstrap.Modal(document.getElementById('giftSuccessModal'));
      modal.show();
      form.reset();
      form.classList.remove('was-validated');
      if (user) document.getElementById('customerName').value = user.name;
    } catch (error) {
      alertBox.textContent = error.message;
      alertBox.classList.remove('d-none');
    } finally {
      btn.disabled = false;
      btnText.classList.remove('d-none');
      spinner.classList.add('d-none');
    }
  });
}

/* ============================================================
   PAYMENT PAGE
   ============================================================ */
const ORDER_AMOUNT = 1049;
let selectedPaymentMethod = 'UPI';

function initPaymentPage() {
  document.querySelectorAll('#paymentTabs .nav-link').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#paymentTabs .nav-link').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedPaymentMethod = btn.dataset.method;

      document.querySelectorAll('.payment-method-form').forEach(f => f.classList.add('d-none'));
      document.querySelector(`.payment-method-form[data-method-form="${selectedPaymentMethod}"]`).classList.remove('d-none');
    });
  });

  document.getElementById('payNowBtn').addEventListener('click', async () => {
    const btn = document.getElementById('payNowBtn');
    const btnText = document.getElementById('payBtnText');
    const spinner = document.getElementById('paySpinner');

    btn.disabled = true;
    btnText.classList.add('d-none');
    spinner.classList.remove('d-none');

    try {
      const res = await PaymentAPI.createDemo({
        amount: ORDER_AMOUNT,
        paymentMethod: selectedPaymentMethod
      });

      document.getElementById('successOrderId').textContent = res.payment.orderId;
      const modal = new bootstrap.Modal(document.getElementById('paymentSuccessModal'));
      modal.show();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      btn.disabled = false;
      btnText.classList.remove('d-none');
      spinner.classList.add('d-none');
    }
  });
}

/* ============================================================
   ADMIN PAGE
   ============================================================ */
let adminGiftsData = [];

function initAdminPage() {
  loadAdminOverview();

  // Sidebar navigation
  document.querySelectorAll('.admin-sidebar .nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.dataset.section;
      switchAdminSection(section);
      document.querySelectorAll('.admin-sidebar .nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      document.getElementById('mobileSectionSelect').value = section;
    });
  });

  document.getElementById('mobileSectionSelect').addEventListener('change', (e) => {
    switchAdminSection(e.target.value);
    document.querySelectorAll('.admin-sidebar .nav-link').forEach(l => {
      l.classList.toggle('active', l.dataset.section === e.target.value);
    });
  });

  // Gift search/filter
  document.getElementById('giftSearchInput').addEventListener('input', renderGiftsTable);
  document.getElementById('giftStatusFilter').addEventListener('change', renderGiftsTable);
  document.getElementById('exportGiftsCsvBtn').addEventListener('click', exportGiftsCsv);
}

function switchAdminSection(section) {
  document.querySelectorAll('.admin-section').forEach(s => s.classList.add('d-none'));
  document.getElementById(`section-${section}`).classList.remove('d-none');

  if (section === 'users') loadAdminUsers();
  if (section === 'reminders') loadAdminReminders();
  if (section === 'gifts') loadAdminGifts();
  if (section === 'payments') loadAdminPayments();
  if (section === 'communications') loadAdminCommunications();
}

async function loadAdminOverview() {
  try {
    const res = await AdminAPI.getDashboard();
    const stats = res.stats;
    document.getElementById('adminStatUsers').textContent = stats.totalUsers;
    document.getElementById('adminStatReminders').textContent = stats.totalReminders;
    document.getElementById('adminStatGifts').textContent = stats.totalGiftRequests;
    document.getElementById('adminStatRevenue').textContent = `₹${stats.totalRevenue.toLocaleString('en-IN')}`;
    document.getElementById('adminStatNewLeads').textContent = stats.newGiftLeads;
    document.getElementById('adminStatComms').textContent = stats.totalCommunications;
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function loadAdminUsers() {
  try {
    const res = await AdminAPI.getUsers();
    const users = res.users || [];
    const tbody = document.getElementById('usersTableBody');
    const empty = document.getElementById('usersEmpty');

    if (users.length === 0) {
      tbody.innerHTML = '';
      empty.classList.remove('d-none');
      return;
    }
    empty.classList.add('d-none');

    tbody.innerHTML = users.map(u => `
      <tr>
        <td>${escapeHtml(u.name)}</td>
        <td>${escapeHtml(u.email)}</td>
        <td><span class="badge-status ${u.role === 'admin' ? 'badge-ordered' : 'badge-new'}">${u.role}</span></td>
        <td>${formatDateDisplay(u.createdAt)}</td>
      </tr>
    `).join('');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function loadAdminReminders() {
  try {
    const res = await AdminAPI.getReminders();
    const reminders = res.reminders || [];
    const tbody = document.getElementById('remindersTableBody');
    const empty = document.getElementById('remindersEmpty');

    if (reminders.length === 0) {
      tbody.innerHTML = '';
      empty.classList.remove('d-none');
      return;
    }
    empty.classList.add('d-none');

    tbody.innerHTML = reminders.map(r => `
      <tr>
        <td>${r.user ? escapeHtml(r.user.name) : 'N/A'}</td>
        <td>${escapeHtml(r.personName)}</td>
        <td>${escapeHtml(r.occasion === 'Custom' ? r.customOccasion : r.occasion)}</td>
        <td>${formatDateDisplay(r.date)}</td>
        <td><span class="badge-status ${r.status === 'Completed' ? 'badge-closed' : 'badge-new'}">${r.status}</span></td>
      </tr>
    `).join('');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function loadAdminGifts() {
  try {
    const res = await AdminAPI.getGifts();
    adminGiftsData = res.gifts || [];
    renderGiftsTable();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function renderGiftsTable() {
  const searchTerm = document.getElementById('giftSearchInput').value.toLowerCase();
  const statusFilter = document.getElementById('giftStatusFilter').value;

  let filtered = adminGiftsData.filter(g => {
    const matchesSearch = g.customerName.toLowerCase().includes(searchTerm) || g.recipientName.toLowerCase().includes(searchTerm);
    const matchesStatus = !statusFilter || g.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const tbody = document.getElementById('giftsTableBody');
  const empty = document.getElementById('giftsEmpty');

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    empty.classList.remove('d-none');
    return;
  }
  empty.classList.add('d-none');

  const statusBadgeClass = {
    'New': 'badge-new',
    'Contacted': 'badge-contacted',
    'Ordered': 'badge-ordered',
    'Closed': 'badge-closed'
  };

  tbody.innerHTML = filtered.map(g => `
    <tr>
      <td>${escapeHtml(g.customerName)}</td>
      <td>${escapeHtml(g.recipientName)}</td>
      <td>${escapeHtml(g.occasion)}</td>
      <td>${escapeHtml(g.budget)}</td>
      <td>${escapeHtml(g.giftCategory)}</td>
      <td>${escapeHtml(g.phoneNumber)}</td>
      <td>
        <select class="form-select form-select-sm badge-status ${statusBadgeClass[g.status]}" style="border:none;" onchange="updateGiftLeadStatus('${g._id}', this.value)">
          <option value="New" ${g.status === 'New' ? 'selected' : ''}>New</option>
          <option value="Contacted" ${g.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
          <option value="Ordered" ${g.status === 'Ordered' ? 'selected' : ''}>Ordered</option>
          <option value="Closed" ${g.status === 'Closed' ? 'selected' : ''}>Closed</option>
        </select>
      </td>
      <td>
        <button class="btn btn-sm btn-outline-gradient" onclick="callCustomerDemo('${escapeHtml(g.customerName)}')"><i class="bi bi-telephone-fill"></i></button>
      </td>
    </tr>
  `).join('');
}

async function updateGiftLeadStatus(id, status) {
  try {
    await GiftAPI.updateStatus(id, status);
    showToast('Gift lead status updated', 'success');
    const gift = adminGiftsData.find(g => g._id === id);
    if (gift) gift.status = status;
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function callCustomerDemo(name) {
  document.getElementById('callCustomerName').textContent = name;
  CommunicationAPI.createCallRequest({ recipientName: name }).catch(() => {});
  const modal = new bootstrap.Modal(document.getElementById('callCustomerModal'));
  modal.show();
}

function exportGiftsCsv() {
  if (adminGiftsData.length === 0) {
    showToast('No gift leads to export', 'error');
    return;
  }

  const headers = ['Customer Name', 'Recipient Name', 'Occasion', 'Occasion Date', 'Budget', 'Gift Category', 'Delivery Address', 'Phone Number', 'Status'];
  const rows = adminGiftsData.map(g => [
    g.customerName, g.recipientName, g.occasion, formatDateDisplay(g.occasionDate),
    g.budget, g.giftCategory, g.deliveryAddress.replace(/,/g, ';'), g.phoneNumber, g.status
  ]);

  let csvContent = headers.join(',') + '\n';
  rows.forEach(row => {
    csvContent += row.map(val => `"${val}"`).join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `wishmate-gift-leads-${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('Gift leads exported successfully', 'success');
}

async function loadAdminPayments() {
  try {
    const res = await AdminAPI.getPayments();
    const payments = res.payments || [];
    const tbody = document.getElementById('paymentsTableBody');
    const empty = document.getElementById('paymentsEmpty');

    if (payments.length === 0) {
      tbody.innerHTML = '';
      empty.classList.remove('d-none');
      return;
    }
    empty.classList.add('d-none');

    tbody.innerHTML = payments.map(p => `
      <tr>
        <td>${escapeHtml(p.orderId)}</td>
        <td>${p.user ? escapeHtml(p.user.name) : 'N/A'}</td>
        <td>₹${p.amount.toLocaleString('en-IN')}</td>
        <td>${escapeHtml(p.paymentMethod)}</td>
        <td><span class="badge-status badge-closed">${escapeHtml(p.status)}</span></td>
        <td>${formatDateDisplay(p.createdAt)}</td>
      </tr>
    `).join('');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function loadAdminCommunications() {
  try {
    const res = await AdminAPI.getCommunications();
    const comms = res.communications || [];
    const tbody = document.getElementById('communicationsTableBody');
    const empty = document.getElementById('communicationsEmpty');

    if (comms.length === 0) {
      tbody.innerHTML = '';
      empty.classList.remove('d-none');
      return;
    }
    empty.classList.add('d-none');

    tbody.innerHTML = comms.map(c => `
      <tr>
        <td>${c.user ? escapeHtml(c.user.name) : 'N/A'}</td>
        <td>${escapeHtml(c.recipientName)}</td>
        <td>${escapeHtml(c.communicationType)}</td>
        <td>${escapeHtml(c.message)}</td>
        <td><span class="badge-status badge-contacted">${escapeHtml(c.status)}</span></td>
        <td>${formatDateDisplay(c.createdAt)}</td>
      </tr>
    `).join('');
  } catch (error) {
    showToast(error.message, 'error');
  }
}
