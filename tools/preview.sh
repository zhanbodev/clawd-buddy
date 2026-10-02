#!/bin/sh
# Render every animation frame the mod draws into one PNG contact sheet, without starting
# Claude Code: rows are waiting, a click, think, read, bash and search (4 frames each), typing (16
# frames in a row, over two lines), then the party and fireworks celebrations. It draws
# exactly what the terminal would show, cell by cell from the quadrant characters and colors
# that gridRows() produces.
#
# Usage: tools/preview.sh [out.png]    (default: /tmp/clawd-frames.png)
set -e
root=$(cd "$(dirname "$0")/.." && pwd)
out=${1:-/tmp/clawd-frames.png}
tmp=$(mktemp -t clawd-preview).mjs
# The hooks module's drawing functions aren't exported, so the sheet script is appended to a copy
sed 's/^export function register/function register/' "$root/hooks/register.js" > "$tmp"
cat "$root/tools/preview-sheet.mjs" >> "$tmp"
node "$tmp" "$out"
rm -f "$tmp"
echo "$out"
