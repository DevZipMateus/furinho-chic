'use strict';

/* =============================================
   FURINHO CHIC — script.js
   ============================================= */

// ── 1. SCROLL PROGRESS BAR ──────────────────────
const progressBar = document.createElement('div');
progressBar.id = 'scroll-progress';
document.body.prepend(progressBar);

window.addEventListener('scroll', () => {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  if (total > 0) progressBar.style.width = (window.scrollY / total * 100) + '%';
}, { passive: true });


// ── 2. HEADER SOMBRA NO SCROLL ──────────────────
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });


// ── 3. HAMBURGER MENU ───────────────────────────
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileNav');
const overlay    = document.getElementById('overlay');

function openMenu() {
  mobileMenu.classList.add('open');
  hamburger.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  mobileMenu.setAttribute('aria-hidden', 'false');
  if (overlay) overlay.classList.add('show');
}

function closeMenu() {
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  mobileMenu.setAttribute('aria-hidden', 'true');
  if (overlay) overlay.classList.remove('show');
}

hamburger.addEventListener('click', () => {
  mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
});

document.querySelectorAll('.mobile-nav a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

if (overlay) overlay.addEventListener('click', closeMenu);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
    closeMenu();
    hamburger.focus();
  }
});


// ── 4. NAV — LINK ATIVO NO SCROLL ───────────────
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.desktop-nav a, .mobile-nav a');

const highlightNav = () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navLinks.forEach(a => {
    a.classList.toggle('ativo', a.getAttribute('href') === `#${current}`);
  });
};

window.addEventListener('scroll', highlightNav, { passive: true });
highlightNav();


// ── 5. RIPPLE NOS BOTÕES ─────────────────────────
document.querySelectorAll('.btn, .btn-ouro, .btn-outline-ouro, .btn-outline-escuro, .btn-wpp-contato').forEach(btn => {
  btn.addEventListener('click', function (e) {
    const rect   = this.getBoundingClientRect();
    const circle = document.createElement('span');
    const size   = Math.max(rect.width, rect.height);
    circle.className = 'ripple';
    circle.style.cssText = `
      width:${size}px;height:${size}px;
      left:${e.clientX - rect.left - size / 2}px;
      top:${e.clientY - rect.top  - size / 2}px;
    `;
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(circle);
    setTimeout(() => circle.remove(), 700);
  });
});


// ── 6. TILT 3D NOS CARDS ────────────────────────
if (!('ontouchstart' in window)) {
  document.querySelectorAll('.servico-card, .mvv-card, .depoimento-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width  / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `perspective(800px) rotateY(${dx * 6}deg) rotateX(${-dy * 6}deg) translateZ(4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}


// ── 7. REVEAL NO SCROLL ─────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), 60);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll(
  '.servico-card, .mvv-card, .depoimento-card, .galeria-item, ' +
  '.badge-valor, .contato-card, .contato-mapa, ' +
  '.section-tag, .sobre-texto, .proposito-quote'
).forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});


// ── 8. SMOOTH SCROLL ────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const headerH = document.querySelector('.header')?.offsetHeight || 80;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - headerH, behavior: 'smooth' });
  });
});


// ── 9. CARROSSEL DE DEPOIMENTOS ─────────────────
(function () {
  const carrossel = document.getElementById('depoCarrossel');
  if (!carrossel) return;

  const track    = carrossel.querySelector('.depo-track');
  const viewport = carrossel.querySelector('.depo-viewport');
  const slides   = carrossel.querySelectorAll('.depo-slide');
  const dots     = carrossel.querySelectorAll('.depo-dot');
  const btnPrev  = carrossel.querySelector('.depo-prev');
  const btnNext  = carrossel.querySelector('.depo-next');
  const total    = slides.length;
  let current    = 0;
  let autoTimer;

  function goTo(index) {
    current = ((index % total) + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }

  btnPrev.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  btnNext.addEventListener('click', () => { goTo(current + 1); startAuto(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); startAuto(); }));

  // Suporte a swipe / touch
  let touchX = 0;
  viewport.addEventListener('touchstart', e => {
    touchX = e.changedTouches[0].clientX;
  }, { passive: true });
  viewport.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) { dx < 0 ? goTo(current + 1) : goTo(current - 1); startAuto(); }
  }, { passive: true });

  // Pausa ao passar o mouse
  carrossel.addEventListener('mouseenter', () => clearInterval(autoTimer));
  carrossel.addEventListener('mouseleave', startAuto);

  startAuto();
})();


// ── 10. GALERIA — LIGHTBOX SIMPLES ──────────────
document.querySelectorAll('.galeria-item:not(.placeholder)').forEach(item => {
  item.style.cursor = 'zoom-in';
  item.addEventListener('click', () => {
    const img = item.querySelector('img');
    if (!img) return;

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(42,31,14,0.9);
      z-index:9999;display:flex;align-items:center;justify-content:center;
      cursor:zoom-out;padding:24px;
    `;
    const clone = document.createElement('img');
    clone.src = img.src;
    clone.alt = img.alt;
    clone.style.cssText = `
      max-width:90vw;max-height:90vh;object-fit:contain;
      border-radius:8px;border:2px solid rgba(196,151,59,0.4);
    `;
    overlay.appendChild(clone);
    document.body.appendChild(overlay);
    overlay.addEventListener('click', () => overlay.remove());
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', esc); }
    });
  });
});
