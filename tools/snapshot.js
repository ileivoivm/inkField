#!/usr/bin/env node
/**
 * snapshot.js — headless InkField thumbnail generator
 *
 * 給定一份 recording JSON，啟動 headless Chromium 載入 inkField，
 * 注入 recording、等播放結束（聽 `inkfield:playbackEnded` event）、
 * 截 canvas 存成 PNG。
 *
 * 用法：
 *   node tools/snapshot.js <recording.json> <output.png> [options]
 *
 * options:
 *   --port <n>     dev server 已監聽的 port（預設 3000）
 *   --base <url>   inkField base URL（預設 http://localhost:<port>/）
 *   --max-size 512 輸出最長邊（預設不縮放，留給 sips -Z 處理）
 *   --timeout 120  整體 timeout 秒數（預設 120）
 *   --headful      開啟視窗 debug
 *
 * 預設假設 dev server 已經跑在 :3000。要自動起 server 的話用 wrapper script。
 *
 * 依賴：puppeteer (`cd tools && npm install`)
 */

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--headful') args.headful = true;
    else if (a === '--port') args.port = argv[++i];
    else if (a === '--base') args.base = argv[++i];
    else if (a === '--max-size') args.maxSize = parseInt(argv[++i], 10);
    else if (a === '--timeout') args.timeout = parseInt(argv[++i], 10);
    else args._.push(a);
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  if (args._.length < 2) {
    console.error('usage: node tools/snapshot.js <recording.json> <output.png> [--port 3000] [--max-size 512] [--headful]');
    process.exit(2);
  }
  const [jsonPath, outPath] = args._;
  const port = args.port || '3000';
  const base = args.base || `http://localhost:${port}/`;
  const timeoutSec = args.timeout || 120;

  if (!fs.existsSync(jsonPath)) {
    console.error(`[snapshot] recording not found: ${jsonPath}`);
    process.exit(2);
  }
  const recordingText = fs.readFileSync(jsonPath, 'utf-8');
  let recording;
  try { recording = JSON.parse(recordingText); }
  catch (e) { console.error(`[snapshot] invalid JSON: ${e.message}`); process.exit(2); }

  const canvasW = (recording.canvasSize && recording.canvasSize.width) || 1200;
  const canvasH = (recording.canvasSize && recording.canvasSize.height) || 800;

  // 從 recording 推算實際播放時長（秒），headless WebGL 通常慢 3-5 倍
  const recDurationSec = (() => {
    try {
      // inkField recording 的時間軸存在 events 陣列的 .t 欄位（毫秒）
      const events = recording.events || [];
      if (!events.length) return 60;
      const lastT = events[events.length - 1].t || 0;
      return Math.ceil(lastT / 1000) || 60;
    } catch (_) { return 60; }
  })();
  // 安全倍率：headless 至少給 5 倍時間，最低 120 秒
  const autoTimeout = Math.max(recDurationSec * 5, 120);
  // 若用戶有指定 --timeout 就用較大的那個
  const effectiveTimeout = args.timeout ? Math.max(args.timeout, autoTimeout) : autoTimeout;
  console.error(`[snapshot] recording: ${recDurationSec}s, timeout: ${effectiveTimeout}s (${(effectiveTimeout / recDurationSec).toFixed(1)}x)`);

  let puppeteer;
  try { puppeteer = require('puppeteer'); }
  catch (e) {
    console.error('[snapshot] puppeteer not installed. Run: cd tools && npm install');
    process.exit(3);
  }

  const browser = await puppeteer.launch({
    headless: args.headful ? false : 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      // headless 預設 GL stack 很慢，且背景頁面 rAF 會被 throttle，
      // 必須整套關掉才不會把 1 分鐘的 playback 拉到 5 分鐘
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-features=CalculateNativeWinOcclusion',
      '--use-gl=angle',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
    ],
    // 預設 180s 對長 recording 不夠（playback + composite 可能 >2 分鐘）
    protocolTimeout: Math.max(effectiveTimeout + 30, 600) * 1000,
  });

  const exitWith = async (code, msg) => {
    if (msg) console.error(msg);
    try { await browser.close(); } catch (_) {}
    process.exit(code);
  };

  // 全域 timeout 保險絲
  const killer = setTimeout(() => {
    exitWith(4, `[snapshot] global timeout after ${effectiveTimeout}s`);
  }, effectiveTimeout * 1000);

  try {
    const page = await browser.newPage();

    // 關閉 service worker 與 HTTP cache，避免 SW 餵舊版 script.js
    // (正式 PWA 的 SW v7 只 bypass /gallery/，不 bypass /script.js)
    const client = await page.target().createCDPSession();
    try {
      await client.send('Network.setBypassServiceWorker', { bypass: true });
      await client.send('Network.setCacheDisabled', { cacheDisabled: true });
    } catch (_) {}

    await page.setViewport({
      width: canvasW,
      height: canvasH,
      deviceScaleFactor: 2,
    });

    page.on('console', (msg) => {
      console.error(`[browser:${msg.type()}] ${msg.text()}`);
    });
    page.on('pageerror', (err) => {
      console.error(`[browser:pageerror] ${err.message}`);
    });
    page.on('response', (resp) => {
      const s = resp.status();
      if (s >= 400) console.error(`[browser:http ${s}] ${resp.url()}`);
    });

    // 用 localStorage 把 JSON 餵進去（沿用 upload.html preview 的機制）
    const lsKey = `inkfield-snapshot-${Date.now()}`;
    const url = `${base}?snapshot=1&recording=${encodeURIComponent('local:' + lsKey)}`;

    // 先 navigate 到 base 才能 setItem 到正確 origin
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    await page.evaluate((k, v) => localStorage.setItem(k, v), lsKey, recordingText);

    // 然後跳到 collector mode + recording=local:<key>
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // 等播放結束 event；同時聽超時與 ready
    const result = await page.evaluate((maxMs) => {
      return new Promise((resolve) => {
        let done = false;
        const finish = (ok, reason) => { if (!done) { done = true; resolve({ ok, reason }); } };
        const t = setTimeout(() => finish(false, 'wait-timeout'), maxMs);
        window.addEventListener('inkfield:playbackEnded', (e) => {
          clearTimeout(t);
          // 播完後再多等幾幀讓 composite buffer 完成
          setTimeout(() => finish(true, 'playback-ended'), 800);
        }, { once: true });
      });
    }, (effectiveTimeout - 5) * 1000);

    if (!result.ok) {
      await exitWith(5, `[snapshot] ${result.reason}`);
      return;
    }

    // 抓 canvas 像素：找頁面上實際的 p5 canvas，toDataURL 後寫檔
    const dataUrl = await page.evaluate(() => {
      // p5 在 WebGL mode 下會建立一個 <canvas data-engine="p5..."> 或 main canvas
      const cs = Array.from(document.getElementsByTagName('canvas'));
      if (!cs.length) return null;
      // 取面積最大的（避免 fxhash overlay 之類的小 canvas）
      cs.sort((a, b) => (b.width * b.height) - (a.width * a.height));
      const cv = cs[0];
      try { return cv.toDataURL('image/png'); }
      catch (e) { return 'ERR:' + e.message; }
    });

    if (!dataUrl) await exitWith(6, '[snapshot] no canvas found');
    if (dataUrl.startsWith('ERR:')) await exitWith(6, '[snapshot] canvas read failed: ' + dataUrl);

    const b64 = dataUrl.split(',')[1];
    const buf = Buffer.from(b64, 'base64');

    // 確保輸出目錄存在
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, buf);

    console.log(`[snapshot] ok: ${outPath} (${(buf.length / 1024).toFixed(1)}KB, ${canvasW}x${canvasH}@2x)`);

    clearTimeout(killer);
    await browser.close();
    process.exit(0);
  } catch (err) {
    clearTimeout(killer);
    await exitWith(1, `[snapshot] crashed: ${err.stack || err.message}`);
  }
}

main();
