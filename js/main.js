/* =========================================================
   RT QuickCab  — main.js
   Shared behaviour used across every page
   ========================================================= */

/* =================================================================
   CUSTOMER ACCOUNT & DATA STORE
   Everything below persists in the browser's localStorage, so a
   customer's profile, saved addresses and ride history survive
   page reloads and repeat visits on the same device/browser.
   There is no backend attached — swap RT QuickCab _DB for real API calls
   when you have a server, keeping these same function names so
   nothing else on the site needs to change.
   ================================================================= */
const RT QuickCab _DB = {
  ACCOUNTS_KEY: 'RT QuickCab _accounts',      // [{name,email,phone,password,createdAt}]
  SESSION_KEY: 'RT QuickCab _session',        // "current@user.email" | null
  addressesKey: email => `RT QuickCab _addresses_${email}`,
  ridesKey: email => `RT QuickCab _rides_${email}`,
};

function RT QuickCab GetAccounts() {
  try { return JSON.parse(localStorage.getItem(RT QuickCab _DB.ACCOUNTS_KEY)) || []; }
  catch { return []; }
}
function RT QuickCab SaveAccounts(list) {
  localStorage.setItem(RT QuickCab _DB.ACCOUNTS_KEY, JSON.stringify(list));
}
function RT QuickCab FindAccount(email) {
  return RT QuickCab GetAccounts().find(a => a.email.toLowerCase() === (email || '').toLowerCase());
}
function RT QuickCab CreateAccount({ name, email, phone, password }) {
  const accounts = RT QuickCab GetAccounts();
  if (RT QuickCab FindAccount(email)) throw new Error('An account with this email already exists.');
  const account = { name, email, phone: phone || '', password, createdAt: new Date().toISOString() };
  accounts.push(account);
  RT QuickCab SaveAccounts(accounts);
  RT QuickCab SetSession(email);
  return account;
}
function RT QuickCab Authenticate(email, password) {
  const account = RT QuickCab FindAccount(email);
  if (!account || account.password !== password) throw new Error('Incorrect email or password.');
  RT QuickCab SetSession(email);
  return account;
}
function RT QuickCab UpdateAccount(email, updates) {
  const accounts = RT QuickCab GetAccounts();
  const idx = accounts.findIndex(a => a.email.toLowerCase() === email.toLowerCase());
  if (idx === -1) return null;
  accounts[idx] = { ...accounts[idx], ...updates };
  RT QuickCab SaveAccounts(accounts);
  return accounts[idx];
}
function RT QuickCab SetSession(email) { localStorage.setItem(RT QuickCab _DB.SESSION_KEY, email); }
function RT QuickCab GetSession() {
  const email = localStorage.getItem(RT QuickCab _DB.SESSION_KEY);
  return email ? RT QuickCab FindAccount(email) : null;
}
function RT QuickCab Logout() {
  localStorage.removeItem(RT QuickCab _DB.SESSION_KEY);
  toast('You have been signed out', '');
  setTimeout(() => window.location.href = 'index.html', 500);
}

/* ---- saved addresses ---- */
function RT QuickCab GetAddresses(email) {
  try { return JSON.parse(localStorage.getItem(RT QuickCab _DB.addressesKey(email))) || []; }
  catch { return []; }
}
function RT QuickCab SaveAddress(email, address) {
  const list = RT QuickCab GetAddresses(email);
  list.push({ id: 'addr_' + Date.now(), ...address });
  localStorage.setItem(RT QuickCab _DB.addressesKey(email), JSON.stringify(list));
  return list;
}
function RT QuickCab DeleteAddress(email, id) {
  const list = RT QuickCab GetAddresses(email).filter(a => a.id !== id);
  localStorage.setItem(RT QuickCab _DB.addressesKey(email), JSON.stringify(list));
  return list;
}

/* ---- ride history ---- */
function RT QuickCab GetRides(email) {
  const key = RT QuickCab _DB.ridesKey(email || 'guest');
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
}
function RT QuickCab SaveRide(email, ride) {
  const key = RT QuickCab _DB.ridesKey(email || 'guest');
  const list = RT QuickCab GetRides(email);
  list.unshift({ id: 'ride_' + Date.now(), bookedAt: new Date().toISOString(), ...ride });
  localStorage.setItem(key, JSON.stringify(list));
  return list;
}

/* ---- wipe everything for the logged-in customer ---- */
function RT QuickCab ClearMyData(email) {
  localStorage.removeItem(RT QuickCab _DB.addressesKey(email));
  localStorage.removeItem(RT QuickCab _DB.ridesKey(email));
  const accounts = RT QuickCab GetAccounts().filter(a => a.email.toLowerCase() !== email.toLowerCase());
  RT QuickCab SaveAccounts(accounts);
  localStorage.removeItem(RT QuickCab _DB.SESSION_KEY);
}

/* ---- reflect login state in the navbar on every page ---- */
function RT QuickCab UpdateAuthNav() {
  const link = document.getElementById('navAuthLink');
  if (!link) return;
  const user = RT QuickCab GetSession();
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
      logoutBtn.addEventListener('click', RT QuickCab Logout);
      link.insertAdjacentElement('afterend', logoutBtn);
    }
  } else {
    link.href = 'login.html';
    link.innerHTML = 'Sign in';
  }
}

document.addEventListener('DOMContentLoaded', () => {

  RT QuickCab UpdateAuthNav();

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