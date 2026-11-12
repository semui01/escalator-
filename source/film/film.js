// FILM assembly: scenes, chapters, hits, flashes, and the event list the score is built from.
const EV = {}; function ev(k, t) { (EV[k] = EV[k] || []).push(+t.toFixed(3)); return t; }
window.FILM = {
  title: 'STAND STILL. MOVE FASTER.',
  tag: t => t < T.map ? 'ILLUSTRATIVE SIMULATION · TIME-LAPSE ×8' : t < T.short ? 'LONDON · 08:30' : t >= T.math && t < T.crowd ? 'THE NUMBERS' : ['HOLBORN STATION · ILLUSTRATIVE SIMULATION', O(1 - P(t, wt(13, 'getting') - .6, wt(13, 'getting') - .2), 1)],
  hotLines: [1, 8, 9, 12],
  scenes: [], xfades: [], chapters: [], hits: [], flashes: [], events: EV,
  init() {
    initWorld(); mapInit(); SIM = buildSim(SC.main); SA = buildSim(SC.twinA); SB = buildSim(SC.twinB); twinInit(); worldInit();
    const F_ = window.FILM;
    F_.scenes = [{ start: 0, draw: sceneTwin }, { start: T.map, draw: sceneMap }, { start: T.short, draw: sceneWorld }, { start: T.math, draw: sceneMath }, { start: T.crowd, draw: sceneWorld }];
    F_.xfades = [[T.map, .5], [T.short, .6], [T.math, .45], [T.crowd, .5]];
    F_.chapters = [[0, '01', 'THE PARADOX'], [T.map, '02', 'HOLBORN, 08:30'], [T.short, '03', 'THE RULE'], [T.tall, '04', 'THE CLIMB'], [T.waste, '05', 'THE BOTTLENECK'], [T.math, '06', 'THE MATH'], [T.crowd, '07', 'THE FIX']];
    F_.chapEnd = T.end + .3;
    const t24 = wt(5, '24'), tws = wt(8, 'wasted'), thv = wt(9, 'half') + .05, tbn = wt(9, 'bottleneck') - .05, tfl = wt(10, 'flips'), t28 = wt(11, '28');
    F_.hits = [[T.tcB, 7, .35], [wt(1, 'secretly') + .1, 10, .4], [t24, 16, .6], [tws, 12, .45], [thv, 10, .4], [tbn, 14, .6], [tfl, 10, .4], [t28, 10, .45], [T.flip, 14, .5], [T.clear, 9, .45], [T.end, 8, .5]];
    F_.flashes = [[T.map, .3], [T.short, .3], [T.math, .28], [T.crowd, .28], [tfl, .22], [T.flip, .4], [T.end, .35]];
    // ---- sound events
    ev('go', T.go); ev('clearB', T.tcB); ev('clearA', T.tcA); ev('verdict', wt(1, 'secretly') + .1); ev('wave', wt(1, 'massive'));
    ev('focus', LS(1) - .1); ev('unfocus', wt(1, 'but') - .25); ev('lane', wt(1, 'walking') - .15); ev('feels', wt(1, 'feels') - .05);
    ev('cut', T.map); ev('cut', T.short); ev('cut', T.math); ev('cut', T.crowd);
    ev('marker', wt(2, 'holborn') - .1); ev('count0', wt(2, '11') - .1); ev('count1', wt(2, 'morning') + .25); ev('dial0', wt(2, 'need') - .2); ev('dial1', wt(2, 'hour') + .15); ev('rate', wt(2, 'single') - .05);
    ev('sign', wt(3, 'the') - .1); ev('ok', wt(3, 'perfectly') - .05); ev('label', wt(4, 'steady') - .1); ev('label', wt(4, 'happily') - .1);
    ev('grow0', SC.F.grow0); ev('grow1', SC.F.grow1); ev('boom24', t24); ev('label', wt(6, 'human') - .2);
    ev('panel', wt(7, 'only') - .15); ev('forty', wt(7, '40')); ev('topdown', T.tw0); ev('hatch', wt(8, 'that') - .25); ev('wasted', tws); ev('halved', thv);
    ev('swoop0', T.tb0); ev('swoop1', T.tb1); ev('bottleneck', tbn); ev('hero', wt(9, 'stagnant') - .1);
    ev('pack', wt(10, 'pack')); ev('mflip', tfl); ev('n31a', wt(11, 'over') - .1); ev('n31b', wt(11, 'people') + .1); ev('cap0', wt(11, 'boosting')); ev('cap1', t28 - .05); ev('p28', t28);
    ev('days', wt(12, 'every') - .1); ev('signup', T.fix + .05); ev('flip', T.flip); ev('heroBoard', MAIN.heroBoard); ev('pairs', wt(13, 'side') - .1); ev('pull', T.tf1); ev('clear', T.clear); ev('wayout', wt(13, 'getting') - .1); ev('end', T.end);
    window.TIMES = T;
  },
};
