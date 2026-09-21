// ============ CONFIG — edit these to update the whole site ============
  const CONFIG = {
    githubUsername: "kismatkumari56",
    email: "", // add your email here to enable the contact form
  };

  // ============ Theme toggle ============
  const root = document.documentElement;
  const themeBtn = document.getElementById('theme-toggle');
  function setTheme(t){
    root.setAttribute('data-theme', t);
    themeBtn.textContent = t === 'dark' ? '🌙' : '☀️';
    localStorage.setItem('portfolio-theme', t);
  }
  setTheme(localStorage.getItem('portfolio-theme') || 'dark');
  themeBtn.addEventListener('click', () => {
    setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  // ============ Mobile menu ============
  const menuBtn = document.getElementById('menu-btn');
  const navLinks = document.getElementById('nav-links');
  menuBtn.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
  }));

  document.getElementById('year').textContent = new Date().getFullYear();

  // ============ Hero wavy background (single deliberate animation) ============
  (function(){
    const canvas = document.getElementById('wave-canvas');
    const ctx = canvas.getContext('2d');
    let w, h, t = 0, dots;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize(){
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    }
    function init(){
      resize();
      const count = Math.max(10, Math.floor(w / 160));
      dots = Array.from({length: count}, () => ({
        x: Math.random() * w, y: Math.random() * h, r: 1 + Math.random() * 2
      }));
    }
    function waveColor(){
      return root.getAttribute('data-theme') === 'light' ? '91,75,214' : '124,108,246';
    }
    function drawWave(amp, freq, phase, yBase, alpha){
      ctx.beginPath();
      for (let x = 0; x <= w; x += 8){
        const y = yBase + Math.sin(x * freq + phase) * amp + Math.sin(x * freq * 2.3 + phase * 1.4) * (amp * 0.3);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(${waveColor()}, ${alpha})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
    function step(){
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < 6; i++){
        drawWave(28 + i * 6, 0.0035 + i * 0.0006, t + i * 0.7, h * 0.35 + i * 42, 0.16 - i * 0.015);
      }
      dots.forEach(d => {
        ctx.fillStyle = `rgba(${waveColor()}, 0.5)`;
        ctx.beginPath();
        ctx.arc(d.x, d.y + Math.sin(t + d.x) * 6, d.r, 0, Math.PI * 2);
        ctx.fill();
      });
      t += 0.006;
      if (!prefersReduced) requestAnimationFrame(step);
    }
    window.addEventListener('resize', init);
    init();
    if (canvas.offsetWidth > 0) step(); else requestAnimationFrame(() => { init(); step(); });
  })();

  // ============ Dynamic GitHub projects ============
  const FALLBACK_PROJECTS = [
    {
      name: "E-Library Website",
      description: "A web-based digital library built with HTML, CSS and JavaScript, letting users browse books across multiple categories.",
      html_url: `https://github.com/${CONFIG.githubUsername}`,
      language: "JavaScript",
      stargazers_count: 0
    },
    {
      name: "Yoga Benefits & Yoga Pose Website",
      description: "An informative site covering the benefits of yoga and a guide to different poses, focused on simple, accessible content.",
      html_url: `https://github.com/${CONFIG.githubUsername}`,
      language: "HTML",
      stargazers_count: 0
    }
  ];

  const LANG_COLORS = {
    JavaScript: "#f3b562", Python: "#45d8e0", HTML: "#e67e5c",
    CSS: "#7c6cf6", "C++": "#f06292", C: "#5c9ded", TypeScript: "#3ea6ff"
  };

  function projectCard(repo){
    const desc = repo.description || "No description provided yet.";
    const lang = repo.language || "—";
    const color = LANG_COLORS[lang] || "#8b93ac";
    return `
      <div class="project-card">
        <h3>${escapeHtml(repo.name)}</h3>
        <p class="desc">${escapeHtml(desc)}</p>
        <div class="project-foot">
          <span><span class="lang-dot" style="background:${color}"></span>${escapeHtml(lang)} · ★ ${repo.stargazers_count || 0}</span>
          <a class="view-link" href="${repo.html_url}" target="_blank" rel="noopener">View on GitHub</a>
        </div>
      </div>`;
  }

  function escapeHtml(str){
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderProjects(repos, note){
    const grid = document.getElementById('project-grid');
    const count = document.getElementById('proj-count');
    const noteEl = document.getElementById('proj-note');
    grid.innerHTML = repos.map(projectCard).join('');
    count.textContent = `${repos.length} project${repos.length === 1 ? '' : 's'}`;
    noteEl.textContent = note || '';
  }

  async function loadProjects(){
    try{
      const res = await fetch(`https://api.github.com/users/${CONFIG.githubUsername}/repos?sort=updated&per_page=100`);
      if (!res.ok) throw new Error('GitHub API request failed');
      const data = await res.json();
      const repos = data
        .filter(r => !r.fork)
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

      if (repos.length === 0){
        renderProjects(FALLBACK_PROJECTS, 'No public repositories found yet — showing featured projects instead.');
      } else {
        renderProjects(repos, '');
      }
    } catch (err){
      renderProjects(FALLBACK_PROJECTS, 'Live GitHub data is unavailable right now — showing featured projects instead.');
    }
  }
  loadProjects();

  // ============ Contact form (mailto — no backend needed on static hosting) ============
  document.getElementById('contact-form').addEventListener('submit', function(e){
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const status = document.getElementById('form-status');

    if (!CONFIG.email){
      status.textContent = 'Add your email address in the CONFIG at the bottom of index.html to enable this form.';
      return;
    }
    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${CONFIG.email}?subject=${subject}&body=${body}`;
    status.textContent = 'Opening your email app…';
  });

// ============ Custom cursor (mouse/trackpad devices only) ============
if (window.matchMedia('(pointer: fine)').matches){
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  function animateRing(){
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll('a, button, input, textarea').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
  });

  document.addEventListener('mouseleave', () => { dot.style.opacity = 0; ring.style.opacity = 0; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = 1; ring.style.opacity = 0.55; });
}
