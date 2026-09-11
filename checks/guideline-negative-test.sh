#!/usr/bin/env bash
# Five deliberate breakages, one at a time, each in a throwaway copy. The gate has to catch
# every one of them. Anything that comes back PASS here is a hole in the gate.
#
# The CSS lives in an inline <style> in each page, so the breakages are injected there —
# an earlier version of this script appended to a stylesheet the page does not load, and
# every "MISSED" it printed was a lie about the gate rather than a fact about it.
set -u
ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

inject () { # inject <css>
  perl -0pi -e "s{</style>}{$1</style>}" "$TMP/workshop/index.html"
}

run_case () {
  local name="$1"; shift
  rm -rf "$TMP"; mkdir -p "$TMP"
  cp -r "$ROOT/guideline/." "$TMP/"
  "$@"
  local out
  out=$(cd "$ROOT" && node checks/guideline.mjs --site "$TMP" 2>&1)
  if echo "$out" | grep -q '^FAIL'; then
    echo "  CAUGHT   $name"
    echo "$out" | grep -m2 '^  - ' | sed 's/^/           /'
  else
    echo "  MISSED   $name  <-- hole in the gate"
  fi
}

break_contrast () { inject 'p{color:#2a2d33 !important}'; }
break_alt ()      { perl -0pi -e 's/ alt="[^"]*"//' "$TMP/workshop/index.html"; }
break_image ()    { rm -f "$TMP/diagrams/01-the-loop.svg"; }
break_overflow () { inject '.wrap{min-width:1200px !important}'; }
break_empty ()    { printf '<!doctype html><title>x</title><body></body>' > "$TMP/workshop/index.html"; }

echo "Negative tests for checks/guideline.mjs"
run_case "text below 4.5:1"            break_contrast
run_case "alt attributes stripped"     break_alt
run_case "a diagram file deleted"      break_image
run_case "page scrolls sideways"       break_overflow
run_case "page emptied out"            break_empty

