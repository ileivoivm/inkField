#!/usr/bin/env python3
"""
dev_server.py — local static server with cache disabled.

Drop-in replacement for `python3 -m http.server`. Sends
`Cache-Control: no-store` on every response so the browser
never serves stale HTML/JS/JSON/images during development.

Usage (from repo root):
    python3 scripts/dev_server.py            # default port 3000
    python3 scripts/dev_server.py 8000       # custom port
"""

from __future__ import annotations

import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 3000


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    import os
    os.chdir(root)
    addr = ("", PORT)
    with ThreadingHTTPServer(addr, NoCacheHandler) as httpd:
        print(f"[dev_server] serving {root} at http://localhost:{PORT}/ (no-cache)")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[dev_server] stopped")


if __name__ == "__main__":
    main()
