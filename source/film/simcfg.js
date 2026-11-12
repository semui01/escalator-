// Simulation scenarios, keyed to narration times. Shared by the film (browser) and the tuning harness (node).
(function (G) {
  const TL = G.TL;
  const wtime = (li, str, nth = 0) => { const ws = TL[li].words.filter(w => w.txt.toLowerCase().replace(/[^a-z0-9%]/g, '').startsWith(str)); return (ws[nth] || ws[0] || { t: TL[li].s }).t; };
  const LBf = i => i === 0 ? 0 : TL[i].s - 0.25;
  const K = 8, T0 = 8.0, tau = t => K * (t - T0);
  const io = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const P = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));
  const ramp = (x, pts) => { if (x <= pts[0][0]) return pts[0][1]; for (let i = 0; i < pts.length - 1; i++) if (x <= pts[i + 1][0]) return pts[i][1] + (pts[i + 1][1] - pts[i][1]) * P(x, pts[i][0], pts[i + 1][0]); return pts[pts.length - 1][1]; };
  const F = {                                   // film-time anchors
    grow0: TL[5].s + 0.2, grow1: wtime(5, '24') + 0.3,
    forty: wtime(7, '40'), waste: LBf(8), rush0: LBf(8) - 1.6, rush1: LBf(8) + 1.4,
    mid0: LBf(10) - 0.4, ease0: LBf(12) - 1.0, ease1: LBf(12) + 0.6, wave0: wtime(1, 'but') - 0.4, wave1: wtime(1, 'massive') + 0.8, flip: wtime(13, 'simply') + 0.25, heroIn: LBf(8) + 2.5,
  };
  const LB_S = 9.2, LB_T = 48;
  const main = {
    seed: 11, T: tau(G.DUR) + 4, hallL: 26, hallW: 5.0, walkGap: 0.85,
    Lb: s => LB_S + (LB_T - LB_S) * io(P(s, tau(F.grow0), tau(F.grow1))),
    lam: s => ramp(s, [[0, 1.6], [tau(F.grow1), 1.6], [tau(F.grow1) + 16, 1.3], [tau(F.rush0), 1.3], [tau(F.rush1), 1.95], [tau(F.mid0), 1.95], [tau(F.mid0) + 12, 1.55], [tau(F.ease0), 1.55], [tau(F.ease1), 1.33], [tau(F.flip), 1.33], [tau(F.flip) + 2, 0.3]]),
    hs: s => s >= tau(F.flip) ? 0.72 : 0.8,
    pWalk: s => ramp(s, [[0, 0.55], [tau(F.grow0), 0.55], [tau(F.grow1) + 4, 0.25], [tau(F.grow1) + 22, 0.08]]),
    regime: s => s >= tau(F.flip) ? 1 : 0,
    hero: { tSpawn: tau(F.heroIn), z0: -3.6, spot: [-0.62, -1.1], tGo: tau(F.flip) },
  };
  const KH = 8, PRE = 22, GO = 0.75, tauH = t => KH * t + PRE;   // twin race: gates open at film time GO
  const twin = reg => ({ walkGap: 1.4, seed: 23, T: tauH(LBf(2) + 1.5), hallL: 15, hallW: 3.3, Lb: s => 34.64, pWalk: s => 0.29, regime: s => reg,
    init: { n: 110, x0: -10, x1: -0.6 }, open: s => s >= tauH(GO),
    lam: s => s < tauH(GO) ? 0 : (s > tauH(F.wave0) && s < tauH(F.wave1) ? 5 : 0.3) });
  G.SIMCFG = { K, T0, tau, F, main, twinA: twin(0), twinB: twin(1), KH, PRE, GO, tauH, LB_S, LB_T, wtime, LBf };
})(typeof window !== 'undefined' ? window : globalThis);
