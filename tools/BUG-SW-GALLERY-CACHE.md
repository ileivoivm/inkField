# Bug: Gallery 新內容需要多次 reload 才能載入

## 症狀

push 新的 gallery 作品（如 `gallery/recordings/36.json`、`gallery/thumbs/36.png`、`gallery/recordings/index.json`）到 GitHub Pages 後，訪問 https://ileivoivm.github.io/inkField/gallery/ 需要**多次 reload** 才能看到新內容。有時候第一次 reload 看到的 `index.json` 還是舊的，要再 reload 一兩次才更新。

## 環境

- **部署平台**：GitHub Pages（靜態）
- **Service Worker**：`sw.js`，cache-first 策略
- **框架**：無框架，純 JavaScript + p5.js (WebGL)
- **Gallery 頁面**：`gallery/index.html`、`gallery/view.html`（純靜態 HTML + fetch JSON）

## 根本原因

`sw.js` 使用 **cache-first** 策略（第 210-228 行）：

```js
event.respondWith(
  caches.match(event.request).then(cached => {
    if (cached) return cached;          // ← cache 有就直接回，不打網路
    return fetch(event.request).then(response => {
      // 網路拿到的寫回 cache（runtime cache）
      if (response && response.status === 200) {
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
      }
      return response;
    });
  })
);
```

### 問題 1：Gallery 檔案不在 ASSETS 清單，但會被 runtime cache

`sw.js` 的 `ASSETS` 陣列（第 6-174 行）**沒有包含任何 `gallery/` 路徑**（只有 `tech/gallery/` 舊版的）。所以 gallery 檔案不會在 install 時預快取。

但是，一旦用戶第一次訪問 `gallery/index.html`，fetch handler 會把 `gallery/recordings/index.json` 寫入 runtime cache。**之後所有請求都從 cache 返回，即使 server 上的檔案已經更新。**

### 問題 2：Bump CACHE_VERSION 殺傷力太大

目前唯一的更新機制是改 `CACHE_VERSION`（如 `v7` → `v8`），這會在 `activate` 時清掉**整個舊 cache** 然後重新下載所有 ASSETS（~10MB）。

但這有兩層延遲：
1. **SW 更新是背景發生的**：瀏覽器先用舊 SW 回應當前頁面，背景下載新 SW，等用戶**關閉所有 tab 再重新開啟**（或手動 skipWaiting）才會啟用新 SW
2. 即使新 SW 啟用了，gallery 檔案不在 ASSETS 清單裡，第一次 fetch 還是要打網路 → 又被 runtime cache → 下一次更新又卡住

### 問題 3：多次 reload 才生效的時間線

```
第 1 次 reload：
  - 瀏覽器發現 sw.js 檔案內容變了（CACHE_VERSION 從 v7 → v8）
  - 開始背景下載新 SW，但舊 SW 仍在控制頁面
  - 頁面拿到的是舊 cache → 看到舊內容

第 2 次 reload：
  - 新 SW 可能已下載完成，但還在 "waiting" 狀態（等所有舊 tab 關閉）
  - 如果 skipWaiting() 生效，新 SW 啟用，清掉舊 cache
  - 但 gallery 檔案不在 ASSETS 裡，需要首次 fetch → 可能這次才拿到新 index.json

第 3 次 reload：
  - 新 index.json 已在 cache → 頁面讀到最新內容
  - 但 36.json、36.png 還沒被 cache（要等用戶點進去才觸發 fetch）
```

## 建議的修復方向

### 方案 A：Gallery 路徑改用 network-first 策略

對 `gallery/` 底下的請求使用 **network-first**（有網路就拿最新的，失敗才 fallback 到 cache）：

```js
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // gallery/ 底下用 network-first
  if (url.pathname.includes('/gallery/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request)
          .then(cached => cached || new Response('offline', { status: 503 }))
        )
    );
    return;
  }

  // 其他路徑維持 cache-first（繪畫 app 需要離線可用）
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
        return new Response('offline', { status: 503 });
      });
    })
  );
});
```

**優點**：gallery 永遠拿最新內容，離線時仍有 fallback  
**缺點**：每次載入 gallery 都要打網路（但 gallery 本來就需要即時性）

### 方案 B：Stale-while-revalidate

同時回傳 cache 並背景更新，下一次 reload 就是最新的（只需 2 次 reload 而非 3 次）：

```js
if (url.pathname.includes('/gallery/')) {
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request).then(response => {
        if (response && response.status === 200) {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
        }
        return response;
      });
      return cached || fetchPromise;
    })
  );
  return;
}
```

### 方案 C：Gallery 完全不走 SW

在 `gallery/index.html` 和 `gallery/view.html` 的 `<head>` 加入：

```html
<!-- 告訴瀏覽器這些頁面不要被 SW 攔截 -->
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(reg => {
      // Gallery 頁面 unregister SW scope
      // 無法做到 — SW scope 是全域的
    });
  }
</script>
```

這個方案不可行，因為 SW 的 scope 是 `/`，無法只對子路徑取消。

**結論**：方案 A（network-first for gallery/）最乾淨。

## 重現步驟

1. 訪問 https://ileivoivm.github.io/inkField/gallery/ 讓 SW cache 住 index.json
2. push 一件新作品（新的 recordings/N.json + thumbs/N.png + 更新 index.json）
3. bump `sw.js` 的 `CACHE_VERSION` 一起 push
4. 等 GitHub Pages 部署完成（~2 分鐘）
5. 回到 gallery 頁面 reload → 仍然看到舊內容
6. 再 reload 一次 → 可能還是舊的
7. 第三次 reload 或 hard refresh（Cmd+Shift+R）→ 終於看到新內容
