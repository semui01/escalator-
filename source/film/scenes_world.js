// SCENES 3–7, 9–10 — one persistent station: short escalator -> grows to 24 m -> walkers thin out -> wasted lane -> bottleneck -> the fix.
let WKEYS = null, MAIN = null, HATCH = null;
function worldInit() {
  let tc = DUR; for (let t = T.flip + 1; t < DUR; t += 1 / 30) if (serie(SIM, 'q', SC.tau(t)) < .5) { tc = t; break; }
  MAIN = { tClear: tc, clock0: SC.tau(T.waste), heroBoard: SIM.hero.tBoard / SC.K + SC.T0 }; T.clear = tc;
  const t24 = wt(5, '24') + .55, tw0 = T.waste + .1, tw1 = T.waste + 1.05, tb0 = wt(9, 'forcing') - .35, tb1 = wt(9, 'massive') + .55, tf1 = T.flip + 1.3, tc1 = wt(13, 'clears') + .45, lin = u => u;
  Object.assign(T, { t24, tw0, tw1, tb0, tb1, tf1, tc1 });
  WKEYS = O([
    [T.short, { x: 2.6, y: 1.9, z: 0, yaw: -22, pitch: 30, zoom: 62, cy: 500 }],
    [T.tall + .35, { x: 3.2, y: 2.1, z: 0, yaw: -17, pitch: 28, zoom: 59, cy: 500 }, E.io2],
    [t24, { x: 17, y: 11.3, z: 0, yaw: -8, pitch: 16, zoom: 24.5, cy: 505 }],
    [T.shift + .2, { x: 17, y: 11.3, z: 0, yaw: -8, pitch: 16, zoom: 24.5, cy: 505 }],
    [T.forty + 3.4, { x: 11.5, y: 7.2, z: 0, yaw: -13, pitch: 24, zoom: 31, cy: 510 }, E.io2],
    [tw0, { x: 11.5, y: 7.2, z: 0, yaw: -13, pitch: 24, zoom: 31, cy: 510 }],
    [tw1, { x: 6.5, y: 4, z: 0, yaw: 0, pitch: 90, zoom: 140, cy: 452 }],
    [tb0, { x: 27.5, y: 16, z: 0, yaw: 0, pitch: 90, zoom: 140, cy: 452 }, lin],
    [tb1, { x: -3.4, y: .6, z: .2, yaw: -28, pitch: 38, zoom: 58, cy: 520 }],
    [T.math, { x: -3.8, y: .6, z: .2, yaw: -31, pitch: 38, zoom: 62, cy: 520 }, lin],
    [T.crowd, { x: -4.6, y: .8, z: 0, yaw: -40, pitch: 34, zoom: 50, cy: 520 }],
    [T.fix - .1, { x: -2.8, y: .9, z: 0, yaw: -31, pitch: 36, zoom: 72, cy: 520 }, E.io2],
    [tf1, { x: -.6, y: 1.5, z: 0, yaw: -24, pitch: 33, zoom: 60, cy: 520 }],
    [tc1, { x: 9, y: 5.6, z: 0, yaw: -12, pitch: 23, zoom: 31, cy: 515 }],
    [T.end + .5, { x: 17, y: 11.3, z: 0, yaw: -8, pitch: 16, zoom: 24.5, cy: 505 }],
    [DUR, { x: 17.4, y: 11.5, z: 0, yaw: -7, pitch: 16, zoom: 25.4, cy: 505 }, lin],
  ], [
    [T.short, { x: 2.3, y: 1.5, z: 0, yaw: -58, pitch: 32, zoom: 60, cy: 900 }],
    [T.tall + .35, { x: 2.8, y: 1.8, z: 0, yaw: -55, pitch: 30, zoom: 58, cy: 900 }, E.io2],
    [t24, { x: 17, y: 12, z: 0, yaw: -60, pitch: 22, zoom: 27, cy: 840 }],
    [T.shift + .2, { x: 17, y: 12, z: 0, yaw: -60, pitch: 22, zoom: 27, cy: 840 }],
    [T.forty + 3.4, { x: 10, y: 6.2, z: 0, yaw: -64, pitch: 28, zoom: 38, cy: 900 }, E.io2],
    [tw0, { x: 10, y: 6.2, z: 0, yaw: -64, pitch: 28, zoom: 38, cy: 900 }],
    [tw1, { x: 6.5, y: 4, z: 0, yaw: -90, pitch: 90, zoom: 165, cy: 700 }],
    [tb0, { x: 27.5, y: 16, z: 0, yaw: -90, pitch: 90, zoom: 165, cy: 700 }, lin],
    [tb1, { x: -3, y: .6, z: 0, yaw: -76, pitch: 40, zoom: 64, cy: 960 }],
    [T.math, { x: -3.2, y: .6, z: 0, yaw: -78, pitch: 40, zoom: 68, cy: 960 }, lin],
    [T.crowd, { x: -3.6, y: .7, z: 0, yaw: -80, pitch: 38, zoom: 60, cy: 960 }],
    [T.fix - .1, { x: -2.4, y: .8, z: 0, yaw: -74, pitch: 38, zoom: 78, cy: 960 }, E.io2],
    [tf1, { x: -.4, y: 1.4, z: 0, yaw: -68, pitch: 34, zoom: 62, cy: 960 }],
    [tc1, { x: 8, y: 5.4, z: 0, yaw: -62, pitch: 26, zoom: 36, cy: 920 }],
    [T.end + .5, { x: 17, y: 12, z: 0, yaw: -60, pitch: 22, zoom: 27, cy: 840 }],
    [DUR, { x: 17.3, y: 12.2, z: 0, yaw: -59, pitch: 22, zoom: 27.8, cy: 840 }, lin],
  ]);
  HATCH = mkCanvas(24, 24); { const g = HATCH.getContext('2d'); g.strokeStyle = 'rgba(255,85,72,.9)'; g.lineWidth = 5; for (let k = -24; k <= 48; k += 12) { g.beginPath(); g.moveTo(k, 24); g.lineTo(k + 24, 0); g.stroke(); } }
}
const occ = (tau, key) => clamp(serie(SIM, key, tau) * .6 / SIM.cfg.Lb(tau));

function sceneWorld(t) {
  const tau = SC.tau(t), cam = mkCam(camAt(WKEYS, t));
  const q = serie(SIM, 'q', tau), stress = clamp(q / 110) * (t > T.flip ? 1 - P(t, T.flip, T.flip + 2.5) * .5 : 1);
  backdrop(t, stress * .8);
  const wa = wasteAmt(t);
  const hero = drawWorld(SIM, tau, cam, { mid: wa > 0 ? () => wastedLane(t, tau, cam, wa) : null });
  ovShort(t, tau, cam); ovTall(t, tau, cam); ovForty(t, tau, cam); ovWaste(t, tau, cam); ovCrowd(t, tau, cam, hero, q); ovFix(t, tau, cam, hero, q); rushHud(t, tau, q); endCard(t);
}
// ---------------------------------------------------------------- the rule sign (split-flap between two states)
function ruleSign(x, y, sc, flipU, a) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(sc, sc);
  const w = 372, h = 112;
  ctx.fillStyle = 'rgba(4,12,26,.92)'; rrect(-w / 2, -h / 2, w, h, 14); ctx.fill(); ctx.strokeStyle = flipU > .5 ? COL.cyan : 'rgba(155,231,255,.55)'; ctx.lineWidth = 2; ctx.stroke();
  txt('ESCALATOR RULE', -w / 2 + 18, -h / 2 + 25, font(700, 13, F.m), COL.mono, 'left', 4);
  const sq = Math.abs(Math.cos(clamp(flipU) * Math.PI)), st = flipU < .5 ? 0 : 1;
  ctx.translate(0, 16); ctx.scale(1, Math.max(.03, sq));
  const cell = (cx, lab, sub, col) => { rrect(cx - 84, -30, 168, 60, 10); ctx.fillStyle = col; ctx.fill(); txt(lab, cx, -5, font(900, 27), '#04101f', 'center', 2, 'middle'); txt(sub, cx, 17, font(700, 11, F.m), 'rgba(4,16,31,.85)', 'center', 2, 'middle'); };
  cell(-90, st ? 'STAND' : 'WALK', 'ON THE LEFT', st ? COL.cyan : COL.amber); cell(90, 'STAND', 'ON THE RIGHT', COL.cyan);
  ctx.restore();
}
function leader(x0, y0, x1, y1, col, a) { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash([5, 6]); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x0, y0, 4.5, 0, TAU); ctx.fill(); ctx.restore(); }

// ---------------------------------------------------------------- short escalator: the rule works
function ovShort(t, tau, cam) {
  if (t > T.tall + .7) return; const off = T.tall + .15;
  const m = cam.P(4.4 * CT, 4.4 * ST + 1.9, 0);
  callout(m[0], m[1], O(-150, 300 - m[0]), O(-196, 356 - m[1]), 'A SHORT ESCALATOR', 'ONE FLOOR UP · A FEW SECONDS', vis(t, LS(3) + .05, wt(4, 'steady') - .15, .7, .3), '#fff', O(-1, 0));
  const ts = wt(3, 'the') - .1, sa = vis(t, ts, off, .35, .3), e = cam.P(-.3, 2.5, 0), sx_ = O(e[0] - 170, 300), sy_ = O(e[1] - 190, 470);
  if (sa > 0) {
    leader(e[0], e[1], sx_ + O(110, 60), sy_ + 56, 'rgba(155,231,255,.7)', sa);
    ruleSign(sx_, sy_ + 10 * (1 - E.o3(sa)), O(1, 1.08), 0, sa);
    const tk = wt(3, 'perfectly') - .05, ka = P(t, tk, tk + .3) * sa;
    if (ka > 0) { ctx.save(); ctx.globalAlpha = ka; const s = lerp(1.4, 1, E.oBack(ka)); ctx.translate(sx_ + O(-110, -120), sy_ + O(96, 104)); ctx.scale(s, s); pill(0, -24, 196, 48, 'rgba(125,255,176,.14)', COL.green, 2); check(30, -2, 20, COL.green, P(t, tk + .05, tk + .4)); txt('NO QUEUE', 58, 1, font(800, 22), COL.green, 'left', 2, 'middle'); ctx.restore(); }
  }
  const tl = wt(4, 'steady') - .1, wl = cam.P(6.2 * CT, 6.2 * ST + 1.75, -LZ), sl = cam.P(2.7 * CT, 2.7 * ST + .5, LZ);
  callout(wl[0], wl[1], O(40, 300 - wl[0]), O(-150, 356 - wl[1]), 'WALKERS · LEFT', 'A STEADY STREAM, STRAIGHT UP', vis(t, tl, off, .7, .3), COL.amber, O(1, 0));
  callout(sl[0], sl[1], O(190, 230), O(118, 150), 'STANDERS · RIGHT', 'RIDE AND REST', vis(t, wt(4, 'happily') - .1, off, .7, .3), COL.cyan, O(1, 0));
}
// ---------------------------------------------------------------- Holborn: 24 metres
function ovTall(t, tau, cam) {
  const a = vis(t, SC.F.grow0 - .1, T.tw0 + .2, .5, .3); if (a <= 0) return;
  const rise = SIM.cfg.Lb(tau) * ST, run = SIM.cfg.Lb(tau) * CT, px = -3.4, pz = -5.0, big = P(t, SC.F.grow0, SC.F.grow1);
  const b = cam.P(px, 0, pz), tp = cam.P(px, rise, pz);
  ctx.save(); ctx.globalAlpha = a;
  // storeys (ghost building beside the pole)
  const nS = 7, sh = 24 / nS;
  for (let k = 0; k < nS; k++) { const y0 = k * sh, y1 = Math.min(rise, y0 + sh - .25); if (y1 <= y0 + .4) break;
    wpath(cam, [[px - 6.4, y0, pz], [px - .9, y0, pz], [px - .9, y1, pz], [px - 6.4, y1, pz]]); ctx.fillStyle = 'rgba(120,190,255,.05)'; ctx.fill(); ctx.strokeStyle = 'rgba(150,205,255,.26)'; ctx.lineWidth = 1.2; ctx.stroke();
    if (y1 - y0 > sh * .7) { ctx.fillStyle = 'rgba(255,214,150,.22)'; for (let j = 0; j < 4; j++) { wpath(cam, [[px - 5.9 + j * 1.3, y0 + 1, pz], [px - 5.1 + j * 1.3, y0 + 1, pz], [px - 5.1 + j * 1.3, y0 + 2.4, pz], [px - 5.9 + j * 1.3, y0 + 2.4, pz]]); ctx.fill(); } } }
  // measuring pole + level line
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.lineTo(tp[0], tp[1]); ctx.stroke();
  for (let m = 0; m <= rise + .01; m += 3) { const q = cam.P(px, m, pz), L = m % 6 === 0 ? 16 : 9; ctx.fillStyle = '#fff'; ctx.fillRect(q[0], q[1] - 1, L, 2); if (m % 6 === 0 && m > 0) stxt(m + ' m', q[0] + 24, q[1] + 5, font(700, 15, F.m), 'rgba(230,242,255,.85)', 'left', 1); }
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(tp[0] - 9, tp[1] + 13); ctx.lineTo(tp[0], tp[1]); ctx.lineTo(tp[0] + 9, tp[1] + 13); ctx.fill();
  { const l0 = cam.P(px, rise, pz), l1 = cam.P(run, rise, -3.4); ctx.setLineDash([6, 8]); ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(l0[0], l0[1]); ctx.lineTo(l1[0], l1[1]); ctx.stroke(); ctx.setLineDash([]); }
  // the number
  const t24 = wt(5, '24'), pop = 1 + .22 * (1 - E.o3(P(t, t24, t24 + .5))) * P(t, t24 - .05, t24), lx = O(tp[0] + 96, 70), ly = O(tp[1] + 196, 420);
  ctx.save(); ctx.translate(lx, ly); ctx.scale(pop, pop); ctx.shadowColor = 'rgba(95,212,255,.7)'; ctx.shadowBlur = 26 * P(t, t24, t24 + .2);
  const num = Math.round(rise) + ' m'; txt(num, 0, 0, font(900, O(128, 132)), '#fff', 'left', 0);
  ctx.shadowBlur = 0; const sa = P(t, t24 + .25, t24 + .7);
  ctx.globalAlpha = a * sa; stxt('≈ A 7-STOREY BUILDING', 6, 44, font(700, O(19, 21), F.m), COL.cyan2, 'left', 4); stxt('HOLBORN · CONCOURSE TO TICKET HALL', 6, 74, font(600, O(14, 16), F.m), COL.mono, 'left', 3);
  ctx.restore();
  // incline
  const ia = P(t, t24 + .5, t24 + 1) * a; if (ia > 0) { ctx.globalAlpha = ia; ctx.strokeStyle = COL.amber; ctx.lineWidth = 2; ctx.beginPath(); for (let k = 0; k <= 10; k++) { const an = k / 10 * 30 * RAD, q = cam.P(7 * Math.cos(an), 7 * Math.sin(an), BAL); k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); } ctx.stroke(); const q = cam.P(9.2, 2.1, BAL); stxt('30°', q[0], q[1], font(800, 20, F.m), COL.amber, 'left', 1); }
  ctx.restore();
}
// ---------------------------------------------------------------- behaviour shifts: only 40% will walk
function ovForty(t, tau, cam) {
  const w = cam.P(21 * CT, 21 * ST + 1.8, -LZ);
  callout(w[0], w[1], O(150, 190), O(130, 150), 'WALKERS SLOW DOWN', 'AND FEWER EVEN TRY', vis(t, wt(6, 'human') - .2, T.forty + .1, .7, .3), COL.amber, O(1, 0));
  const t0 = wt(7, 'only') - .15, a = vis(t, t0, T.tw0 + .2, .4, .3); if (a <= 0) return;
  const X = O(1222, 462), Y = O(548, 1016) + 24 * (1 - E.o3(P(t, t0, t0 + .5))), Wp = O(620, 580), Hp = 262;
  hudPanel(X, Y, Wp, Hp, 'WILLING TO WALK UP 24 m ?', a, COL.amber);
  ctx.save(); ctx.globalAlpha = a;
  const t40 = wt(7, '40'), n = 10;
  for (let i = 0; i < n; i++) { const pa = E.oBack(P(t, t0 + .15 + i * .05, t0 + .4 + i * .05)), on = i < 4, lit = on ? P(t, t40 - .1 + i * .06, t40 + .12 + i * .06) : 0;
    const gx = X + 52 + i * O(37, 34), gy = Y + 138; ctx.save(); ctx.translate(gx, gy); ctx.scale(pa, pa); glyph(0, 0, 58, on ? rgb(mix3([120, 150, 185], PAL.walk, lit)) : 'rgba(150,185,220,.38)'); if (lit > 0) { ctx.strokeStyle = rgba(PAL.walk, lit); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-14, 10); ctx.lineTo(14, 10); ctx.stroke(); } ctx.restore(); }
  const pct = Math.round(40 * E.o3(P(t, t40 - .1, t40 + .55)));
  ctx.shadowColor = 'rgba(255,179,64,.6)'; ctx.shadowBlur = 22 * P(t, t40, t40 + .3); txt(pct + '%', X + Wp - 30, Y + 150, font(900, O(112, 100)), COL.amber, 'right', 0); ctx.shadowBlur = 0;
  txt('ONLY 4 IN 10 WOULD EVEN CONSIDER THE CLIMB', X + 34, Y + 198, font(700, O(17, 15.5), F.m), '#eaf4ff', 'left', O(1.5, 1));
  txt('LONDON UNDERGROUND STUDY, 2002 · AS REPORTED', X + 34, Y + 230, font(500, 13, F.m), 'rgba(200,225,250,.6)', 'left', 2);
  ctx.restore();
}
// ---------------------------------------------------------------- the wasted lane (plan view)
function wasteAmt(t) { return vis(t, wt(8, 'that') - .25, T.tb0 + .45, .7, .35) * P(t, T.tw1 - .2, T.tw1 + .1); }
function wastedLane(t, tau, cam, a) {            // drawn on the belt, under the people
  const Lb = SIM.cfg.Lb(tau), c0 = cam.x / CT, u0 = Math.max(.4, c0 - 13), u1 = Math.min(Lb - .4, c0 + 13);
  wpath(cam, [beltPt(u0, 0, -BW + .04), beltPt(u1, 0, -BW + .04), beltPt(u1, 0, -.03), beltPt(u0, 0, -.03)]);
  ctx.save(); ctx.globalAlpha = a * .5; ctx.fillStyle = 'rgba(255,70,60,.28)'; ctx.fill(); ctx.globalAlpha = a * .45; ctx.fillStyle = ctx.createPattern(HATCH, 'repeat'); ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalAlpha = a * .8; ctx.strokeStyle = 'rgba(255,120,110,.9)'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
  const off = ((VB * tau) % .6 + .6) % .6, r = .2 * cam.zoom;
  for (let u = Math.ceil((u0 - off) / .6) * .6 + off; u < u1; u += .6) { const b = beltPt(u, 0, -LZ), p = cam.P(b[0], b[1], b[2]); ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, TAU); ctx.stroke(); }
  ctx.restore();
}
function ovWaste(t, tau, cam) {
  const a = vis(t, T.tw1 - .15, T.tb0 + .45, .45, .4); if (a <= 0) return;
  const c = cam.P(cam.x, cam.y, 0), z = cam.zoom, oL = occ(tau, 'nL'), oR = occ(tau, 'nR');
  ctx.save(); ctx.globalAlpha = a;
  // lane tags
  const tn = wt(8, 'nobody') - .1, hot = P(t, tn, tn + .25);
  if (!V) {
    stxt('LEFT LANE', 150, c[1] - z * .56 - 62, font(850, 40), hot ? rgb(mix3(PAL.walk, [255, 96, 84], hot)) : COL.amber, 'left', 2); stxt(hot > .5 ? 'WALKERS ONLY · ALMOST NOBODY' : 'WALKERS ONLY', 152, c[1] - z * .56 - 30, font(600, 16, F.m), COL.dim, 'left', 3);
    stxt('RIGHT LANE', 150, c[1] + z * .56 + 92, font(850, 40), COL.cyan, 'left', 2); stxt('STANDING · NOSE TO TAIL', 152, c[1] + z * .56 + 122, font(600, 16, F.m), COL.dim, 'left', 3);
  } else {
    const ly = 470; stxt('LEFT', c[0] - z * .56 - 34, ly, font(850, 44), hot ? rgb(mix3(PAL.walk, [255, 96, 84], hot)) : COL.amber, 'right', 2); stxt('LANE', c[0] - z * .56 - 34, ly + 46, font(850, 44), hot ? rgb(mix3(PAL.walk, [255, 96, 84], hot)) : COL.amber, 'right', 2);
    stxt(hot > .5 ? 'ALMOST NOBODY' : 'WALKERS ONLY', c[0] - z * .56 - 34, ly + 78, font(600, 15, F.m), COL.dim, 'right', 3);
    stxt('RIGHT', c[0] + z * .56 + 34, ly, font(850, 44), COL.cyan, 'left', 2); stxt('LANE', c[0] + z * .56 + 34, ly + 46, font(850, 44), COL.cyan, 'left', 2); stxt('STANDING · FULL', c[0] + z * .56 + 34, ly + 78, font(600, 15, F.m), COL.dim, 'left', 3);
  }
  // WASTED SPACE
  const tws = wt(8, 'wasted');
  ctx.globalAlpha = a; stamp(t, tws, O(1010, c[0] - 290), O(c[1] - z * .56 - 150, 700), 'WASTED SPACE', COL.red, O(-.05, -.08), O(56, 40));
  // lane-use meter
  const X = O(1130, 60), Y = O(c[1] + z * .56 + 70, 1090), Wp = O(650, 960), Hp = O(250, 250);
  const pa = P(t, T.tw1 + .2, T.tw1 + .7);
  ctx.globalAlpha = a * pa; hudPanel(X, Y + 16 * (1 - E.o3(pa)), Wp, Hp, 'LANE USE · LIVE FROM THE SIMULATION', a * pa, COL.cyan2);
  const bar = (i, lab, v, col) => { const y = Y + 62 + i * 54, bw = Wp - 250; txt(lab, X + 34, y + 20, font(700, 15, F.m), '#dfeeff', 'left', 2, 'middle'); ctx.fillStyle = 'rgba(255,255,255,.08)'; rrect(X + 132, y, bw, 38, 8); ctx.fill(); ctx.fillStyle = col; rrect(X + 132, y, Math.max(8, bw * v), 38, 8); ctx.fill(); txt(Math.round(v * 100) + '%', X + Wp - 30, y + 21, font(800, 34, F.m), col, 'right', 0, 'middle'); };
  bar(0, 'LEFT', oL, oL < .3 ? COL.red : COL.amber); bar(1, 'RIGHT', oR, COL.cyan);
  // capacity readout ("halved")
  const th = wt(9, 'half'), ca = P(t, LS(9) - .1, LS(9) + .3);
  if (ca > 0) { const cap = Math.round((oL + oR) / 2 * 100), y = Y + 62 + 2 * 54 + 8; ctx.globalAlpha = a * pa * ca;
    txt('CAPACITY IN USE', X + 34, y + 22, font(700, 15, F.m), '#dfeeff', 'left', 2, 'middle');
    const sc = 1 + .35 * (1 - E.o3(P(t, th, th + .45))) * P(t, th - .05, th); ctx.save(); ctx.translate(X + Wp - 30, y + 24); ctx.scale(sc, sc); txt(cap + '%', 0, 0, font(900, 46, F.m), COL.red, 'right', 0, 'middle'); ctx.restore();
    ctx.globalAlpha = a; stamp(t, th + .05, O(X + Wp - 262, X + Wp - 330), y + 22, 'HALVED', COL.red, -.06, 34); }
  ctx.restore();
}
// ---------------------------------------------------------------- the bottleneck on the floor below
function ovCrowd(t, tau, cam, hero, q) {
  const s7 = vis(t, T.tb1 - .5, T.math + .2, .5, .2), s9 = vis(t, T.crowd - .1, T.flip + .1, .4, .3), a = Math.max(s7, s9);
  if (a > 0) {
    const e = cam.P(-.5, .2, .6);
    // pressure rings at the mouth of the escalator
    ctx.save(); for (let k = 0; k < 3; k++) { const ph = ((t * .9 + k / 3) % 1); ctx.globalAlpha = a * (1 - ph) * .7; ctx.strokeStyle = COL.red; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(e[0], e[1], (30 + ph * 150), (30 + ph * 150) * Math.max(.25, cam.sp), 0, 0, TAU); ctx.stroke(); } ctx.restore();
    if (s7 > 0) {
      const tb = wt(9, 'bottleneck') - .05, ba = P(t, tb, tb + .25) * s7, X = O(1318, 64), Y = O(662, 520);
      if (ba > 0) { ctx.save(); ctx.globalAlpha = ba; leader(e[0], e[1], O(X - 14, X + 250), O(Y - 30, Y + 60), COL.red, 1); const sc = lerp(1.35, 1, E.oBack(ba)); ctx.translate(X, Y); ctx.scale(sc, sc); ctx.shadowColor = 'rgba(255,60,50,.7)'; ctx.shadowBlur = 24; txt('BOTTLENECK', 0, 0, font(900, O(76, 70)), COL.red, 'left', 2); ctx.shadowBlur = 0;
        stxt(O('EVERYONE FUNNELS INTO ONE STANDING LANE', 'EVERYONE FUNNELS INTO ONE LANE'), 4, 36, font(600, O(16, 16), F.m), '#ffd9d4', 'left', 2.5); ctx.restore(); }
    }
    if (s9 > 0) {
      const X = O(1318, 64), Y = O(590, 452), w = serie(SIM, 'qwait', tau);
      ctx.save(); ctx.globalAlpha = s9 * P(t, T.crowd + .3, T.crowd + .8);
      stxt(O('AVERAGE TIME STUCK IN THIS QUEUE', 'AVERAGE TIME STUCK IN THE QUEUE'), X + 4, Y, font(700, O(17, 16), F.m), '#ffd9d4', 'left', O(4, 3)); ctx.shadowColor = 'rgba(255,60,50,.6)'; ctx.shadowBlur = 20; txt(mmss(w), X, Y + O(92, 96), font(900, O(104, 108)), COL.red, 'left', 0); ctx.shadowBlur = 0;
      // every single morning
      const te = wt(12, 'every') - .1, days = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
      days.forEach((d, i) => { const p = P(t, te + i * .17, te + i * .17 + .22); if (p <= 0) return; ctx.save(); ctx.globalAlpha = s9 * p; const x = X + 4 + i * O(100, 96), y = Y + O(150, 156); ctx.translate(x + 44, y + 24); const sc = lerp(1.5, 1, E.oBack(p)); ctx.scale(sc, sc);
        rrect(-44, -24, 88, 48, 10); ctx.fillStyle = 'rgba(255,85,72,.16)'; ctx.fill(); ctx.strokeStyle = COL.red; ctx.lineWidth = 2; ctx.stroke(); txt(d, 0, 1, font(800, 20, F.m), '#ffd9d4', 'center', 2, 'middle'); ctx.restore(); });
      const ea = P(t, te, te + .3); if (ea > 0) { ctx.globalAlpha = s9 * ea; stxt('EVERY SINGLE MORNING', X + 4, Y + O(136, 142), font(700, O(15, 15), F.m), '#ffd9d4', 'left', 4); }
      ctx.restore();
    }
  }
  // the tracked commuter
  if (hero) {
    const ha = Math.max(vis(t, wt(9, 'stagnant') - .1, T.math + .2, .4, .2), vis(t, T.crowd + .2, T.end + .4, .4, .5));
    if (ha > 0) { const z = cam.zoom, on = hero.m > 1.5, sub = on ? (hero.m > 3.5 ? O('OUT — ON THE WAY TO WORK', 'ON THE WAY OUT') : O('MOVING · NO MORE WAITING', 'MOVING')) : 'WAITING ' + mmss(hero.wait), hb = MAIN.heroBoard + O(.4, .5), sw = P(t, hb, hb + .5) * O(1, 1 - P(t, T.tf1 + 1.1, T.tf1 + 1.6));   // portrait: back to the left once the sign has gone, so the tag stays in frame
      heroTag(hero.x, hero.y - .78 * z * cam.vs, clamp(z * .72, 20, 52), t, 'COMMUTER #001', sub, ha * (1 - P(sw, 0, .5)), on ? COL.green : COL.amber, -1);
      heroTag(hero.x, hero.y - .78 * z * cam.vs, clamp(z * .72, 20, 52), t, 'COMMUTER #001', sub, ha * P(sw, .5, 1), COL.green, 1); }
  }
}
// ---------------------------------------------------------------- the fix: stand on both sides
function ovFix(t, tau, cam, hero, q) {
  const t0 = T.fix + .05, a = vis(t, t0, O(T.tc1 - .5, T.tf1 + 1.0), .35, .5);
  if (a > 0) {
    const e = cam.P(-.2, 2.6, 0), X = O(748, 330), Y = O(212, 486), u = E.io(P(t, T.flip - .24, T.flip + .24)), sc = O(1.5, 1.3) * (1 + .12 * Math.sin(Math.PI * P(t, T.flip - .1, T.flip + .5)));
    leader(e[0], e[1], X + O(150, 120), Y + O(88, 78), u > .5 ? COL.cyan : 'rgba(155,231,255,.7)', a);
    ruleSign(X, Y, sc, u, a);
    const tb = wt(13, 'side') - .1, ba = P(t, tb, tb + .3) * O(a, 1), p = cam.P(2.6 * CT, 2.6 * ST + .3, .5);
    if (!V) callout(p[0], p[1], 110, 150, 'TWO ABREAST · EVERY STEP', 'THE WHOLE MACHINE, FINALLY IN USE', ba, COL.cyan, 1);
  }
  if (V) { const tb = wt(13, 'side') - .1, ba = vis(t, tb, T.tc1 - .4, .3, .4), p = cam.P(2.6 * CT, 2.6 * ST + .3, .5); callout(p[0], p[1], 790 - p[0], 1210 - p[1], 'TWO ABREAST · EVERY STEP', 'THE WHOLE MACHINE, FINALLY IN USE', ba, COL.cyan, 0); }
  // cleared
  const ca = vis(t, MAIN.tClear, T.end + .3, .1, .3);
  if (ca > 0) { const p = cam.P(-5, 1.2, 0); ctx.save(); ctx.globalAlpha = ca; stamp(t, MAIN.tClear, O(p[0], W / 2), O(p[1] - 60, 1338), 'BOTTLENECK CLEARED', COL.green, -.05, O(46, 48)); ctx.restore(); }
  // way out
  const tg = wt(13, 'getting') - .1, ga = vis(t, tg, T.end + .5, .5, .4), Lb = SIM.cfg.Lb(tau), w = cam.P(Lb * CT + 5.5, Lb * ST + 1.7, 0);
  callout(w[0], w[1], O(-70, -120), O(-74, 6), 'WAY OUT', 'TO WORK, SOONER', ga, COL.green, -1);
}
// ---------------------------------------------------------------- clock + queue HUD
function rushHud(t, tau, q) {
  const a = Math.max(vis(t, T.tw1 + .3, T.math + .2, .5, .2), vis(t, T.crowd - .1, T.end + .3, .4, .4)); if (a <= 0) return;
  const X = 60, Y = O(112, 236), Wp = O(374, 384), Hp = 138;
  hudPanel(X, Y, Wp, Hp, 'RUSH HOUR · TIME-LAPSE', a, COL.cyan2);
  const s = Math.max(0, tau - MAIN.clock0), mm = 30 + Math.floor(s / 60), ss = Math.floor(s % 60);
  ctx.save(); ctx.globalAlpha = a;
  txt('08:' + String(mm).padStart(2, '0') + ':' + String(ss).padStart(2, '0'), X + 24, Y + 98, font(800, O(36, 36), F.m), '#fff', 'left', 0);
  const n = Math.round(q), col = n > 60 ? COL.red : n > 15 ? COL.amber : COL.green;
  txt('WAITING', X + Wp - 24, Y + 62, font(700, 14, F.m), COL.mono, 'right', 4);
  txt(String(n), X + Wp - 24, Y + 114, font(900, O(54, 56)), col, 'right', 0);
  ctx.restore();
}
// ---------------------------------------------------------------- end card
function endCard(t) {
  const a = P(t, T.end, T.end + .7); if (a <= 0) return;
  ctx.fillStyle = `rgba(2,6,14,${.8 * a})`; ctx.fillRect(-40, -40, W + 80, H + 80);
  ctx.save(); ctx.globalAlpha = a; const y = O(H / 2 - 40, H / 2 - 150) + 22 * (1 - E.o3(a)), lw = E.o3(P(t, T.end + .3, T.end + 1.1));
  if (V) { txt('STAND STILL.', W / 2, y, font(900, 124), '#fff', 'center', 3, 'middle'); ctx.shadowColor = 'rgba(95,212,255,.6)'; ctx.shadowBlur = 30; txt('MOVE FASTER.', W / 2, y + 136, font(900, 124), COL.cyan, 'center', 3, 'middle'); ctx.shadowBlur = 0; }
  else { const s1 = 'STAND STILL. ', s2 = 'MOVE FASTER.', f = font(900, 116), w1 = tw(s1, f, 3), w2 = tw(s2, f, 3), x0 = W / 2 - (w1 + w2) / 2; txt(s1, x0, y, f, '#fff', 'left', 3, 'middle'); ctx.shadowColor = 'rgba(95,212,255,.6)'; ctx.shadowBlur = 30; txt(s2, x0 + w1, y, f, COL.cyan, 'left', 3, 'middle'); ctx.shadowBlur = 0; }
  const yb = y + O(86, 232); ctx.fillStyle = COL.cyan; ctx.fillRect(W / 2 - O(330, 300) * lw, yb, O(660, 600) * lw, 3);
  txt('THE HOLBORN ESCALATOR EXPERIMENT', W / 2, yb + 52, font(700, O(24, 25), F.m), COL.cyan2, 'center', O(8, 5));
  ctx.globalAlpha = a * .62 * P(t, T.end + .6, T.end + 1.2);
  if (V) { txt("FIGURES AS REPORTED FROM TfL'S HOLBORN", W / 2, yb + 120, font(500, 16, F.m), '#d8ebff', 'center', 2); txt('STANDING-ONLY TRIALS, 2015–16', W / 2, yb + 146, font(500, 16, F.m), '#d8ebff', 'center', 2); txt('CROWD SCENES: ILLUSTRATIVE SIMULATION', W / 2, yb + 172, font(500, 16, F.m), '#d8ebff', 'center', 2); }
  else txt("FIGURES AS REPORTED FROM TfL'S HOLBORN STANDING-ONLY TRIALS, 2015–16   ·   CROWD SCENES: ILLUSTRATIVE SIMULATION", W / 2, yb + 112, font(500, 15, F.m), '#d8ebff', 'center', 2);
  ctx.restore();
}

// tracking brackets with the label to the upper-left
function heroTag(x, y, r, t, label, sub, a, col, side = -1) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y);
  const rr = r * (1 + .5 * (1 - E.o3(clamp(a * 1.5)))); ctx.rotate(Math.sin(t * 1.5) * .08);
  ctx.strokeStyle = col; ctx.lineWidth = 3; const L = rr * .45; ctx.shadowColor = 'rgba(0,6,16,.9)'; ctx.shadowBlur = 10;
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { ctx.beginPath(); ctx.moveTo(sx * rr, sy * (rr - L)); ctx.lineTo(sx * rr, sy * rr); ctx.lineTo(sx * (rr - L), sy * rr); ctx.stroke(); }
  ctx.rotate(-Math.sin(t * 1.5) * .08);
  if (side < 0) { ctx.beginPath(); ctx.moveTo(-rr - 6, -rr - 6); ctx.lineTo(-rr - 34, -rr - 34); ctx.lineTo(-rr - 60, -rr - 34); ctx.stroke();
    txt(label, -rr - 68, -rr - 28, font(800, 24, F.m), col, 'right', 2);
    ctx.globalAlpha = a * (Math.floor(t * 3) % 2 ? 1 : .6); txt(sub + ' ●', -rr - 68, -rr - 2, font(600, 15, F.m), '#fff', 'right', 3); }
  else { ctx.beginPath(); ctx.moveTo(rr + 6, rr + 6); ctx.lineTo(rr + 34, rr + 34); ctx.lineTo(rr + 60, rr + 34); ctx.stroke();
    txt(label, rr + 68, rr + 42, font(800, 24, F.m), col, 'left', 2);
    ctx.globalAlpha = a * (Math.floor(t * 3) % 2 ? 1 : .6); txt('● ' + sub, rr + 68, rr + 68, font(600, 15, F.m), '#fff', 'left', 3); }
  ctx.restore();
}
