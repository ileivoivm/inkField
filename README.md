# inkField | 墨域

> *"If one day the output is no longer the main thing, then maybe the breath the artist leaves inside the system will be the last thing we can still feel."*

inkField is a digital ink painting system built with WebGL / p5.js. It records every real gesture as JSON and replays them as a time-based sequence — what you see is not a static image, but a preserved moment in time.

A virtual spring connects the mouse to the brush: move fast and the spring stretches, the stroke thins; move slowly and the brush stabilizes, the stroke thickens. Ink never disappears — each frame, it drifts along force fields, as if someone is blowing across the paper. On every replay, the skeleton comes from real human movement, but edges, textures, and grain shift subtly — the skeleton stays the same, but the flow of breath is different every time.

The system does not aim for 100% realism. Instead, it preserves the ambiguous zone between "almost real" and "not quite" — the space between simulation and algorithm, where the most interesting creative possibilities live.

inkField could not have existed in the past, and will not exist in the future. It belongs only to this moment in 2026.

**[Live App](https://aluanwang.com/inkField/)** · **[Technical Docs](https://aluanwang.com/inkField/tech/en/index.html)** · **[Demo Video](https://aluanwang.com/short-form/inkfield2026/)**

---

## Open Creative License

inkField welcomes all artists to create with this system and publish their work in any form:

- **Create freely** — Use inkField to make anything you want
- **Publish freely** — Exhibit, sell, mint as NFT, distribute — no restrictions
- **You own it** — Full copyright of works created with inkField belongs to the creator
- **Credit welcome** — If you're willing to tag "Made with inkField", it helps others discover the system

Agents are welcome to play along. If one day the money you earn through this system covers the cost of the tokens you spent thinking — that would be my happiest day.

---

## Source Code

inkField is currently under active maintenance by the author. **The source code is not open at this time.**

When inkField is no longer actively maintained, the full source code will be released under an open-source license for the community to freely continue, modify, and develop.

---

## Deploy Your Work as an NFT

You can package your recorded painting as a standalone project and deploy it to NFT platforms such as [objkt](https://objkt.com/). Here's how:

### 1. Prepare your recording

Place your recorded JSON file into the `lib/` folder, named `demo.json`:

```
lib/demo.json
```

### 2. Switch to collector mode

Open `index.html` and find these two lines (around lines 44 and 61):

```javascript
let doDemo = false;            // ← change to true
window.APP_MODE = 'artist';    // ← change to 'collector'
```

Change them to:

```javascript
let doDemo = true;
window.APP_MODE = 'collector';
```

This makes the project automatically load `lib/demo.json` and begin playback on launch, while hiding all painting UI.

### 3. Package and upload

Compress the entire project folder into a `.zip` file and upload it to any platform that supports HTML/JS artworks (such as objkt). Your work will run automatically, replaying your ink strokes.

---

## Documentation

| Topic | English | 中文 |
|-------|---------|------|
| Overview | [Overview](https://aluanwang.com/inkField/tech/en/index.html) | [專案總覽](https://aluanwang.com/inkField/tech/index.html) |
| Brush Physics | [Brush Physics](https://aluanwang.com/inkField/tech/en/brush-physics.html) | [筆刷物理學](https://aluanwang.com/inkField/tech/brush-physics.html) |
| Ink Effects | [Ink Effects](https://aluanwang.com/inkField/tech/en/ink-effects.html) | [墨水效果](https://aluanwang.com/inkField/tech/ink-effects.html) |
| Blend & Flow | [Blend & Flow](https://aluanwang.com/inkField/tech/en/blend-flow.html) | [混色與力場](https://aluanwang.com/inkField/tech/blend-flow.html) |
| Color System | [Color Journey](https://aluanwang.com/inkField/tech/en/color-journey.html) | [顏色的旅程](https://aluanwang.com/inkField/tech/color-journey.html) |
| Recording | [Recording](https://aluanwang.com/inkField/tech/en/recording.html) | [錄影帶的秘密](https://aluanwang.com/inkField/tech/recording.html) |
| Effects | [Effects](https://aluanwang.com/inkField/tech/en/effects.html) | [特效工廠](https://aluanwang.com/inkField/tech/effects.html) |
| AI Agent | [AI Agent](https://aluanwang.com/inkField/tech/en/ai-json-generation.html) | [AI 代理](https://aluanwang.com/inkField/tech/ai-json-generation.html) |
| Emotion & Intention | [Emotion](https://aluanwang.com/inkField/tech/en/emotion-intention.html) | [情緒與意圖](https://aluanwang.com/inkField/tech/emotion-intention.html) |

---

## Support

If you enjoy this project:

- **ETH:** `0x4EC5B2606aC7d20B1b0030D156F6D789b5873ABD`
- **Tezos:** `tz1SLRzGqX9fuKPx1PAkrDxCvaetr524is11`

---

---

# inkField | 墨域（中文版）

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

## 支持

如果你喜歡這個專案：

- **ETH:** `0x4EC5B2606aC7d20B1b0030D156F6D789b5873ABD`
- **Tezos:** `tz1SLRzGqX9fuKPx1PAkrDxCvaetr524is11`

---

*© 2026 [Aluan Wang](https://aluanwang.com)*
