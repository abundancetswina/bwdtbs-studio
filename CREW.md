# BWDTBS daily crew — "But What Does the Bible Say?"

One scheduled run a day makes the day's videos (default 3) and schedules each one on TikTok, Instagram and YouTube Shorts (TikTok 3, Instagram 3, YouTube 2 a day: Buffer allows only 2 YouTube posts per day).
Each role below is a step. The Fact-checker is a SEPARATE agent that has not seen the writing, so the work is not grading itself.

## Series rules (every video, never break)
- Every Bible quote is NKJV, word for word, inside quotation marks, shown on a scroll with its reference. Never paraphrase inside quote marks. A partial quote gets "…" on the scroll.
- Confirmed history only. One idea per video. Respectful to everyone. Every video points to Jesus.
- Never depict God the Father (voice/light only). Satan never in human form. No graphic violence.
- No season/episode numbers. No "Illustrative scene" labels. No ElevenLabs or Thomas Nelson lines in captions.
- Format A (question): Hook (see below) → the Skeptic's question (beat 1 or 2; skip if the hook already is a sharp, specific skeptic line) → straight into the answer, NO "Fair question." filler (Abundance, 26 Nov 2026) → scroll(s) → twist → Jesus → Skeptic "Hm." → Friend "Follow so you don't miss the next one."
- Format B (myth): Friend/narrator: "The Bible never says…" with the myth card (red X) ON THE FIRST BEAT → a one-line loop ("So who made it up?") instead of a bare "Stay to the end" → scroll → where the myth came from → Jesus → "Follow so you don't miss the next one."
- Length: 50–60 seconds (friend/narrator 125–150 words, skeptic up to ~20). Hooks punchy, spoken in the first second; give the hook, the story and the Jesus beat room to breathe, but cut any line that doesn't earn its place. (Abundance, 24 Nov 2026: back to 50–60 s now that the free voices remove the credit limit.)
- HOOKS FIRST (Abundance, 26 Nov 2026: "the beginning is not so hooking"). Our own numbers, TikTok views 21–25 Nov: myth openers 257–391, story-in-motion (Job) 287, specific doubts ("Hasn't the Bible been changed?", "Did Jesus exist?") 261–336, but familiar big-question openers ("How can a loving God send people to hell?", "Why did Jesus have to die?", Jonah, flood, "good person") only 92–111. So:
  - Never open with a familiar skeptic question as-is. Open with a myth, a story already in motion, a surprising fact, or a bold specific claim, and bring the skeptic's question in on beat 1–2. E.g. q24 "Someone asked Paul this exact question. His answer was two words." (Romans 6:1–2) instead of "If I'm forgiven, can I keep sinning?".
  - First line 6–12 words, with a stake or a contradiction; it must make sense with the sound off (the hook's big text is on screen from frame 0).
  - The video starts on the hook: no still title card inside the video (make_quick.py renders the title card only as the _COVER.png). The first beat's first "show" item is on screen on frame 0; if the first beat has none, the cover words are shown over the scene.
  - Beat 0's clip is a topic scene that matches the line (sea, desert, Jerusalem, modern_room…), never stage_* (the skeptic stage appears from beat 1 on). Every video must look different in its first second.
- Hook styles (rotate; pick the one that fits the topic):
  - Story hook: open inside the Bible story, present tense, like a storyteller ("A prophet gets a direct order from God. And he buys a ticket the other way.").
  - Science/history fact hook: open with a surprising, well-established fact that leads into the topic ("This scroll sat in a cave for 2,000 years."). Only mainstream, verifiable science or archaeology; never claim "the Bible predicted science" or stretch a verse to fit a discovery. The Fact-checker checks these like any historical claim.
  - Myth hook (Format B) stays. A skeptic question can open only when it is sharp and specific (a real doubt with a detail), never a familiar big question.
- Holy storytelling: where it fits, tell the passage as a short, reverent story (who, where, what happened), not just a list of points. Keep the beats in the format order above.
- Scripture references must be easy to read: the scroll shows the reference badge (book, chapter and verse) large, from the moment the scroll opens until it closes, and every caption lists the references. (Viewer feedback, 23 Nov 2026: the old badge was too small and flashed too quickly.)
- Say the reference out loud too: the spoken line names the book, chapter and verse right before each quote, in natural words ("Isaiah 40, verse 8 says:" / "In John 20, verse 18…"). Short form is fine ("Romans 6:23:"). This is part of the word count, so keep the rest tight. (Abundance, 23 Nov 2026.)
- Explain for newcomers: assume the viewer has never read the Bible. In a few words each, say who people are and where/when it happened ("Nineveh, the capital-to-be of Assyria, Israel's enemy"; "Paul, who wrote much of the New Testament"). Name the book in plain words before the reference. No church jargon without a 3–5 word explanation.
- Voices, per video:
  - ElevenLabs when credits allow (cost + 300 spare): Skeptic = Chad (wiy1Gg8ir59Wz8fJAOFD), Friend/narrator = Jerry B. (zDBYcuJrpuZ6YQ7AgRUw), model eleven_v4, generations_count 1. A 50–60 s video costs about 900 credits.
  - Otherwise the free Kokoro voices (Abundance's pick, 24 Nov 2026): Skeptic = am_puck, Friend/narrator = am_fenrir, made by `python3 pipeline/kokoro_voice.py scripts/qNN` (no credits, no Drive step). Credits never limit the number of videos: the day always gets its full 3.

## 10/10 checklist (Abundance, 26 Nov 2026; every video, checked before publishing)
- Hook (first 1-2 s): one line of 6-12 words with tension (a myth, a contradiction, a story in motion or a surprising fact; not a familiar skeptic question). Voice, motion and its big on-screen words start on frame 0 (no still card in the video; titleFrames is ignored). Check out/first_frame.jpg: it must show a topic scene plus readable hook words.
- Open a loop early ("The answer surprises people." / "So who picked the date?" / "Stay to the end.") and pay it off; put a re-hook or twist line around the middle.
- Visuals change at least every 3-4 s, and every scene matches its words (no ship for a desert story, no Jesus close-up under a line about the devil). If no scene fits, make one (see below), never use a misleading one.
- NEW SCENES FOR EVERY SCRIPT (Abundance, 28 Nov 2026: "you repeat basically the same scenes in each and every episode... just generate new... make it match what the script says"). This replaces the old "use the library" habit:
  - For every video, the Producer writes NEW scenes in remotion/src/Scenes3.tsx that show exactly what each line says (who, where, what is happening: e.g. "Isaac asks where the lamb is" = Isaac with the firewood looking up at Abraham on the path; "the guards shook" = Roman guards falling back before the light). Aim for a new scene for every story/explanation beat; only stage_*, outro and (rarely) a library clip that shows exactly the line may be reused. Never reuse a non-stage clip that was used in the last 3 days' videos.
  - Build them with the 3D-look kit in remotion/src/Kit.tsx (D depth layers with parallax, Fig characters with contact shadows at s 1.0-1.5 = close camera, haze/Fog, Beams light, Dust, a blurred near-foreground layer at k 1.3-1.4 with blur 10-14, Look3D grade). Same cast (Toon) as every other video; God the Father only ever as light; no graphic violence.
  - Each scene: {frames: 240, amb: wind|birds|crickets|crowd|room|storm, desc, render}. Check a still first (`npx remotion still src/index.ts Scene out.png --props='{"name":"<name>"}' --frame=120`), fix framing (faces between y 650-1450, nothing important cut off at the sides), then render one at a time: `npx remotion render src/index.ts Scene public/lib/<name>.mp4 --props='{"name":"<name>"}' --frames=0-239 --concurrency=2 --crf=18 --x264-preset=veryfast` (~1.5 min each). Add each to library.json with "look": "3d", "amb" and "made" date (mix_quick.py reads amb from there), and commit the code and the mp4s.
  - Still true: change scene at least every 6 s; no clip in two separate places in one video (stage_*/outro excepted); never a misleading scene.
- V2 LOOK IS THE DEFAULT (Abundance approved, 27 Nov 2026, after the q26 side-by-side): every shot has a camera move (push-in, pull-back, pan, crane), scenes change with whip-pan transitions (motion blur, no white flash), warm light grade + floating dust, ONE small subtitle word at a time, and no big text layers after the hook (only the hook's big words, the myth card, pills, scrolls with the big reference badge and the Follow card). make_quick.py uses style v2 unless a script.json sets "style": "v1". So write 'show' big text only for beat 0 (the hook); put other key words in 'keywords' (gold subtitle words) or a pill.
- ONE LOOK FOR EVERY SCENE (Abundance, 27 Nov 2026: "make the characters a lot more consistent"; he loved the quality of the 3D scenes like garden_night). library.json marks each clip "look": "3d" (the 3D kit look: rounded shaded characters, depth, haze) or "flat" (the 16 quick 2D scenes from 26 Nov). Use ONLY "3d" clips (never the "flat" ones). New scenes made with the 3D-look kit (Kit.tsx/Scenes3.tsx, see "NEW SCENES FOR EVERY SCRIPT") count as "3d".
- Never more than two text layers at once. A scroll shows the whole verse readable from the start (words light up as spoken), with the big reference badge.
- Never describe other religions' beliefs beyond what is accurate and respectful; state the Bible's own claim instead of contrasting.
- Sound: the music bed is clearly audible on a phone under the voice (music gain 0.42, ducking 30%, extra upper chord layer); Kokoro voices run at natural pace (no 1.08x speed-up) so 125-150 words lands at 50-60 s.
- Ending: one payoff line pointing to Jesus, then the Follow line. Nothing after it.
- Voices: Chatterbox and other Hugging Face/PyTorch-hosted voices cannot be downloaded in this workspace (blocked hosts); Kokoro stays the free voice.

## 1. Researcher
- Take the next `queued` topics from topics.json (3 a day). Check ElevenLabs credits first (~900 per 50–60 s video, keep 300 spare) to decide which videos get ElevenLabs voices and which get Kokoro; say which in the report.
- For each: read the passage in its chapter, find the 1–2 key verses, fetch the exact NKJV wording from a Bible site (bible.com NKJV = version 114). Note what history supports and where Christians disagree.

## 2. Writer (hooks)
- Write script.json (see SCRIPT_FORMAT.md) per video: hook first, then the format above. The skeptic's question must be fair and smart. Pick scenes from the scene library (library.json) that fit each beat.
- Write the four captions (YouTube title + description, TikTok, Instagram) and the pinned comment naming the next topic.

## 3. Fact-checker (separate agent)
- Gets only the script.json files and checks: every quoted word against NKJV, every reference, every historical claim, the rules list above. Returns PASS or a list of exact fixes.
- Anything not fixed → that video is made but posted as a DRAFT only, and the report says why.

## 4. Producer
- Skeptic file (all skep beats in order, "[long pause] [thoughtful] Hm." last) and Friend file (all friend beats, blank line, then the Follow line). One generation each.
- Kokoro instead (when credits are short): `python3 pipeline/kokoro_voice.py scripts/qNN` writes skep.mp3 / friend.mp3 / narr.mp3 directly (first use in a run installs kokoro-onnx and downloads the ~350 MB model from GitHub). Skip the Drive step.
- ElevenLabs files: move each file: Zapier Google Drive "Upload File" (connection abundancetswina@gmail.com) with the ElevenLabs full_res_url → Google Drive download_file_content → save as skep.mp3 / friend.mp3 (narr.mp3 for format B).
- Before make_quick: write the video's new scenes (Scenes3.tsx, see "NEW SCENES FOR EVERY SCRIPT"), check their stills, render them to public/lib, and set each beat's clip to the scene that shows its words. Allow ~1.5 min render per scene in the day's time plan.
- Run `python3 make_quick.py <dir>`. Look at out/qa_sheet.jpg and the cover before passing it on.

## 4b. Trends agent (hashtags + timing)
- Daily: for each video, research 3–5 hashtags people are actually using right now for that topic on each platform (search the web; mix 1–2 broad ones like #Bible #Jesus, 2 topic ones, and always #ButWhatDoesTheBibleSay). Keep TikTok ≤5 hashtags, Instagram ≤5, YouTube 3 in the description plus #shorts. No banned, spammy or unrelated trending tags.
- Every Monday: read the last 7 days of results (Buffer get_aggregated_post_metrics / list_posts includeMetrics) per platform and time slot, re-check current best-time studies, and update pipeline/schedule.json (keep slots 2+ hours apart, earliest 09:00). Say what changed in the report.

## 5. Publisher
- Videos are hosted on the public `videos` branch of this repo: copy `out/<slug>.mp4` to `<id>.mp4` there (use a git worktree), commit, push.
  Link: `https://raw.githubusercontent.com/abundancetswina/bwdtbs-studio/videos/<id>.mp4` (Buffer accepts it). Keep only the last 14 days of videos: when the branch passes ~600 MB, recreate it as an orphan with just the recent files and force-push that branch only.
- Buffer organization "My Organization" (6687a54c840657ce002b6240). Channels: TikTok christian_animationss = 6af3495f62b70b94b0e4dbb3; Instagram christiananimationss = 6af34f8e62b70b94b0e55989 (metadata.instagram {type: reel, shouldShareToFeed: true}); YouTube Christian Animation = 6af3392e62b70b94b0e3de75 (metadata.youtube {title: yt_title (≤100 chars, ends with #shorts), categoryId: "27", privacy: public, madeForKids: false, notifySubscribers: true}; text = yt_desc). No first comments (paid feature).
- FIRST THING each run (before any credits are spent): list Buffer posts with status scheduled. The free plan allows 10 scheduled at once; a full day is 8 (TikTok 3, Instagram 3, YouTube 2). If today's slots already have posts, make nothing today and just report that.
- YouTube: Buffer allows at most 2 YouTube posts in any rolling 24 hours (seen 25 Nov 2026: posts failed with "daily posting limit for this channel has been reached"). Before scheduling, list the YouTube posts sent or scheduled in the last 24 h and make each new YouTube post at least 24 h 15 min after the post two before it; move a slot later if needed. Count YouTube posts already scheduled for today and fill only what is left, in series order (videos 1 and 2 first). A video that gets no YouTube slot is listed in the report so Abundance can upload it himself if he wants.
- Times: pipeline/schedule.json, for today's weekday, South Africa time (+02:00). Video 1 → each platform's first slot, video 2 → second, video 3 → third. Mode customScheduled. Each platform gets its own caption, same video link.
- A video the Fact-checker did not PASS goes to Buffer as a draft (saveToDraft) instead.
- Never delete anything in Buffer, Drive or GitHub history without asking Abundance.

## 6. Reporter
- Mark topics `done` in topics.json, save everything back to the repo, and send Abundance a short summary: what was made, what's scheduled when, anything held as a draft and why, credits left.
