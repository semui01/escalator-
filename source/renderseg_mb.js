// Render frames [a, b) of the film with temporal supersampling (true motion blur) and pipe them to ffmpeg.
// usage: node renderseg_mb.js <film/index.html> <a> <b> <out.mp4> [fps=30]   env: VERT=1 (9:16), MB=<subframes, default 5>, SHUTTER=<0..1, default .5>, QS=<query string extras, e.g. nocap>
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const [html, a, b, out, fps = 30] = [process.argv[2], +process.argv[3], +process.argv[4], process.argv[5], +(process.argv[6] || 30)];
const V = !!process.env.VERT, N = +(process.env.MB || 5), SH = +(process.env.SHUTTER || 0.5), QS = process.env.QS || '';
(async () => {
  const br = await chromium.launch();
  const p = await br.newPage({ viewport: V ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 } });
  p.on('pageerror', e => { console.error('PAGE ERROR', e.message); process.exitCode = 1; });
  const q = [V ? 'v' : '', QS].filter(Boolean).join('&');
  await p.goto('file://' + path.resolve(html) + (q ? '?' + q : ''));
  await p.evaluate(() => window.ready);
  await p.evaluate(() => { const c = document.getElementById('c'), acc = document.createElement('canvas'); acc.width = c.width; acc.height = c.height; window.__acc = acc; window.__g = acc.getContext('2d'); });
  const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = a; f < b; f++) {
    const d = await p.evaluate(([t, N, w]) => {
      const c = document.getElementById('c'), g = window.__g;
      if (N <= 1) { render(t); return c.toDataURL('image/jpeg', 0.95); }
      for (let k = 0; k < N; k++) { render(Math.max(0, t + ((k + .5) / N - .5) * w)); g.globalAlpha = 1 / (k + 1); g.drawImage(c, 0, 0); }
      return window.__acc.toDataURL('image/jpeg', 0.95);
    }, [f / fps, N, SH / fps]);
    const buf = Buffer.from(d.slice(d.indexOf(',') + 1), 'base64');
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 150 === 0) console.log(out, f);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await br.close();
})();
