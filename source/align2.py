#!/usr/bin/env python3
"""Replace the estimated word times with recognizer-measured ones (zipformer transducer token timestamps), and report what the recognizer heard."""
import json, re, difflib, numpy as np, soundfile as sf, sherpa_onnx
d = '../asr/sherpa-onnx-zipformer-en-2023-06-26'
rec = sherpa_onnx.OfflineRecognizer.from_transducer(encoder=d + '/encoder-epoch-99-avg-1.onnx', decoder=d + '/decoder-epoch-99-avg-1.onnx', joiner=d + '/joiner-epoch-99-avg-1.onnx', tokens=d + '/tokens.txt', num_threads=2, decoding_method='greedy_search')
tl = json.load(open('timeline.json'))
NUM = {'11,000': 2, '40%': 2, '28%.': 2}                       # display tokens that are spoken as several words
letters = lambda s: re.sub(r'[^a-z]', '', s.lower())
PAD, LAG = .3, .05                                               # leading pad given to the recognizer; emission lag of the transducer
maxd = 0
for i, l in enumerate(tl['lines']):
    x, sr = sf.read(f'vo/{i:02d}.wav', dtype='float32'); dur = len(x) / sr
    xp = np.concatenate([np.zeros(int(PAD * sr), dtype='float32'), x, np.zeros(int(.5 * sr), dtype='float32')])
    s = rec.create_stream(); s.accept_waveform(sr, xp); rec.decode_stream(s); r = s.result
    # recognizer characters with times (a token's letters are spread from its own time to the next token's)
    ach, at = [], []
    toks = [(t.replace('▁', ''), ts - PAD - LAG) for t, ts in zip(r.tokens, r.timestamps)]
    for k, (tok, ts) in enumerate(toks):
        nxt = toks[k + 1][1] if k + 1 < len(toks) else min(dur, ts + .25); L = letters(tok)
        for j, c in enumerate(L): ach.append(c); at.append(ts + (nxt - ts) * j / max(1, len(L)))
    # script characters and the index where each spoken word starts
    sp = l['spoken'].split(); sch, wstart = [], []
    for w in sp: wstart.append(len(sch)); sch.extend(letters(w))
    sm = difflib.SequenceMatcher(None, ''.join(sch), ''.join(ach), autojunk=False)
    m = {}
    for a, b, n in sm.get_matching_blocks():
        for j in range(n): m[a + j] = b + j
    def tchar(ci):                                               # time of script char ci: nearest matched char, shifted by the average letter duration
        if ci in m: return at[m[ci]]
        ks = sorted(m); per = dur / max(1, len(sch))
        prev = [k for k in ks if k < ci]; nx = [k for k in ks if k > ci]
        if prev and nx: a, b = prev[-1], nx[0]; return at[m[a]] + (at[m[b]] - at[m[a]]) * (ci - a) / (b - a)
        if prev: return min(dur, at[m[prev[-1]]] + per * (ci - prev[-1]))
        if nx: return max(0, at[m[nx[0]]] - per * (nx[0] - ci))
        return dur * ci / max(1, len(sch))
    st = [max(0.0, tchar(c)) for c in wstart]
    # a word the recogniser emits inside an acoustic pause really starts where the sound returns (minus a soft onset)
    hop = int(sr * .005); n = len(x) // hop; rms = np.array([np.sqrt(np.mean(x[q * hop:(q + 1) * hop] ** 2)) for q in range(n)]); quiet = rms < .025 * rms.max(); q = 0
    while q < n:
        if quiet[q]:
            j2 = q
            while j2 < n and quiet[j2]: j2 += 1
            a_, b_ = q * .005, j2 * .005
            if b_ - a_ >= .14 and q > 6 and j2 < n - 6:
                for k in range(1, len(st)):
                    if a_ + .02 < st[k] < b_ - .12: st[k] = b_ - .12
            q = j2
        else: q += 1
    # the recogniser bursts out the first tokens of an utterance; trust the proportional estimate there
    est = []; jj = 0
    for w in l['words']: est.extend([w.get('t_est', w['t']) - l['s']] * NUM.get(w['txt'], 1))
    for k in range(1, len(st)):
        if st[k] < .4: st[k] = max(st[k], est[k] - .03)
    for k in range(1, len(st)): st[k] = max(st[k], st[k - 1] + .04)   # keep monotonic
    # display words -> spoken words
    j = 0; old = l['words']
    for w in old:
        t_new = l['s'] + st[j]; base = w.get('t_est', w['t']); maxd = max(maxd, abs(t_new - base)); w['t_est'] = base; w['t'] = round(t_new, 3); j += NUM.get(w['txt'], 1)
    assert j == len(sp), (i, j, len(sp), l['spoken'])
    for k, w in enumerate(old): w['te'] = round(old[k + 1]['t'] if k + 1 < len(old) else l['e'], 3)
    l['heard'] = r.text.strip().lower()
    print(i, 'heard:', l['heard'])
    print('    ', ' '.join(f"{w['txt']}@{w['t'] - l['s']:.2f}({w['t'] - w['t_est']:+.2f})" for w in old))
print('largest shift vs the pause-anchored estimate: %.2f s' % maxd)
json.dump(tl, open('timeline.json', 'w'), indent=1, ensure_ascii=False)
open('timeline.js', 'w', encoding='utf-8').write('window.DUR=' + json.dumps(tl['duration']) + ';\nwindow.TL=' + json.dumps(tl['lines'], ensure_ascii=False) + ';\n')
