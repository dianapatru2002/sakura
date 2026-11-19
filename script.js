// ---------- Scena: încadrare responsive, paralaxă, fire albe ----------
const layers = [...document.querySelectorAll('.layer')];
const hero = document.querySelector('.hero');

// Pe ecran lat arătăm scena întreagă; pe telefon tăiem în jurul soarelui
// și lăsăm loc de pământ întunecat dedesubt pentru text.
function fit() {
  const w = hero.clientWidth * 1.06, h = hero.clientHeight * 1.06, A = w / h;
  let vb;
  if (A >= 1.2) { const W = 1000 * A; vb = [1000 - 0.64 * W, 0, W, 1000]; }
  else { const H = 880 / 0.6, W = H * A; vb = [1020 - W / 2, 120, W, H]; }
  layers.forEach(l => l.setAttribute('viewBox', vb.map(n => n.toFixed(1)).join(' ')));
}
fit(); addEventListener('resize', fit);

let mx = 0, my = 0, tx = 0, ty = 0;
addEventListener('pointermove', e => {
  tx = (e.clientX / innerWidth - 0.5) * -28;
  ty = (e.clientY / innerHeight - 0.5) * -14;
});

// fire care se răsucesc ca o panglică
function makeRibbon(g, n) { for (let i = 0; i < n; i++) g.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'path')); return [...g.children]; }
const ribbons = [
  { lines: makeRibbon(document.getElementById('ribbonI'), 14), x0: -600, x1: 1500, c: x => 925 + 28 * Math.sin((x + 200) * 0.003), w: 80, k: 0.0042 },
  { lines: makeRibbon(document.getElementById('ribbonS'), 12), x0: 900, x1: 2300, c: x => 880 - 30 * Math.sin(x * 0.0035), w: 60, k: 0.005 },
];
function drawRibbons(t) {
  for (const r of ribbons) {
    r.lines.forEach((p, i) => {
      const f = i / (r.lines.length - 1) - 0.5;
      let d = '';
      for (let x = r.x0; x <= r.x1; x += 24) {
        const th = x * r.k + t * 0.00035 + i * 0.025;
        const y = r.c(x) + f * r.w * Math.cos(th) + 10 * Math.sin(x * 0.006 + t * 0.0005);
        d += (d ? 'L' : 'M') + x + ' ' + y.toFixed(1);
      }
      p.setAttribute('d', d);
    });
  }
}

// ---------- Petale ----------
const cv = document.getElementById('petals'), ctx = cv.getContext('2d');
let W, H, dpr;
function size() { dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; }
size(); addEventListener('resize', size);

// o petală de sakura are o crestătură mică în vârf
function sprite(fill, light) {
  const c = document.createElement('canvas'); c.width = 64; c.height = 64;
  const g = c.getContext('2d');
  const shape = () => { g.beginPath(); g.moveTo(32, 60); g.bezierCurveTo(14, 50, 6, 26, 14, 10); g.bezierCurveTo(18, 3, 26, 2, 29, 7); g.lineTo(32, 14); g.lineTo(35, 7); g.bezierCurveTo(38, 2, 46, 3, 50, 10); g.bezierCurveTo(58, 26, 50, 50, 32, 60); g.closePath(); };
  shape(); g.fillStyle = fill; g.fill();
  g.save(); shape(); g.clip(); g.fillStyle = light; g.beginPath(); g.ellipse(24, 26, 9, 22, -0.2, 0, 7); g.fill(); g.restore();
  g.strokeStyle = 'rgba(160,50,80,.25)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(32, 56); g.quadraticCurveTo(31, 36, 32, 18); g.stroke();
  return c;
}
const sprites = [['#F4AFBE', '#FAD2DA'], ['#F9C6CF', '#FDE3E8'], ['#EE97AA', '#F6BCC8'], ['#F7D7DC', '#FFF0F2'], ['#E25D78', '#EE8EA0']]
  .map(([a, b]) => sprite(a, b));

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const count = () => Math.round(Math.min(150, Math.max(28, (W * H) / 13000)));
const P = [];
function spawn(p, top) {
  p.z = 0.55 + Math.random() * 0.7;
  p.s = (10 + Math.random() * 9) * p.z;
  p.x = top ? Math.random() * W * 1.3 : W + 30;
  p.y = top ? -30 - Math.random() * H * 0.3 : Math.random() * H * 0.7;
  p.vx = -0.5; p.vy = 1;
  p.r = Math.random() * 6.3; p.vr = (Math.random() - 0.5) * 0.04;
  p.f = Math.random() * 6.3; p.vf = 0.02 + Math.random() * 0.04;
  p.ph = Math.random() * 6.3; p.img = sprites[Math.random() < 0.06 ? 4 : (Math.random() * 4) | 0];
  return p;
}
for (let i = 0; i < count(); i++) { const p = spawn({}, true); p.y = Math.random() * H; P.push(p); }

// vântul: o adiere spre stânga, cu rafale din când în când
let gust = 0, gustT = 0, nextGust = 5000;
let pvx = 0, pvy = 0, px = -999, py = -999, last = 0;
addEventListener('pointermove', e => { if (last) { pvx = e.clientX - px; pvy = e.clientY - py; } px = e.clientX; py = e.clientY; last = 1; });
addEventListener('pointerdown', e => {
  if (e.target.closest('button')) return;
  for (let i = 0; i < 10; i++) { const p = spawn({}, true); p.x = e.clientX; p.y = e.clientY; const a = Math.random() * 6.3; p.vx = Math.cos(a) * 3; p.vy = Math.sin(a) * 3 - 1; P.push(p); }
});

let running = !reduce;
const btn = document.querySelector('.toggle');
btn.addEventListener('click', () => {
  running = !running;
  btn.textContent = running ? 'Oprește petalele' : 'Pornește petalele';
  btn.setAttribute('aria-pressed', String(!running));
  if (running) requestAnimationFrame(loop);
});
if (!running) btn.textContent = 'Pornește petalele';

let prev = performance.now();
function loop(now) {
  const dt = Math.min(3, (now - prev) / 16.7); prev = now;

  mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
  layers.forEach(l => { const d = +l.dataset.depth; l.style.translate = `${mx * d}px ${my * d}px`; });
  drawRibbons(now);

  if (now > nextGust) { gustT = now; nextGust = now + 7000 + Math.random() * 8000; }
  const ge = (now - gustT) / 1000;
  gust = ge < 1.2 ? ge / 1.2 : ge < 2.4 ? 1 : Math.max(0, 1 - (ge - 2.4) / 2.2);
  const wind = -0.45 + 0.3 * Math.sin(now * 0.0007) + 0.2 * Math.sin(now * 0.0017 + 1.3) - gust * 3.2;
  pvx *= 0.9; pvy *= 0.9;

  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
  const target = count();
  for (let i = P.length - 1; i >= 0; i--) {
    const p = P[i];
    const dx = p.x - px, dy = p.y - py, d2 = dx * dx + dy * dy;
    if (d2 < 22000) { const k = (1 - d2 / 22000) * 0.12; p.vx += pvx * k; p.vy += pvy * k; }
    const sway = Math.sin(now * 0.0015 + p.ph) * 0.9;
    p.vx += (wind * p.z + sway - p.vx) * 0.025 * dt;
    p.vy += ((0.9 + 0.5 * p.z) * (1 - gust * 0.5) + Math.cos(now * 0.002 + p.ph) * 0.3 - p.vy) * 0.03 * dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.r += (p.vr + p.vx * 0.004) * dt; p.f += p.vf * dt;
    if (p.y > H + 40 || p.x < -60 || p.x > W * 1.4 + 60) {
      if (P.length > target) { P.splice(i, 1); continue; }
      spawn(p, Math.random() < 0.7);
    }
    const fl = Math.cos(p.f), sx = (p.s / 64) * Math.max(0.15, Math.abs(fl)) * dpr, sy = (p.s / 64) * dpr;
    const c = Math.cos(p.r), s = Math.sin(p.r);
    ctx.globalAlpha = 0.55 + p.z * 0.4;
    ctx.setTransform(c * sx, s * sx, -s * sy, c * sy, p.x * dpr, p.y * dpr);
    ctx.drawImage(p.img, -32, -32);
  }
  if (running) requestAnimationFrame(loop);
}
drawRibbons(0);
if (running) requestAnimationFrame(loop);
