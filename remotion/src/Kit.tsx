import React from 'react';
import {AbsoluteFill, interpolate, Easing} from 'remotion';
import {Toon, INK} from './Toon';
import {LOOKS, WORLD, H, rnd, clamp} from './Scenes';

// 3D-look scene kit (28 Nov 2026, Abundance: "generate new scenes that match the script").
// Same cast as the 3D clips, staged the way those clips look: close camera, depth-of-field blur on
// far and near layers, soft cast shadows, haze, volumetric light, warm grade.
// Keep faces/action between y=650 and y=1450 (top = scrolls/titles, bottom = captions).

export type Cam = {from: number; to: number; push?: [number, number]; rise?: number};

// depth layer: k = parallax (0 far .. 1 subject .. 1.4 foreground), blur in px
export const D: React.FC<{f: number; cam: Cam; k: number; blur?: number; o?: number; children: React.ReactNode}> = ({f, cam, k, blur = 0, o = 1, children}) => {
  const p = interpolate(f, [0, 300], [0, 1], {...clamp, easing: Easing.inOut(Easing.sin)});
  const x = -(cam.from + (cam.to - cam.from) * p) * k;
  const y = (cam.rise ?? 0) * p * k;
  const [s0, s1] = cam.push ?? [1, 1.07];
  const s = 1 + (s0 - 1 + (s1 - s0) * p) * (0.4 + k * 0.6);
  const fb = blur >= 8;  // only near-foreground layers are blurred (far depth comes from haze; blur there is too slow to render)
  return <AbsoluteFill style={{transform: `scale(${s}) translate(${x}px, ${y}px)`, transformOrigin: '50% 60%', opacity: o}}>
    {fb ? <div style={{position: 'absolute', left: -400, top: 1450, width: WORLD + 800, height: H - 1250, overflow: 'hidden', filter: `blur(${blur}px)`}}>
      <div style={{position: 'absolute', left: 400, top: -1450, width: WORLD, height: H}}>{children}</div></div>
      : <div style={{position: 'absolute', left: 0, top: 0, width: WORLD, height: H}}>{children}</div>}
  </AbsoluteFill>;
};
export const S: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width={WORLD} height={H} viewBox={`0 0 ${WORLD} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{children}</svg>
);

// soft shaded shapes (no hard ink lines on scenery, like the 3D clips)
export const grad = (id: string, stops: [number, string, number?][], vertical = true) => (
  <linearGradient id={id} x1="0" y1="0" x2={vertical ? 0 : 1} y2={vertical ? 1 : 0}>
    {stops.map(([o, c, a], i) => <stop key={i} offset={o} stopColor={c} stopOpacity={a ?? 1} />)}
  </linearGradient>
);
export const rgrad = (id: string, stops: [number, string, number?][]) => (
  <radialGradient id={id}>{stops.map(([o, c, a], i) => <stop key={i} offset={o} stopColor={c} stopOpacity={a ?? 1} />)}</radialGradient>
);
export const SkyG: React.FC<{id: string; c: string[]}> = ({id, c}) => (
  <><defs>{grad(id, c.map((cc, i) => [i / (c.length - 1), cc]))}</defs><rect x={-400} y={-200} width={WORLD + 800} height={H + 400} fill={`url(#${id})`} /></>
);
export const Sun: React.FC<{x: number; y: number; r: number; c?: string; id: string; core?: boolean}> = ({x, y, r, c = '#fff2c4', id, core = true}) => (
  <><defs>{rgrad(id, [[0, c, 1], [0.25, c, 0.55], [1, c, 0]])}</defs><circle cx={x} cy={y} r={r} fill={`url(#${id})`} />
    {core && <circle cx={x} cy={y} r={r * 0.09} fill="#fffaf0" />}</>
);
const ridge = (y: number, amp: number, seed: number, n = 5) => {
  let d = `M -400 ${H + 200} L -400 ${y}`; const step = (WORLD + 800) / n;
  for (let i = 0; i < n; i++) {
    const x0 = -400 + i * step, x1 = x0 + step, h = y - amp * (0.3 + rnd(seed + i) * 0.9);
    d += ` C ${x0 + step * 0.3} ${h} ${x1 - step * 0.3} ${h} ${x1} ${y - amp * 0.2 * rnd(seed + i + 7)}`;
  }
  return d + ` L ${WORLD + 400} ${H + 200} Z`;
};
export const Ridge: React.FC<{y: number; amp: number; seed: number; c: string; c2?: string; id: string; n?: number}> = ({y, amp, seed, c, c2, id, n}) => (
  <><defs>{grad(id, [[0, c], [1, c2 ?? c]])}</defs><path d={ridge(y, amp, seed, n)} fill={`url(#${id})`} /></>
);
export const Peak: React.FC<{x: number; y: number; w: number; h: number; c: string; c2: string; id: string; lit?: string}> = ({x, y, w, h, c, c2, id, lit}) => (
  <><defs>{grad(id, [[0, c], [1, c2]])}{lit && grad(id + 'l', [[0, lit, 0.55], [1, lit, 0]], false)}</defs>
    <path d={`M${x - w} ${y} C${x - w * 0.55} ${y - h * 0.55} ${x - w * 0.2} ${y - h} ${x} ${y - h} C${x + w * 0.25} ${y - h} ${x + w * 0.6} ${y - h * 0.5} ${x + w} ${y} Z`} fill={`url(#${id})`} />
    {lit && <path d={`M${x - w} ${y} C${x - w * 0.55} ${y - h * 0.55} ${x - w * 0.2} ${y - h} ${x} ${y - h} L${x} ${y} Z`} fill={`url(#${id}l)`} />}</>
);
export const Field: React.FC<{y: number; c: string; c2: string; id: string; spots?: string; n?: number; f?: number}> = ({y, c, c2, id, spots, n = 90}) => (
  <><defs>{grad(id, [[0, c], [1, c2]])}</defs><rect x={-400} y={y} width={WORLD + 800} height={H - y + 300} fill={`url(#${id})`} />
    {spots && Array.from({length: n}).map((_, i) => {
      const yy = y + 10 + Math.pow(rnd(i * 9 + 4), 1.4) * (H - y), sc = 0.4 + (yy - y) / (H - y) * 1.4;
      return <ellipse key={i} cx={rnd(i * 5 + 2) * (WORLD + 400) - 200} cy={yy} rx={9 * sc} ry={4 * sc} fill={spots} opacity={0.45} />;
    })}</>
);
export const Fog: React.FC<{y: number; h?: number; c: string; o?: number; id: string}> = ({y, h = 500, c, o = 0.6, id}) => (
  <><defs>{grad(id, [[0, c, 0], [0.5, c, o], [1, c, 0]])}</defs><rect x={-400} y={y - h / 2} width={WORLD + 800} height={h} fill={`url(#${id})`} /></>
);
export const Beams: React.FC<{x: number; y: number; f: number; c?: string; n?: number; len?: number; o?: number; spread?: number; dir?: number}> = ({x, y, f, c = '#fff3c8', n = 7, len = 2200, o = 0.13, spread = 50, dir = 0}) => (
  <g style={{mixBlendMode: 'screen'}}>{Array.from({length: n}).map((_, i) => {
    const a = (dir - spread / 2 + i * (spread / Math.max(1, n - 1)) + Math.sin(f / 50 + i) * 1.5) * Math.PI / 180, w = 0.035 + rnd(i) * 0.03;
    return <path key={i} d={`M${x} ${y} L${x + Math.sin(a - w) * len} ${y + Math.cos(a - w) * len} L${x + Math.sin(a + w) * len} ${y + Math.cos(a + w) * len} Z`} fill={c} opacity={o * (0.6 + 0.4 * Math.sin(f / 30 + i * 1.7))} />;
  })}</g>
);
export const Dust: React.FC<{f: number; c?: string; n?: number; y0?: number; y1?: number}> = ({f, c = '#fff1c8', n = 34, y0 = 300, y1 = 1600}) => (
  <g>{Array.from({length: n}).map((_, i) => {
    const sp = 0.2 + rnd(i * 13) * 0.6, x = (rnd(i * 3) * WORLD + f * sp) % WORLD, y = y0 + rnd(i * 17) * (y1 - y0) + Math.sin(f / 25 + i) * 20;
    return <circle key={i} cx={x} cy={y} r={1.5 + rnd(i * 7) * 3.5} fill={c} opacity={0.25 + 0.3 * Math.sin(f / 18 + i)} />;
  })}</g>
);

// soft scenery props (shaded, no hard outlines)
export const Tree: React.FC<{x: number; y: number; s?: number; c?: string; c2?: string; f?: number; id: string}> = ({x, y, s = 1, c = '#6f9a4a', c2 = '#3f6a2a', f = 0, id}) => {
  const sw = Math.sin(f / 40 + x) * 1.5;
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <defs>{rgrad(id, [[0, c], [1, c2]])}</defs>
    <path d="M-16 0 Q-26 -110 -4 -200 L10 -200 Q22 -100 16 0 Z" fill="#5e4028" />
    <g transform={`rotate(${sw} 0 -200)`}>{[[-80, -230, 100], [60, -250, 110], [-10, -330, 110], [100, -180, 70], [-120, -170, 70]].map(([cx, cy, r], i) =>
      <circle key={i} cx={cx} cy={cy} r={r} fill={`url(#${id})`} />)}</g>
  </g>;
};
export const Boulder: React.FC<{x: number; y: number; w: number; h: number; c?: string; c2?: string; id: string}> = ({x, y, w, h, c = '#9a8a78', c2 = '#5a4a3e', id}) => (
  <><defs>{grad(id, [[0, c], [1, c2]])}</defs>
    <path d={`M${x - w / 2} ${y} Q${x - w * 0.5} ${y - h * 0.9} ${x - w * 0.1} ${y - h} Q${x + w * 0.42} ${y - h * 1.02} ${x + w / 2} ${y} Z`} fill={`url(#${id})`} />
    <ellipse cx={x} cy={y + 4} rx={w * 0.55} ry={h * 0.1} fill="#000" opacity={0.25} /></>
);
export const Grass: React.FC<{x: number; y: number; s?: number; c?: string; f: number; seed?: number}> = ({x, y, s = 1, c = '#4f7a32', f, seed = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>{Array.from({length: 9}).map((_, i) => {
    const bx = (i - 4) * 14, h = 90 + rnd(i + seed) * 90, sw = Math.sin(f / 22 + i + seed) * 12;
    return <path key={i} d={`M${bx - 6} 0 Q${bx + sw * 0.5} ${-h * 0.6} ${bx + sw} ${-h} Q${bx + 4 + sw * 0.4} ${-h * 0.5} ${bx + 8} 0 Z`} fill={c} />;
  })}</g>
);
export const Wood: React.FC<{x: number; y: number; s?: number; r?: number}> = ({x, y, s = 1, r = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>{[0, 16, 32, 8].map((d, i) => <rect key={i} x={i === 3 ? 20 : 0} y={d - (i === 3 ? 14 : 0)} width={150} height={16} rx={8} fill={i % 2 ? '#8a5a30' : '#a06a3a'} stroke={INK} strokeWidth={3} />)}
    <path d="M40 -8 L40 50 M110 -8 L110 50" stroke="#c9a46a" strokeWidth={5} /></g>
);
export const Altar: React.FC<{x: number; y: number; s?: number; wood?: boolean}> = ({x, y, s = 1, wood = true}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[0, 1, 2].map((r) => Array.from({length: 4 - r}).map((_, i) => <ellipse key={`${r}${i}`} cx={-110 + r * 35 + i * 72} cy={-30 - r * 52} rx={42} ry={30} fill={['#9a8a78', '#8a7a68', '#a89a88'][(i + r) % 3]} stroke="#3a3028" strokeWidth={3} />))}
    {wood && <g transform="translate(-75 -205)">{[0, 18, 36].map((d) => <rect key={d} x={0} y={d} width={150} height={18} rx={9} fill="#8a5a30" stroke={INK} strokeWidth={3} />)}</g>}
  </g>
);
export const Ram: React.FC<{x: number; y: number; s?: number; f: number}> = ({x, y, s = 1, f}) => {
  const tug = Math.sin(f / 7) * 5;
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-45, -15, 30, 55].map((lx, i) => <path key={i} d={`M${lx} -20 L${lx + (i % 2 ? 4 : -4)} 50`} stroke="#3a2a22" strokeWidth={12} strokeLinecap="round" />)}
    {[[-50, -60, 48], [0, -74, 52], [50, -60, 46], [-20, -34, 46], [30, -34, 44]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill={i === 1 ? '#f4efe2' : '#e8e0cc'} />)}
    <g transform={`translate(${98 + tug} -72) rotate(${tug})`}>
      <ellipse cx={0} cy={0} rx={30} ry={36} fill="#4a3a30" />
      <circle cx={10} cy={-8} r={5} fill="#fff" />
      <path d="M-14 -24 C-60 -60 -70 10 -30 4 C-10 0 -20 -24 -6 -22" stroke="#c9b48a" strokeWidth={13} fill="none" strokeLinecap="round" />
    </g>
  </g>;
};
export const Thicket: React.FC<{x: number; y: number; s?: number; id: string}> = ({x, y, s = 1, id}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <defs>{rgrad(id, [[0, '#6a7a3a'], [1, '#2f3f1e']])}</defs>
    {[[-120, -60, 90], [-30, -100, 110], [90, -70, 95], [170, -30, 70], [-190, -20, 60]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill={`url(#${id})`} />)}
    {Array.from({length: 14}).map((_, i) => <path key={i} d={`M${-180 + i * 26} -10 l${rnd(i) * 30 - 15} ${-60 - rnd(i * 3) * 60}`} stroke="#3a2a1a" strokeWidth={4} />)}
  </g>
);
export const House: React.FC<{x: number; y: number; w: number; h: number; c?: string; c2?: string; id: string; lit?: boolean}> = ({x, y, w, h, c = '#d8bf96', c2 = '#a8885e', id, lit}) => (
  <g><defs>{grad(id, [[0, c], [1, c2]], false)}</defs>
    <rect x={x} y={y - h} width={w} height={h} fill={`url(#${id})`} />
    <rect x={x - 8} y={y - h - 14} width={w + 16} height={18} fill={c2} />
    <rect x={x + w * 0.4} y={y - h * 0.55} width={w * 0.2} height={h * 0.55} rx={6} fill={lit ? '#ffcf7a' : '#4a3424'} />
    <rect x={x + w * 0.12} y={y - h * 0.8} width={w * 0.14} height={h * 0.16} fill={lit ? '#ffd890' : '#3a2a1e'} /></g>
);
export const Temple: React.FC<{x: number; y: number; s?: number; id: string}> = ({x, y, s = 1, id}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <defs>{grad(id, [[0, '#f4e6c4'], [1, '#c9aa78']])}</defs>
    <rect x={-420} y={-120} width={840} height={120} fill={`url(#${id})`} />
    <rect x={-200} y={-420} width={400} height={300} fill={`url(#${id})`} />
    <rect x={-240} y={-450} width={480} height={36} fill="#e8d4a8" />
    {[-150, -75, 0, 75, 150].map((cx) => <rect key={cx} x={cx - 14} y={-400} width={28} height={270} fill="#fff6e0" opacity={0.75} />)}
    <rect x={-60} y={-260} width={120} height={140} rx={8} fill="#5a3e22" />
    <rect x={-240} y={-470} width={480} height={22} fill="#d8b45a" />
  </g>
);
export const Torch: React.FC<{x: number; y: number; f: number; id: string}> = ({x, y, f, id}) => (
  <g><defs>{rgrad(id, [[0, '#ffd27a', 0.8], [1, '#ff9a3a', 0]])}</defs>
    <circle cx={x} cy={y - 60} r={150 + Math.sin(f / 3) * 8} fill={`url(#${id})`} />
    <rect x={x - 6} y={y - 40} width={12} height={130} fill="#5a3a22" />
    <path transform={`translate(${x} ${y - 40}) scale(1 ${1 + Math.sin(f / 2.5) * 0.1})`} d="M-12 0 Q-14 -40 0 -64 Q16 -36 12 0 Z" fill="#ffcf6a" /></g>
);

// a character with a soft contact shadow and a little light wrap; s ~1.0-1.4 = close camera like the 3D clips
export const Fig: React.FC<{who: string; x: number; ground: number; s?: number; expr?: any; arms?: any; flip?: boolean; seed?: number; talk?: boolean; baby?: boolean; tilt?: number; dim?: number; helmet?: boolean}> =
  ({who, x, ground, s = 1.1, expr, arms, flip, seed = 0, talk, baby, tilt, dim = 0, helmet}) => (
  <>
    <S><ellipse cx={x} cy={ground + 6} rx={120 * s} ry={22 * s} fill="#000" opacity={0.3} style={{filter: 'blur(10px)'}} /></S>
    <div style={{position: 'absolute', inset: 0, filter: `drop-shadow(0 ${14 * s}px ${16 * s}px rgba(0,0,0,0.32))${dim ? ` brightness(${1 - dim})` : ''}`}}>
      <Toon look={LOOKS[who]} x={x - 150 * s} y={ground - 474 * s} scale={s} expr={talk ? 'talk' : expr} arms={arms} flip={flip} seed={seed} baby={baby} tilt={tilt} />
      {helmet && <S><g transform={`translate(${x} ${ground - 474 * s + 140 * s + Math.sin((0 + seed * 20) / 11) * 4 * s}) rotate(${tilt ?? 0}) scale(${s})`}>
        <path d="M-112 -10 A112 112 0 0 1 112 -10 L112 10 L-112 10 Z" fill="#b8a060" stroke={INK} strokeWidth={6} />
        <path d="M-10 -120 Q0 -190 90 -170 Q40 -140 10 -110 Z" fill="#b8322f" stroke={INK} strokeWidth={5} />
        <rect x={-122} y={0} width={244} height={20} rx={8} fill="#8a7440" stroke={INK} strokeWidth={5} /></g></S>}
    </div>
  </>
);
export const walk = (f: number, a: number, b: number) => interpolate(f, [0, 300], [a, b]);

// final grade: warm key light from (lx,ly), ambient occlusion at the bottom, vignette
export const Look3D: React.FC<{lx?: number; ly?: number; kc?: string; warm?: number; night?: boolean; vig?: number}> = ({lx = 50, ly = 30, kc = 'rgba(255,214,150,0.32)', warm = 0.08, night, vig = 0.5}) => (
  <>
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', background: `radial-gradient(circle at ${lx}% ${ly}%, ${kc} 0%, rgba(0,0,0,0) 55%)`}} />
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'multiply', background: `linear-gradient(180deg, rgba(255,255,255,1) 55%, rgba(${night ? '40,40,90' : '120,80,60'},1) 100%)`, opacity: 0.45}} />
    <AbsoluteFill style={{pointerEvents: 'none', background: `rgba(255,170,90,${warm})`, mixBlendMode: 'soft-light'}} />
    <AbsoluteFill style={{pointerEvents: 'none', background: `radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 50%, rgba(0,0,0,${vig}) 100%)`}} />
  </>
);
