#!/usr/bin/env python3
"""Refine per-word caption times: anchor word boundaries to pauses detected in each clip, spread the rest by phoneme weight."""
import json, os, re, warnings, numpy as np, soundfile as sf
warnings.filterwarnings('ignore')
from kokoro_onnx import Kokoro
m = os.path.expanduser('~/.cache/kokoro')
tk = Kokoro(os.path.join(m, 'kokoro-v1.0.onnx'), os.path.join(m, 'voices-v1.0.bin')).tokenizer
tl = json.load(open('timeline.json'))
VOW = set('aeiouɑɒæɐəɚɛɜɪʊʌɔᵻᵊyø')
def weight(word):
    ph = tk.phonemize(word, 'en-us')
    w = 0.35
    for c in ph:
        if c in VOW: w += 1.5
        elif c == 'ː': w += 0.7
        elif c in 'ˈˌ ': w += 0.15 if c == 'ˈ' else 0
        else: w += 1.0
    return w
NUM = {'11,000': 'eleven thousand', '24': 'twenty-four', '40%': 'forty percent', '30': 'thirty', '28%.': 'twenty-eight percent', 'Holborn': 'Hoban', "Holborn's": "Hoban's"}
out = []
for i, l in enumerate(tl['lines']):
    s, sr = sf.read(f'vo/{i:02d}.wav')
    hop = int(sr * 0.005); n = len(s) // hop
    rms = np.array([np.sqrt(np.mean(s[k * hop:(k + 1) * hop] ** 2)) for k in range(n)])
    quiet = rms < 0.025 * rms.max()
    gaps = []; k = 0
    while k < n:
        if quiet[k]:
            j = k
            while j < n and quiet[j]: j += 1
            if (j - k) * 0.005 >= 0.14 and k > 6 and j < n - 6: gaps.append((k * 0.005, j * 0.005))
            k = j
        else: k += 1
    disp = l['display'].split()
    words = [{'txt': w.replace('*', ''), 'hl': w.startswith('*')} for w in disp]
    for w in words: w['w'] = weight(NUM.get(w['txt'], w['txt']))
    dur = len(s) / sr; lead = 0.03   # narrate.py keeps 30 ms before first sound
    voiced = dur - lead - 0.08 - sum(b - a for a, b in gaps)
    tot = sum(w['w'] for w in words)
    cum = np.cumsum([0] + [w['w'] for w in words]) / tot          # fraction of speech before word k
    # assign each gap to a word boundary (monotone), preferring boundaries after punctuation
    bounds = []; used = 0; prev_gap = 0.0
    for a, b in gaps:
        vf = (a - lead - prev_gap) / voiced
        best, bk = 1e9, None
        for kk in range(max(1, used + 1), len(words)):
            pen = abs(cum[kk] - vf) - (0.06 if re.search(r'[,;:.?!]$', words[kk - 1]['txt']) else 0)
            if pen < best: best, bk = pen, kk
        if bk is None or abs(cum[bk] - vf) > 0.12: prev_gap += b - a; continue   # probably a stop closure inside a word: ignore as anchor
        bounds.append((bk, a, b)); used = bk; prev_gap += b - a
    # piecewise: segments between anchors
    segs = []; k0 = 0; t0 = lead
    for bk, a, b in bounds: segs.append((k0, bk, t0, a)); k0 = bk; t0 = b
    segs.append((k0, len(words), t0, dur - 0.08))
    for k0, k1, ta, tb in segs:
        sw = sum(w['w'] for w in words[k0:k1]); c = 0
        for w in words[k0:k1]:
            w['t'] = round(l['s'] + ta + (tb - ta) * c / sw, 3); c += w['w']
            w['te'] = round(l['s'] + ta + (tb - ta) * c / sw, 3)
    l['words'] = [{'txt': w['txt'], 'hl': w['hl'], 't': w['t'], 'te': w['te']} for w in words]
    out.append(l)
    print(i, f"{l['s']:.2f}-{l['e']:.2f}", 'anchors:', [(words[bk - 1]['txt'], round(a, 2), round(b, 2)) for bk, a, b in bounds], 'gaps', len(gaps))
tl['lines'] = out
json.dump(tl, open('timeline.json', 'w'), indent=1, ensure_ascii=False)
open('timeline.js', 'w', encoding='utf-8').write('window.DUR=' + json.dumps(tl['duration']) + ';\nwindow.TL=' + json.dumps(out, ensure_ascii=False) + ';\n')
