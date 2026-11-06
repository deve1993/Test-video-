// usage: node render_full.js <dir> <fps> <fromFrame> <toFrame>   |  node render_full.js <dir> preview t1,t2,...
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const dir = process.argv[2];
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(dir, process.env.PAGE||'full.html'));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(400);
  if (process.argv[3] === 'preview') {
    for (const t of process.argv[4].split(',').map(Number)) {
      await p.evaluate(t => window.render(t), t);
      await p.screenshot({ path: path.resolve(dir, `pv/${t}.png`), omitBackground: true });
    }
  } else {
    const fps = +process.argv[3], a = +process.argv[4], z = +process.argv[5];
    for (let i = a; i < z; i++) {
      await p.evaluate(t => window.render(t), i / fps);
      await p.screenshot({ path: path.resolve(dir, `ov/${String(i).padStart(5, '0')}.png`), omitBackground: true });
    }
  }
  await b.close();
})();
