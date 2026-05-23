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

// ══════════════════════════════════════════════════════
//  INTERACTIVE TERMINAL ENGINE
// ══════════════════════════════════════════════════════
(function Terminal() {
  const history   = document.getElementById('term-history');
  const inputEl   = document.getElementById('term-input');
  const inputRow  = document.getElementById('term-input-row');
  const container = document.getElementById('interactive-terminal');

  if (!history || !inputEl) return;

  // ── Command history (arrow navigation) ─────────────
  const cmdHistory = [];
  let   histIdx    = -1;

  // ── All known commands ──────────────────────────────
  const COMMANDS = {
    help       : cmdHelp,
    about      : cmdAbout,
    whoami     : cmdWhoami,
    projects   : cmdProjects,
    contact    : cmdContact,
    skills     : cmdSkills,
    experience : cmdExperience,
    clear      : cmdClear,
    echo       : cmdEcho,
    date       : cmdDate,
    ls         : cmdLs,
    pwd        : cmdPwd,
    open       : cmdOpen,
  };

  // ── Output helpers ──────────────────────────────────
  function line(text = '', cls = '') {
    const d = document.createElement('div');
    d.className = 'term-line' + (cls ? ' ' + cls : '');
    d.innerHTML = text;
    history.appendChild(d);
    return d;
  }
  function sep() {
    const d = document.createElement('div');
    d.className = 'term-sep';
    history.appendChild(d);
  }
  function blank() { line('&nbsp;'); }
  function scroll() {
    history.scrollTop = history.scrollHeight;
  }
  function echoInput(cmd) {
    line(
      `<span class="prompt">ajay@portfolio:~$</span>&nbsp;<span class="cmd">${escHtml(cmd)}</span>`
    );
  }
  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Boot / welcome sequence ─────────────────────────
  function boot() {
    const lines = [
      { t: 0,   fn: () => line('Initializing portfolio shell...', 'out-dim') },
      { t: 280, fn: () => line('✓  kernel: portfolio-os v2.0', 'out-success') },
      { t: 420, fn: () => line('✓  modules: skills, projects, contact loaded', 'out-success') },
      { t: 600, fn: () => sep() },
      { t: 700, fn: () => line('Welcome! Type <span style="color:var(--neon)">help</span> to see available commands.', 'output') },
      { t: 820, fn: () => line('<span style="color:var(--muted);font-size:10px">Tip: use ↑ ↓ to navigate history, Tab to autocomplete.</span>', 'out-dim') },
      { t: 820, fn: () => sep() },
      { t: 840, fn: () => scroll() },
    ];
    lines.forEach(({ t, fn }) => setTimeout(fn, t));
  }

  // ── Commands ────────────────────────────────────────
  function cmdHelp() {
    const cmds = [
      ['help',       'Show this help message'],
      ['about',      'About Ajay — background & philosophy'],
      ['whoami',     'Quick identity card'],
      ['skills',     'Tech stack & proficiency'],
      ['experience', 'Work history'],
      ['projects',   'Personal project showcase'],
      ['contact',    'Get in touch'],
      ['open <url>', 'Open a link (github / linkedin / email)'],
      ['echo <msg>', 'Print a message'],
      ['date',       'Current date & time'],
      ['ls',         'List portfolio sections'],
      ['pwd',        'Print working directory'],
      ['clear',      'Clear the terminal'],
    ];
    sep();
    line('AVAILABLE COMMANDS', 'out-section');
    sep();
    cmds.forEach(([cmd, desc]) => {
      line(
        `<span style="color:var(--neon);min-width:140px;display:inline-block">${escHtml(cmd)}</span>` +
        `<span style="color:var(--muted)">—</span>&nbsp;` +
        `<span style="color:var(--text)">${escHtml(desc)}</span>`,
        'output'
      );
    });
    sep();
  }

  function cmdAbout() {
    sep();
    line('// ABOUT AJAY KRISHNAN G', 'out-section');
    sep();
    line('Full Stack Developer with a passion for backend engineering & DevOps.', 'output');
    line('2+ years shipping production-grade systems across Laravel, Node.js, and Python.', 'output');
    blank();
    line('Philosophy: clean APIs, lean databases, and zero-downtime deployments.', 'output');
    blank();
    line('Currently: Full Stack Developer @ Saiha Software Technologies — Kochi', 'output');
    line('MSc Computer Science with Data Analytics — Rajagiri College, 2024', 'output');
    sep();
  }

  function cmdWhoami() {
    sep();
    line('Ajay Krishnan G — Full Stack Developer', 'out-success');
    line('Backend &middot; DevOps &middot; Laravel &middot; Node.js &middot; MySQL', 'output');
    line('Location: Kottayam, Kerala, India', 'out-dim');
    line('Status: <span style="color:#28c840">● Available for opportunities</span>', 'output');
    sep();
  }

  function cmdSkills() {
    sep();
    line('// TECH STACK', 'out-section');
    sep();
    const groups = [
      ['Backend & Frameworks', [
        ['Laravel / PHP', 92],
        ['Yii2', 82],
        ['Node.js / Express', 76],
        ['Spring Boot / Java', 70],
        ['REST API / MVC', 90],
      ]],
      ['Database, DevOps & Tools', [
        ['MySQL', 88],
        ['Linux / Server Admin', 78],
        ['AWS', 65],
        ['Git / Bitbucket', 85],
        ['Python', 72],
      ]],
    ];
    groups.forEach(([gname, items]) => {
      line(`// ${gname}`, 'out-dim');
      items.forEach(([name, pct]) => {
        const filled = Math.round(pct / 5);
        const bar    = '█'.repeat(filled) + '░'.repeat(20 - filled);
        line(
          `<span style="color:var(--text);min-width:160px;display:inline-block">${escHtml(name)}</span>` +
          `<span style="color:var(--neon)">${bar}</span>` +
          `<span style="color:var(--muted)"> ${pct}%</span>`,
          'output'
        );
      });
      blank();
    });
    sep();
  }

  function cmdExperience() {
    sep();
    line('// EXPERIENCE', 'out-section');
    sep();
    line('Full Stack Developer', 'out-success');
    line('Saiha Software Technologies Pvt. Ltd — Kochi', 'output');
    line('2024 — PRESENT', 'out-dim');
    [
      'Built RESTful APIs & backend logic with Laravel and Yii2',
      'Optimized MySQL databases for high-volume data handling',
      'Applied MVC architecture across multiple client projects',
      'Conducted R&D into frameworks & automation tooling',
    ].forEach(b => line(`› ${b}`, 'out-dim'));
    blank();
    line('Full Stack Web Developer', 'out-success');
    line('Freelance', 'output');
    line('2022 — 2024', 'out-dim');
    [
      'Custom web apps with Laravel, PHP & JSP',
      'Managed full deployment cycle — dev to production',
      'Optimized MySQL databases for client projects',
    ].forEach(b => line(`› ${b}`, 'out-dim'));
    sep();
  }

  function cmdProjects() {
    sep();
    line('// PROJECTS', 'out-section');
    sep();
    const projs = [
      {
        name : 'Career Compass V2',
        stack: 'React · Node.js · Express · MySQL',
        desc : 'AI-powered career guidance & job platform with REST APIs and auth.',
        links: [['GitHub (backend)', 'https://github.com/akg-21/career_compass_v2_backend'],
                ['GitHub (frontend)', 'https://github.com/akg-21/career_compass__v2_frontend']],
      },
      {
        name : 'Smart Waste Management',
        stack: 'Laravel · Python · TensorFlow · MySQL',
        desc : 'AI civic-tech system for complaint severity prediction via deep learning.',
        links: [['GitHub (main)', 'https://github.com/akg-21/waste_management_and-_complaints_with_severity_laravel_python'],
                ['GitHub (DL model)', 'https://github.com/akg-21/Deep_Learning_project_Waste_Management']],
      },
      {
        name : 'Multi-Level Affiliate Payout',
        stack: 'Laravel · MySQL · PHP',
        desc : 'Recursive commission engine, wallet management & multi-tier referral logic.',
        links: [['GitHub', 'https://github.com/akg-21/multi_level_affiliate_payout_system']],
      },
      {
        name : 'Fall Detection & Health Monitor',
        stack: 'Node.js · Python · WebSockets · AI',
        desc : 'Real-time AI health system with fall detection, alerts & dashboard.',
        links: [['GitHub (backend)', 'https://github.com/akg-21/health_app_backend'],
                ['GitHub (frontend)', 'https://github.com/akg-21/health_app_frontend']],
      },
      {
        name : 'Spring Boot E-Commerce',
        stack: 'Spring Boot · Java · MySQL · REST',
        desc : 'Enterprise e-commerce with JWT auth, CRUD, and optimized REST APIs.',
        links: [['GitHub', 'https://github.com/akg-21/Spring-Boot-Ecom']],
      },
    ];
    projs.forEach((p, i) => {
      line(`[${i + 1}] <span style="color:#fff;font-weight:700">${escHtml(p.name)}</span>`, 'output');
      line(`    Stack: <span style="color:var(--neon)">${escHtml(p.stack)}</span>`, 'out-dim');
      line(`    ${escHtml(p.desc)}`, 'out-dim');
      p.links.forEach(([label, url]) => {
        line(`    <a href="${url}" target="_blank" rel="noopener">${escHtml(label)} ↗</a>`, 'out-link');
      });
      blank();
    });
    sep();
  }

  function cmdContact() {
    sep();
    line('// CONTACT', 'out-section');
    sep();
    const items = [
      ['Email',    '<a href="mailto:ajaykrishnan.g21@gmail.com">ajaykrishnan.g21@gmail.com</a>'],
      ['Phone',    '<a href="tel:+916238448078">+91 6238448078</a>'],
      ['LinkedIn', '<a href="https://linkedin.com/in/ajaykg21" target="_blank" rel="noopener">linkedin.com/in/ajaykg21 ↗</a>'],
      ['GitHub',   '<a href="https://github.com/akg-21" target="_blank" rel="noopener">github.com/akg-21 ↗</a>'],
      ['Location', 'Kottayam, Kerala, India'],
    ];
    items.forEach(([label, val]) => {
      line(
        `<span style="color:var(--neon);min-width:80px;display:inline-block">${label}</span>` +
        `<span style="color:var(--muted)">›</span>&nbsp;${val}`,
        'out-link'
      );
    });
    sep();
  }

  function cmdClear() {
    history.innerHTML = '';
    line('Terminal cleared. Type <span style="color:var(--neon)">help</span> for commands.', 'out-dim');
    sep();
  }

  function cmdEcho(args) {
    const msg = args.join(' ');
    line(msg ? escHtml(msg) : '(empty)', 'output');
  }

  function cmdDate() {
    const now = new Date();
    sep();
    line(`${now.toDateString()} ${now.toLocaleTimeString()}`, 'out-success');
    line(`Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`, 'out-dim');
    sep();
  }

  function cmdLs() {
    const sections = ['skills/', 'experience/', 'education/', 'projects/', 'contact/'];
    sep();
    line(sections.map(s => `<span style="color:var(--neon)">${s}</span>`).join('  '), 'output');
    sep();
  }

  function cmdPwd() {
    line('/home/ajay/portfolio', 'out-success');
  }

  function cmdOpen(args) {
    const shortcuts = {
      github   : 'https://github.com/akg-21',
      linkedin : 'https://linkedin.com/in/ajaykg21',
      email    : 'mailto:ajaykrishnan.g21@gmail.com',
    };
    const target = args[0]?.toLowerCase();
    const url    = shortcuts[target] || target;
    if (!url) {
      line('Usage: open &lt;github | linkedin | email | url&gt;', 'out-error');
      return;
    }
    line(`Opening: <a href="${url}" target="_blank" rel="noopener">${escHtml(url)} ↗</a>`, 'out-link');
    window.open(url, '_blank', 'noopener');
  }

  // ── Execute a command string ─────────────────────────
  function execute(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return;

    // save to history
    cmdHistory.unshift(trimmed);
    histIdx = -1;

    echoInput(trimmed);

    const parts   = trimmed.split(/\s+/);
    const cmd     = parts[0].toLowerCase();
    const args    = parts.slice(1);
    const handler = COMMANDS[cmd];

    if (handler) {
      handler(args);
    } else {
      line(`bash: <span style="color:var(--neon3)">${escHtml(cmd)}</span>: command not found. Try <span style="color:var(--neon)">help</span>.`, 'out-error');
    }
    scroll();
  }

  // ── Tab completion ───────────────────────────────────
  function tabComplete(partial) {
    const keys  = Object.keys(COMMANDS);
    const match = keys.filter(k => k.startsWith(partial.toLowerCase()));
    if (match.length === 1) {
      inputEl.value = match[0];
    } else if (match.length > 1) {
      echoInput(partial);
      line(match.join('  '), 'out-dim');
      scroll();
    }
  }

  // ── Event listeners ──────────────────────────────────
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = inputEl.value;
      inputEl.value = '';
      execute(val);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx < cmdHistory.length - 1) {
        histIdx++;
        inputEl.value = cmdHistory[histIdx] || '';
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx > 0) {
        histIdx--;
        inputEl.value = cmdHistory[histIdx] || '';
      } else {
        histIdx = -1;
        inputEl.value = '';
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (inputEl.value.trim()) tabComplete(inputEl.value.trim());
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      execute('clear');
    }
  });

  // Click anywhere on terminal → focus input
  container.addEventListener('click', () => inputEl.focus());

  // ── Boot ─────────────────────────────────────────────
  boot();
})();

// ── Contact Form Submission ────────────────────────────
(function ContactForm() {
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('cf-status');
  const submitBtn = document.getElementById('cf-submit');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('cf-name').value.trim();
    const email = document.getElementById('cf-email').value.trim();
    const message = document.getElementById('cf-message').value.trim();
    
    if (!name || !email || !message) return;

    submitBtn.textContent = '$ sending...';
    submitBtn.disabled = true;
    statusEl.className = 'cf-status';
    statusEl.textContent = '';

    try {
      const BACKEND_URL = 'https://portfolio-backend-ten-zeta.vercel.app/api/message';
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        statusEl.textContent = '> Message sent successfully.';
        statusEl.classList.add('success');
        form.reset();
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (err) {
      statusEl.textContent = '> Error: ' + err.message;
      statusEl.classList.add('error');
    } finally {
      submitBtn.textContent = '$ send --message';
      submitBtn.disabled = false;
    }
  });
})();
