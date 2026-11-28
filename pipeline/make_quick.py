#!/usr/bin/env python3
"""Fast BWDTBS short: script.json + voice file(s) -> finished vertical video, cover, captions file, post text.

Usage:  python3 make_quick.py <video_dir> [--plan-only] [--no-render]

<video_dir>/script.json   the video (see SCRIPT_FORMAT.md)
<video_dir>/skep.mp3      Skeptic voice (format A): all "skep" beats read in order, short pause between them
<video_dir>/friend.mp3    Friend voice (format A) / narr.mp3 narrator (format B): all their beats read in order
Output: <video_dir>/out/<slug>.mp4, _COVER.png, .srt, _post_text.txt, qa_sheet.jpg
"""
import json, os, re, subprocess, sys, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import timing  # noqa: E402

REMOTION = os.environ.get("REMOTION_DIR", os.path.join(os.path.dirname(HERE), "remotion"))
import glob
CHROME = os.environ.get("CHROME") or (sorted(glob.glob("/opt/pw-browsers/chromium-*/chrome-linux64/chrome")) or [""])[-1]
SR = 48000; FPS = 30
TEMPO = {"skep": 1.0, "friend": 1.08, "narr": 1.08}
FILES = {"skep": "skep.mp3", "friend": "friend.mp3", "narr": "narr.mp3"}
GOLD = "#ffcc4a"; COLORS = {"gold": GOLD, "white": "#fff", "red": "#ff6b5e"}
PILL_BG = ["#3f6aa0", "#c0532e", "#2e8a56", "#7a6a9c", "#7a3a3a"]


def run(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode: print(r.stdout[-2000:], r.stderr[-3000:]); raise SystemExit(f"FAILED: {cmd[:3]}")
    return r


def load(path, tempo=1.0):
    """mp3 -> float mono 48 kHz (tempo-adjusted)."""
    af = ["-af", f"atempo={tempo}"] if abs(tempo - 1) > 1e-3 else []
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, *af, "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768


def words_of(t):
    return t.replace("—", "— ").split()


def align_speaker(path, texts, tempo, work):
    """Word times for one speaker's file, split back into that speaker's beats (in seconds, after tempo)."""
    tmp = os.path.join(work, os.path.basename(path) + f".t{tempo}.wav")
    run(["ffmpeg", "-v", "error", "-y", "-i", path, "-af", f"atempo={tempo}", "-ac", "1", "-ar", str(SR), tmp])
    segs, D = timing.speech_segments(tmp)
    hm = None
    if len(texts) > 1 and re.fullmatch(r"\W*h+m+\W*", texts[-1].lower()):
        # a lone "Hm." read after a long pause: it starts after the longest silence in the file
        gaps = [(segs[k + 1][0] - segs[k][1], k) for k in range(len(segs) - 1)]
        g, k = max(gaps)
        hm = {"w": texts[-1], "s": segs[k + 1][0], "e": min(D, segs[k + 1][1] + 0.25)}
        segs = segs[:k + 1]; texts = texts[:-1]
    script = " ".join(texts)
    words, phr, cost = timing.align(script, segs)
    if hm: words.append(hm); texts = texts + [hm["w"]]
    out, i = [], 0
    for t in texts:
        n = len(t.split()); ws = words[i:i + n]; i += n
        out.append(ws)
    if i != len(words): print("WARN word count mismatch", i, len(words))
    return tmp, out, cost


def fit_size(text, base):
    n = len(text)
    return base if n < 14 else int(base * 0.86) if n < 18 else int(base * 0.72) if n < 24 else int(base * 0.6)


def main():
    d = os.path.abspath(sys.argv[1]); plan_only = "--plan-only" in sys.argv
    if os.path.exists(os.path.join(d, "voices.json")) and json.load(open(os.path.join(d, "voices.json"))).get("engine") == "kokoro":
        TEMPO.update({"friend": 1.0, "narr": 1.0})  # Kokoro already reads fast; no extra speed-up (26 Nov 2026)
    S = json.load(open(os.path.join(d, "script.json")))
    vid = S["id"]; slug = S["slug"]; work = os.path.join(d, "work"); outd = os.path.join(d, "out")
    os.makedirs(work, exist_ok=True); os.makedirs(outd, exist_ok=True)
    beats = S["beats"]
    lib = json.load(open(f"{REMOTION}/public/lib/library.json"))
    for b in beats:
        assert b["clip"] in lib, f"unknown clip {b['clip']}"
        b["who"] = b.get("who", "narr")

    # ---- 1. align each speaker's file to its beats
    speakers = sorted({b["who"] for b in beats})
    audio, wbeat = {}, {}
    for sp in speakers:
        f = os.path.join(d, FILES[sp]); assert os.path.exists(f), f"missing voice file {FILES[sp]}"
        idx = [i for i, b in enumerate(beats) if b["who"] == sp]
        tmp, per, cost = align_speaker(f, [beats[i]["say"] for i in idx], TEMPO[sp], work)
        print(f"{sp}: align cost {cost:.2f}")
        audio[sp] = load(tmp)
        for i, ws in zip(idx, per): wbeat[i] = ws

    # ---- 2. rebuild one voice track beat by beat, tight gaps
    lead = 0.12; t = lead; pieces = []; btime = []
    for i, b in enumerate(beats):
        ws = wbeat[i]; s = max(0, ws[0]["s"] - 0.04); e = ws[-1]["e"] + 0.08
        nxt = [j for j in range(i + 1, len(beats)) if beats[j]["who"] == b["who"]]
        if nxt: e = min(e, wbeat[nxt[0]][0]["s"] - 0.01)
        if i > 0:
            prev = beats[i - 1]
            gap = 0.42 if b.get("hm") else 0.32 if b.get("end") else 0.16 if prev["who"] == b["who"] else 0.28
            gap = b.get("gap", gap); t += gap
        seg = audio[b["who"]][int(s * SR):int(e * SR)].copy()
        fade = int(0.012 * SR); seg[:fade] *= np.linspace(0, 1, fade); seg[-fade:] *= np.linspace(1, 0, fade)
        pieces.append((t, seg))
        btime.append({"s": t, "e": t + len(seg) / SR, "words": [{"w": w["w"], "s": t + (w["s"] - s), "e": t + (w["e"] - s)} for w in ws]})
        t += len(seg) / SR
    voice_end = t; tail = max(2.2, 2.6 - (voice_end - btime[-1]["s"]))
    total = int(round((voice_end + tail) * FPS)); N = int(total / FPS * SR)
    voice = np.zeros(N, np.float32)
    for t0, seg in pieces:
        i = int(t0 * SR); voice[i:i + len(seg)] += seg[:max(0, N - i)]
    with wave.open(os.path.join(work, "voice48.wav"), "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(voice, -1, 1) * 32767).astype(np.int16).tobytes())
    F = lambda sec: int(round(sec * FPS))

    # ---- 3. scenes: merge consecutive beats on the same clip
    bstart = [F(x["s"]) for x in btime]
    bstart[0] = 0
    segs = []
    for i, b in enumerate(beats):
        a = bstart[i]; z = (bstart[i + 1] - 1) if i + 1 < len(beats) else total - 1
        if segs and segs[-1]["clip"] == b["clip"]: segs[-1]["to"] = z
        else: segs.append({"from": a, "to": z, "clip": b["clip"], "clipFrames": lib[b["clip"]]["frames"]})
    cuts = [s["from"] for s in segs[1:]]
    # No still title card inside the video (26 Nov 2026: hooks were losing the first second). The hook scene,
    # its voice and its big text start on frame 0; the title card is rendered separately as the cover image.
    # A script may still ask for a card with "titleFrames" > 0.
    title_end = S.get("titleFrames", 0) if S.get("titleFrames", 0) > 0 and S.get("forceTitleCard") else 0

    # ---- 4. on-screen items
    items = []; scroll_starts = []; stamps = []; ticks = []; jesus_at = []; end_at = None; hm_at = None
    for i, b in enumerate(beats):
        a = bstart[i]; z = (bstart[i + 1] - 2) if i + 1 < len(beats) else total - 1
        ws = btime[i]["words"]
        wf = [F(w["s"]) for w in ws]
        if b.get("jesus"): jesus_at.append(a)
        if b.get("hm"):
            hm_at = F(ws[0]["s"]); items.append({"kind": "big", "from": a, "to": z, "at": hm_at, "top": 260, "text": "…hm.", "color": "#fff", "size": 120}); continue
        if b.get("end"):
            end_at = a; items.append({"kind": "follow", "from": a, "to": total - 1}); continue
        if b.get("scroll"):
            sc = b["scroll"]; text = sc.get("text") or b["say"]
            text = re.sub(r'^"', "“", text); text = re.sub(r'"$', "”", text).replace(' "', " “").replace('" ', "” ")
            n = len(text); size = 64 if n < 30 else 56 if n < 60 else 48 if n < 100 else 42 if n < 140 else 38
            # one time per displayed word (spread over spoken words)
            dw = text.split(); times = [wf[min(len(wf) - 1, int(k * len(wf) / len(dw)))] for k in range(len(dw))]
            ref_at = a + 10  # reference shows big from the start of the scroll (viewer feedback 23 Nov 2026)
            items.append({"kind": "scroll", "start": max(a, a + 2), "end": z - 2, "top": 170, "text": text, "times": times,
                          "ref": sc["ref"], "refAt": ref_at, "size": size, "hot": sc.get("hot", "^$")})
            scroll_starts.append(a)
            if b.get("pill"):  # small label above the scroll is not used; scroll owns the top
                pass
            continue
        top = 190
        shows = b.get("show", [])
        for k, sh in enumerate(shows):
            # appear on the word given by "on" (first match), else spread through the beat
            at = a + 2 + int(k * max(1, (z - a)) / max(1, len(shows)) * 0.8)
            if sh.get("on"):
                for w, f0 in zip(ws, wf):
                    if re.sub(r"[^a-z0-9']", "", w["w"].lower()) == sh["on"].lower(): at = f0; break
            if "pill" in sh:
                items.append({"kind": "pill", "from": a, "to": z, "at": at, "top": top, "text": sh["pill"], "bg": sh.get("bg", PILL_BG[(i + k) % len(PILL_BG)]), "size": 40})
                ticks.append(at); top += 100
            else:
                txt = sh["big"]; size = sh.get("size") or fit_size(txt, 120)
                items.append({"kind": "big", "from": a, "to": z, "at": at, "top": top, "text": txt, "color": COLORS.get(sh.get("color", "white"), sh.get("color", "#fff")), "size": size})
                stamps.append(at); top += int(size * 1.15) + 14
        if b.get("myth"):
            items.append({"kind": "myth", "from": a, "to": z, "at": a + 4, "text": b["myth"]}); stamps.append(a + 10)

    # ---- 4b. hook on frame 0: the first big text of the hook beat is already on screen when the video starts;
    # if the hook beat has none, the cover's words are shown over the moving scene instead.
    if title_end == 0:
        z0 = (bstart[1] - 2) if len(beats) > 1 else total - 1
        first = [it for it in items if it.get("from") == 0 and it["kind"] in ("big", "myth", "pill")]
        if first:
            first[0]["at"] = -8
        else:
            items.insert(0, {"kind": "hook", "from": 0, "to": z0, "title": S["title"]})

    # ---- 5. captions (1-3 words, real word times)
    cues = []
    for i, b in enumerate(beats):
        ws = btime[i]["words"]; cur = []
        for w in ws:
            cur.append(w)
            txt = " ".join(x["w"] for x in cur)
            if w["w"].endswith((",", ".", "?", "!", ":", "—", "”", '"')) or len(txt) >= 11 or len(cur) == 3:
                cues.append([F(cur[0]["s"]), F(cur[-1]["e"]), txt.replace("— ", "—")]); cur = []
        if cur: cues.append([F(cur[0]["s"]), F(cur[-1]["e"]), " ".join(x["w"] for x in cur)])
    for k in range(len(cues) - 1): cues[k][1] = max(cues[k][1], min(cues[k + 1][0], cues[k][1] + 8))
    # split cues wider than the frame
    from PIL import ImageFont
    PF = ImageFont.truetype(f"{REMOTION}/public/Poppins-Bold.ttf", 92)
    width = lambda t: sum(PF.getlength(x) for x in t.split()) + 22 * len(t.split())
    fixed = []
    for a, b2, txt in cues:
        ws = txt.split()
        if width(txt) > 960 and len(ws) >= 2:
            k = len(ws) // 2; m = a + (b2 - a) // 2; fixed += [[a, m, " ".join(ws[:k])], [m, b2, " ".join(ws[k:])]]
        else: fixed.append([a, b2, txt])
    cues = fixed
    srt = [[c[0] / FPS, c[1] / FPS, c[2]] for c in cues]
    json.dump(srt, open(os.path.join(work, "caption_cues.json"), "w"), ensure_ascii=False)

    plan = {"id": vid, "total": total, "titleEnd": title_end, "title": S["title"], "segs": segs, "cuts": cuts, "items": items,
            "cues": cues, "keywords": [k.lower() for k in S.get("keywords", [])], "audio": f"q/{vid}/mix.wav", "format": S.get("format", "A"), "style": S.get("style", "v2")}
    pub = f"{REMOTION}/public/q/{vid}"; os.makedirs(pub, exist_ok=True)
    json.dump({"plan": plan}, open(os.path.join(work, "props.json"), "w"), ensure_ascii=False)
    print(f"total {total} frames = {total / FPS:.1f}s; scenes: " + ", ".join(f"{s['clip']}[{s['from']}-{s['to']}]" for s in segs))
    for i, b in enumerate(beats): print(f"  f{bstart[i]:4d} {b['who']:6s} {b['say'][:70]}")

    # ---- 6. sound: one calm music bed + mood effects, ducked under the voice
    import mix_quick
    mix_quick.mix(os.path.join(work, "voice48.wav"), total, cuts=cuts, scrolls=scroll_starts, stamps=stamps, ticks=ticks,
                  jesus=jesus_at, end=end_at, hm=hm_at, segs=segs, key=S.get("key", "D"), seed=sum(map(ord, vid)),
                  out=os.path.join(work, "mix_raw.wav"))
    run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(work, "mix_raw.wav"), "-af", "loudnorm=I=-14:TP=-1.5:LRA=9,alimiter=limit=0.8", "-ar", "48000", "-ac", "2", os.path.join(pub, "mix.wav")])
    if plan_only or "--no-render" in sys.argv: return

    # ---- 7. render
    mp4 = os.path.join(outd, f"{slug}.mp4"); tmp = mp4.replace(".mp4", ".part.mp4")
    run(["npx", "remotion", "render", "src/index.ts", "Quick", tmp, f"--props={os.path.join(work, 'props.json')}", f"--browser-executable={CHROME}",
         "--concurrency=2", "--offthreadvideo-cache-size-in-bytes=800000000", "--crf=17", "--x264-preset=veryfast", "--log=error"], cwd=REMOTION)
    os.replace(tmp, mp4)
    # cover image = the title card (no longer part of the video itself)
    cplan = dict(plan, titleEnd=1, total=1, items=[], cues=[])
    json.dump({"plan": cplan}, open(os.path.join(work, "props_cover.json"), "w"), ensure_ascii=False)
    run(["npx", "remotion", "still", "src/index.ts", "Quick", os.path.join(outd, f"{slug}_COVER.png"), f"--props={os.path.join(work, 'props_cover.json')}",
         f"--browser-executable={CHROME}", "--frame=0", "--log=error"], cwd=REMOTION)
    finish(d, S, mp4, work, outd)


def finish(d, S, mp4, work, outd):
    slug = S["slug"]
    cover = os.path.join(outd, f"{slug}_COVER.png")
    if not os.path.exists(cover) or os.path.getmtime(cover) < os.path.getmtime(mp4):
        run(["ffmpeg", "-v", "error", "-y", "-i", mp4, "-vf", "select=eq(n\\,0)", "-frames:v", "1", cover])
    run(["ffmpeg", "-v", "error", "-y", "-i", mp4, "-vf", "select=eq(n\\,0)", "-frames:v", "1", os.path.join(outd, "first_frame.jpg")])
    # subtitles: sentence-level
    cues = json.load(open(os.path.join(work, "caption_cues.json")))
    ts = lambda t: "%02d:%02d:%02d,%03d" % (int(t // 3600), int(t % 3600 // 60), int(t % 60), int(round(t * 1000)) % 1000)
    groups, cur = [], []
    for c in cues:
        cur.append(c)
        if c[2].rstrip('"”').endswith((".", "?", "!")) or len(" ".join(x[2] for x in cur)) > 70: groups.append(cur); cur = []
    if cur: groups.append(cur)
    open(os.path.join(outd, f"{slug}.srt"), "w").write("\n".join(f"{i}\n{ts(g[0][0])} --> {ts(g[-1][1])}\n{' '.join(x[2] for x in g)}\n" for i, g in enumerate(groups, 1)))
    P = S["post"]
    txt = (f"BUT WHAT DOES THE BIBLE SAY? — \"{S['name']}\"\n\nYOUTUBE SHORTS — TITLE\n{P['yt_title']}\n\nYOUTUBE — DESCRIPTION\n{P['yt_desc']}\n\n"
           f"TIKTOK\n{P['tiktok']}\n\nINSTAGRAM / FACEBOOK REELS\n{P['instagram']}\n\nPINNED COMMENT (add by hand)\n{P['pinned']}\n\nACCURACY NOTES (not for posting)\n{P.get('notes', '')}\n")
    open(os.path.join(outd, f"{slug}_post_text.txt"), "w").write(txt)
    # QA
    q = run(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=width,height,r_frame_rate", "-of", "compact", mp4]).stdout
    lu = re.findall(r"I:\s+(-?[\d.]+) LUFS", subprocess.run(["ffmpeg", "-nostats", "-i", mp4, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr)
    fr = re.findall(r"freeze_start: ([\d.]+)", subprocess.run(["ffmpeg", "-nostats", "-i", mp4, "-vf", "freezedetect=n=0.001:d=1.5", "-an", "-f", "null", "-"], capture_output=True, text=True).stderr)
    run(["ffmpeg", "-v", "error", "-y", "-i", mp4, "-vf", "fps=0.5,scale=216:384,tile=8x4", "-frames:v", "1", os.path.join(outd, "qa_sheet.jpg")])
    print("QA:", q.strip().replace("\n", " | "), "| loudness", lu[-1] if lu else "?", "LUFS | frozen spans at", fr or "none")


if __name__ == "__main__":
    if "--finish" in sys.argv:
        d = os.path.abspath(sys.argv[1]); S = json.load(open(os.path.join(d, "script.json")))
        finish(d, S, os.path.join(d, "out", S["slug"] + ".mp4"), os.path.join(d, "work"), os.path.join(d, "out"))
    else:
        main()
