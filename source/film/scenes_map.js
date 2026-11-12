// SCENE 2 — where: a schematic of central London, two lines crossing at Holborn, 11,000 people in one hour.
const MAP = {
  thames: [[-60, 520], [110, 500], [235, 562], [330, 502], [382, 432], [470, 396], [600, 380], [740, 402], [862, 442], [1060, 418]],
  central: [[-60, 262], [150, 258], [235, 255], [320, 252], [410, 250], [500, 250], [575, 250], [655, 262], [740, 290], [830, 256], [1060, 214]],
  picc: [[-60, 452], [170, 386], [290, 340], [370, 305], [432, 278], [500, 250], [545, 185], [590, 100], [640, -40]],
  st: [[320, 252, 'OXFORD CIRCUS', 0, -16], [410, 250, 'TOTTENHAM CT RD', 0, 26], [575, 250, 'CHANCERY LANE', 8, -16], [655, 262, "ST PAUL'S", 0, 26], [740, 290, 'BANK', 0, 28],
    [290, 340, 'PICCADILLY CIRCUS', -14, 22, 'right'], [370, 305, 'LEICESTER SQ', -14, 20, 'right'], [432, 278, 'COVENT GARDEN', -14, 20, 'right'], [545, 185, 'RUSSELL SQ', 16, 4, 'left'], [590, 100, "KING'S CROSS", 16, 4, 'left']],
  H: [500, 250],
};
let MAPS = null;
function mapInit() {
  const r = rng(5), seg = [];
  for (let i = 0; i < 230; i++) { const x = r() * 1100 - 50, y = r() * 660 - 30, a = (r() < .5 ? -.22 : 1.35) + (r() - .5) * .25, l = 30 + r() * 120; seg.push([x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, .03 + r() * .06]); }
  const len = pts => { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; };
  const along = (pts, d) => { for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (d <= l) return [lerp(pts[i - 1][0], pts[i][0], d / l), lerp(pts[i - 1][1], pts[i][1], d / l)]; d -= l; } return pts[pts.length - 1]; };
  const arm = (pts, i0, rev) => { const p = rev ? pts.slice(i0).reverse() : pts.slice(0, i0 + 1); return { p, L: len(p) }; };   // each arm ends at Holborn
  MAPS = { seg, along, len, arms: [arm(MAP.central, 5, false), arm(MAP.central, 5, true), arm(MAP.picc, 5, false), arm(MAP.picc, 5, true)] };
}
function smoothPath(pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2; ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my); } ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]); }
function sceneMap(t) {
  const t0 = T.map, u = t - t0;
  backdrop(t);
  const zin = E.o3(P(t, t0 - .2, t0 + 1.5)), sc = O(1.16, 1.04) * lerp(1.9, 1, zin) * (1 + .02 * P(t, t0, T.short)), hx = O(600, 540), hy = O(452, 610);
  const tm = () => { ctx.translate(hx, hy); ctx.scale(sc, sc); ctx.translate(-MAP.H[0], -MAP.H[1]); };
  const S = (x, y) => [hx + (x - MAP.H[0]) * sc, hy + (y - MAP.H[1]) * sc];
  ctx.save(); tm();
  // streets
  for (const s of MAPS.seg) { ctx.strokeStyle = `rgba(150,200,255,${s[4]})`; ctx.lineWidth = 1.5 / sc; ctx.beginPath(); ctx.moveTo(s[0], s[1]); ctx.lineTo(s[2], s[3]); ctx.stroke(); }
  for (let k = 1; k <= 4; k++) { ctx.strokeStyle = 'rgba(120,190,255,.06)'; ctx.lineWidth = 1 / sc; ctx.beginPath(); ctx.arc(MAP.H[0], MAP.H[1], k * 110, 0, TAU); ctx.stroke(); }
  // river
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  smoothPath(MAP.thames); ctx.strokeStyle = 'rgba(40,110,190,.30)'; ctx.lineWidth = 46; ctx.stroke(); ctx.strokeStyle = 'rgba(20,70,135,.85)'; ctx.lineWidth = 34; ctx.stroke();
  ctx.save(); ctx.translate(300, 532); ctx.rotate(-.5); txt('RIVER THAMES', 0, 0, font(600, 12, F.m), 'rgba(150,205,255,.5)', 'center', 5); ctx.restore();
  // lines (draw on)
  const draw = (pts, col, p) => { const L = MAPS.len(pts); smoothPath(pts); ctx.setLineDash([L * 1.2, L * 1.2]); ctx.lineDashOffset = L * 1.2 * (1 - p); ctx.strokeStyle = 'rgba(2,8,18,.9)'; ctx.lineWidth = 13; ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = 8; ctx.stroke(); ctx.setLineDash([]); };
  draw(MAP.central, '#e63a2e', E.io2(P(u, -.15, .75))); draw(MAP.picc, '#3f6fe8', E.io2(P(u, -.05, .85)));
  // stations
  const sa = P(u, .55, 1.1);
  for (const [x, y, n, dx, dy, al] of MAP.st) { ctx.globalAlpha = sa; ctx.fillStyle = '#f2f8ff'; ctx.beginPath(); ctx.arc(x, y, 5.5, 0, TAU); ctx.fill(); ctx.fillStyle = '#081426'; ctx.beginPath(); ctx.arc(x, y, 2.6, 0, TAU); ctx.fill();
    ctx.globalAlpha = sa * .62; txt(n, x + dx, y + dy, font(600, 12.5, F.m), '#d8ebff', al || 'center', 1.5); }
  ctx.globalAlpha = 1;
  // commuters converging on Holborn
  const dens = .35 + .65 * P(t, wt(2, 'where') - .3, wt(2, '11') + .4);
  MAPS.arms.forEach((a, ai) => { const n = 13; for (let i = 0; i < n; i++) { if ((i * 7 + ai * 3) % 10 / 10 > dens) continue; const ph = ((u * .36 + i / n + ai * .17) % 1 + 1) % 1, d = a.L - Math.min(a.L, 330) * (1 - ph), [x, y] = MAPS.along(a.p, d), al = Math.min(1, ph * 5) * Math.min(1, (1 - ph) * 9) * P(u, .9, 1.6);
    ctx.fillStyle = `rgba(255,236,190,${al})`; ctx.beginPath(); ctx.arc(x, y, 4.2, 0, TAU); ctx.fill(); ctx.fillStyle = `rgba(255,200,120,${al * .3})`; ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fill(); } });
  ctx.restore();
  // Holborn marker
  const th = wt(2, 'holborn') - .1, ha = P(t, th, th + .3), [mx, my] = S(MAP.H[0], MAP.H[1]);
  for (let k = 0; k < 3; k++) { const ph = ((t * .7 + k / 3) % 1); ctx.strokeStyle = `rgba(255,255,255,${(1 - ph) * .7 * ha})`; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(mx, my, 14 + ph * 80, 0, TAU); ctx.stroke(); }
  glow(mx, my, 90 * ha, .8 * ha, GLOWC);
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(mx, my, 15 * E.oBack(ha), 0, TAU); ctx.fill(); ctx.fillStyle = '#081426'; ctx.beginPath(); ctx.arc(mx, my, 8 * ha, 0, TAU); ctx.fill();
  // riding up: a stream rising out of the station
  const tr = wt(2, 'ride') - .25, ra = P(t, tr, tr + .5);
  if (ra > 0) { for (let i = 0; i < 9; i++) { const ph = ((t * 1.1 + i / 9) % 1), y = my - 26 - ph * O(150, 170), al = ra * Math.min(1, ph * 6) * (1 - ph); ctx.fillStyle = `rgba(125,224,255,${al})`; ctx.beginPath(); ctx.arc(mx + 7 * Math.sin(i * 2.4), y, 4.5, 0, TAU); ctx.fill(); }
    ctx.save(); ctx.globalAlpha = ra; ctx.strokeStyle = COL.cyan; ctx.fillStyle = COL.cyan; ctx.lineWidth = 3; const ax = mx + 34, ay = my - 34; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax, ay - O(120, 140) * E.o3(ra)); ctx.stroke(); const ty = ay - O(120, 140) * E.o3(ra); ctx.beginPath(); ctx.moveTo(ax - 9, ty + 4); ctx.lineTo(ax, ty - 12); ctx.lineTo(ax + 9, ty + 4); ctx.fill();
    stxt('UP TO THE STREET', ax + 16, ay - O(96, 110), font(700, 15, F.m), COL.cyan2, 'left', 3); ctx.restore(); }
  // legibility wash under the text block
  { const g = O(ctx.createLinearGradient(980, 0, 1300, 0), ctx.createLinearGradient(0, 900, 0, 1040)); g.addColorStop(0, 'rgba(4,9,21,0)'); g.addColorStop(1, 'rgba(4,9,21,.9)'); ctx.fillStyle = g; O(ctx.fillRect(980, 0, W, H), ctx.fillRect(0, 900, W, H)); }
  // ---- text block
  const X = O(1236, 80), Y = O(292, 1050);
  const a1 = P(t, th - .4, th), a2 = ha;
  ctx.save(); ctx.globalAlpha = a1; stxt('CENTRAL LONDON  ·  ZONE 1', X + 4, Y - O(104, 92), font(600, O(18, 19), F.m), COL.cyan2, 'left', 6); ctx.restore();
  ctx.save(); ctx.globalAlpha = a2; const yy = Y + 16 * (1 - E.o3(a2)); stxt('HOLBORN', X, yy, font(900, O(120, 124)), '#fff', 'left', 3);
  ctx.fillStyle = COL.cyan; ctx.fillRect(X + 4, yy + 24, O(560, 540) * E.o3(P(t, th + .1, th + .8)), 3);
  const chip = (x, s, col) => { const w = tw(s, font(800, 15, F.m), 2) + 32; pill(x, yy + 44, w, 34, col, null); txt(s, x + w / 2, yy + 62, font(800, 15, F.m), '#fff', 'center', 2, 'middle'); return w; };
  ctx.globalAlpha = a2 * P(t, th + .25, th + .6); const w1 = chip(X + 4, 'CENTRAL LINE', '#d5352a'); chip(X + 16 + w1, 'PICCADILLY LINE', '#2f5fd8'); ctx.restore();
  // counter + one-hour dial
  const tc = wt(2, '11') - .1, ca = P(t, tc, tc + .3);
  if (ca > 0) {
    const n = Math.round(11000 * E.o3(P(t, tc, wt(2, 'morning') + .25)) / 100) * 100, cy = Y + O(236, 252);
    ctx.save(); ctx.globalAlpha = ca; stxt(n.toLocaleString('en-US'), X, cy, font(800, O(132, 138)), '#fff', 'left', 0);
    stxt('COMMUTERS STEP OFF HERE', X + 6, cy + 44, font(700, O(22, 22), F.m), COL.dim, 'left', 4); ctx.restore();
    const td = wt(2, 'need') - .2, da = P(t, td, td + .4), hp = P(t, td, wt(2, 'hour') + .15), dx = X + O(520, 660), dy = cy - O(52, 52), R = O(62, 70);
    if (da > 0) { ctx.save(); ctx.globalAlpha = da; ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(dx, dy, R, 0, TAU); ctx.stroke();
      ctx.strokeStyle = COL.amber; ctx.beginPath(); ctx.arc(dx, dy, R, -Math.PI / 2, -Math.PI / 2 + TAU * hp); ctx.stroke();
      for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(dx + Math.cos(a) * (R - 16) - 1.5, dy + Math.sin(a) * (R - 16) - 1.5, 3, 3); }
      const ha_ = -Math.PI / 2 + TAU * hp; ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx + Math.cos(ha_) * (R - 22), dy + Math.sin(ha_) * (R - 22)); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(dx, dy, 5, 0, TAU); ctx.fill();
      const mins = 30 + Math.round(60 * hp), clk = (mins >= 60 ? '09:' : '08:') + String(mins % 60).padStart(2, '0');
      stxt(clk, dx, dy + R + 34, font(800, 24, F.m), '#fff', 'center', 1); stxt('ONE HOUR', dx, dy + R + 58, font(700, 13, F.m), COL.amber, 'center', 4); ctx.restore(); }
    const ts = wt(2, 'single') - .05, sa2 = P(t, ts, ts + .3);
    if (sa2 > 0) { ctx.save(); ctx.globalAlpha = sa2; const s = lerp(1.25, 1, E.oBack(sa2)), ly = cy + O(118, 126); ctx.translate(X + 4, ly); ctx.scale(s, s);
      const lab = '≈ 183 EVERY MINUTE', w = tw(lab, font(850, O(34, 36)), 1.5) + 44; pill(0, -34, w, 60, 'rgba(255,179,64,.14)', COL.amber, 2); stxt(lab, 22, -3, font(850, O(34, 36)), COL.amber, 'left', 1.5, 'middle'); ctx.restore(); }
  }
  ctx.save(); ctx.globalAlpha = .4 * P(u, 1, 1.6); txt('SCHEMATIC · NOT TO SCALE', O(60, 60), O(H - 226, 946), font(500, 12, F.m), '#cfe3f5', 'left', 3); ctx.restore();
}
