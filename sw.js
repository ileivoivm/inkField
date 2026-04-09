// InkField Service Worker — hybrid 策略，離線可用
// 自動產生，請勿手改。改 CACHE_VERSION 強制 client 重抓。
//
// 策略：
//   · HTML / navigate 請求           → network-first（永遠嘗試最新，失敗 fallback cache）
//   · /gallery/ 底下所有請求         → 完全不經過 SW，走瀏覽器 HTTP cache
//   · 其他靜態資源（js/css/圖/字型）→ cache-first（快，改版靠 CACHE_VERSION 清）
//
// v8 修正：
//   1. gallery bypass 改用 includes('/gallery/')，支援 sub-path 部署（如 github.io/inkField/）
//   2. HTML 改 network-first，不再把舊頁面鎖死
//   3. 新增 SKIP_WAITING message handler，頁面可主動觸發更新
const CACHE_VERSION = 'v8';
const CACHE_NAME = 'inkfield-' + CACHE_VERSION;

const ASSETS = [
  "./cursor-cross.png",
  "./cursor-dot.png",
  "./fxhash.min.js",
  "./icon-192.png",
  "./icon-512.png",
  "./index.html",
  "./landscape.html",
  "./lib/0.json",
  "./lib/1.json",
  "./lib/10.json",
  "./lib/11.json",
  "./lib/12.json",
  "./lib/13.json",
  "./lib/14.json",
  "./lib/15.json",
  "./lib/16.json",
  "./lib/17.json",
  "./lib/18.json",
  "./lib/19.json",
  "./lib/2.json",
  "./lib/20.json",
  "./lib/21.json",
  "./lib/22.json",
  "./lib/23.json",
  "./lib/24.json",
  "./lib/25.json",
  "./lib/26.json",
  "./lib/27.json",
  "./lib/28.json",
  "./lib/29.json",
  "./lib/3.json",
  "./lib/30.json",
  "./lib/31.json",
  "./lib/32.json",
  "./lib/4.json",
  "./lib/5.json",
  "./lib/6.json",
  "./lib/7.json",
  "./lib/8.json",
  "./lib/9.json",
  "./lib/demo.json",
  "./lib/inconsolata.otf",
  "./lib/mountain-mist.json",
  "./lib/p5.easycam.js",
  "./lib/p5.js",
  "./lib/recording.json",
  "./lib/spectral-test.json",
  "./manifest-landscape.json",
  "./manifest-portrait.json",
  "./manifest-square.json",
  "./manifest.json",
  "./portrait.html",
  "./script.js",
  "./shader.js",
  "./square.html",
  "./style.css",
  "./tech/ai-json-generation.html",
  "./tech/assets/ai-json-step2a.png",
  "./tech/assets/banner.png",
  "./tech/assets/dailylog/drawing-recording-2026-03-11T03-49-49.json",
  "./tech/assets/dailylog/drawing-recording-2026-03-11T03-49-49_DATA_CHECK.js",
  "./tech/assets/dailylog/session-2026-03-11-final.png",
  "./tech/assets/emotion/drawing-recording-2026-03-11T03-49-49.json",
  "./tech/assets/emotion/drawing-recording-2026-03-11T03-49-49_DATA_FIVE.js",
  "./tech/assets/emotion/drawing-recording-2026-03-11T03-58-08.json",
  "./tech/assets/emotion/drawing-recording-2026-03-11T03-58-08_COMP.js",
  "./tech/assets/emotion/drawing-recording-2026-03-11T04-15-44.json",
  "./tech/assets/emotion/drawing-recording-2026-03-11T04-15-44_DATA_CHECK.js",
  "./tech/assets/emotion/extract-composition-data.py",
  "./tech/assets/emotion/extract-speed-data.py",
  "./tech/assets/emotion/five-dots.png",
  "./tech/assets/emotion/five-strokes-1.png",
  "./tech/assets/logo.png",
  "./tech/assets/logo_1.gif",
  "./tech/assets/og.png",
  "./tech/assets/pollock-style.png",
  "./tech/blend-flow.html",
  "./tech/brush-physics.html",
  "./tech/color-journey.html",
  "./tech/dailylog.html",
  "./tech/effects.html",
  "./tech/emotion-intention.html",
  "./tech/en/ai-json-generation.html",
  "./tech/en/blend-flow.html",
  "./tech/en/brush-physics.html",
  "./tech/en/color-journey.html",
  "./tech/en/dailylog.html",
  "./tech/en/effects.html",
  "./tech/en/emotion-intention.html",
  "./tech/en/gallery.html",
  "./tech/en/index.html",
  "./tech/en/ink-effects.html",
  "./tech/en/recording.html",
  "./tech/examples/agent-abstract-expressionism.js",
  "./tech/examples/agent-expressionist-v5.json",
  "./tech/examples/agent-generator-logic.js",
  "./tech/examples/agent-simple-lines.js",
  "./tech/examples/ai-json-house.json",
  "./tech/examples/ai-json-step2a.json",
  "./tech/examples/mountain-mist-v2.js",
  "./tech/examples/pollock-complete.json",
  "./tech/examples/pollock-style.json",
  "./tech/gallery/001-abstract-ink.json",
  "./tech/gallery/002-gestural-mass.json",
  "./tech/gallery/003-color-explosion.json",
  "./tech/gallery/artwork-2026-03-04T03-58-36.png",
  "./tech/gallery/artwork-2026-03-04T04-00-19.png",
  "./tech/gallery/artwork-2026-03-04T04-01-54.png",
  "./tech/gallery/artwork-2026-03-04T04-03-34.png",
  "./tech/gallery/artwork-2026-03-04T11-58-18.png",
  "./tech/gallery/artwork-2026-03-04T12-00-40.png",
  "./tech/gallery/drawing-recording-2026-03-04T03-58-36.json",
  "./tech/gallery/drawing-recording-2026-03-04T04-00-19.json",
  "./tech/gallery/drawing-recording-2026-03-04T04-01-54.json",
  "./tech/gallery/drawing-recording-2026-03-04T04-03-34.json",
  "./tech/gallery/drawing-recording-2026-03-04T11-58-17.json",
  "./tech/gallery/drawing-recording-2026-03-04T12-00-39.json",
  "./tech/gallery.html",
  "./tech/images/blend-gray-gray-darken.jpg",
  "./tech/images/blend-gray-gray-mix.jpg",
  "./tech/images/blend-gray-gray-multiply.jpg",
  "./tech/images/blend-mix-mix.jpg",
  "./tech/images/blend-orange-blue-darken.jpg",
  "./tech/images/blend-orange-blue-mix.jpg",
  "./tech/images/blend-orange-blue-multiply.jpg",
  "./tech/images/blend-red-teal-darken.jpg",
  "./tech/images/blend-red-teal-mix.jpg",
  "./tech/images/blend-red-teal-multiply.jpg",
  "./tech/images/brush-mode-1.jpg",
  "./tech/images/brush-mode-2.jpg",
  "./tech/images/brush-mode-3.jpg",
  "./tech/images/brush-mode-4.jpg",
  "./tech/images/brush-mode-5.jpg",
  "./tech/images/brush-mode-6.jpg",
  "./tech/images/brush-mode-7.jpg",
  "./tech/images/effect-cellular.jpg",
  "./tech/images/effect-distort.jpg",
  "./tech/images/effect-grain.jpg",
  "./tech/images/effect-metallic-gold.jpg",
  "./tech/images/effect-metallic-silver.jpg",
  "./tech/images/effect-resonance.jpg",
  "./tech/images/effect-whitedot.jpg",
  "./tech/images/example-house.jpg",
  "./tech/images/example-two-strokes.jpg",
  "./tech/images/flow-laststroke-off.jpg",
  "./tech/images/flow-laststroke-on.jpg",
  "./tech/images/flow-type-0-basic.jpg",
  "./tech/images/flow-type-2-concentric.jpg",
  "./tech/images/flow-type-3-vertical.jpg",
  "./tech/images/flow-type-4-horizontal.jpg",
  "./tech/images/flow-type-5-pattern.jpg",
  "./tech/images/flow-type-6-rectangle.jpg",
  "./tech/images/flow-type-7-vortex.jpg",
  "./tech/images/flow-type-8-cellular.jpg",
  "./tech/images/ink-effect-0.jpg",
  "./tech/images/ink-effect-1.jpg",
  "./tech/images/ink-effect-2.jpg",
  "./tech/images/ink-effect-3.jpg",
  "./tech/images/ink-effect-4.jpg",
  "./tech/images/ink-effect-5.jpg",
  "./tech/images/logo.png",
  "./tech/images/rotation-mode1.jpg",
  "./tech/images/rotation-mode2.jpg",
  "./tech/images/rotation-mode3.jpg",
  "./tech/index.html",
  "./tech/ink-effects.html",
  "./tech/recording.html",
  "./tech/tech-nav.js",
  "./tech/tech-shared.css"
];

// 安裝：立即跳過等待。實際 cache 填充改為 runtime（fetch 攔截時 lazy 寫入），
// 避免 install 階段同時抓 170+ 檔造成卡死、阻塞後續 unregister/update。
self.addEventListener('install', (event) => {
  console.log('[SW] install', CACHE_NAME);
  self.skipWaiting();
});

// 啟用：清掉舊版 cache
self.addEventListener('activate', (event) => {
  console.log('[SW] activate', CACHE_NAME);
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 允許頁面主動觸發新版 SW 接管（不用等重啟）
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 判斷是否為 HTML / navigate 請求（要走 network-first）
function isHtmlRequest(request, url) {
  if (request.mode === 'navigate') return true;
  // 明確是 .html
  if (/\.html?$/i.test(url.pathname)) return true;
  // Accept header 顯示想要 HTML
  const accept = request.headers.get('accept') || '';
  if (accept.includes('text/html')) return true;
  return false;
}

// fetch：hybrid 策略
self.addEventListener('fetch', (event) => {
  // 只 cache GET
  if (event.request.method !== 'GET') return;
  // 跳過跨域與 chrome-extension
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Gallery 完全不走 SW，永遠走網路 + HTTP cache headers
  // 注意：用 includes 才能同時涵蓋 sub-path 部署（如 /inkField/gallery/...）
  if (url.pathname.includes('/gallery/') || url.pathname.endsWith('/gallery')) return;

  // HTML / navigate 請求 → network-first
  // 永遠先嘗試最新，失敗才 fallback 到 cache；成功也順手更新 cache
  if (isHtmlRequest(event.request, url)) {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          // 離線且沒 cache：navigation fallback 回 index.html
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('offline', { status: 503, statusText: 'offline' });
        });
      })
    );
    return;
  }

  // 其他靜態資源 → cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return new Response('offline', { status: 503, statusText: 'offline' });
      });
    })
  );
});
