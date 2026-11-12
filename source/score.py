#!/usr/bin/env python3
"""Score + sound design for "Stand still. Move faster." — every cue comes from the film's own event list."""
import json, os, sys, numpy as np
SK = os.environ.get('MOTION_SKILL_DIR', '.')      # folder that holds scripts/soundkit.py (not part of this repo)
sys.path.insert(0, SK + '/scripts')
from soundkit import *

EV = json.load(open('stills/ev/events.json'))
DUR = 76.0
sk = Kit(DUR, seed=7)
rng = sk.rng
e = lambda k, i=0: EV[k][i]
BPM = 104; BAR = 240 / BPM; BEAT = BAR / 4
Dm = [50, 53, 57, 62]; Bb = [46, 53, 58, 62]; F = [53, 57, 60, 65]; C = [48, 52, 55, 60]; Gm = [43, 50, 55, 58]; Eb = [51, 55, 58, 63]
GO, MAP, SHORT, MATH, CROWD = e('go'), e('cut', 0), e('cut', 1), e('cut', 2), e('cut', 3)
TALL, B24, WASTE, FLIP, END = e('grow0') - .45, e('boom24'), e('topdown') - .1, e('flip'), e('end')

# ------------------------------------------------------------ custom sounds
def riser(t0, t1, g=.35, f0=110, f1=440):
    d = t1 - t0; t = tt(d); n = len(t)
    s = sweep_lp(sk.noise(d)[:n], 300, 7000) * np.linspace(0, 1, n) ** 2
    f = f0 * (f1 / f0) ** (t / d); saw = lp(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)), 1600) * np.linspace(0, 1, n) ** 1.5 * .25
    sk.put('sfx', t0, (s + saw) * env(n, .05, .04), 0, g)
def stampfx(t, g=.6):
    sk.boom(t, g, 1.2); sk.click(t, .5 * g / .6, 900, .08)
def pop(t, f, g=.16, pan=0.0):
    d = .09; x = tt(d); sk.put('sfx', t, np.sin(2 * np.pi * np.cumsum(f * (1 + .8 * np.exp(-x * 60))) / SR) * np.exp(-x * 38), pan, g)
def flap(t0, t1, n=10, g=.13):
    for k in range(n): sk.click(t0 + (t1 - t0) * k / n + rng.random() * .01, g, rng.uniform(1800, 3200), pan=.3)
def tone_rise(t0, t1, f0=220, f1=660, g=.05):
    d = t1 - t0; t = tt(d); f = f0 * (f1 / f0) ** (t / d)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) + .3 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    sk.put('sfx', t0, s * env(len(t), .15, .08), .2, g)
def pulse_bars(chords, t0, t1, sub=4, g=.26, kick=(0,), hat=True, cut0=800, cut_rate=90, pad_g=.55, bright=2000):
    """Tension groove: one chord per bar, bass on every 1/sub of a beat."""
    t, i = t0, 0
    while t < t1:
        ch = chords[i % len(chords)]; d = min(BAR, t1 - t) + 1.0; r = ch[0] - 12
        if d >= 1.6: sk.pad(ch, t, d, pad_g, bright=bright + 60 * (t - t0))
        for b in range(4 * sub):
            tb = t + b * BEAT / sub
            if tb >= t1: break
            sk.pluck(r, tb, .25 if sub > 2 else .34, g, cut=cut0 + cut_rate * (tb - t0))
            if (b / sub) in kick: sk.kick(tb, .5)
            if hat and b % 2 == 1: sk.hat(tb, .05, pan=.3)
        t += BAR; i += 1

# ------------------------------------------------------------ A · the race (0 – 13.3)
sk.pad([38, 50, 57], 0, 1.7, g=.4, bright=900, att=.4, rel=.8)
sk.bed(0, 13.4, cut=600, g=.07)
sk.blip(GO - .02, .2, 880, .14, 0); sk.blip(GO + .11, .24, 1320, .2, 0)
sk.progression([Dm, Bb, F, C], GO, MAP - .1, bpm=BPM, pulse=True, kick_from=GO, hats_from=GO + BAR, bright=1500, pad_g=.45)
t = GO
while t < e('clearA'): sk.click(t, .05 if t < e('clearB') else .035, 3100, pan=.45); t += BEAT / 2      # the race clock
sk.click(e('clearB'), .35, 1400, .05); sk.bell(86, e('clearB'), .13, -.2, buf='sfx'); sk.bell(93, e('clearB') + .09, .11, .3, buf='sfx'); sk.boom(e('clearB') + .26, .3, 1.0)
sk.whoosh(e('focus') + .45, .9, .35); sk.blip(e('lane'), .12, 1320); sk.blip(e('feels'), .12, 1760); sk.blip(e('feels') + .09, .1, 2093)
sk.whoosh(e('unfocus') + .45, .9, .3, up=False)
sk.click(e('clearA'), .3, 900, .06); sk.bell(74, e('clearA'), .08, buf='sfx')
sk.boom(e('verdict'), .55, 1.4); sk.blip(e('verdict'), .14, 220, .3, 0)
sk.rumble(e('wave') - .5, MAP + .05, g=.45)
for tc in EV['cut']: sk.whoosh(tc, .9, .5)

# ------------------------------------------------------------ B · Holborn, 08:30 (13.3 – 19.4)
sk.progression([F, Dm, Bb], MAP, SHORT - .1, bpm=BPM, pulse=True, kick_from=None, hats_from=None, bright=1300, pad_g=.45)
for k in range(8): sk.bell(int(rng.choice([77, 81, 84, 86, 89])), MAP + .5 + k * .66 + rng.random() * .15, .05, pan=float(rng.uniform(-.8, .8)))
sk.blip(e('marker'), .16, 990, .3, 0); sk.sparkle(e('marker'), .8, 50, .02)
sk.ticks(e('count0'), e('count1'), g=.1)
t = e('dial0')
while t < e('dial1'): sk.click(t, .07, 2200, pan=-.4); t += .15
sk.blip(e('rate'), .2, 660, .25, 0); sk.blip(e('rate') + .07, .16, 990, .25, .2)

# ------------------------------------------------------------ C · the rule works (19.4 – 26.1)
sk.progression([F, C, Dm, Bb], SHORT, TALL, bpm=BPM, pulse=True, kick_from=SHORT, hats_from=SHORT, bright=1900, pad_g=.45)
mel = [81, 84, 86, 84, 81, 77, 79, 81, 84, 88, 86, 84, 81, 79, 77, 76]
for k, m in enumerate(mel):
    tb = SHORT + BEAT + k * BEAT
    if tb < TALL - .2 and k % 2 == 0 or k % 4 == 3: sk.bell(m, tb, .05, pan=np.sin(k * .9) * .5, d=1.6)
sk.hum(SHORT, TALL - SHORT + 10.5, f=55, g=.05)
sk.click(e('sign'), .3, 1800); sk.blip(e('sign') + .03, .12, 1320); sk.bell(88, e('ok'), .1, .2, buf='sfx'); sk.bell(93, e('ok') + .1, .1, -.2, buf='sfx')
for tl in EV['label']: sk.blip(tl, .12, 1760)

# ------------------------------------------------------------ D · 24 metres (26.1 – 36.7)
sk.pad(Dm, TALL, B24 - TALL + .6, g=.5, bright=1500, att=1.4, rel=.6)
riser(e('grow0'), B24, g=.38)
sk.rumble(e('grow0'), B24, g=.5)
sk.boom(B24, .72, 2.6)
for m in [62, 69, 74]: sk.bell(m, B24, .1, pan=float(rng.uniform(-.5, .5)), d=3, buf='sfx')
sk.progression([Dm, Gm, Bb, Gm], B24, WASTE, bpm=BPM, pulse=True, kick_from=None, hats_from=None, bright=1150, pad_g=.5)
sk.pad([26, 38], B24, WASTE - B24 + .6, g=.45, bright=300, att=1, rel=1.5)
t = B24
while t < WASTE: sk.kick(t, .4); t += BAR
sk.click(e('panel'), .25, 1500)
for i in range(4): sk.blip(e('forty') - .1 + i * .06, .12, 880 * 1.122 ** i, .1, -.3 + .2 * i)
sk.boom(e('forty') + .08, .35, 1.0)

# ------------------------------------------------------------ E · the bottleneck (36.7 – 48.2)
pulse_bars([Dm, Eb], WASTE, MATH - .05, sub=4, g=.25, kick=(0, 1, 2, 3))
sk.whoosh(e('topdown') + .5, 1.0, .5, up=False)
sk.crackle(e('hatch'), .9, 60, .12)
stampfx(e('wasted') + .27, .5); stampfx(e('halved') + .27, .45)      # the thud lands when the stamp does, just after the word
sk.whoosh((e('swoop0') + e('swoop1')) / 2, 1.7, .65, up=False)
sk.rumble(e('swoop0') + .3, e('bottleneck'), g=.7)
sk.boom(e('bottleneck'), .72, 2.6)
sk.beeps(e('bottleneck') + .3, MATH - .1, f=740, every=BEAT, g=.045)
sk.blip(e('hero'), .14, 1175); sk.blip(e('hero') + .1, .14, 1568)
sk.bed(e('swoop1') - .6, MATH - e('swoop1') + .6, cut=700, g=.2)

# ------------------------------------------------------------ F · the math (48.2 – 59.5)
sk.pad([62, 69, 72, 76], MATH, 5.6, g=.42, bright=3200, att=1.0, rel=1.6); sk.pad([38, 45], MATH, 5.6, g=.35, bright=400, att=.8, rel=1.6)
arp = [74, 77, 81, 84, 88, 84, 81, 77]
k = 0; t = MATH + .4
while t < e('n31a') - .9: sk.bell(arp[k % 8], t, .06 + .002 * k, pan=np.sin(k * .7) * .6, d=2); t += BEAT / 2; k += 1
flap(e('pack') - .2, e('pack') + .25, 9)
for i in range(9): pop(e('pack') + .08 + i * .105, 520 * 2 ** (i / 6), .17, -.5 + i * .1)
sk.whoosh(e('mflip') + .15, .5, .5); sk.click(e('mflip'), .5, 1200, .06); sk.bell(81, e('mflip') + .05, .1, buf='sfx'); sk.boom(e('mflip'), .4, 1.2)
P1 = e('n31a') - .87
sk.progression([Bb, F, C, Dm], P1, CROWD - .1, bpm=BPM, pulse=True, kick_from=P1, hats_from=P1 + BAR, bright=1900, pad_g=.45)
for i in range(31): sk.blip(e('n31a') + .1 + i * (e('n31b') - e('n31a') - .1) / 31, .07, 1200 * 2 ** (i / 31), .05, float(np.sin(i) * .5))
tone_rise(e('cap0'), e('cap1'), g=.05)
sk.boom(e('p28'), .7, 2.0)
for m in [74, 81, 86]: sk.bell(m, e('p28'), .11, pan=float(rng.uniform(-.5, .5)), d=3, buf='sfx')

# ------------------------------------------------------------ G · every single morning (59.5 – 66.4)
sk.pad([26, 38], CROWD, FLIP - CROWD + .3, g=.5, bright=280, att=.4, rel=.5)
pulse_bars([Dm, Eb], CROWD, FLIP - .05, sub=2, g=.24, kick=(0, 2), hat=False, cut0=650, cut_rate=70, pad_g=.5, bright=900)
sk.bed(CROWD, FLIP - CROWD, cut=700, g=.2)
sk.hum(CROWD, END - CROWD, f=55, g=.045)
for i in range(5): sk.click(e('days') + i * .17, .26, 1500 + 150 * i, .04, pan=-.4 + .2 * i)
riser(FLIP - 1.9, FLIP, g=.42, f0=147, f1=587)
sk.click(e('signup'), .3, 1800)

# ------------------------------------------------------------ H · the fix (66.4 – 73.2)
flap(FLIP - .24, FLIP + .24, 10, .15)
sk.whoosh(FLIP, .7, .65); sk.boom(FLIP, .8, 2.6)
for m in [74, 81, 86, 93]: sk.bell(m, FLIP, .11, pan=float(rng.uniform(-.6, .6)), d=3, buf='sfx')
sk.progression([Bb, F, C, Dm], FLIP, END - .05, bpm=BPM, pulse=True, kick_from=FLIP, hats_from=FLIP, bright=2600, pad_g=.55)
up = [74, 77, 81, 84, 86, 89, 93, 96]
k = 0; t = FLIP + BEAT
while t < END - .3: sk.bell(up[k % 8] if (k // 8) % 2 == 0 else up[7 - k % 8], t, .055 + .0025 * k, pan=np.sin(k * .8) * .6, d=1.8); t += BEAT / 2; k += 1
sk.blip(e('heroBoard'), .14, 1568); sk.blip(e('heroBoard') + .08, .14, 2093)
for i in range(12): pop(e('pairs') + i * .1, 900 + 50 * i, .06, float(np.sin(i) * .4))
sk.whoosh(e('pull') + 1.4, 2.8, .32)
sk.bell(98, e('clear'), .12, .2, buf='sfx'); sk.bell(93, e('clear') + .06, .1, -.2, buf='sfx'); sk.sparkle(e('clear'), 1.2, 90, .025); sk.boom(e('clear') + .26, .45, 1.2); sk.click(e('clear') + .26, .4, 1000, .07)
sk.blip(e('wayout'), .1, 1760)

# ------------------------------------------------------------ I · end card
sk.whoosh(END - .1, .7, .4); sk.boom(END, 1.0, 3.0)
sk.pad([38, 45, 50, 54, 57, 62], END, DUR - END + .2, g=.7, bright=2400, att=.05, rel=1.7); sk.pad([26, 38], END, DUR - END + .2, g=.6, bright=260, att=.05, rel=1.7)
for i, m in enumerate([74, 78, 81, 86]): sk.bell(m, END + i * .16, .1, pan=float(rng.uniform(-.6, .6)), d=3)

def mix(sk, vo_path, out, reverb=(.35, .22), fade_out=1.2):
    """Kit.mix with the effects stem gently ducked under the voice as well as the music."""
    import soundfile as sf
    from scipy.signal import fftconvolve
    N = sk.N; r = np.random.default_rng(11)
    ir_t = tt(2.6); ir = np.stack([r.standard_normal(len(ir_t)) * np.exp(-ir_t * 2.4) for _ in range(2)], 1); ir[:int(.01 * SR)] = 0; ir /= np.sqrt((ir ** 2).sum(0))
    rv = lambda x, w: x + np.stack([fftconvolve(x[:, c], ir[:, c])[:N] for c in range(2)], 1) * w
    mus = rv(sk.mus, reverb[0]); sfx = rv(sk.sfx, reverb[1])
    mus /= np.max(np.abs(mus)) + 1e-9; sfx /= np.max(np.abs(sfx)) + 1e-9
    if vo_path:
        vo, vsr = sf.read(vo_path)
        if vo.ndim > 1: vo = vo.mean(1)
        vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0); vo = hp(vo, 70); vo = vo / (np.max(np.abs(vo)) + 1e-9) * .8
        venv = lp(np.abs(vo), 8); act = np.clip(venv / (venv.max() * .35), 0, 1)
        lo = np.stack([lp(mus[:, c], 900) for c in range(2)], 1); hi = mus - lo          # duck the consonant band of the music harder than its body
        m = np.stack([vo, vo], 1) + (lo * (1 - .55 * act)[:, None] + hi * (1 - .82 * act)[:, None]) * .29 + sfx * .5 * (1 - .4 * act)[:, None]
    else:
        m = mus * .62 + sfx * .6
    f = np.ones(N); nf = int(fade_out * SR); f[-nf:] = np.linspace(1, 0, nf) ** 1.5; f[:int(.05 * SR)] = np.linspace(0, 1, int(.05 * SR))
    m *= f[:, None]; m = np.tanh(m * 1.1) / np.tanh(1.1); m *= .93 / np.max(np.abs(m))
    sf.write(out, m.astype(np.float32), SR, subtype='FLOAT'); print('wrote', out)

if __name__ == '__main__':
    # level report (cannot be auditioned here): per-section RMS of the music and effects stems
    def rms(x): return float(np.sqrt(np.mean(x ** 2)) + 1e-12)
    secs = [('race', 0, MAP), ('holborn', MAP, SHORT), ('rule', SHORT, TALL), ('climb', TALL, WASTE), ('bottleneck', WASTE, MATH), ('math', MATH, CROWD), ('morning', CROWD, FLIP), ('fix', FLIP, END), ('end', END, DUR)]
    pm, ps = np.max(np.abs(sk.mus)), np.max(np.abs(sk.sfx))
    for n, a, b in secs: print(f'{n:11s} music {20 * np.log10(rms(sk.mus[int(a * SR):int(b * SR)]) / pm):6.1f} dB   sfx {20 * np.log10(rms(sk.sfx[int(a * SR):int(b * SR)]) / ps):6.1f} dB (rel. to stem peak)')
    mix(sk, 'vo_full.wav', 'mix.wav'); mix(sk, None, 'mix_novo.wav')
