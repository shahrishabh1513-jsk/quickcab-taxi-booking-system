/* =========================================================
   RAAHI — account.js
   Renders the signed-in customer's profile, saved addresses
   and ride history, all backed by the localStorage data store
   defined in main.js.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const session = raahiGetSession();

  if (!session) {
    document.getElementById('accountGate').style.display = 'block';
    document.getElementById('accountContent').style.display = 'none';
    return;
  }

  document.getElementById('accountContent').style.display = 'grid';

  renderProfile(session);
  renderAddresses(session.email);
  renderRides(session.email);
  wireProfileEdit(session.email);
  wireAddressForm(session.email);
  wireDangerZone(session.email);

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', raahiLogout);
});

function renderProfile(account) {
  document.getElementById('profileAvatar').textContent = account.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  document.getElementById('profileName').textContent = account.name;
  document.getElementById('profileEmail').textContent = account.email;
  document.getElementById('profilePhone').textContent = account.phone || 'Not provided';
}

function wireProfileEdit(email) {
  const editBtn = document.getElementById('editProfileBtn');
  const cancelBtn = document.getElementById('cancelEditBtn');
  const viewBlock = document.getElementById('profileView');
  const formBlock = document.getElementById('profileEditForm');

  editBtn.addEventListener('click', () => {
    const account = raahiFindAccount(email);
    document.getElementById('editName').value = account.name;
    document.getElementById('editPhone').value = account.phone || '';
    viewBlock.style.display = 'none';
    formBlock.style.display = 'block';
  });
  cancelBtn.addEventListener('click', () => {
    viewBlock.style.display = 'block';
    formBlock.style.display = 'none';
  });
  formBlock.addEventListener('submit', e => {
    e.preventDefault();
    const updated = raahiUpdateAccount(email, {
      name: document.getElementById('editName').value.trim(),
      phone: document.getElementById('editPhone').value.trim(),
    });
    renderProfile(updated);
    viewBlock.style.display = 'block';
    formBlock.style.display = 'none';
    raahiUpdateAuthNav();
    toast('Profile updated', 'success');
  });
}

function renderAddresses(email) {
  const list = raahiGetAddresses(email);
  const el = document.getElementById('addressList');
  if (list.length === 0) {
    el.innerHTML = `<div class="empty-state"><i class="fas fa-map-pin"></i><p>No saved addresses yet.</p></div>`;
    return;
  }
  el.innerHTML = list.map(a => `
    <div class="addr-item">
      <div><span class="label">${a.label}</span><p>${a.address}</p></div>
      <button data-id="${a.id}" class="del-addr" title="Remove"><i class="fas fa-trash"></i></button>
    </div>
  `).join('');
  el.querySelectorAll('.del-addr').forEach(btn => {
    btn.addEventListener('click', () => {
      raahiDeleteAddress(email, btn.dataset.id);
      renderAddresses(email);
      toast('Address removed', '');
    });
  });
}

function wireAddressForm(email) {
  const form = document.getElementById('addAddressForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const label = document.getElementById('addrLabel').value;
    const address = document.getElementById('addrText').value.trim();
    if (!address) return;
    raahiSaveAddress(email, { label, address });
    document.getElementById('addrText').value = '';
    renderAddresses(email);
    toast('Address saved', 'success');
  });
}

function renderRides(email) {
  const rides = raahiGetRides(email);
  const el = document.getElementById('rideList');
  if (rides.length === 0) {
    el.innerHTML = `<div class="empty-state"><i class="fas fa-route"></i><p>No rides yet — your booking history will show up here.</p></div>`;
    return;
  }
  el.innerHTML = rides.map(r => `
    <div class="ride-item">
      <div class="rtop">
        <span class="status-pill">${r.status || 'Confirmed'}</span>
        <strong>₹${r.fare}</strong>
      </div>
      <div class="ride-route"><i class="fas fa-circle" style="font-size:.5rem;"></i> ${r.pickup} <i class="fas fa-arrow-right"></i> <i class="fas fa-map-pin"></i> ${r.drop}</div>
      <div class="ride-meta">
        <span><i class="fas fa-car"></i> ${r.vehicle}</span>
        <span><i class="fas fa-road"></i> ${r.distanceKm} km</span>
        <span><i class="fas fa-user"></i> ${r.driver}</span>
        <span><i class="fas fa-calendar"></i> ${new Date(r.bookedAt).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</span>
      </div>
    </div>
  `).join('');
}

function wireDangerZone(email) {
  document.getElementById('clearDataBtn').addEventListener('click', () => {
    if (!confirm('This permanently deletes your account, addresses and ride history from this browser. Continue?')) return;
    raahiClearMyData(email);
    toast('Your data has been deleted', 'success');
    setTimeout(() => window.location.href = 'index.html', 800);
  });
}