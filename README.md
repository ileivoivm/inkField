# inkField | 墨域

> *"If one day the output is no longer the main thing, then maybe the breath the artist leaves inside the system will be the last thing we can still feel."*

inkField is a digital ink painting system built with WebGL / p5.js. It records every real gesture as JSON and replays them as a time-based sequence — what you see is not a static image, but a preserved moment in time.

**inkField is free to use, not yet open source.**

You can paint, mint, sell — full copyright is yours. Source code will be fully released when the project is no longer actively maintained.

**Watch:** https://ileivoivm.github.io/inkField/
**Paint:** https://ileivoivm.github.io/inkField/?_artist:1

---

## Open Creative License

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

## URL Parameters

inkField uses URL query parameters and hash fragments to control display modes and rendering options.

**Format:** `?_key1:value_key2:value` — parameters are separated by `_`, with key and value joined by `:`.

### Mode

| Parameter | Example | Description |
|-----------|---------|-------------|
| `_artist:1` | `?_artist:1` | Force artist mode (full drawing UI) |
| `#N` | `/#5` | Collector mode — load and replay `lib/5.json` |

### Canvas Size & Density

| Parameter | Example | Description |
|-----------|---------|-------------|
| `w` | `?_w:1200` | Canvas width in pixels |
| `h` | `?_h:800` | Canvas height in pixels |
| `pix` | `?_pix:2.0` | Pixel density (0.5–5, default 2 for collector) |

### Panel Toggles

| Parameter | Value | Description |
|-----------|-------|-------------|
| `camera` | `0` / `1` | Camera movement |
| `paper` | `0` / `1` | Paper texture overlay |
| `grid` | `0` / `1` | Grid overlay |
| `path` | `0` / `1` | Future path preview |
| `console` | `0` / `1` | On-screen text |
| `loop` | `0` / `1` | Loop playback |

### Post-Processing Effects

| Parameter | Value | Description |
|-----------|-------|-------------|
| `rs` | `0` / `1` | RS effect |
| `distort` | `0` / `1` | Distort shader |
| `cl` | `0` / `1` | Cellular effect |
| `wd` | `0` / `1` | White dot overlay |
| `gr` | `0` / `1` | Grain overlay |

### fxhash Integration

| Parameter | Example | Description |
|-----------|---------|-------------|
| `fxhash` | `?fxhash=oo...` | fxhash seed — auto-enters collector mode |
| `fxiteration` | `?fxiteration=5` | Load specific iteration (`lib/5.json`) |
| `fxcontext` | `?fxcontext=fast-capture` | Capture context (GPU off, auto-screenshot) |

### Examples

```
# Artist mode, custom canvas size
?_artist:1_w:1200_h:800

# Collector mode, replay artwork #3
/#3

# Custom toggles: camera off, grid on, paper texture off
?_camera:0_paper:0_grid:1

# Full combo: custom size, pixel density, effects
?_w:1000_h:1000_pix:2.0_camera:1_rs:0_grid:1_path:0
```

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

- **ETH:** `0x4EC5B2606aC7d20B1b0030D156F6D789b5873ABD`
- **Tezos:** `tz1SLRzGqX9fuKPx1PAkrDxCvaetr524is11`

---

---

# inkField | 墨域（中文版）

> *「如果有一天輸出不再重要，那麼藝術家留在系統裡的那口氣，也許就是唯一還能被感受到的東西。」*

inkField 是一套以 WebGL / p5.js 構建的數位水墨繪畫系統。它將每一次真實手勢記錄為 JSON，並以時間序列重播——你看到的不是一張圖，而是一段被保存下來的時間。

**inkField 免費使用，尚未開源。**

你可以繪畫、鑄造、販售——完整版權歸你所有。當專案不再積極維護時，原始碼將完整開源釋出。

**觀看：** https://ileivoivm.github.io/inkField/
**繪畫：** https://ileivoivm.github.io/inkField/?_artist:1

---

## 開放創作授權

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

## Acknowledgments

The Spectral blend mode is built upon:

- **[spectral.js](https://github.com/rvanwijnen/spectral.js)** by Ronald van Wijnen (MIT License) — Kubelka-Munk spectral mixing theory and 38-band reflectance data
- **[p5.brush](https://github.com/acamposuribe/p5.brush)** by Alejandro Campos (MIT License) — inspiration for integrating spectral mixing into a painting shader pipeline

---

## 支持

- **ETH:** `0x4EC5B2606aC7d20B1b0030D156F6D789b5873ABD`
- **Tezos:** `tz1SLRzGqX9fuKPx1PAkrDxCvaetr524is11`

---

*© 2026 [Aluan Wang](https://aluanwang.com)*
