# BWDTBS Studio — "But What Does the Bible Say?"

Automatic daily production of the series' short vertical videos.

- `CREW.md` — the daily crew (researcher, writer, fact-checker, producer, publisher, reporter) and the series rules
- `SCRIPT_FORMAT.md` — how a video's `script.json` is written
- `pipeline/` — `make_quick.py` turns a script + voice files into the finished video, cover, captions and post text
- `pipeline/topics.json` — the series order; the crew takes the next queued topics
- `remotion/` — the video template and the 3D scene library (`public/lib`)
- `scripts/qNN/` — each video's script and voice files
- branch `videos` — the finished videos, public so Buffer can fetch them (old ones are cleared)
