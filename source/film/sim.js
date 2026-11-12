// Deterministic crowd + escalator simulation. Runs once at init (seeded), records tracks; render(t) only interpolates.
// World axes: X along the approach / escalator run, Y up, Z across (rider's right = +Z, left = -Z).
// Units are real metres and seconds; the film plays it back as a time-lapse.
(function (G) {
  const TH = Math.PI / 6, CT = Math.cos(TH), ST = Math.sin(TH), VB = 0.75, LZ = 0.27, OPEN = 0.55;
  function mulberry(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const sm = t => { t = cl(t); return t * t * (3 - 2 * t); };
  const ANG = [0, 0.55, -0.55, 1.1, -1.1], CA = ANG.map(Math.cos), SA = ANG.map(Math.sin), SIDE_A = [1, 3, 2, 4], SIDE_B = [2, 4, 1, 3];

  function buildSim(cfg) {
    const R = mulberry(cfg.seed || 1), dt = 0.1, REC = 2, DR = dt * REC;
    const NR = Math.floor(cfg.T / DR) + 3;
    const W = cfg.hallW, XS = -cfg.hallL;
    const agents = []; let live = [];
    const S = { q: new Float32Array(NR), nFloor: new Float32Array(NR), nL: new Float32Array(NR), nR: new Float32Array(NR), thru: new Float32Array(NR), board: new Float32Array(NR), wait: new Float32Array(NR), Lb: new Float32Array(NR), qwait: new Float32Array(NR) };
    let nextArr = 0.3, thru = 0, boarded = 0, nextTick = 0, lastWalkT = -9, recI = 0, waitEma = 0;
    const laneL = [], laneR = [];      // riders per lane in boarding order (index 0 = highest up)
    let hero = null;

    function spawn(tau, o) {
      const a = { id: agents.length, x: XS + R() * 1.5, z: (R() * 2 - 1) * (W - 0.5), r: 0.255 + R() * 0.03, v0: 1.2 + R() * 0.4,
        role: 0, st: 0, lane: 0, u: 0, d: 0, zt: (R() * 2 - 1) * 2.4, t0: tau, tStuck: -1, tBoard: -1, tOff: -1, tGone: -1, slow: 0, f: 1,
        tint: R(), hs: 0.93 + R() * 0.14, hero: false, rec0: -1, tr: [], px: 0, pz: 0, tx: 0, tz: 0, dT: 0, walking: false, vw: 0, zb: 0, w: 1, vz: 0, side: 1 };
      a.side = a.id % 2 ? 1 : -1;
      a.role = R() < cfg.pWalk(tau) ? 1 : 0; a.vw = 0.56 + 0.2 * R();
      if (o) Object.assign(a, o);
      agents.push(a); live.push(a); return a;
    }

    if (cfg.init) for (let i = 0; i < cfg.init.n; i++) spawn(0, { x: cfg.init.x0 + R() * (cfg.init.x1 - cfg.init.x0) });
    let tClear = -1, clearRun = 0, tOpen = -1;
    for (let step = 0; ; step++) {
      const tau = step * dt; if (tau > cfg.T) break;
      const open = cfg.open ? cfg.open(tau) : true; if (open && tOpen < 0) tOpen = tau;
      const Lb = cfg.Lb(tau), reg = cfg.regime(tau), HS = cfg.hs ? cfg.hs(tau) : 0.8;
      // ---- arrivals (Poisson)
      while (tau >= nextArr) { const lam = cfg.lam(nextArr); if (lam > 0.01) { spawn(tau); nextArr += -Math.log(1 - R() * 0.999) / lam; } else nextArr += 0.5; }
      if (cfg.hero && !hero && tau >= cfg.hero.tSpawn) hero = spawn(tau, { hero: true, role: 0, z: cfg.hero.z0, v0: 1.45, r: 0.27, tint: 0.5, hs: 1.04 });
      const heroHold = hero && hero.st === 0 && tau < cfg.hero.tGo;
      if (hero) hero.w = (heroHold || (hero.st === 0 && tau < cfg.hero.tGo + 4)) ? 0.1 : 1;

      // ---- floor agents: targets
      const F = [];
      for (const a of live) if (a.st === 0) {
        if (a.hero && heroHold) { a.tx = cfg.hero.spot[0]; a.tz = cfg.hero.spot[1]; }
        else if (a.hero) { a.tx = -0.3; a.tz = -LZ; }
        else if (reg === 0) { a.tx = -0.3; a.tz = a.role ? -LZ : LZ; }
        else { a.tx = -0.3; a.tz = cl(a.z, -LZ, LZ); }
        a.dT = Math.hypot(a.tx - a.x, a.tz - a.z); F.push(a);
      }
      F.sort((p, q) => p.x - q.x);
      // ---- anticipation: slow down behind people who are closer to my goal; if blocked, sidestep into free space
      for (let i = 0; i < F.length; i++) {
        const a = F[i];
        if (a.dT <= 0.02) { a.px = a.x; a.pz = a.z; a.f = 0; continue; }
        const dx0 = (a.tx - a.x) / a.dT, dz0 = (a.tz - a.z) / a.dT;
        const gapAlong = (dx, dz, strict) => {
          let gap = 9;
          const scan = j => {
            const b = F[j], rx = b.x - a.x, rz = b.z - a.z; if (Math.abs(rz) > 1.3) return;
            if (reg === 0 && a.role !== b.role && !b.hero) return;             // walkers and standers queue for different lanes
            const proj = rx * dx + rz * dz; if (proj <= 0 || proj > 1.3) return;
            if (strict && Math.hypot(a.tx - b.x, a.tz - b.z) > a.dT - 0.04) return;   // only yield to people ahead of me
            const lat = Math.abs(rx * dz - rz * dx), rs = (a.r + b.r) * 0.97; if (lat >= rs) return;
            const g = proj - Math.sqrt(rs * rs - lat * lat); if (g < gap) gap = g;
          };
          for (let j = i + 1; j < F.length && F[j].x - a.x < 1.3; j++) scan(j);
          for (let j = i - 1; j >= 0 && a.x - F[j].x < 1.3; j--) scan(j);
          return gap;
        };
        const g0 = gapAlong(dx0, dz0, true); let dx = dx0, dz = dz0, gap = g0, k = 0;
        if (g0 < 0.12 && a.dT > 0.9 && !a.hero) {
          let best = g0;
          for (const q of (a.side > 0 ? SIDE_A : SIDE_B)) {
            const ex = dx0 * CA[q] - dz0 * SA[q], ez = dx0 * SA[q] + dz0 * CA[q], nx = a.x + ex * 0.5, nz = a.z + ez * 0.5;
            if (Math.abs(nz) > W - a.r || (nx > -a.r && Math.abs(nz) > OPEN - 0.14)) continue;
            if (reg === 0 && !a.role && nx > -1.35 && nz < 0.02) continue;
            const g = Math.min(gapAlong(ex, ez, false), 0.5), sc = g * CA[q] * (q <= 2 ? 1 : 0.8);
            if (sc > best + 0.05) { best = sc; dx = ex; dz = ez; gap = g; k = q; }
          }
          if (k) a.side = (k === 1 || k === 3) ? 1 : -1;
        }
        a.f = cl(g0 / 0.45);
        const stp = Math.min(a.v0 * dt * cl(gap / 0.45) * (k ? 0.8 : 1), a.dT);
        a.px = a.x + dx * stp; a.pz = a.z + dz * stp;
      }
      // ---- position-based separation + walls
      for (let it = 0; it < 6; it++) {
        F.sort((p, q) => p.px - q.px);
        for (let i = 0; i < F.length; i++) {
          const a = F[i];
          for (let j = i + 1; j < F.length; j++) {
            const b = F[j], dx = b.px - a.px; if (dx > 0.62) break;
            const dz = b.pz - a.pz, rs = a.r + b.r; if (Math.abs(dz) >= rs) continue;
            let d2 = dx * dx + dz * dz; if (d2 >= rs * rs) continue;
            let d = Math.sqrt(d2), nx, nz; if (d < 1e-4) { nx = 0.6; nz = 0.8 * (a.id < b.id ? 1 : -1); d = 0; } else { nx = dx / d; nz = dz / d; }
            const ov = (rs - d) * 0.9, wa = a.w / (a.w + b.w), wb = 1 - wa;
            a.px -= nx * ov * wa; a.pz -= nz * ov * wa; b.px += nx * ov * wb; b.pz += nz * ov * wb;
          }
        }
        for (const a of F) {
          if (a.pz > W - a.r) a.pz = W - a.r; if (a.pz < -W + a.r) a.pz = -W + a.r;
          if (a.px < XS - 1) a.px = XS - 1;
          if (a.px > -a.r) { if (Math.abs(a.pz) > OPEN - 0.14) a.px = -a.r; else if (a.px > -0.08) a.px = -0.08; }
          if (reg === 0 && !a.role && !a.hero && a.px > -1.35 && a.pz < 0.02) {   // keep the walking lane's approach clear
            if (0.02 - a.pz <= a.px + 1.35) a.pz = 0.02; else a.px = -1.35;
          }
        }
      }
      for (const a of F) {
        let dx = a.px - a.x, dz = a.pz - a.z; const m = Math.hypot(dx, dz), mx = a.v0 * dt * 1.4;
        if (m > mx) { dx *= mx / m; dz *= mx / m; }
        a.x += dx; a.z += dz;
        const sp = Math.hypot(dx, dz) / dt;
        a.slow = Math.max(0, a.slow + (sp < 0.4 && a.x > XS + 3 ? dt : -2 * dt));
        if (a.slow > 1.6 && a.tStuck < 0) a.tStuck = tau - 1.6;
      }
      // ---- boarding
      const board = (a, lz) => {
        a.st = 1; a.lane = lz < 0 ? -1 : 1; a.u = a.x; a.zb = a.z; a.tBoard = tau; boarded++;
        a.walking = reg === 0 && a.role === 1; (lz < 0 ? laneL : laneR).push(a);
        waitEma += ((a.tStuck >= 0 ? tau - Math.max(a.tStuck, tOpen) : 0) - waitEma) * 0.12;
      };
      const admit = (lz, ok) => {
        let best = null, bd = 0.62;
        for (const a of F) { if (a.st !== 0 || !ok(a) || a.x < -0.75) continue; const d = Math.hypot(a.x + 0.3, a.z - lz); if (d < bd) { bd = d; best = a; } }
        if (best) board(best, lz);
        return best;
      };
      while (tau >= nextTick) {
        nextTick += HS; if (!open) continue;
        if (reg === 0) admit(LZ, a => a.role === 0 && !a.hero);
        else {
          const heroFirst = hero && hero.st === 0 && !heroHold && Math.hypot(hero.x + 0.3, hero.z + LZ) < 2.4;
          const c = [];
          for (const a of F) { if (a.st !== 0 || a.x < -0.95 || (a.hero && heroHold)) continue; const d = Math.hypot(a.x + 0.3, a.z); if (d < 0.8) c.push([d, a]); }
          c.sort((p, q) => p[0] - q[0]);
          let p0 = c[0] && c[0][1], p1 = c[1] && c[1][1];
          if (heroFirst) { if (Math.hypot(hero.x + 0.3, hero.z + LZ) < 0.7) { board(hero, -LZ); } if (p0 && p0 !== hero) board(p0, LZ); else if (p1 && p1 !== hero) board(p1, LZ); }
          else if (p0 && p1) { if (p0.z > p1.z) { const q = p0; p0 = p1; p1 = q; } board(p0, -LZ); board(p1, LZ); }
          else if (p0) board(p0, p0.z < 0 ? -LZ : LZ);
        }
      }
      if (reg === 0 && open) {     // walkers take the left lane whenever there is room
        const lastL = laneL.length ? laneL[laneL.length - 1] : null;
        if ((!lastL || lastL.u > 0.95) && tau - lastWalkT > (cfg.walkGap || 1.4)) { if (admit(-LZ, a => a.role === 1)) lastWalkT = tau; }
      }
      // ---- belt
      for (const lane of [laneL, laneR]) {
        for (let i = 0; i < lane.length; i++) {
          const a = lane[i]; let v = VB;
          if (a.walking) {
            const h = Math.max(0, a.u) * ST; v = VB + a.vw * (1 - 0.62 * sm((h - 4) / 13));
            if (i > 0) { const ld = lane[i - 1], g = ld.u - a.u; if (g < 1.5) v = Math.min(v, VB + (v - VB) * cl((g - 0.75) / 0.75)); if (!ld.walking && g < 0.8) { a.walking = false; v = VB; } }
          }
          a.u += v * dt;
          if (i > 0 && a.u > lane[i - 1].u - 0.52) a.u = lane[i - 1].u - 0.52;
          a.vz += (v - VB - a.vz) * 0.3;
        }
        while (lane.length && lane[0].u >= Lb) { const a = lane.shift(); a.st = 2; a.d = a.u - Lb; a.tOff = tau; thru++; }
      }
      // ---- landing
      for (const a of live) if (a.st === 2) { a.d += (VB + (a.v0 - VB) * sm(a.d / 1.4)) * dt; if (a.d >= 9) { a.st = 3; a.tGone = tau; } }
      // ---- record
      if (step % REC === 0) {
        let q = 0, nf = 0, qw = 0;
        for (const a of live) {
          if (a.st === 3) continue;
          let X, Y, Z, m;
          if (a.st === 0) { X = a.x; Y = 0; Z = a.z; m = a.tStuck >= 0 ? 1 : 0; nf++; if (a.tStuck >= 0) { q++; if (!a.hero) qw += tau - a.tStuck; } }
          else if (a.st === 1) {
            const lz = a.lane * LZ;
            Z = a.zb + (lz - a.zb) * sm((tau - a.tBoard) / 0.9);
            if (a.u < 0) { X = a.u; Y = 0; } else { X = a.u * CT; Y = a.u * ST; }
            m = a.walking ? 3 : 2;
          } else { X = Lb * CT + a.d; Y = Lb * ST; Z = a.lane * LZ + (a.zt - a.lane * LZ) * sm((a.d - 0.4) / 6.5); m = 4; }
          if (a.rec0 < 0) a.rec0 = recI;
          a.tr.push(X, Y, Z, m);
        }
        if (open && tClear < 0) { if (q === 0 && tau > tOpen + 5) { clearRun += DR; if (clearRun >= 2.5) tClear = tau - 2.5; } else clearRun = 0; }
        S.qwait[recI] = q > 1 ? qw / (q - (hero && hero.st === 0 && hero.tStuck >= 0 ? 1 : 0)) : 0;
        S.q[recI] = q; S.nFloor[recI] = nf; S.nL[recI] = laneL.length; S.nR[recI] = laneR.length; S.thru[recI] = thru; S.board[recI] = boarded; S.wait[recI] = waitEma; S.Lb[recI] = Lb;
        recI++;
        live = live.filter(a => a.st !== 3);
      }
    }
    // ---- post: smooth floor jitter, pack tracks
    for (const a of agents) {
      const n = a.tr.length / 4, tr = new Float32Array(a.tr), o = new Float32Array(a.tr);
      for (let i = 0; i < n; i++) {
        if (tr[i * 4 + 3] > 1.5) continue;
        let sx = 0, sz = 0, c = 0;
        for (let k = -3; k <= 3; k++) { const j = i + k; if (j < 0 || j >= n || tr[j * 4 + 3] > 1.5) continue; const w = 4 - Math.abs(k); sx += tr[j * 4] * w; sz += tr[j * 4 + 2] * w; c += w; }
        o[i * 4] = sx / c; o[i * 4 + 2] = sz / c;
      }
      a.tr = o; a.n = n;
    }
    return { cfg, agents, S, DR, NR: recI, hero, CT, ST, VB, LZ, tClear, tOpen };
  }
  G.buildSim = buildSim; G.SIMK = { TH, CT, ST, VB, LZ, OPEN };
})(typeof window !== 'undefined' ? window : globalThis);
