#!/usr/bin/env python3
"""
rebuild_index.py — regenerate gallery/recordings/index.json from all *.json files.

Scans every numeric-named recording (1.json, 2.json, ...) in gallery/recordings/,
extracts stats (stroke count, duration, brushes used, engineVersion, etc.) and
writes a fresh index.json.

Run after dropping a new submission into gallery/recordings/.

Usage:
    cd /Users/aluan/Documents/GitHub/inkField
    python3 gallery/scripts/rebuild_index.py

The script preserves per-file overrides if you've manually edited title/author/tags
inside an item — see MAINTAINER.md for details.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Optional

GALLERY = Path(__file__).resolve().parent.parent
REC_DIR = GALLERY / "recordings"

# Default engine version stamp for legacy JSONs that don't carry their own
DEFAULT_ENGINE = "2026-04-09 13:01:57 | commit: 152ba69"


def parse_recording(fp: Path) -> Optional[dict]:
    rid = fp.stem
    try:
        data = json.loads(fp.read_text())
    except Exception as e:
        print(f"[skip] {fp.name}: {e}")
        return None

    events = data.get("events", [])
    canvas = data.get("canvasSize", {"width": 0, "height": 0})

    # mtime stamps for cache-busting (永久有效，因為 URL 本身會變)
    json_mtime = int(fp.stat().st_mtime)
    thumb_path = GALLERY / "thumbs" / f"{rid}.png"
    thumb_mtime = int(thumb_path.stat().st_mtime) if thumb_path.exists() else json_mtime

    stroke_count = md_count = flow_count = bite_count = mask_count = 0
    brush_modes = set()
    brush_color_modes = set()
    last_t = 0

    for ev in events:
        if not isinstance(ev, dict):
            continue
        t = ev.get("t")
        if isinstance(t, (int, float)) and t > last_t:
            last_t = t
        m = ev.get("m")
        if m == "mp":
            stroke_count += 1
            sd = ev.get("strokeData") or {}
            if "brushMode" in sd:
                brush_modes.add(sd["brushMode"])
            if "brushColorMode" in sd:
                brush_color_modes.add(sd["brushColorMode"])
        elif m == "md":
            md_count += 1
        elif m == "flow":
            flow_count += 1
        elif m == "bite":
            bite_count += 1
        elif m == "mask":
            mask_count += 1

    # Engine version: prefer the JSON's own field, fall back to default
    engine_version = (
        data.get("engineVersion")
        or data.get("engineSignature")
        or data.get("inkfieldVersion")
        or data.get("recordingEngine")
        or DEFAULT_ENGINE
    )

    return {
        "id": rid,
        "title": f"InkField #{rid}",
        "author": "aluan",
        "date": "2026-03-31",
        "engineVersion": engine_version,
        "canvasSize": {"width": canvas.get("width", 0), "height": canvas.get("height", 0)},
        "strokeCount": stroke_count,
        "durationSec": round(last_t / 1000),
        "brushModesUsed": sorted(brush_modes),
        "brushColorModesUsed": sorted(brush_color_modes),
        "flowCount": flow_count,
        "biteCount": bite_count,
        "maskCount": mask_count,
        "tags": ["seed"],
        "thumbnail": f"./thumbs/{rid}.png?v={thumb_mtime}",
        "jsonPath": f"./recordings/{rid}.json?v={json_mtime}",
    }


def merge_with_existing(new_item: dict, existing_items: list) -> dict:
    """Preserve manually-edited fields (title/author/tags/date) from old index.json."""
    rid = new_item["id"]
    for old in existing_items:
        if old.get("id") == rid:
            # Keep human-curated fields
            for key in ("title", "author", "tags", "date"):
                if key in old:
                    new_item[key] = old[key]
            break
    return new_item


def main() -> None:
    if not REC_DIR.exists():
        print(f"[error] {REC_DIR} does not exist")
        return

    # Load existing index.json so we can preserve manually-edited title/author/tags
    index_path = REC_DIR / "index.json"
    existing_items = []
    if index_path.exists():
        try:
            existing_items = json.loads(index_path.read_text()).get("items", [])
        except Exception:
            pass

    files = sorted(
        [p for p in REC_DIR.glob("*.json") if p.stem.isdigit()],
        key=lambda p: int(p.stem),
    )

    items = []
    for fp in files:
        item = parse_recording(fp)
        if item is None:
            continue
        item = merge_with_existing(item, existing_items)
        items.append(item)
        print(
            f"[ok] {item['id']}: {item['strokeCount']} strokes, "
            f"{item['durationSec']}s, brushes={item['brushModesUsed']}"
        )

    index = {
        "version": "1.0",
        "updated": "2026-04-09",
        "items": items,
    }
    index_path.write_text(json.dumps(index, indent=2, ensure_ascii=False))
    print(f"\n[done] {len(items)} items -> {index_path}")


if __name__ == "__main__":
    main()
