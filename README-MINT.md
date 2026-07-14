# InkField — Mint Bundle

This is a minimal, self-contained build of the InkField engine, ready to mint
on **fxhash**, **objkt**, or any platform that accepts a zipped HTML project.

You may paint, mint, sell, and own the work created with this engine —
full copyright is yours. See `LICENSE` (Open Creative License) for details.

---

## What's inside

```
inkfield-mint-vX.X.X/
├── index.html              ← entry point
├── script.js               ← engine (obfuscated)
├── shader.js               ← GLSL shaders (inlined)
├── style.css
├── assets/
│   ├── fxhash.min.js       ← fxhash runtime stub
│   ├── cursor-dot.png
│   └── cursor-cross.png
├── lib/
│   ├── p5.js
│   ├── p5.easycam.js
│   ├── inconsolata.otf
│   └── *.json              ← sample recordings (replace with your own)
├── llms.txt                ← AI/agent context
├── README-MINT.md          ← this file
└── LICENSE
```

The bundle is **fully offline** — no external CDNs, no network calls.

---

## Preview locally

Don't open `index.html` directly with `file://` — the engine loads JSON via
XHR and will be blocked. Start a local server from inside the bundle folder:

```
python3 -m http.server 8080
```

Then open a recording by its **hash**, not a path:

```
http://localhost:8080/#1      ← plays lib/1.json
http://localhost:8080/#5      ← plays lib/5.json
```

- The number after `#` is the recording id in `lib/` (`#1` → `lib/1.json`).
- Opening with **no `#`** plays `lib/0.json` (the default piece). To open the
  live drawing board (artist mode) instead, add `?_artist:1` to the URL.

---

## Quick start: mint on fxhash

1. **Record your work** in the live InkField editor
   (https://ileivoivm.github.io/inkField/) and download the JSON.
2. **Replace** one of the numbered files in `lib/` (e.g. `lib/1.json`) with
   your own recording, or save it under a new number (e.g. `lib/5.json`). The
   loader resolves recordings by their number via the URL hash — `#5` loads
   `lib/5.json` — so no code change is needed as long as you name the file
   with a plain integer.
3. **Re-zip** the folder (keep the `inkfield-mint-vX.X.X/` directory at the
   root of the zip — fxhash needs the `index.html` one level deep).
4. Open the **fxhash sandbox**: https://www.fxhash.xyz/sandbox/
5. **Drag your zip** into the sandbox.
6. Test that your piece plays correctly. Use the **fxhash params panel** to
   verify iteration variants if your piece has them.
7. When happy, click **Mint** and follow fxhash's flow.

> **Tip** — fxhash captures a static preview by reading the canvas at a
> specific moment. InkField has built-in capture support; the piece will
> automatically freeze on the final frame for fxhash to snapshot.

---

## Quick start: mint on objkt (Tezos)

objkt accepts a zipped folder. The same zip you use for fxhash works on
objkt — just upload it through the objkt minter UI.

---

## For agents

Read `llms.txt` first — it has the project overview, pipeline, and doc links.

To play a recording programmatically (no file upload needed):

```js
window.loadRecordingFromText(jsonString, { append: true })
```

The full JSON event format, the ~35 brush parameters, and the paste-to-play
DOM hooks (`#agent-json-textarea`, `#agent-json-submit`, `#agent-json-status`)
are documented in the `agent-api-spec` JSON block inside `index.html`, and in
the AI Agent guide linked from `llms.txt`.

---

## Engine version

Each build is tagged with an `engineVersion` signature in the form:

```
YYYY-MM-DD HH:MM:SS | commit: <short-hash>
```

You can find it in the HTML comment at the top of `index.html`. Recordings
made by future versions of InkField will embed this signature directly into
the JSON, so any minted piece can be traced back to the exact engine build
that produced it.

---

## License

This bundle is distributed under the **Open Creative License**. The short
version:

- ✅ You may paint, mint, sell, and own the works you create with InkField.
- ✅ Full copyright of the resulting artworks is yours.
- ❌ You may not redistribute the engine source code, fork it commercially,
  or rebrand it as your own product.
- ✅ The engine source will be fully released when the project is no longer
  actively maintained.

See `LICENSE` for the full text.

---

## Links

- **Live editor**: https://ileivoivm.github.io/inkField/
- **Gallery**: https://ileivoivm.github.io/inkField/gallery/
- **GitHub**: https://github.com/ileivoivm/inkField
- **Latest mint zip**: https://github.com/ileivoivm/inkField/releases/latest

---

*InkField — where humans and agents learn from each other.*
