# InkField (墨域)

WebGL/p5.js 數位水墨繪畫應用，將每一筆記錄為 JSON 並以時間序列重播為生成藝術作品。作者：Aluan Wang。

## 技術棧

- **前端**：純 JavaScript (ES6+)，無框架、無打包工具
- **圖形**：p5.js + WebGL + 自訂 GLSL shaders
- **3D 攝影機**：p5.easycam.js
- **生成藝術平台**：fxhash 整合
- **部署**：Railway 靜態託管，使用 `serve.json` 路由

## 專案結構

```
index.html          # 主入口（artist/collector 模式切換）
script.js           # 核心邏輯（~12K 行，變數經混淆處理）
shader.js           # 嵌入式 GLSL shader 原始碼
style.css           # UI 樣式、響應式設計
llms.txt            # AI/LLM 導引文件
lib/                # p5.js、easycam、canonical demo recordings（0.json、1.json + demo/具名檔）
tech/               # 技術文件（中/英雙語）
tech/en/            # 英文技術文件
```

## 開發方式

```bash
# 無需建置步驟，直接靜態伺服
python3 -m http.server 8000
# 或任何靜態伺服器，然後訪問 http://localhost:8000
```

## 兩種模式

- **Artist 模式**：直接訪問 `/` 或加參數 `?_artist:1`，顯示完整繪畫 UI
- **Collector 模式**：透過 hash 訪問如 `/#1`（載入 `lib/1.json`），隱藏 UI，確定性重播

### ⚠️ 兩條播放路徑 — 不要混淆來源

inkField 有兩個獨立的 JSON 播放入口，**它們的「正典來源」是分開的**：

| 路徑 | 載入來源 | 用途 |
|------|---------|------|
| `/#N`（collector 模式） | `lib/N.json` | 短連結 demo loader，**只服務 `lib/0.json` 與 `lib/1.json`** |
| `gallery/view.html?id=N` | `gallery/recordings/N.json` | Gallery 完整作品庫（目前 35+ 件） |

**規則**：
- `lib/` 只放 canonical 的 demo 檔（`0.json`、`1.json`、`demo.json`、`mountain-mist.json`、`recording.json`、`spectral-test.json`）
- 所有用戶投稿與 seed 作品都只屬於 `gallery/recordings/`
- **`gallery/recordings/N.json` 不要複製到 `lib/`**。`.gitignore` 已設規則 `lib/[0-9].json` / `lib/[0-9][0-9].json`（保留 `!lib/0.json` `!lib/1.json`），任何 `lib/2.json` ~ `lib/99.json` 即使本機存在也不會被追蹤
- 結果：`/#14` 在 production 是 404；想播放 `#14` 必須走 `gallery/view.html?id=14`

**為什麼這樣設計**：避免「同一份 JSON 在 repo 裡存兩份」造成同步負擔。Gallery 是 single source of truth，collector 模式只是首頁的 demo 接待員。

如果未來想讓 `/#N` 也能播 gallery 作品，需要：（1）在 `tools/snapshot.js` 加 `cp` 步驟把新檔同步到 `lib/`、（2）放寬 `.gitignore`、（3）更新本段文件。

## 渲染管線（6 階段 shader 合成）

1. `newBufferBlack` — 使用者繪製的原始像素
2. `encode.frag` — 編碼筆觸顏色與元資料至 finalBuffer
3. `typeMapEncode.frag` — 寫入筆刷身份至 typeMapBuffer
4. `feedback.frag` — 即時墨水擴散效果（6 種模式）
5. `composite.frag` — 合成最終畫面輸出
6. `flow.frag` — 選擇性流場扭曲（兩遍渲染）

## 產生縮圖（snapshot）

新增 gallery 作品後，用 `tools/snapshot.js` 產生縮圖：

```bash
node tools/snapshot.js gallery/recordings/N.json gallery/thumbs/N.png --max-size 512
```

- 需要 dev server 在 :3000（`python3 -m http.server 3000`）
- **預設 headful**，不要加 `--headless`（headful 才有 GPU 加速）
- `--pix 0.5` 是預設值，不需額外指定
- 渲染全黑？確認 Chrome GPU 加速未被停用

依賴：`cd tools && npm install`（只需第一次）

## Gallery 維護流程

新增作品的完整步驟：

```bash
# 1. 下載 JSON
curl -L "<GitHub attachment URL>" -o gallery/recordings/N.json

# 2. 啟動 dev server
python3 -m http.server 3000

# 3. 產生縮圖
node tools/snapshot.js gallery/recordings/N.json gallery/thumbs/N.png --max-size 512

# 4. 更新 index.json（見下方格式說明）

# 5. commit + push
git add gallery/recordings/N.json gallery/thumbs/N.png gallery/recordings/index.json
git commit -m "gallery: add #N — title by author (closes #issue)"
git push origin main

# 6. 用 MCP Chrome 確認縮圖上線正常（見下方）
```

### index.json 縮圖路徑格式

⚠️ **thumbnail 路徑必須用 `./thumbs/N.png?v=<mtime>` 格式**，不能用 `gallery/thumbs/N.png`：

```python
import os
ts = int(os.path.getmtime('gallery/thumbs/N.png'))
thumbnail = f'./thumbs/N.png?v={ts}'
```

錯誤示範（會造成 404）：`"thumbnail": "gallery/thumbs/44.png"`
正確示範：`"thumbnail": "./thumbs/44.png?v=1776302279"`

### 上線驗證（MCP Chrome）

push 後用 MCP 確認縮圖正常載入，避免路徑錯誤無聲失敗：

```javascript
// 在 https://ileivoivm.github.io/inkField/gallery/ 執行
const imgs = [...document.querySelectorAll('.artwork-thumb')];
const last2 = imgs.slice(-2).map(img => ({
  src: img.src.split('/').slice(-2).join('/'),
  complete: img.complete,
  naturalWidth: img.naturalWidth  // 0 = 載入失敗
}));
last2
```

`naturalWidth > 0` 且 `complete: true` 才算正常。

## 部署檢查清單

`sw.js` 對不同路徑使用不同快取策略：
- **`gallery/`** → **network-first**（永遠拿最新，離線才 fallback cache）
- **其他（主 app / tech/）** → **cache-first**（離線優先，需 bump 版號才更新）

### 需要 bump `CACHE_VERSION` 的情況

只有**主 app / PWA shell / tech/** 的檔案變動時才需要：

- `tech/` 底下任何 `.html` 或 `.js`（含 `tech-nav.js`）
- `style.css`、`script.js`、`shader.js`
- `index.html`、`manifest.json`

做法：打開 `sw.js` 第 3 行，把版本號 +1（如 `'v8'` → `'v9'`），與其他改動一起 commit。

### 不需要 bump 的情況

**純 gallery 內容更新**不需要動 `sw.js`：

- `gallery/recordings/*.json`（新作品）
- `gallery/thumbs/*.png`（新縮圖）
- `gallery/recordings/index.json`（索引重建）
- `gallery/` 底下的 `.html`、`.css`、`.js`（gallery UI 改動）

這些路徑走 network-first，deploy 後下一次載入就會拿到最新內容。

## 重要注意事項

- `script.js` 中的變數名稱經過系統性混淆（如 `_j0`, `_j422`），這是刻意設計
- JSON 錄製格式使用 seeded PRNG 確保確定性重播
- 修改 shader 時需同步更新 `shader.js` 中的嵌入字串
- 支援手機/平板自動適配（pixel density 自動降低）
- 技術文件位於 `tech/` 目錄，中英雙語維護
