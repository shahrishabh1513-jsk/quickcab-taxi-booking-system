/* =========================================================
   RT QuickCab  — auth.js
   Front-end demo authentication (no backend attached).
   Stores a lightweight session in localStorage so the UI
   flow feels complete; swap the resolve() bodies for real
   API calls when you wire up a backend.
   ========================================================= */

function toggleAuthPassword(id, iconEl) {
  const input = document.getElementById(id);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    iconEl.classList.remove('fa-eye');
    iconEl.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    iconEl.classList.remove('fa-eye-slash');
    iconEl.classList.add('fa-eye');
  }
}

function mockLogin(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email && password.length >= 4) {
        localStorage.setItem('RT QuickCab _user', JSON.stringify({ name: email.split('@')[0], email }));
        resolve({ success: true });
      } else {
        reject({ message: 'Please enter a valid email and a password of at least 4 characters.' });
      }
    }, 900);
  });
}

function mockRegister(data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (data.name && data.email && data.password) {
        localStorage.setItem('RT QuickCab _user', JSON.stringify({ name: data.name, email: data.email }));
        resolve({ success: true });
      } else {
        reject({ message: 'Please fill in all required fields.' });
      }
    }, 900);
  });
}

document.addEventListener('DOMContentLoaded', () => {

  /* ---- login form ---- */
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const btn = loginForm.querySelector('button[type="submit"]');
      btn.disabled = true; btn.textContent = 'Signing in…';
      try {
        await mockLogin(email, password);
        toast('Login successful! Welcome back.', 'success');
        setTimeout(() => window.location.href = 'book-ride.html', 900);
      } catch (err) {
        toast(err.message, 'error');
        btn.disabled = false; btn.textContent = 'Sign In';
      }
    });
  }

  /* ---- register form ---- */
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async e => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value;
      const email = document.getElementById('reg-email').value;
      const phone = document.getElementById('reg-phone').value;
      const password = document.getElementById('reg-password').value;
      const confirm = document.getElementById('confirm-password').value;

      if (password !== confirm) { toast('Passwords do not match!', 'error'); return; }

      const btn = registerForm.querySelector('button[type="submit"]');
      btn.disabled = true; btn.textContent = 'Creating account…';
      try {
        await mockRegister({ name, email, phone, password });
        toast('Registration successful! Please sign in.', 'success');
        setTimeout(() => window.location.href = 'login.html', 1000);
      } catch (err) {
        toast(err.message, 'error');
        btn.disabled = false; btn.textContent = 'Create Account';
      }
    });
  }

  /* ---- social buttons (demo only) ---- */
  document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const provider = btn.classList.contains('google') ? 'Google' : 'Facebook';
      toast(`${provider} sign-in isn't wired to a real provider in this demo.`, '');
    });
  });
});