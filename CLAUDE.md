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
lib/                # p5.js、easycam、JSON 錄製檔 (0-32.json)
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
- **Collector 模式**：透過 hash 訪問如 `/#1`（載入 lib/1.json），隱藏 UI，確定性重播

## 渲染管線（6 階段 shader 合成）

1. `newBufferBlack` — 使用者繪製的原始像素
2. `encode.frag` — 編碼筆觸顏色與元資料至 finalBuffer
3. `typeMapEncode.frag` — 寫入筆刷身份至 typeMapBuffer
4. `feedback.frag` — 即時墨水擴散效果（6 種模式）
5. `composite.frag` — 合成最終畫面輸出
6. `flow.frag` — 選擇性流場扭曲（兩遍渲染）

## 重要注意事項

- `script.js` 中的變數名稱經過系統性混淆（如 `_j0`, `_j422`），這是刻意設計
- JSON 錄製格式使用 seeded PRNG 確保確定性重播
- 修改 shader 時需同步更新 `shader.js` 中的嵌入字串
- 支援手機/平板自動適配（pixel density 自動降低）
- 技術文件位於 `tech/` 目錄，中英雙語維護
