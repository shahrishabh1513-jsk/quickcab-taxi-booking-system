/* =========================================================
   RT QuickCab  — main.js
   Shared behaviour used across every page
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

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