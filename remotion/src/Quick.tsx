import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing} from 'remotion';
import {INK} from './Toon';

// Fast BWDTBS template: everything comes from props.plan (written by shorts/quick/make_quick.py).
// Layers: library 3D scene clips -> title card -> graphics (scrolls, pills, big words) -> captions -> cut flashes.
const GOLD = '#ffcc4a';
const RED = '#e8392f';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const pop = (f: number, s: number, damping = 11) => spring({frame: f - s, fps: 30, config: {damping, stiffness: 170, mass: 0.7}});

type Item = any;
export type Plan = {id: string; total: number; titleEnd: number; title: any; segs: {from: number; to: number; clip: string; clipFrames: number}[];
  cuts: number[]; items: Item[]; cues: [number, number, string][]; keywords: string[]; audio: string; format: string};

const Outlined: React.FC<{children: React.ReactNode; size: number; color?: string; stroke?: number; style?: React.CSSProperties}> = ({children, size, color = '#fff', stroke = 14, style}) => (
  <div style={{fontFamily: 'Poppins', fontSize: size, color, lineHeight: 1.05, WebkitTextStroke: `${stroke}px ${INK}`, paintOrder: 'stroke fill', letterSpacing: -1, filter: 'drop-shadow(0 8px 0 rgba(0,0,0,0.35))', textAlign: 'center', ...style}}>{children}</div>
);
const Center: React.FC<{top: number; children: React.ReactNode; k?: number}> = ({top, children, k = 1}) => (
  <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${k})`}}>{children}</div>
);
const Pill: React.FC<{text: string; bg: string; size?: number}> = ({text, bg, size = 38}) => (
  <div style={{background: bg, border: `5px solid ${INK}`, borderRadius: 60, padding: '10px 30px', fontFamily: 'Poppins', fontSize: size, color: '#fff', boxShadow: '0 8px 0 rgba(0,0,0,0.35)', whiteSpace: 'nowrap'}}>{text}</div>
);
const RedX: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)'}}>
    {[[14, 14, 86, 86], [86, 14, 14, 86]].map(([a, b, c, d], i) => <g key={i}><line x1={a} y1={b} x2={c} y2={d} stroke={INK} strokeWidth={15} strokeLinecap="round" /><line x1={a} y1={b} x2={c} y2={d} stroke={RED} strokeWidth={8} strokeLinecap="round" /></g>)}
  </svg>
);
const Tag: React.FC = () => (
  <div style={{position: 'absolute', bottom: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
    <div style={{background: 'rgba(0,0,0,0.55)', border: `4px solid ${GOLD}`, borderRadius: 40, padding: '10px 30px', fontFamily: 'Poppins', fontSize: 34, color: '#fff', letterSpacing: 1}}>BUT WHAT DOES THE BIBLE SAY?</div>
  </div>
);
const THEMES: Record<string, string> = {
  sunset: 'radial-gradient(ellipse at 50% 74%, #f7b867 0%, #c4623e 38%, #4a1f2a 75%, #1a0c14 100%)',
  night: 'radial-gradient(ellipse at 50% 30%, #3a4f8f 0%, #1c2550 45%, #0b0f24 100%)',
  dawn: 'radial-gradient(ellipse at 50% 80%, #ffe2a0 0%, #e99a6a 35%, #6b4a7a 75%, #241a33 100%)',
  royal: 'radial-gradient(ellipse at 50% 60%, #8a5cc0 0%, #4b2a7a 45%, #1a0e2e 100%)',
  earth: 'radial-gradient(ellipse at 50% 70%, #d9a45c 0%, #8a5a2e 45%, #2a1a10 100%)',
};
const colorOf = (c?: string) => (c === 'gold' ? GOLD : c === 'red' ? '#ff6b5e' : c || '#fff');

const TitleCard: React.FC<{title: any}> = ({title}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: THEMES[title.theme] || THEMES.sunset}}>
      <div style={{position: 'absolute', left: 540 - 190, top: 1120, width: 380, height: 380, borderRadius: 190, background: 'radial-gradient(circle, #fff6d8 0%, #ffd27a 45%, #ffd27a00 72%)', opacity: 0.55 + 0.1 * Math.sin(f / 6)}} />
      <Center top={title.top ?? 300} k={interpolate(f, [0, 20], [1.06, 1], clamp)}>
        {title.kicker && <Outlined size={64} stroke={12} style={{marginBottom: 18}}>{title.kicker}</Outlined>}
        {title.lines.map((l: any, i: number) => <Outlined key={i} size={l.size || 130} color={colorOf(l.color)} stroke={20} style={{marginBottom: 10}}>{l.text}</Outlined>)}
      </Center>
      {title.crossed && <div style={{position: 'absolute', left: 340, top: 860, width: 400, height: 400}}>
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Outlined size={300} stroke={18}>{title.crossed}</Outlined></div>
        <RedX size={380} />
      </div>}
      <Tag />
    </AbsoluteFill>
  );
};

const Scene: React.FC<{clip: string; len: number; clipFrames: number; still?: boolean}> = ({clip, len, clipFrames, still}) => {
  const f = useCurrentFrame();
  const rate = len <= clipFrames ? 1 : Math.max(0.5, clipFrames / len);
  const zoom = still ? 1 : interpolate(f, [0, len], [1, 1.06], clamp);
  const src = staticFile(`lib/${clip}.mp4`);
  const loops = Math.ceil(len * rate / clipFrames);
  if (loops <= 1) return <AbsoluteFill style={{transform: `scale(${zoom})`}}><OffthreadVideo src={src} playbackRate={rate} muted /></AbsoluteFill>;
  const per = Math.floor(clipFrames / rate);
  return <AbsoluteFill style={{transform: `scale(${zoom})`}}>{Array.from({length: loops}).map((_, i) =>
    <Sequence key={i} from={i * per} durationInFrames={per}><OffthreadVideo src={src} playbackRate={rate} muted /></Sequence>)}</AbsoluteFill>;
};

// ---- v2 look (pilot, 27 Nov 2026): camera moves on every shot, whip-pan transitions with motion blur,
// warm grade + floating dust, one small caption word at a time, fewer big text layers.
const WHIP = 7; // frames on each side of a cut
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const MOVES = [
  {s0: 1.04, s1: 1.2, x0: 0, x1: 0, y0: 0, y1: -40, r0: 0, r1: 0.6},      // slow push-in
  {s0: 1.22, s1: 1.06, x0: 0, x1: 0, y0: -30, y1: 20, r0: -0.5, r1: 0},   // pull-back reveal
  {s0: 1.16, s1: 1.16, x0: 70, x1: -70, y0: 0, y1: 0, r0: 0, r1: 0},      // pan right-to-left
  {s0: 1.1, s1: 1.22, x0: -50, x1: 30, y0: 40, y1: -30, r0: 0.4, r1: -0.4}, // crane up + push
  {s0: 1.18, s1: 1.18, x0: -70, x1: 70, y0: 10, y1: -10, r0: 0, r1: 0},   // pan left-to-right
];
const SceneV2: React.FC<{clip: string; len: number; clipFrames: number; idx: number; first: boolean; last: boolean}> = ({clip, len, clipFrames, idx, first, last}) => {
  const f = useCurrentFrame() - (first ? 0 : WHIP);
  const m = clip === 'outro' || clip.startsWith('stage_') ? {s0: 1.03, s1: 1.1, x0: 0, x1: 0, y0: 0, y1: 0, r0: 0, r1: 0} : MOVES[idx % MOVES.length];
  const t = ease(Math.min(1, Math.max(0, f / Math.max(1, len))));
  const lerp = (a: number, b: number) => a + (b - a) * t;
  const hand = Math.sin(f / 23) * 6, hand2 = Math.cos(f / 31) * 5;
  // whip-pan: this shot and the next one overlap for WHIP frames and slide across together, blurred sideways
  let wx = 0, blur = 0;
  if (!last && f >= len - WHIP) { const p = ease((f - (len - WHIP) + 1) / WHIP); wx = -p * 1180; blur = Math.sin(p * Math.PI) * 60 + 8; }
  if (!first && f < 0) { const p = ease((f + WHIP + 1) / WHIP); wx = (1 - p) * 1180; blur = Math.sin(p * Math.PI) * 60 + 8; }
  const ws = 0;
  const id = `mb${idx}`;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <svg width={0} height={0} style={{position: 'absolute'}}><filter id={id} x="-20%" y="0" width="140%" height="100%"><feGaussianBlur stdDeviation={`${blur.toFixed(1)} ${(blur * 0.08).toFixed(1)}`} /></filter></svg>
      <AbsoluteFill style={{transform: `translate(${lerp(m.x0, m.x1) + hand + wx}px, ${lerp(m.y0, m.y1) + hand2}px) scale(${lerp(m.s0, m.s1) + ws}) rotate(${lerp(m.r0, m.r1)}deg)`, filter: blur > 0.5 ? `url(#${id})` : undefined}}>
        <Scene clip={clip} len={len + (first ? 0 : WHIP)} clipFrames={clipFrames} still />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
const Dust: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{pointerEvents: 'none'}}>
    {Array.from({length: 22}).map((_, i) => {
      const sx = (i * 397) % 1080, sp = 0.25 + ((i * 13) % 7) / 12;
      const y = 1920 - ((f * sp * 2 + i * 233) % 2100), x = sx + Math.sin((f + i * 40) / 40) * 30;
      const r = 3 + (i % 4) * 2;
      return <div key={i} style={{position: 'absolute', left: x, top: y, width: r * 2, height: r * 2, borderRadius: r, background: '#fff3c8', opacity: 0.18 + 0.12 * Math.sin((f + i * 17) / 15), filter: 'blur(1.5px)'}} />;
    })}
  </AbsoluteFill>;
};
const Grade2: React.FC = () => {
  const f = useCurrentFrame();
  const lx = 30 + 25 * Math.sin(f / 90);
  return <>
    <AbsoluteFill style={{background: `radial-gradient(ellipse at ${lx}% 8%, rgba(255,214,150,0.28) 0%, rgba(255,214,150,0) 45%)`, mixBlendMode: 'screen'}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(255,190,120,0.06), rgba(40,20,60,0.10))', mixBlendMode: 'soft-light'}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 52%, rgba(10,5,15,0.5) 100%)'}} />
  </>;
};
const Captions2: React.FC<{plan: Plan}> = ({plan}) => {
  const f = useCurrentFrame();
  const C = plan.cues; const KEY = new Set(plan.keywords);
  const i = C.findIndex(([a, b], j) => f >= a && f < b + 3 && (j === C.length - 1 || f < C[j + 1][0]));
  if (i < 0) return null;
  const [a, b, txt] = C[i];
  const ws = txt.split(' '); const n = ws.length; const span = Math.max(1, b - a);
  const k = Math.min(n - 1, Math.floor(((f - a) / span) * n));
  const w = ws[Math.max(0, k)]; const s0 = a + Math.floor((Math.max(0, k) * span) / n);
  const pk = spring({frame: f - s0, fps: 30, config: {damping: 12, stiffness: 300, mass: 0.4}});
  return (
    <div style={{position: 'absolute', top: 1300, width: '100%', display: 'flex', justifyContent: 'center', transform: `scale(${0.85 + 0.15 * pk})`}}>
      <Outlined size={74} stroke={16} color={KEY.has(w.toLowerCase().replace(/[^a-z']/g, '')) ? GOLD : '#fff'}>{w}</Outlined>
    </div>
  );
};

const Scroll: React.FC<{it: Item}> = ({it}) => {
  const f = useCurrentFrame();
  const {start, end, top, text, times, ref, refAt, size} = it;
  if (f < start || f > end + 12) return null;
  const HOT = new RegExp(it.hot || '^$', 'i');
  const words = text.split(' ');
  const open = interpolate(f, [start, start + 16], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.3))});
  const out = interpolate(f, [end, end + 10], [1, 0], {...clamp, easing: Easing.in(Easing.cubic)});
  const W = 120 + 820 * open;
  const H = Math.max(430, 190 + Math.ceil((text.length * size * 0.5) / 760) * size * 1.3);
  return (
    <div style={{position: 'absolute', top, width: '100%', display: 'flex', justifyContent: 'center', transform: `scale(${out}) translateY(${(1 - out) * -80}px)`, opacity: out}}>
      <div style={{position: 'relative', width: W, height: H}}>
        <div style={{position: 'absolute', inset: '14px 30px', background: 'linear-gradient(180deg,#fbf3dc,#f1e2bb)', border: `5px solid ${INK}`, boxShadow: '0 14px 0 rgba(0,0,0,0.3), inset 0 0 40px rgba(170,120,60,0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{fontFamily: 'Lora', fontWeight: 600, fontSize: size, color: INK, textAlign: 'center', lineHeight: 1.28, width: 760}}>
            {words.map((w: string, i: number) => {
              const s = times[Math.min(i, times.length - 1)] ?? start;
              const on = interpolate(f, [s, s + 5], [0, 1], clamp); const lit = f >= s && f < s + 14;
              const hot = HOT.test(w.replace(/[^A-Za-z']/g, '')) && f >= s;
              return <span key={i} style={{display: 'inline-block', marginRight: 12, opacity: 0.5 + 0.5 * on, transform: `translateY(${(1 - on) * 10}px) scale(${lit ? 1.08 : 1})`, color: lit || hot ? '#a8461e' : INK}}>{w}</span>;
            })}
          </div>
          <div style={{marginTop: 12, transform: `scale(${pop(f, refAt)})`, background: '#f4c44c', border: `4px solid ${INK}`, borderRadius: 40, padding: '8px 30px', fontFamily: 'Poppins', fontWeight: 700, fontSize: 42, color: INK}}>{ref}</div>
        </div>
        {[0, W - 44].map((x, i) => <div key={i} style={{position: 'absolute', left: x, top: 0, width: 44, height: H, borderRadius: 22, background: 'linear-gradient(90deg,#6e4424,#b57a44 45%,#6e4424)', border: `5px solid ${INK}`}} />)}
      </div>
    </div>
  );
};

const Captions: React.FC<{plan: Plan}> = ({plan}) => {
  const f = useCurrentFrame();
  if (f < plan.titleEnd - 2) return null;
  const C = plan.cues; const KEY = new Set(plan.keywords);
  const c = C.find(([a, b], i) => f >= a && f < b + 3 && (i === C.length - 1 || f < C[i + 1][0]));
  if (!c) return null;
  const k = spring({frame: f - c[0], fps: 30, config: {damping: 10, stiffness: 260, mass: 0.5}});
  return (
    <div style={{position: 'absolute', top: 1395 - 52, width: '100%', display: 'flex', justifyContent: 'center', transform: `scale(${0.8 + 0.2 * k})`}}>
      <Outlined size={92} stroke={20}>{c[2].split(' ').map((w, i) => <span key={i} style={{color: KEY.has(w.toLowerCase().replace(/[^a-z']/g, '')) ? GOLD : '#fff', marginRight: 22}}>{w}</span>)}</Outlined>
    </div>
  );
};

const Overlay: React.FC<{it: Item}> = ({it}) => {
  const f = useCurrentFrame();
  if (it.kind === 'scroll') return <Scroll it={it} />;
  if (f < it.from || f > it.to) return null;
  const fade = interpolate(f, [it.to - 6, it.to], [1, 0], clamp);
  if (it.kind === 'follow') {
    const k = pop(f, it.from + 2, 10);
    return <AbsoluteFill style={{opacity: fade}}><Center top={240} k={k}>
      <div style={{width: 900, background: 'linear-gradient(180deg,#ffd86a,#f4b83a)', border: `6px solid ${INK}`, borderRadius: 34, padding: '30px 30px 26px', textAlign: 'center', boxShadow: '0 14px 0 rgba(0,0,0,0.35)'}}>
        <div style={{fontFamily: 'Poppins', fontSize: 92, color: INK, lineHeight: 1}}>FOLLOW</div>
        <div style={{fontFamily: 'Poppins', fontSize: 46, color: INK, marginTop: 10, lineHeight: 1.15}}>a new Bible answer every day</div>
        <div style={{fontSize: 80, marginTop: 6, transform: `translateY(${Math.abs(Math.sin(f / 6)) * 14}px)`}}>👇</div>
      </div>
    </Center></AbsoluteFill>;
  }
  if (it.kind === 'hook') {
    // the cover's words over the moving hook scene, visible from frame 0
    const t = it.title;
    return <AbsoluteFill style={{opacity: fade}}><Center top={150}>
      {t.kicker && <Outlined size={58} stroke={12} style={{marginBottom: 10}}>{t.kicker}</Outlined>}
      {t.lines.map((l: any, i: number) => <Outlined key={i} size={Math.round((l.size || 130) * 0.95)} color={colorOf(l.color)} stroke={18} style={{marginBottom: 6}}>{l.text}</Outlined>)}
    </Center></AbsoluteFill>;
  }
  if (f < it.at) return null;
  const k = pop(f, it.at, it.kind === 'big' ? 8 : 11);
  if (it.kind === 'pill') return <AbsoluteFill style={{opacity: fade}}><Center top={it.top} k={k}><Pill text={it.text} bg={it.bg} size={it.size} /></Center></AbsoluteFill>;
  if (it.kind === 'big') return <AbsoluteFill style={{opacity: fade}}><Center top={it.top} k={k}><Outlined size={it.size} color={it.color} stroke={18}>{it.text}</Outlined></Center></AbsoluteFill>;
  if (it.kind === 'myth') return <AbsoluteFill style={{opacity: fade}}><Center top={200} k={k}>
    <Outlined size={56} stroke={12}>THE BIBLE NEVER SAYS</Outlined>
    <div style={{position: 'relative', marginTop: 14, padding: '0 30px'}}><Outlined size={fitBig(it.text)} color={GOLD} stroke={18}>{it.text}</Outlined><RedX size={260} /></div>
  </Center></AbsoluteFill>;
  return null;
};
const fitBig = (t: string) => (t.length < 10 ? 120 : t.length < 16 ? 96 : 76);

export const Quick: React.FC<{plan: Plan}> = ({plan}) => {
  const f = useCurrentFrame();
  const flash = Math.max(0, ...plan.cuts.map((c) => (f >= c && f < c + 6 ? interpolate(f, [c, c + 5], [0.45, 0], clamp) : 0)));
  if ((plan as any).style === 'v2') {
    // keep the hook's big words (frame 0), myth card, pills, scrolls, follow card; drop the other big text layers
    const items = plan.items.filter((it) => it.kind !== 'big' || it.from === 0);
    const n = plan.segs.length;
    return (
      <AbsoluteFill style={{background: '#000'}}>
        {plan.segs.map((s, i) => <Sequence key={s.from} from={s.from - (i ? WHIP : 0)} durationInFrames={s.to - s.from + 1 + (i ? WHIP : 0)}><SceneV2 clip={s.clip} len={s.to - s.from + 1} clipFrames={s.clipFrames} idx={i} first={i === 0} last={i === n - 1} /></Sequence>)}
        <Audio src={staticFile(plan.audio)} />
        <Dust />
        <Grade2 />
        {items.map((it, i) => <Overlay key={i} it={it} />)}
        <Captions2 plan={plan} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {plan.segs.map((s) => <Sequence key={s.from} from={s.from} durationInFrames={s.to - s.from + 1}><Scene clip={s.clip} len={s.to - s.from + 1} clipFrames={s.clipFrames} /></Sequence>)}
      <Audio src={staticFile(plan.audio)} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 58%, rgba(0,0,0,0.28) 100%)'}} />
      {plan.titleEnd > 0 && <Sequence from={0} durationInFrames={plan.titleEnd}><TitleCard title={plan.title} /></Sequence>}
      {plan.items.map((it, i) => <Overlay key={i} it={it} />)}
      <Captions plan={plan} />
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
    </AbsoluteFill>
  );
};
