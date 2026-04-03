/* ============================================================
   MyWebProfi – script.js
   Funktionen: Navigation, Scroll-Animationen, Counter,
               FAQ-Accordion, Kontaktformular, Back-to-Top
   ============================================================ */

'use strict';

/* =================== Helper =================== */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* =================== DOM-Ready =================== */
document.addEventListener('DOMContentLoaded', () => {

  // Footer-Jahr setzen
  const yearEl = qs('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  initNav();
  initReveal();
  initCounters();
  initFAQ();
  initForm();
  initBackToTop();
  initSmoothScroll();
});

/* =================== Navigation =================== */
function initNav() {
  const header  = qs('#site-header');
  const toggle  = qs('#nav-toggle');
  const navLinks = qs('#nav-links');

  // Scrolled-Klasse für Transparenz → gefüllt
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile Toggle
  toggle?.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    // Scrollen im Hintergrund sperren
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Menü schließen bei Link-Klick
  navLinks?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Menü schließen bei Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      toggle.focus();
    }
  });
}

/* =================== Scroll-Reveal =================== */
function initReveal() {
  const elements = qsa('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
}

/* =================== Counter Animation =================== */
function initCounters() {
  const counters = qsa('.stat-number[data-target]');
  if (!counters.length) return;

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const startTime = performance.now();

    const tick = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => observer.observe(el));
}

/* =================== FAQ Accordion =================== */
function initFAQ() {
  const items = qsa('.faq-item');

  items.forEach(item => {
    const btn    = qs('.faq-question', item);
    const answer = qs('.faq-answer', item);
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Alle anderen schließen (optional: auskommentieren für Multi-Open)
      items.forEach(other => {
        if (other !== item) {
          qs('.faq-question', other)?.setAttribute('aria-expanded', 'false');
          const otherAnswer = qs('.faq-answer', other);
          if (otherAnswer) otherAnswer.hidden = true;
        }
      });

      // Dieses toggling
      btn.setAttribute('aria-expanded', String(!isOpen));
      answer.hidden = isOpen;

      // Weiche Höhen-Animation via max-height
      if (!isOpen) {
        answer.hidden = false;
        answer.style.maxHeight = '0';
        answer.style.overflow  = 'hidden';
        answer.style.transition = 'max-height 0.35s cubic-bezier(0.22,1,0.36,1)';
        requestAnimationFrame(() => {
          answer.style.maxHeight = answer.scrollHeight + 'px';
        });
        answer.addEventListener('transitionend', () => {
          answer.style.maxHeight = '';
          answer.style.overflow  = '';
        }, { once: true });
      } else {
        answer.style.maxHeight = answer.scrollHeight + 'px';
        answer.style.overflow  = 'hidden';
        answer.style.transition = 'max-height 0.3s cubic-bezier(0.65,0,0.35,1)';
        requestAnimationFrame(() => {
          answer.style.maxHeight = '0';
        });
        answer.addEventListener('transitionend', () => {
          answer.hidden = true;
          answer.style.maxHeight = '';
          answer.style.overflow  = '';
        }, { once: true });
      }
    });
  });
}

/* =================== Kontaktformular =================== */
function initForm() {
  const form    = qs('#kontakt-form');
  const success = qs('#form-success');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Einfache Validierung
    const requiredFields = form.querySelectorAll('[required]');
    let valid = true;

    requiredFields.forEach(field => {
      field.classList.remove('error');
      if (!field.value.trim() || (field.type === 'checkbox' && !field.checked)) {
        field.classList.add('error');
        valid = false;
      }
    });

    if (!valid) {
      const firstError = form.querySelector('.error');
      firstError?.focus();
      shakeForm(form);
      return;
    }

    // Submit-Button: Ladestate
    const submitBtn = form.querySelector('.form-submit');
    const btnText   = submitBtn?.querySelector('.btn-text');
    if (btnText) btnText.textContent = 'Wird gesendet…';
    if (submitBtn) submitBtn.disabled = true;

    // ─────────────────────────────────────────────────────────────────
    // TODO: Hier die echte Backend-Anbindung einbauen, z.B.:
    //
    // Option A – Netlify Forms (einfachste Lösung beim Netlify-Hosting):
    //   Füge dem <form>-Tag hinzu: data-netlify="true" name="kontakt"
    //   Entferne dann den event.preventDefault() nicht – Netlify fängt ab.
    //
    // Option B – Formspree (formspree.io – kostenloser Plan):
    //   const res = await fetch('https://formspree.io/f/DEIN-ID', {
    //     method: 'POST', body: new FormData(form),
    //     headers: { 'Accept': 'application/json' }
    //   });
    //
    // Option C – EmailJS (emailjs.com):
    //   emailjs.sendForm('SERVICE_ID', 'TEMPLATE_ID', form);
    // ─────────────────────────────────────────────────────────────────

    // Demo-Simulation (2 Sekunden Verzögerung)
    await delay(2000);

    // Erfolg anzeigen
    form.reset();
    if (submitBtn) { submitBtn.disabled = false; }
    if (btnText)   { btnText.textContent = 'Nachricht senden'; }
    if (success)   { success.hidden = false; success.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
  });

  // Fehler-Styling entfernen beim Tippen
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => field.classList.remove('error'));
    field.addEventListener('change', () => field.classList.remove('error'));
  });
}

function shakeForm(form) {
  form.style.animation = 'none';
  form.offsetHeight; // Reflow
  form.style.animation = 'shake 0.4s ease-in-out';
}

/* =================== Back to Top =================== */
function initBackToTop() {
  const btn = qs('#back-to-top');
  if (!btn) return;

  const toggle = () => {
    const show = window.scrollY > 500;
    btn.hidden = !show;
  };

  window.addEventListener('scroll', toggle, { passive: true });
  toggle();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* =================== Smooth Scroll =================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* =================== Utility =================== */
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

/* =================== Extra CSS (inline für shake-Animation) =================== */
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-5px); }
    80% { transform: translateX(5px); }
  }
  input.error, textarea.error, select.error {
    border-color: #e53e3e !important;
    box-shadow: 0 0 0 3px rgba(229,62,62,0.12) !important;
  }
  input[type="checkbox"].error {
    outline: 2px solid #e53e3e;
    outline-offset: 2px;
  }
`;
document.head.appendChild(style);
