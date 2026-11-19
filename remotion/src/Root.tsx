import React from 'react';
import {Composition, continueRender, delayRender, staticFile} from 'remotion';
import {Quick} from './Quick';

const fontHandle = delayRender('fonts');
Promise.all([
  new FontFace('Poppins', `url(${staticFile('Poppins-Bold.ttf')})`, {weight: '700'}).load(),
  new FontFace('Lora', `url(${staticFile('Lora-Variable.ttf')})`, {weight: '400 700'}).load(),
]).then((fs) => { fs.forEach((f) => document.fonts.add(f)); continueRender(fontHandle); });

export const Root: React.FC = () => (
  <Composition id="Quick" component={Quick as any} durationInFrames={900} fps={30} width={1080} height={1920}
    defaultProps={{plan: {id: 'x', total: 900, titleEnd: 36, title: {lines: []}, segs: [], cuts: [], items: [], cues: [], keywords: [], audio: '', format: 'A'}}}
    calculateMetadata={({props}: any) => ({durationInFrames: props.plan.total})} />
);
