# InkField tools

Maintainer-side helpers for processing Gallery submissions. **Not shipped to production** — these scripts run locally on the maintainer's machine and are excluded from the mint bundle.

## What's in here

| File | Purpose |
|---|---|
| `snapshot.js` | Headless thumbnail generator — turns a recording JSON into a PNG without anyone having to open a browser and screenshot it. |
| `package.json` | Pins puppeteer + bundled Chromium for `snapshot.js`. |

---

## Why `snapshot.js` exists

When someone submits a work via the [upload page](https://ileivoivm.github.io/inkField/gallery/upload.html), the maintainer ends up with a `.json` recording attached to a GitHub issue. To put it in the gallery, every work also needs a 512×512 thumbnail (`gallery/thumbs/<id>.png`).

Before this tool: open the work in a browser, wait for the painting to finish playing, take a screenshot, crop, save. ~2 minutes per submission, easy to mess up.

With this tool: one command reads the JSON, plays it back in headless Chromium, waits for the `inkfield:playbackEnded` event (dispatched at the end of `stopPlayback()` in `script.js`), then writes the canvas to a PNG. Deterministic, scriptable, ~30 seconds per submission.

---

## One-time setup

```bash
cd tools
npm install        # installs puppeteer + bundled Chromium (~150 MB)
```

You only need to do this once per machine. The download is cached under `tools/node_modules/`.

---

## Usage

`snapshot.js` needs the InkField dev server running so it can load `index.html` with a recording.

```bash
# 1. Start the dev server (in the repo root, leave it running)
python3 scripts/dev_server.py 3000 &

# 2. Snapshot a recording
node tools/snapshot.js gallery/recordings/35.json gallery/thumbs/35.png

# 3. Resize to gallery convention (512px max edge)
sips -Z 512 gallery/thumbs/35.png --out gallery/thumbs/35.png
```

Output looks like:

```
[browser:log] 🎬 playback [stroke 13/13] | Draw: 73 | Seed: 24412
[snapshot] ok: gallery/thumbs/35.png (1149.8KB, 1200x500@2x)
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
| 3 | puppeteer not installed (run `npm install`) |
| 4 | global timeout (recording too long? bump `--timeout`) |
| 5 | playback never finished (recording corrupt or `inkfield:playbackEnded` not dispatched) |
| 6 | canvas read failed |
| 1 | other crash |

---

## End-to-end: processing a Gallery submission

The full maintainer flow when a `gallery-submission` issue arrives. See [`gallery/MAINTAINER.md`](../gallery/MAINTAINER.md) for the human walkthrough; this is the scripted version.

```bash
# Find the submission's JSON attachment URL from the issue body, then:
ISSUE=4
NEXT=$(($(ls gallery/recordings/*.json | grep -oE '[0-9]+\.json$' | grep -oE '[0-9]+' | sort -n | tail -1) + 1))

# 1. Download the attached JSON
curl -sL -o gallery/recordings/$NEXT.json "<attachment-url>"

# 2. Generate the thumbnail (dev server must be running on :3000)
node tools/snapshot.js gallery/recordings/$NEXT.json gallery/thumbs/$NEXT.png
sips -Z 512 gallery/thumbs/$NEXT.png --out gallery/thumbs/$NEXT.png

# 3. Rebuild the gallery index
python3 gallery/scripts/rebuild_index.py

# 4. Commit + push (closes the issue automatically)
git add gallery/recordings/$NEXT.json gallery/thumbs/$NEXT.png gallery/recordings/index.json
git commit -m "gallery: add #$NEXT (closes #$ISSUE)"
git push
```

---

## Future automation

A cron-driven submission processor could run this flow on a schedule, looping over open `gallery-submission` issues. Sketch:

```bash
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

Not wired up yet — the maintainer reviews submissions by hand for now to catch spam and to title/tag works correctly.
