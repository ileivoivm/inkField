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
├── fxhash.min.js           ← fxhash runtime stub
├── cursor-dot.png
├── cursor-cross.png
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

## Quick start: mint on fxhash

1. **Record your work** in the live InkField editor
   (https://ileivoivm.github.io/inkField/) and download the JSON.
2. **Replace** one of the files in `lib/` (e.g. `lib/1.json`) with your own
   recording — or add it as `lib/your-piece.json` and edit the loader entry
   in `index.html` if you need a custom slot.
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

objkt accepts a single HTML file or a zipped folder. The same zip you use
for fxhash works on objkt — just upload it through the objkt minter UI.

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
