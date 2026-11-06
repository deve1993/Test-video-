// usage: node render_overlay.js <gen_dir> <fps> <seconds> [onlyTimes,comma]
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [dir, fps, secs, only] = [process.argv[2], +process.argv[3], +process.argv[4], process.argv[5]];
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(dir, 'overlay.html'));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  const times = only ? only.split(',').map(Number) : [...Array(Math.round(fps * secs)).keys()].map(i => i / fps);
  for (let i = 0; i < times.length; i++) {
    await p.evaluate(t => window.render(t), times[i]);
    const name = only ? `prev_${times[i]}.png` : `ov/${String(i).padStart(4, '0')}.png`;
    await p.screenshot({ path: path.resolve(dir, name), omitBackground: true });
  }
  await b.close();
})();
