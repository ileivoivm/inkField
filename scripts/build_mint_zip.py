#!/usr/bin/env python3
"""
build_mint_zip.py — Package a minimal mint-ready InkField bundle.

Output: releases/inkfield-mint-vX.X.X.zip

Usage:
  python3 scripts/build_mint_zip.py 1.0.0
  python3 scripts/build_mint_zip.py            # auto-derive from latest git tag

What's inside the zip (everything a creator needs to mint on fxhash / objkt):
  index.html, script.js, shader.js, style.css, fxhash.min.js
  cursor-dot.png, cursor-cross.png
  lib/p5.js, lib/p5.easycam.js, lib/inconsolata.otf
  lib/*.json                (sample recordings — replace with your own)
  llms.txt                  (optional AI/agent context)
  README-MINT.md            (mint instructions)
  LICENSE                   (Open Creative License, if present)

Excluded (intentionally): gallery/, tech/, landscape.html, portrait.html,
  square.html, manifest*.json, sw.js, icon-*.png — none of these are needed
  to play the piece in fxhash sandbox.
"""

import hashlib
import os
import subprocess
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RELEASES = ROOT / "releases"

# Files relative to repo root that go into the zip
INCLUDE_FILES = [
    "index.html",
    "script.js",
    "shader.js",
    "style.css",
    "fxhash.min.js",
    "cursor-dot.png",
    "cursor-cross.png",
    "llms.txt",
    "README-MINT.md",
    "LICENSE",
]

# Whole directories to include (recursive)
INCLUDE_DIRS = [
    "lib",
]


def get_version() -> str:
    if len(sys.argv) > 1:
        return sys.argv[1].lstrip("v")
    try:
        tag = subprocess.check_output(
            ["git", "describe", "--tags", "--abbrev=0"],
            cwd=ROOT, stderr=subprocess.DEVNULL,
        ).decode().strip()
        return tag.lstrip("v") or "0.0.0"
    except Exception:
        return "0.0.0"


def add_file(zf: zipfile.ZipFile, abs_path: Path, arc_root: str) -> int:
    rel = abs_path.relative_to(ROOT)
    arcname = f"{arc_root}/{rel.as_posix()}"
    zf.write(abs_path, arcname)
    return abs_path.stat().st_size


def main() -> None:
    version = get_version()
    RELEASES.mkdir(exist_ok=True)
    zip_name = f"inkfield-mint-v{version}.zip"
    zip_path = RELEASES / zip_name
    arc_root = f"inkfield-mint-v{version}"

    if zip_path.exists():
        zip_path.unlink()

    total_bytes = 0
    file_count = 0

    print(f"[mint] packaging v{version} → {zip_path.name}")

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for name in INCLUDE_FILES:
            p = ROOT / name
            if p.exists():
                total_bytes += add_file(zf, p, arc_root)
                file_count += 1
                print(f"  + {name}")
            else:
                print(f"  - {name} (missing, skipped)")

        for d in INCLUDE_DIRS:
            base = ROOT / d
            if not base.exists():
                print(f"  - {d}/ (missing, skipped)")
                continue
            for fp in sorted(base.rglob("*")):
                if fp.is_file() and not fp.name.startswith("."):
                    total_bytes += add_file(zf, fp, arc_root)
                    file_count += 1
            print(f"  + {d}/ ({sum(1 for f in base.rglob('*') if f.is_file())} files)")

    # SHA256 checksum
    h = hashlib.sha256()
    with open(zip_path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    sha = h.hexdigest()
    sha_path = zip_path.with_suffix(".zip.sha256")
    sha_path.write_text(f"{sha}  {zip_name}\n")

    size_mb = zip_path.stat().st_size / (1024 * 1024)
    print()
    print(f"[mint] done — {file_count} files, {total_bytes/1024/1024:.2f} MB raw → {size_mb:.2f} MB zipped")
    print(f"[mint] zip:    {zip_path}")
    print(f"[mint] sha256: {sha}")
    print()
    print("Next steps:")
    print(f"  1. git tag v{version} && git push origin v{version}")
    print(f"  2. https://github.com/ileivoivm/inkField/releases/new?tag=v{version}")
    print(f"  3. Drag {zip_path.name} into the release attachments")


if __name__ == "__main__":
    main()
