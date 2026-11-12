# Stand still. Move faster.

A 76-second motion-graphics explainer about the Holborn escalator experiment: on a tall escalator, asking everyone to stand on both sides moves a crowd faster than keeping a walking lane open.

## Videos

All are 1080p, 30 fps, H.264 + AAC, 76 seconds.

| File | What it is |
|---|---|
| `videos/stand-still-move-faster_16x9.mp4` | Landscape, with narration (28 MB) |
| `videos/stand-still-move-faster_9x16.mp4` | Vertical short, with narration (28 MB) |
| `videos/stand-still-move-faster_16x9_HQ.mp4` | Landscape, higher bitrate for uploading (90 MB) |
| `videos/stand-still-move-faster_9x16_HQ.mp4` | Vertical, higher bitrate for uploading (90 MB) |
| `videos/stand-still-move-faster_16x9_music-only.mp4` | Landscape, music and effects only |
| `videos/stand-still-move-faster_9x16_music-only.mp4` | Vertical, music and effects only |

The vertical version is a separate layout of the same film, not a crop.

## Narration

`narration-script.txt` holds the narration as recorded, with the start and end time of each line and the changes made to the supplied transcript. The voice is synthetic.

## Source

Everything on screen is code, so the film can be re-rendered at any time.

- `source/film/` is the animation: a canvas film where every frame is a pure function of time. Open `index.html?play` in a browser to preview it (no sound). Add `&v` for the vertical layout and `&nocap` to hide the captions.
  - `sim.js` and `simcfg.js` run the crowd-and-escalator simulation that drives the station scenes.
  - `world.js` draws the station; the `scenes_*.js` files are the individual scenes; `film.js` assembles them.
  - `timeline.js` carries the narration timing, down to each word.
- `source/render_mb.sh` renders a silent master with motion blur. It needs Node, Playwright with Chromium, and ffmpeg:

  ```bash
  cd source && bash render_mb.sh film/index.html 76 master_16x9.mp4
  ```

  ```bash
  cd source && VERT=1 bash render_mb.sh film/index.html 76 master_9x16.mp4
  ```

- `source/score.py` synthesises the music and sound effects from the film's own event times.
- `source/align.py` and `source/align2.py` produced the word timings from the narration audio (`source/narration.wav`).
- `source/deliver_all.sh` muxes picture and sound into the delivery files.

`score.py`, `align.py`, `align2.py` and `deliver_all.sh` depend on helper scripts and model files that are not in this repository (a synthesis kit, a text-to-speech model and a speech-recognition model), so they are here for reference and will not run as-is.

## About the numbers

The figures in the narration are as reported from Transport for London's standing-only escalator trials at Holborn in 2015–16. The crowd scenes are an illustrative time-lapse simulation, labelled as such on screen; the counts and times shown in them are not measured data.
