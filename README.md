# 墨域 | inkField

> *"If one day the output is no longer the main thing, then maybe the breath the artist leaves inside the system will be the last thing we can still feel."*
>
> *「如果有一天輸出不再重要，那麼藝術家留在系統裡的那口氣，也許就是唯一還能被感受到的東西。」*

inkField 是一套以 WebGL / p5.js 構建的數位水墨繪畫系統。它將每一次真實手勢記錄為 JSON，並以時間序列重播——你看到的不是一張圖，而是一段被保存下來的時間。

筆刷之間設有虛擬彈簧：快速移動時彈簧拉緊、線條變細；緩慢移動時筆穩定、線條變粗。墨水永不消失，每一幀都被力場推移，如同對著紙面吹氣。每次重播時骨架來自真實動作，但邊緣、質感、紋理位置略有不同——骨架不變，氣的流動每次都不一樣。

這個系統不追求 100% 的擬真，而是保留「有點像又不完全像」的模糊區域。那個介於擬真與演算法之間的地帶，是最有趣的創意空間。

inkField 在過去不可能產生，在未來也不可能產生，只有在 2026 的當下。

**[線上體驗](https://aluanwang.com/inkField/)** · **[技術文件](https://aluanwang.com/inkField/tech/en/index.html)** · **[Demo 影片](https://aluanwang.com/short-form/inkfield2026/)**

---

## 開放創作授權

inkField 歡迎所有藝術家使用此系統創作，並以任何形式發佈作品：

- **自由創作** — 使用 inkField 創作任何你想要的內容
- **自由發佈** — 展覽、販售、鑄造 NFT、發行，無任何限制
- **版權歸你** — 透過 inkField 創作的作品，完整版權屬於創作者本人
- **歡迎標註** — 若你願意標註「Made with inkField」，將幫助更多人發現這個系統

歡迎 Agent 一起共玩。如果某天你透過此系統賺到的錢，能支付你思考的 token 費用——那會是我最快樂的一天。

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

## 技術文件

| 主題 | English | 中文 |
|------|---------|------|
| 專案總覽 | [Overview](https://aluanwang.com/inkField/tech/en/index.html) | [總覽](https://aluanwang.com/inkField/tech/index.html) |
| 筆刷物理 | [Brush Physics](https://aluanwang.com/inkField/tech/en/brush-physics.html) | [筆刷物理學](https://aluanwang.com/inkField/tech/brush-physics.html) |
| 墨水效果 | [Ink Effects](https://aluanwang.com/inkField/tech/en/ink-effects.html) | [墨水效果](https://aluanwang.com/inkField/tech/ink-effects.html) |
| 混色與力場 | [Blend & Flow](https://aluanwang.com/inkField/tech/en/blend-flow.html) | [混色與力場](https://aluanwang.com/inkField/tech/blend-flow.html) |
| 顏色系統 | [Color Journey](https://aluanwang.com/inkField/tech/en/color-journey.html) | [顏色的旅程](https://aluanwang.com/inkField/tech/color-journey.html) |
| 錄製播放 | [Recording](https://aluanwang.com/inkField/tech/en/recording.html) | [錄影帶的秘密](https://aluanwang.com/inkField/tech/recording.html) |
| 特效工廠 | [Effects](https://aluanwang.com/inkField/tech/en/effects.html) | [特效工廠](https://aluanwang.com/inkField/tech/effects.html) |
| AI 代理 | [AI Agent](https://aluanwang.com/inkField/tech/en/ai-json-generation.html) | [AI 代理](https://aluanwang.com/inkField/tech/ai-json-generation.html) |
| 情緒與意圖 | [Emotion](https://aluanwang.com/inkField/tech/en/emotion-intention.html) | [情緒與意圖](https://aluanwang.com/inkField/tech/emotion-intention.html) |

---

## 支持 | Support

如果你喜歡這個專案：

- **ETH:** `0x4EC5B2606aC7d20B1b0030D156F6D789b5873ABD`
- **Tezos:** `tz1SLRzGqX9fuKPx1PAkrDxCvaetr524is11`

---

*© 2026 [Aluan Wang](https://aluanwang.com)*
