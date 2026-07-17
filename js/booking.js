/* =========================================================
   RAAHI — booking.js
   Live map, geocoding, routing, fare & payment flow.
   Safe to include on every page — it no-ops if the relevant
   elements aren't present.
   ========================================================= */

const VADODARA_CENTER = [22.3072, 73.1812];
const VADODARA_BOUNDS = { minLat: 22.15, maxLat: 22.46, minLon: 73.00, maxLon: 73.40 };

const VEHICLES = [
  { id: 'auto',  name: 'Auto',  icon: 'fa-motorcycle',  per_km: 8,  base: 20, capacity: '3 seats', eta: '3 min' },
  { id: 'mini',  name: 'Mini',  icon: 'fa-car',         per_km: 11, base: 30, capacity: '4 seats', eta: '5 min' },
  { id: 'sedan', name: 'Sedan', icon: 'fa-car-side',    per_km: 15, base: 40, capacity: '4 seats', eta: '6 min', badge: 'Popular' },
  { id: 'suv',   name: 'SUV',   icon: 'fa-shuttle-van', per_km: 19, base: 60, capacity: '6 seats', eta: '8 min' },
];

/* 38 well-known Vadodara landmarks & localities — used for quick-pick chips,
   instant local search suggestions, and pins on the coverage map. */
const LANDMARKS = [
  { name: 'Laxmi Vilas Palace, Vadodara',        lat: 22.2996, lon: 73.2081 },
  { name: 'Vadodara Railway Station',             lat: 22.3086, lon: 73.1808 },
  { name: 'Vadodara Airport',                     lat: 22.3363, lon: 73.2263 },
  { name: 'Sayaji Baug, Vadodara',                lat: 22.3111, lon: 73.1934 },
  { name: 'Alkapuri, Vadodara',                   lat: 22.3126, lon: 73.1698 },
  { name: 'MS University (Pratapgunj), Vadodara', lat: 22.3159, lon: 73.1929 },
  { name: 'Parul University, Vadodara',           lat: 22.2686, lon: 73.3699 },
  { name: 'Manjalpur, Vadodara',                  lat: 22.2707, lon: 73.1934 },
  { name: 'Krishna Harmony, Gotri, Vadodara',     lat: 22.3231, lon: 73.1450 },
  { name: 'Gotri, Vadodara',                      lat: 22.3232, lon: 73.1462 },
  { name: 'Sama, Vadodara',                       lat: 22.3312, lon: 73.1706 },
  { name: 'Akota, Vadodara',                      lat: 22.2965, lon: 73.1745 },
  { name: 'Karelibaug, Vadodara',                 lat: 22.3220, lon: 73.2050 },
  { name: 'Waghodia Road, Vadodara',              lat: 22.3184, lon: 73.2385 },
  { name: 'Nizampura, Vadodara',                  lat: 22.3245, lon: 73.1889 },
  { name: 'Vasna, Vadodara',                      lat: 22.2820, lon: 73.1780 },
  { name: 'Tarsali, Vadodara',                    lat: 22.2740, lon: 73.1650 },
  { name: 'Ellora Park, Vadodara',                lat: 22.2879, lon: 73.1614 },
  { name: 'Subhanpura, Vadodara',                 lat: 22.3170, lon: 73.1580 },
  { name: 'Harni, Vadodara',                      lat: 22.3396, lon: 73.1957 },
  { name: 'Chhani, Vadodara',                     lat: 22.3480, lon: 73.1650 },
  { name: 'Gorwa, Vadodara',                      lat: 22.3305, lon: 73.1590 },
  { name: 'Makarpura GIDC, Vadodara',             lat: 22.2612, lon: 73.1875 },
  { name: 'Fatehgunj, Vadodara',                  lat: 22.3183, lon: 73.1873 },
  { name: 'Sayajigunj, Vadodara',                 lat: 22.3140, lon: 73.1850 },
  { name: 'Race Course Circle, Vadodara',         lat: 22.3150, lon: 73.1780 },
  { name: 'Old Padra Road, Vadodara',             lat: 22.2850, lon: 73.1700 },
  { name: 'New VIP Road, Vadodara',               lat: 22.3300, lon: 73.1500 },
  { name: 'Bhayli, Vadodara',                     lat: 22.3450, lon: 73.1150 },
  { name: 'Diwalipura, Vadodara',                 lat: 22.2990, lon: 73.1980 },
  { name: 'Jetalpur Road, Vadodara',              lat: 22.2820, lon: 73.1900 },
  { name: 'Panigate, Vadodara',                   lat: 22.3040, lon: 73.2010 },
  { name: 'Mandvi Gate, Vadodara',                lat: 22.3010, lon: 73.2020 },
  { name: 'Vadodara Central Mall, Old Padra Rd',  lat: 22.2865, lon: 73.1710 },
  { name: 'Inorbit Mall, Gorwa, Vadodara',        lat: 22.3300, lon: 73.1600 },
  { name: 'EME Temple (Dashrath Mandir), Vadodara', lat: 22.3160, lon: 73.1620 },
  { name: 'Kirti Mandir, Vadodara',               lat: 22.3005, lon: 73.2040 },
  { name: 'Ajwa Road, Vadodara',                  lat: 22.3550, lon: 73.1750 },
];

const DRIVER_NAMES = [
  { name: 'Ramesh Kanani',  car: 'Swift Dzire · GJ-06-XT-4521' },
  { name: 'Suresh Vaghela', car: 'WagonR · GJ-06-BF-7789' },
  { name: 'Alpesh Rathod',  car: 'Ertiga · GJ-06-KL-2290' },
  { name: 'Jignesh Patel',  car: 'Auto · GJ-06-AT-1187' },
];

const state = { pickup: null, drop: null, selectedVehicle: 'sedan', distanceKm: 0, durationMin: 0 };

document.addEventListener('DOMContentLoaded', () => {
  initDefaults();
  initCoverageMap();
  const hasWidget = document.getElementById('mini-map') && document.getElementById('pickupInput');
  if (hasWidget) initBookingWidget();
});

/* ---- date/time defaults ---- */
function initDefaults() {
  const now = new Date();
  const dateInput = document.getElementById('dateInput');
  const timeInput = document.getElementById('timeInput');
  if (dateInput) dateInput.value = now.toISOString().slice(0, 10);
  if (timeInput) timeInput.value = now.toTimeString().slice(0, 5);
}

/* ---- coverage map (marketing page only) ---- */
function initCoverageMap() {
  const el = document.getElementById('coverage-map');
  if (!el || !window.L) return;
  const map = L.map(el, { zoomControl: true, attributionControl: false }).setView(VADODARA_CENTER, 12);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
  LANDMARKS.forEach(l => {
    L.marker([l.lat, l.lon], { icon: L.divIcon({ className: '', html: '<div class="pin-dot"></div>' }) })
      .addTo(map).bindTooltip(l.name);
  });
}

/* ================= MAIN BOOKING WIDGET ================= */
function initBookingWidget() {
  const bookingMap = L.map('mini-map', { zoomControl: false, attributionControl: false }).setView(VADODARA_CENTER, 12);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(bookingMap);

  let pickupMarker = null, dropMarker = null, routeLine = null, carMarker = null, carAnim = null;

  function setMarker(kind, lat, lon) {
    const icon = L.divIcon({ className: '', html: `<div class="pin-dot ${kind === 'drop' ? 'drop' : ''}"></div>` });
    if (kind === 'pickup') {
      if (pickupMarker) bookingMap.removeLayer(pickupMarker);
      pickupMarker = L.marker([lat, lon], { icon }).addTo(bookingMap);
    } else {
      if (dropMarker) bookingMap.removeLayer(dropMarker);
      dropMarker = L.marker([lat, lon], { icon }).addTo(bookingMap);
    }
    fitMapToPoints();
  }
  function fitMapToPoints() {
    const pts = [];
    if (state.pickup) pts.push([state.pickup.lat, state.pickup.lon]);
    if (state.drop) pts.push([state.drop.lat, state.drop.lon]);
    if (pts.length === 2) bookingMap.fitBounds(pts, { padding: [30, 30] });
    else if (pts.length === 1) bookingMap.setView(pts[0], 14);
  }

  /* ---- geocoding (Nominatim) ---- */
  function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

  function searchLocalLandmarks(query) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return LANDMARKS
      .filter(l => l.name.toLowerCase().includes(q))
      .map(l => ({ name: l.name, full: l.name + ' · Vadodara, Gujarat', lat: l.lat, lon: l.lon }));
  }

  async function geocodeSearch(query) {
    if (!query || query.length < 3) return [];
    const local = searchLocalLandmarks(query);
    const viewbox = `${VADODARA_BOUNDS.minLon},${VADODARA_BOUNDS.maxLat},${VADODARA_BOUNDS.maxLon},${VADODARA_BOUNDS.minLat}`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Vadodara, Gujarat')}&viewbox=${viewbox}&bounded=1&limit=6`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      const remote = data.map(d => ({ name: d.display_name.split(',').slice(0, 3).join(','), full: d.display_name, lat: parseFloat(d.lat), lon: parseFloat(d.lon) }));
      // local landmarks first (instant & reliable), then live results, deduped by name
      const seen = new Set(local.map(l => l.name.toLowerCase()));
      const merged = [...local, ...remote.filter(r => !seen.has(r.name.toLowerCase()))];
      return merged.slice(0, 7);
    } catch (err) {
      return local; // still useful offline / if Nominatim is unreachable
    }
  }

  function renderSuggestions(listEl, items, onPick) {
    if (items.length === 0) { listEl.classList.remove('show'); listEl.innerHTML = ''; return; }
    listEl.innerHTML = items.map((it, i) => `
      <div class="suggest-item" data-i="${i}"><i class="fas fa-location-dot"></i>
        <div>${it.name}<small>${it.full}</small></div>
      </div>`).join('');
    listEl.classList.add('show');
    [...listEl.children].forEach((el, i) => {
      el.addEventListener('click', () => { onPick(items[i]); listEl.classList.remove('show'); });
    });
  }

  const pickupInput = document.getElementById('pickupInput');
  const dropInput = document.getElementById('dropInput');
  const pickupSuggest = document.getElementById('pickupSuggest');
  const dropSuggest = document.getElementById('dropSuggest');

  pickupInput.addEventListener('input', debounce(async e => {
    const items = await geocodeSearch(e.target.value);
    renderSuggestions(pickupSuggest, items, item => selectPlace('pickup', item));
  }, 450));
  dropInput.addEventListener('input', debounce(async e => {
    const items = await geocodeSearch(e.target.value);
    renderSuggestions(dropSuggest, items, item => selectPlace('drop', item));
  }, 450));
  document.addEventListener('click', e => {
    if (!pickupInput.contains(e.target)) pickupSuggest.classList.remove('show');
    if (!dropInput.contains(e.target)) dropSuggest.classList.remove('show');
  });

  function selectPlace(kind, item) {
    state[kind] = { lat: item.lat, lon: item.lon, name: item.name };
    if (kind === 'pickup') pickupInput.value = item.name; else dropInput.value = item.name;
    setMarker(kind, item.lat, item.lon);
    maybeComputeRoute();
  }

  document.querySelectorAll('.chip[data-place]').forEach(chip => {
    chip.addEventListener('click', async () => {
      const place = chip.dataset.place;
      const known = LANDMARKS.find(l => l.name === place);
      const item = known ? { lat: known.lat, lon: known.lon, name: known.name } : (await geocodeSearch(place))[0];
      if (!item) return;
      if (!state.pickup) { pickupInput.value = item.name; selectPlace('pickup', item); }
      else { dropInput.value = item.name; selectPlace('drop', item); }
    });
  });

  const locateBtn = document.getElementById('locateBtn');
  if (locateBtn) locateBtn.addEventListener('click', () => {
    if (!navigator.geolocation) { toast('Geolocation not supported on this device', 'error'); return; }
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;
      pickupInput.value = 'Current location';
      selectPlace('pickup', { lat: latitude, lon: longitude, name: 'Current location' });
      toast('Pickup set to your current location', 'success');
    }, () => { toast('Could not access your location', 'error'); });
  });

  /* ---- routing (OSRM) ---- */
  function haversineKm(a, b) {
    const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLon = (b.lon - a.lon) * Math.PI / 180;
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  }

  async function maybeComputeRoute() {
    if (!state.pickup || !state.drop) return;
    const bookBtn = document.getElementById('bookBtn');
    if (bookBtn) bookBtn.disabled = true;
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${state.pickup.lon},${state.pickup.lat};${state.drop.lon},${state.drop.lat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        state.distanceKm = route.distance / 1000;
        state.durationMin = route.duration / 60;
        drawRoute(route.geometry.coordinates);
      } else { throw new Error('no route'); }
    } catch (err) {
      const d = haversineKm(state.pickup, state.drop) * 1.35;
      state.distanceKm = d;
      state.durationMin = d * 2.4;
      drawRoute(null);
      toast('Live routing unavailable — using estimated distance', '');
    }
    const routeStats = document.getElementById('routeStats');
    if (routeStats) routeStats.classList.add('show');
    const sd = document.getElementById('statDistance'), se = document.getElementById('statEta');
    if (sd) sd.textContent = state.distanceKm.toFixed(1) + ' km';
    if (se) se.textContent = Math.round(state.durationMin) + ' min';
    updateFares();
    if (bookBtn) bookBtn.disabled = false;
  }

  function drawRoute(coords) {
    if (routeLine) bookingMap.removeLayer(routeLine);
    let latlngs;
    if (coords) { latlngs = coords.map(c => [c[1], c[0]]); }
    else { latlngs = [[state.pickup.lat, state.pickup.lon], [state.drop.lat, state.drop.lon]]; }
    routeLine = L.polyline(latlngs, { color: '#c98a2b', weight: 4, opacity: .85 }).addTo(bookingMap);
    fitMapToPoints();
  }

  /* ---- vehicles & fare ---- */
  const vehicleGrid = document.getElementById('vehicleGrid');
  vehicleGrid.innerHTML = VEHICLES.map(v => `
    <button class="vehicle-card ${v.id === state.selectedVehicle ? 'active' : ''}" data-id="${v.id}">
      ${v.badge ? `<span class="badge">${v.badge}</span>` : ''}
      <div class="vtop"><i class="fas ${v.icon} vicon"></i></div>
      <h4>${v.name}</h4>
      <p>${v.capacity} · ETA ${v.eta}</p>
      <div class="vfare">₹${v.per_km}/km</div>
    </button>
  `).join('');
  vehicleGrid.addEventListener('click', e => {
    const card = e.target.closest('.vehicle-card');
    if (!card) return;
    state.selectedVehicle = card.dataset.id;
    [...vehicleGrid.children].forEach(c => c.classList.toggle('active', c === card));
    updateFares();
  });

  function currentFare() {
    const v = VEHICLES.find(v => v.id === state.selectedVehicle);
    const dist = state.distanceKm || 0;
    let total = v.base + dist * v.per_km;
    const timeInput = document.getElementById('timeInput');
    const hour = parseInt(((timeInput && timeInput.value) || '12:00').split(':')[0], 10);
    if (hour >= 23 || hour < 5) total *= 1.25;
    return Math.round(total);
  }
  function updateFares() {
    const fareTotal = document.getElementById('fareTotal');
    if (fareTotal) fareTotal.textContent = '₹' + currentFare();
  }
  updateFares();

  /* ---- book -> payment modal ---- */
  const payOverlay = document.getElementById('payOverlay');
  const bookBtn = document.getElementById('bookBtn');
  if (bookBtn) bookBtn.addEventListener('click', () => {
    if (!state.pickup || !state.drop) { toast('Please choose pickup and drop locations', 'error'); return; }
    openPayModal();
  });

  function openPayModal() {
    document.getElementById('payForm').style.display = 'block';
    document.getElementById('payLoading').classList.remove('show');
    document.getElementById('paySuccess').classList.remove('show');
    const v = VEHICLES.find(v => v.id === state.selectedVehicle);
    const fare = currentFare();
    document.getElementById('paySummary').innerHTML = `
      <div><span>${v.name} · ${state.distanceKm.toFixed(1)} km</span><span>₹${Math.round(state.distanceKm * v.per_km)}</span></div>
      <div><span>Base fare</span><span>₹${v.base}</span></div>
      <div class="total"><span>Total payable</span><strong>₹${fare}</strong></div>
    `;
    payOverlay.classList.add('show');
  }
  const modalClose = document.getElementById('modalClose');
  if (modalClose) modalClose.addEventListener('click', () => payOverlay.classList.remove('show'));
  if (payOverlay) payOverlay.addEventListener('click', e => { if (e.target === payOverlay) payOverlay.classList.remove('show'); });

  /* pay tabs */
  document.querySelectorAll('.pay-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.pay-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.pay-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
    });
  });
  document.querySelectorAll('.upi-app').forEach(app => {
    app.addEventListener('click', () => {
      document.querySelectorAll('.upi-app').forEach(a => a.classList.remove('active'));
      app.classList.add('active');
    });
  });

  /* card formatting */
  const cardNumber = document.getElementById('cardNumber');
  if (cardNumber) cardNumber.addEventListener('input', e => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
  });
  const cardExpiry = document.getElementById('cardExpiry');
  if (cardExpiry) cardExpiry.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 3) v = v.slice(0, 2) + ' / ' + v.slice(2);
    e.target.value = v;
  });
  const cardCvv = document.getElementById('cardCvv');
  if (cardCvv) cardCvv.addEventListener('input', e => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
  });

  /* pay now */
  const payNowBtn = document.getElementById('payNowBtn');
  if (payNowBtn) payNowBtn.addEventListener('click', () => {
    const activeTab = document.querySelector('.pay-tab.active').dataset.tab;
    if (activeTab === 'upi' && !document.getElementById('upiId').value.includes('@')) {
      toast('Enter a valid UPI ID', 'error'); return;
    }
    if (activeTab === 'card') {
      const num = document.getElementById('cardNumber').value.replace(/\s/g, '');
      if (num.length < 16) { toast('Enter a valid 16-digit card number', 'error'); return; }
    }
    document.getElementById('payForm').style.display = 'none';
    document.getElementById('payLoading').classList.add('show');
    setTimeout(() => {
      document.getElementById('payLoading').classList.remove('show');
      document.getElementById('paySuccess').classList.add('show');
      showDriverAndAnimate();
    }, 1600);
  });

  function showDriverAndAnimate() {
    const d = DRIVER_NAMES[Math.floor(Math.random() * DRIVER_NAMES.length)];
    document.getElementById('driverName').textContent = d.name;
    document.getElementById('driverCar').textContent = d.car;
    document.getElementById('driverInitials').textContent = d.name.split(' ').map(w => w[0]).join('');
    const v = VEHICLES.find(v => v.id === state.selectedVehicle);
    document.getElementById('etaPill').innerHTML = `<i class="fas fa-clock"></i> Arriving in ${v.eta}`;

    /* ---- save this ride to the customer's data store ---- */
    if (typeof raahiSaveRide === 'function') {
      const session = typeof raahiGetSession === 'function' ? raahiGetSession() : null;
      raahiSaveRide(session ? session.email : null, {
        pickup: state.pickup.name,
        drop: state.drop.name,
        vehicle: v.name,
        distanceKm: Number(state.distanceKm.toFixed(1)),
        fare: currentFare(),
        driver: d.name,
        car: d.car,
        status: 'Confirmed',
      });
      if (!session) toast('Sign in to save this ride to your account permanently', '');
    }

    animateCarAlongRoute();
  }

  function animateCarAlongRoute() {
    if (!routeLine) return;
    if (carMarker) bookingMap.removeLayer(carMarker);
    if (carAnim) cancelAnimationFrame(carAnim);
    const latlngs = routeLine.getLatLngs();
    const icon = L.divIcon({ className: '', html: '<i class="fas fa-taxi car-marker"></i>' });
    carMarker = L.marker(latlngs[0], { icon }).addTo(bookingMap);
    let start = performance.now(), duration = 4500;
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const idx = Math.floor(progress * (latlngs.length - 1));
      carMarker.setLatLng(latlngs[idx]);
      if (progress < 1) carAnim = requestAnimationFrame(step);
      else toast('Your driver has arrived!', 'success');
    }
    carAnim = requestAnimationFrame(step);
  }

  const closeSuccessBtn = document.getElementById('closeSuccessBtn');
  if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', () => {
    payOverlay.classList.remove('show');
    toast('Ride booked — track your driver on the map', 'success');
  });

  /* default pin so the map isn't empty on load */
  setMarker('pickup', VADODARA_CENTER[0], VADODARA_CENTER[1]);
}