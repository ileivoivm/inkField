# InkField Gallery — Maintainer Guide

This document is for **you** (aluan / the gallery owner). It explains exactly
what to do when someone submits a work via the
[upload page](https://ileivoivm.github.io/inkField/gallery/upload.html).

There are two paths a submitter might take:
1. **GitHub Issue** (the easy path — most submissions will come this way)
2. **Pull Request** (advanced users who already know git)

Both end at the same place: a JSON file in `gallery/recordings/`, a thumbnail
in `gallery/thumbs/`, and an entry in `gallery/recordings/index.json`.

---

## Path 1 — Receiving a GitHub Issue submission

### What you'll see

A new issue appears at https://github.com/ileivoivm/inkField/issues with:
- **Label**: `gallery-submission`
- **Title**: `Gallery submission: <title>`
- **Body**: Pre-filled metadata + a JSON file attached (the submitter dragged it
  into the issue text box, so it shows up as a GitHub-hosted link like
  `https://github.com/.../files/.../my-painting.json`)

### Step-by-step processing (5 minutes)

#### 1. Open the issue and read the metadata

Look at the auto-generated `metadata` JSON block. Verify:
- `engineVersion` is present (real submissions will have it; legacy ones won't)
- `strokeCount`, `durationSec`, `brushModesUsed` look reasonable
- The submitter's title and author make sense

If the submission looks like spam or test garbage, just close the issue with
a comment. No further action needed.

#### 2. Download the attached JSON file

Right-click the JSON link in the issue body → **Save link as…** →
save to your Desktop or any temp location.

> **Tip**: You can also use `curl -L -o downloaded.json <link>` from terminal.

#### 3. Pick an `id` for the new work

The gallery uses simple integer IDs: `1.json`, `2.json`, … `32.json`.
The next free number is the highest existing one + 1.

Quick check from terminal:
```bash
cd /Users/aluan/Documents/GitHub/inkField
ls gallery/recordings/*.json | grep -oE '[0-9]+\.json' | sort -n | tail -5
```

Then the new `id` is the last number + 1 (e.g. `33`).

#### 4. Drop the JSON into `gallery/recordings/`

```bash
mv ~/Desktop/downloaded.json /Users/aluan/Documents/GitHub/inkField/gallery/recordings/33.json
```

#### 5. Generate a thumbnail

**推薦方式 — 用 `snapshot.js` 自動截圖**

確保 dev server 在跑（`python3 -m http.server 3000`），然後：

```bash
cd /Users/aluan/Documents/GitHub/inkField
node tools/snapshot.js gallery/recordings/33.json gallery/thumbs/33.png --max-size 512
```

- 預設 **headful**（有畫面的 Chrome），不要加 `--headless`
- `pix:0.5` 已是預設值，GPU flags 已內建，不需額外設定
- 如果縮圖全黑或渲染異常，確認 Chrome 有開 GPU 加速

**備用方式 — 提交者附上 PNG**

如果提交者一起附了 `.png`，直接用：
```bash
sips -Z 512 ~/Desktop/their-image.png --out gallery/thumbs/33.png
```

#### 6. Rebuild `index.json`

The repo doesn't have a committed builder script (we used `/tmp/build_gallery_index.py`
during seeding). The script lives at `gallery/scripts/rebuild_index.py` —
just run it:

```bash
cd /Users/aluan/Documents/GitHub/inkField
python3 gallery/scripts/rebuild_index.py
```

It scans every `gallery/recordings/N.json` and regenerates the full
`index.json` with stats and engine versions. Output looks like:
```
[ok] 33: 47 strokes, 92s, brushes=[1, 4]
[done] 33 items -> gallery/recordings/index.json
```

> **Note**: After the rebuild, open `index.json` and find your new entry.
> Replace the auto-generated fields if needed:
> - `title` — copy from the submission's metadata
> - `author` — copy from the submission's metadata
> - `tags` — copy from the submission, default to `["seed"]`
> - `engineVersion` — keep what the JSON contained, otherwise the rebuild script
>   uses the current pinned default
>
> The script uses sensible defaults but the submitter's title/author/tags
> need to be preserved by hand for now (until the rebuild script reads
> per-file overrides — see TODO below).

#### 7. Test locally

Open the gallery in your browser (no local server needed — it's static):

```bash
open /Users/aluan/Documents/GitHub/inkField/gallery/index.html
```

Click your new card and verify:
- Thumbnail loads
- Title / author / engineVersion show
- The view page loads and the painting plays

#### 8. Commit and push

```bash
cd /Users/aluan/Documents/GitHub/inkField
git add gallery/recordings/33.json gallery/thumbs/33.png gallery/recordings/index.json
git commit -m "gallery: add #33 — <title> by <author> (closes #<issue-number>)"
git push
```

Using `closes #<issue-number>` in the commit message will **automatically close
the GitHub issue** when the push lands. 🎉

#### 9. Comment on the issue (optional but kind)

```
Added! Live at https://ileivoivm.github.io/inkField/gallery/view.html?id=33

Thank you for sharing — beautiful work.
```

GitHub Pages takes ~1-2 minutes to redeploy, so wait a bit before sharing the link.

---

## Path 2 — Receiving a Pull Request

For users who already know git, they may submit a full PR with the JSON,
thumbnail, and `index.json` patch already in place.

Your job:
1. Pull the branch locally
2. Run `python3 gallery/scripts/rebuild_index.py` (the PR's `index.json` patch
   may have stale fields — the rebuild ensures consistency)
3. Open the gallery and test
4. Merge and push

If the PR is clean and the submitter clearly knows what they're doing,
you can also just merge directly from the GitHub UI.

---

## TODO / Future improvements

- [ ] **Auto-rebuild on push** — GitHub Action that runs `rebuild_index.py`
  whenever `gallery/recordings/*.json` changes
- [ ] **Per-file metadata overrides** — store title/author/tags inside the JSON
  itself (e.g. `data.galleryMeta = {title, author, tags}`) so the rebuild
  script preserves them automatically
- [x] **Auto-thumbnail** — `tools/snapshot.js` 已支援，見步驟 5
- [ ] **Submission template** — `.github/ISSUE_TEMPLATE/gallery-submission.yml`
  to standardize the issue format and add required fields
- [ ] **engineVersion auto-tag** — once `js/recording.js` writes `engineVersion`
  into every new recording (already implemented in BrushResearch repo,
  pending next build), all new submissions will auto-include it. Until then,
  legacy JSONs need manual tagging.

---

## Quick reference: file layout

```
gallery/
├── index.html              ← landing page (gallery grid)
├── upload.html             ← submission page
├── view.html               ← single-work viewer
├── MAINTAINER.md           ← this file
├── js/
│   ├── gallery.js          ← grid renderer
│   └── validator.js        ← JSON validator (shared with upload page)
├── recordings/
│   ├── index.json          ← master metadata array (auto-generated)
│   ├── 1.json              ← seed work #1
│   ├── 2.json
│   └── ...
├── thumbs/
│   ├── 1.png               ← 512px thumbnails
│   ├── 2.png
│   └── ...
└── scripts/
    └── rebuild_index.py    ← regenerate index.json from all *.json files
```

---

*InkField Gallery — where humans and agents learn from each other.*
