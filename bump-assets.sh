#!/usr/bin/env bash
# Stamp local asset references (css, js, images) with a content hash so
# browsers fetch the new file instead of reusing a cached copy. GitHub Pages
# serves assets with Cache-Control: max-age=600, and images with no explicit
# cache header get heuristically cached for far longer than that.
# Run after changing anything in css/, js/ or assets/, before committing.
set -euo pipefail
cd "$(dirname "$0")"
python - <<'PY'
import io, re, hashlib, os

PAGES  = ["index.html", "privacy.html", "terms.html"]
# any local reference under these roots gets stamped
ROOTS  = ("css/", "js/", "assets/")
ATTR   = re.compile(r'(?P<attr>\b(?:href|src)=")(?P<path>(?:css|js|assets)/[^"?]+)(?:\?v=[0-9a-f]+)?(?P<end>")')

hashes, stamped, missing = {}, {}, set()

def h(path):
    if path not in hashes:
        if not os.path.isfile(path):
            missing.add(path); hashes[path] = None
        else:
            hashes[path] = hashlib.sha256(open(path, "rb").read()).hexdigest()[:8]
    return hashes[path]

for page in PAGES:
    if not os.path.isfile(page):
        continue
    s = io.open(page, encoding="utf-8").read()
    def sub(m):
        d = m.groupdict()
        v = h(d["path"])
        if v is None:
            return m.group(0)
        stamped[d["path"]] = v
        return "%s%s?v=%s%s" % (d["attr"], d["path"], v, d["end"])
    s2 = ATTR.sub(sub, s)
    if s2 != s:
        io.open(page, "w", encoding="utf-8", newline="").write(s2)

for p in sorted(stamped):
    print("  %-28s %s" % (p, stamped[p]))
if missing:
    print("  WARNING referenced but not on disk:")
    for p in sorted(missing):
        print("    %s" % p)
print("stamped %d asset(s) across %d page(s)" % (len(stamped), len(PAGES)))
PY
