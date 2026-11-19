# BWDTBS daily crew — "But What Does the Bible Say?"

One scheduled run a day makes the day's videos (default 3) and schedules each one on TikTok, Instagram and YouTube Shorts (TikTok 3, Instagram 3, YouTube 2 a day: Buffer allows only 2 YouTube posts per day).
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

## 4b. Trends agent (hashtags + timing)
- Daily: for each video, research 3–5 hashtags people are actually using right now for that topic on each platform (search the web; mix 1–2 broad ones like #Bible #Jesus, 2 topic ones, and always #ButWhatDoesTheBibleSay). Keep TikTok ≤5 hashtags, Instagram ≤5, YouTube 3 in the description plus #shorts. No banned, spammy or unrelated trending tags.
- Every Monday: read the last 7 days of results (Buffer get_aggregated_post_metrics / list_posts includeMetrics) per platform and time slot, re-check current best-time studies, and update pipeline/schedule.json (keep slots 2+ hours apart, earliest 09:00). Say what changed in the report.

## 5. Publisher
- Videos are hosted on the public `videos` branch of this repo: copy `out/<slug>.mp4` to `<id>.mp4` there (use a git worktree), commit, push.
  Link: `https://raw.githubusercontent.com/abundancetswina/bwdtbs-studio/videos/<id>.mp4` (Buffer accepts it). Keep only the last 14 days of videos: when the branch passes ~600 MB, recreate it as an orphan with just the recent files and force-push that branch only.
- Buffer organization "My Organization" (6687a54c840657ce002b6240). Channels: TikTok christian_animationss = 6af3495f62b70b94b0e4dbb3; Instagram christiananimationss = 6af34f8e62b70b94b0e55989 (metadata.instagram {type: reel, shouldShareToFeed: true}); YouTube Christian Animation = 6af3392e62b70b94b0e3de75 (metadata.youtube {title: yt_title (≤100 chars, ends with #shorts), categoryId: "27", privacy: public, madeForKids: false, notifySubscribers: true}; text = yt_desc). No first comments (paid feature).
- FIRST THING each run (before any credits are spent): list Buffer posts with status scheduled. The free plan allows 10 scheduled at once; a full day is 8 (TikTok 3, Instagram 3, YouTube 2). If today's slots already have posts, make nothing today and just report that.
- YouTube: Buffer allows at most 2 YouTube posts per day. Count YouTube posts already scheduled for today and fill only what is left, in series order (videos 1 and 2 first). A video that gets no YouTube slot is listed in the report so Abundance can upload it himself if he wants.
- Times: pipeline/schedule.json, for today's weekday, South Africa time (+02:00). Video 1 → each platform's first slot, video 2 → second, video 3 → third. Mode customScheduled. Each platform gets its own caption, same video link.
- A video the Fact-checker did not PASS goes to Buffer as a draft (saveToDraft) instead.
- Never delete anything in Buffer, Drive or GitHub history without asking Abundance.

## 6. Reporter
- Mark topics `done` in topics.json, save everything back to the repo, and send Abundance a short summary: what was made, what's scheduled when, anything held as a draft and why, credits left.
