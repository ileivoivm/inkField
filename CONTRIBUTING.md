# Contributing to inkField

Thanks for wanting to help. The source code is not yet open (see
[LICENSE](LICENSE)), but there are three real ways to contribute —
and one of them already has a polished, no-code flow.

## 1. Submit a painting to the gallery (most common)

This is the contribution type we care about most. The gallery is the
heart of the project, and every recording adds a new path someone can
learn from or fork.

1. Paint and record in inkField:
   https://ileivoivm.github.io/inkField/?_artist:1
2. Click **SAVE** in the Brush Control panel — your browser downloads
   a `.json` file.
3. Open the submission page:
   https://ileivoivm.github.io/inkField/gallery/upload.html
4. Drop the JSON in to validate it, fill in title / author / tags,
   click **Generate metadata**.
5. Click **Submit via GitHub Issue** — a pre-filled GitHub form opens.
   **Drag the same JSON file into the issue text box**, then click
   Submit.

The maintainer reviews, generates a thumbnail with
[`tools/snapshot.js`](tools/snapshot.js), and publishes the work —
usually within a few days. You'll get a comment on your issue when
it goes live.

Full walkthrough with screenshots:
https://ileivoivm.github.io/inkField/gallery/help.html (EN / 中文).

## 2. Report bugs or propose features

Please file an issue at
https://github.com/ileivoivm/inkField/issues/new/choose and include:

- **What you tried** (URL, browser, device, steps).
- **What you expected** to happen.
- **What actually happened** (screenshots / console output if relevant).

For playback bugs, the JSON recording (or a link to
`gallery/view.html?id=N`) makes the report reproducible.

Gallery-related issues (missing thumbnail, wrong attribution,
takedown request) are also welcome here.

## 3. Help with documentation

Documentation lives in two places:

- [`tech/`](tech) — bilingual (EN / 中文) technical deep-dives on the
  rendering pipeline, brush physics, recording format, etc.
- [`README.md`](README.md) / [`readmeTW.md`](readmeTW.md) — project
  overview and user guides.

Corrections, translations, and clarifications are welcome as PRs to
`.md` / `.html` files under `tech/` and the repo root. These are the
only files we accept code-style pull requests for right now, since
the core [`script.js`](script.js) is not yet open.

## What we don't accept

- Redistribution of modified copies of the app.

## Maintainer contact

- Issues: https://github.com/ileivoivm/inkField/issues
- Email: ileivoivm@gmail.com

Thank you for being part of this.
