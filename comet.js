const canvas = document.getElementById('comet-canvas');
const ctx = canvas.getContext('2d');

const params = {
  headSpeed: 520, // px per second
  arcHeight: 0.26, // fraction of screen height
  emissionRate: 140, // particles per second
  tailSpread: 0.6, // radians to either side of straight back
  particleLifeMin: 0.20,
  particleLifeMax: 0.75,
  particleSpeedMin: 30,
  particleSpeedMax: 110,
  particleRadiusMin: 0.5,
  particleRadiusMax: 1.5,
  headRadius: 2,
  headGlow: 8,
  fadeOutStart: 0.4, // progress (0-1) when head begins fading
  respawnDelay: 0.8,
};

let width = 0;
let height = 0;
let dpr = Math.min(window.devicePixelRatio || 1, 2);
let particles = [];
let spawnAccumulator = 0;
let lastTime = performance.now();
let comet = null;

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function createComet() {
  return {
    progress: 0,
    duration: Math.max(0.2, (width + 280) / params.headSpeed),
    cooldown: params.respawnDelay,
    baseY: height * randomRange(0.45, 0.65),
    arcDir: -1,//Math.random() > 0.5 ? 1 : -1,
    lastPos: { x: -120, y: height * 0.5 },
  };
}

function spawnParticles(head, dt) {
  spawnAccumulator += params.emissionRate * dt;
  const count = Math.floor(spawnAccumulator);
  spawnAccumulator -= count;

  const baseSpeedX = (head.x - head.prevX) / dt;
  const baseSpeedY = (head.y - head.prevY) / dt;

  for (let i = 0; i < count; i += 1) {
    const angle =
      Math.PI + randomRange(-params.tailSpread, params.tailSpread) + baseSpeedY * 0.0005;
    const speed = randomRange(params.particleSpeedMin, params.particleSpeedMax);
    particles.push({
      x: head.x,
      y: head.y,
      vx: Math.cos(angle) * speed + baseSpeedX * 0.12,
      vy: Math.sin(angle) * speed + baseSpeedY * 0.12,
      life: randomRange(params.particleLifeMin, params.particleLifeMax),
      ttl: 0,
      radius: randomRange(params.particleRadiusMin, params.particleRadiusMax),
    });
  }
}

function updateParticles(dt) {
  const next = [];
  for (const p of particles) {
    p.ttl += dt;
    if (p.ttl > p.life) continue;

    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.995;
    p.vy *= 0.995;

    next.push(p);
  }
  particles = next;
}

function drawParticles() {
  ctx.globalCompositeOperation = 'lighter';
  for (const p of particles) {
    const alpha = 1 - p.ttl / p.life;
    const tailTint = 160 + Math.floor(80 * alpha);
    ctx.fillStyle = `rgba(${tailTint}, ${220}, 255, ${alpha * 0.55})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHead(head, alpha) {
  const gradient = ctx.createRadialGradient(
    head.x,
    head.y,
    0,
    head.x,
    head.y,
    params.headGlow
  );
  gradient.addColorStop(0, `rgba(255,255,255,${alpha})`);
  gradient.addColorStop(0.4, `rgba(200,230,255,${alpha * 0.7})`);
  gradient.addColorStop(1, `rgba(50,120,255,0)`);

  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(head.x, head.y, params.headGlow, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `rgba(255,255,255,${alpha})`;
  ctx.beginPath();
  ctx.arc(head.x, head.y, params.headRadius, 0, Math.PI * 2);
  ctx.fill();
}

function step(now) {
  const dt = Math.max(0.001, Math.min(0.033, (now - lastTime) / 1000));
  lastTime = now;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.fillRect(0, 0, width, height);

  if (!comet) comet = createComet();

  if (comet.progress >= 1) {
    comet.cooldown -= dt;
    if (comet.cooldown <= 0) {
      comet = createComet();
    }
  } else {
    comet.progress += dt / comet.duration;
    const startX = -120;
    const endX = width + 120;
    const t = Math.min(comet.progress, 1);
    const x = startX + (endX - startX) * t;
    const arc = Math.sin(t * Math.PI) * params.arcHeight * height * comet.arcDir;
    const y = comet.baseY + arc;

    const head = { x, y, prevX: comet.lastPos.x, prevY: comet.lastPos.y };
    comet.lastPos = { x, y };

    const fadeStart = params.fadeOutStart;
    const headAlpha =
      t < fadeStart ? 1 : Math.max(0, 1 - (t - fadeStart) / Math.max(0.001, 1 - fadeStart));

    spawnParticles(head, dt);
    drawHead(head, headAlpha);
  }

  updateParticles(dt);
  drawParticles();

  requestAnimationFrame(step);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function createControlPanel() {
  const controlDefs = [
    { key: 'headSpeed', label: 'Head speed (px/s)', min: 180, max: 620, step: 10 },
    { key: 'headRadius', label: 'Head radius (px)', min: 1, max: 20, step: 1 },
    { key: 'headGlow', label: 'Head glow (px)', min: 1, max: 20, step: 1  },
    { key: 'arcHeight', label: 'Arc height (screen frac)', min: 0, max: 0.5, step: 0.01 },
    { key: 'emissionRate', label: 'Emission (particles/s)', min: 40, max: 520, step: 10 },
    { key: 'tailSpread', label: 'Tail spread (rad)', min: 0.1, max: 1.5, step: 0.05 },
    { key: 'particleRadiusMin', label: 'Particle radius min (s)', min: 0.1, max: 3, step: 0.05 },
    { key: 'particleRadiusMax', label: 'Particle radius max (s)', min: 0.5, max: 6, step: 0.05 },
    { key: 'particleLifeMin', label: 'Particle life min (s)', min: 0.1, max: 1.5, step: 0.05 },
    { key: 'particleLifeMax', label: 'Particle life max (s)', min: 0.2, max: 3.2, step: 0.05 },
    { key: 'fadeOutStart', label: 'Head fade start (progress)', min: 0.4, max: 0.95, step: 0.01 },
  ];

  const panelContainer = document.getElementById('control-panel-container');
  panelContainer.classList.add('control-panel-container');

  const toggle = document.createElement('button');
  toggle.id = 'control-panel-toggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', 'true');
  toggle.textContent = 'Hide controls';
  panelContainer.appendChild(toggle);

  const panel = document.createElement('div');
  panel.id = 'control-panel';

  const title = document.createElement('h2');
  title.textContent = 'Comet Controls';
  panel.appendChild(title);

  controlDefs.forEach((def) => {
    const row = document.createElement('label');
    row.className = 'control-row';
    const span = document.createElement('span');
    span.textContent = def.label;
    const input = document.createElement('input');
    input.type = 'range';
    input.min = def.min;
    input.max = def.max;
    input.step = def.step;
    input.value = params[def.key];

    const value = document.createElement('em');
    value.textContent = params[def.key].toFixed(2);

    input.addEventListener('input', () => {
      let val = parseFloat(input.value);
      if (def.key === 'particleLifeMin') {
        val = Math.min(val, params.particleLifeMax - 0.01);
      }
      if (def.key === 'particleLifeMax') {
        val = Math.max(val, params.particleLifeMin + 0.01);
      }

      params[def.key] = clamp(val, def.min, def.max);

      value.textContent =
        def.step >= 1 ? Math.round(params[def.key]) : params[def.key].toFixed(2);

      if (def.key === 'headSpeed') {
        comet.duration = Math.max(0.2, (width + 280) / params.headSpeed);
      }
    });

    row.appendChild(span);
    row.appendChild(input);
    row.appendChild(value);
    panel.appendChild(row);
  });

  panelContainer.appendChild(panel);

  toggle.addEventListener('click', () => {
    const isCollapsed = panelContainer.classList.toggle('is-collapsed');
    toggle.setAttribute('aria-expanded', (!isCollapsed).toString());
    toggle.textContent = isCollapsed ? 'Show controls' : 'Hide controls';
  });
}

resizeCanvas();
createControlPanel();
window.addEventListener('resize', resizeCanvas);
requestAnimationFrame(step);
