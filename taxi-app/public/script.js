/**
 * ================================================================
 * GHARDAIA TAXI APP — script.js
 * SPA Logic: Navigation, API calls, Geolocation, State
 * ================================================================
 */

const API = ''; // Same origin — Express serves static files

// ─── APP STATE ───────────────────────────────────────────────────
const state = {
  currentDriver: null,
  activeRide: null,
  selectedRideForBooking: null,
  passengerLat: null,
  passengerLng: null,
  seatCount: 1,
  maxSeats: 7,
  filterDest: ''
};

// ─── DESTINATION LABELS ──────────────────────────────────────────
const DEST_LABELS = {
  Algiers: '🏛️ الجزائر العاصمة',
  Oran:    '🌊 وهران',
  Tunisia: '🌍 تونس'
};

// ─── SCREEN NAVIGATION ───────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

function goBack(targetScreen) {
  showScreen(targetScreen);
  if (targetScreen === 'passenger-screen') loadRides();
}

function selectRole(role) {
  if (role === 'driver') showScreen('login-screen');
  else { showScreen('passenger-screen'); loadRides(); }
}

// ─── TOAST ───────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast' + (type ? ' ' + type : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 3000);
}

// ─── HELPERS ─────────────────────────────────────────────────────
function formatDateTime(iso) {
  if (!iso) return '--';
  const d = new Date(iso);
  return d.toLocaleString('ar-DZ', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
}

function hideError(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

async function apiFetch(path, options = {}) {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'حدث خطأ في الاتصال');
  return data;
}

// ─── LOGIN & ROLES ───────────────────────────────────────────────
async function handleLogin(e) {
  e.preventDefault();
  hideError('login-error');
  const btn = document.getElementById('btn-login');
  btn.textContent = '...جاري التحقق';
  btn.disabled = true;

  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();

  try {
    if (password) {
      // Driver login attempt
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      state.currentDriver = data.driver;
      state.activeRide = data.activeRide;
      document.getElementById('driver-name-display').textContent = data.driver.name;
      showScreen('driver-dashboard-screen');
      renderDriverDashboard();
    } else {
      // Passenger flow (if no password provided)
      showScreen('passenger-screen');
      loadRides();
    }
  } catch (err) {
    showError('login-error', err.message);
  } finally {
    btn.textContent = 'متابعة';
    btn.disabled = false;
  }
}

function continueAsGuest() {
  showScreen('passenger-screen');
  loadRides();
}

function driverLogout() {
  state.currentDriver = null;
  state.activeRide = null;
  document.getElementById('login-username').value = '';
  document.getElementById('login-password').value = '';
  showScreen('login-screen');
  showToast('تم تسجيل الخروج');
}

// ─── DRIVER: DASHBOARD RENDER ─────────────────────────────────────
function renderDriverDashboard() {
  const noRide  = document.getElementById('no-ride-panel');
  const active  = document.getElementById('active-ride-panel');
  const create  = document.getElementById('create-ride-panel');

  noRide.classList.add('hidden');
  active.classList.add('hidden');
  create.classList.add('hidden');

  if (!state.activeRide) {
    noRide.classList.remove('hidden');
  } else {
    active.classList.remove('hidden');
    renderActiveRide(state.activeRide);
    loadPassengers();
  }
}

function renderActiveRide(ride) {
  document.getElementById('active-ride-dest').textContent = DEST_LABELS[ride.destination] || ride.destination;
  document.getElementById('active-ride-time').textContent = formatDateTime(ride.departureTime);
  document.getElementById('active-ride-seats').textContent = ride.availableSeats;

  // Status badge
  const badge = document.getElementById('ride-status-badge');
  badge.className = 'status-badge';
  if (ride.status === 'Full')     badge.classList.add('full');
  if (ride.status === 'Departed') badge.classList.add('departed');
  const labels = { Pending: 'نشطة', Full: 'مكتملة', Departed: 'انطلقت' };
  badge.textContent = labels[ride.status] || ride.status;

  // Seats visual
  const viz = document.getElementById('seats-visual');
  viz.innerHTML = '';
  for (let i = 0; i < ride.totalSeats; i++) {
    const dot = document.createElement('div');
    dot.className = 'seat-dot ' + (i < (ride.totalSeats - ride.availableSeats) ? 'occupied' : 'free');
    dot.textContent = i < (ride.totalSeats - ride.availableSeats) ? '🧑' : '💺';
    viz.appendChild(dot);
  }
}

// ─── DRIVER: CREATE RIDE ─────────────────────────────────────────
function showCreateRideForm() {
  document.getElementById('no-ride-panel').classList.add('hidden');
  document.getElementById('create-ride-panel').classList.remove('hidden');

  // Default departure = 1 hour from now
  const dep = new Date(Date.now() + 60 * 60 * 1000);
  dep.setSeconds(0, 0);
  document.getElementById('ride-departure').value = dep.toISOString().slice(0, 16);
}

function selectDestination(btn) {
  document.querySelectorAll('.dest-pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('ride-destination').value = btn.dataset.dest;
}

async function createRide(e) {
  e.preventDefault();
  hideError('create-ride-error');
  const dest = document.getElementById('ride-destination').value;
  if (!dest) { showError('create-ride-error', 'الرجاء اختيار الوجهة'); return; }

  try {
    const data = await apiFetch('/api/rides', {
      method: 'POST',
      body: JSON.stringify({
        driverId: state.currentDriver.id,
        destination: dest,
        departureTime: document.getElementById('ride-departure').value
      })
    });
    state.activeRide = data.ride;
    showToast('✅ تم إنشاء الرحلة بنجاح', 'success');
    renderDriverDashboard();
  } catch (err) {
    showError('create-ride-error', err.message);
  }
}

// ─── DRIVER: PASSENGERS ──────────────────────────────────────────
async function loadPassengers() {
  if (!state.activeRide) return;
  const list = document.getElementById('passenger-list');
  list.innerHTML = '<div class="loading-indicator">جاري التحميل...</div>';

  try {
    const data = await apiFetch(
      `/api/rides/${state.activeRide.id}/passengers?driverId=${state.currentDriver.id}`
    );
    state.activeRide = { ...state.activeRide, ...data.ride };
    renderActiveRide(state.activeRide);

    if (!data.bookings.length) {
      list.innerHTML = '<div class="loading-indicator">لا يوجد ركاب حتى الآن</div>';
      return;
    }

    list.innerHTML = data.bookings.map((b, i) => `
      <div class="passenger-card">
        <div class="pax-card-header">
          <div class="pax-avatar">${getInitials(b.passengerName)}</div>
          <div>
            <div class="pax-name">${b.passengerName}</div>
            <div class="pax-seats">💺 ${b.seatsBooked} مقعد · ${formatDateTime(b.createdAt)}</div>
          </div>
        </div>
        <div class="pax-details">
          <div class="pax-phone">📞 ${b.passengerPhone}</div>
          ${b.latitude && b.longitude
            ? `<button class="btn-location-map" onclick="openGoogleMaps(${b.latitude},${b.longitude})">📍 الموقع</button>`
            : `<button class="btn-location-map" disabled style="opacity:.4">📍 غير متاح</button>`
          }
        </div>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = `<div class="loading-indicator" style="color:var(--red)">${err.message}</div>`;
  }
}

function getInitials(name) {
  return name ? name.trim().charAt(0) : '؟';
}

function openGoogleMaps(lat, lng) {
  window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
}

// ─── DRIVER: RIDE ACTIONS ────────────────────────────────────────
async function markDeparted() {
  if (!state.activeRide) return;
  if (!confirm('هل تأكد أن الرحلة انطلقت؟')) return;
  try {
    await apiFetch(`/api/rides/${state.activeRide.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'Departed', driverId: state.currentDriver.id })
    });
    state.activeRide.status = 'Departed';
    showToast('✅ تم تسجيل انطلاق الرحلة', 'success');
    renderActiveRide(state.activeRide);
  } catch (err) { showToast(err.message, 'error'); }
}

async function cancelRide() {
  if (!state.activeRide) return;
  if (!confirm('هل تريد إلغاء هذه الرحلة؟ سيتم حذف جميع الحجوزات.')) return;
  try {
    await apiFetch(`/api/rides/${state.activeRide.id}`, {
      method: 'DELETE',
      body: JSON.stringify({ driverId: state.currentDriver.id })
    });
    state.activeRide = null;
    showToast('تم إلغاء الرحلة', 'error');
    renderDriverDashboard();
  } catch (err) { showToast(err.message, 'error'); }
}

// ─── PASSENGER: LOAD RIDES ───────────────────────────────────────
async function loadRides() {
  const container = document.getElementById('rides-container');
  container.innerHTML = '<div class="loading-indicator">⏳ جاري تحميل الرحلات...</div>';

  try {
    const url = state.filterDest
      ? `/api/rides?destination=${state.filterDest}`
      : '/api/rides';
    const data = await apiFetch(url);

    if (!data.rides.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>لا توجد رحلات متاحة</h3>
          <p>لا توجد رحلات لهذه الوجهة حالياً، حاول لاحقاً</p>
        </div>`;
      return;
    }

    container.innerHTML = data.rides.map(ride => buildRideCard(ride)).join('');
  } catch (err) {
    container.innerHTML = `<div class="loading-indicator" style="color:var(--red)">❌ ${err.message}</div>`;
  }
}

function buildRideCard(ride) {
  const pct = ((ride.totalSeats - ride.availableSeats) / ride.totalSeats) * 100;
  const barClass = pct >= 85 ? 'low' : pct >= 57 ? 'mid' : '';
  const isFull = ride.availableSeats === 0;

  return `
    <div class="ride-card" id="ride-${ride.id}">
      <div class="ride-card-header">
        <div class="ride-card-dest">${DEST_LABELS[ride.destination] || ride.destination}</div>
        <span class="ride-card-status ${isFull ? 'status-full' : 'status-pending'}">
          ${isFull ? '🔴 مكتملة' : '🟢 متاحة'}
        </span>
      </div>
      <div class="ride-card-body">
        <div class="ride-info-row">
          <span class="ride-info-label">👤 السائق</span>
          <span class="ride-info-value">${ride.driverName}</span>
        </div>
        <div class="ride-info-row">
          <span class="ride-info-label">📞 الهاتف</span>
          <span class="ride-info-value">${ride.driverPhone}</span>
        </div>
        <div class="ride-info-row">
          <span class="ride-info-label">🚗 المركبة</span>
          <span class="ride-info-value">${ride.vehicle}</span>
        </div>
        <div class="ride-info-row">
          <span class="ride-info-label">⏰ الانطلاق</span>
          <span class="ride-info-value">${formatDateTime(ride.departureTime)}</span>
        </div>
        <div class="seats-bar-wrap">
          <div class="seats-bar-label">💺 ${ride.availableSeats} مقعد متاح من ${ride.totalSeats}</div>
          <div class="seats-bar">
            <div class="seats-bar-fill ${barClass}" style="width:${pct}%"></div>
          </div>
        </div>
      </div>
      <div class="ride-card-footer">
        <button class="btn-book-ride" ${isFull ? 'disabled' : ''} onclick="openBookingForm('${ride.id}')">
          ${isFull ? 'الرحلة مكتملة' : '🎫 احجز مقعدك الآن'}
        </button>
      </div>
    </div>`;
}

function filterRides(btn, dest) {
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  state.filterDest = dest;
  const label = document.getElementById('filter-label');
  label.textContent = dest ? (DEST_LABELS[dest] || dest) : 'جميع الوجهات';
  loadRides();
}

// ─── PASSENGER: BOOKING FORM ─────────────────────────────────────
async function openBookingForm(rideId) {
  try {
    const data = await apiFetch(`/api/rides/${rideId}`);
    const ride = data.ride;
    state.selectedRideForBooking = ride;
    state.seatCount = 1;
    state.maxSeats = ride.availableSeats;
    state.passengerLat = null;
    state.passengerLng = null;

    // Reset form
    document.getElementById('pax-name').value = '';
    document.getElementById('pax-phone').value = '';
    document.getElementById('seat-count-display').textContent = '1';
    document.getElementById('location-status').textContent = 'غير مُحدَّد';
    document.getElementById('location-status').className = 'location-status';
    document.getElementById('location-display').classList.add('hidden');
    document.getElementById('btn-share-location').textContent = '📡 تحديد موقعي الآن';
    document.getElementById('btn-share-location').disabled = false;
    hideError('booking-error');

    // Build summary
    document.getElementById('booking-ride-summary').innerHTML = `
      <div class="summary-dest">${DEST_LABELS[ride.destination] || ride.destination}</div>
      <div class="summary-row">👤 ${ride.driverName} · ${ride.driverPhone}</div>
      <div class="summary-row">⏰ ${formatDateTime(ride.departureTime)}</div>
      <div class="summary-row">💺 ${ride.availableSeats} مقعد متاح</div>`;

    showScreen('booking-screen');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function changeSeatCount(delta) {
  const next = state.seatCount + delta;
  if (next < 1 || next > state.maxSeats) return;
  state.seatCount = next;
  document.getElementById('seat-count-display').textContent = next;
}

// ─── GEOLOCATION ─────────────────────────────────────────────────
function shareLocation() {
  const btn = document.getElementById('btn-share-location');
  const statusEl = document.getElementById('location-status');

  if (!navigator.geolocation) {
    showToast('متصفحك لا يدعم تحديد الموقع', 'error');
    return;
  }

  btn.textContent = '⏳ جاري التحديد...';
  btn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      state.passengerLat = pos.coords.latitude.toFixed(6);
      state.passengerLng = pos.coords.longitude.toFixed(6);

      statusEl.textContent = 'تم التحديد ✓';
      statusEl.className = 'location-status found';

      const display = document.getElementById('location-display');
      display.textContent = `📍 خط العرض: ${state.passengerLat} | خط الطول: ${state.passengerLng}`;
      display.classList.remove('hidden');

      btn.textContent = '✅ تم تحديد الموقع';
      btn.style.background = 'rgba(127,216,166,.15)';
      btn.style.color = 'var(--green)';
      btn.style.borderColor = 'rgba(127,216,166,.3)';

      showToast('✅ تم تحديد موقعك بنجاح', 'success');
    },
    (err) => {
      const msgs = {
        1: 'رفضت الإذن بالوصول للموقع',
        2: 'تعذّر تحديد الموقع',
        3: 'انتهت مهلة تحديد الموقع'
      };
      showToast(msgs[err.code] || 'خطأ في تحديد الموقع', 'error');
      btn.textContent = '📡 تحديد موقعي الآن';
      btn.disabled = false;
    },
    { timeout: 10000, enableHighAccuracy: true }
  );
}

// ─── PASSENGER: SUBMIT BOOKING ───────────────────────────────────
async function submitBooking(e) {
  e.preventDefault();
  hideError('booking-error');

  const name  = document.getElementById('pax-name').value.trim();
  const phone = document.getElementById('pax-phone').value.trim();

  if (!name)  { showError('booking-error', 'الرجاء إدخال اسمك الكامل'); return; }
  if (!phone) { showError('booking-error', 'الرجاء إدخال رقم هاتفك'); return; }
  if (!/^(05|06|07)\d{8}$/.test(phone)) {
    showError('booking-error', 'رقم الهاتف غير صحيح (يجب أن يبدأ بـ 05 أو 06 أو 07)');
    return;
  }

  const submitBtn = e.target.querySelector('.btn-book');
  submitBtn.textContent = '⏳ جاري الحجز...';
  submitBtn.disabled = true;

  try {
    const data = await apiFetch('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({
        rideId:        state.selectedRideForBooking.id,
        passengerName: name,
        passengerPhone: phone,
        seatsBooked:   state.seatCount,
        latitude:      state.passengerLat,
        longitude:     state.passengerLng
      })
    });

    // Show success
    document.getElementById('success-message').textContent =
      `تم تسجيل حجزك بنجاح! في انتظار انطلاق الرحلة.`;

    document.getElementById('success-details').innerHTML = `
      <div class="success-detail-row">
        <span class="success-detail-label">الوجهة</span>
        <span>${DEST_LABELS[data.ride.destination] || data.ride.destination}</span>
      </div>
      <div class="success-detail-row">
        <span class="success-detail-label">وقت الانطلاق</span>
        <span>${formatDateTime(data.ride.departureTime)}</span>
      </div>
      <div class="success-detail-row">
        <span class="success-detail-label">المقاعد المحجوزة</span>
        <span>${state.seatCount}</span>
      </div>
      <div class="success-detail-row">
        <span class="success-detail-label">رقم الحجز</span>
        <span style="font-size:.75rem;color:var(--text-muted)">${data.booking.id.slice(0,8).toUpperCase()}</span>
      </div>`;

    showScreen('success-screen');
  } catch (err) {
    showError('booking-error', err.message);
    submitBtn.textContent = '✅ تأكيد الحجز';
    submitBtn.disabled = false;
  }
}

// ─── INIT ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Set min datetime for ride creation
  const dep = document.getElementById('ride-departure');
  if (dep) {
    const now = new Date(Date.now() + 60 * 60 * 1000);
    now.setSeconds(0, 0);
    dep.min = now.toISOString().slice(0, 16);
  }

  // Hide splash after 1.8s then show login screen directly
  setTimeout(() => {
    document.getElementById('splash-screen').classList.add('hidden');
    showScreen('login-screen');
  }, 1800);
});
