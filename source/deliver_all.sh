#!/usr/bin/env bash
# Mux the masters with the mixes and encode delivery copies (narrated: chat-size + HQ; music-only: chat-size, video stream reused).
set -euo pipefail
SK="${MOTION_SKILL_DIR:?set MOTION_SKILL_DIR to the folder that holds scripts/deliver.sh}"
OUT="${OUT:-../videos}"; mkdir -p "$OUT"
for o in 16x9 9x16; do
  bash $SK/scripts/deliver.sh master_$o.mp4 mix.wav "$OUT/stand-still-move-faster_$o" both
  mv "$OUT/stand-still-move-faster_${o}_chat.mp4" "$OUT/stand-still-move-faster_${o}.mp4"
  mv "$OUT/stand-still-move-faster_${o}_hq.mp4" "$OUT/stand-still-move-faster_${o}_HQ.mp4"
  ffmpeg -loglevel error -y -i "$OUT/stand-still-move-faster_${o}.mp4" -i mix_novo.wav -map 0:v -map 1:a -c:v copy -af "loudnorm=I=-14:TP=-1.0:LRA=11" -c:a aac -b:a 160k -ar 48000 -shortest -movflags +faststart "$OUT/stand-still-move-faster_${o}_music-only.mp4"
done
ls -la "$OUT"/*.mp4
