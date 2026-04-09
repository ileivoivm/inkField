# InkField tools

Maintainer-side helpers. Not shipped to production.

## snapshot.js

Headless thumbnail generator. Loads a recording in headless Chromium,
waits for the `inkfield:playbackEnded` event (dispatched at the end of
`stopPlayback()` in `script.js`), then writes the canvas to PNG.

### One-time setup

```bash
cd tools
npm install        # installs puppeteer + bundled Chromium (~150MB)
```

### Usage

```bash
# Make sure dev server is running first
python3 scripts/dev_server.py 3000 &

# Then snapshot a recording
node tools/snapshot.js gallery/recordings/34.json gallery/thumbs/34.png

# Optional: resize to gallery convention (512px max edge)
sips -Z 512 gallery/thumbs/34.png --out gallery/thumbs/34.png
```

### Flags

| flag | default | meaning |
|---|---|---|
| `--port <n>` | `3000` | dev server port |
| `--base <url>` | `http://localhost:<port>/` | full base URL override |
| `--timeout <sec>` | `120` | global wallclock timeout |
| `--headful` | off | open visible Chromium for debugging |

### Exit codes

| code | meaning |
|---|---|
| 0 | ok |
| 2 | bad arguments / file not found |
| 3 | puppeteer not installed |
| 4 | global timeout |
| 5 | playback never finished |
| 6 | canvas read failed |
| 1 | other crash |

### How the bot would use it

```bash
# pseudocode for the future cron-driven submission processor
gh issue list -l gallery-submission --state open --json number,body |
  jq -r '.[] | [.number, (.body|capture("(?<u>https://github.com/user-attachments/files/[^)]+\\.json)").u // "")] | @tsv' |
  while IFS=$'\t' read -r num url; do
    [ -z "$url" ] && continue
    next=$(($(ls gallery/recordings/*.json | grep -oE '[0-9]+\.json$' | grep -oE '[0-9]+' | sort -n | tail -1) + 1))
    curl -sL -o gallery/recordings/$next.json "$url"
    node tools/snapshot.js gallery/recordings/$next.json gallery/thumbs/$next.png || continue
    sips -Z 512 gallery/thumbs/$next.png --out gallery/thumbs/$next.png
    python3 gallery/scripts/rebuild_index.py
    git add gallery/recordings/$next.json gallery/thumbs/$next.png gallery/recordings/index.json
    git commit -m "gallery: add #$next (closes #$num)"
    git push
  done
```
