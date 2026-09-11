#!/usr/bin/env bash
# Stamp css/js links with a content hash so browsers pick up changes
# immediately instead of serving a stale copy for GitHub Pages' 10min TTL.
# Run this after editing css/style.css or js/main.js, before committing.
set -euo pipefail
cd "$(dirname "$0")"
css=$(sha256sum css/style.css | cut -c1-8)
js=$(sha256sum js/main.js   | cut -c1-8)
for f in index.html privacy.html terms.html; do
  [ -f "$f" ] || continue
  sed -i -E "s|href=\"css/style\.css(\?v=[0-9a-f]+)?\"|href=\"css/style.css?v=$css\"|g; \
             s|src=\"js/main\.js(\?v=[0-9a-f]+)?\"|src=\"js/main.js?v=$js\"|g" "$f"
done
echo "stamped css=$css js=$js"
