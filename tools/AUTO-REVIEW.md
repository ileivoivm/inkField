# Auto-Review Bot — Gallery 自動審核機器人

自動檢查 GitHub Issues 中的 gallery 投稿，下載 JSON、產生縮圖、重建 index、commit、push、關閉 issue。

---

## 架構

```
投稿者                           你的電腦（本地）
  │                                │
  │  1. 在 upload.html 填寫        │
  │  2. Submit via GitHub Issue    │
  │         ↓                      │
  │  GitHub Issue #N               │
  │  (label: gallery-submission)   │
  │         ↓                      │
  │         ↓  ← cron 每小時觸發 → │
  │                                │
  │                        auto-review.sh
  │                           ├─ gh issue list（找 open 投稿）
  │                           ├─ curl 下載 JSON → recordings/N.json
  │                           ├─ node snapshot.js → thumbs/N.png
  │                           ├─ python3 rebuild_index.py
  │                           ├─ git commit & push
  │                           └─ gh issue close + 留言通知
  │         ↓
  │  GitHub Pages 自動部署（1-2 分鐘）
  │         ↓
  └── 投稿者收到 issue 通知，作品上線
```

---

## 前置條件

| 項目 | 指令 | 說明 |
|------|------|------|
| Node.js | `node -v` | 需要 v18+ |
| puppeteer | `cd tools && npm install` | snapshot.js 的依賴 |
| gh CLI | `gh auth status` | 需要登入，有 repo 權限 |
| Python 3 | `python3 --version` | rebuild_index.py 需要 |
| Dev server | `npx serve -l 3000` | snapshot.js 需要本地 server |

---

## 檔案

| 路徑 | 用途 |
|------|------|
| `tools/auto-review.sh` | 主腳本，cron 呼叫這個 |
| `tools/auto-review.log` | 執行日誌（cron 自動寫入） |
| `tools/snapshot.js` | 產生縮圖（headless Chrome） |
| `gallery/scripts/rebuild_index.py` | 重建 index.json |

---

## 手動執行（測試用）

```bash
# 1. 先確認 dev server 在跑
npx serve -l 3000 &

# 2. 執行腳本
cd /Users/aluan/Documents/GitHub/inkField
bash tools/auto-review.sh
```

腳本會印出詳細日誌，包含每一步的狀態。

---

## 設定 cron（每小時自動執行）

```bash
crontab -e
```

加入這一行：

```cron
0 * * * * cd /Users/aluan/Documents/GitHub/inkField && bash tools/auto-review.sh >> tools/auto-review.log 2>&1
```

### cron 注意事項

- **電腦必須保持開機**，macOS 睡眠時 cron 不會執行
- **PATH 問題**：cron 環境的 PATH 很精簡，如果 `node`/`gh`/`python3` 找不到，在 crontab 最上面加：
  ```cron
  PATH=/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin
  ```
- **Dev server 必須持續執行**：沒有 server 時腳本會跳過縮圖，其他步驟照常進行
- 查看日誌：`tail -f tools/auto-review.log`

---

## 替代方案：launchd（macOS 原生）

macOS 推薦用 launchd 取代 cron，優點是電腦從睡眠醒來後會補跑錯過的排程。

### 1. 建立 plist

```bash
cat > ~/Library/LaunchAgents/com.inkfield.auto-review.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.inkfield.auto-review</string>

  <key>WorkingDirectory</key>
  <string>/Users/aluan/Documents/GitHub/inkField</string>

  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>tools/auto-review.sh</string>
  </array>

  <key>StartInterval</key>
  <integer>3600</integer>

  <key>StandardOutPath</key>
  <string>/Users/aluan/Documents/GitHub/inkField/tools/auto-review.log</string>
  <key>StandardErrorPath</key>
  <string>/Users/aluan/Documents/GitHub/inkField/tools/auto-review.log</string>

  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin</string>
  </dict>
</dict>
</plist>
EOF
```

### 2. 載入

```bash
launchctl load ~/Library/LaunchAgents/com.inkfield.auto-review.plist
```

### 3. 常用指令

```bash
# 查看狀態
launchctl list | grep inkfield

# 立即觸發一次
launchctl start com.inkfield.auto-review

# 停止排程
launchctl unload ~/Library/LaunchAgents/com.inkfield.auto-review.plist

# 查看日誌
tail -f tools/auto-review.log
```

---

## 處理流程細節

腳本對每一件 open 的 `gallery-submission` issue 做以下事情：

### Step 1 — 掃描
```
gh issue list --repo ileivoivm/inkField --label gallery-submission --state open
```

### Step 2 — 解析 issue body
- 抓 JSON 附件連結：`https://github.com/user-attachments/files/.../*.json`
- 讀取 metadata：Title、Author、Origin（Original / Fork of #N）

### Step 3 — 下載 JSON
```
curl -L -o gallery/recordings/{ID}.json {URL}
```
驗證 JSON 格式是否合法，不合法就跳過。

### Step 4 — 產生縮圖
```
node tools/snapshot.js gallery/recordings/{ID}.json gallery/thumbs/{ID}.png --max-size 512
```
snapshot.js 會自動根據 recording 長度計算 timeout（5 倍播放時長）。
之後用 `sips -Z 512` 壓縮到 512px。

### Step 5 — 重建 index.json
```
python3 gallery/scripts/rebuild_index.py
```
然後 patch title / author / date / forkedFrom。

### Step 6 — Commit & push
```
git commit -m "gallery: add #{ID} — {title} by {author} (closes #{issue})"
git push origin main
```

### Step 7 — 通知投稿者
```
gh issue comment {N} --body "Added! Live at .../view.html?id={ID}"
gh issue close {N}
```

---

## 安全機制

- **JSON 格式驗證**：下載後用 `JSON.parse()` 驗證，無效則跳過
- **空檔案檢查**：下載的檔案為空時跳過
- **Server 偵測**：localhost 沒有回應時跳過縮圖，不中斷其他步驟
- **set -euo pipefail**：任何指令失敗就中止，避免半成品
- **冪等性**：已關閉的 issue 不會被重複處理（只掃 state=open）

---

## 未來改進

- [ ] **Slack / Discord 通知**：處理完成後推送訊息
- [ ] **垃圾投稿過濾**：檢查 strokeCount < 3 或 durationSec < 5 自動拒絕
- [ ] **多人協作**：非 repo owner 的投稿加入人工審核佇列
- [ ] **SW 自動升版**：commit 時順便 bump sw.js 的 CACHE_VERSION
- [ ] **保持 server 常駐**：用 pm2 或 launchd 確保 localhost:3000 持續運行
