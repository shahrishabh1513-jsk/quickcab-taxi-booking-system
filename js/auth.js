/* =========================================================
   RT QuickCab  — auth.js
   Login & register form handlers.
   Reads/writes through the account store defined in main.js
   (RT QuickCab CreateAccount, RT QuickCab Authenticate, RT QuickCab GetSession …)
   so a customer's profile really does persist in the browser
   across visits. Swap those functions for real API calls when
   a backend is available — nothing here needs to change.
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

document.addEventListener('DOMContentLoaded', () => {

  /* if already signed in, no need to log in again */
  const existingSession = typeof RT QuickCab GetSession === 'function' ? RT QuickCab GetSession() : null;
  if (existingSession && (document.getElementById('login-form') || document.getElementById('register-form'))) {
    toast(`You're already signed in as ${existingSession.name}`, '');
  }

  /* ---- login form ---- */
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const btn = loginForm.querySelector('button[type="submit"]');
      btn.disabled = true; btn.textContent = 'Signing in…';
      setTimeout(() => {
        try {
          const account = RT QuickCab Authenticate(email, password);
          toast(`Welcome back, ${account.name.split(' ')[0]}!`, 'success');
          setTimeout(() => window.location.href = 'account.html', 700);
        } catch (err) {
          toast(err.message, 'error');
          btn.disabled = false; btn.textContent = 'Sign In';
        }
      }, 700);
    });
  }

  /* ---- register form ---- */
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const phone = document.getElementById('reg-phone').value.trim();
      const password = document.getElementById('reg-password').value;
      const confirm = document.getElementById('confirm-password').value;

      if (password !== confirm) { toast('Passwords do not match!', 'error'); return; }
      if (password.length < 4) { toast('Password should be at least 4 characters.', 'error'); return; }

      const btn = registerForm.querySelector('button[type="submit"]');
      btn.disabled = true; btn.textContent = 'Creating account…';
      setTimeout(() => {
        try {
          RT QuickCab CreateAccount({ name, email, phone, password });
          toast('Account created! Welcome to RT QuickCab .', 'success');
          setTimeout(() => window.location.href = 'account.html', 700);
        } catch (err) {
          toast(err.message, 'error');
          btn.disabled = false; btn.textContent = 'Create Account';
        }
      }, 700);
    });
  }

  /* ---- social buttons (demo only — no real OAuth wired up) ---- */
  document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const provider = btn.classList.contains('google') ? 'Google' : 'Facebook';
      toast(`${provider} sign-in isn't wired to a real provider in this demo.`, '');
    });
  });
});