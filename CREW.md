# BWDTBS daily crew — "But What Does the Bible Say?"

One scheduled run a day makes the day's videos (default 3) and puts them in Buffer.
Each role below is a step. The Fact-checker is a SEPARATE agent that has not seen the writing, so the work is not grading itself.

## Series rules (every video, never break)
- Every Bible quote is NKJV, word for word, inside quotation marks, shown on a scroll with its reference. Never paraphrase inside quote marks. A partial quote gets "…" on the scroll.
- Confirmed history only. One idea per video. Respectful to everyone. Every video points to Jesus.
- Never depict God the Father (voice/light only). Satan never in human form. No graphic violence.
- No season/episode numbers. No "Illustrative scene" labels. No ElevenLabs or Thomas Nelson lines in captions.
- Format A (question): Skeptic hook → Friend "Fair question." → scroll(s) → twist → Jesus → Skeptic "Hm." → Friend "Follow so you don't miss the next one."
- Format B (myth): Friend/narrator: "The Bible never says…" (myth card with red X) → "Stay to the end" → scroll → where the myth came from → Jesus → "Follow so you don't miss the next one."
- Length: 25–30 seconds (friend/narrator 55–65 words). Hooks punchy, spoken in the first second.
- Voices: Skeptic = Chad (wiy1Gg8ir59Wz8fJAOFD), Friend/narrator = Jerry B. (zDBYcuJrpuZ6YQ7AgRUw), model eleven_v4, generations_count 1.

## 1. Researcher
- Take the next `queued` topics from topics.json (as many as the day needs; check ElevenLabs credits first: ~450 credits per video, keep 300 spare; make fewer videos if credits are short and say so).
- For each: read the passage in its chapter, find the 1–2 key verses, fetch the exact NKJV wording from a Bible site (bible.com NKJV = version 114). Note what history supports and where Christians disagree.

## 2. Writer (hooks)
- Write script.json (see SCRIPT_FORMAT.md) per video: hook first, then the format above. The skeptic's question must be fair and smart. Pick scenes from the scene library (library.json) that fit each beat.
- Write the four captions (YouTube title + description, TikTok, Instagram) and the pinned comment naming the next topic.

## 3. Fact-checker (separate agent)
- Gets only the script.json files and checks: every quoted word against NKJV, every reference, every historical claim, the rules list above. Returns PASS or a list of exact fixes.
- Anything not fixed → that video is made but posted as a DRAFT only, and the report says why.

## 4. Producer
- Skeptic file (all skep beats in order, "[long pause] [thoughtful] Hm." last) and Friend file (all friend beats, blank line, then the Follow line). One generation each.
- Move each file: Zapier Google Drive "Upload File" (connection abundancetswina@gmail.com) with the ElevenLabs full_res_url → Google Drive download_file_content → save as skep.mp3 / friend.mp3 (narr.mp3 for format B).
- Run `python3 make_quick.py <dir>`. Look at out/qa_sheet.jpg and the cover before passing it on.

## 5. Publisher
- Put each video where Buffer can fetch it (public link), then create one post per platform with its own caption, scheduled at the day's slots (default 12:00, 17:00, 20:00 SAST).
- Keep the series order. Never delete anything without asking Abundance.

## 6. Reporter
- Mark topics `done` in topics.json, save everything back to the repo, and send Abundance a short summary: what was made, what's scheduled when, anything held as a draft and why, credits left.
