import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, Easing} from 'remotion';
import {Toon, CAST, INK, Look} from './Toon';

// 2.5D painted scene library (26 Nov 2026). Each scene: wide painted world in parallax layers,
// a slow gliding camera, ambient motion, and the series cast. Rendered to public/lib/<name>.mp4.
// Keep the action between y=650 and y=1450 (top third = scrolls/titles, bottom = captions).

export const W = 1080, H = 1920, WORLD = 1500;
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export const LOOKS: Record<string, Look> = {
  ...CAST,
  samaritan: {tunic: '#b8322f', dress: '#b8322f', skin: '#a8744e', headcloth: '#e8c070', band: '#7a3a3a'},
  shepherd: {tunic: '#8a6446', toga: '#d9c9a0', skin: '#b07a50', headcloth: '#d9c9a0', band: '#5a6a3a', beard: '#3a2618', shortBeard: true, staff: true},
  shepherd2: {tunic: '#5a6a3a', skin: '#8a5a3c', headcloth: '#efe3c8', band: '#8a3a2a', staff: true},
  paul: {tunic: '#7a3a3a', toga: '#c9a46a', skin: '#b07a50', beard: '#3a2618', shortBeard: true, hair: '#3a2618'},
  moses: {tunic: '#8a3a2a', toga: '#d9c9a0', skin: '#b07a50', beard: '#e8e2d6', brows: '#e8e2d6', headcloth: '#d9c9a0', band: '#3f6aa0', staff: true},
  peter: {tunic: '#3f6aa0', toga: '#8a6446', skin: '#a8744e', hair: '#2a1a10', beard: '#2a1a10', shortBeard: true},
  andrew: {tunic: '#c0532e', skin: '#8a5a3c', hair: '#1e1714', beard: '#1e1714', shortBeard: true},
  roman: {tunic: '#f1e9d6', toga: '#b8322f', skin: '#c99067', hair: '#3a2618'},
  roman2: {tunic: '#f1e9d6', toga: '#3f6aa0', skin: '#e0b48a', hair: '#7a5a3a'},
  elder: {tunic: '#5a4a7a', toga: '#c9a46a', skin: '#c99067', beard: '#f4f1ea', brows: '#f4f1ea', headcloth: '#f4ecd8', band: '#3f6aa0'},
  traveler: {tunic: '#2e8a56', skin: '#6e4630', headcloth: '#e8dcc0', band: '#8a3a2a'},
  sarah: {tunic: '#7a6a9c', dress: '#7a6a9c', skin: '#c99067', headcloth: '#efe3c8', band: '#c0532e'},
  fam1: {tunic: '#e07a2e', skin: '#4a2e20', hair: '#140f0d'},
  fam2: {tunic: '#3f6aa0', dress: '#d63a7a', skin: '#e8c4a0', longHair: '#c08a3a', hair: '#c08a3a'},
  fam3: {tunic: '#2e8a56', skin: '#c99067', hair: '#1e1714'},
  fam4: {tunic: '#7a6a9c', dress: '#f2c03c', skin: '#8a5a3c', headcloth: '#2e8a56', band: '#f2c03c'},
  fam5: {tunic: '#c0532e', skin: '#f0d0b0', hair: '#8a6a4a', beard: '#8a6a4a', shortBeard: true},
};

// ---------- camera + layers ----------
type Cam = {from: number; to: number; push?: [number, number]};
export const Layer: React.FC<{f: number; cam: Cam; k: number; children: React.ReactNode}> = ({f, cam, k, children}) => {
  const p = interpolate(f, [0, 300], [0, 1], {...clamp, easing: Easing.inOut(Easing.sin)});
  const x = -(cam.from + (cam.to - cam.from) * p) * k;
  const [s0, s1] = cam.push ?? [1, 1.06];
  const s = s0 + (s1 - s0) * p;
  return <AbsoluteFill style={{transform: `scale(${s}) translateX(${x}px)`, transformOrigin: '50% 62%'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: WORLD, height: H}}>{children}</div>
  </AbsoluteFill>;
};
export const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width={WORLD} height={H} viewBox={`0 0 ${WORLD} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{children}</svg>
);

// ---------- painting helpers ----------
export const Sky: React.FC<{top: string; mid?: string; bottom: string; id: string}> = ({top, mid, bottom, id}) => (
  <><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} />{mid && <stop offset="0.55" stopColor={mid} />}<stop offset="1" stopColor={bottom} /></linearGradient></defs>
    <rect x={-200} y={0} width={WORLD + 400} height={H} fill={`url(#${id})`} /></>
);
export const Glow: React.FC<{x: number; y: number; r: number; color: string; id: string; o?: number}> = ({x, y, r, color, id, o = 1}) => (
  <><defs><radialGradient id={id}><stop offset="0" stopColor={color} stopOpacity={o} /><stop offset="0.35" stopColor={color} stopOpacity={o * 0.45} /><stop offset="1" stopColor={color} stopOpacity={0} /></radialGradient></defs>
    <circle cx={x} cy={y} r={r} fill={`url(#${id})`} /></>
);
export const Stars: React.FC<{f: number; n: number; maxY: number; seed?: number}> = ({f, n, maxY, seed = 1}) => (
  <g>{Array.from({length: n}).map((_, i) => {
    const x = rnd(i * 3 + seed) * WORLD, y = rnd(i * 7 + seed * 2) * maxY, r = 1.5 + rnd(i * 11 + seed) * 3.2;
    const tw = 0.55 + 0.45 * Math.sin(f / (8 + rnd(i) * 10) + i);
    return <circle key={i} cx={x} cy={y} r={r} fill="#fff8e0" opacity={tw} />;
  })}</g>
);
export const hillPath = (y: number, amp: number, seed: number, bumps = 4) => {
  let d = `M -300 ${H} L -300 ${y}`;
  const n = bumps * 2, step = (WORLD + 600) / n;
  for (let i = 0; i < n; i++) {
    const x0 = -300 + i * step, x1 = x0 + step;
    const h = y - amp * (0.4 + rnd(seed + i) * 0.9) * (i % 2 === 0 ? 1 : 0.35);
    d += ` C ${x0 + step * 0.35} ${h} ${x1 - step * 0.35} ${h} ${x1} ${y - amp * 0.15 * rnd(seed + i + 9)}`;
  }
  return d + ` L ${WORLD + 300} ${H} Z`;
};
export const Hill: React.FC<{y: number; amp: number; color: string; seed: number; bumps?: number; stroke?: boolean}> = ({y, amp, color, seed, bumps, stroke}) => (
  <path d={hillPath(y, amp, seed, bumps)} fill={color} stroke={stroke ? INK : 'none'} strokeWidth={5} opacity={1} />
);
export const Ground: React.FC<{y: number; top: string; bottom: string; id: string; dots?: string}> = ({y, top, bottom, id, dots}) => (
  <><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bottom} /></linearGradient></defs>
    <rect x={-300} y={y} width={WORLD + 600} height={H - y} fill={`url(#${id})`} />
    {dots && Array.from({length: 70}).map((_, i) => <ellipse key={i} cx={rnd(i * 5 + 2) * WORLD} cy={y + 20 + rnd(i * 9 + 4) * (H - y - 20)} rx={5 + rnd(i) * 10} ry={2 + rnd(i * 2) * 4} fill={dots} opacity={0.35} />)}
  </>
);
export const Haze: React.FC<{color: string; y: number; h?: number; id: string; o?: number}> = ({color, y, h = 420, id, o = 0.55}) => (
  <><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity={0} /><stop offset="0.5" stopColor={color} stopOpacity={o} /><stop offset="1" stopColor={color} stopOpacity={0} /></linearGradient></defs>
    <rect x={-300} y={y - h / 2} width={WORLD + 600} height={h} fill={`url(#${id})`} /></>
);
export const Shadow: React.FC<{x: number; y: number; w: number}> = ({x, y, w}) => <ellipse cx={x} cy={y} rx={w} ry={w * 0.16} fill="#000" opacity={0.22} />;
export const Motes: React.FC<{f: number; color: string; n?: number; y0?: number; y1?: number}> = ({f, color, n = 26, y0 = 500, y1 = 1500}) => (
  <g>{Array.from({length: n}).map((_, i) => {
    const sp = 0.3 + rnd(i * 13) * 0.7;
    const x = (rnd(i * 3) * WORLD + f * sp * 1.2) % WORLD, y = y0 + rnd(i * 17) * (y1 - y0) + Math.sin(f / 20 + i) * 18;
    return <circle key={i} cx={x} cy={y} r={2 + rnd(i * 7) * 3} fill={color} opacity={0.35 + 0.35 * Math.sin(f / 15 + i)} />;
  })}</g>
);
export const Grade: React.FC<{vignette?: number; tint?: string}> = ({vignette = 0.42, tint}) => (
  <AbsoluteFill style={{pointerEvents: 'none', background: `radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 45%, rgba(0,0,0,${vignette}) 100%)${tint ? `, ${tint}` : ''}`}} />
);

// ---------- props ----------
export const Tent: React.FC<{x: number; y: number; s?: number; c?: string; c2?: string; glow?: boolean}> = ({x, y, s = 1, c = '#d9b98a', c2 = '#a8744e', glow}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-240 0 L-150 -230 L0 -300 L150 -230 L240 0 Z" fill={c} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M-150 -230 L-110 0 M150 -230 L110 0 M0 -300 L0 -40" stroke={c2} strokeWidth={6} />
    <path d="M-60 0 L0 -170 L60 0 Z" fill={glow ? '#ffcf7a' : '#3a2618'} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {[-205, 205].map((px) => <path key={px} d={`M${px} -20 L${px * 1.35} 10`} stroke={INK} strokeWidth={5} />)}
  </g>
);
export const Well: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={-150} rx={150} ry={36} fill="#5a4a3a" stroke={INK} strokeWidth={6} />
    <path d="M-150 -150 L-150 0 Q0 40 150 0 L150 -150 Q0 -114 -150 -150 Z" fill="#b8a487" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    {[-110, -40, 40, 110].map((bx, i) => <path key={i} d={`M${bx} -130 L${bx} -10`} stroke="#8a7458" strokeWidth={5} />)}
    <path d="M-150 -80 Q0 -40 150 -80" stroke="#8a7458" strokeWidth={5} fill="none" />
    <ellipse cx={0} cy={-150} rx={120} ry={24} fill="#1d2a3a" />
    <path d="M-130 -150 L-130 -330 M130 -150 L130 -330 M-150 -330 L150 -330" stroke="#6e4424" strokeWidth={16} strokeLinecap="round" />
    <path d="M-130 -150 L-130 -330 M130 -150 L130 -330 M-150 -330 L150 -330" stroke={INK} strokeWidth={4} fill="none" opacity={0.6} />
    <path d="M0 -330 L0 -230" stroke="#3a2618" strokeWidth={4} />
    <path d="M-26 -230 L26 -230 L20 -190 L-20 -190 Z" fill="#8a6446" stroke={INK} strokeWidth={5} />
  </g>
);
export const Palm: React.FC<{x: number; y: number; s?: number; f: number}> = ({x, y, s = 1, f}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0 0 Q-30 -220 10 -440" stroke="#7a5230" strokeWidth={34} fill="none" strokeLinecap="round" />
    <path d="M0 0 Q-30 -220 10 -440" stroke={INK} strokeWidth={40} fill="none" opacity={0.25} />
    {Array.from({length: 7}).map((_, i) => {
      const a = -160 + i * 47 + Math.sin(f / 18 + i) * 4;
      return <path key={i} transform={`translate(10 -440) rotate(${a})`} d="M0 0 Q90 -50 200 20 Q100 -10 0 0 Z" fill={i % 2 ? '#3f7a3a' : '#4f9a48'} stroke={INK} strokeWidth={5} />;
    })}
  </g>
);
export const Olive: React.FC<{x: number; y: number; s?: number; c?: string}> = ({x, y, s = 1, c = '#6a8a4a'}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-14 0 Q-30 -90 0 -160 Q20 -90 14 0 Z" fill="#6e4a2a" stroke={INK} strokeWidth={6} />
    {[[-70, -190, 90], [40, -210, 100], [-10, -280, 90], [90, -150, 60], [-110, -140, 60]].map(([cx, cy, r], i) =>
      <circle key={i} cx={cx} cy={cy} r={r} fill={c} stroke={INK} strokeWidth={6} />)}
    {[[-70, -190, 90], [40, -210, 100], [-10, -280, 90]].map(([cx, cy, r], i) => <circle key={i} cx={cx - r * 0.3} cy={cy - r * 0.3} r={r * 0.4} fill="#fff" opacity={0.12} />)}
  </g>
);
export const Rock: React.FC<{x: number; y: number; w: number; h: number; c?: string}> = ({x, y, w, h, c = '#9a7a5a'}) => (
  <path d={`M${x - w / 2} ${y} Q${x - w * 0.45} ${y - h} ${x - w * 0.1} ${y - h} Q${x + w * 0.35} ${y - h * 1.05} ${x + w / 2} ${y} Z`} fill={c} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
);
export const Column: React.FC<{x: number; y: number; h: number; c?: string}> = ({x, y, h, c = '#efe6d2'}) => (
  <g>
    <rect x={x - 40} y={y - h} width={80} height={h} fill={c} stroke={INK} strokeWidth={6} />
    {[-20, 0, 20].map((d) => <path key={d} d={`M${x + d} ${y - h + 20} L${x + d} ${y - 20}`} stroke="#cfc3a8" strokeWidth={6} />)}
    <rect x={x - 58} y={y - h - 30} width={116} height={34} fill={c} stroke={INK} strokeWidth={6} />
    <rect x={x - 58} y={y - 24} width={116} height={28} fill={c} stroke={INK} strokeWidth={6} />
  </g>
);
export const Banner: React.FC<{x: number; y: number; f: number; c?: string}> = ({x, y, f, c = '#b8322f'}) => {
  const w = Math.sin(f / 10 + x) * 8;
  return <g><path d={`M${x} ${y} L${x + 90} ${y} L${x + 90 + w} ${y + 230} L${x + 45 + w} ${y + 200} L${x + w} ${y + 230} Z`} fill={c} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <circle cx={x + 45 + w * 0.5} cy={y + 90} r={24} fill="#f2c03c" stroke={INK} strokeWidth={4} /></g>;
};
export const Wall: React.FC<{y: number; x0: number; x1: number; h: number; c?: string; gateX?: number}> = ({y, x0, x1, h, c = '#d8b98a', gateX}) => {
  const cren = [];
  for (let x = x0; x < x1; x += 60) cren.push(<rect key={x} x={x} y={y - h - 34} width={36} height={36} fill={c} stroke={INK} strokeWidth={5} />);
  return <g>
    {cren}
    <rect x={x0} y={y - h} width={x1 - x0} height={h} fill={c} stroke={INK} strokeWidth={6} />
    {Array.from({length: Math.floor((x1 - x0) / 70) * 4}).map((_, i) => <rect key={i} x={x0 + rnd(i) * (x1 - x0 - 60)} y={y - h + 20 + rnd(i * 3) * (h - 50)} width={50} height={22} fill="#000" opacity={0.06} />)}
    {gateX !== undefined && <g>
      <rect x={gateX - 120} y={y - h - 140} width={240} height={h + 140} fill={c} stroke={INK} strokeWidth={6} />
      {Array.from({length: 4}).map((_, i) => <rect key={i} x={gateX - 120 + i * 66} y={y - h - 174} width={40} height={36} fill={c} stroke={INK} strokeWidth={5} />)}
      <path d={`M${gateX - 70} ${y} L${gateX - 70} ${y - 160} A70 70 0 0 1 ${gateX + 70} ${y - 160} L${gateX + 70} ${y} Z`} fill="#3a2618" stroke={INK} strokeWidth={6} />
    </g>}
  </g>;
};
export const Boat: React.FC<{x: number; y: number; s?: number; f: number}> = ({x, y, s = 1, f}) => {
  const rock = Math.sin(f / 16) * 2.5, bob = Math.sin(f / 13) * 8;
  return <g transform={`translate(${x} ${y + bob}) rotate(${rock}) scale(${s})`}>
    <path d="M0 -380 L0 -40" stroke="#6e4424" strokeWidth={14} />
    <path d={`M8 -370 Q${130 + Math.sin(f / 9) * 10} -230 10 -90 Z`} fill="#f4ecd8" stroke={INK} strokeWidth={6} />
    <path d="M-300 -60 L300 -60 Q260 40 -230 40 Z" fill="#8a5a30" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M-280 -30 L280 -30" stroke="#6e4424" strokeWidth={6} />
  </g>;
};
export const Water: React.FC<{y: number; f: number; c?: string; c2?: string; id: string}> = ({y, f, c = '#3f7aa8', c2 = '#1f4a70', id}) => (
  <g>
    <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c} /><stop offset="1" stopColor={c2} /></linearGradient></defs>
    <rect x={-300} y={y} width={WORLD + 600} height={H - y} fill={`url(#${id})`} />
    {Array.from({length: 26}).map((_, i) => {
      const yy = y + 30 + rnd(i * 3) * (H - y - 60), xx = (rnd(i * 7) * WORLD + f * (0.6 + rnd(i)) ) % (WORLD + 200) - 100;
      return <path key={i} d={`M${xx} ${yy} q30 -12 60 0 q30 12 60 0`} stroke="#fff" strokeWidth={4} fill="none" opacity={0.35} strokeLinecap="round" />;
    })}
  </g>
);
export const Cross: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-18} y={-420} width={36} height={420} fill="#5a3a22" stroke={INK} strokeWidth={6} />
    <rect x={-120} y={-330} width={240} height={34} fill="#5a3a22" stroke={INK} strokeWidth={6} />
  </g>
);
export const Sheep: React.FC<{x: number; y: number; s?: number; f: number; seed?: number}> = ({x, y, s = 1, f, seed = 0}) => {
  const b = Math.abs(Math.sin((f + seed * 17) / 12)) * 4;
  return <g transform={`translate(${x} ${y - b}) scale(${s})`}>
    <path d="M-40 -10 L-40 30 M30 -10 L30 30" stroke={INK} strokeWidth={10} strokeLinecap="round" />
    {[[-40, -50, 40], [0, -62, 44], [40, -50, 40], [-15, -30, 40], [25, -30, 38]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill="#f4f0e6" stroke={INK} strokeWidth={5} />)}
    <ellipse cx={78} cy={-58} rx={26} ry={30} fill="#3a2a22" stroke={INK} strokeWidth={5} />
    <circle cx={86} cy={-64} r={4} fill="#fff" />
  </g>;
};
export const Lion: React.FC<{x: number; y: number; s?: number; f: number}> = ({x, y, s = 1, f}) => {
  const st = Math.sin(f / 5);
  const leg = (lx: number, ph: number) => <path d={`M${lx} -40 L${lx + st * 18 * ph} 40`} stroke="#b8782c" strokeWidth={30} strokeLinecap="round" />;
  return <g transform={`translate(${x} ${y + Math.abs(st) * -4}) scale(${s})`}>
    <path d={`M-150 -70 Q-230 ${-110 + st * 12} -250 -40`} stroke="#b8782c" strokeWidth={14} fill="none" strokeLinecap="round" />
    <circle cx={-252} cy={-38} r={18} fill="#6e3a14" stroke={INK} strokeWidth={4} />
    {leg(-110, -1)}{leg(90, 1)}
    <ellipse cx={-10} cy={-70} rx={170} ry={74} fill="#d29a46" stroke={INK} strokeWidth={7} />
    {leg(-80, 1)}{leg(120, -1)}
    <circle cx={150} cy={-120} r={92} fill="#8a4a1c" stroke={INK} strokeWidth={7} />
    <circle cx={172} cy={-112} r={56} fill="#e0aa58" stroke={INK} strokeWidth={6} />
    <ellipse cx={220} cy={-96} rx={22} ry={18} fill="#c4844a" stroke={INK} strokeWidth={5} />
    <ellipse cx={232} cy={-104} rx={9} ry={7} fill={INK} />
    <ellipse cx={190} cy={-130} rx={7} ry={10} fill={INK} />
    <path d="M196 -82 Q212 -74 226 -82" stroke={INK} strokeWidth={4} fill="none" />
  </g>;
};
export const Lamp: React.FC<{x: number; y: number; f: number}> = ({x, y, f}) => {
  const fl = 1 + Math.sin(f / 2.3) * 0.08 + Math.sin(f / 5.1) * 0.06;
  return <g transform={`translate(${x} ${y})`}>
    <path d="M-50 0 Q0 30 50 0 L70 -10 L30 -24 Q0 -30 -30 -24 Z" fill="#a8744e" stroke={INK} strokeWidth={5} />
    <path transform={`scale(1 ${fl})`} d="M60 -16 Q48 -60 66 -90 Q86 -56 72 -16 Z" fill="#ffd27a" stroke="#e8902a" strokeWidth={4} />
  </g>;
};
export const Shelves: React.FC<{x: number; y: number; w: number; h: number}> = ({x, y, w, h}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill="#6e4424" stroke={INK} strokeWidth={6} />
    {Array.from({length: 4}).map((_, r) => <g key={r}>
      <rect x={x + 10} y={y + 14 + r * (h / 4)} width={w - 20} height={h / 4 - 26} fill="#3a2414" />
      {Array.from({length: Math.floor((w - 30) / 46)}).map((_, i) => <g key={i}>
        <circle cx={x + 34 + i * 46} cy={y + 14 + r * (h / 4) + (h / 4 - 26) / 2} r={18} fill={rnd(r * 10 + i) > 0.5 ? '#efe3c8' : '#e0cfa8'} stroke={INK} strokeWidth={4} />
        <circle cx={x + 34 + i * 46} cy={y + 14 + r * (h / 4) + (h / 4 - 26) / 2} r={6} fill="#a8744e" />
      </g>)}
    </g>)}
  </g>
);
export const LightRays: React.FC<{x: number; y: number; f: number; color?: string; n?: number; len?: number; o?: number}> = ({x, y, f, color = '#fff4c8', n = 9, len = 1600, o = 0.16}) => (
  <g>{Array.from({length: n}).map((_, i) => {
    const a = (-70 + i * (140 / (n - 1)) + Math.sin(f / 40 + i) * 2) * Math.PI / 180;
    const w = 0.05;
    return <path key={i} d={`M${x} ${y} L${x + Math.sin(a - w) * len} ${y + Math.cos(a - w) * len} L${x + Math.sin(a + w) * len} ${y + Math.cos(a + w) * len} Z`} fill={color} opacity={o * (0.6 + 0.4 * Math.sin(f / 25 + i * 2))} />;
  })}</g>
);
export const Window: React.FC<{x: number; y: number; w: number; h: number; f: number}> = ({x, y, w, h, f}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill="#16213f" stroke={INK} strokeWidth={8} />
    {Array.from({length: 14}).map((_, i) => {
      const bx = x + 20 + rnd(i) * (w - 80), bh = 80 + rnd(i * 3) * (h * 0.6);
      return <g key={i}><rect x={bx} y={y + h - bh} width={60} height={bh} fill="#22305a" />
        {Array.from({length: 6}).map((_, j) => <rect key={j} x={bx + 10 + (j % 2) * 24} y={y + h - bh + 14 + Math.floor(j / 2) * 30} width={12} height={14} fill="#ffd27a" opacity={rnd(i * 9 + j + Math.floor(f / 90)) > 0.35 ? 0.85 : 0.15} />)}</g>;
    })}
    <path d={`M${x + w / 2} ${y} L${x + w / 2} ${y + h} M${x} ${y + h / 2} L${x + w} ${y + h / 2}`} stroke={INK} strokeWidth={8} />
  </g>
);

// ---------- characters in world coordinates ----------
export const P: React.FC<{who: string; x: number; ground: number; s?: number; expr?: any; arms?: any; flip?: boolean; seed?: number; talk?: boolean; baby?: boolean; tilt?: number}> =
  ({who, x, ground, s: s0 = 0.72, expr, arms, flip, seed = 0, talk, baby, tilt}) => { const s = s0 * 1.2; return (
  <Toon look={LOOKS[who]} x={x - 150 * s} y={ground - 474 * s} scale={s} expr={talk ? 'talk' : expr} arms={arms} flip={flip} seed={seed} baby={baby} tilt={tilt} />
); };
export const Walk: React.FC<{f: number; from: number; to: number; children: (x: number) => React.ReactNode}> = ({f, from, to, children}) =>
  <>{children(interpolate(f, [0, 300], [from, to]))}</>;

// ---------- scenes ----------
export const SCENES: Record<string, {frames: number; desc: string; render: (f: number) => React.ReactNode}> = {
  tent_stars: {frames: 300, desc: 'Abraham outside his tent at night under a sky full of stars (Abraham, God\'s promise, patriarchs, nomad life)', render: (f) => {
    const cam = {from: 120, to: 300, push: [1.02, 1.1] as [number, number]};
    return <>
      <Layer f={f} cam={cam} k={0.2}><Svg><Sky id="s1" top="#05081a" mid="#16224a" bottom="#3a3a6a" /><Stars f={f} n={260} maxY={1250} /><Glow id="mw" x={900} y={500} r={700} color="#9aa8ff" o={0.18} /></Svg></Layer>
      <Layer f={f} cam={cam} k={0.45}><Svg><Hill y={1230} amp={160} color="#2a2440" seed={4} /><Haze id="h1" color="#4a4a7a" y={1230} o={0.4} /></Svg></Layer>
      <Layer f={f} cam={cam} k={0.8}><Svg><Ground id="g1" y={1300} top="#4a3a4a" bottom="#2a1f2a" dots="#000" />
        <Tent x={420} y={1330} s={1.0} c="#b8956a" c2="#8a6446" glow /><Tent x={1180} y={1290} s={0.6} c="#a8855a" c2="#7a5436" />
        <Glow id="fire" x={760} y={1380} r={260} color="#ffb04a" o={0.55 + 0.1 * Math.sin(f / 3)} />
        <path d="M720 1400 L800 1400" stroke="#5a3a22" strokeWidth={16} strokeLinecap="round" /><path d={`M740 1396 Q760 ${1330 + Math.sin(f / 2) * 8} 780 1396 Z`} fill="#ffcf5a" stroke="#e8702a" strokeWidth={4} />
        <Shadow x={610} y={1452} w={80} /></Svg>
        <P who="abraham" x={610} ground={1455} s={0.8} arms="up" expr="wow" tilt={-8} />
        <P who="sarah" x={290} ground={1440} s={0.66} arms="hold" seed={3} />
      </Layer>
      <Grade vignette={0.5} />
    </>;
  }},
  well_noon: {frames: 300, desc: 'Jesus talking with a woman at a stone well in Samaria at midday (John 4, Samaritans, living water, outsiders welcomed)', render: (f) => {
    const cam = {from: 160, to: 260, push: [1.0, 1.07] as [number, number]};
    return <>
      <Layer f={f} cam={cam} k={0.15}><Svg><Sky id="s2" top="#5f8fd0" mid="#a8c8e8" bottom="#f4e2c0" /><Glow id="sun2" x={1050} y={340} r={420} color="#fff6d8" /></Svg></Layer>
      <Layer f={f} cam={cam} k={0.4}><Svg><Hill y={1150} amp={230} color="#b8a07a" seed={8} bumps={3} /><Haze id="h2" color="#f4e2c0" y={1120} o={0.6} /><Olive x={300} y={1150} s={0.45} c="#7a9a5a" /><Olive x={1250} y={1140} s={0.4} c="#7a9a5a" /></Svg></Layer>
      <Layer f={f} cam={cam} k={0.8}><Svg><Ground id="g2" y={1250} top="#d8bb8a" bottom="#b8956a" dots="#8a6a4a" />
        <Palm x={1260} y={1330} s={0.9} f={f} /><Shadow x={750} y={1460} w={190} /><Well x={750} y={1460} s={0.85} /><Shadow x={480} y={1470} w={70} /><Shadow x={1010} y={1470} w={70} /></Svg>
        <P who="jesus" x={480} ground={1475} s={0.78} talk={(f % 120) < 70} arms="open" />
        <P who="samaritan" x={1010} ground={1475} s={0.74} arms="hold" expr="wow" flip seed={2} />
      </Layer>
      <Grade vignette={0.3} />
    </>;
  }},
  lion_prowl: {frames: 300, desc: 'A lion prowling across red rocks at dusk (1 Peter 5:8 "roaring lion", danger, temptation, Daniel, Samson)', render: (f) => {
    const cam = {from: 100, to: 280, push: [1.04, 1.1] as [number, number]};
    return <>
      <Layer f={f} cam={cam} k={0.15}><Svg><Sky id="s3" top="#2a1030" mid="#a83a2a" bottom="#f2a04a" /><Glow id="sun3" x={760} y={1080} r={520} color="#ffcf7a" /></Svg></Layer>
      <Layer f={f} cam={cam} k={0.4}><Svg><Hill y={1160} amp={260} color="#5a2a2a" seed={21} bumps={3} /><Haze id="h3" color="#f2a04a" y={1150} o={0.45} /></Svg></Layer>
      <Layer f={f} cam={cam} k={0.8}><Svg><Ground id="g3" y={1300} top="#8a4a32" bottom="#4a2420" dots="#2a1010" />
        <Rock x={250} y={1340} w={340} h={200} c="#7a3a2a" /><Rock x={1300} y={1330} w={300} h={260} c="#6a3226" />
        <Walk f={f} from={200} to={1150}>{(x) => <><Shadow x={x} y={1455} w={200} /><Lion x={x} y={1450} s={0.95} f={f} /></>}</Walk>
        <Rock x={1460} y={1660} w={420} h={170} c="#5a2a22" /></Svg></Layer>
      <Grade vignette={0.55} />
    </>;
  }},
  rome_forum: {frames: 300, desc: 'Roman city forum with columns, red banners and officials in togas, golden afternoon (Rome, emperors, Pilate, Roman historians, the year 336)', render: (f) => {
    const cam = {from: 80, to: 330, push: [1.0, 1.06] as [number, number]};
    return <>
      <Layer f={f} cam={cam} k={0.15}><Svg><Sky id="s4" top="#6f8fc8" mid="#f2c88a" bottom="#ffd9a8" /><Glow id="sun4" x={300} y={500} r={500} color="#fff0c8" /></Svg></Layer>
      <Layer f={f} cam={cam} k={0.45}><Svg>
        <rect x={200} y={760} width={1100} height={420} fill="#e6d6b4" stroke={INK} strokeWidth={6} />
        <path d="M160 770 L750 560 L1340 770 Z" fill="#efe3c8" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        <circle cx={750} cy={690} r={44} fill="#f2c03c" stroke={INK} strokeWidth={5} />
        {[290, 470, 650, 850, 1030, 1210].map((x) => <Column key={x} x={x} y={1180} h={380} />)}
        <Haze id="h4" color="#ffd9a8" y={1150} o={0.4} /></Svg></Layer>
      <Layer f={f} cam={cam} k={0.8}><Svg><Ground id="g4" y={1260} top="#cdb48a" bottom="#a88a62" />
        {Array.from({length: 14}).map((_, i) => <path key={i} d={`M${i * 120} 1260 L${i * 120 - 300} ${H}`} stroke="#8a7050" strokeWidth={4} opacity={0.4} />)}
        <Banner x={120} y={700} f={f} /><Banner x={1300} y={700} f={f} />
        <Shadow x={520} y={1462} w={70} /><Shadow x={860} y={1462} w={70} /></Svg>
        <P who="roman" x={520} ground={1465} s={0.76} talk={(f % 100) < 60} arms="point" />
        <P who="roman2" x={860} ground={1465} s={0.74} arms="down" flip seed={4} />
        <P who="roman" x={1180} ground={1420} s={0.56} arms="hold" seed={7} />
      </Layer>
      <Grade vignette={0.3} />
    </>;
  }},
  scribe_room: {frames: 300, desc: 'A writer (Paul or a Gospel writer) writing a scroll by oil-lamp light, shelves of scrolls behind (who wrote the Bible, letters, Gospels, old manuscripts)', render: (f) => {
    const cam = {from: 180, to: 260, push: [1.02, 1.12] as [number, number]};
    const writeX = 690 + Math.sin(f / 4) * 14;
    return <>
      <Layer f={f} cam={cam} k={0.3}><Svg><rect x={-200} y={0} width={WORLD + 400} height={H} fill="#3a2418" />
        {Array.from({length: 40}).map((_, i) => <rect key={i} x={rnd(i) * WORLD} y={rnd(i * 5) * 1300} width={120} height={60} fill="#000" opacity={0.08} />)}
        <Shelves x={100} y={420} w={520} h={820} /><Shelves x={880} y={420} w={520} h={820} />
        <Glow id="lampglow" x={760} y={1150} r={760} color="#ffb04a" o={0.55 + 0.05 * Math.sin(f / 3)} /></Svg></Layer>
      <Layer f={f} cam={cam} k={0.8}><Svg>
        <rect x={-200} y={1300} width={WORLD + 400} height={700} fill="#4a2c1c" />
        <rect x={380} y={1270} width={760} height={50} fill="#8a5a30" stroke={INK} strokeWidth={7} />
        <rect x={420} y={1320} width={36} height={220} fill="#6e4424" stroke={INK} strokeWidth={5} /><rect x={1064} y={1320} width={36} height={220} fill="#6e4424" stroke={INK} strokeWidth={5} />
        <rect x={560} y={1236} width={300} height={40} rx={8} fill="#efe3c8" stroke={INK} strokeWidth={5} />
        {Array.from({length: 4}).map((_, i) => <path key={i} d={`M585 ${1248 + i * 7} L${585 + Math.min(250, Math.max(0, (f - i * 60) * 1.4))} ${1248 + i * 7}`} stroke="#3a2618" strokeWidth={2.5} />)}
        <circle cx={560} cy={1256} r={26} fill="#e0cfa8" stroke={INK} strokeWidth={5} /><circle cx={860} cy={1256} r={26} fill="#e0cfa8" stroke={INK} strokeWidth={5} />
        <Lamp x={1000} y={1268} f={f} />
        <path d={`M${writeX} 1240 L${writeX + 40} 1150`} stroke="#f4ecd8" strokeWidth={6} strokeLinecap="round" /></Svg>
        <P who="paul" x={700} ground={1400} s={0.82} arms="hold" expr={(f % 90) < 70 ? 'smile' : 'talk'} tilt={6} />
      </Layer>
      <Grade vignette={0.55} />
    </>;
  }},
  galilee_boat: {frames: 300, desc: 'Fishermen in a wooden boat on a calm lake at dawn, hills behind (Sea of Galilee, Peter, disciples, calling, fishing)', render: (f) => {
    const cam = {from: 60, to: 300, push: [1.0, 1.06] as [number, number]};
    return <>
      <Layer f={f} cam={cam} k={0.15}><Svg><Sky id="s6" top="#7a8ac8" mid="#f2b8a0" bottom="#ffe0a8" /><Glow id="sun6" x={950} y={1000} r={520} color="#fff0c8" /></Svg></Layer>
      <Layer f={f} cam={cam} k={0.35}><Svg><Hill y={1080} amp={200} color="#7a6a8a" seed={31} bumps={3} /><Haze id="h6" color="#ffe0c0" y={1070} o={0.55} /></Svg></Layer>
      <Layer f={f} cam={cam} k={0.8}><Svg><Water id="w6" y={1090} f={f} c="#e0a890" c2="#3f6a98" />
        <Glow id="refl" x={950} y={1130} r={300} color="#fff0c8" o={0.5} /></Svg>
        <div style={{position: 'absolute', left: 0, top: Math.sin(f / 13) * 8}}>
          <P who="peter" x={640} ground={1360} s={0.74} arms="hold" talk={(f % 110) < 60} />
          <P who="andrew" x={860} ground={1360} s={0.7} arms="point" flip seed={5} />
        </div>
        <Svg><Boat x={750} y={1430} s={1.05} f={f} /></Svg>
      </Layer>
      <Grade vignette={0.35} />
    </>;
  }},
  sinai_mountain: {frames: 300, desc: 'Moses with his staff before a great mountain wrapped in cloud and light (Sinai, the law, Ten Commandments, Deuteronomy; God shown only as light)', render: (f) => {
    const cam = {from: 200, to: 220, push: [1.0, 1.12] as [number, number]};
    return <>
      <Layer f={f} cam={cam} k={0.12}><Svg><Sky id="s7" top="#1a1f3a" mid="#5a4a6a" bottom="#c88a6a" /></Svg></Layer>
      <Layer f={f} cam={cam} k={0.3}><Svg>
        <path d="M100 1250 C400 1000 560 520 760 430 C960 520 1120 1000 1420 1250 Z" fill="#6a4a4a" stroke={INK} strokeWidth={7} />
        <path d="M760 430 C700 600 640 800 560 1000 M760 430 C820 650 900 860 980 1050" stroke="#4a3236" strokeWidth={10} fill="none" />
        <LightRays x={760} y={420} f={f} o={0.2} len={1500} />
        <Glow id="peak" x={760} y={420} r={460} color="#fff4c8" o={0.9} />
        {Array.from({length: 7}).map((_, i) => <ellipse key={i} cx={560 + i * 70 + Math.sin(f / 30 + i) * 20} cy={470 + Math.cos(i) * 30} rx={130} ry={50} fill="#e8e0d8" opacity={0.7} />)}
        <Haze id="h7" color="#c88a6a" y={1240} o={0.5} /></Svg></Layer>
      <Layer f={f} cam={cam} k={0.8}><Svg><Ground id="g7" y={1330} top="#8a6a5a" bottom="#4a3430" dots="#2a1a1a" /><Rock x={240} y={1390} w={300} h={150} c="#6a4a40" /><Rock x={1260} y={1380} w={280} h={180} c="#5a3e36" /><Shadow x={760} y={1470} w={80} /></Svg>
        <P who="moses" x={760} ground={1475} s={0.84} arms="up" expr="wow" />
        <P who="elder" x={420} ground={1440} s={0.58} arms="hold" seed={4} flip />
        <P who="traveler" x={1100} ground={1440} s={0.58} arms="down" seed={6} />
      </Layer>
      <Grade vignette={0.5} />
    </>;
  }},
  three_crosses: {frames: 300, desc: 'Three empty wooden crosses on a hill outside Jerusalem at sunset (the cross, Jesus died for sins, Good Friday; no people, no violence)', render: (f) => {
    const cam = {from: 160, to: 240, push: [1.0, 1.1] as [number, number]};
    return <>
      <Layer f={f} cam={cam} k={0.12}><Svg><Sky id="s8" top="#3a1a3a" mid="#d8603a" bottom="#ffc070" /><Glow id="sun8" x={760} y={1050} r={620} color="#fff0b0" />
        {Array.from({length: 5}).map((_, i) => <ellipse key={i} cx={(i * 340 + f * 0.6) % 1800 - 150} cy={300 + i * 90} rx={220} ry={40} fill="#ffb080" opacity={0.35} />)}</Svg></Layer>
      <Layer f={f} cam={cam} k={0.35}><Svg>
        <Wall y={1180} x0={-100} x1={500} h={140} c="#b8805a" /><Wall y={1180} x0={1050} x1={1600} h={120} c="#b8805a" />
        <Haze id="h8" color="#ffb070" y={1150} o={0.5} /></Svg></Layer>
      <Layer f={f} cam={cam} k={0.75}><Svg>
        <path d="M-200 1600 C200 1250 500 1150 760 1140 C1020 1150 1300 1250 1700 1600 L1700 2000 L-200 2000 Z" fill="#5a3a2a" stroke={INK} strokeWidth={7} />
        <Cross x={760} y={1170} s={1.05} /><Cross x={480} y={1240} s={0.8} /><Cross x={1040} y={1240} s={0.8} />
        <Motes f={f} color="#ffe0a0" n={20} y0={700} y1={1300} /></Svg></Layer>
      <Grade vignette={0.5} />
    </>;
  }},
  shepherds_night: {frames: 300, desc: 'Shepherds with their sheep in a field at night as an angel appears in bright light (Luke 2, Christmas, the good news, Bethlehem fields)', render: (f) => {
    const cam = {from: 150, to: 250, push: [1.0, 1.08] as [number, number]};
    const ang = interpolate(f, [20, 70], [0, 1], clamp);
    return <>
      <Layer f={f} cam={cam} k={0.15}><Svg><Sky id="s9" top="#070b22" mid="#1c2a5a" bottom="#3a4a7a" /><Stars f={f} n={180} maxY={1100} seed={5} /></Svg></Layer>
      <Layer f={f} cam={cam} k={0.4}><Svg><Hill y={1180} amp={150} color="#1e2a3a" seed={44} /><g opacity={0.9}>{[1150, 1230, 1300].map((x, i) => <rect key={i} x={x} y={1080 - i * 20} width={60} height={80 + i * 20} fill="#2a3448" stroke={INK} strokeWidth={4} />)}</g></Svg></Layer>
      <Layer f={f} cam={cam} k={0.8}><Svg><Ground id="g9" y={1290} top="#2a3a3a" bottom="#18221f" dots="#000" />
        <g opacity={ang}><LightRays x={760} y={560} f={f} color="#fff8d8" o={0.22} /><Glow id="ang" x={760} y={760} r={600} color="#fff6d0" o={0.85} /></g>
        {[[300, 1440], [430, 1500], [1180, 1450], [1050, 1520], [1320, 1500]].map(([x, y], i) => <Sheep key={i} x={x} y={y} s={0.8} f={f} seed={i} />)}</Svg>
        <div style={{opacity: ang, transform: `translateY(${(1 - ang) * 40}px)`}}><P who="angel" x={760} ground={1020} s={0.7} arms="open" expr="joy" /></div>
        <P who="shepherd" x={560} ground={1470} s={0.74} arms="up" expr="wow" />
        <P who="shepherd2" x={920} ground={1470} s={0.7} arms="shrug" expr="wow" flip seed={3} />
      </Layer>
      <Grade vignette={0.45} />
    </>;
  }},
  jerusalem_gate: {frames: 300, desc: 'Jerusalem city wall and gate in the morning with travellers and elders (Jerusalem, Israel\'s leaders, Acts, arriving in the city)', render: (f) => {
    const cam = {from: 120, to: 300, push: [1.0, 1.06] as [number, number]};
    return <>
      <Layer f={f} cam={cam} k={0.15}><Svg><Sky id="s10" top="#6f8fc8" mid="#c8d8e8" bottom="#ffe6c0" /><Glow id="sun10" x={1200} y={420} r={440} color="#fff6d8" /></Svg></Layer>
      <Layer f={f} cam={cam} k={0.45}><Svg>
        <rect x={420} y={640} width={640} height={420} fill="#e8d6aa" stroke={INK} strokeWidth={6} /><rect x={500} y={560} width={480} height={90} fill="#f2e2b8" stroke={INK} strokeWidth={6} />
        <rect x={560} y={520} width={360} height={50} fill="#f2c03c" stroke={INK} strokeWidth={5} />
        <Haze id="h10" color="#ffe6c0" y={1000} o={0.5} />
        <Wall y={1260} x0={-200} x1={1700} h={300} gateX={760} c="#d9b98a" /></Svg></Layer>
      <Layer f={f} cam={cam} k={0.8}><Svg><Ground id="g10" y={1300} top="#c8a87a" bottom="#9a7a52" dots="#6a4a30" /><Olive x={180} y={1420} s={0.6} /></Svg>
        <Walk f={f} from={1300} to={980}>{(x) => <P who="traveler" x={x} ground={1480} s={0.66} arms="down" flip seed={2} />}</Walk>
        <P who="elder" x={560} ground={1470} s={0.76} talk={(f % 100) < 55} arms="point" />
        <P who="peter" x={790} ground={1470} s={0.74} arms="open" flip seed={6} />
      </Layer>
      <Grade vignette={0.3} />
    </>;
  }},
  modern_room: {frames: 300, desc: 'Modern-day room at night: a young man on a sofa scrolling his phone, city lights in the window (today, "you", modern questions, social media)', render: (f) => {
    const cam = {from: 200, to: 230, push: [1.0, 1.1] as [number, number]};
    return <>
      <Layer f={f} cam={cam} k={0.3}><Svg><rect x={-200} y={0} width={WORLD + 400} height={H} fill="#2a2a44" />
        <Window x={420} y={520} w={660} h={560} f={f} />
        <rect x={160} y={600} width={180} height={240} fill="#c0532e" stroke={INK} strokeWidth={6} /><rect x={180} y={620} width={140} height={200} fill="#f2c03c" opacity={0.5} />
        <Glow id="tv" x={760} y={1250} r={500} color="#7ab0ff" o={0.25} /></Svg></Layer>
      <Layer f={f} cam={cam} k={0.8}><Svg>
        <rect x={-200} y={1320} width={WORLD + 400} height={700} fill="#3a2a3a" />
        <rect x={360} y={1180} width={800} height={180} rx={40} fill="#3f6aa0" stroke={INK} strokeWidth={7} />
        <rect x={320} y={1300} width={880} height={140} rx={40} fill="#2f5a8a" stroke={INK} strokeWidth={7} />
        <rect x={1240} y={1100} width={30} height={300} fill="#5a4a3a" /><path d="M1180 1100 L1330 1100 L1290 1010 L1220 1010 Z" fill="#f2c03c" stroke={INK} strokeWidth={5} />
        <Glow id="lampw" x={1255} y={1080} r={300} color="#ffd27a" o={0.4} /></Svg>
        <P who="sam" x={720} ground={1400} s={0.8} arms="hold" expr={(f % 150) < 100 ? 'skeptic' : 'wow'} />
        <Svg><rect x={690} y={1210} width={58} height={92} rx={10} fill="#111" stroke={INK} strokeWidth={4} /><rect x={697} y={1218} width={44} height={76} rx={6} fill="#9ad0ff" opacity={0.8 + 0.2 * Math.sin(f / 7)} />
          <Glow id="phone" x={720} y={1240} r={140} color="#9ad0ff" o={0.45} /></Svg>
      </Layer>
      <Grade vignette={0.45} />
    </>;
  }},
  world_families: {frames: 300, desc: 'People of many nations and skin tones standing together on a hill at sunrise (all nations, "all the families of the earth", everyone, the gospel for the world)', render: (f) => {
    const cam = {from: 60, to: 340, push: [1.0, 1.05] as [number, number]};
    const ppl = ['fam1', 'fam2', 'traveler', 'fam3', 'samaritan', 'fam5', 'fam4', 'elder', 'tumi', 'sam', 'fam2'];
    return <>
      <Layer f={f} cam={cam} k={0.15}><Svg><Sky id="s12" top="#3f5aa8" mid="#f2a07a" bottom="#ffe0a0" /><Glow id="sun12" x={750} y={1120} r={700} color="#fff4c0" />
        <LightRays x={750} y={1120} f={f} color="#fff8d8" o={0.12} n={11} /></Svg></Layer>
      <Layer f={f} cam={cam} k={0.4}><Svg><Hill y={1200} amp={140} color="#6a7a5a" seed={61} /><Haze id="h12" color="#ffe0b0" y={1180} o={0.55} /></Svg></Layer>
      <Layer f={f} cam={cam} k={0.8}><Svg><path d="M-300 1500 C200 1300 1200 1300 1800 1500 L1800 2000 L-300 2000 Z" fill="#5a8a4a" stroke={INK} strokeWidth={6} /><Motes f={f} color="#fff0b0" /></Svg>
        {ppl.map((w, i) => <P key={i} who={w} x={110 + i * 130} ground={1440 + Math.abs(i - 5) * 8} s={0.58 + (i % 2) * 0.04} arms={i % 3 === 0 ? 'up' : i % 3 === 1 ? 'wave' : 'open'} expr="joy" seed={i} flip={i > 5} />)}
      </Layer>
      <Grade vignette={0.3} />
    </>;
  }},
  moriah_walk: {frames: 300, desc: 'Abraham and young Isaac walking up a mountain path at dawn, Isaac carrying firewood, a ram caught in a bush nearby (Genesis 22, Moriah, faith tested, "God will provide"; no knife, no violence)', render: (f) => {
    const cam = {from: 220, to: 120, push: [1.0, 1.08] as [number, number]};
    return <>
      <Layer f={f} cam={cam} k={0.15}><Svg><Sky id="s13" top="#5a6ab0" mid="#f2b88a" bottom="#ffe2b0" /><Glow id="sun13" x={350} y={900} r={520} color="#fff0c0" /></Svg></Layer>
      <Layer f={f} cam={cam} k={0.4}><Svg><path d="M-200 1250 C200 1100 500 700 820 640 C1100 700 1300 1000 1700 1200 L1700 2000 L-200 2000 Z" fill="#9a7a6a" stroke={INK} strokeWidth={6} /><Haze id="h13" color="#ffe2c0" y={1150} o={0.5} /></Svg></Layer>
      <Layer f={f} cam={cam} k={0.8}><Svg><Ground id="g13" y={1320} top="#b8956a" bottom="#7a5a3e" dots="#5a3a22" />
        <path d="M-100 1700 C300 1520 700 1460 1700 1380" stroke="#d9c09a" strokeWidth={70} fill="none" opacity={0.7} />
        <g transform="translate(1250 1360)"><circle cx={-40} cy={-40} r={60} fill="#5a7a3a" stroke={INK} strokeWidth={6} /><circle cx={40} cy={-50} r={66} fill="#4f6a32" stroke={INK} strokeWidth={6} /><circle cx={0} cy={-90} r={60} fill="#5a7a3a" stroke={INK} strokeWidth={6} /></g>
        <Sheep x={1250} y={1420} s={0.75} f={f} /></Svg>
        <Walk f={f} from={260} to={620}>{(x) => <><P who="abraham" x={x} ground={1480} s={0.8} arms="down" seed={1} /><P who="tumi" x={x + 200} ground={1470} s={0.58} arms="hold" seed={4} /></>}</Walk>
        <Walk f={f} from={460} to={820}>{(x) => <Svg><g transform={`translate(${x - 95} ${1345 + Math.sin(f / 6) * 3}) rotate(-20)`}>{[0, 14, 28].map((d) => <rect key={d} x={0} y={d} width={140} height={14} rx={7} fill="#8a5a30" stroke={INK} strokeWidth={4} />)}</g></Svg>}</Walk>
      </Layer>
      <Grade vignette={0.35} />
    </>;
  }},
  cosmos_space: {frames: 300, desc: 'Deep space: a galaxy, glowing nebula and planets drifting past (creation, "who made God?", the universe had a beginning, Psalm 19 "the heavens declare")', render: (f) => {
    const cam = {from: 100, to: 300, push: [1.0, 1.15] as [number, number]};
    return <>
      <Layer f={f} cam={cam} k={0.1}><Svg><Sky id="s14" top="#02030c" mid="#0b0f2a" bottom="#1a0f2a" /><Stars f={f} n={420} maxY={H} seed={9} />
        <Glow id="neb1" x={500} y={700} r={600} color="#7a4ad8" o={0.45} /><Glow id="neb2" x={1000} y={1100} r={520} color="#d84a8a" o={0.35} /><Glow id="neb3" x={700} y={900} r={300} color="#ffe8b0" o={0.6} /></Svg></Layer>
      <Layer f={f} cam={cam} k={0.3}><Svg><g transform={`translate(760 900) rotate(${f * 0.08})`}>{Array.from({length: 160}).map((_, i) => { const a = i * 0.35, r = 20 + i * 3.2; return <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r * 0.45} r={2 + rnd(i) * 3} fill="#fff4d8" opacity={0.8 - i / 220} />; })}</g></Svg></Layer>
      <Layer f={f} cam={cam} k={0.7}><Svg>
        <circle cx={300 + f * 0.4} cy={1350} r={170} fill="#d8843a" stroke={INK} strokeWidth={7} /><path d={`M${130 + f * 0.4} 1330 Q${300 + f * 0.4} 1290 ${470 + f * 0.4} 1330`} stroke="#b8622a" strokeWidth={22} fill="none" />
        <ellipse cx={300 + f * 0.4} cy={1350} rx={280} ry={50} fill="none" stroke="#f2d8a0" strokeWidth={10} opacity={0.8} />
        <circle cx={1200 - f * 0.3} cy={1150} r={90} fill="#4a8ad8" stroke={INK} strokeWidth={6} /><path d={`M${1150 - f * 0.3} 1120 q30 -20 60 10 q-10 40 -50 30 Z`} fill="#5aa84a" />
        <Motes f={f} color="#ffffff" n={30} y0={300} y1={1700} /></Svg></Layer>
      <Grade vignette={0.4} />
    </>;
  }},
  prodigal_return: {frames: 300, desc: 'A father running with open arms to welcome his returning son on a country road at sunset (Luke 15, forgiveness, grace, coming home to God)', render: (f) => {
    const cam = {from: 160, to: 260, push: [1.0, 1.08] as [number, number]};
    return <>
      <Layer f={f} cam={cam} k={0.15}><Svg><Sky id="s15" top="#5a5aa8" mid="#f29a6a" bottom="#ffd890" /><Glow id="sun15" x={760} y={1060} r={560} color="#fff0b8" /></Svg></Layer>
      <Layer f={f} cam={cam} k={0.4}><Svg><Hill y={1180} amp={170} color="#7a8a5a" seed={71} /><rect x={1180} y={1020} width={200} height={130} fill="#e8d6aa" stroke={INK} strokeWidth={5} /><path d="M1160 1030 L1280 960 L1400 1030 Z" fill="#c0532e" stroke={INK} strokeWidth={5} /><Haze id="h15" color="#ffd8a0" y={1150} o={0.5} /></Svg></Layer>
      <Layer f={f} cam={cam} k={0.8}><Svg><Ground id="g15" y={1290} top="#8aa85a" bottom="#5a7a3a" dots="#3a5a2a" />
        <path d="M-100 1700 C400 1450 900 1380 1700 1330" stroke="#d9c09a" strokeWidth={90} fill="none" opacity={0.8} /><Olive x={160} y={1360} s={0.55} /></Svg>
        <Walk f={f} from={1150} to={850}>{(x) => <P who="elder" x={x} ground={1460} s={0.78} arms="open" expr="joy" flip seed={2} />}</Walk>
        <Walk f={f} from={420} to={560}>{(x) => <P who="traveler" x={x} ground={1480} s={0.74} arms="down" expr={f > 180 ? 'wow' : 'sleep'} seed={5} tilt={8} />}</Walk>
      </Layer>
      <Grade vignette={0.35} />
    </>;
  }},
  noah_ark: {frames: 300, desc: 'Noah\'s ark resting on calm water after the flood, a rainbow in the sky and a dove flying (Genesis 6-9, the flood, God\'s promise, judgment and rescue)', render: (f) => {
    const cam = {from: 120, to: 280, push: [1.0, 1.07] as [number, number]};
    return <>
      <Layer f={f} cam={cam} k={0.15}><Svg><Sky id="s16" top="#6f8fc8" mid="#c8d8e8" bottom="#f4e6c8" />
        {['#e8392f', '#f2902a', '#f2c03c', '#4aa84a', '#3f6aa0', '#7a4ad8'].map((c, i) => <path key={i} d={`M100 1250 A${650 - i * 28} ${650 - i * 28} 0 0 1 ${1400 - i * 56} 1250`} transform={`translate(${i * 28} 0)`} stroke={c} strokeWidth={28} fill="none" opacity={0.55} />)}</Svg></Layer>
      <Layer f={f} cam={cam} k={0.8}><Svg><Water id="w16" y={1250} f={f} c="#5a8ab8" c2="#2a4a70" />
        <g transform={`translate(760 ${1300 + Math.sin(f / 15) * 8})`}>
          <path d="M-420 -40 L420 -40 L340 120 L-340 120 Z" fill="#8a5a30" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
          {[-300, -150, 0, 150, 300].map((x) => <path key={x} d={`M${x} -40 L${x * 0.85} 120`} stroke="#6e4424" strokeWidth={6} />)}
          <rect x={-260} y={-220} width={520} height={180} fill="#a8744e" stroke={INK} strokeWidth={7} />
          <path d="M-300 -210 L0 -320 L300 -210 Z" fill="#6e4424" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
          {[-170, -60, 60, 170].map((x) => <rect key={x} x={x - 24} y={-170} width={48} height={40} fill="#3a2618" stroke={INK} strokeWidth={4} />)}
        </g>
        <g transform={`translate(${300 + f * 2.2} ${700 + Math.sin(f / 6) * 20})`}><ellipse cx={0} cy={0} rx={34} ry={18} fill="#fff" stroke={INK} strokeWidth={4} /><path d={`M-10 -4 Q0 ${-40 + Math.sin(f / 2) * 25} 20 -4 Z`} fill="#fff" stroke={INK} strokeWidth={4} /><circle cx={30} cy={-8} r={12} fill="#fff" stroke={INK} strokeWidth={4} /></g></Svg>
      </Layer>
      <Grade vignette={0.3} />
    </>;
  }},
};

export const SceneComp: React.FC<{name: string}> = ({name}) => {
  const f = useCurrentFrame();
  const sc = SCENES[name];
  return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>{sc ? sc.render(f) : null}</AbsoluteFill>;
};
