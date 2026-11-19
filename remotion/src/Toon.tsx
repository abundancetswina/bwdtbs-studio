import React from 'react';
import {useCurrentFrame} from 'remotion';

// Flat cartoon cast in the series style: big round head, dot eyes, ink outline, stick limbs.
export const INK = '#141016';
export type Look = {
  tunic: string; skin: string; toga?: string; hair?: string; beard?: string; shortBeard?: boolean; brows?: string;
  headcloth?: string; band?: string; dress?: string; longHair?: string; crown?: boolean; hoodie?: boolean;
  wings?: boolean; staff?: boolean;
};
export type Expr = 'smile' | 'talk' | 'sleep' | 'wow' | 'skeptic' | 'joy';
export type Arms = 'down' | 'shrug' | 'wave' | 'point' | 'up' | 'hold' | 'open';

const ARMS: Record<Arms, [number, number, number, number]> = {
  // [left angle, right angle, left length, right length] (degrees, 0 = right, 90 = down)
  down: [112, 68, 120, 120], shrug: [200, -20, 115, 115], wave: [112, -65, 120, 120],
  point: [112, -5, 120, 130], up: [235, -55, 120, 120], hold: [50, 130, 70, 70], open: [160, 20, 120, 120],
};

export const Toon: React.FC<{
  look: Look; x: number; y: number; scale?: number; expr?: Expr; arms?: Arms; flip?: boolean;
  seed?: number; talkFrom?: number; talkTo?: number; baby?: boolean; tilt?: number;
}> = ({look, x, y, scale = 1, expr = 'smile', arms = 'down', flip, seed = 0, talkFrom = -1, talkTo = -1, baby, tilt = 0}) => {
  const f = useCurrentFrame();
  const talking = expr === 'talk' || (f >= talkFrom && f < talkTo);
  const blink = expr !== 'sleep' && (f + seed * 37) % 96 < 4;
  const bob = Math.sin((f + seed * 20) / 11) * 4;
  const sway = Math.sin((f + seed * 13) / 9);
  const [la, ra, ll, rl] = ARMS[arms];
  const wob = arms === 'wave' ? Math.sin(f / 4) * 18 : arms === 'shrug' ? sway * 6 : sway * 3;
  const arm = (sx: number, sy: number, ang: number, len: number, side: number) => {
    const a = ((ang + wob * side) * Math.PI) / 180;
    const ex = sx + Math.cos(a) * len, ey = sy + Math.sin(a) * len;
    const mx = (sx + ex) / 2 - Math.sin(a) * 14 * side, my = (sy + ey) / 2 + Math.cos(a) * 14 * side;
    return (
      <g>
        <path d={`M${sx} ${sy} Q${mx} ${my} ${ex} ${ey}`} stroke={INK} strokeWidth={11} fill="none" strokeLinecap="round" />
        <path d={`M${sx} ${sy} Q${mx} ${my} ${ex} ${ey}`} stroke={look.tunic} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.0} />
        <circle cx={ex} cy={ey} r={13} fill={INK} />
        {look.staff && side === 1 && <path d={`M${ex} ${ey - 70} L${ex + 6} ${ey + 210}`} stroke="#6e4424" strokeWidth={12} strokeLinecap="round" />}
      </g>
    );
  };
  const mouthY = 182;
  const mouth = () => {
    if (expr === 'sleep') return <ellipse cx={150} cy={mouthY} rx={8} ry={6} fill={INK} />;
    if (expr === 'wow') return <ellipse cx={150} cy={mouthY + 2} rx={16} ry={20} fill={INK} />;
    if (talking) {
      const h = 6 + 16 * Math.abs(Math.sin((f + seed) * 0.85)) * (0.6 + 0.4 * Math.abs(Math.sin(f * 0.23)));
      return <g><ellipse cx={150} cy={mouthY} rx={20} ry={h} fill={INK} /><ellipse cx={150} cy={mouthY + h * 0.45} rx={11} ry={Math.max(0, h * 0.35)} fill="#d6505a" /></g>;
    }
    if (expr === 'skeptic') return <path d={`M128 ${mouthY + 4} L174 ${mouthY - 4}`} stroke={INK} strokeWidth={8} strokeLinecap="round" />;
    const w = expr === 'joy' ? 34 : 26;
    return <path d={`M${150 - w} ${mouthY - 8} Q150 ${mouthY + (expr === 'joy' ? 30 : 20)} ${150 + w} ${mouthY - 8}`} stroke={INK} strokeWidth={8} fill={expr === 'joy' ? INK : 'none'} strokeLinecap="round" />;
  };
  const eyes = () => {
    if (expr === 'sleep' || expr === 'joy') return [112, 188].map((ex) => <path key={ex} d={`M${ex - 16} 138 Q${ex} ${expr === 'joy' ? 120 : 152} ${ex + 16} 138`} stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />);
    const big = expr === 'wow' ? 1.3 : 1;
    return [112, 188].map((ex) => <ellipse key={ex} cx={ex} cy={136} rx={10 * big} ry={blink ? 2 : 14 * big} fill={INK} />);
  };
  const brows = look.brows ?? look.hair ?? look.beard ?? INK;
  return (
    <svg width={300 * scale} height={520 * scale} viewBox="0 0 300 520" style={{
      position: 'absolute', left: x, top: y + bob * scale, overflow: 'visible',
      transform: `${flip ? 'scaleX(-1)' : ''}`,
    }}>
      {/* angel wings behind everything */}
      {look.wings && [1, -1].map((s) => (
        <g key={s} transform={`translate(150 300) scale(${s} 1) rotate(${-8 + Math.sin(f / 5) * 9}) translate(-150 -300)`}>
          <path d="M150 270 C60 170 -30 210 10 330 C40 320 60 340 70 380 C100 350 130 330 150 320 Z" fill="#fbf8f0" stroke={INK} strokeWidth={6} />
          <path d="M40 300 C70 300 100 300 135 300 M55 345 C85 335 110 325 140 315" stroke="#d9d2c0" strokeWidth={5} fill="none" />
        </g>
      ))}
      {/* legs */}
      {!look.dress && <g stroke={INK} strokeWidth={11} strokeLinecap="round"><path d="M128 380 L122 470" /><path d="M172 380 L178 470" /></g>}
      {!look.dress && <g fill={INK}><ellipse cx={112} cy={474} rx={22} ry={11} /><ellipse cx={188} cy={474} rx={22} ry={11} /></g>}
      {/* body */}
      <path d={look.dress ? 'M108 226 L192 226 L226 462 Q150 478 74 462 Z' : 'M106 226 L194 226 L214 392 Q150 404 86 392 Z'} fill={look.dress ?? look.tunic} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {look.dress && <ellipse cx={150} cy={470} rx={40} ry={8} fill={INK} />}
      {look.toga && <path d="M108 228 L148 228 L212 372 L186 386 Z" fill={look.toga} stroke={INK} strokeWidth={5} strokeLinejoin="round" />}
      {look.hoodie && <><path d="M120 300 L180 300 L184 340 L116 340 Z" fill="rgba(0,0,0,0.18)" stroke={INK} strokeWidth={4} /><path d="M138 232 L134 280 M162 232 L166 280" stroke="#f2efe6" strokeWidth={5} strokeLinecap="round" /></>}
      {baby && (
        <g>
          <ellipse cx={150} cy={300} rx={74} ry={40} fill="#f6eedb" stroke={INK} strokeWidth={6} />
          <path d="M100 300 Q150 330 205 296" stroke="#d9cbb0" strokeWidth={5} fill="none" />
          <circle cx={98} cy={290} r={30} fill={look.skin} stroke={INK} strokeWidth={5} />
          <path d="M84 288 Q90 294 96 288 M102 288 Q108 294 114 288" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>
      )}
      {/* arms */}
      {arm(108, 252, la, ll, -1)}
      {arm(192, 252, ra, rl, 1)}
      {/* head */}
      <g transform={`rotate(${tilt + sway * 1.5} 150 210)`}>
        {look.hoodie && <path d="M44 150 Q40 250 150 262 Q260 250 256 150 Z" fill={look.tunic} stroke={INK} strokeWidth={6} />}
        {look.longHair && <path d="M48 110 Q40 250 70 280 L230 280 Q260 250 252 110 Z" fill={look.longHair} stroke={INK} strokeWidth={6} />}
        {look.headcloth && <path d="M36 250 L36 128 A114 114 0 0 1 264 128 L264 250 Z" fill={look.headcloth} stroke={INK} strokeWidth={6} />}
        <circle cx={150} cy={140} r={100} fill={look.skin} stroke={INK} strokeWidth={7} />
        <ellipse cx={92} cy={170} rx={16} ry={10} fill="#e86a6a" opacity={0.25} />
        <ellipse cx={208} cy={170} rx={16} ry={10} fill="#e86a6a" opacity={0.25} />
        {look.beard && (look.shortBeard
          ? <path d="M58 160 Q66 236 150 240 Q234 236 242 160 Q222 200 150 204 Q78 200 58 160 Z" fill={look.beard} stroke={INK} strokeWidth={6} />
          : <path d="M52 150 Q58 268 150 276 Q242 268 248 150 Q222 206 150 206 Q78 206 52 150 Z" fill={look.beard} stroke={INK} strokeWidth={6} />)}
        {look.hair && !look.headcloth && <path d="M50 132 A100 100 0 0 1 250 132 Q226 74 186 86 Q150 64 112 86 Q72 76 50 132 Z" fill={look.hair} stroke={INK} strokeWidth={6} />}
        {look.headcloth && <path d="M44 96 Q150 30 256 96" stroke={look.band ?? '#8a3a2a'} strokeWidth={14} fill="none" />}
        {eyes()}
        {expr !== 'sleep' && <g stroke={brows} strokeWidth={8} strokeLinecap="round">
          <path d={expr === 'skeptic' ? 'M92 100 L130 112' : 'M94 108 L128 104'} />
          <path d={expr === 'skeptic' ? 'M170 96 L206 84' : 'M172 104 L206 108'} />
        </g>}
        {mouth()}
        {look.crown && (
          <g>
            <path d="M88 52 L88 4 L114 30 L150 -8 L186 30 L212 4 L212 52 Z" fill="#f2c03c" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
            {[88, 150, 212].map((cx, i) => <circle key={i} cx={cx} cy={i === 1 ? -8 : 4} r={9} fill="#d63a30" stroke={INK} strokeWidth={4} />)}
          </g>
        )}
      </g>
    </svg>
  );
};

// palette, matching the 3D cast file
export const CAST: Record<string, Look> = {
  sam: {tunic: '#2f8f8a', skin: '#8a5a3c', hair: '#1e1714', hoodie: true},
  tumi: {tunic: '#e07a2e', skin: '#6e4630', hair: '#140f0d'},
  abraham: {tunic: '#7a6a9c', toga: '#c9a46a', skin: '#c99067', beard: '#f4f1ea', brows: '#f4f1ea', headcloth: '#efe3c8', band: '#5a6a3a', staff: true},
  david: {tunic: '#3f6aa0', toga: '#b8322f', skin: '#c08a5e', hair: '#b5602c', beard: '#b5602c', shortBeard: true, crown: true},
  joseph: {tunic: '#8a6446', toga: '#5a6a3a', skin: '#a8744e', headcloth: '#e8dcc0', band: '#3f5a6a', beard: '#3a2618', shortBeard: true},
  mary: {tunic: '#3f6aa0', dress: '#3f6aa0', skin: '#a8744e', headcloth: '#f4ecd8', band: '#3f6aa0'},
  angel: {tunic: '#fbf8f0', toga: '#f2c03c', skin: '#c99067', hair: '#e8c070', wings: true},
  jesus: {tunic: '#f1e9d6', toga: '#3f6aa0', skin: '#a8744e', hair: '#3a2618', longHair: '#3a2618', beard: '#3a2618', shortBeard: true},
};
