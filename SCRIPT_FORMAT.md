# script.json (one per video) — example: examples/q06/script.json

- id: short id, e.g. "q07"; slug: file name, e.g. "God_Helps_Those_Who_Help_Themselves"; name: display title
- format: "A" (Skeptic + Friend) or "B" (narrator only, who = "narr")
- key: music key "D" | "G" | "A" | "E"
- title: the cover (frame 0). {"theme": sunset|night|dawn|royal|earth, "top": 300, "kicker": optional small line,
  "lines": [{"text", "color": white|gold|red, "size"}], "crossed": optional big text with a red X (myth videos)}
  Format B covers: kicker "THE BIBLE NEVER SAYS", lines = the myth, crossed = a short symbol of it.
- titleFrames: no longer used (26 Nov 2026). The title card is only the cover image (_COVER.png); the video starts on the hook beat.
- keywords: words shown in gold in the captions
- beats: in spoken order. Each beat:
  - who: "skep" | "friend" | "narr"; say: EXACT words spoken (the voice files are generated from these, in order)
  - clip: a scene from public/lib/library.json (consecutive beats with the same clip play as one scene)
  - show: [{"big": TEXT, "color", "size", "on": word}] or [{"pill": TEXT, "bg", "on": word}] — "on" = appear on that spoken word
  - scroll: {"text": what the scroll shows (use “…” for partial quotes), "ref": "MATTHEW 6:8 NKJV", "hot": regex of words to colour}
  - myth: TEXT (format B: "THE BIBLE NEVER SAYS" card with a red X)
  - jesus: true (choir swell); hm: true (Skeptic's "Hm."); end: true (the Follow card)
- post: yt_title, yt_desc, tiktok, instagram, pinned, notes (accuracy notes, not posted)
- style: "v2" (default since 27 Nov 2026: camera moves, whip pans, one-word subtitles, big text only in the hook beat) or "v1" (old look)
