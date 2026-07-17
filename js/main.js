/* =========================================================
   RAAHI — main.js
   Shared behaviour used across every page
   ========================================================= */

/* =================================================================
   CUSTOMER ACCOUNT & DATA STORE
   Everything below persists in the browser's localStorage, so a
   customer's profile, saved addresses and ride history survive
   page reloads and repeat visits on the same device/browser.
   There is no backend attached — swap RAAHI_DB for real API calls
   when you have a server, keeping these same function names so
   nothing else on the site needs to change.
   ================================================================= */
const RAAHI_DB = {
  ACCOUNTS_KEY: 'raahi_accounts',      // [{name,email,phone,password,createdAt}]
  SESSION_KEY: 'raahi_session',        // "current@user.email" | null
  addressesKey: email => `raahi_addresses_${email}`,
  ridesKey: email => `raahi_rides_${email}`,
};

function raahiGetAccounts() {
  try { return JSON.parse(localStorage.getItem(RAAHI_DB.ACCOUNTS_KEY)) || []; }
  catch { return []; }
}
function raahiSaveAccounts(list) {
  localStorage.setItem(RAAHI_DB.ACCOUNTS_KEY, JSON.stringify(list));
}
function raahiFindAccount(email) {
  return raahiGetAccounts().find(a => a.email.toLowerCase() === (email || '').toLowerCase());
}
function raahiCreateAccount({ name, email, phone, password }) {
  const accounts = raahiGetAccounts();
  if (raahiFindAccount(email)) throw new Error('An account with this email already exists.');
  const account = { name, email, phone: phone || '', password, createdAt: new Date().toISOString() };
  accounts.push(account);
  raahiSaveAccounts(accounts);
  raahiSetSession(email);
  return account;
}
function raahiAuthenticate(email, password) {
  const account = raahiFindAccount(email);
  if (!account || account.password !== password) throw new Error('Incorrect email or password.');
  raahiSetSession(email);
  return account;
}
function raahiUpdateAccount(email, updates) {
  const accounts = raahiGetAccounts();
  const idx = accounts.findIndex(a => a.email.toLowerCase() === email.toLowerCase());
  if (idx === -1) return null;
  accounts[idx] = { ...accounts[idx], ...updates };
  raahiSaveAccounts(accounts);
  return accounts[idx];
}
function raahiSetSession(email) { localStorage.setItem(RAAHI_DB.SESSION_KEY, email); }
function raahiGetSession() {
  const email = localStorage.getItem(RAAHI_DB.SESSION_KEY);
  return email ? raahiFindAccount(email) : null;
}
function raahiLogout() {
  localStorage.removeItem(RAAHI_DB.SESSION_KEY);
  toast('You have been signed out', '');
  setTimeout(() => window.location.href = 'index.html', 500);
}

/* ---- saved addresses ---- */
function raahiGetAddresses(email) {
  try { return JSON.parse(localStorage.getItem(RAAHI_DB.addressesKey(email))) || []; }
  catch { return []; }
}
function raahiSaveAddress(email, address) {
  const list = raahiGetAddresses(email);
  list.push({ id: 'addr_' + Date.now(), ...address });
  localStorage.setItem(RAAHI_DB.addressesKey(email), JSON.stringify(list));
  return list;
}
function raahiDeleteAddress(email, id) {
  const list = raahiGetAddresses(email).filter(a => a.id !== id);
  localStorage.setItem(RAAHI_DB.addressesKey(email), JSON.stringify(list));
  return list;
}

/* ---- ride history ---- */
function raahiGetRides(email) {
  const key = RAAHI_DB.ridesKey(email || 'guest');
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
}
function raahiSaveRide(email, ride) {
  const key = RAAHI_DB.ridesKey(email || 'guest');
  const list = raahiGetRides(email);
  list.unshift({ id: 'ride_' + Date.now(), bookedAt: new Date().toISOString(), ...ride });
  localStorage.setItem(key, JSON.stringify(list));
  return list;
}

/* ---- wipe everything for the logged-in customer ---- */
function raahiClearMyData(email) {
  localStorage.removeItem(RAAHI_DB.addressesKey(email));
  localStorage.removeItem(RAAHI_DB.ridesKey(email));
  const accounts = raahiGetAccounts().filter(a => a.email.toLowerCase() !== email.toLowerCase());
  raahiSaveAccounts(accounts);
  localStorage.removeItem(RAAHI_DB.SESSION_KEY);
}

/* ---- reflect login state in the navbar on every page ---- */
function raahiUpdateAuthNav() {
  const link = document.getElementById('navAuthLink');
  if (!link) return;
  const user = raahiGetSession();
  if (user) {
    link.href = 'account.html';
    link.innerHTML = `<i class="fas fa-user"></i> ${user.name.split(' ')[0]}`;
    if (!document.getElementById('navLogoutBtn')) {
      const logoutBtn = document.createElement('button');
      logoutBtn.id = 'navLogoutBtn';
      logoutBtn.className = 'btn btn-ghost btn-small';
      logoutBtn.style.padding = '10px 14px';
      logoutBtn.title = 'Sign out';
      logoutBtn.innerHTML = '<i class="fas fa-arrow-right-from-bracket"></i>';
      logoutBtn.addEventListener('click', raahiLogout);
      link.insertAdjacentElement('afterend', logoutBtn);
    }
  } else {
    link.href = 'login.html';
    link.innerHTML = 'Sign in';
  }
}

document.addEventListener('DOMContentLoaded', () => {

  raahiUpdateAuthNav();

  /* ---- mobile nav toggle ---- */
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => navMenu.classList.toggle('active'));
    navMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => navMenu.classList.remove('active'));
    });
  }

  /* ---- highlight active nav link by current file name ---- */
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ---- scroll reveal ---- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
    });
  }, { threshold: .15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---- footer year ---- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- testimonial slider ---- */
  const slides = document.querySelectorAll('.testi-slide');
  const dotsWrap = document.getElementById('testiDots');
  if (slides.length && dotsWrap) {
    slides.forEach((_, i) => {
      const b = document.createElement('button');
      if (i === 0) b.classList.add('active');
      b.addEventListener('click', () => showSlide(i));
      dotsWrap.appendChild(b);
    });
    let testiIndex = 0;
    function showSlide(i) {
      slides.forEach(s => s.classList.remove('active'));
      [...dotsWrap.children].forEach(d => d.classList.remove('active'));
      slides[i].classList.add('active');
      dotsWrap.children[i].classList.add('active');
      testiIndex = i;
    }
    setInterval(() => showSlide((testiIndex + 1) % slides.length), 5000);
  }

  /* ---- FAQ accordion ---- */
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => q.parentElement.classList.toggle('active'));
  });

  /* ---- generic contact form (no backend — friendly confirmation only) ---- */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      toast('Thanks — your message has been sent. We\'ll reply within 24 hours.', 'success');
      contactForm.reset();
    });
  }
});

/* ---- toast notifications (used across pages) ---- */
function toast(message, type = '') {
  let wrap = document.getElementById('toastWrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'toastWrap';
    wrap.className = 'toast-wrap';
    document.body.appendChild(wrap);
  }
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = message;
  wrap.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transition = 'opacity .4s';
    setTimeout(() => t.remove(), 400);
  }, 3200);
}

/* ---- simple required-field form validation (used by legacy forms) ---- */
function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return true;
  const inputs = form.querySelectorAll('input[required], select[required]');
  for (const input of inputs) {
    if (!input.value) {
      toast('Please fill in all required fields', 'error');
      input.focus();
      return false;
    }
  }
  return true;
}