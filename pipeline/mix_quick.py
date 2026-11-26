"""One calm music bed + mood effects for a fast BWDTBS short, ducked under the voice. Called by make_quick.py."""
import os, sys, wave
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "vendor_audio"))
import sfx_gen as G  # noqa: E402

SR = 48000
midi = lambda m: 440 * 2 ** ((m - 69) / 12)
# calm progressions per key (minor-ish start, resolves to major)
KEYS = {
    "D": [[38, 50, 53, 57, 62], [34, 46, 50, 53, 58], [41, 53, 57, 60, 65], [36, 48, 52, 55, 60]],   # Dm Bb F C
    "G": [[43, 55, 59, 62, 67], [40, 52, 55, 59, 64], [36, 48, 52, 55, 60], [38, 50, 54, 57, 62]],   # G Em C D
    "A": [[45, 57, 60, 64, 69], [41, 53, 57, 60, 65], [36, 48, 52, 55, 60], [43, 55, 59, 62, 67]],   # Am F C G
    "E": [[40, 52, 55, 59, 64], [36, 48, 52, 55, 60], [43, 55, 59, 62, 67], [38, 50, 54, 57, 62]],   # Em C G D
}
AMBIENCE = {"stage": "room", "jesus_crowd": "birds", "jesus_sunset": "crowd", "garden_night": "crickets", "temple_night": "crowd",
            "temple_day": "crowd", "manger": "crickets", "house_child": "room", "caravan_star": "wind", "town_star": "crickets",
            "tomb_risen": "birds", "meadow": "birds", "angry_crowd": "crowd", "night_room": "crickets", "storm_sea": "storm", "outro": "room"}


def mix(voice_path, total, cuts, scrolls, stamps, ticks, jesus, end, hm, segs, key="D", seed=1, out="mix_raw.wav"):
    rng = np.random.default_rng(seed); DUR = total / 30; N = int(DUR * SR)

    def lp(x, fc):
        X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 / (1 + (f / fc) ** 4); return np.fft.irfft(X, len(x)).astype(np.float32)

    def bp(x, lo, hi):
        X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= (f > lo) * (f < hi); return np.fft.irfft(X, len(x)).astype(np.float32)

    def place(buf, sig, t0, g=1.0):
        sig = np.asarray(sig, np.float32); sig = sig.mean(0) if sig.ndim == 2 else sig; i = int(t0 * SR); j = min(len(buf), i + len(sig))
        if 0 <= i < len(buf) and j > i: buf[i:j] += sig[: j - i] * g

    def pad(fs, dur, bright=1200):
        n = int(dur * SR); t = np.arange(n) / SR
        s = sum(np.sin(2 * np.pi * f * t + 0.3 * np.sin(2 * np.pi * 0.19 * t)) + 0.6 * np.sin(2 * np.pi * f * 1.004 * t) + 0.25 * np.sin(2 * np.pi * f * 2.003 * t) for f in fs)
        return lp((s * np.minimum(1, t / 1.2) * np.minimum(1, (dur - t) / 1.2)).astype(np.float32), bright) / len(fs)

    def pluck(f, dur=1.6, v=1.0):
        n = int(dur * SR); t = np.arange(n) / SR
        s = sum(a * np.sin(2 * np.pi * f * h * t) * np.exp(-t * (3 + 2 * h)) for h, a in [(1, 1), (2, 0.4), (3, 0.15)])
        return (s * np.minimum(1, t / 0.004)).astype(np.float32) * v

    def bell(f, dur=2.5, v=1.0):
        n = int(dur * SR); t = np.arange(n) / SR
        return (sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * d) for a, r, d in [(1, 1, 1.6), (0.5, 2.76, 2.5), (0.3, 5.4, 4)]) * np.minimum(1, t / 0.002)).astype(np.float32) * v

    def choir(fs, dur, v=1.0):
        n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n, np.float32)
        for f in fs:
            for dd in (-0.004, 0, 0.005): ph = (f * (1 + dd) * t + 0.002 * np.sin(2 * np.pi * 5 * t)) % 1; s += (2 * ph - 1).astype(np.float32)
        s = bp(s, 300, 1400) * 0.6 + bp(s, 2200, 3200) * 0.25
        return (s * np.minimum(1, t / 1.0) * np.minimum(1, (dur - t) / 1.0)).astype(np.float32) * v / len(fs) / 3

    def noise(dur, lo, hi):
        return bp(rng.standard_normal(int(dur * SR)).astype(np.float32), lo, hi)

    def fadeio(s, a=0.5):
        s = np.asarray(s, np.float32); s = s.mean(0) if s.ndim == 2 else s
        n = len(s); t = np.arange(n) / SR; return (s * np.minimum(1, t / a) * np.minimum(1, (n / SR - t) / a)).astype(np.float32)

    tick = lambda: (lambda tt: np.sin(2 * np.pi * (520 + 900 * tt) * tt) * np.exp(-tt * 40))(np.arange(int(0.12 * SR)) / SR).astype(np.float32)

    def stamp(v=1.0):
        n = int(0.4 * SR); t = np.arange(n) / SR
        return (np.sin(2 * np.pi * (70 + 80 * np.exp(-t * 25)) * t) * np.exp(-t * 10) + bp(rng.standard_normal(n).astype(np.float32), 600, 3000) * np.exp(-t * 40) * 0.6).astype(np.float32) * v

    shimmer = lambda: sum(bell(midi(m), 2.2, 0.15) for m in [86, 89, 93])

    # music: 4-chord progression, ~4 s a chord, last chord held under the end card
    prog = KEYS.get(key, KEYS["D"]); music = np.zeros(N + SR * 4, np.float32); t0 = 0.0; k = 0
    while t0 < DUR:
        n = prog[k % 4]; d = 4.0 if t0 + 6 < DUR else DUR - t0
        place(music, pad([midi(m) for m in n[:4]], d + 1.2), t0, 0.26)
        place(music, pad([midi(m + 12) for m in n[1:5]], d + 1.2, bright=2600), t0, 0.16)  # upper layer so phone speakers hear the chords
        place(music, pluck(midi(n[0] + 12), 2.4, 0.35), t0)
        for j, m in enumerate([n[3] + 12, n[4] + 12, n[2] + 12]): place(music, pluck(midi(m), 1.6, 0.2), t0 + 0.7 + j * 0.9)
        t0 += d; k += 1
    for a in jesus: place(music, choir([midi(m) for m in [62, 65, 69, 74]], 5.0, 0.55), a / 30)
    if end is not None: place(music, choir([midi(m) for m in [57, 62, 65, 69]], max(2.0, DUR - end / 30), 0.5), end / 30)
    music = music[:N]

    sfx = np.zeros(N, np.float32)
    W = lambda d, lo, hi: G.whoosh(d, rng, peak=0.4, f_lo=lo, f_hi=hi)
    for s in segs:  # ambience per scene
        a, b = s["from"] / 30, (s["to"] + 1) / 30; d = b - a; kind = AMBIENCE.get(s["clip"].split("_")[0] if s["clip"].startswith("stage") else s["clip"], "room")
        if d < 0.6: continue
        if kind == "room": place(sfx, fadeio(G.breeze(d, rng, level=0.3)), a, 0.08)
        elif kind == "birds": place(sfx, fadeio(G.bird_chirps(d, rng, density=0.35)), a, 0.10); place(sfx, fadeio(G.breeze(d, rng, level=0.4)), a, 0.08)
        elif kind == "crickets": place(sfx, fadeio(G.crickets(d, rng, voices=2)), a, 0.06)
        elif kind == "crowd":
            tt = np.arange(int(d * SR)) / SR; place(sfx, fadeio(noise(d, 180, 1100) * (0.6 + 0.25 * np.sin(2 * np.pi * 0.37 * tt))), a, 0.12)
        elif kind == "wind": place(sfx, fadeio(G.breeze(d, rng, level=0.7)), a, 0.14)
        elif kind == "storm": place(sfx, fadeio(lp(rng.standard_normal(int(d * SR)).astype(np.float32), 500)), a, 0.25)
    for c in cuts: place(sfx, W(0.6, 200, 1200), c / 30 - 0.05, 0.3)
    for s in scrolls: place(sfx, shimmer(), s / 30, 0.55)
    for s in stamps: place(sfx, stamp(0.6), s / 30, 0.3)
    for s in ticks: place(sfx, tick(), s / 30, 0.2)
    if end is not None: place(sfx, bell(midi(98), 2.0, 0.2), end / 30 + 0.4)

    with wave.open(voice_path, "rb") as w: voice = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    vb = np.zeros(N, np.float32); place(vb, voice, 0.0)
    envv = np.convolve(np.abs(vb), np.ones(4800) / 4800, mode="same"); duck = 1 - 0.30 * np.clip(envv / (envv.max() + 1e-9) * 3, 0, 1)
    m = vb + music * 0.42 * duck  # louder bed (Abundance, 26 Nov 2026: music was inaudible) + sfx * 0.8 * (0.75 + 0.25 * duck)
    m *= np.minimum(1, (DUR - np.arange(N) / SR) / 0.8)
    m /= max(1e-6, np.abs(m).max()) / 0.9
    with wave.open(out, "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((m * 32767).astype(np.int16).tobytes())
