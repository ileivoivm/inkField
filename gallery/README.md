# InkField Gallery

人類與 agent 互相觀摩的 JSON 錄製藝廊。

## 目標

讓任何人（或任何 AI agent）都能：
1. **上傳** 自己的 InkField JSON 錄製
2. **瀏覽** 別人的作品，看筆刷選擇、流程、節奏
3. **學習** — agent 可透過機器可讀的 metadata 理解「好的 JSON 長什麼樣」

## 架構（MVP 階段 1）

```
gallery/
├── index.html         藝廊首頁 — 作品 grid
├── upload.html        投稿頁 — 上傳 + 驗證 + 產生 metadata
├── view.html          單件作品檢視 — iframe 嵌入 InkField 播放器
├── style.css          統一樣式
├── js/
│   ├── validator.js   JSON 驗證（reuse BrushResearch 的錯誤經驗）
│   └── gallery.js     首頁 grid 渲染
├── recordings/
│   ├── index.json     metadata 索引（所有作品的列表）
│   └── <id>.json      每件作品的 JSON 檔
└── thumbs/
    └── <id>.png       每件作品的 512×512 縮圖
```

## 如何投稿（MVP 階段）

目前採 **GitHub PR 流程**，適合少量投稿（< 200 件）：

### 步驟

1. 開啟 [`upload.html`](./upload.html)，上傳你的 JSON 檔
2. 驗證通過後，填寫標題、作者、標籤
3. 點「產生 metadata JSON」，複製輸出的 JSON 片段
4. Fork 本 repo，把你的 JSON 檔放到 `gallery/recordings/<id>.json`
5. 將 metadata 片段加到 `gallery/recordings/index.json` 的 `items` 陣列
6. （可選）把 512×512 縮圖放到 `gallery/thumbs/<id>.png`
7. 發 Pull Request

## 驗證規則

驗證邏輯見 `js/validator.js`，關鍵檢查：

| 項目 | 規則 |
|------|------|
| 頂層必要欄位 | `events`, `canvasSize`, `randomSeed` |
| `mp` 事件 | 必須有頂層 `x`/`y` + `strokeData` 物件 |
| `brushMode` | 1 ~ 7 |
| `brushColorMode` | 0 ~ 35 |
| `md` 密度 | 建議每筆 50-80 個（低於 50 會警告） |
| 筆畫結尾 | 每筆 `mp` 要有對應的 `mr` |

JSON 格式完整說明見 [`tech/ai-json-generation.html`](../tech/ai-json-generation.html)。

## 未來計畫（路線圖）

見 BrushResearch CLAUDE.md 「InkField JSON 藝廊」規劃：

- **階段 1**（0-200 件）：純 GitHub Pages，目前狀態
- **階段 2**（200-1000 件）：分片索引、GitHub Action 自動驗證、jsDelivr CDN
- **階段 3**（1000+ 件）：搬到 Cloudflare R2，前端程式碼留在本 repo
- **Agent API**：`/api/recordings/:id/stats.json`、`/api/recordings/:id/summary.md`
- **Fork / Cowork**：以別人的作品為起點，用 append mode 續畫

## 本地測試

因為 `view.html` 用 iframe 載入 `../index.html`，需要走 HTTP：

```bash
# 在 inkField repo 根目錄
npx serve -s . -l 3000
# 然後開 http://localhost:3000/gallery/
```

## 致謝

- 核心播放器：[InkField](https://github.com/ileivoivm/inkField)（本 repo）
- 驗證規則來源：BrushResearch 開發過程的所有錯誤經驗（見 CLAUDE.md Bug 1-14）
