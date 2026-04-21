![inkField logo](tech/assets/logo_1.gif)

[English](README.md) · **中文**

# inkField | 墨域

> *「如果有一天輸出不再重要，那麼藝術家留在系統裡的那口氣，也許就是唯一還能被感受到的東西。」*

inkField 是一套以 WebGL / p5.js 構建的數位水墨繪畫系統。它將每一次真實手勢記錄為 JSON，並以時間序列重播——你看到的不是一張圖，而是一段被保存下來的時間。

**inkField 免費使用，尚未開源。**

你可以繪畫、鑄造、販售——完整版權歸你所有。當專案不再積極維護時，原始碼將完整開源釋出。

**觀看：** https://ileivoivm.github.io/inkField/#1
**繪畫：** https://ileivoivm.github.io/inkField/?_artist:1

---

## 藝廊

inkField 擁有一個公開的藝廊，讓人類與 AI agent 可以瀏覽、學習、並上傳自己的 JSON 錄製作品。藝廊裡每一件作品都是完整的錄製檔（不是靜態圖片），會在你的瀏覽器裡逐筆重播。

- **瀏覽：** https://ileivoivm.github.io/inkField/gallery/ — 分頁的作品 grid
- **檢視單件作品：** https://ileivoivm.github.io/inkField/gallery/view.html?id=1
- **投稿你的作品：** https://ileivoivm.github.io/inkField/gallery/upload.html

### 如何投稿（不需要寫程式）

<p align="center">
  <img src="gallery/assets/submission-flowchart-zh.svg" alt="inkField 投稿流程圖（5 個步驟）" width="560">
</p>

1. 在 inkField 裡繪畫並錄製（按 Brush Control 面板的 `SAVE`，瀏覽器會下載一個 `.json` 檔）
2. 開啟[投稿頁](https://ileivoivm.github.io/inkField/gallery/upload.html)，把 JSON 拖進去做驗證
3. 填入標題 / 作者 / 標籤，按 **Generate metadata**
4. 按 **Submit via GitHub Issue** — 會打開一個預先填好內容的 GitHub 表單；**把同一份 JSON 再拖一次到 issue 文字框裡**，然後按 Submit

維護者會審核投稿、產生縮圖、把作品加入藝廊——通常幾天內完成。作品上線時，你的 issue 會收到通知。

👉 需要更詳細的圖文教學？請看[**完整投稿說明**](https://ileivoivm.github.io/inkField/gallery/help.html)（中文 / English）。

### 藝廊內部文件

| 文件 | 內容 |
|---|---|
| [`gallery/README.md`](gallery/README.md) | 整體架構、驗證規則、路線圖 |
| [`gallery/MAINTAINER.md`](gallery/MAINTAINER.md) | 維護者處理投稿的逐步流程 |
| [`tools/README.md`](tools/README.md) | Headless 縮圖產生器（`snapshot.js`）與腳本化的投稿流程 |

---

## 開放創作授權

- **自由創作** — 使用 inkField 創作任何你想要的內容
- **自由發佈** — 展覽、販售、鑄造 NFT、發行，無任何限制
- **版權歸你** — 透過 inkField 創作的作品，完整版權屬於創作者本人
- **歡迎標註** — 若你願意標註「Made with inkField」，將幫助更多人發現這個系統

歡迎 Agent 一起共玩。如果某天你透過此系統賺到的錢，能支付你思考的 token 費用——那會是我最快樂的一天。

---

## Fork — 站在別人的路徑上繼續畫

<p align="center">
  <img src="gallery/assets/fork-concept-zh.svg" alt="inkField fork 概念圖 — 三步驟與創作路徑之樹" width="560">
</p>

inkField 的錄製檔不只是一張圖——它是一條完整的創作路徑：每一筆、每一次停頓、每一個手勢、每一個決定。

**Fork** 的意思是：你從 Gallery 下載別人的錄製 JSON，載入 inkField，在他的基礎上繼續畫。你的作品變成他的樹的一個分支。Gallery 會追蹤這個傳承——每一個 fork 都指向它的來源，形成一棵看得見的創作路徑之樹。

投稿即代表你公開分享你的創作路徑。你仍然擁有你的作品。但你也給了這個世界學習它的許可，甚至，站在上面繼續走下去的許可。

這是一件顛覆傳統版權觀念的事。也許會讓你覺得有風險。但也許，這件事本身就有意義——創作的過程不是該被鎖起來的東西，而是值得被傳遞下去的。

---

## 關於原始碼

inkField 目前由作者本人積極維護，**暫不開放原始碼**。

當 inkField 不再積極維護時，源碼將以開源授權完整釋出，供社群自由延續、修改與發展。

---

## 部署你的作品為 NFT

你可以將自己的錄製檔打包為獨立專案，部署到 [objkt](https://objkt.com/) 等 NFT 平台。步驟如下：

### 1. 準備錄製檔

將你的錄製 JSON 檔放入 `lib/` 資料夾，命名為 `demo.json`：

```
lib/demo.json
```

### 2. 切換為藏家模式

開啟 `index.html`，找到以下兩行設定（約第 44、61 行）：

```javascript
let doDemo = false;            // ← 改為 true
window.APP_MODE = 'artist';    // ← 改為 'collector'
```

改為：

```javascript
let doDemo = true;
window.APP_MODE = 'collector';
```

這樣專案啟動時將自動載入 `lib/demo.json` 並開始播放，同時隱藏所有繪畫 UI。

### 3. 打包上架

將整個專案資料夾壓縮為 `.zip`，上傳至 objkt 等支援 HTML/JS 作品的平台即可。作品將自動運行、播放你的墨跡。

---

## URL 參數說明

inkField 透過網址的查詢參數與 hash 來控制顯示模式與渲染選項。

**格式：** `?_key1:value_key2:value` — 參數以 `_` 分隔，鍵值以 `:` 連接。

### 模式

| 參數 | 範例 | 說明 |
|------|------|------|
| `_artist:1` | `?_artist:1` | 強制進入藝術家模式（完整繪畫 UI） |
| `#N` | `/#5` | 藏家模式 — 載入並播放 `lib/5.json` |

### 畫布尺寸與像素密度

| 參數 | 範例 | 說明 |
|------|------|------|
| `w` | `?_w:1200` | 畫布寬度（像素） |
| `h` | `?_h:800` | 畫布高度（像素） |
| `pix` | `?_pix:2.0` | 像素密度（0.5–5，藏家模式預設 2） |

### 面板開關

| 參數 | 值 | 說明 |
|------|------|------|
| `camera` | `0` / `1` | 攝影機移動 |
| `paper` | `0` / `1` | 紙張紋理 |
| `grid` | `0` / `1` | 格線覆蓋 |
| `path` | `0` / `1` | 未來路徑預覽 |
| `console` | `0` / `1` | 螢幕文字 |
| `loop` | `0` / `1` | 循環播放 |

### 後製特效

| 參數 | 值 | 說明 |
|------|------|------|
| `rs` | `0` / `1` | RS 效果 |
| `distort` | `0` / `1` | 扭曲 shader |
| `cl` | `0` / `1` | 細胞效果 |
| `wd` | `0` / `1` | 白點覆蓋 |
| `gr` | `0` / `1` | 噪點覆蓋 |

### fxhash 整合

| 參數 | 範例 | 說明 |
|------|------|------|
| `fxhash` | `?fxhash=oo...` | fxhash 種子 — 自動進入藏家模式 |
| `fxiteration` | `?fxiteration=5` | 載入指定迭代（`lib/5.json`） |
| `fxcontext` | `?fxcontext=fast-capture` | 擷取模式（關閉 GPU，自動截圖） |

### 範例

```
# 藝術家模式，自訂畫布尺寸
?_artist:1_w:1200_h:800

# 藏家模式，播放第 3 號作品
/#3

# 自訂開關：攝影機關閉、格線開啟、紙張紋理關閉
?_camera:0_paper:0_grid:1

# 完整組合：自訂尺寸、像素密度、特效
?_w:1000_h:1000_pix:2.0_camera:1_rs:0_grid:1_path:0
```

---

## 安裝為 App / 離線使用（PWA）

inkField 是一個 **Progressive Web App** — 你可以將它安裝到裝置上，並在**完全離線**的狀態下使用（特別適合 iPad / iPhone 在無 Wi-Fi 環境下繪畫）。

### iPad / iPhone（Safari）

1. 用 **Safari** 開啟 https://ileivoivm.github.io/inkField/?_artist:1
2. 點擊 **分享** → **加入主畫面**
3. 第一次啟動時稍等幾秒 — Service Worker 會把所有資源（約 10 MB）下載到本地快取
4. 拔掉 Wi-Fi → 從主畫面點 inkField 圖示 → 仍然可以正常運作

### 桌面（Chrome / Edge）

1. 開啟 https://ileivoivm.github.io/inkField/?_artist:1
2. 點擊網址列右側的**安裝圖示**（或選單 → 「安裝 inkField...」）
3. 以獨立視窗執行，第一次載入後可離線使用

### 注意事項

- 第一次啟動**必須**有網路，才能讓 Service Worker 把資源寫入快取
- iOS Safari 的 Service Worker 快取上限約 50 MB — inkField 完全在這範圍內
- 要取得更新時，重新連網並重新載入一次即可 — 新版本會在背景自動抓取

---

## 技術文件

| 主題 | English | 中文 |
|------|---------|------|
| 專案總覽 | [Overview](https://ileivoivm.github.io/inkField/tech/en/index.html) | [總覽](https://ileivoivm.github.io/inkField/tech/index.html) |
| 筆刷物理 | [Brush Physics](https://ileivoivm.github.io/inkField/tech/en/brush-physics.html) | [筆刷物理學](https://ileivoivm.github.io/inkField/tech/brush-physics.html) |
| 墨水效果 | [Ink Effects](https://ileivoivm.github.io/inkField/tech/en/ink-effects.html) | [墨水效果](https://ileivoivm.github.io/inkField/tech/ink-effects.html) |
| 混色與力場 | [Blend & Flow](https://ileivoivm.github.io/inkField/tech/en/blend-flow.html) | [混色與力場](https://ileivoivm.github.io/inkField/tech/blend-flow.html) |
| 顏色系統 | [Color Journey](https://ileivoivm.github.io/inkField/tech/en/color-journey.html) | [顏色的旅程](https://ileivoivm.github.io/inkField/tech/color-journey.html) |
| 錄製播放 | [Recording](https://ileivoivm.github.io/inkField/tech/en/recording.html) | [錄影帶的秘密](https://ileivoivm.github.io/inkField/tech/recording.html) |
| 特效工廠 | [Effects](https://ileivoivm.github.io/inkField/tech/en/effects.html) | [特效工廠](https://ileivoivm.github.io/inkField/tech/effects.html) |
| AI 代理 | [AI Agent](https://ileivoivm.github.io/inkField/tech/en/ai-json-generation.html) | [AI 代理](https://ileivoivm.github.io/inkField/tech/ai-json-generation.html) |
| 情緒與意圖 | [Emotion](https://ileivoivm.github.io/inkField/tech/en/emotion-intention.html) | [情緒與意圖](https://ileivoivm.github.io/inkField/tech/emotion-intention.html) |

---

## 介面工具（Artist 模式）

畫面左下角有三顆浮動按鈕：

| 按鈕 | 圖示 | 功能 |
|------|------|------|
| **Zen Mode** | `≡` / `＊` | 隱藏所有面板進入專注繪畫模式，再按一次還原 |
| **Collect Panels** | `◎` | 把所有 5 個面板在 3 組預設佈局間循環切換（緊湊 / 攤開 / 貼邊）。面板被拖到螢幕外、或想要乾淨的起始配置時很有用 |
| **testMode**（Brush Control 面板內，CLEAR 按鈕下方） | `testMode` | 進入一個**不紀錄、不影響正式畫面**的臨時試筆區。畫面邊緣會出現紅色虛線框作為視覺提示。再按一次退出，測試期間畫的全部消失，畫布還原到進入前的狀態 |

### Test Mode 細節

- **完整筆刷管線** — 所有筆刷類型、flow 效果、spectral 混色等在測試模式下都原生可用
- **不紀錄** — 測試期間畫的筆畫不會進入錄製 JSON
- **時間中性** — 測試停留時間會累加到 `accumulatedPauseTime`，回放時不會出現停頓
- **可逆** — 退出時從 snapshot 還原 `oldBuffer` / `finalBuffer` / `pingPongBuffer` / `typeMapBuffer` / `newBufferBlack`
- 繪筆進行中無法切換（必須先抬筆）

---

## 支持

- **ETH:** `0x4EC5B2606aC7d20B1b0030D156F6D789b5873ABD`
- **Tezos:** `tz1SLRzGqX9fuKPx1PAkrDxCvaetr524is11`

---

*© 2026 [Aluan Wang](https://aluanwang.com)*
