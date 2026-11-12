// Orthographic "hologram" station: floors, an inclined escalator, pawn-like people from a recorded simulation.
// World axes: X along the approach / escalator run, Y up, Z across (rider's right = +Z). Camera: yaw about Y, pitch (90° = plan view).
const { CT, ST, VB, LZ } = window.SIMK;
const RAD = Math.PI / 180, BW = 0.56, BAL = 0.64;
const PAL = {
  stand: [98, 214, 255], walk: [255, 179, 64], neutral: [198, 218, 240], walkPale: [255, 208, 138], hot: [255, 78, 66],
  hero: [255, 247, 176], out: [226, 242, 255], ink: 'rgba(3,8,18,.92)',
};
const mix3 = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
const rgb = (c, k = 1) => `rgb(${Math.min(255, c[0] * k) | 0},${Math.min(255, c[1] * k) | 0},${Math.min(255, c[2] * k) | 0})`;
const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

function mkCam(c) {
  const cy_ = Math.cos(c.yaw * RAD), sy_ = Math.sin(c.yaw * RAD), cp = Math.cos(c.pitch * RAD), sp = Math.sin(c.pitch * RAD);
  const cx = c.cx === undefined ? W / 2 : c.cx, cyy = c.cy === undefined ? H / 2 : c.cy, zm = c.zoom;
  return {
    zoom: zm, vs: cp, sp, yaw: c.yaw, pitch: c.pitch, x: c.x, y: c.y, z: c.z,
    P(X, Y, Z) { const dx = X - c.x, dy = Y - c.y, dz = Z - c.z, x1 = dx * cy_ - dz * sy_, z1 = dx * sy_ + dz * cy_; return [cx + zm * x1, cyy - zm * (dy * cp - z1 * sp), dy * sp + z1 * cp]; },
  };
}
// keys: [[t, {x,y,z,yaw,pitch,zoom,cx,cy}, ease?], ...] — each segment eases in and out
function camAt(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t <= b[0]) { const u = (b[2] || E.io)(P(t, a[0], b[0])), o = {}; for (const k in b[1]) { const va = a[1][k] === undefined ? b[1][k] : a[1][k]; o[k] = k === 'zoom' ? Math.exp(lerp(Math.log(va), Math.log(b[1][k]), u)) : lerp(va, b[1][k], u); } return o; }
  }
  return keys[keys.length - 1][1];
}
function wpath(cam, pts, zo = 0, close = true) { ctx.beginPath(); for (let i = 0; i < pts.length; i++) { const p = cam.P(pts[i][0], pts[i][1], pts[i][2] + zo); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } if (close) ctx.closePath(); }
function wseg(cam, a, b, zo = 0) { const p = cam.P(a[0], a[1], a[2] + zo), q = cam.P(b[0], b[1], b[2] + zo); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); }
const beltPt = (u, h, z) => u < 0 ? [u, h, z] : [u * CT, u * ST + h, z];

let GLOW = null, GLOWC = null;
function initWorld() {
  const mk = (stops) => { const c = mkCanvas(128, 128), g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); stops.forEach(([o, col]) => gr.addColorStop(o, col)); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return c; };
  GLOW = mk([[0, 'rgba(255,236,200,1)'], [.18, 'rgba(255,205,130,.55)'], [.5, 'rgba(255,170,80,.14)'], [1, 'rgba(255,150,60,0)']]);
  GLOWC = mk([[0, 'rgba(220,250,255,1)'], [.2, 'rgba(120,220,255,.5)'], [.55, 'rgba(80,190,255,.12)'], [1, 'rgba(60,160,255,0)']]);
}
function glow(x, y, r, a = 1, spr = GLOW) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a; ctx.drawImage(spr, x - r, y - r, r * 2, r * 2); ctx.restore(); }

// ---------------------------------------------------------------- architecture (drawn before people)
function stationBack(sim, tau, cam, o = {}) {
  const zo = o.zo || 0, L = sim.cfg.hallL, Wd = sim.cfg.hallW, Lb = sim.cfg.Lb(tau), run = Lb * CT, rise = Lb * ST, A = o.alpha === undefined ? 1 : o.alpha;
  const lw = o.landW || 3.4, ll = 9.5, flat = cam.vs < 0.16, z = cam.zoom;
  ctx.save(); ctx.globalAlpha = A; ctx.lineJoin = 'round';
  // --- lower concourse floor
  { const p0 = cam.P(-L, 0, zo), p1 = cam.P(0, 0, zo), g = ctx.createLinearGradient(p0[0], p0[1], p1[0], p1[1]);
    g.addColorStop(0, 'rgba(13,28,52,0)'); g.addColorStop(.28, 'rgba(13,28,52,.85)'); g.addColorStop(1, 'rgba(20,40,70,1)');
    wpath(cam, [[-L, 0, -Wd], [0, 0, -Wd], [0, 0, Wd], [-L, 0, Wd]], zo); ctx.fillStyle = g; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.beginPath(); for (let x = -Math.floor(L); x <= 0; x += 1) wseg(cam, [x, 0, -Wd], [x, 0, Wd], zo); for (let k = -Math.floor(Wd); k <= Wd; k += 1) wseg(cam, [-L, 0, k], [0, 0, k], zo);
    ctx.strokeStyle = 'rgba(130,190,255,.075)'; ctx.lineWidth = 1; ctx.stroke();
    const e = cam.P(-1.2, 0, zo); glow(e[0], e[1], 8.5 * z, .34 * A);
    ctx.restore();
    const gl = ctx.createLinearGradient(p0[0], p0[1], p1[0], p1[1]); gl.addColorStop(0, 'rgba(140,200,255,0)'); gl.addColorStop(.4, 'rgba(140,200,255,.5)'); gl.addColorStop(1, 'rgba(160,215,255,.8)');
    ctx.strokeStyle = gl; ctx.lineWidth = 2; ctx.beginPath(); wseg(cam, [-L, 0, -Wd], [0, 0, -Wd], zo); wseg(cam, [-L, 0, Wd], [0, 0, Wd], zo); wseg(cam, [0, 0, -Wd], [0, 0, -BAL], zo); wseg(cam, [0, 0, BAL], [0, 0, Wd], zo); ctx.stroke();
  }
  // --- far + end walls (see-through)
  if (!flat) {
    const hW = 3.1, wa = Math.min(1, (cam.vs - .16) * 4);
    ctx.save(); ctx.globalAlpha = A * wa;
    const p0 = cam.P(-L, 0, zo), p1 = cam.P(0, 0, zo), g = ctx.createLinearGradient(p0[0], p0[1], p1[0], p1[1]); g.addColorStop(0, 'rgba(70,125,200,0)'); g.addColorStop(.5, 'rgba(70,125,200,.07)'); g.addColorStop(1, 'rgba(80,140,215,.13)');
    wpath(cam, [[-L, 0, -Wd], [0, 0, -Wd], [0, hW, -Wd], [-L, hW, -Wd]], zo); ctx.fillStyle = g; ctx.fill();
    ctx.fillStyle = 'rgba(80,140,215,.12)';
    wpath(cam, [[0, 0, -Wd], [0, 0, -BAL], [0, hW, -BAL], [0, hW, -Wd]], zo); ctx.fill(); wpath(cam, [[0, 0, BAL], [0, 0, Wd], [0, hW, Wd], [0, hW, BAL]], zo); ctx.fill();
    wpath(cam, [[0, 2.5, -BAL], [0, 2.5, BAL], [0, hW, BAL], [0, hW, -BAL]], zo); ctx.fill();
    ctx.strokeStyle = 'rgba(150,205,255,.3)'; ctx.lineWidth = 1.5; ctx.beginPath(); wseg(cam, [-L * .6, hW, -Wd], [0, hW, -Wd], zo); wseg(cam, [0, hW, -Wd], [0, hW, Wd], zo); wseg(cam, [0, 0, -Wd], [0, hW, -Wd], zo); wseg(cam, [0, 0, Wd], [0, hW, Wd], zo);
    wseg(cam, [0, 0, -BAL], [0, 2.5, -BAL], zo); wseg(cam, [0, 0, BAL], [0, 2.5, BAL], zo); wseg(cam, [0, 2.5, -BAL], [0, 2.5, BAL], zo); ctx.stroke();
    ctx.restore();
  }
  // --- upper landing
  { const p0 = cam.P(run, rise, zo), p1 = cam.P(run + ll, rise, zo), g = ctx.createLinearGradient(p0[0], p0[1], p1[0], p1[1]);
    g.addColorStop(0, 'rgba(20,40,70,1)'); g.addColorStop(.7, 'rgba(16,34,62,.8)'); g.addColorStop(1, 'rgba(16,34,62,0)');
    if (!flat) { ctx.strokeStyle = 'rgba(130,195,255,.10)'; ctx.lineWidth = 1.2; ctx.beginPath(); for (const [x, zz] of [[run, -lw], [run, lw], [run + ll * .55, -lw], [run + ll * .55, lw]]) wseg(cam, [x, rise, zz], [x, Math.max(0, rise - 9), zz], zo); ctx.stroke(); }
    wpath(cam, [[run, rise, -lw], [run + ll, rise, -lw], [run + ll, rise, lw], [run, rise, lw]], zo); ctx.fillStyle = g; ctx.fill();
    ctx.save(); ctx.clip(); ctx.beginPath(); for (let x = 1; x < ll; x += 1) wseg(cam, [run + x, rise, -lw], [run + x, rise, lw], zo); for (let k = -3; k <= 3; k++) wseg(cam, [run, rise, k], [run + ll, rise, k], zo); ctx.strokeStyle = 'rgba(130,190,255,.07)'; ctx.lineWidth = 1; ctx.stroke();
    const e = cam.P(run + ll - 1, rise, zo); glow(e[0], e[1], 6 * z, .5 * A, GLOW); ctx.restore();
    const gl = ctx.createLinearGradient(p0[0], p0[1], p1[0], p1[1]); gl.addColorStop(0, 'rgba(160,215,255,.8)'); gl.addColorStop(1, 'rgba(160,215,255,0)');
    ctx.strokeStyle = gl; ctx.lineWidth = 2; ctx.beginPath(); wseg(cam, [run, rise, -lw], [run + ll, rise, -lw], zo); wseg(cam, [run, rise, lw], [run + ll, rise, lw], zo); wseg(cam, [run, rise, -lw], [run, rise, -BAL], zo); wseg(cam, [run, rise, BAL], [run, rise, lw], zo); ctx.stroke();
  }
  // --- truss under the belt (side views)
  if (!flat && rise > 1.2) { const d = 1.0; wpath(cam, [[0, 0, BAL], [run, rise, BAL], [run, rise - d, BAL], [d / ST * CT, 0, BAL]], zo); ctx.fillStyle = 'rgba(8,16,30,.85)'; ctx.fill(); ctx.strokeStyle = 'rgba(120,180,255,.16)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); for (let u = 6; u < Lb - 2; u += 6) { const b = beltPt(u, -d, BAL); if (b[1] > .3) wseg(cam, b, [b[0], 0, BAL], zo); } ctx.strokeStyle = 'rgba(120,180,255,.09)'; ctx.stroke(); }
  // --- shaft hoops (rear half)
  if (o.hoops !== 0) drawHoops(cam, Lb, zo, A * (o.hoops === undefined ? 1 : o.hoops), false);
  // --- belt
  { wpath(cam, [[-0.95, 0, -BW], [0, 0, -BW], [run, rise, -BW], [run + .95, rise, -BW], [run + .95, rise, BW], [run, rise, BW], [0, 0, BW], [-0.95, 0, BW]], zo);
    const p0 = cam.P(0, 0, zo), p1 = cam.P(run, rise, zo), g = ctx.createLinearGradient(p0[0], p0[1], p1[0], p1[1]); g.addColorStop(0, '#22395c'); g.addColorStop(1, '#1a2d4b');
    ctx.fillStyle = g; ctx.fill();
    ctx.save(); ctx.clip();
    const pitch = 1.848, off = ((VB * tau) % pitch + pitch) % pitch;                 // every 4th step, so the time-lapse does not strobe
    ctx.beginPath(); for (let u = off; u < Lb; u += pitch) wseg(cam, beltPt(u, 0, -BW), beltPt(u, 0, BW), zo); ctx.strokeStyle = 'rgba(150,205,255,.2)'; ctx.lineWidth = Math.max(1, z * .035); ctx.stroke();
    ctx.setLineDash([z * .25, z * .35]); ctx.beginPath(); wseg(cam, [0, 0, 0], [run, rise, 0], zo); ctx.strokeStyle = 'rgba(150,205,255,.2)'; ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,196,70,.9)'; ctx.lineWidth = Math.max(1.5, z * .06); ctx.beginPath(); wseg(cam, [0, 0, -BW], [0, 0, BW], zo); wseg(cam, [run, rise, -BW], [run, rise, BW], zo); ctx.stroke();
  }
  // --- far balustrade + lamps
  balustrade(cam, Lb, -BAL, zo, A, false);
  ctx.restore();
}
function drawHoops(cam, Lb, zo, A, front) {
  const fade = clamp((cam.vs - .2) * 2.2); if (fade <= 0 || Lb < 14) return;
  ctx.save(); ctx.globalAlpha = A * fade * (front ? .45 : 1); ctx.strokeStyle = 'rgba(130,195,255,.13)'; ctx.lineWidth = 1.5;
  const R = 2.5, hc = 0.9, cw = cam.P(0, 0, 0)[2], side = cam.P(0, 0, 1)[2] > cw ? 1 : -1;   // which Z side faces the camera
  ctx.beginPath();
  for (let u = 4; u < Lb - 1.5; u += 4) {
    const cx_ = u * CT - hc * ST, cy_ = u * ST + hc * CT; let started = false;
    for (let k = 0; k <= 28; k++) { const a = (-112 + 224 * k / 28) * RAD, zz = R * Math.sin(a), n = R * Math.cos(a);
      if ((zz * side > 0) !== front && Math.abs(zz) > .01) { started = false; continue; }
      const p = cam.P(cx_ - n * ST, cy_ + n * CT, zz + zo); started ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); started = true; }
  }
  if (!front) { const n = hc + R; wseg(cam, [3 * CT - n * ST, 3 * ST + n * CT, 0], [(Lb - 1) * CT - n * ST, (Lb - 1) * ST + n * CT, 0], zo); }   // crown of the shaft
  ctx.stroke(); ctx.restore();
}
function balustrade(cam, Lb, zs, zo, A, near) {
  const run = Lb * CT, rise = Lb * ST, hh = 0.95, flat = cam.vs < 0.16;
  ctx.save(); ctx.globalAlpha = A;
  if (!flat) { wpath(cam, [[-0.9, 0, zs], [0, 0, zs], [run, rise, zs], [run + .9, rise, zs], [run + .9, rise + hh, zs], [run, rise + hh, zs], [0, hh, zs], [-0.9, hh, zs]], zo); ctx.fillStyle = near ? 'rgba(140,205,255,.07)' : 'rgba(140,205,255,.09)'; ctx.fill(); }
  ctx.strokeStyle = near ? 'rgba(175,225,255,.8)' : 'rgba(150,210,255,.6)'; ctx.lineWidth = Math.max(1.5, cam.zoom * .045); ctx.lineJoin = 'round';
  wpath(cam, [[-0.9, hh, zs], [0, hh, zs], [run, rise + hh, zs], [run + .9, rise + hh, zs]], zo, false); ctx.stroke();
  const r = Math.max(5, cam.zoom * .5);
  for (let u = 1.5; u < Lb; u += 3) { const b = beltPt(u, hh + .1, zs), p = cam.P(b[0], b[1], b[2] + zo); glow(p[0], p[1], r, .75 * A); }
  ctx.restore();
}
function stationFront(sim, tau, cam, o = {}) {
  const zo = o.zo || 0, Wd = sim.cfg.hallW, L = sim.cfg.hallL, Lb = sim.cfg.Lb(tau), A = o.alpha === undefined ? 1 : o.alpha;
  balustrade(cam, Lb, BAL, zo, A, true);
  if (o.hoops !== 0) drawHoops(cam, Lb, zo, A * (o.hoops === undefined ? 1 : o.hoops), true);
  if (cam.vs >= 0.16) { ctx.save(); ctx.globalAlpha = A * Math.min(1, (cam.vs - .16) * 4); ctx.strokeStyle = 'rgba(150,205,255,.16)'; ctx.lineWidth = 1.5; ctx.beginPath(); wseg(cam, [-L * .6, 3.1, Wd], [0, 3.1, Wd], zo); ctx.stroke(); ctx.restore(); }
}

// ---------------------------------------------------------------- people
function pawn(x, y, s, vs, c, al, big) {
  const bw = 0.43 * s, r = bw / 2, y0 = y - 0.215 * s * vs, y1 = y - 1.15 * s * vs, hy = y - 1.5 * s * vs, hr = 0.142 * s;
  ctx.globalAlpha = al; ctx.lineCap = 'round';
  if (bw > 5) { ctx.strokeStyle = PAL.ink; ctx.lineWidth = bw + Math.max(2, bw * .22); ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1 - .01); ctx.stroke(); }
  ctx.strokeStyle = rgb(c); ctx.lineWidth = bw; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1 - .01); ctx.stroke();
  if (bw > 9) { ctx.strokeStyle = rgba(mix3(c, [255, 255, 255], .35), .55); ctx.lineWidth = bw * .3; ctx.beginPath(); ctx.moveTo(x - bw * .2, y0); ctx.lineTo(x - bw * .2, y1 - .01); ctx.stroke(); }
  if (bw > 5) { ctx.fillStyle = PAL.ink; ctx.beginPath(); ctx.arc(x, hy, hr + Math.max(1.2, bw * .1), 0, TAU); ctx.fill(); }
  ctx.fillStyle = rgb(mix3(c, [255, 255, 255], .55)); ctx.beginPath(); ctx.arc(x, hy, hr, 0, TAU); ctx.fill();
}
const _dl = [];
// o: {zo, waitFrom, heatSpan, alpha, recolor(a, mode, c) -> c}
function drawPeople(sim, tau, cam, o = {}) {
  const zo = o.zo || 0, fi = clamp(tau, 0, (sim.NR - 1) * sim.DR) / sim.DR, i0 = Math.floor(fi), f = fi - i0;
  const list = _dl; list.length = 0;
  const run = sim.cfg.Lb(tau) * CT, reg = sim.cfg.regime(tau), A = o.alpha === undefined ? 1 : o.alpha, wf = o.waitFrom === undefined ? -1e9 : o.waitFrom, span = o.heatSpan || 100;
  let heroP = null;
  for (const a of sim.agents) {
    const k = i0 - a.rec0; if (a.rec0 < 0 || k < 0 || k >= a.n) continue;
    const tr = a.tr, b = k * 4; let X = tr[b], Y = tr[b + 1], Z = tr[b + 2]; const m = tr[b + 3];
    if (k + 1 < a.n) { X += (tr[b + 4] - X) * f; Y += (tr[b + 5] - Y) * f; Z += (tr[b + 6] - Z) * f; }
    let al = A; if (a.t0 > 0.05) al *= clamp((tau - a.t0) / 2.2); if (m === 4) al *= clamp((run + 9.2 - X) / 2.6); if (al <= 0.012) continue;
    let c;
    const base = (a.role && reg === 0) ? PAL.walkPale : PAL.neutral;
    const wait = a.tStuck >= 0 ? tau - Math.max(a.tStuck, wf) : 0, fc = wait > 0 && !(a.role && reg === 0) ? mix3(base, PAL.hot, E.io2(clamp((wait - 6) / span))) : base;
    if (m < 1.5) c = fc;
    else { const bc = m === 3 || (m === 4 && a.walking) ? PAL.walk : PAL.stand; c = m === 4 ? mix3(bc, PAL.out, clamp((X - run) / 6)) : mix3(fc, bc, clamp((tau - a.tBoard) / 1.6)); }
    if (a.hero) c = PAL.hero;
    if (o.recolor) c = o.recolor(a, m, c, X, Y, Z);
    const p = cam.P(X, Y, Z + zo), k2 = a.hero ? 1 : .88 + .2 * a.tint;
    list.push([p[2], p[0], p[1], c[0] * k2, c[1] * k2, c[2] * k2, al, a.hs * (a.hero ? 1.08 : 1), a.hero]);
    if (a.hero) heroP = { x: p[0], y: p[1], X, Y, Z, m, wait: a.tStuck >= 0 && m < 1.5 ? tau - a.tStuck : 0, board: a.tBoard };
  }
  list.sort((p, q) => p[0] - q[0]);
  const z = cam.zoom, vs = cam.vs;
  if (z > 13) { ctx.fillStyle = 'rgba(0,4,12,.34)'; ctx.beginPath(); for (const d of list) { const rr = .34 * z * d[7]; ctx.moveTo(d[1] + rr, d[2]); ctx.ellipse(d[1], d[2], rr, Math.max(1, rr * cam.sp), 0, 0, TAU); } ctx.fill(); }
  ctx.save();
  for (const d of list) {
    if (d[8]) { ctx.globalAlpha = 1; glow(d[1], d[2] - .8 * z * vs, z * 1.5, .8 * d[6]); }
    pawn(d[1], d[2], z * d[7], vs, [d[3], d[4], d[5]], d[6]);
  }
  ctx.restore(); ctx.globalAlpha = 1;
  return heroP;
}
function drawWorld(sim, tau, cam, o = {}) { stationBack(sim, tau, cam, o); if (o.mid) o.mid(); const h = drawPeople(sim, tau, cam, o); stationFront(sim, tau, cam, o); return h; }
const serie = (sim, key, tau) => { const fi = clamp(tau, 0, (sim.NR - 1) * sim.DR) / sim.DR, i = Math.floor(fi), a = sim.S[key][i], b = sim.S[key][Math.min(sim.NR - 1, i + 1)]; return a + (b - a) * (fi - i); };

// ---------------------------------------------------------------- shared backdrop + HUD widgets
function backdrop(t, tint = 0) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#040915'); g.addColorStop(.55, '#07122a'); g.addColorStop(1, '#040a16');
  ctx.fillStyle = g; ctx.fillRect(-40, -40, W + 80, H + 80);
  const r = ctx.createRadialGradient(W * .5, H * .46, 40, W * .5, H * .46, Math.max(W, H) * .7);
  r.addColorStop(0, tint > 0 ? `rgba(${30 + 60 * tint | 0},${52 - 20 * tint | 0},${96 - 50 * tint | 0},.55)` : 'rgba(30,52,96,.55)'); r.addColorStop(1, 'rgba(8,16,34,0)');
  ctx.fillStyle = r; ctx.fillRect(-40, -40, W + 80, H + 80);
}
function pill(x, y, w, h, fill, stroke, lw = 2) { rrect(x, y, w, h, h / 2); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); } }
// tiny person glyph for icon arrays
function glyph(x, y, s, col, a = 1) {
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y - s * .78, s * .2, 0, TAU); ctx.fill();
  rrect(x - s * .23, y - s * .54, s * .46, s * .56, s * .2); ctx.fill(); ctx.restore();
}
const mmss = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
function check(x, y, s, col, p) { if (p <= 0) return; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = s * .2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(x - s * .5, y); const q = clamp(p * 2), q2 = clamp(p * 2 - 1); ctx.lineTo(x - s * .5 + s * .35 * q, y + s * .35 * q); if (q2 > 0) ctx.lineTo(x - s * .15 + s * .7 * q2, y + s * .35 - s * .8 * q2); ctx.stroke(); ctx.restore(); }
