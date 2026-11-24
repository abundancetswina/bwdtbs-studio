#!/usr/bin/env python3
"""Free fallback voices (Kokoro, open-source, Apache 2.0) for when ElevenLabs credits are short.

Usage:  python3 pipeline/kokoro_voice.py scripts/qNN

Writes the same files the ElevenLabs step makes, so make_quick.py runs unchanged:
  format A: skep.mp3 (skep beats, long pause, "Hm.") + friend.mp3 (friend beats, pause, Follow line)
  format B: narr.mp3
Voices (Abundance's choice, 24 Nov 2026): Skeptic = am_puck, Friend/narrator = am_fenrir.
First run in a fresh workspace installs kokoro-onnx and downloads the model (~350 MB from GitHub).
"""
import json, os, subprocess, sys

VOICES = {"skep": "am_puck", "friend": "am_fenrir", "narr": "am_fenrir"}
SPEED = {"skep": 1.0, "friend": 1.0, "narr": 1.0}  # make_quick.py already speeds friend/narr up 1.08x
MODEL_DIR = os.environ.get("KOKORO_DIR", os.path.expanduser("~/.cache/kokoro"))
BASE = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/"
FILES = ["kokoro-v1.0.onnx", "voices-v1.0.bin"]


def setup():
    try:
        import kokoro_onnx  # noqa: F401
    except ImportError:
        subprocess.run([sys.executable, "-m", "pip", "install", "-q", "--break-system-packages", "kokoro-onnx", "soundfile"], check=True)
    os.makedirs(MODEL_DIR, exist_ok=True)
    for f in FILES:
        p = os.path.join(MODEL_DIR, f)
        if not os.path.exists(p) or os.path.getsize(p) < 1_000_000:
            subprocess.run(["curl", "-sSL", "--retry", "3", "-o", p, BASE + f], check=True)


def main(d):
    setup()
    import numpy as np, soundfile as sf
    from kokoro_onnx import Kokoro
    k = Kokoro(os.path.join(MODEL_DIR, FILES[0]), os.path.join(MODEL_DIR, FILES[1]))
    s = json.load(open(os.path.join(d, "script.json")))
    beats = s["beats"]
    speakers = ["narr"] if s.get("format") == "B" else ["skep", "friend"]
    for sp in speakers:
        mine = [b for b in beats if b["who"] == sp]
        out, sr = [], 24000
        for i, b in enumerate(mine):
            text = b["say"].replace('"', "").replace("“", "").replace("”", "")
            if b.get("hm"):
                gap = 1.6          # make_quick finds "Hm." after the longest silence
            elif b.get("end"):
                gap = 0.9          # blank line before the Follow line
            else:
                gap = 0.0 if i == 0 else 0.3
            a, sr = k.create(text, voice=VOICES[sp], speed=SPEED[sp], lang="en-us")
            out += [np.zeros(int(sr * gap), dtype=np.float32), a.astype(np.float32)]
        out.append(np.zeros(int(sr * 0.3), dtype=np.float32))
        wav = os.path.join(d, f"{sp}.kokoro.wav")
        sf.write(wav, np.concatenate(out), sr)
        mp3 = os.path.join(d, f"{sp}.mp3")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", wav, "-ar", "44100", "-b:a", "128k", mp3], check=True)
        os.remove(wav)
        print(sp, VOICES[sp], "->", mp3)


if __name__ == "__main__":
    main(sys.argv[1])
