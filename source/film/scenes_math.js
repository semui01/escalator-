// SCENE 8 — the math: fill the empty lane, the inequality flips, +31 a minute, +28% capacity.
function sceneMath(t) {
  const t0 = T.math, u = t - t0;
  backdrop(t);
  // blueprint grid
  ctx.save(); ctx.strokeStyle = 'rgba(120,185,255,.045)'; ctx.lineWidth = 1; ctx.beginPath(); for (let x = (W / 2) % 60; x < W; x += 60) { ctx.moveTo(x, 0); ctx.lineTo(x, H); } for (let y = 30; y < H; y += 60) { ctx.moveTo(0, y); ctx.lineTo(W, y); } ctx.stroke(); ctx.restore();
  const tp = wt(10, 'pack'), tflip = wt(10, 'flips'), t31 = wt(11, 'over'), tcap = wt(11, 'boosting'), t28 = wt(11, '28');
  const inA = P(t, t0, t0 + .5);
  // ---------------- the escalator, seen from above
  const DX = O(330, 250), Y0 = O(268, 388), Y1 = O(826, 940), LW = O(150, 124), R = O(34, 27), pitch = O(86, 72), sp = 66, s = sp * (u + 6);
  ctx.save(); ctx.globalAlpha = inA; ctx.translate(-30 * (1 - E.o3(inA)), 0);
  rrect(DX - LW - 8, Y0 - 16, LW * 2 + 16, Y1 - Y0 + 32, 16); ctx.fillStyle = '#152a47'; ctx.fill(); ctx.strokeStyle = 'rgba(160,215,255,.7)'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.save(); ctx.clip();
  ctx.strokeStyle = 'rgba(150,205,255,.16)'; ctx.lineWidth = 2; ctx.beginPath(); for (let y = Y1 + pitch / 2 - (s % pitch); y > Y0 - 40; y -= pitch) { ctx.moveTo(DX - LW, y); ctx.lineTo(DX + LW, y); } ctx.stroke();
  ctx.setLineDash([8, 10]); ctx.strokeStyle = 'rgba(150,205,255,.22)'; ctx.beginPath(); ctx.moveTo(DX, Y0 - 16); ctx.lineTo(DX, Y1 + 16); ctx.stroke(); ctx.setLineDash([]);
  const sAtPack = sp * (tp - t0 + 6), packed = P(t, tp + .1, tp + 1.2);
  if (packed < 1) { ctx.globalAlpha = inA * (1 - packed) * .35; ctx.fillStyle = ctx.createPattern(HATCH, 'repeat'); ctx.fillRect(DX - LW, Y0 - 16, LW, Y1 - Y0 + 32); ctx.globalAlpha = inA; }
  const disc = (x, y, c, sc = 1, al = 1) => { if (sc <= 0 || al <= 0) return; ctx.save(); ctx.globalAlpha = inA * al; ctx.fillStyle = 'rgba(0,4,12,.4)'; ctx.beginPath(); ctx.arc(x + 3, y + 4, R * sc * 1.06, 0, TAU); ctx.fill(); ctx.fillStyle = PAL.ink; ctx.beginPath(); ctx.arc(x, y, R * sc + 3.5, 0, TAU); ctx.fill(); ctx.fillStyle = rgb(c); ctx.beginPath(); ctx.arc(x, y, R * sc, 0, TAU); ctx.fill(); ctx.fillStyle = rgb(mix3(c, [255, 255, 255], .55)); ctx.beginPath(); ctx.arc(x, y, R * sc * .5, 0, TAU); ctx.fill(); ctx.restore(); };
  const r0 = Math.floor((Y0 - 60 + s - Y1) / pitch), r1 = Math.ceil((s + 60) / pitch);
  for (let k = r0; k <= r1; k++) {
    const y = Y1 + k * pitch - s; if (y < Y0 - 50 || y > Y1 + 50) continue;
    disc(DX + LW / 2, y, PAL.stand);
    const yAt = Y1 + k * pitch - sAtPack, rank = (Y1 - yAt) / pitch, tf = yAt > Y1 + 20 ? -1 : tp + .08 + Math.max(0, rank) * .105;
    const f = tf < 0 ? 1 : P(t, tf, tf + .22);
    if (f < 1) { ctx.save(); ctx.globalAlpha = inA * (1 - f) * .9; ctx.strokeStyle = 'rgba(255,120,110,.95)'; ctx.lineWidth = 2.5; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.arc(DX - LW / 2, y, R * .92, 0, TAU); ctx.stroke(); ctx.restore(); }
    if (f > 0) disc(DX - LW / 2, y, PAL.stand, E.oBack(f));
  }
  { const yw = Y1 + 70 - (t - (t0 - .25)) * 620; if (yw > Y0 - 60) { ctx.strokeStyle = rgba(PAL.walk, .35); ctx.lineWidth = R * 1.2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(DX - LW / 2, yw + 30); ctx.lineTo(DX - LW / 2, yw + 110); ctx.stroke(); disc(DX - LW / 2, yw, PAL.walk); } }   // the last walker hurries past
  ctx.restore();
  // moving-up chevrons + captions for the diagram
  ctx.fillStyle = 'rgba(155,231,255,.6)'; for (let k = 0; k < 3; k++) { const ph = ((u * .9 + k / 3) % 1), y = Y1 + 16 - ph * 40, x = DX + LW + 36; ctx.globalAlpha = inA * Math.sin(ph * Math.PI) * .8; ctx.beginPath(); ctx.moveTo(x - 10, y); ctx.lineTo(x, y - 12); ctx.lineTo(x + 10, y); ctx.lineTo(x, y - 5); ctx.fill(); }
  ctx.globalAlpha = inA; txt('LEFT', DX - LW / 2, Y1 + 46, font(700, 15, F.m), COL.mono, 'center', 3); txt('RIGHT', DX + LW / 2, Y1 + 46, font(700, 15, F.m), COL.mono, 'center', 3);
  ctx.restore();
  ruleSign(DX, Y0 - O(94, 96), O(.9, .98), E.io(P(t, tp - .2, tp + .25)), inA);
  // ---------------- phase 1: the question
  const q = vis(t, t0 + .25, wt(10, 'the') - .05, .45, .3);
  if (q > 0) { ctx.save(); ctx.globalAlpha = q; const X = O(700, 520), Y = O(400, 560) + 16 * (1 - E.o3(P(t, t0 + .25, t0 + .8)));
    if (V) { txt('WHAT IF', X, Y, font(900, 76), '#fff', 'left', 1); txt('NOBODY', X, Y + 84, font(900, 76), COL.cyan, 'left', 1); txt('WALKS?', X, Y + 168, font(900, 76), '#fff', 'left', 1); }
    else { const f = font(900, 118), a2 = 'NOBODY ', w2 = tw(a2, f, 1); txt('WHAT IF', X, Y, f, '#fff', 'left', 1); txt(a2, X, Y + 122, f, COL.cyan, 'left', 1); txt('WALKS?', X + w2, Y + 122, f, '#fff', 'left', 1); }
    const s2 = O('FILL THE EMPTY LANE WITH STANDING PASSENGERS', 'FILL THE EMPTY LANE'); txt(s2.slice(0, Math.round(s2.length * P(t, tp - .2, tp + .8))), X + 4, Y + O(186, 224), font(700, O(22, 21), F.m), COL.cyan2, 'left', 4);
    if (V) { const s3 = 'WITH STANDING PASSENGERS'; txt(s3.slice(0, Math.round(s3.length * P(t, tp + .3, tp + 1.1))), X + 4, Y + 256, font(700, 21, F.m), COL.cyan2, 'left', 4); }
    ctx.restore(); }
  // ---------------- phase 2: the inequality that flips
  const ia = vis(t, wt(10, 'the') - .1, T.crowd + .3, .4, .1);
  if (ia > 0) {
    const hd = E.io(P(t, LS(11) - .25, LS(11) + .45)), cx = lerp(O(1262, 540), O(1262, 772), hd), cy = lerp(O(470, 1180), O(206, 452), hd), sc = lerp(O(.96, .84), O(.56, .46), hd), fl = E.oBack(P(t, tflip - .08, tflip + .38)), won = P(t, tflip, tflip + .3);
    ctx.save(); ctx.globalAlpha = ia; ctx.translate(cx, cy + 20 * (1 - E.o3(P(t, wt(10, 'the') - .1, wt(10, 'the') + .4)))); ctx.scale(sc, sc);
    const chip = (x, lab, col, al) => { ctx.save(); ctx.globalAlpha *= al; rrect(x - 96, -48, 192, 96, 16); ctx.fillStyle = col; ctx.fill(); txt(lab, x, 3, font(900, 40), '#04101f', 'center', 2, 'middle'); ctx.restore(); };
    const plus = (x, al) => { ctx.save(); ctx.globalAlpha *= al; txt('+', x, 2, font(800, 54), '#fff', 'center', 0, 'middle'); ctx.restore(); };
    const la = lerp(1, .42, won), ra = lerp(.5, 1, won);
    chip(-470, 'WALK', COL.amber, la); plus(-352, la); chip(-234, 'STAND', COL.cyan, la);
    ctx.save(); if (won > 0) { ctx.shadowColor = 'rgba(95,212,255,.9)'; ctx.shadowBlur = 40 * won; } chip(234, 'STAND', COL.cyan, ra); plus(352, ra); chip(470, 'STAND', COL.cyan, ra); ctx.restore();
    ctx.save(); ctx.rotate(Math.PI * fl); ctx.strokeStyle = '#fff'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-34, -46); ctx.lineTo(38, 0); ctx.lineTo(-34, 46); ctx.stroke(); ctx.restore();
    const lab = won < .5 ? 'WHAT FEELS FASTER' : 'WHAT IS FASTER'; ctx.globalAlpha = ia * Math.abs(1 - 2 * won) * (1 - hd); txt(lab, 0, -98, font(700, 24, F.m), won < .5 ? COL.amber : COL.cyan2, 'center', 8);
    ctx.restore();
  }
  // ---------------- phase 3: +31 people a minute
  const pa = P(t, LS(11) + .15, LS(11) + .6);
  if (pa > 0) {
    const n = Math.round(31 * E.io2(P(t, t31 - .1, wt(11, 'people') + .1))), X = O(700, 500), Y = O(486, 690), f = font(900, O(196, 150));
    ctx.save(); ctx.globalAlpha = pa; ctx.translate(0, 18 * (1 - E.o3(pa)));
    ctx.shadowColor = 'rgba(95,212,255,.65)'; ctx.shadowBlur = 30; txt('+' + n, X, Y, f, COL.cyan, 'left', 0); ctx.shadowBlur = 0;
    const nw = tw('+31', f, 0);
    if (V) { txt('MORE PEOPLE', X + 4, Y + 62, font(850, 44), '#fff', 'left', 1); txt('EVERY MINUTE', X + 4, Y + 112, font(850, 44), '#fff', 'left', 1); txt('ONTO THE SAME MACHINE', X + 6, Y + 150, font(600, 17, F.m), COL.cyan2, 'left', 3); }
    else { txt('MORE PEOPLE', X + nw + 34, Y - 82, font(850, 58), '#fff', 'left', 1); txt('EVERY MINUTE', X + nw + 34, Y - 18, font(850, 58), '#fff', 'left', 1); txt('ONTO THE SAME MACHINE · MODELLED FOR HOLBORN', X + 6, Y + 44, font(600, 17, F.m), COL.cyan2, 'left', 3); }
    // one-minute dial
    const dx = O(1716, 946), dy = O(Y - 66, Y - 52), Rr = O(74, 60), hp = P(t, t31, wt(11, 'minute') + .5);
    ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(dx, dy, Rr, 0, TAU); ctx.stroke();
    ctx.strokeStyle = COL.cyan; ctx.beginPath(); ctx.arc(dx, dy, Rr, -Math.PI / 2, -Math.PI / 2 + TAU * hp); ctx.stroke();
    txt(String(Math.round(60 * hp)).padStart(2, '0'), dx, dy + 2, font(800, O(44, 38), F.m), '#fff', 'center', 0, 'middle'); txt('SEC', dx, dy + O(34, 30), font(700, 13, F.m), COL.mono, 'center', 3, 'middle');
    // the 31 extra passengers
    const gx = O(X + 16, 86), gy = O(Y + 126, 1066), cols = 16, gp = O(37, 60), gs = O(44, 62);
    for (let i = 0; i < 31; i++) { const on = P(t, t31 + i * .028, t31 + i * .028 + .18); if (on <= 0) continue; const xx = gx + (i % cols) * gp + (i >= 16 ? gp / 2 : 0), yy = gy + Math.floor(i / cols) * O(52, 84); ctx.save(); ctx.translate(xx, yy); ctx.scale(E.oBack(on), E.oBack(on)); glyph(0, 0, gs, COL.cyan, pa); ctx.restore(); }
    ctx.restore();
  }
  // ---------------- phase 4: +28% capacity
  const ca = P(t, tcap - .3, tcap + .15);
  if (ca > 0) {
    const X = O(700, 70), Y = O(752, 1236), BWd = O(1110, 940), base = BWd / 1.28, g = E.io2(P(t, tcap, t28 - .05)), hh = O(58, 60);
    ctx.save(); ctx.globalAlpha = ca; ctx.translate(0, 16 * (1 - E.o3(ca)));
    txt('TOTAL ESCALATOR CAPACITY', X, Y - 18, font(700, O(17, 18), F.m), COL.mono, 'left', 4);
    ctx.fillStyle = 'rgba(255,255,255,.07)'; rrect(X, Y, BWd, hh, 10); ctx.fill();
    ctx.fillStyle = 'rgba(226,240,255,.9)'; rrect(X, Y, base, hh, 10); ctx.fill(); txt('WALK LEFT · STAND RIGHT', X + 20, Y + hh / 2 + 1, font(800, O(19, 18)), '#04101f', 'left', 1.5, 'middle');
    if (g > 0) { ctx.save(); ctx.shadowColor = 'rgba(95,212,255,.8)'; ctx.shadowBlur = 26; ctx.fillStyle = COL.cyan; rrect(X + base + 4, Y, Math.max(6, (BWd - base - 4) * g), hh, 10); ctx.fill(); ctx.restore();
      if (g > .7) txt(O('EVERYONE STANDS', 'ALL STAND'), X + base + 20, Y + hh / 2 + 1, font(800, O(19, 17)), '#04101f', 'left', 1.2, 'middle'); }
    const pp = P(t, t28 - .05, t28 + .3);
    if (pp > 0) { const sc = lerp(1.7, 1, E.oBack(pp)); ctx.save(); ctx.globalAlpha = ca * pp; ctx.translate(X + BWd, Y - 22); ctx.scale(sc, sc); ctx.shadowColor = 'rgba(95,212,255,.8)'; ctx.shadowBlur = 30; txt('+28%', 0, 0, font(900, O(92, 96)), COL.cyan, 'right', 0); ctx.restore(); }
    ctx.globalAlpha = ca * .7 * P(t, t28 + .2, t28 + .7); txt(O("MODELLED FOR HOLBORN'S 24 m ESCALATORS  ·  TfL'S LIVE TRIAL RECORDED ABOUT +30%", "MODELLED FOR HOLBORN · TfL'S LIVE TRIAL: ABOUT +30%"), X, Y + hh + 34, font(500, O(15, 16), F.m), '#d8ebff', 'left', 2);
    ctx.restore();
  }
}
