(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const pages = $$('.page');
  const nav = $('#nav');
  const progress = $('#progress');
  const storyPages = pages.filter(p => p.dataset.nav === 'story');
  const QUESTION = pages.findIndex(p => p.classList.contains('question'));
  const YAY = pages.findIndex(p => p.classList.contains('yay'));
  let current = 0;

  /* ---------- background hearts ---------- */
  const bg = $('#hearts-bg');
  for (let i = 0; i < 16; i++) {
    const h = document.createElement('span');
    h.textContent = '♥';
    h.style.left = Math.random() * 100 + '%';
    h.style.fontSize = 12 + Math.random() * 22 + 'px';
    h.style.animationDuration = 9 + Math.random() * 10 + 's';
    h.style.animationDelay = -Math.random() * 18 + 's';
    bg.appendChild(h);
  }

  /* ---------- progress hearts ---------- */
  storyPages.forEach(() => {
    const s = document.createElement('span');
    s.textContent = '♥';
    progress.appendChild(s);
  });

  /* ---------- page navigation ---------- */
  function go(i) {
    if (i < 0 || i >= pages.length || i === current) return;
    pages[current].classList.remove('active');
    current = i;
    const page = pages[current];
    page.scrollTop = 0;
    page.classList.add('active');
    render();
  }

  function render() {
    const mode = pages[current].dataset.nav;
    nav.classList.toggle('hidden', mode === 'none');
    nav.classList.toggle('back-only', mode === 'back');
    const idx = storyPages.indexOf(pages[current]);
    progress.classList.toggle('hidden', idx < 0);
    $$('span', progress).forEach((s, n) => s.classList.toggle('on', n <= idx));
    if (current !== QUESTION) homeNo();
    hint();
  }

  // "scroll" cue when a chapter has more below the fold
  const more = $('#more');
  function hint() {
    const p = pages[current];
    const below = p.scrollHeight - p.clientHeight - p.scrollTop;
    more.classList.toggle('hidden', p.dataset.nav !== 'story' || below < 40);
  }
  pages.forEach(p => p.addEventListener('scroll', hint, { passive: true }));
  window.addEventListener('resize', hint);
  window.addEventListener('load', hint);

  $('#next').addEventListener('click', () => go(current + 1));
  $('#back').addEventListener('click', () => go(current - 1));

  // swipe left / right between story pages
  let sx = 0, sy = 0, swiping = false;
  document.addEventListener('touchstart', e => {
    swiping = !e.target.closest('.photos, button');
    sx = e.touches[0].clientX; sy = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchend', e => {
    if (!swiping) return;
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const mode = pages[current].dataset.nav;
    if (dx < 0 && mode === 'story') go(current + 1);
    if (dx > 0 && mode !== 'none' && current > 1) go(current - 1);
  }, { passive: true });

  document.addEventListener('keydown', e => {
    const mode = pages[current].dataset.nav;
    if (e.key === 'ArrowRight' && mode === 'story') go(current + 1);
    if (e.key === 'ArrowLeft' && mode !== 'none' && current > 1) go(current - 1);
  });

  /* ---------- envelope ---------- */
  const envelope = $('#envelope');
  envelope.addEventListener('click', () => {
    if (envelope.classList.contains('open')) return;
    envelope.classList.add('open');
    setTimeout(() => go(1), 1500);
  });

  /* ---------- photos ----------
     Drop pictures into /images named  <slot>-1.jpg, <slot>-2.jpg ... (up to 8 each)
     slots: aquarium, bowling, park, baking, painting, us
     .jpg .jpeg .png .webp all work. Slots with no photo show a cute placeholder. */
  const EXTS = ['jpg', 'jpeg', 'png', 'webp'];
  const MAX_PER_SLOT = 8;

  function polaroid(inner, caption) {
    const fig = document.createElement('figure');
    fig.className = 'polaroid';
    fig.appendChild(inner);
    const cap = document.createElement('figcaption');
    cap.textContent = caption;
    fig.appendChild(cap);
    return fig;
  }

  function findImage(base, cb, n = 0) {
    if (n >= EXTS.length) return;
    const img = new Image();
    img.onload = () => cb(img);
    img.onerror = () => findImage(base, cb, n + 1);
    img.alt = '';
    img.src = `${base}.${EXTS[n]}`;
  }

  $$('.photos').forEach(box => {
    const { photos: slot, emoji, caption } = box.dataset;
    const ph = document.createElement('div');
    ph.className = 'ph';
    ph.textContent = emoji;
    const placeholder = polaroid(ph, caption);
    box.appendChild(placeholder);

    const found = [];
    for (let i = 1; i <= MAX_PER_SLOT; i++) {
      findImage(`images/${slot}-${i}`, img => {
        placeholder.remove();
        found[i] = polaroid(img, caption);
        $$('.polaroid', box).forEach(p => p.remove());
        found.filter(Boolean).forEach(p => box.appendChild(p));
        box.classList.toggle('many', found.filter(Boolean).length > 1);
        hint();
      });
    }
  });

  /* ---------- the runaway "no" button ---------- */
  const yes = $('#yes');
  const no = $('#no');
  const taunt = $('#taunt');
  const noHome = no.parentElement;
  const TAUNTS = [
    'hehe, nope 🙈',
    'that button is broken, sorry',
    'nice try, baby 😌',
    'your finger slipped, right?',
    'wrong one!! the big pink one 💖',
    'it\'s shy, it doesn\'t like being pressed',
    'you can\'t catch it, just like you can\'t get rid of me',
    'okay now you\'re just playing with it 🤨',
    'the yes button is getting impatient...',
    'I can do this all day, my love',
  ];
  let dodges = 0;

  function flee(px, py) {
    if (current !== QUESTION) return;
    if (!no.classList.contains('loose')) {
      const r = no.getBoundingClientRect();
      document.body.appendChild(no);
      no.classList.add('loose');
      no.style.left = r.left + 'px';
      no.style.top = r.top + 'px';
      no.getBoundingClientRect(); // commit start position so the move animates
    }
    const w = no.offsetWidth, h = no.offsetHeight;
    const vw = window.innerWidth, vh = window.innerHeight;
    const y = yes.getBoundingClientRect();
    const pad = 22;
    let x = 0, t = 0;
    for (let tries = 0; tries < 60; tries++) {
      x = 14 + Math.random() * (vw - w - 28);
      t = 64 + Math.random() * (vh - h - 150);
      const hitsYes = x + w > y.left - pad && x < y.right + pad && t + h > y.top - pad && t < y.bottom + pad;
      const nearFinger = px != null && Math.hypot(x + w / 2 - px, t + h / 2 - py) < 130;
      if (!hitsYes && !nearFinger) break;
    }
    no.style.left = x + 'px';
    no.style.top = t + 'px';

    taunt.textContent = TAUNTS[dodges % TAUNTS.length];
    dodges++;
    yes.style.setProperty('--grow', Math.min(1 + dodges * 0.02, 1.1));
  }

  function homeNo() {
    if (!no.classList.contains('loose')) return;
    no.classList.remove('loose');
    no.style.left = no.style.top = '';
    noHome.appendChild(no);
  }

  const point = e => {
    const p = e.touches ? e.touches[0] : e;
    return [p.clientX, p.clientY];
  };
  no.addEventListener('touchstart', e => { e.preventDefault(); flee(...point(e)); }, { passive: false });
  no.addEventListener('pointerdown', e => { e.preventDefault(); flee(...point(e)); });
  no.addEventListener('pointerenter', e => flee(...point(e)));
  no.addEventListener('focus', () => flee());
  no.addEventListener('click', e => { e.preventDefault(); flee(); });
  // on desktop, run before the cursor even gets there
  document.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || current !== QUESTION) return;
    const r = no.getBoundingClientRect();
    if (Math.hypot(r.left + r.width / 2 - e.clientX, r.top + r.height / 2 - e.clientY) < 60) flee(e.clientX, e.clientY);
  });
  window.addEventListener('resize', homeNo);

  /* ---------- YES ---------- */
  yes.addEventListener('click', () => {
    $('#yes-date').textContent = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    no.remove();
    go(YAY);
    if (navigator.vibrate) navigator.vibrate([80, 60, 80, 60, 200]);
    celebrate();
  });

  function celebrate() {
    const canvas = $('#confetti');
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W, H;
    const size = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    window.addEventListener('resize', size);

    const colors = ['#e9668d', '#ffa9c0', '#ffffff', '#cf4672', '#dcbba6', '#8b5d48'];
    const make = burst => ({
      x: burst ? W / 2 : Math.random() * W,
      y: burst ? H * 0.45 : -20,
      vx: burst ? (Math.random() - 0.5) * 16 : (Math.random() - 0.5) * 1.2,
      vy: burst ? -Math.random() * 15 - 3 : 1 + Math.random() * 2,
      s: 10 + Math.random() * 20,
      r: Math.random() * 6.28,
      vr: (Math.random() - 0.5) * 0.15,
      c: colors[(Math.random() * colors.length) | 0],
    });
    let parts = Array.from({ length: 130 }, () => make(true));
    const started = performance.now();

    function heart(p) {
      const s = p.s / 16;
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.scale(s, s);
      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.bezierCurveTo(-10, -3, -6, -11, 0, -5);
      ctx.bezierCurveTo(6, -11, 10, -3, 0, 5);
      ctx.fillStyle = p.c;
      ctx.fill();
      ctx.restore();
    }

    (function frame(now) {
      ctx.clearRect(0, 0, W, H);
      const raining = now - started < 60000;
      if (raining && parts.length < 150 && Math.random() < 0.35) parts.push(make(false));
      parts = parts.filter(p => p.y < H + 40);
      for (const p of parts) {
        p.vy = Math.min(p.vy + 0.22, 4.5);
        p.vx *= 0.985;
        p.x += p.vx + Math.sin((now + p.s * 300) / 600) * 0.6;
        p.y += p.vy;
        p.r += p.vr;
        heart(p);
      }
      if (parts.length) requestAnimationFrame(frame);
    })(started);
  }

  /* ---------- start ---------- */
  pages[0].classList.add('active');
  render();
})();
