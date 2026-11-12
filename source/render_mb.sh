#!/usr/bin/env bash
# Parallel motion-blurred render: render_mb.sh <film/index.html> <duration_s> <out.mp4> [workers=4] [fps=30]   (env VERT, MB, SHUTTER, QS as renderseg_mb.js)
set -euo pipefail
HTML="$1"; DUR="$2"; OUT="$3"; WK="${4:-4}"; FPS="${5:-30}"
HERE="$(cd "$(dirname "$0")" && pwd)"
TOTAL=$(python3 -c "print(round($DUR*$FPS))")
TMP="$(mktemp -d "${OUT%.mp4}.parts.XXXX")"
pids=()
for ((i=0; i<WK; i++)); do
  A=$(( TOTAL*i/WK )); B=$(( TOTAL*(i+1)/WK ))
  node "$HERE/renderseg_mb.js" "$HTML" $A $B "$TMP/$i.mp4" $FPS > "$TMP/$i.log" 2>&1 &
  pids+=($!)
done
fail=0; for p in "${pids[@]}"; do wait $p || fail=1; done
[ $fail = 0 ] || { echo "a worker failed:"; tail -n 5 "$TMP"/*.log; exit 1; }
if grep -l "PAGE ERROR" "$TMP"/*.log >/dev/null 2>&1; then echo "page errors:"; grep -h "PAGE ERROR" "$TMP"/*.log | sort | uniq -c | head; exit 1; fi
: > "$TMP/list.txt"; for ((i=0; i<WK; i++)); do echo "file '$i.mp4'" >> "$TMP/list.txt"; done
ffmpeg -loglevel error -y -f concat -safe 0 -i "$TMP/list.txt" -c copy "$OUT"
GOT=$(ffprobe -v error -count_packets -show_entries stream=nb_read_packets -of csv=p=0 "$OUT")
echo "frames: $GOT / $TOTAL"; [ "$GOT" = "$TOTAL" ] || { echo "FRAME COUNT MISMATCH"; exit 1; }
rm -rf "$TMP"
