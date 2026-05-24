/* ─────────────────────────────────────────────────
   github.js — GitHub Activity Section (with year selector)
   ───────────────────────────────────────────────── */

(function GitHubActivity() {
  const BACKEND_URL = 'https://portfolio-backend-ten-zeta.vercel.app/api/github';
  const USERNAME = 'akg-21';
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const LANG_COLORS = {
    JavaScript: '#f1e05a', PHP: '#4F5D95', Python: '#3572A5',
    HTML: '#e34c26', CSS: '#563d7c', TypeScript: '#2b7489', Java: '#b07219'
  };

  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];

  let userData = null;
  let reposData = null;
  let contribCache = {};  // year → calendar

  const root = document.getElementById('gh-root');
  const loading = document.getElementById('gh-loading');

  if (!root) return;

  // ── Fetch user + repos via backend proxy (once) ─────
  async function fetchUser() {
    const res = await fetch(BACKEND_URL);
    const json = await res.json();
    const u = json.data.user;

    // Map to the shape the render functions expect
    userData = {
      login: USERNAME,
      name: u.name,
      bio: u.bio,
      avatar_url: u.avatarUrl,
      public_repos: u.repositories.nodes.length,
      followers: 0,
      following: 0
    };

    // Map GraphQL repo nodes → REST-like shape for buildRepos()
    reposData = u.repositories.nodes
      .filter(r => r.name !== 'multi_level_affiliate_payout_system')
      .map(r => ({
        name: r.name,
        description: r.description,
        html_url: r.url,
        stargazers_count: r.stargazerCount,
        forks_count: r.forkCount || 0,
        language: r.primaryLanguage?.name || null,
        _langColor: r.primaryLanguage?.color || null
      }));

    // Cache the current-year calendar only if it includes weekly breakdown
    const cal = u.contributionsCollection?.contributionCalendar;
    if (cal?.weeks?.length) contribCache[currentYear] = cal;
  }

  // ── Fetch contribution calendar via backend proxy (cached per year) ─
  async function fetchContribs(year) {
    if (contribCache[year]) return contribCache[year];
    const res = await fetch(`${BACKEND_URL}?year=${year}`);
    const json = await res.json();
    const cal = json.data.user.contributionsCollection.contributionCalendar;
    contribCache[year] = cal;
    return cal;
  }

  // ── Build month label row ─────────────────────────
  function buildMonthLabels(weeks) {
    let lastMonth = -1;
    return weeks.map(week => {
      if (!week.contributionDays.length) return '<div class="month-label"></div>';
      const m = new Date(week.contributionDays[0].date).getMonth();
      if (m !== lastMonth) { lastMonth = m; return `<div class="month-label">${MONTHS[m]}</div>`; }
      return '<div class="month-label"></div>';
    }).join('');
  }

  // ── Build week cells HTML ─────────────────────────
  function buildWeeksHTML(weeks, year) {
    return weeks.map(week => {
      const days = week.contributionDays.map(day => {
        const c = day.contributionCount;
        const lvl = c === 0 ? 0 : c < 3 ? 1 : c < 6 ? 2 : c < 10 ? 3 : 4;
        const dt = new Date(day.date);
        const lbl = `${c} contribution${c !== 1 ? 's' : ''} on ${MONTHS[dt.getMonth()]} ${dt.getDate()}, ${year}`;
        return `<div class="day-cell l${lvl}" data-tip="${lbl}"></div>`;
      }).join('');
      return `<div class="week">${days}</div>`;
    }).join('');
  }

  // ── Build full heatmap card HTML ──────────────────
  function buildHeatmapCard(calendar, year) {
    const total = calendar.totalContributions;
    const weeks = calendar.weeks;
    const tabsHTML = years.map(y =>
      `<button class="year-btn${y === year ? ' active' : ''}" onclick="ghSwitchYear(${y})">${y}</button>`
    ).join('');

    return `
      <div class="heatmap-card gh-fade" id="gh-heatmap-card">
        <div class="heatmap-top">
          <div>
            <div class="heatmap-title">Contribution activity</div>
            <div class="contrib-count" id="gh-contrib-count">${total} contributions in ${year}</div>
          </div>
          <div class="year-tabs">${tabsHTML}</div>
        </div>
        <div class="months-row" id="gh-months-row">${buildMonthLabels(weeks)}</div>
        <div class="heatmap-body">
          <div class="day-labels">
            <div class="day-label" style="height:13px"></div>
            <div class="day-label">Mon</div>
            <div class="day-label" style="height:13px"></div>
            <div class="day-label">Wed</div>
            <div class="day-label" style="height:13px"></div>
            <div class="day-label">Fri</div>
            <div class="day-label" style="height:13px"></div>
          </div>
          <div class="weeks" id="gh-weeks-grid">${buildWeeksHTML(weeks, year)}</div>
        </div>
        <div class="legend">
          <span class="legend-label">Less</span>
          <div class="legend-cell l0"></div>
          <div class="legend-cell l1"></div>
          <div class="legend-cell l2"></div>
          <div class="legend-cell l3"></div>
          <div class="legend-cell l4"></div>
          <span class="legend-label">More</span>
        </div>
      </div>`;
  }

  // ── Build repos grid HTML ─────────────────────────
  function buildRepos(repos) {
    const cards = (Array.isArray(repos) ? repos : []).slice(0, 6).map(r => {
      const lc = r._langColor || LANG_COLORS[r.language] || '#00ffe7';
      return `
        <div class="repo-card" onclick="openLink('${r.html_url}')">
          <div class="repo-name">
            <i class="ti ti-brand-github" style="font-size:14px;margin-right:6px" aria-hidden="true"></i>${r.name}
          </div>
          <div class="repo-desc">${r.description || 'No description provided.'}</div>
          <div class="repo-meta">
            <span><span class="lang-dot" style="background:${lc}"></span>${r.language || 'Unknown'}</span>
            <span><i class="ti ti-star" style="font-size:12px;margin-right:2px" aria-hidden="true"></i>${r.stargazers_count || 0}</span>
            <span><i class="ti ti-git-fork" style="font-size:12px;margin-right:2px" aria-hidden="true"></i>${r.forks_count || 0}</span>
          </div>
        </div>`;
    }).join('');
    return `<div class="repos-grid">${cards}</div>`;
  }

  // ── Bind hover tooltips ───────────────────────────
  function attachTooltips() {
    const tip = document.getElementById('gh-tooltip');
    if (!tip) return;
    document.querySelectorAll('.day-cell').forEach(cell => {
      cell.addEventListener('mousemove', e => {
        tip.textContent = cell.dataset.tip;
        tip.style.display = 'block';
        tip.style.left = (e.pageX + 14) + 'px';
        tip.style.top = (e.pageY - 32) + 'px';
      });
      cell.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
    });
  }

  // ── Switch year (called from year-tab onclick) ────
  window.ghSwitchYear = async function (year) {
    // Update active tab immediately
    document.querySelectorAll('.year-btn').forEach(b => {
      b.classList.toggle('active', parseInt(b.textContent) === year);
    });

    const grid = document.getElementById('gh-weeks-grid');
    const countEl = document.getElementById('gh-contrib-count');
    const monthsEl = document.getElementById('gh-months-row');

    // Show loading inside grid
    grid.innerHTML = `<div class="gh-year-loading"><span class="loading-dots">Loading ${year}</span></div>`;

    const cal = await fetchContribs(year);

    countEl.textContent = `${cal.totalContributions} contributions in ${year}`;
    monthsEl.innerHTML = buildMonthLabels(cal.weeks);
    grid.innerHTML = buildWeeksHTML(cal.weeks, year);
    grid.classList.add('gh-fade');
    setTimeout(() => grid.classList.remove('gh-fade'), 400);

    attachTooltips();
  };

  // ── Global helper for repo card onclick ───────────
  window.openLink = function (url) { window.open(url, '_blank', 'noopener'); };

  // ── Main init ─────────────────────────────────────
  async function init() {
    try {
      await fetchUser();
      const cal = await fetchContribs(currentYear);

      if (loading) loading.remove();

      root.innerHTML = `
        <div class="profile-row">
          <img class="avatar" src="${userData.avatar_url}" alt="${userData.login}" />
          <div class="profile-info">
            <div class="handle">@${userData.login}</div>
            <h2>${userData.name || userData.login}</h2>
            <p>${userData.bio || 'Backend Developer &amp; Data Science Enthusiast'}</p>
          </div>
        </div>

        <div class="stats-row">
          <div class="gh-stat"><div class="stat-n">${userData.public_repos || 0}</div><div class="stat-l">REPOS</div></div>
          <div class="gh-stat"><div class="stat-n">${userData.followers || 0}</div><div class="stat-l">FOLLOWERS</div></div>
          <div class="gh-stat"><div class="stat-n">${userData.following || 0}</div><div class="stat-l">FOLLOWING</div></div>
          <div class="gh-stat"><div class="stat-n">${cal.totalContributions}</div><div class="stat-l">THIS YEAR</div></div>
        </div>

        ${buildHeatmapCard(cal, currentYear)}

        <div class="sec-header" style="margin-top:2rem">
          <div class="sec-num"></div>
          <div class="sec-title" style="font-size:.9rem">// RECENT REPOS</div>
          <div class="sec-line"></div>
        </div>

        ${buildRepos(reposData)}`;

      attachTooltips();
    } catch (err) {
      if (loading) loading.innerHTML = `<div class="error-msg">An error occurred while loading the details.</div>`;
    }
  }

  init();
})();
