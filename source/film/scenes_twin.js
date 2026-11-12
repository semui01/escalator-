// SCENE 1 — the hook: one crowd, one escalator, two rules, raced side by side in plan view.
const SC = window.SIMCFG; let SIM, SA, SB;
const T = { go: SC.GO, map: LB(2), short: LB(3), tall: LB(5), shift: LB(6), forty: LB(7), waste: LB(8), half: LB(9), math: LB(10), crowd: LB(12), fix: LB(13), flip: SC.F.flip, end: LE(13) + .25 };
const COL = { cyan: '#62d6ff', cyan2: '#9be7ff', amber: '#ffb340', red: '#ff5548', green: '#7dffb0', dim: 'rgba(225,240,255,.72)', mono: 'rgba(200,225,250,.8)' };
function stxt(s, x, y, f, col, align = 'left', ls = 0, base = 'alphabetic', blur = 12) { ctx.save(); ctx.shadowColor = 'rgba(0,6,16,.9)'; ctx.shadowBlur = blur; txt(s, x, y, f, col, align, ls, base); ctx.restore(); }
function tw(s, f, ls = 0) { ctx.font = f; ctx.letterSpacing = ls + 'px'; const w = ctx.measureText(s).width; ctx.letterSpacing = '0px'; return w; }
const ZA = -4.6, ZB = 4.6;
let TW = null;
function twinInit() {
  const go = SC.tauH(SC.GO);
  TW = { go, dA: SA.tClear - go, dB: SB.tClear - go, tcA: (SA.tClear - SC.PRE) / SC.KH, tcB: (SB.tClear - SC.PRE) / SC.KH, n0: SA.cfg.init.n };
  T.tcA = TW.tcA; T.tcB = TW.tcB;
}
const TWK = () => { const wide = O({ x: 8.5, y: 0, z: 0, yaw: 0, pitch: 90, zoom: 43.6, cy: 452 }, { x: 2.3, y: 0, z: 0, yaw: -90, pitch: 90, zoom: 58, cy: 860 });
  const onA = O({ x: 4.2, y: 0, z: ZA, yaw: 0, pitch: 90, zoom: 78, cy: 470 }, { x: 4.4, y: 0, z: ZA * .62, yaw: -90, pitch: 90, zoom: 86, cy: 860 });
  const a = LS(1) - .1, b = wt(1, 'but') - .25;
  return [[0, wide], [a, wide], [a + .9, onA], [b, onA], [b + .9, wide]]; };
let TWKEYS = null;
function sceneTwin(t) {
  backdrop(t);
  if (!TWKEYS) TWKEYS = TWK();
  const tau = SC.tauH(t), cam = mkCam(camAt(TWKEYS, t));
  const a = LS(1) - .1, b = wt(1, 'but') - .25, fA = E.io(P(t, a, a + .9)) * (1 - E.io(P(t, b, b + .9)));   // 1 while the camera is on escalator A
  drawWorld(SA, tau, cam, { zo: ZA, waitFrom: TW.go, heatSpan: 55, hoops: 0 });
  drawWorld(SB, tau, cam, { zo: ZB, waitFrom: TW.go, heatSpan: 55, hoops: 0, alpha: 1 - .55 * fA });
  twinOverlay(t, tau, cam, fA);
}
function twinOverlay(t, tau, cam, fA) {
  const elapsed = Math.max(0, tau - TW.go), doneA = tau >= SA.tClear, doneB = tau >= SB.tClear;
  const qA = doneA && t < wt(1, 'massive') ? 0 : Math.round(serie(SA, 'q', tau)), qB = doneB && t < wt(1, 'massive') ? 0 : Math.round(serie(SB, 'q', tau));
  const pa = cam.P(0, 0, ZA), pb = cam.P(0, 0, ZB), ov = 1 - fA, intro = P(t, .35, .9), hold = wt(1, 'massive') + .1;   // at `hold` the next wave pours in: keep the verdict, drop the live counters
  // ---- start gates: red until GO, then a green flash
  { const ga = t < T.go ? 1 : 1 - P(t, T.go, T.go + .55); if (ga > 0) for (const zz of [ZA, ZB]) { const a0 = cam.P(-.12, 0, zz - .6), a1 = cam.P(-.12, 0, zz + .6); ctx.save(); ctx.globalAlpha = ga; ctx.strokeStyle = t < T.go ? COL.red : COL.green; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 18; ctx.beginPath(); ctx.moveTo(a0[0], a0[1]); ctx.lineTo(a1[0], a1[1]); ctx.stroke(); ctx.restore(); } }
  // ---- strip headers
  const head = (L, p, q, done, dur, col, lines, al) => {
    if (al <= 0) return; ctx.save(); ctx.globalAlpha = al;
    const x = O(46, p[0] - 190), y = O(p[1] - 118, 252), cnt = 1 - P(t, hold - .5, hold - .1);
    { const hh = lerp(78, O(232, 150), cnt); ctx.fillStyle = 'rgba(4,12,26,.82)'; rrect(x - 14, y - 12, O(318, 408), hh, 16); ctx.fill(); ctx.strokeStyle = col; ctx.globalAlpha = al * .5; ctx.lineWidth = 1.5; ctx.stroke(); ctx.globalAlpha = al; }
    rrect(x, y, 54, 54, 12); ctx.fillStyle = L === 'B' ? col : 'rgba(4,12,26,.9)'; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.stroke();
    txt(L, x + 27, y + 29, font(850, 32), L === 'B' ? '#04101f' : col, 'center', 0, 'middle');
    lines.forEach(([s, c], i) => stxt(s, x + 70, y + 22 + i * 30, font(800, 25), c, 'left', 1.5));
    const yy = y + O(98, 86); ctx.globalAlpha = al * cnt; if (cnt <= 0) { ctx.restore(); return; }
    stxt('WAITING', x, yy, font(600, 15, F.m), COL.mono, 'left', 4);
    stxt(String(q), x, yy + O(62, 48), font(800, O(66, 50)), done ? COL.green : '#fff', 'left', 0);
    const tx = x + O(150, 132), ty = yy + O(40, 28);
    stxt(mmss(done ? dur : elapsed), tx, ty, font(700, O(30, 26), F.m), done ? COL.green : COL.dim, 'left', 1);
    stxt(done ? 'CLEARED' : 'ELAPSED', tx, ty + 24, font(600, 13, F.m), done ? COL.green : COL.mono, 'left', 3);
    if (done) check(tx + O(118, 104), ty - 10, 22, COL.green, P(t, (L === 'A' ? TW.tcA : TW.tcB), (L === 'A' ? TW.tcA : TW.tcB) + .35));
    ctx.restore();
  };
  head('A', pa, qA, doneA, TW.dA, COL.amber, [['WALK LEFT', COL.amber], ['STAND RIGHT', COL.cyan]], intro * ov);
  head('B', pb, qB, doneB, TW.dB, COL.cyan, [['EVERYONE', COL.cyan], ['STANDS', COL.cyan]], intro * ov);
  // ---- why: one-line reasons on the belts (landscape has the room)
  if (!V) {
    const p1 = cam.P(13, 0, ZA - .27), p2 = cam.P(13, 0, ZB + .27), t1 = wt(0, 'escalator') - .1, t2 = wt(0, 'stand') - .05, off = wt(1, 'leaving') - .3;
    callout(p1[0], p1[1], 46, -62, 'WALKERS NEED GAPS', 'FAST, BUT MOSTLY EMPTY STEPS', vis(t, t1, off, .7, .3) * ov, COL.amber);
    callout(p2[0], p2[1], 46, 66, 'TWO ON EVERY STEP', 'NOBODY WALKS · NOTHING WASTED', vis(t, t2, off, .7, .3) * ov, COL.cyan);
  }
  // ---- B gets the spotlight on "stand perfectly still"
  const ts = wt(0, 'stand');
  if (t > ts - .1 && ov > 0) {
    const g = P(t, ts - .1, ts + .5), pulse = .55 + .45 * Math.sin((t - ts) * 5), q0 = cam.P(-15, 0, ZB - 3.3), q1 = cam.P(40, 0, ZB + 3.3);
    ctx.save(); ctx.globalAlpha = ov * g * (.35 + .25 * pulse) * (1 - P(t, TW.tcB + 1.2, TW.tcB + 2)); ctx.strokeStyle = COL.cyan; ctx.lineWidth = 3; ctx.shadowColor = COL.cyan; ctx.shadowBlur = 24;
    const x0 = Math.min(q0[0], q1[0]), y0 = Math.min(q0[1], q1[1]); ctx.strokeRect(Math.max(-10, x0), y0, Math.abs(q1[0] - q0[0]), Math.abs(q1[1] - q0[1])); ctx.restore();
  }
  // ---- CLEARED stamp on B's empty floor
  if (ov > 0) { ctx.save(); ctx.globalAlpha = ov * (1 - P(t, wt(1, 'massive') - .3, wt(1, 'massive'))); const p = cam.P(O(-1.9, -3.6), 0, ZB + O(.9, 0)); stamp(t, TW.tcB, p[0], p[1], 'CLEARED', COL.green, -.07, O(40, 40)); ctx.restore(); }
  // ---- race clock (between the two belts)
  const rp = P(t, 1.0, 1.6) * ov;
  if (rp > 0) {
    const X = O(1196, 60), Y = O(pa[1] + 64, 426), Wp = O(660, 960), Hp = O(pb[1] - pa[1] - 128, 190), full = Math.max(TW.dA, TW.dB) * 1.12;
    ctx.save(); ctx.globalAlpha = rp; ctx.translate(0, 14 * (1 - E.o3(rp)));
    hudPanel(X, Y, Wp, Hp, 'TIME TO CLEAR THE SAME ' + TW.n0 + ' PEOPLE', 1, COL.cyan2);
    const bx = X + 34, bw = Wp - 190, rowH = O((Hp - 96) / 2, 44), y0 = Y + 62;
    const row = (i, lab, dur, done, col) => {
      const y = y0 + i * (rowH + 10), frac = Math.min(done ? dur : elapsed, full) / full;
      ctx.fillStyle = 'rgba(255,255,255,.07)'; rrect(bx, y, bw, rowH, 8); ctx.fill();
      const g = ctx.createLinearGradient(bx, 0, bx + bw, 0); g.addColorStop(0, col); g.addColorStop(1, i === 0 && elapsed > TW.dB ? COL.red : col);
      ctx.fillStyle = g; rrect(bx, y, Math.max(8, bw * frac), rowH, 8); ctx.fill();
      const fw = Math.max(8, bw * frac);
      ctx.save(); ctx.beginPath(); ctx.rect(bx + fw, y, bw, rowH); ctx.clip(); txt(lab, bx + 12, y + rowH / 2 + 1, font(800, O(17, 16)), 'rgba(230,242,255,.85)', 'left', 1.5, 'middle'); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(bx, y, fw, rowH); ctx.clip(); txt(lab, bx + 12, y + rowH / 2 + 1, font(800, O(17, 16)), '#04101f', 'left', 1.5, 'middle'); ctx.restore();
      txt(mmss(done ? dur : elapsed), bx + bw + 20, y + rowH / 2 + 1, font(800, O(34, 30), F.m), done ? (i ? COL.green : COL.red) : '#fff', 'left', 0, 'middle');
    };
    row(0, 'A · WALK LEFT', TW.dA, doneA, COL.amber); row(1, 'B · EVERYONE STANDS', TW.dB, doneB, COL.cyan);
    ctx.restore();
  }
  // ---- A close-up: the walking lane that "feels efficient"
  if (fA > 0) {
    const tl = wt(1, 'walking') - .15, lp = E.o3(P(t, tl, tl + .6)) * fA;
    const u0 = 0.4, u1 = O(15.5, 12.5), q0 = cam.P(u0, 0, ZA - .56), q1 = cam.P(u1, 0, ZA - .02);
    if (lp > 0) {
      ctx.save(); ctx.globalAlpha = lp; ctx.strokeStyle = COL.amber; ctx.lineWidth = 3; ctx.setLineDash([14, 10]); ctx.lineDashOffset = -t * 40; ctx.shadowColor = COL.amber; ctx.shadowBlur = 14;
      const x0 = Math.min(q0[0], q1[0]), y0 = Math.min(q0[1], q1[1]), w = Math.abs(q1[0] - q0[0]), h = Math.abs(q1[1] - q0[1]);
      if (V) rrect(x0 - 5, y0 + h * (1 - lp), w + 10, h * lp, 10); else rrect(x0, y0 - 5, w * lp, h + 10, 10); ctx.stroke(); ctx.restore();
      const lx = O(x0 + 40, 44), ly = O(y0 - 92, y0 + h * .34);
      ctx.save(); ctx.globalAlpha = lp;
      stxt('WALKING LANE', lx, ly, font(850, O(44, 36)), COL.amber, 'left', 2);
      stxt(O('KEPT CLEAR FOR PEOPLE IN A HURRY', 'KEPT CLEAR FOR A FEW'), lx, ly + 30, font(600, O(16, 14), F.m), COL.dim, 'left', 3);
      const tf = wt(1, 'feels') - .05, fp = P(t, tf, tf + .35);
      if (fp > 0) { ctx.globalAlpha = lp * fp; const fx = O(lx + tw('WALKING LANE', font(850, 44), 2) + 54, lx), fy = O(ly - 14, ly + 86);
        const lab = 'FEELS EFFICIENT', ww = tw(lab, font(800, 22), 2) + 74; pill(fx, fy - 24, ww, 48, 'rgba(255,179,64,.16)', COL.amber, 2);
        check(fx + 30, fy - 2, 20, COL.amber, P(t, tf + .1, tf + .5)); stxt(lab, fx + 56, fy + 1, font(800, 22), COL.amber, 'left', 2, 'middle'); }
      ctx.restore();
    }
    // the queue right beside it
    const tq = wt(1, 'open') + .1, qp = vis(t, tq, wt(1, 'but') + .2, .5, .4) * fA, pc = cam.P(-2.3, 0, ZA + 1.5);
    callout(pc[0], pc[1], O(170, 800 - pc[0]), O(170, -190), qA > 0 ? qA + ' STILL QUEUEING' : 'QUEUE GONE', 'FOR THE ONE STANDING LANE', qp, COL.red, O(1, 0));
    // timer chip
    ctx.save(); ctx.globalAlpha = fA; const cx_ = O(W - 330, W / 2 - 150), cy_ = O(128, 268);
    pill(cx_, cy_, 300, 58, 'rgba(4,12,26,.85)', doneA ? COL.red : 'rgba(155,231,255,.5)', 2);
    txt('A', cx_ + 30, cy_ + 31, font(850, 26), COL.amber, 'center', 0, 'middle'); txt(mmss(doneA ? TW.dA : elapsed), cx_ + 60, cy_ + 31, font(800, 30, F.m), doneA ? COL.red : '#fff', 'left', 0, 'middle');
    txt(doneA ? 'CLEARED' : 'ELAPSED', cx_ + 160, cy_ + 31, font(600, 14, F.m), COL.mono, 'left', 3, 'middle'); ctx.restore();
  }
  // ---- verdict: the delay, every wave
  const tv = wt(1, 'secretly') + .1, vp = P(t, tv, tv + .4) * ov;
  if (vp > 0) {
    const dS = Math.round(TW.dA - TW.dB), X = O(1420, W / 2), Y = O(pa[1] - 74, 700), big = '+' + dS + ' s';
    ctx.save(); ctx.globalAlpha = vp; const s = lerp(1.5, 1, E.oBack(vp)); ctx.translate(X, Y); ctx.scale(s, s);
    const tm = wt(1, 'massive'), hot = P(t, tm, tm + .2);
    if (V) { ctx.fillStyle = 'rgba(4,10,22,.86)'; rrect(-430, -92, 860, 190, 18); ctx.fill(); ctx.strokeStyle = COL.red; ctx.lineWidth = 2; ctx.stroke(); }
    ctx.shadowColor = 'rgba(255,60,50,.8)'; ctx.shadowBlur = 20 + 30 * hot;
    txt(big, O(-20, 0), O(0, -8), font(900, O(86, 100)), COL.red, O('right', 'center'), 0, O('middle', 'alphabetic'));
    ctx.shadowBlur = 0;
    stxt('SLOWER WITH A WALKING LANE', O(0, 0), O(-14, 34), font(800, O(23, 26)), '#fff', O('left', 'center'), 1.2, O('middle', 'alphabetic'));
    const s2 = 'EVERY TRAINLOAD · ALL RUSH HOUR'; stxt(s2.slice(0, Math.round(s2.length * P(t, tm - .1, tm + .7))), O(0, 0), O(18, 68), font(600, O(17, 18), F.m), COL.red, O('left', 'center'), 3, O('middle', 'alphabetic'));
    ctx.restore();
  }
  // ---- premise line
  const pr = vis(t, .5, wt(0, 'forcing') - .1, .5, .4);
  if (pr > 0 && !V) { ctx.save(); ctx.globalAlpha = pr; const y = O((pa[1] + pb[1]) / 2 + 6, 1418); stxt('SAME CROWD  ·  SAME ESCALATOR  ·  TWO RULES', O(pa[0] - 250, W / 2), y, font(700, O(19, 21), F.m), COL.cyan2, O('left', 'center'), O(5, 3)); ctx.restore(); }
}
