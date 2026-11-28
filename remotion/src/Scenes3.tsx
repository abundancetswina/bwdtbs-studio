import React from 'react';
import {interpolate} from 'remotion';
import {D, S, SkyG, Sun, Ridge, Peak, Field, Fog, Beams, Dust, Tree, Boulder, Grass, Wood, Altar, Ram, Thicket, House, Temple, Torch, Fig, walk, Look3D, Cam, grad, rgrad} from './Kit';
import {LOOKS, Stars, Sheep, WORLD, H, rnd, clamp} from './Scenes';
import {INK} from './Toon';

// New 3D-look scenes, written per script (28 Nov 2026, Abundance: "generate new scenes that match what the script says").
// Each: {frames, desc, amb (ambience: wind|birds|crickets|crowd|room|storm), render}.
type Sc = {frames: number; desc: string; amb: string; render: (f: number) => React.ReactNode};

Object.assign(LOOKS, {
  thomas: {tunic: '#5a7a3a', toga: '#a8885e', skin: '#9a6a46', hair: '#2a1a10', beard: '#2a1a10', shortBeard: true},
  john_b: {tunic: '#7a5a3a', toga: '#5a4028', skin: '#8a5a3c', hair: '#1e1410', longHair: '#1e1410', beard: '#1e1410'},
  painter: {tunic: '#7a3a5a', toga: '#e8dcc0', skin: '#e0b48a', hair: '#5a3a22', beard: '#5a3a22', shortBeard: true},
  guard: {tunic: '#b8322f', toga: '#c9a46a', skin: '#c99067', hair: '#3a2618', crown: false},
  writer: {tunic: '#3f5a7a', toga: '#c9a46a', skin: '#b07a50', hair: '#3a2618', beard: '#3a2618', shortBeard: true},
  woman2: {tunic: '#c0532e', dress: '#c0532e', skin: '#a8744e', headcloth: '#efe3c8', band: '#7a3a3a'},
  bright: {tunic: '#ffffff', toga: '#fff4c8', skin: '#e0b48a', hair: '#f4e0a0', wings: true},
});

// ---------- shared sets ----------
const NightSky: React.FC<{f: number; id: string; moon?: boolean}> = ({f, id, moon = true}) => <>
  <SkyG id={id} c={['#0e1430', '#1e2a5a', '#3a4a7a']} /><Stars f={f} n={140} maxY={1100} />
  {moon && <Sun id={id + 'm'} x={1150} y={420} r={260} c="#dfe8ff" />}
</>;
const Room: React.FC<{f: number; id: string; children?: React.ReactNode}> = ({f, id, children}) => <>
  <defs>{grad(id, [[0, '#4a3424'], [0.6, '#6e4c32'], [1, '#3a281c']])}{grad(id + 'fl', [[0, '#7a5a3e'], [1, '#3e2c1e']])}</defs>
  <rect x={-400} y={-200} width={WORLD + 800} height={H + 400} fill={`url(#${id})`} />
  {Array.from({length: 10}).map((_, i) => <rect key={i} x={-300 + i * 220} y={300 + (i % 2) * 40} width={160} height={70} fill="#000" opacity={0.08} />)}
  <rect x={-400} y={1250} width={WORLD + 800} height={900} fill={`url(#${id}fl)`} />
  <rect x={560} y={520} width={260} height={300} fill="#1a2240" /><rect x={560} y={520} width={260} height={300} fill="none" stroke="#2a1a10" strokeWidth={18} />
  {children}
  <Torch x={200} y={1000} f={f} id={id + 't1'} /><Torch x={1300} y={1000} f={f + 40} id={id + 't2'} />
</>;
const TombSet: React.FC<{f: number; id: string; open?: boolean}> = ({f, id, open = true}) => <>
  <SkyG id={id} c={['#6a7ab8', '#f2b48a', '#ffe0a8']} /><Sun id={id + 'sun'} x={300} y={900} r={600} />
  <Ridge id={id + 'r'} y={1080} amp={200} seed={8} c="#8a9a6a" c2="#b8b08a" /><Fog id={id + 'f'} y={1080} c="#ffe8c8" o={0.6} />
  <defs>{grad(id + 'rk', [[0, '#c9a47a'], [1, '#7a5a3e']])}</defs>
  <path d="M500 1320 C520 820 700 700 1000 700 C1350 700 1500 900 1600 1320 Z" fill={`url(#${id}rk)`} />
  <ellipse cx={980} cy={1160} rx={150} ry={175} fill="#1e140c" />
  {open && <><circle cx={1290} cy={1180} r={150} fill="#9a8468" /><circle cx={1290} cy={1180} r={110} fill="none" stroke="#7a6450" strokeWidth={8} /></>}
  <Field id={id + 'g'} y={1300} c="#8aa05a" c2="#5a6a3a" spots="#e8d070" />
</>;

const crowd = (n: number, y0: number, seed: number, s0 = 0.5) => Array.from({length: n}).map((_, i) => {
  const looks = ['peter', 'andrew', 'mary', 'joseph', 'shepherd', 'sarah', 'traveler', 'elder', 'fam1', 'fam3', 'fam4', 'woman2', 'thomas'];
  const row = Math.floor(i / 7), x = 80 + ((i % 7) * 200 + rnd(i + seed) * 90 + row * 70) % 1400;
  return {who: looks[(i * 5 + seed) % looks.length], x, g: y0 + row * 90, s: s0 + row * 0.12, seed: i};
});

const studio = (f: number, cam: Cam) => {
    const Putto: React.FC<{x: number; y: number; s: number; t: number}> = ({x, y, s, t}) => (
      <g transform={`translate(${x} ${y + Math.sin(t / 8) * 6}) scale(${s})`}>
        {[1, -1].map((d) => <path key={d} transform={`scale(${d} 1)`} d="M10 -10 C70 -70 120 -30 90 20 C60 10 40 10 10 10 Z" fill="#fbf6ea" stroke="#c8b898" strokeWidth={4} />)}
        <ellipse cx={0} cy={30} rx={46} ry={40} fill="#f2c8a0" /><circle cx={0} cy={-30} r={40} fill="#f6d0aa" />
        <path d="M-34 -50 Q0 -90 34 -50" stroke="#e8b850" strokeWidth={14} fill="none" strokeLinecap="round" />
        <circle cx={-12} cy={-32} r={5} fill={INK} /><circle cx={12} cy={-32} r={5} fill={INK} /><path d="M-10 -14 Q0 -6 10 -14" stroke={INK} strokeWidth={4} fill="none" />
      </g>);
    return <>
      <D f={f} cam={cam} k={0.3}><S>
        <defs>{grad('sp_w', [[0, '#a8865e'], [1, '#6e5238']])}</defs>
        <rect x={-400} y={-200} width={WORLD + 800} height={H + 400} fill="url(#sp_w)" />
        <rect x={980} y={320} width={420} height={640} fill="#bfe0f0" /><rect x={980} y={320} width={420} height={640} fill="none" stroke="#4a3424" strokeWidth={22} />
        <path d="M1190 320 L1190 960 M980 640 L1400 640" stroke="#4a3424" strokeWidth={14} />
        {[[120, 420], [460, 380]].map(([x, y], i) => <g key={i}><rect x={x} y={y} width={260} height={320} fill="#d8b878" /><rect x={x + 18} y={y + 18} width={224} height={284} fill="#8ab0c8" /><Putto x={x + 130} y={y + 170} s={0.9} t={f + i * 30} /></g>)}
        <Beams x={1190} y={500} f={f} dir={-120} spread={30} n={5} o={0.16} len={1800} />
      </S></D>
      <D f={f} cam={cam} k={0.85}><S>
        <rect x={-400} y={1320} width={WORLD + 800} height={900} fill="#6e4c30" />
        <path d="M720 1500 L860 900 L1000 1500 M860 900 L860 1500" stroke="#5a3a22" strokeWidth={18} />
        <rect x={640} y={780} width={460} height={520} fill="#f4ecd8" stroke="#8a6a44" strokeWidth={14} />
        <rect x={666} y={806} width={408} height={468} fill="#9ac0d8" />
        <ellipse cx={870} cy={1160} rx={260} ry={80} fill="#f4f0e4" opacity={0.85} />
        <Putto x={800} y={1010} s={1.1} t={f} /><Putto x={970} y={1080} s={0.8} t={f + 50} />
      </S>
        <Fig who="painter" x={340} ground={1640} s={1.35} arms="point" expr="smile" seed={2} />
      </D>
      <D f={f} cam={cam} k={1.35} blur={13}><S><rect x={1250} y={1700} width={420} height={320} rx={30} fill="#5a3a22" />{['#d63a30', '#f2c03c', '#3f6aa0', '#2e8a56'].map((c, i) => <circle key={i} cx={1320 + i * 80} cy={1720} r={34} fill={c} />)}</S></D>
      <D f={f} cam={cam} k={0.6}><S><Dust f={f} n={40} /></S></D>
      <Look3D lx={88} ly={30} kc="rgba(255,236,200,0.35)" />
    </>;
};

export const SCENES3: Record<string, Sc> = {
  // ================= q27 Abraham and Isaac =================
  moriah_climb: {frames: 240, amb: 'wind', desc: 'Close shot: old Abraham and young Isaac climbing a rocky mountain path at dawn, Isaac carrying a bundle of firewood (Genesis 22, Moriah, the journey up)', render: (f) => {
    const cam: Cam = {from: 160, to: 260, push: [1.0, 1.09], rise: -20};
    return <>
      <D f={f} cam={cam} k={0.1} blur={2}><S><SkyG id="mc_s" c={['#4a5aa0', '#c98aa0', '#f6c08a', '#ffe6b8']} /><Sun id="mc_sun" x={1050} y={820} r={620} /></S></D>
      <D f={f} cam={cam} k={0.25} blur={4}><S><Ridge id="mc_r1" y={1060} amp={260} seed={3} c="#9a7f98" c2="#c9a8a0" /><Fog id="mc_f1" y={1050} c="#ffe0c0" o={0.7} /></S></D>
      <D f={f} cam={cam} k={0.45} blur={2}><S><Peak id="mc_p" x={1100} y={1300} w={700} h={620} c="#a8846a" c2="#7a5e4a" lit="#ffd8a0" /><Beams x={1050} y={820} f={f} dir={-110} spread={70} o={0.12} /><Fog id="mc_f2" y={1280} c="#ffd8b0" o={0.45} /></S></D>
      <D f={f} cam={cam} k={0.8}><S>
        <path d="M-400 1500 C 200 1420 700 1280 1300 1140 L 1900 1100 L1900 2200 L-400 2200 Z" fill="#a8845e" />
        {Array.from({length: 60}).map((_, i) => <ellipse key={i} cx={rnd(i * 3) * 1800 - 200} cy={1300 + rnd(i * 7) * 700} rx={8 + rnd(i) * 14} ry={4 + rnd(i) * 5} fill="#6e5236" opacity={0.35} />)}
        <path d="M-400 1560 C 200 1480 700 1350 1300 1210 L1900 1170" stroke="#d6b88a" strokeWidth={90} fill="none" opacity={0.6} />
        <Boulder id="mc_b1" x={1230} y={1230} w={220} h={150} /><Boulder id="mc_b2" x={160} y={1470} w={160} h={100} />
      </S>
        <Fig who="abraham" x={walk(f, 520, 640)} ground={1460} s={1.15} arms="down" seed={1} />
        <Fig who="tumi" x={walk(f, 830, 950)} ground={1400} s={0.85} arms="hold" seed={4} />
        <S><Wood x={walk(f, 830, 950) - 85} y={1215 + Math.sin(f / 6) * 3} s={1.1} r={-14} /></S>
      </D>
      <D f={f} cam={cam} k={1.35} blur={12}><S><Boulder id="mc_b3" x={80} y={1980} w={620} h={360} c="#7a6450" c2="#3a2e24" /><Grass x={1320} y={1960} s={2.2} f={f} c="#5a6a32" /><Grass x={1180} y={1990} s={1.8} f={f} c="#4a5a2a" seed={4} /></S></D>
      <D f={f} cam={cam} k={0.6}><S><Dust f={f} /></S></D>
      <Look3D lx={85} ly={40} />
    </>;
  }},
  abraham_stars: {frames: 240, amb: 'crickets', desc: 'Old Abraham outside his glowing tent at night, looking up at a sky full of stars, waiting for the promised son (Genesis 15, God\'s promise, Abraham waited decades)', render: (f) => {
    const cam: Cam = {from: 200, to: 120, push: [1.02, 1.1], rise: 30};
    return <>
      <D f={f} cam={cam} k={0.08}><S><NightSky f={f} id="as_s" moon={false} /><Fog id="as_mw" y={600} h={500} c="#9aa8e0" o={0.18} /></S></D>
      <D f={f} cam={cam} k={0.3} blur={3}><S><Ridge id="as_r" y={1150} amp={180} seed={11} c="#1e2440" c2="#2a3050" /></S></D>
      <D f={f} cam={cam} k={0.8}><S>
        <Field id="as_g" y={1260} c="#3a3a4a" c2="#1e1e2a" spots="#5a5a6a" />
        <defs>{rgrad('as_tg', [[0, '#ffcf7a', 0.7], [1, '#ff9a3a', 0]])}{grad('as_tent', [[0, '#e0c49a'], [1, '#8a6a4a']])}</defs>
        <circle cx={1150} cy={1220} r={420} fill="url(#as_tg)" />
        <path d="M850 1330 L960 1040 L1150 960 L1340 1040 L1450 1330 Z" fill="url(#as_tent)" />
        <path d="M1080 1330 L1150 1120 L1220 1330 Z" fill="#ffcf7a" />
      </S>
        <Fig who="abraham" x={560} ground={1450} s={1.2} arms="open" expr="wow" tilt={-12} seed={2} />
      </D>
      <D f={f} cam={cam} k={1.3} blur={10}><S><Grass x={180} y={1990} s={2.4} f={f} c="#1e2430" /><Grass x={1350} y={2000} s={2} f={f} c="#1a1e2a" seed={3} /></S></D>
      <Look3D lx={75} ly={62} kc="rgba(255,190,110,0.35)" night vig={0.6} warm={0.04} />
    </>;
  }},
  isaac_asks: {frames: 240, amb: 'wind', desc: 'Close two-shot on the mountain path: young Isaac with the firewood looks up and asks his father a question; Abraham looks down at him (Genesis 22:7-8, "where is the lamb?", "God will provide")', render: (f) => {
    const cam: Cam = {from: 230, to: 300, push: [1.05, 1.12]};
    const talk = f > 20 && f < 120;
    return <>
      <D f={f} cam={cam} k={0.1} blur={3}><S><SkyG id="ia_s" c={['#7a8ac0', '#f2b890', '#ffe8c0']} /><Sun id="ia_sun" x={350} y={880} r={560} /></S></D>
      <D f={f} cam={cam} k={0.3} blur={6}><S><Ridge id="ia_r" y={1100} amp={220} seed={5} c="#a8869a" c2="#d0b0a0" /><Fog id="ia_f" y={1100} c="#ffe4c8" o={0.7} /></S></D>
      <D f={f} cam={cam} k={0.85}><S><path d="M-400 1420 C300 1380 900 1340 1900 1300 L1900 2200 L-400 2200 Z" fill="#b08c62" />
        {Array.from({length: 50}).map((_, i) => <ellipse key={i} cx={rnd(i * 3) * 1800 - 200} cy={1380 + rnd(i * 7) * 600} rx={8 + rnd(i) * 12} ry={4} fill="#6e5236" opacity={0.3} />)}</S>
        <Fig who="abraham" x={520} ground={1560} s={1.4} arms="down" expr={talk ? 'smile' : 'talk'} seed={1} tilt={8} />
        <Fig who="tumi" x={980} ground={1520} s={1.0} arms="hold" expr={talk ? 'talk' : 'smile'} flip tilt={-10} seed={4} />
        <S><Wood x={900} y={1250 + Math.sin(f / 6) * 3} s={1.25} r={-8} /></S>
      </D>
      <D f={f} cam={cam} k={1.4} blur={14}><S><Boulder id="ia_b" x={1450} y={2000} w={520} h={380} c="#8a7058" c2="#3a2e24" /></S></D>
      <D f={f} cam={cam} k={0.6}><S><Dust f={f} /></S></D>
      <Look3D lx={20} ly={42} />
    </>;
  }},
  moriah_altar: {frames: 240, amb: 'wind', desc: 'Mountain top: a stone altar with firewood, Abraham with arms raised and Isaac safe beside him as bright light pours down from heaven (Genesis 22:11-12, God stops Abraham; God shown only as light; no knife, no violence)', render: (f) => {
    const cam: Cam = {from: 220, to: 200, push: [1.0, 1.12], rise: 40};
    const L = interpolate(f, [0, 60], [0.4, 1], clamp);
    return <>
      <D f={f} cam={cam} k={0.08}><S><SkyG id="ma_s" c={['#c8b8e8', '#ffe8c0', '#fff6e0']} /><Sun id="ma_sun" x={760} y={200} r={900} c="#fffbe8" core={false} /></S></D>
      <D f={f} cam={cam} k={0.3} blur={5}><S><Ridge id="ma_r" y={1250} amp={150} seed={2} c="#c0a8b8" c2="#e0c8c0" /><Fog id="ma_f" y={1250} c="#fff0d8" o={0.8} /></S></D>
      <D f={f} cam={cam} k={0.8}><S>
        <path d="M-400 1380 C200 1300 1300 1300 1900 1380 L1900 2200 L-400 2200 Z" fill="#a8906e" />
        <Altar x={760} y={1380} s={1.3} />
        <Beams x={760} y={-200} f={f} dir={0} spread={36} n={9} o={0.22 * L} len={2400} c="#fffbe0" />
      </S>
        <Fig who="abraham" x={380} ground={1560} s={1.3} arms="up" expr="wow" seed={1} tilt={-8} />
        <Fig who="tumi" x={1150} ground={1540} s={0.95} arms="down" expr="wow" flip seed={4} />
      </D>
      <D f={f} cam={cam} k={0.6}><S><Dust f={f} n={50} c="#fffbe0" /></S></D>
      <D f={f} cam={cam} k={1.35} blur={13}><S><Grass x={100} y={2000} s={2.4} f={f} c="#6a7a3a" /><Boulder id="ma_b" x={1450} y={2010} w={500} h={300} c="#9a846a" c2="#4a3c2e" /></S></D>
      <Look3D lx={50} ly={8} kc={`rgba(255,250,220,${0.5 * L})`} vig={0.35} />
    </>;
  }},
  ram_thicket: {frames: 240, amb: 'wind', desc: 'A ram caught by its horns in a thicket on the mountain top; Abraham and Isaac turn and see it, relieved (Genesis 22:13, "God will provide", the substitute; no violence)', render: (f) => {
    const cam: Cam = {from: 300, to: 200, push: [1.04, 1.1]};
    return <>
      <D f={f} cam={cam} k={0.1} blur={3}><S><SkyG id="rt_s" c={['#8aa0d0', '#ffd8a8', '#fff0d0']} /><Sun id="rt_sun" x={1200} y={700} r={600} /></S></D>
      <D f={f} cam={cam} k={0.3} blur={5}><S><Ridge id="rt_r" y={1200} amp={160} seed={14} c="#a8a0b8" c2="#d8c8c0" /><Fog id="rt_f" y={1200} c="#fff0d8" o={0.7} /></S></D>
      <D f={f} cam={cam} k={0.85}><S><Field id="rt_g" y={1330} c="#a89a6a" c2="#6a5a3e" spots="#5a4a32" />
        <Thicket x={1000} y={1420} s={1.25} id="rt_th" /><Ram x={1010} y={1440} s={1.2} f={f} /><Thicket x={1150} y={1470} s={0.8} id="rt_th2" /></S>
        <Fig who="abraham" x={360} ground={1600} s={1.3} arms="point" expr="wow" seed={1} />
        <Fig who="tumi" x={620} ground={1580} s={0.95} arms="open" expr="joy" seed={4} />
      </D>
      <D f={f} cam={cam} k={1.35} blur={13}><S><Grass x={1400} y={2000} s={2.6} f={f} c="#5a6a2a" /><Grass x={60} y={2010} s={2.2} f={f} c="#4a5a2a" seed={6} /></S></D>
      <D f={f} cam={cam} k={0.6}><S><Dust f={f} /></S></D>
      <Look3D lx={85} ly={35} />
    </>;
  }},
  temple_moriah: {frames: 240, amb: 'birds', desc: 'Wide view: Jerusalem\'s gleaming temple on top of Mount Moriah above the city at sunrise (2 Chronicles 3:1, Solomon\'s temple, Moriah, Jerusalem)', render: (f) => {
    const cam: Cam = {from: 140, to: 260, push: [1.0, 1.1], rise: 30};
    return <>
      <D f={f} cam={cam} k={0.08}><S><SkyG id="tm_s" c={['#5a7ac0', '#f0b088', '#ffe2b0']} /><Sun id="tm_sun" x={1200} y={760} r={640} /></S></D>
      <D f={f} cam={cam} k={0.25} blur={4}><S><Ridge id="tm_r" y={1120} amp={150} seed={21} c="#9a8aa8" c2="#c8b0a8" /><Fog id="tm_f" y={1120} c="#ffe4c4" o={0.6} /></S></D>
      <D f={f} cam={cam} k={0.55}><S>
        <Peak id="tm_p" x={760} y={1500} w={900} h={560} c="#c0a078" c2="#8a6a4a" lit="#ffe0b0" />
        <Temple x={760} y={950} s={0.9} id="tm_t" />
        <Beams x={1200} y={760} f={f} dir={-120} spread={50} o={0.1} />
      </S></D>
      <D f={f} cam={cam} k={0.85}><S>
        {Array.from({length: 16}).map((_, i) => <House key={i} id={`tm_h${i}`} x={-250 + i * 125 + (i % 3) * 20} y={1520 + (i % 4) * 50} w={110 + (i % 3) * 20} h={100 + (i % 5) * 18} />)}
        <Fog id="tm_f2" y={1560} c="#ffe4c4" o={0.35} />
      </S></D>
      <D f={f} cam={cam} k={1.3} blur={12}><S><Tree id="tm_tr" x={60} y={2000} s={2.2} f={f} c="#5a7a3a" c2="#2a4a1e" /></S></D>
      <D f={f} cam={cam} k={0.6}><S><Dust f={f} /></S></D>
      <Look3D lx={88} ly={38} />
    </>;
  }},
  jordan_john: {frames: 240, amb: 'birds', desc: 'At the Jordan River: John the Baptist, standing by the water, points at Jesus walking toward him (John 1:29, "Behold! The Lamb of God")', render: (f) => {
    const cam: Cam = {from: 180, to: 260, push: [1.02, 1.1]};
    return <>
      <D f={f} cam={cam} k={0.1} blur={3}><S><SkyG id="jj_s" c={['#6a9ad0', '#b8d8e8', '#f4ecd0']} /><Sun id="jj_sun" x={300} y={600} r={500} /></S></D>
      <D f={f} cam={cam} k={0.3} blur={5}><S><Ridge id="jj_r" y={1080} amp={180} seed={31} c="#9ab08a" c2="#c8c8a0" /><Fog id="jj_f" y={1080} c="#f0f4e0" o={0.6} /></S></D>
      <D f={f} cam={cam} k={0.6} blur={1}><S>
        <defs>{grad('jj_w', [[0, '#7ab0c8'], [1, '#3a7090']])}</defs>
        <path d="M-400 1180 C300 1150 900 1200 1900 1160 L1900 1360 C1000 1380 300 1330 -400 1360 Z" fill="url(#jj_w)" />
        {Array.from({length: 18}).map((_, i) => { const x = (rnd(i) * 1900 + f * 1.2) % 2100 - 300, y = 1200 + rnd(i * 3) * 140; return <path key={i} d={`M${x} ${y} q30 -8 60 0`} stroke="#fff" strokeWidth={4} fill="none" opacity={0.45} />; })}
        {[[-100, 1200], [1500, 1190], [1300, 1210]].map(([x, y], i) => <Tree key={i} id={`jj_t${i}`} x={x} y={y} s={0.9} f={f} />)}
      </S></D>
      <D f={f} cam={cam} k={0.85}><S><Field id="jj_g" y={1350} c="#9aaa6a" c2="#5a6a3a" spots="#e8d070" /></S>
        <Fig who="jesus" x={walk(f, 1180, 1060)} ground={1470} s={0.95} arms="down" flip seed={3} />
        <Fig who="john_b" x={430} ground={1600} s={1.35} arms="point" talk seed={2} />
      </D>
      <D f={f} cam={cam} k={1.35} blur={13}><S><Grass x={80} y={2000} s={2.6} f={f} /><Grass x={1450} y={2010} s={2.2} f={f} seed={5} /></S></D>
      <Look3D lx={22} ly={30} />
    </>;
  }},
  cross_dusk: {frames: 240, amb: 'wind', desc: 'A single empty wooden cross on a hill outside Jerusalem against a dramatic dusk sky, no people (God gave His own Son, Romans 8:32; the cross; no violence)', render: (f) => {
    const cam: Cam = {from: 200, to: 180, push: [1.0, 1.14], rise: 30};
    return <>
      <D f={f} cam={cam} k={0.08}><S><SkyG id="cd_s" c={['#2a2448', '#8a4a5a', '#e88a5a', '#ffc890']} /><Sun id="cd_sun" x={750} y={1150} r={700} c="#ffd8a0" /></S></D>
      <D f={f} cam={cam} k={0.25} blur={4}><S><Ridge id="cd_r" y={1250} amp={120} seed={41} c="#5a3a4a" c2="#7a4a50" />
        {Array.from({length: 10}).map((_, i) => <House key={i} id={`cd_h${i}`} x={-200 + i * 190} y={1290} w={140} h={90 + (i % 3) * 30} c="#6a4448" c2="#4a2e34" />)}</S></D>
      <D f={f} cam={cam} k={0.6}><S><Beams x={750} y={1150} f={f} dir={180} spread={160} n={12} o={0.09} c="#ffd8a0" /></S></D>
      <D f={f} cam={cam} k={0.85}><S>
        <path d="M-400 1500 C300 1280 1200 1280 1900 1500 L1900 2200 L-400 2200 Z" fill="#3a2a2e" />
        <rect x={728} y={700} width={44} height={640} fill="#4a3022" /><rect x={600} y={820} width={300} height={42} fill="#4a3022" />
        <rect x={728} y={700} width={14} height={640} fill="#8a5a3a" opacity={0.6} />
      </S></D>
      <D f={f} cam={cam} k={1.3} blur={12}><S><Grass x={200} y={2000} s={2.6} f={f} c="#2a1e22" /><Grass x={1300} y={2010} s={2.3} f={f} c="#2a1e22" seed={3} /></S></D>
      <Look3D lx={50} ly={58} kc="rgba(255,190,130,0.3)" vig={0.55} />
    </>;
  }},
  jesus_dawn: {frames: 240, amb: 'birds', desc: 'The risen Jesus standing on a green hill at sunrise holding a lamb, warm light behind Him (Jesus the Lamb of God, risen, "God will provide", hope)', render: (f) => {
    const cam: Cam = {from: 220, to: 240, push: [1.05, 1.13], rise: -20};
    return <>
      <D f={f} cam={cam} k={0.08}><S><SkyG id="jd_s" c={['#6a8ad0', '#f8c098', '#fff0c8']} /><Sun id="jd_sun" x={760} y={980} r={760} /></S></D>
      <D f={f} cam={cam} k={0.3} blur={5}><S><Ridge id="jd_r" y={1220} amp={140} seed={51} c="#a0b090" c2="#d8d0a8" /><Fog id="jd_f" y={1220} c="#fff0d0" o={0.7} /></S></D>
      <D f={f} cam={cam} k={0.6}><S><Beams x={760} y={980} f={f} dir={180} spread={170} n={14} o={0.11} /></S></D>
      <D f={f} cam={cam} k={0.85}><S><path d="M-400 1460 C300 1360 1200 1360 1900 1460 L1900 2200 L-400 2200 Z" fill="#7a9a4a" />
        {Array.from({length: 40}).map((_, i) => <circle key={i} cx={rnd(i * 3) * 1800 - 200} cy={1440 + rnd(i * 5) * 500} r={5 + rnd(i) * 5} fill={['#f2d050', '#ffffff', '#e87a8a'][i % 3]} opacity={0.8} />)}</S>
        <Fig who="jesus" x={760} ground={1620} s={1.4} arms="hold" expr="smile" seed={3} />
        <S><Sheep x={772} y={1300} s={0.62} f={f} /></S>
      </D>
      <D f={f} cam={cam} k={1.35} blur={13}><S><Grass x={100} y={2000} s={2.6} f={f} c="#4a6a2a" /><Grass x={1400} y={2010} s={2.4} f={f} c="#4a6a2a" seed={2} /></S></D>
      <D f={f} cam={cam} k={0.6}><S><Dust f={f} n={44} /></S></D>
      <Look3D lx={50} ly={50} kc="rgba(255,226,170,0.42)" vig={0.4} />
    </>;
  }},

  // ================= q28 angels =================
  studio_putti: {frames: 240, amb: 'room', desc: 'A Renaissance painter\'s studio: an artist paints a canvas of chubby winged babies by a sunny window, more such paintings on the walls (where the cute baby angel image came from: Italian Renaissance art)', render: (f) => {
    return studio(f, {from: 180, to: 280, push: [1.02, 1.1]});
  }},
  putti_canvas: {frames: 240, amb: 'room', desc: 'Close-up on the painter\'s canvas: chubby winged babies on clouds, brush strokes, warm window light (the cute baby angel image is from painters, not the Bible)', render: (f) => {
    return studio(f, {from: 470, to: 520, push: [1.55, 1.7], rise: 60});
  }},
  eden_gate: {frames: 240, amb: 'wind', desc: 'The east of Eden: two tall shining cherubim, wings raised, stand on either side of the way to a glowing tree of life, a flaming sword turning in the air between them (Genesis 3:24; cherubim are mighty, not babies)', render: (f) => {
    const cam: Cam = {from: 200, to: 220, push: [1.0, 1.12], rise: 20};
    const rot = f * 4;
    return <>
      <D f={f} cam={cam} k={0.08}><S><SkyG id="eg_s" c={['#1a2a4a', '#4a6a7a', '#c8d8a8']} /><Sun id="eg_sun" x={760} y={1000} r={700} c="#e8ffd0" core={false} /></S></D>
      <D f={f} cam={cam} k={0.3} blur={5}><S>
        <Tree id="eg_tl" x={760} y={1250} s={1.6} c="#9ad070" c2="#3a7a3a" f={f} />
        {Array.from({length: 12}).map((_, i) => <circle key={i} cx={640 + rnd(i) * 240} cy={720 + rnd(i * 3) * 200} r={12} fill="#ffd860" opacity={0.6 + 0.4 * Math.sin(f / 10 + i)} />)}
        <Fog id="eg_f" y={1260} c="#d8f0c8" o={0.6} />
      </S></D>
      <D f={f} cam={cam} k={0.85}><S><Field id="eg_g" y={1360} c="#4a7a4a" c2="#1e3a24" spots="#8ac070" />
        <Beams x={760} y={-200} f={f} dir={0} spread={40} n={7} o={0.12} c="#e8fff0" />
        <g transform={`translate(760 1060) rotate(${rot})`}>
          <defs>{rgrad('eg_fl', [[0, '#fff6c0'], [0.5, '#ffa030', 0.9], [1, '#ff6a1a', 0]])}</defs>
          <circle cx={0} cy={0} r={170} fill="url(#eg_fl)" opacity={0.6} />
          <rect x={-150} y={-12} width={300} height={24} rx={12} fill="#fff8e0" />
          <path d="M-160 0 Q-200 -40 -230 0 Q-200 40 -160 0" fill="#ffb040" /><path d="M160 0 Q200 -40 230 0 Q200 40 160 0" fill="#ffb040" />
        </g>
      </S>
        {[[420, false], [1100, true]].map(([x, fl], i) => <div key={i} style={{position: 'absolute', inset: 0, filter: 'brightness(1.12) drop-shadow(0 0 40px rgba(255,250,220,0.9))'}}>
          <Fig who="bright" x={x as number} ground={1620} s={1.5} arms="up" expr="smile" flip={fl as boolean} seed={i} />
        </div>)}
      </D>
      <D f={f} cam={cam} k={0.6}><S><Dust f={f} n={50} c="#f0ffe0" /></S></D>
      <Look3D lx={50} ly={50} kc="rgba(230,255,210,0.3)" night vig={0.55} />
    </>;
  }},
  shepherds_fright: {frames: 240, amb: 'crickets', desc: 'Night fields near Bethlehem: shepherds and sheep cower, shielding their eyes, as an angel appears in blinding light above them (Luke 2:9, "they were greatly afraid")', render: (f) => {
    const cam: Cam = {from: 220, to: 240, push: [1.0, 1.1], rise: 30};
    const L = interpolate(f, [0, 45], [0.3, 1], clamp);
    return <>
      <D f={f} cam={cam} k={0.08}><S><NightSky f={f} id="sf_s" moon={false} /></S></D>
      <D f={f} cam={cam} k={0.25} blur={4}><S><Ridge id="sf_r" y={1150} amp={160} seed={61} c="#1e2448" c2="#2a3058" />
        {Array.from({length: 6}).map((_, i) => <House key={i} id={`sf_h${i}`} x={950 + i * 90} y={1160} w={80} h={60} c="#3a3a5a" c2="#2a2a44" lit={i % 2 === 0} />)}</S></D>
      <D f={f} cam={cam} k={0.5}><S><Sun id="sf_glow" x={760} y={520} r={900 * L} c="#fffbe8" core={false} /><Beams x={760} y={520} f={f} dir={0} spread={110} n={11} o={0.2 * L} c="#fffbe8" /></S>
        <div style={{position: 'absolute', inset: 0, opacity: L, filter: 'brightness(1.2) drop-shadow(0 0 50px rgba(255,255,230,1))'}}><Fig who="angel" x={760} ground={900} s={1.0} arms="open" expr="smile" seed={7} /></div>
      </D>
      <D f={f} cam={cam} k={0.85}><S><Field id="sf_g" y={1330} c="#4a5a4a" c2="#1e2a24" spots="#6a7a5a" />
        {[[1050, 1500], [1250, 1540], [200, 1560]].map(([x, y], i) => <Sheep key={i} x={x} y={y} s={0.9} f={f} seed={i} />)}</S>
        <Fig who="shepherd" x={380} ground={1640} s={1.35} arms="up" expr="wow" seed={1} tilt={10} />
        <Fig who="shepherd2" x={800} ground={1600} s={1.15} arms="shrug" expr="wow" flip seed={5} tilt={-8} />
      </D>
      <D f={f} cam={cam} k={1.35} blur={12}><S><Grass x={100} y={2000} s={2.6} f={f} c="#1e2a24" /><Grass x={1400} y={2010} s={2.2} f={f} c="#1e2a24" seed={3} /></S></D>
      <Look3D lx={50} ly={25} kc={`rgba(255,252,230,${0.55 * L})`} night vig={0.55} warm={0.02} />
    </>;
  }},
  tomb_angel: {frames: 240, amb: 'wind', desc: 'Dawn at the empty tomb: an angel shining like lightning, clothes white as snow, sits on the rolled-away stone (Matthew 28:2-3)', render: (f) => {
    const cam: Cam = {from: 760, to: 780, push: [1.04, 1.13]};
    const flick = 0.85 + 0.15 * Math.sin(f / 3) * Math.sin(f / 7);
    return <>
      <D f={f} cam={cam} k={0.3} blur={2}><S><TombSet f={f} id="ta" /></S></D>
      <D f={f} cam={cam} k={0.6}><S><Sun id="ta_gl" x={1290} y={900} r={620} c="#f4f8ff" core={false} /><Beams x={1290} y={900} f={f} dir={180} spread={200} n={16} o={0.16 * flick} c="#f4f8ff" /></S>
        <div style={{position: 'absolute', inset: 0, filter: `brightness(${1.15 * flick}) drop-shadow(0 0 60px rgba(240,248,255,1))`}}><Fig who="bright" x={1290} ground={1120} s={1.15} arms="open" expr="smile" seed={8} /></div>
      </D>
      <D f={f} cam={cam} k={1.35} blur={13}><S><Grass x={80} y={2000} s={2.6} f={f} c="#4a5a2a" /><Boulder id="ta_b" x={500} y={2020} w={600} h={300} c="#8a7058" c2="#3a2e24" /></S></D>
      <D f={f} cam={cam} k={0.6}><S><Dust f={f} n={46} c="#f4f8ff" /></S></D>
      <Look3D lx={72} ly={45} kc="rgba(240,248,255,0.45)" />
    </>;
  }},
  guards_fall: {frames: 240, amb: 'wind', desc: 'Two Roman soldiers at the tomb tremble and fall back on the ground in fear before a blinding light (Matthew 28:4, "the guards shook for fear"; no violence)', render: (f) => {
    const cam: Cam = {from: 160, to: 200, push: [1.0, 1.12]};
    const sh = Math.sin(f * 1.7) * 3;
    return <>
      <D f={f} cam={cam} k={0.3} blur={4}><S><TombSet f={f} id="gf" /></S></D>
      <D f={f} cam={cam} k={0.6}><S><Sun id="gf_gl" x={1300} y={800} r={900} c="#f4f8ff" core={false} /><Beams x={1300} y={800} f={f} dir={-110} spread={80} n={10} o={0.2} c="#f4f8ff" /></S></D>
      <D f={f} cam={cam} k={0.9}><S><rect x={-400} y={1480} width={WORLD + 800} height={800} fill="#6a7a4a" /></S>
        <div style={{position: 'absolute', inset: 0, transform: `translateX(${sh}px)`}}>
          <Fig who="guard" x={420} ground={1720} s={1.35} arms="up" expr="wow" tilt={-22} seed={1} helmet />
          <Fig who="guard" x={900} ground={1680} s={1.2} arms="shrug" expr="wow" tilt={18} flip seed={3} helmet />
        </div>
        <S><rect x={180} y={1300} width={14} height={430} fill="#5a3a22" transform={`rotate(-35 187 1730)`} /><path d="M120 1330 l30 -60 l30 60 Z" fill="#c0c0c8" transform={`rotate(-35 187 1730)`} /></S>
      </D>
      <D f={f} cam={cam} k={1.35} blur={13}><S><Grass x={1350} y={2000} s={2.6} f={f} c="#4a5a2a" /></S></D>
      <Look3D lx={85} ly={35} kc="rgba(240,248,255,0.5)" />
    </>;
  }},
  women_tomb: {frames: 240, amb: 'birds', desc: 'Two women at the open tomb at sunrise listen with joy as a shining angel tells them "He is not here; for He is risen" (Matthew 28:5-6)', render: (f) => {
    const cam: Cam = {from: 260, to: 220, push: [1.04, 1.12]};
    return <>
      <D f={f} cam={cam} k={0.3} blur={3}><S><TombSet f={f} id="wt" /></S></D>
      <D f={f} cam={cam} k={0.6}><S><Sun id="wt_gl" x={1000} y={1000} r={520} c="#f4f8ff" core={false} /></S>
        <div style={{position: 'absolute', inset: 0, filter: 'brightness(1.12) drop-shadow(0 0 45px rgba(240,248,255,1))'}}><Fig who="bright" x={900} ground={1330} s={1.0} arms="point" talk seed={8} /></div>
      </D>
      <D f={f} cam={cam} k={0.88}><S><rect x={-400} y={1500} width={WORLD + 800} height={800} fill="#7a9a4a" /></S>
        <Fig who="mary" x={360} ground={1700} s={1.3} arms="open" expr="joy" seed={1} />
        <Fig who="woman2" x={640} ground={1680} s={1.2} arms="up" expr="wow" seed={4} />
      </D>
      <D f={f} cam={cam} k={1.35} blur={13}><S><Grass x={80} y={2000} s={2.6} f={f} c="#4a6a2a" /><Grass x={1420} y={2010} s={2.2} f={f} c="#4a6a2a" seed={4} /></S></D>
      <D f={f} cam={cam} k={0.6}><S><Dust f={f} n={40} /></S></D>
      <Look3D lx={30} ly={40} />
    </>;
  }},
  risen_road: {frames: 240, amb: 'birds', desc: 'On a country road at sunrise the risen Jesus meets the overjoyed women, who run to Him (Matthew 28:8-9, Jesus alive, the greatest news)', render: (f) => {
    const cam: Cam = {from: 180, to: 260, push: [1.0, 1.1]};
    return <>
      <D f={f} cam={cam} k={0.08}><S><SkyG id="rr_s" c={['#7aa0d8', '#ffd0a0', '#fff2d0']} /><Sun id="rr_sun" x={1100} y={1000} r={700} /></S></D>
      <D f={f} cam={cam} k={0.3} blur={5}><S><Ridge id="rr_r" y={1200} amp={150} seed={71} c="#a0b890" c2="#d8d8b0" />
        {[[-60, 1230], [1300, 1220]].map(([x, y], i) => <Tree key={i} id={`rr_t${i}`} x={x} y={y} s={0.9} f={f} />)}<Fog id="rr_f" y={1210} c="#fff4d8" o={0.6} /></S></D>
      <D f={f} cam={cam} k={0.6}><S><Beams x={1100} y={1000} f={f} dir={-140} spread={80} n={10} o={0.11} /></S></D>
      <D f={f} cam={cam} k={0.88}><S><Field id="rr_g" y={1330} c="#8aaa5a" c2="#4a6a2a" spots="#f2d050" />
        <path d="M-400 1800 C300 1600 900 1450 1900 1380 L1900 1460 C900 1530 400 1700 -400 1980 Z" fill="#d8c09a" opacity={0.8} /></S>
        <Fig who="jesus" x={880} ground={1560} s={1.3} arms="open" expr="joy" flip seed={3} />
        <Fig who="mary" x={walk(f, 420, 520)} ground={1700} s={1.2} arms="up" expr="joy" seed={1} />
        <Fig who="woman2" x={walk(f, 200, 300)} ground={1740} s={1.15} arms="open" expr="joy" seed={4} />
      </D>
      <D f={f} cam={cam} k={1.35} blur={13}><S><Grass x={1450} y={2000} s={2.6} f={f} c="#4a6a2a" /></S></D>
      <D f={f} cam={cam} k={0.6}><S><Dust f={f} n={40} /></S></D>
      <Look3D lx={80} ly={50} kc="rgba(255,226,170,0.4)" />
    </>;
  }},

  // ================= q29 faith and evidence =================
  letter_lamp: {frames: 240, amb: 'room', desc: 'Close shot: an early Christian writer at a desk writes a letter on a scroll by warm oil-lamp light, the word FAITH glowing faintly on the page (the letter to the Hebrews, the Bible defining faith)', render: (f) => {
    const cam: Cam = {from: 240, to: 300, push: [1.06, 1.16]};
    const fl = 1 + Math.sin(f / 2.3) * 0.06;
    return <>
      <D f={f} cam={cam} k={0.3} blur={4}><S><defs>{grad('ll_w', [[0, '#2a1c14'], [1, '#4a3222']])}</defs><rect x={-400} y={-200} width={WORLD + 800} height={H + 400} fill="url(#ll_w)" />
        {Array.from({length: 5}).map((_, r) => Array.from({length: 8}).map((_, i) => <circle key={`${r}${i}`} cx={900 + i * 70} cy={420 + r * 110} r={26} fill="#d8c8a0" opacity={0.5} />))}</S></D>
      <D f={f} cam={cam} k={0.85}><S>
        <defs>{rgrad('ll_lg', [[0, '#ffcf7a', 0.75], [1, '#ff9a3a', 0]])}</defs>
        <circle cx={1080} cy={1230} r={560 * fl} fill="url(#ll_lg)" />
        <rect x={-400} y={1380} width={WORLD + 800} height={700} fill="#6e4a2c" /><rect x={-400} y={1380} width={WORLD + 800} height={26} fill="#8a5e36" />
        <path d="M1020 1390 Q1080 1420 1140 1390 L1160 1376 L1100 1360 Q1080 1356 1050 1360 Z" fill="#a8744e" />
        <path transform={`translate(1150 1370) scale(1 ${fl})`} d="M0 0 Q-12 -46 6 -78 Q26 -40 12 0 Z" fill="#ffd27a" />
      </S>
        <Fig who="writer" x={460} ground={1700} s={1.45} arms="hold" expr="smile" seed={2} tilt={10} />
        <S><g transform="translate(500 1330) rotate(-4)"><rect x={-260} y={0} width={520} height={110} fill="#f2e6c8" /><circle cx={-262} cy={55} r={34} fill="#d8c8a0" /><circle cx={262} cy={55} r={34} fill="#d8c8a0" />
          {Array.from({length: 4}).map((_, i) => <rect key={i} x={-220} y={18 + i * 22} width={300 + rnd(i) * 120} height={7} fill="#8a6a4a" opacity={0.6} />)}
          <text x={120} y={70} fontFamily="Lora" fontSize={40} fontWeight={700} fill="#8a4a1a" opacity={interpolate(f, [30, 90], [0, 0.9], clamp)}>faith</text></g></S>
      </D>
      <D f={f} cam={cam} k={1.4} blur={14}><S><rect x={-200} y={1760} width={600} height={300} fill="#3a2414" /><circle cx={1400} cy={1900} r={200} fill="#2a1a10" /></S></D>
      <D f={f} cam={cam} k={0.6}><S><Dust f={f} n={30} c="#ffd8a0" /></S></D>
      <Look3D lx={75} ly={62} kc="rgba(255,190,110,0.42)" night vig={0.6} />
    </>;
  }},
  wind_field: {frames: 240, amb: 'wind', desc: 'A young man on a hilltop at golden hour, cloak and the tall grass blowing in a strong unseen wind, trees bending (you can\'t see the wind but you see what it does; things not seen, trust built on evidence)', render: (f) => {
    const cam: Cam = {from: 200, to: 280, push: [1.02, 1.1]};
    return <>
      <D f={f} cam={cam} k={0.08}><S><SkyG id="wf_s" c={['#5a7ac0', '#f0b890', '#ffe4b0']} /><Sun id="wf_sun" x={300} y={980} r={620} />
        {Array.from({length: 6}).map((_, i) => <ellipse key={i} cx={(rnd(i) * 1800 + f * (2 + i * 0.4)) % 2000 - 250} cy={380 + i * 90} rx={180} ry={30} fill="#fff4e0" opacity={0.35} />)}</S></D>
      <D f={f} cam={cam} k={0.3} blur={4}><S><Ridge id="wf_r" y={1200} amp={170} seed={81} c="#9a8aa0" c2="#c8b0a0" /><Fog id="wf_f" y={1200} c="#ffe4c4" o={0.6} /></S></D>
      <D f={f} cam={cam} k={0.85}><S><path d="M-400 1480 C300 1380 1200 1380 1900 1480 L1900 2200 L-400 2200 Z" fill="#b0a050" />
        <g transform={`rotate(${Math.sin(f / 14) * 3 + 6} 1180 1450)`}><Tree id="wf_t" x={1180} y={1450} s={1.3} f={f * 4} c="#8aaa4a" c2="#4a6a2a" /></g>
        {Array.from({length: 16}).map((_, i) => <Grass key={i} x={-100 + i * 110} y={1480 + (i % 3) * 30} s={1.2} f={f * 3} c="#c8b860" seed={i} />)}</S>
        <Fig who="sam" x={560} ground={1660} s={1.35} arms="open" expr="smile" seed={2} tilt={-6 + Math.sin(f / 10) * 3} />
      </D>
      <D f={f} cam={cam} k={1.3} blur={10}><S>{Array.from({length: 8}).map((_, i) => <Grass key={i} x={-100 + i * 230} y={2000} s={2.6} f={f * 3} c="#8a8a3a" seed={i + 9} />)}</S></D>
      <D f={f} cam={cam} k={0.7}><S>{Array.from({length: 30}).map((_, i) => { const x = (rnd(i) * 1800 + f * (6 + rnd(i * 3) * 6)) % 2000 - 250, y = 700 + rnd(i * 7) * 900 + Math.sin(f / 9 + i) * 30; return <ellipse key={i} cx={x} cy={y} rx={9} ry={4} fill={i % 2 ? '#c8a040' : '#e8d080'} opacity={0.7} transform={`rotate(${f * 4 + i * 20} ${x} ${y})`} />; })}</S></D>
      <Look3D lx={20} ly={50} />
    </>;
  }},
  thomas_doubt: {frames: 240, amb: 'room', desc: 'A lamp-lit room: excited disciples tell Thomas they have seen Jesus alive; Thomas stands with arms crossed, shaking his head, unconvinced (John 20:24-25)', render: (f) => {
    const cam: Cam = {from: 260, to: 200, push: [1.04, 1.12]};
    return <>
      <D f={f} cam={cam} k={0.3} blur={4}><S><Room f={f} id="td" /></S></D>
      <D f={f} cam={cam} k={0.6} blur={2}>
        <Fig who="andrew" x={1240} ground={1440} s={0.95} arms="wave" talk flip seed={6} />
        <Fig who="peter" x={1000} ground={1470} s={1.0} arms="open" expr="joy" flip seed={5} />
      </D>
      <D f={f} cam={cam} k={0.88}>
        <Fig who="thomas" x={460} ground={1700} s={1.45} arms="shrug" expr="skeptic" tilt={Math.sin(f / 7) * 6} seed={2} />
      </D>
      <D f={f} cam={cam} k={1.4} blur={14}><S><rect x={1050} y={1720} width={700} height={300} rx={20} fill="#3a2414" /><ellipse cx={1250} cy={1720} rx={120} ry={30} fill="#a87a4a" /></S></D>
      <D f={f} cam={cam} k={0.6}><S><Dust f={f} n={26} c="#ffd8a0" /></S></D>
      <Look3D lx={15} ly={52} kc="rgba(255,190,110,0.38)" night vig={0.6} />
    </>;
  }},
  room_jesus: {frames: 240, amb: 'room', desc: 'In the locked lamp-lit room the risen Jesus stands in soft light, holding out His open hands toward Thomas, who leans in amazed (John 20:26-27, "Reach your finger here, and look at My hands"; no wounds shown graphically)', render: (f) => {
    const cam: Cam = {from: 220, to: 280, push: [1.05, 1.15]};
    const L = interpolate(f, [0, 50], [0.5, 1], clamp);
    return <>
      <D f={f} cam={cam} k={0.3} blur={4}><S><Room f={f} id="rj" /></S></D>
      <D f={f} cam={cam} k={0.6}><S><Sun id="rj_g" x={960} y={1050} r={640 * L} c="#fff4d8" core={false} /></S>
        <Fig who="peter" x={1350} ground={1450} s={0.9} arms="down" expr="wow" flip seed={5} />
      </D>
      <D f={f} cam={cam} k={0.88}>
        <div style={{position: 'absolute', inset: 0, filter: 'drop-shadow(0 0 40px rgba(255,240,200,0.8))'}}><Fig who="jesus" x={960} ground={1680} s={1.45} arms="open" expr="smile" flip seed={3} /></div>
        <Fig who="thomas" x={400} ground={1720} s={1.4} arms="point" expr="wow" tilt={12} seed={2} />
      </D>
      <D f={f} cam={cam} k={1.4} blur={14}><S><rect x={-300} y={1760} width={600} height={300} rx={20} fill="#3a2414" /></S></D>
      <D f={f} cam={cam} k={0.6}><S><Dust f={f} n={34} c="#fff0d0" /></S></D>
      <Look3D lx={62} ly={50} kc="rgba(255,236,190,0.42)" night vig={0.55} />
    </>;
  }},
  thomas_worship: {frames: 240, amb: 'room', desc: 'Thomas, overwhelmed, lifts his hands to Jesus in worship as the other disciples watch (John 20:28, "My Lord and my God!")', render: (f) => {
    const cam: Cam = {from: 300, to: 220, push: [1.06, 1.14], rise: 20};
    return <>
      <D f={f} cam={cam} k={0.3} blur={4}><S><Room f={f} id="tw" /></S></D>
      <D f={f} cam={cam} k={0.6} blur={2}>
        <Fig who="andrew" x={200} ground={1450} s={0.9} arms="down" expr="joy" seed={6} />
        <Fig who="peter" x={1400} ground={1460} s={0.92} arms="up" expr="joy" flip seed={5} />
      </D>
      <D f={f} cam={cam} k={0.88}><S><Sun id="tw_g" x={1050} y={1100} r={560} c="#fff4d8" core={false} /></S>
        <div style={{position: 'absolute', inset: 0, filter: 'drop-shadow(0 0 40px rgba(255,240,200,0.8))'}}><Fig who="jesus" x={1050} ground={1660} s={1.4} arms="open" expr="smile" flip seed={3} /></div>
        <Fig who="thomas" x={520} ground={1780} s={1.35} arms="up" expr="joy" tilt={14} seed={2} />
      </D>
      <D f={f} cam={cam} k={1.4} blur={14}><S><rect x={-300} y={1800} width={800} height={300} rx={20} fill="#3a2414" /></S></D>
      <D f={f} cam={cam} k={0.6}><S><Dust f={f} n={34} c="#fff0d0" /></S></D>
      <Look3D lx={68} ly={50} kc="rgba(255,236,190,0.42)" night vig={0.55} />
    </>;
  }},
  hill_500: {frames: 240, amb: 'crowd', desc: 'Jesus on a sunny hillside seen by a huge crowd of hundreds of people at once, heads of the crowd in the blurred foreground (1 Corinthians 15:6, seen by over five hundred people)', render: (f) => {
    const cam: Cam = {from: 160, to: 260, push: [1.0, 1.1], rise: -20};
    const far = crowd(28, 1260, 3, 0.42), near = crowd(14, 1500, 7, 0.75);
    return <>
      <D f={f} cam={cam} k={0.08}><S><SkyG id="h5_s" c={['#5a90d8', '#a8d0f0', '#f4ecc8']} /><Sun id="h5_sun" x={760} y={700} r={600} /></S></D>
      <D f={f} cam={cam} k={0.3} blur={4}><S><Ridge id="h5_r" y={1100} amp={160} seed={91} c="#8aa070" c2="#b8c090" /><Fog id="h5_f" y={1100} c="#f4f4dc" o={0.5} /></S></D>
      <D f={f} cam={cam} k={0.55} blur={1}><S><path d="M200 1200 C500 900 1000 900 1300 1200 Z" fill="#8aaa5a" /></S>
        <div style={{position: 'absolute', inset: 0, filter: 'drop-shadow(0 0 30px rgba(255,240,200,0.8))'}}><Fig who="jesus" x={760} ground={1010} s={0.8} arms="up" expr="joy" seed={3} /></div>
      </D>
      <D f={f} cam={cam} k={0.8}><S><Field id="h5_g" y={1150} c="#7a9a4a" c2="#4a6a2a" spots="#f2d050" /></S>
        {far.map((p, i) => <Fig key={i} who={p.who} x={p.x} ground={p.g} s={p.s} arms={i % 4 === 0 ? 'up' : 'down'} expr="joy" seed={p.seed} />)}
      </D>
      <D f={f} cam={cam} k={1.1} blur={5}>{near.map((p, i) => <Fig key={i} who={p.who} x={p.x} ground={p.g + 200} s={p.s + 0.5} arms={i % 3 === 0 ? 'wave' : 'down'} expr="joy" seed={p.seed} dim={0.15} />)}</D>
      <Look3D lx={50} ly={36} />
    </>;
  }},
  path_dawn: {frames: 240, amb: 'birds', desc: 'A young man of today walks along a lit path at sunrise toward Jesus, who waits with open arms (faith is not a leap in the dark; trusting Jesus, the One who showed up)', render: (f) => {
    const cam: Cam = {from: 200, to: 240, push: [1.0, 1.14]};
    return <>
      <D f={f} cam={cam} k={0.08}><S><SkyG id="pd_s" c={['#2a3a70', '#c08aa0', '#ffd0a0', '#fff0c8']} /><Sun id="pd_sun" x={760} y={1080} r={780} /></S></D>
      <D f={f} cam={cam} k={0.3} blur={4}><S><Ridge id="pd_r" y={1230} amp={150} seed={101} c="#6a6a90" c2="#b8a0a8" /><Fog id="pd_f" y={1230} c="#ffe8cc" o={0.7} /></S></D>
      <D f={f} cam={cam} k={0.6}><S><Beams x={760} y={1080} f={f} dir={180} spread={170} n={14} o={0.12} /></S>
        <div style={{position: 'absolute', inset: 0, filter: 'drop-shadow(0 0 35px rgba(255,240,200,0.9))'}}><Fig who="jesus" x={760} ground={1300} s={0.85} arms="open" expr="smile" seed={3} /></div>
      </D>
      <D f={f} cam={cam} k={0.88}><S><path d="M-400 1340 C300 1300 1200 1300 1900 1340 L1900 2200 L-400 2200 Z" fill="#5a6a3a" />
        <path d="M640 1320 L880 1320 L1300 2200 L200 2200 Z" fill="#e8d0a0" opacity={0.85} />
        <path d="M700 1320 L820 1320 L1000 2200 L500 2200 Z" fill="#fff0c8" opacity={0.6} /></S>
        <Fig who="sam" x={walk(f, 640, 720)} ground={walk(f, 1780, 1640)} s={walk(f, 1.35, 1.15)} arms="down" seed={2} flip />
      </D>
      <D f={f} cam={cam} k={1.35} blur={13}><S><Grass x={80} y={2000} s={2.6} f={f} c="#3a4a2a" /><Grass x={1420} y={2000} s={2.6} f={f} c="#3a4a2a" seed={4} /></S></D>
      <D f={f} cam={cam} k={0.6}><S><Dust f={f} n={44} /></S></D>
      <Look3D lx={50} ly={55} kc="rgba(255,226,170,0.45)" vig={0.5} />
    </>;
  }},
};
