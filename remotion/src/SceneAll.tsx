import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {SCENES} from './Scenes';
import {SCENES3} from './Scenes3';

// renders any library scene by name: the 2D set (Scenes.tsx) or the 3D-look set (Scenes3.tsx)
export const SceneAll: React.FC<{name: string}> = ({name}) => {
  const f = useCurrentFrame();
  const sc = (SCENES3 as any)[name] ?? SCENES[name];
  return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>{sc ? sc.render(f) : null}</AbsoluteFill>;
};
