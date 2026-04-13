#!/bin/bash
# auto-review.sh — 自動審核 gallery 投稿
#
# 每小時由 cron 執行一次，檢查 GitHub Issues 中的投稿，
# 自動下載 JSON、產生縮圖、重建 index、commit、push、關閉 issue。
#
# 前提：
#   1. localhost:3000 已啟動（serve 或 python3 -m http.server）
#   2. gh CLI 已登入
#   3. puppeteer 已安裝（cd tools && npm install）
#
# 用法：
#   bash tools/auto-review.sh          # 手動執行
#   crontab -e  →  0 * * * * cd /Users/aluan/Documents/GitHub/inkField && bash tools/auto-review.sh >> tools/auto-review.log 2>&1

set -euo pipefail

REPO="ileivoivm/inkField"
PROJECT_DIR="/Users/aluan/Documents/GitHub/inkField"
PORT=3000
RECORDINGS_DIR="$PROJECT_DIR/gallery/recordings"
THUMBS_DIR="$PROJECT_DIR/gallery/thumbs"

cd "$PROJECT_DIR"

echo ""
echo "========================================"
echo "[auto-review] $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"

# ── 1. 檢查是否有 open 的 gallery-submission issue ──
ISSUES=$(gh issue list --repo "$REPO" --label "gallery-submission" --state open --json number,title,body --limit 10 2>/dev/null || echo "[]")
COUNT=$(echo "$ISSUES" | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8');console.log(JSON.parse(d).length)")

if [ "$COUNT" -eq 0 ]; then
  echo "[auto-review] 沒有新投稿，結束。"
  exit 0
fi

echo "[auto-review] 發現 $COUNT 件投稿"

# ── 2. 找出下一個可用的 ID ──
next_id() {
  local max=0
  for f in "$RECORDINGS_DIR"/[0-9]*.json; do
    [ -f "$f" ] || continue
    local n=$(basename "$f" .json)
    # 跳過 index.json
    [[ "$n" =~ ^[0-9]+$ ]] || continue
    [ "$n" -gt "$max" ] && max="$n"
  done
  echo $((max + 1))
}

# ── 3. 確認 dev server 在跑 ──
check_server() {
  if ! curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/" | grep -q "200"; then
    echo "[auto-review] ⚠️  localhost:$PORT 沒有回應，跳過縮圖產生。"
    return 1
  fi
  return 0
}

SERVER_OK=true
check_server || SERVER_OK=false

# ── 4. 逐件處理 ──
echo "$ISSUES" | node -e "
  const issues = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  issues.forEach(i => console.log(JSON.stringify(i)));
" | while IFS= read -r issue_json; do

  ISSUE_NUM=$(echo "$issue_json" | node -e "console.log(JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).number)")
  ISSUE_TITLE=$(echo "$issue_json" | node -e "console.log(JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).title)")
  ISSUE_BODY=$(echo "$issue_json" | node -e "console.log(JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).body)")

  echo ""
  echo "── Issue #$ISSUE_NUM: $ISSUE_TITLE ──"

  # 4a. 從 issue body 抓 JSON 附件連結
  JSON_URL=$(echo "$ISSUE_BODY" | grep -oE 'https://github\.com/user-attachments/files/[0-9]+/[^ )]+\.json' | head -1 || true)

  if [ -z "$JSON_URL" ]; then
    echo "[auto-review] ⚠️  Issue #$ISSUE_NUM 沒有找到 JSON 附件連結，跳過。"
    continue
  fi

  # 4b. 從 metadata 讀取 title / author / date
  META_TITLE=$(echo "$ISSUE_BODY" | grep -oP '\*\*Title:\*\* \K.*' | head -1 || echo "Untitled")
  META_AUTHOR=$(echo "$ISSUE_BODY" | grep -oP '\*\*Author:\*\* \K.*' | head -1 || echo "anonymous")
  META_ORIGIN=$(echo "$ISSUE_BODY" | grep -oP '\*\*Origin:\*\* \K.*' | head -1 || echo "Original")
  TODAY=$(date '+%Y-%m-%d')

  # 4c. 決定 ID
  NEW_ID=$(next_id)
  echo "[auto-review] 分配 ID: $NEW_ID"

  # 4d. 下載 JSON
  echo "[auto-review] 下載 JSON: $JSON_URL"
  curl -L -s -o "$RECORDINGS_DIR/$NEW_ID.json" "$JSON_URL"

  if [ ! -s "$RECORDINGS_DIR/$NEW_ID.json" ]; then
    echo "[auto-review] ❌ JSON 下載失敗或檔案為空，跳過。"
    rm -f "$RECORDINGS_DIR/$NEW_ID.json"
    continue
  fi

  # 驗證 JSON 格式
  if ! node -e "JSON.parse(require('fs').readFileSync('$RECORDINGS_DIR/$NEW_ID.json','utf8'))" 2>/dev/null; then
    echo "[auto-review] ❌ JSON 格式無效，跳過。"
    rm -f "$RECORDINGS_DIR/$NEW_ID.json"
    continue
  fi

  echo "[auto-review] ✅ JSON 已存放至 recordings/$NEW_ID.json"

  # 4e. 產生縮圖
  if [ "$SERVER_OK" = true ]; then
    echo "[auto-review] 產生縮圖..."
    if node tools/snapshot.js "$RECORDINGS_DIR/$NEW_ID.json" "$THUMBS_DIR/$NEW_ID.png" --max-size 512 --port "$PORT" 2>&1 | tail -3; then
      echo "[auto-review] ✅ 縮圖已產生 thumbs/$NEW_ID.png"
    else
      echo "[auto-review] ⚠️  縮圖產生失敗，繼續處理（無縮圖）。"
    fi
  else
    echo "[auto-review] ⚠️  跳過縮圖（server 未啟動）"
  fi

  # 4f. 重建 index.json
  echo "[auto-review] 重建 index.json..."
  python3 gallery/scripts/rebuild_index.py 2>&1 | tail -3

  # 4g. 更新 index.json 中的 title / author / date
  node -e "
    const fs = require('fs');
    const p = '$RECORDINGS_DIR/index.json';
    const idx = JSON.parse(fs.readFileSync(p, 'utf8'));
    const item = idx.items.find(i => i.id === '$NEW_ID');
    if (item) {
      item.title = $(node -e "console.log(JSON.stringify('$META_TITLE'))");
      item.author = $(node -e "console.log(JSON.stringify('$META_AUTHOR'))");
      item.date = '$TODAY';
      fs.writeFileSync(p, JSON.stringify(idx, null, 2) + '\n');
      console.log('[auto-review] ✅ index.json 已更新 title/author/date');
    }
  "

  # 4h. 處理 forkedFrom
  if echo "$META_ORIGIN" | grep -qi "fork"; then
    FORK_SOURCE=$(echo "$META_ORIGIN" | grep -oE '[0-9]+' | head -1 || true)
    if [ -n "$FORK_SOURCE" ]; then
      node -e "
        const fs = require('fs');
        const p = '$RECORDINGS_DIR/index.json';
        const idx = JSON.parse(fs.readFileSync(p, 'utf8'));
        const item = idx.items.find(i => i.id === '$NEW_ID');
        if (item) {
          item.forkedFrom = '$FORK_SOURCE';
          fs.writeFileSync(p, JSON.stringify(idx, null, 2) + '\n');
          console.log('[auto-review] ✅ 設定 forkedFrom: $FORK_SOURCE');
        }
      "
    fi
  fi

  # 4i. Commit & push
  echo "[auto-review] 提交..."
  git add "$RECORDINGS_DIR/$NEW_ID.json" "$RECORDINGS_DIR/index.json"
  [ -f "$THUMBS_DIR/$NEW_ID.png" ] && git add "$THUMBS_DIR/$NEW_ID.png"

  git commit -m "gallery: add #$NEW_ID — $META_TITLE by $META_AUTHOR (closes #$ISSUE_NUM)"
  git push origin main

  echo "[auto-review] ✅ 已推送至 main"

  # 4j. 在 issue 留言並關閉
  gh issue comment "$ISSUE_NUM" --repo "$REPO" --body "Added! 🎉 Live at https://ileivoivm.github.io/inkField/gallery/view.html?id=$NEW_ID

Thank you for sharing your creative path.

---
*Processed automatically by auto-review bot.*"

  # commit message 裡的 closes #N 應該已經自動關閉了，但保險起見：
  gh issue close "$ISSUE_NUM" --repo "$REPO" 2>/dev/null || true

  echo "[auto-review] ✅ Issue #$ISSUE_NUM 已關閉"
  echo ""

done

echo "[auto-review] 全部處理完成。"
