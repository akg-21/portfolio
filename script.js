/* ─────────────────────────────────────────────────
   script.js — Portfolio interactivity
   ───────────────────────────────────────────────── */

// ── Grid canvas background ─────────────────────────
(function drawGrid() {
  const canvas = document.getElementById('grid-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const step = 50;
    ctx.strokeStyle = 'rgba(0,255,231,0.06)';
    ctx.lineWidth = 1;

    for (let x = 0; x <= canvas.width; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Random glitch dots
    ctx.fillStyle = 'rgba(0,255,231,0.3)';
    for (let i = 0; i < 6; i++) {
      if (Math.random() > 0.7) {
        const gx = Math.floor(Math.random() * (canvas.width / step)) * step;
        const gy = Math.floor(Math.random() * (canvas.height / step)) * step;
        ctx.fillRect(gx - 1, gy - 1, 2, 2);
      }
    }
  }

  draw();
  setInterval(draw, 2000); // re-draw dots occasionally for glitch feel
})();

// ── Nav: active link on scroll + scrolled class ────
const sections = document.querySelectorAll('section[id], div[id="top"]');
const navLinks = document.querySelectorAll('.nav-links a');
const navEl = document.querySelector('nav');

function updateNav() {
  const scrollY = window.scrollY;

  // scrolled class
  if (navEl) navEl.classList.toggle('scrolled', scrollY > 40);

  // scroll-to-top button
  const btn = document.getElementById('scroll-top');
  if (btn) btn.classList.toggle('show', scrollY > 300);

  // active section highlight
  let current = '';
  document.querySelectorAll('section[id]').forEach(sec => {
    if (scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navLinks.forEach(a => {
    a.classList.toggle('active', a.dataset.section === current);
  });
}

window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

// ── Smooth nav scroll (fix window.scrollTo conflict) ─
function navScroll(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Wire up nav links
navLinks.forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const sec = a.dataset.section;
    if (sec) navScroll(sec);
  });
});

// ── Scroll-to-top button ───────────────────────────
const scrollTopBtn = document.getElementById('scroll-top');
if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ── Typing animation ───────────────────────────────
const phrases = [
  'Full Stack Developer',
  'Backend Engineer',
  'DevOps Practitioner',
  'Laravel Specialist',
  'API Architect',
  'Database Optimizer',
  'Open to Opportunities'
];
let pi = 0, ci = 0, deleting = false;

function type() {
  const el = document.getElementById('typed-text');
  if (!el) return;
  const phrase = phrases[pi];

  if (!deleting) {
    ci++;
    el.innerHTML = phrase.slice(0, ci) + '<span class="cursor-blink"></span>';
    if (ci === phrase.length) {
      deleting = true;
      setTimeout(type, 2000);
      return;
    }
  } else {
    ci--;
    el.innerHTML = phrase.slice(0, ci) + '<span class="cursor-blink"></span>';
    if (ci === 0) {
      deleting = false;
      pi = (pi + 1) % phrases.length;
      setTimeout(type, 500);
      return;
    }
  }
  setTimeout(type, deleting ? 45 : 80);
}
setTimeout(type, 800);

// ── Counter animation ──────────────────────────────
function animCount(id, target, dur, suffix = '+') {
  const el = document.getElementById(id);
  if (!el) return;
  let start = null;
  function step(ts) {
    if (!start) start = ts;
    const p = Math.min((ts - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
    el.textContent = Math.floor(eased * target) + (p < 1 ? '' : suffix);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
animCount('cnt1', 2, 1600);
animCount('cnt2', 20, 1900);
animCount('cnt3', 20, 2200);

// ── Project category filter ────────────────────────
const filterBtns = document.querySelectorAll('.filter-btn');
const projCards = document.querySelectorAll('.proj-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active button
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    projCards.forEach((card, i) => {
      const match = filter === 'all' || card.dataset.cat === filter;
      if (match) {
        card.style.display = '';
        setTimeout(() => {
          card.classList.add('visible');
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, i * 80);
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => { card.style.display = 'none'; }, 350);
      }
    });
  });
});

// ── Button ripple effect ───────────────────────────
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function (e) {
    const r = document.createElement('span');
    r.className = 'ripple';
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    r.style.cssText = `
      width:${size}px; height:${size}px;
      left:${e.clientX - rect.left - size / 2}px;
      top:${e.clientY - rect.top - size / 2}px;
    `;
    this.appendChild(r);
    setTimeout(() => r.remove(), 600);
  });
});

// ── IntersectionObserver for scroll animations ─────
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    el.classList.add('visible');

    // Animate skill bars inside this element
    el.querySelectorAll('.skill-bar').forEach(b => {
      b.style.width = b.dataset.w + '%';
    });

    // Staggered fade for timeline items
    el.querySelectorAll('.tl-item').forEach((item, i) => {
      setTimeout(() => item.classList.add('visible'), i * 180);
    });

    // Staggered fade for project cards
    el.querySelectorAll('.proj-card').forEach((card, i) => {
      setTimeout(() => card.classList.add('visible'), i * 130);
    });
  });
}, { threshold: 0.08 });

document.querySelectorAll('.fade-in, section').forEach(el => obs.observe(el));

// Individual card observers
const cardObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      cardObs.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.tl-item, .proj-card').forEach(el => cardObs.observe(el));

// ── Terminal footer: typewriter on scroll ──────────
const termLines = document.querySelectorAll('.term-typed');
const termObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const lines = e.target.querySelectorAll('.term-line');
    lines.forEach((line, i) => {
      setTimeout(() => line.classList.add('term-show'), i * 300);
    });
    termObs.unobserve(e.target);
  });
}, { threshold: 0.3 });

const termFooter = document.querySelector('.terminal-footer');
if (termFooter) termObs.observe(termFooter);

// ── Nav logo click → scroll top ────────────────────
document.querySelector('.nav-logo')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
